"""Natural Earth 110m land -> 360x180 位掩码 -> base64,并输出 ASCII 目检图"""
import json, base64
from PIL import Image, ImageDraw

W, H = 360, 180
img = Image.new("1", (W, H), 0)
draw = ImageDraw.Draw(img)

def to_px(lon, lat):
    return ((lon + 180.0) / 360.0 * W, (90.0 - lat) / 180.0 * H)

gj = json.load(open("ne_110m_land.geojson"))
for feat in gj["features"]:
    geom = feat["geometry"]
    polys = [geom["coordinates"]] if geom["type"] == "Polygon" else geom["coordinates"]
    for poly in polys:
        draw.polygon([to_px(x, y) for x, y in poly[0]], fill=1)   # 外环
        for hole in poly[1:]:
            draw.polygon([to_px(x, y) for x, y in hole], fill=0)  # 内环挖洞

px = img.load()
land = sum(px[c, r] for r in range(H) for c in range(W))
print(f"land cells: {land}/{W*H} = {land/(W*H)*100:.1f}%")

# ASCII 目检:每 6x6 格取样一格
for r in range(0, H, 6):
    print("".join("#" if px[c, r] else "." for c in range(0, W, 3)))

# 打包:row-major,每字节 8 格,MSB 在前
bits = bytearray()
acc = n = 0
for r in range(H):
    for c in range(W):
        acc = (acc << 1) | px[c, r]
        n += 1
        if n == 8:
            bits.append(acc); acc = n = 0
b64 = base64.b64encode(bytes(bits)).decode()
print(f"\npacked {len(bits)} bytes -> base64 {len(b64)} chars")
open("mask.b64", "w").write(b64)

# 城市落点检查(demo 里的 8 座城)
cities = {"旧金山": (37.7749, -122.4194), "纽约": (40.7128, -74.006), "柏林": (52.52, 13.405),
          "东京": (35.6762, 139.6503), "上海": (31.2304, 121.4737), "新加坡": (1.3521, 103.8198),
          "圣保罗": (-23.5505, -46.6333), "悉尼": (-33.8688, 151.2093)}
for name, (lat, lon) in cities.items():
    c = min(W - 1, int((lon + 180) / 360 * W)); r = min(H - 1, int((90 - lat) / 180 * H))
    print(name, "陆地" if px[c, r] else "海上(掩码太粗)")
