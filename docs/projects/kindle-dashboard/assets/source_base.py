"""数据源抽象：一个源 = 一次外部拉取，产出若干 metric 的结构化采样。

# [新: 2026-07-26] fetch 只此一条通道。曾经是 fetch()/notes()/resets()/data_at()
# 四个方法平行输出，且 notes 用的键约定(*_reset)和 fetch/resets(metric 名)还不
# 一样——于是需要 note_key/note_map/note_from 一整套胶水，而三份字典在调度层被
# update() 进全局状态、键只增不删，"过期的重置时刻该消失"这类语义根本落不了地
# (时间线会永远停在 100%)。收敛成"每个 metric 一条完整记录"后，调度层按源整体
# 替换，源不再产出的键自然消失；重置文案是展示逻辑，由快照层从 resets_at 现算。
"""

from abc import ABC, abstractmethod
from dataclasses import dataclass
from datetime import datetime
from typing import ClassVar


@dataclass(frozen=True)
class Sample:
    """一个 metric 的一次采样：数值 + (可选的)下次重置时刻。

    resets_at 跟着数值走，不单独开通道：额度百分比和它的重置时刻本来就是
    同一条记录的两个字段。已过重置时刻的采样，数值由源归零、resets_at 保留
    原值(过去时刻)——快照层据此写"已重置 · 待上报"并隐藏时间线。
    """

    value: float
    resets_at: datetime | None = None


@dataclass(frozen=True)
class Reading:
    """一轮 fetch 的完整结果。

    data_at: 这批数据本身的时刻；None = 就是"刚拉到的"，由调用方用当前时刻。
    上报型源必须填：它手里的数据可能是几小时前报上来的(尤其重启后回放的那份)，
    状态条要显示那个时刻，否则屏上写着刚更新过，其实是旧数据。
    """

    samples: dict[str, Sample]
    data_at: datetime | None = None

    def values(self) -> dict[str, float]:
        """{metric: 数值}，给 SampleStore 落盘与源状态指纹用。"""
        return {metric: sample.value for metric, sample in self.samples.items()}


class DataSource(ABC):
    """所有数据源的基类。

    调用方约束：
    - fetch() 由调度器每个采样周期调用一次，多个源之间用 gather 并发；
      单源抛异常只把该源标为 error/stale，绝不阻塞其他源。
    - fetch() 内部必须设超时(建议 <= 30s，小于采样周期)。
    - samples 的 metric 键全局唯一(跨源不得重名)，是 SampleStore 的主键之一。
    - 源只要活着，每周期都要把它持有的全部 metric 重新给一遍——
      store.latest(max_age) 靠这个约定识别"某维度不再被采集"。
    """

    key: ClassVar[str]  # 源标识，进 SourceStatus.key
    label: ClassVar[str]  # 展示名，进 SourceStatus.label

    @abstractmethod
    async def fetch(self) -> Reading:
        """拉取一次。数值是"累计值"而非增量——差分统一由 SampleStore
        用历史算，源本身保持无状态。
        """
        ...
