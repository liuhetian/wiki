"""两个 demo 脚本共用的几样：读写视频、读首帧素材、和模板做差判遮挡、画遮罩和标签。"""
import json
import subprocess
from pathlib import Path

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont

FONT = "/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc"
PURPLE = np.array([170, 60, 230], np.float32)


def read_frames(path):
    cap = cv2.VideoCapture(str(path))
    fps, frames = cap.get(cv2.CAP_PROP_FPS), []
    while True:
        ok, f = cap.read()
        if not ok:
            return frames, fps
        frames.append(cv2.cvtColor(f, cv2.COLOR_BGR2RGB))


def write_video(path, frames, fps):
    h, w = frames[0].shape[:2]
    p = subprocess.Popen(["ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgb24",
                          "-s", f"{w}x{h}", "-r", f"{fps}", "-i", "-", "-an", "-c:v", "libx264",
                          "-pix_fmt", "yuv420p", "-crf", "24", "-movflags", "+faststart", str(path)],
                         stdin=subprocess.PIPE)
    for f in frames:
        p.stdin.write(np.ascontiguousarray(f, np.uint8).tobytes())
    p.stdin.close()
    p.wait()


def load_assets(work):
    """首帧素材：挡板模板（RGB）、挡板区域、文字层（RGBA，0–1）、挡板矩形。"""
    work = Path(work)
    tpl = np.array(Image.open(work / "panel-template.png").convert("RGBA"), np.float32)
    text = np.array(Image.open(work / "text-layer.png").convert("RGBA"), np.float32) / 255
    panel = json.load(open(work / "panel.json"))["panel"]
    return tpl[..., :3], tpl[..., 3] > 127, text, panel


def luma(c):
    return c @ np.array([0.299, 0.587, 0.114], np.float32) + 1e-3


def occlusion_mask(frame, tpl, region, ang_thr=14.0, dark=0.3, shift=2, min_area=150):
    """挡板上哪些像素被别的东西压住了：逐像素和模板比颜色方向，不比亮度。

    - 颜色方向差 > ang_thr 度，且不比模板亮 → 遮挡。影子只是同色变暗，方向不变，不算；高光、特效更亮，也不算
    - 亮度不到模板的 dark 倍 → 遮挡（深色东西颜色方向分不开）
    - 视频模型每帧会把挡板重画一遍、边缘挪 1–2 px：模板在 ±shift px 内找最像的那个位置再比
    """
    c = frame.astype(np.float32)
    cn = c / (np.linalg.norm(c, axis=2, keepdims=True) + 1e-3)
    best_ang = np.full(region.shape, 180, np.float32)
    best_ratio = np.ones(region.shape, np.float32)
    for dy in range(-shift, shift + 1):
        for dx in range(-shift, shift + 1):
            t = np.roll(tpl, (dy, dx), axis=(0, 1))
            tn = t / (np.linalg.norm(t, axis=2, keepdims=True) + 1e-3)
            ang = np.degrees(np.arccos(np.clip((cn * tn).sum(2), -1, 1)))
            better = ang < best_ang
            best_ang[better] = ang[better]
            best_ratio[better] = (luma(c) / luma(t))[better]
    occ = region & (((best_ang > ang_thr) & (best_ratio < 1.08)) | (best_ratio < dark))
    occ = occ.astype(np.uint8)
    occ = cv2.morphologyEx(occ, cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5)))
    occ = cv2.morphologyEx(occ, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))
    n, lab, stats, _ = cv2.connectedComponentsWithStats(occ, connectivity=8)
    keep = np.zeros(n, bool)
    keep[1:] = stats[1:, cv2.CC_STAT_AREA] >= min_area
    return keep[lab] & region


def overlay(frame, mask, alpha=0.65):
    out = frame.astype(np.float32)
    out[mask] = out[mask] * (1 - alpha) + PURPLE * alpha
    return out.astype(np.uint8)


def paste_text(frame, text, hide=None):
    """把文字层盖到画面上；hide 为真的地方（被压住）不画字。"""
    a = text[..., 3:4]
    if hide is not None:
        a = a * (1 - cv2.GaussianBlur(hide.astype(np.float32), (5, 5), 0))[..., None]
    return (frame * (1 - a) + text[..., :3] * 255 * a).astype(np.uint8)


def label(img, s, scale=0.75):
    """缩小后在顶上加一条说明。"""
    h, w = img.shape[:2]
    im = Image.fromarray(img).resize((round(w * scale) // 2 * 2, round(h * scale) // 2 * 2), Image.LANCZOS)
    d = ImageDraw.Draw(im, "RGBA")
    d.rectangle((0, 0, im.width, 34), fill=(0, 0, 0, 150))
    d.text((im.width // 2, 17), s, font=ImageFont.truetype(FONT, 20), fill="white", anchor="mm")
    return np.array(im)
