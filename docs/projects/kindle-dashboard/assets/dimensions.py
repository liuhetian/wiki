"""额度维度声明表 —— 限额类数据的唯一配置源头。

# [新: 2026-07-26] 这张表以前散在两处：sources/push.py 的 metric_map/note_map
# (上报 key → 内部 metric 名) 和 snapshot.py 的 _RING_SPECS (顺序/标题/已用还是余额)。
# 加、删、换一个维度要同时改两个文件，漏一处的后果很隐蔽：上报侧删了、
# 展示侧没删 → 那个环会挂着 store 里几天前的历史值，永不更新也不报错。
# 合成一张表后：换顺序 = 挪一行，去掉一个维度 = 删一行，加维度 = 加一行。

⚠️ 列表顺序 = 环的 外圈 → 内圈。排序规则见 README 决策日志：
重置周期短(变化快)的放外圈——外圈周长大，同样的变化弧长最长、最醒目。

⚠️ 最多三环。半径是 `148 - i*44`(viewBox 坐标)，第四环只剩 16、几乎是个点；
灰度也只有三档 G_RING，第四环会 `i % 3` 撞回最外圈的黑色。
"""

from dataclasses import dataclass
from datetime import timedelta
from typing import Literal


@dataclass(frozen=True)
class Dimension:
    """一个额度维度：从上报 key 一路到环上那一圈。"""

    report_key: str  # 上报方在 limits[].key 里写的名字，见 docs/report-api.md
    metric: str  # 内部 metric 名，SampleStore 的主键之一，全局唯一
    title: str  # 环图例上的展示名
    show: Literal["used", "remaining"] = "used"  # 图例大数字显示已用还是余额
    # 差分弧(斜纹那截)的口径。窗口越长，差分也该跟着放大：
    # "rolling" = 最近 settings.delta_window_min 分钟，适合 5 小时这种短窗口；
    # "today"   = 今天 00:00 起的增量，适合周限额——拿 15 分钟去切一个 7 天的
    #             额度看不出任何东西(这跟两条 tier-bar 的取舍是同一个道理)。
    delta_mode: Literal["rolling", "today"] = "rolling"
    # 自己的 resets_at 缺失时，借哪个维度的(填对方的 report_key)。
    # Fable 和周限额同时重置：正常情况 CC 的输出里两行各带一份重置时刻，
    # 各用各的；只有上报缺了 Fable 那行的 resets 段时才借用，不必要求
    # 上报方一定报两遍。重置文案与时间线都由快照层从 resets_at 现算。
    resets_from: str | None = None
    # 额度窗口时长，用来在环上画"时间走到哪儿了"那条线：窗口起点 = resets_at - window。
    # [新: 2026-07-26] 写死而不是让上报方报：这是产品常量(5 小时 / 7 天)，
    # 而且 CC 的用量输出里根本没有窗口长度这个信息，只有 session/week 这种名字。
    window: timedelta | None = None


_5H = timedelta(hours=5)
_WEEK = timedelta(days=7)

# 顺序即外圈→内圈
CLAUDE_DIMENSIONS: list[Dimension] = [
    Dimension("session_5h", "claude_session_pct", "时段限额 (5h)", window=_5H),
    Dimension("week_fable", "claude_fable_pct", "Fable 模型",
              resets_from="week", window=_WEEK, delta_mode="today"),
    Dimension("week", "claude_week_pct", "周限额", window=_WEEK, delta_mode="today"),
]

CODEX_DIMENSIONS: list[Dimension] = [
    Dimension("session_5h", "codex_session_pct", "时段限额 (5h)", window=_5H),
    # Codex 那边关心的是"还剩多少"，环本身仍画已用，只有图例大数字显示余额
    Dimension("week", "codex_week_pct", "周余额",
              show="remaining", window=_WEEK, delta_mode="today"),
]

# 看板内部源标识 → 该源的维度表
SOURCE_DIMENSIONS: dict[str, list[Dimension]] = {
    "claude_limits": CLAUDE_DIMENSIONS,
    "codex_limits": CODEX_DIMENSIONS,
}


def metric_map(dims: list[Dimension]) -> dict[str, str]:
    """上报 key → 内部 metric 名，给 PushSource 用。"""
    return {d.report_key: d.metric for d in dims}


def reset_metric_for(dim: Dimension, dims: list[Dimension]) -> str:
    """这个维度的重置时刻从哪个 metric 上读(可能借用别的维度的)。

    只在自己缺 resets_at 时才需要借用，借用的判断在快照层做——
    这里只负责"借谁"：resets_from 指向的维度被删了就退回自己。
    """
    if dim.resets_from is None:
        return dim.metric
    source = next((d for d in dims if d.report_key == dim.resets_from), None)
    return source.metric if source else dim.metric
