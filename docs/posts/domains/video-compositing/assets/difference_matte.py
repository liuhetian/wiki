# /// script
# requires-python = ">=3.10"
# dependencies = ["opencv-python-headless==5.0.0.93", "numpy==2.2.6", "pillow==12.2.0"]
# ///
"""差分抠像 demo：角色的手压到挡板上，逐帧算挡板哪里被压住，字只画在没被压住的地方。

挡板是我们画的（make_first_frame.py），每帧都拿它当模板比，判法见 vfx_common.occlusion_mask。
同一帧再按黄色抠一次做对照：挡板有条纹，按颜色抠会把条纹全当成遮挡。

用法：uv run difference_matte.py <视频.mp4> <首帧素材目录> <输出目录>
输出：demo-matte.mp4（原片 | 差分遮罩 | 贴字，三格并排）、matte-chroma.png、matte-diff.png（同一帧两种抠法）、
      stacked-matte.png（画面和遮罩上下拼：网页不支持透明视频时这样交付）
"""
import sys
import time
from pathlib import Path

import cv2
import numpy as np
from PIL import Image

from vfx_common import label, load_assets, occlusion_mask, overlay, paste_text, read_frames, write_video

clip, work, out = Path(sys.argv[1]), Path(sys.argv[2]), Path(sys.argv[3])
out.mkdir(parents=True, exist_ok=True)
t0 = time.time()
frames, fps = read_frames(clip)
tpl, region, text, panel = load_assets(work)
inner = cv2.erode(region.astype(np.uint8), np.ones((5, 5), np.uint8)).astype(bool)   # 挡板外沿 2 px 不判

mattes = [occlusion_mask(f, tpl, inner) for f in frames]
ratio = np.array([m.sum() / inner.sum() for m in mattes])

panes = [np.hstack([label(f, "原片"), label(overlay(f, m), "差分遮罩"), label(paste_text(f, text, m), "贴字：被压住的地方不画")])
         for f, m in zip(frames, mattes)]
write_video(out / "demo-matte.mp4", panes, fps)

# 压得最多的那一帧：按黄色抠 vs 和模板做差，只截挡板附近
k = int(ratio.argmax())
f = frames[k]
hsv = cv2.cvtColor(f, cv2.COLOR_RGB2HSV)
yellow = (hsv[..., 0] >= 20) & (hsv[..., 0] <= 28) & (hsv[..., 1] > 120)
chroma = inner & ~yellow
y0 = panel[1] - 110
Image.fromarray(label(overlay(f, chroma)[y0:], "按黄色抠：条纹也算成遮挡", 1)).save(out / "matte-chroma.png")
Image.fromarray(label(overlay(f, mattes[k])[y0:], "和模板做差：只有手", 1)).save(out / "matte-diff.png")

# 画面上、遮罩下拼成一张：普通 MP4 也能带遮罩
stacked = np.vstack([f, np.repeat((mattes[k] * 255).astype(np.uint8)[..., None], 3, 2)])
Image.fromarray(stacked).resize((240, 864), Image.LANCZOS).save(out / "stacked-matte.png")

head = ratio[: int(fps * 0.4)]
print(f"{len(frames)} 帧，{fps:.0f} fps，{time.time() - t0:.1f} 秒")
print(f"压得最多：第 {k} 帧（{k / fps:.2f} 秒），挡板 {ratio[k]:.1%} 被判成遮挡；按黄色抠是 {chroma.sum() / inner.sum():.1%}")
print(f"开头 0.4 秒（手还没碰到）：遮罩最多占挡板 {head.max():.2%}")
