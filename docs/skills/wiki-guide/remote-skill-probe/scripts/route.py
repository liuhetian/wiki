"""计算两个虚构驿站之间的直线距离。

数据在 ../assets/stations.csv，按本文件所在位置找，所以运行前要保持
scripts/ 与 assets/ 的相对位置不变。只用标准库。

用法：python3 scripts/route.py 雾港 石钟
"""

import csv
import hashlib
import math
import sys
from pathlib import Path

CSV_PATH = Path(__file__).resolve().parent.parent / "assets" / "stations.csv"


def load_stations() -> dict[str, tuple[float, float]]:
    with CSV_PATH.open(encoding="utf-8", newline="") as fh:
        return {row["name"]: (float(row["x_km"]), float(row["y_km"])) for row in csv.DictReader(fh)}


def main() -> int:
    if len(sys.argv) != 3:
        print(__doc__.strip(), file=sys.stderr)
        return 2
    stations = load_stations()
    a, b = sys.argv[1], sys.argv[2]
    for name in (a, b):
        if name not in stations:
            print(f"没有叫「{name}」的驿站，可选：{'、'.join(stations)}", file=sys.stderr)
            return 1
    (x1, y1), (x2, y2) = stations[a], stations[b]
    distance = math.hypot(x2 - x1, y2 - y1)
    # 数据指纹：证明结果来自真正读到的 CSV，而不是心算或猜测
    fingerprint = hashlib.sha256(CSV_PATH.read_bytes()).hexdigest()[:12]
    print(f"{a} → {b}：{distance:.2f} km")
    print(f"数据指纹：{fingerprint}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
