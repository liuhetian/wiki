"""Snapshot 契约模型 —— 前后端唯一契约源头。

骨架约定：这一层完整实现、不留骨架。由它生成 openapi.json，
Web 端(test/components.js)与 Kindle 渲染端(app/render/kindle.py)都对齐到这里。

⚠️ 字段名刻意与 test/mock.js 完全一致(value/delta/goals/delta_label/
rings/pct/note/show/layout...)——这不是随意起的名：前端组件直接按这些
字段取值，改名必须两端同步。
"""

from typing import Literal

from pydantic import BaseModel


class SourceStatus(BaseModel):
    """单个数据源的健康状态，渲染为看板底部的状态条。"""

    key: str
    label: str
    status: Literal["ok", "stale", "error"]
    updated_at: str  # "HH:MM"，展示用；stale 时前端会标"过期"


class TierBarMetric(BaseModel):
    """多档位进度条数据。value/delta/goals 单位是 token 个数(不是亿)。"""

    value: float
    delta: float  # 最近 delta_window 窗口内的增量，渲染为条末端的差分段
    goals: list[float]  # 递增档位；当前档 = 已达成个数，上限 = 下一个未达成档
    delta_label: str  # 如 "最近15分钟 +0.06亿"，由后端统一格式化


class Ring(BaseModel):
    """叠环中的一环。pct/delta 都是 0~100 的百分数。"""

    name: str
    pct: float  # 已用比例；环的填充始终画"已用"
    delta: float  # 差分弧(斜纹那截)的百分点，口径见 Dimension.delta_mode
    # 差分口径的说明文字，如 "最近15分钟 +3%" / "今日 +2%"。
    # 由后端统一格式化(同 TierBarMetric.delta_label)：口径按维度不同，
    # 让两个渲染端各自拼这句话就一定会拼错。
    delta_label: str = ""
    note: str  # 重置说明，如 "21:00 重置"
    # "remaining"：图例大数字显示剩余(如 Codex 周余额)；环本身仍表示已用
    show: Literal["used", "remaining"] = "used"
    # 这个额度窗口"时间走到哪儿了"(0~100)，渲染成环上一条细线：
    # 线在填充前面 = 用得比时间慢(有富余)，被填充盖过 = 超前消耗。
    # 缺 resets_at 或窗口时长时为 None(不画线)。
    # ⚠️ 它每分钟都在变，**不进推送去重的数据指纹**(见 snapshot.data_digest)，
    # 否则墨水屏会为了一条走动的线每分钟闪一次。
    time_pct: float | None = None


class RingsMetric(BaseModel):
    """叠环数据。约定：rings 按 外圈→内圈 排列，重置周期短(变化快)的放外圈
    ——外圈周长大，同样的变化弧长最长、最醒目(秒针在最外)。"""

    rings: list[Ring]


class TierBarItem(BaseModel):
    """tier-bars 合卡里的一条：引用 metrics 里的 key + 显示标题。"""

    metric: str
    title: str


class LayoutItem(BaseModel):
    """布局即配置：渲染端按 type 查组件注册表，语义与 test/components.js 一致。"""

    type: Literal["tier-bars", "rings", "sources"]
    metric: str | None = None  # rings 用：指向 metrics 的 key
    title: str | None = None
    items: list[TierBarItem] | None = None  # tier-bars 用


Metric = TierBarMetric | RingsMetric


class Snapshot(BaseModel):
    """GET /api/snapshot 的返回。两种渲染端只消费这一份，不各自拉数据源。"""

    generated_at: str  # "YYYY-MM-DD HH:MM"
    sources: list[SourceStatus]
    metrics: dict[str, Metric]
    layout: list[LayoutItem]


# ---------- 上报接口契约 [新: 2026-07-26] ----------
class LimitReport(BaseModel):
    """单个额度维度的一次上报。

    ⚠️ limits 刻意做成"列表 + key"而不是固定字段：Codex 报 2 个维度、
    Claude Code 报 3 个，以后加维度不用动接口，上报端也不需要知道
    看板内部的 metric 命名(映射表在 sources/push.py)。
    """

    key: str  # session_5h / week / week_fable ...
    available: bool = True  # False = 这个维度当前没数据(如时段还没开始用)
    used_percent: float | None = None  # 已用百分比 0~100；available=False 时为 None
    resets_at: str | None = None  # ISO 时刻，展示文案由后端格式化


class ReportEnvelope(BaseModel):
    """POST /api/report 的请求体。"""

    source: str  # claude_code / codex，决定映射到哪套 metric
    host: str  # 上报机标识，多台机器时用于分辨谁掉线了
    # 上报机自己的时钟，仅随 payload 原样留档、当前不参与任何逻辑。
    # 数据时刻一律用 Pi 收到的时刻(received_at)——否则某台机器时钟偏了
    # 就会永远压住其他机器
    reported_at: str | None = None
    limits: list[LimitReport]
    meta: dict = {}  # plan_type/credits 之类，原样留档，暂不渲染
