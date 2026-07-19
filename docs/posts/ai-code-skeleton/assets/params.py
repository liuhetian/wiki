"""各 kind 的 params 类型 —— 与 web/src/state/types.ts 逐字段对齐（权威源在前端）。

⚠️ 命名故意「混搭」：anchor 系用 snake_case（char_width…，与线上 template_config 一致），
其余用 camelCase（depthThreshold / bgId / origUrl…）。这不是笔误 —— Pydantic 字段名
必须与 TS 类型完全一致，openapi-typescript 生成出来的 TS 才能和 types.ts 无缝互换。

判别方式：params 本身不带 kind 字段（前端如此），靠外层 Resource.kind 判别。
反序列化 params_json 时必须用 KIND_TO_PARAMS[kind].model_validate(...)，
不要指望 Union 自动挑对分支（DualParams 是 DepthParams 的子集，会误判）。
"""
from typing import Literal, Union

from pydantic import BaseModel, ConfigDict

# ---- 基础枚举（与 types.ts 的 Kind / Group 一致）----

Kind = Literal[
    "dual", "depth", "expand", "drag",   # 模板：视频类
    "item", "item-bg",                    # 道具 / 道具背景
    "gift-bg",                            # 礼包背景（全站通用）
    "icon",                               # 礼包入口
]

Group = Literal["templates", "items", "common", "backgrounds"]

# ---- 角色/视频锚定参数（单位 = 卡宽百分比，卡宽 375px）----


class AnchorParams(BaseModel):
    """对应线上 template_config 字段；char_shift_* 正数 = 向外破框。"""

    char_width: float
    char_height: float
    char_shift_up: float
    char_shift_right: float
    title_max_width: float
    desc_max_width: float


class BgKey(BaseModel):
    """expand 色键抠底参数：RGB 键色 + 双容差（t1 全透明阈 / t2 过渡阈）。"""

    r: int
    g: int
    b: int
    t1: int
    t2: int


# ---- 8 种 kind 各自的 params ----


class DualParams(AnchorParams):
    """基础双通道（vstack RGB+alpha）：只有锚定参数。"""


class DepthParams(AnchorParams):
    """深度通道分层（三通道 vstack）：锚定 + 深度切割面。"""

    depthThreshold: float
    depthSoft: float
    depthNear: Literal["bright", "dark"]


class ExpandParams(BaseModel):
    """全屏扩展 + 色键：无锚定（铺满卡片），前端 canvas 逐帧抠底。"""

    opaque: bool
    bgKey: BgKey


class DragParams(AnchorParams):
    """拖拽交互：锚定 + 静态帧 + 拖拽提示文案。"""

    idleFrame: str
    dragHint: str
    interactMode: Literal["drag"]


class ItemParams(BaseModel):
    """道具：只记关联的背景资源 id（item-bg 的 Resource.id）。"""

    bgId: str


class ItemBgParams(BaseModel):
    """道具背景：无参数（TS 侧是 Record<string, never>，故禁止额外字段）。"""

    model_config = ConfigDict(extra="forbid")


class IconParams(BaseModel):
    """礼包入口 icon：无参数。"""

    model_config = ConfigDict(extra="forbid")


class GiftBgParams(BaseModel):
    """礼包背景：origUrl 记录原时间戳 URL（设为正式版时 url 会被换成 OFFICIAL_BG_URL）。"""

    origUrl: str


# ---- 联合类型 & kind → 模型映射 ----

AnyParams = Union[
    DepthParams, DragParams, DualParams,   # 注意顺序：子集类型（DualParams）放后面
    ExpandParams, ItemParams, GiftBgParams,
    ItemBgParams, IconParams,
]

# 反序列化 params_json 的唯一正确入口（见模块 docstring）
KIND_TO_PARAMS: dict[str, type[BaseModel]] = {
    "dual": DualParams,
    "depth": DepthParams,
    "expand": ExpandParams,
    "drag": DragParams,
    "item": ItemParams,
    "item-bg": ItemBgParams,
    "icon": IconParams,
    "gift-bg": GiftBgParams,
}

# ---- 常量（与 types.ts 完全一致）----

# 单版本 kind：保存 = 覆盖当前 version，不产生 vN+1；只有视频模板留版本序列
SINGLE_VERSION_KINDS: tuple[str, ...] = ("gift-bg", "item", "item-bg", "icon")

# gift-bg「正式启用」判定：某版本 url === 该常量 → 正式（后端动作 = OSS copy → background.png）
OFFICIAL_BG_URL = "https://aics-imgs.happyfactory.com/custom-iap/x3/background.png"

DEFAULT_ANCHOR = AnchorParams(
    char_width=80, char_height=106.67,
    char_shift_up=26.67, char_shift_right=4,
    title_max_width=40, desc_max_width=30,
)


def is_single_version(kind: str) -> bool:
    """kind 是否单版本（对齐 types.ts isSingleVersion）。"""
    # TODO: return kind in SINGLE_VERSION_KINDS
    ...


def default_params_for(kind: str) -> BaseModel:
    """新建资源时的默认 params（对齐 types.ts defaultParamsFor）。
    dual → DEFAULT_ANCHOR；depth → +threshold 0.55/soft 0.10/near bright；
    expand → opaque + 灰键 (123,123,123,30,58)；drag → +空 idleFrame/'拖到这里'；
    item → 空 bgId；其余空对象。"""
    # TODO: 按 kind 分支返回对应模型实例
    ...
