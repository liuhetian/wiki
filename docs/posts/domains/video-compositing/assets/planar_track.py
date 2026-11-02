# /// script
# requires-python = ">=3.10"
# dependencies = ["opencv-python-headless==5.0.0.93", "numpy==2.2.6", "pillow==12.2.0"]
# ///
"""平面追踪 demo：挡板被推歪，逐帧求挡板的位姿，字跟着挡板走；被手压住的地方照样不画字。

- 模板 = 首帧（像素已知），只比挡板那一块（模板蒙版）
- 在梯度幅值图上做 ECC：挡板大块是平涂的颜色，直接比亮度会沿着平坦区域滑，比边缘才稳
- 运动模型用欧氏（旋转 + 平移）：挡板是硬板，不会变形；单应多出的透视自由度在遮挡时会乱飘
- 手压在板上，会把相关系数拉低、把位姿带偏：上一帧判出来的手先从蒙版里去掉；
  对上以后再判一次这一帧的手、去掉、精修一遍
- 初值试三个：上一帧、按前两帧匀速外推、首帧原位，取相关系数最高的；1/4 → 1/2 → 原尺寸金字塔
- 精修后相关系数 < 0.75 算跟丢，沿用上一帧

用法：uv run planar_track.py <视频.mp4> <首帧素材目录> <输出目录>
输出：track.json（每帧 2×3 矩阵、转角、相关系数）、demo-track.mp4（不追踪 | 追踪，两格并排）
"""
import json
import sys
import time
from pathlib import Path

import cv2
import numpy as np
from PIL import Image

from vfx_common import label, load_assets, occlusion_mask, paste_text, read_frames, write_video

CRIT = (cv2.TERM_CRITERIA_EPS | cv2.TERM_CRITERIA_COUNT, 60, 1e-5)
K9 = np.ones((9, 9), np.uint8)


def grad(rgb):
    g = cv2.GaussianBlur(cv2.cvtColor(rgb, cv2.COLOR_RGB2GRAY).astype(np.float32), (0, 0), 1.5)
    return cv2.magnitude(cv2.Sobel(g, cv2.CV_32F, 1, 0), cv2.Sobel(g, cv2.CV_32F, 0, 1))


def ecc(tg, fg, mask, w0, levels=(4, 2, 1)):
    """金字塔 ECC，返回（相关系数，模板坐标 → 这一帧的 2×3 矩阵）；不收敛返回 -1。"""
    w = w0.copy()
    for s in levels:
        ws = w.copy()
        ws[:, 2] /= s
        size = (tg.shape[1] // s, tg.shape[0] // s)
        try:
            cc, ws = cv2.findTransformECCWithMask(cv2.resize(tg, size), cv2.resize(fg, size),
                                                  cv2.resize(mask, size, interpolation=cv2.INTER_NEAREST),
                                                  np.ones(size[::-1], np.uint8), ws, cv2.MOTION_EUCLIDEAN, CRIT, 3)
        except cv2.error:
            return -1.0, w0
        w = ws.copy()
        w[:, 2] *= s
    return cc, w


def h3(w):
    return np.vstack([w, [0, 0, 1]])


clip, work, out = Path(sys.argv[1]), Path(sys.argv[2]), Path(sys.argv[3])
out.mkdir(parents=True, exist_ok=True)
t0 = time.time()
frames, fps = read_frames(clip)
tpl, region, text, panel = load_assets(work)
first = np.array(Image.open(work / "first-frame.png").convert("RGB"))
tg = grad(first)
h, w_ = region.shape
mask0 = cv2.erode(region.astype(np.uint8), np.ones((7, 7), np.uint8))
inner = cv2.erode(region.astype(np.uint8), np.ones((5, 5), np.uint8)).astype(bool)
x0, y0, x1, y1 = panel
corners = np.float32([[x0, y0], [x1, y0], [x1, y1], [x0, y1]])
eye = np.eye(2, 3, dtype=np.float32)

track, poses, lost = [], [eye, eye], 0
occ_t = np.zeros((h, w_), bool)                       # 上一帧被压住的地方（模板坐标）
fixed_panes, tracked_panes = [], []
for i, f in enumerate(frames):
    fg = grad(f)
    prev, prev2 = poses[-1], poses[-2]
    guess = (h3(prev) @ np.linalg.inv(h3(prev2)) @ h3(prev))[:2].astype(np.float32)
    m = mask0 & ~cv2.dilate(occ_t.astype(np.uint8), K9)
    cc, w = max((ecc(tg, fg, m, g) for g in (prev, guess, eye)), key=lambda r: r[0])
    back = cv2.warpAffine(f, w, (w_, h), flags=cv2.INTER_LINEAR | cv2.WARP_INVERSE_MAP)
    occ_t = occlusion_mask(back, tpl, inner)
    cc2, w2 = ecc(tg, fg, mask0 & ~cv2.dilate(occ_t.astype(np.uint8), K9), w, levels=(1,))
    if cc2 >= cc:
        cc, w = cc2, w2
    if cc < 0.75:
        lost += 1
        w, occ_t = prev, np.zeros((h, w_), bool)
    poses.append(w)
    angle = float(np.degrees(np.arctan2(w[1, 0], w[0, 0])))
    track.append({"frame": i, "warp": np.round(w, 4).tolist(), "angle": round(angle, 2), "cc": round(float(cc), 4)})

    # 字按位姿搬到画面上；被压住的地方（模板坐标判的）也按位姿搬过来，那里不画字
    occ = cv2.warpAffine(occ_t.astype(np.uint8), w, (w_, h), flags=cv2.INTER_NEAREST).astype(bool)
    tr = paste_text(f, cv2.warpAffine(text, w, (w_, h), flags=cv2.INTER_LINEAR), occ)
    cv2.polylines(tr, [cv2.transform(corners[None], w)[0].astype(np.int32)], True, (40, 220, 90), 2, cv2.LINE_AA)
    fixed_panes.append(label(paste_text(f, text), "不追踪：字钉在原地"))
    tracked_panes.append(label(tr, "平面追踪：字跟着板走"))

write_video(out / "demo-track.mp4", [np.hstack(p) for p in zip(fixed_panes, tracked_panes)], fps)
json.dump({"fps": fps, "panel": panel, "frames": track}, open(out / "track.json", "w"))
angles = np.array([t["angle"] for t in track])
ccs = np.array([t["cc"] for t in track])
print(f"{len(frames)} 帧，{fps:.0f} fps，{time.time() - t0:.1f} 秒；跟丢 {lost} 帧")
print(f"转角范围 {angles.min():.1f}° ~ {angles.max():.1f}°；相关系数最低 {ccs.min():.3f}，中位数 {np.median(ccs):.3f}")
