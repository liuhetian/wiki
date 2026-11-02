# /// script
# requires-python = ">=3.10"
# dependencies = ["numpy==2.2.6", "pillow==12.2.0"]
# ///
"""做首帧：生成的角色图裁成 480×864，下方画一块带斜条纹的黄色挡板。

挡板是我们自己画的，每个像素都已知 —— 后面判遮挡（difference_matte.py）、追位姿（planar_track.py）
都拿它当模板比。斜条纹故意让「按黄色抠」失灵，好和差分对照。

用法：uv run make_first_frame.py <角色图.png> <输出目录>
输出：first-frame.png（喂给视频模型的首尾帧）、panel-template.png（只有挡板，透明底）、
      text-layer.png（要贴的字，和首帧同坐标）、panel.json（挡板矩形）
"""
import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont

W, H = 480, 864
PANEL = (52, 668, 428, 836)            # 挡板矩形 x0, y0, x1, y1
RADIUS = 20
YELLOW, STRIPE, RIM = (250, 204, 40), (238, 150, 28), (150, 84, 20)
FONT = "/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc"

src, out = Path(sys.argv[1]), Path(sys.argv[2])
out.mkdir(parents=True, exist_ok=True)

# 角色图缩放到高 864，居中裁宽 480
img = Image.open(src).convert("RGB")
img = img.resize((round(img.width * H / img.height), H), Image.LANCZOS)
left = (img.width - W) // 2
scene = img.crop((left, 0, left + W, H))

# 挡板：黄底 + 45° 斜条纹 + 深色边，圆角矩形
x0, y0, x1, y1 = PANEL
yy, xx = np.mgrid[0:H, 0:W]
board = np.where(((xx + yy) % 30 < 12)[..., None], STRIPE, YELLOW).astype(np.uint8)
mask = Image.new("L", (W, H), 0)
ImageDraw.Draw(mask).rounded_rectangle(PANEL, RADIUS, fill=255)
rim = Image.new("L", (W, H), 0)
ImageDraw.Draw(rim).rounded_rectangle(PANEL, RADIUS, outline=255, width=5)
board[np.array(rim) > 0] = RIM
template = Image.fromarray(board).convert("RGBA")
template.putalpha(mask)

first = scene.copy()
first.paste(template, (0, 0), template)
first.save(out / "first-frame.png")
template.save(out / "panel-template.png")

# 文字层：深红字 + 白描边，贴在挡板上半部，正好是手会压下来的地方
text = Image.new("RGBA", (W, H), (0, 0, 0, 0))
d = ImageDraw.Draw(text)
cx = (x0 + x1) // 2
d.text((cx, y0 + 52), "限时礼包", font=ImageFont.truetype(FONT, 58), fill=(192, 30, 45),
       anchor="mm", stroke_width=5, stroke_fill="white")
d.text((cx, y0 + 122), "全场五折 · 今天截止", font=ImageFont.truetype(FONT, 28), fill=(192, 30, 45),
       anchor="mm", stroke_width=3, stroke_fill="white")
text.save(out / "text-layer.png")

json.dump({"size": [W, H], "panel": list(PANEL), "radius": RADIUS}, open(out / "panel.json", "w"))
print("saved", *(p.name for p in sorted(out.glob("*"))))
