# Wearable 一幕：巨型标题、景深换焦与照片滑轨

<iframe src="/skills/frontend-styles/oryzo/assets/wearable-typography-demo.html"
        style="width:100%;height:560px;border:1px solid #8884;border-radius:10px"
        loading="lazy" title="巨型标题横穿：辉光与景深换焦"></iframe>

oryzo.ai 里节奏最漂亮的一幕："it's wearable" 视口高的巨型标题跟着滚动从右横穿到左，
中段白热发光像打过曝的棚灯；随后**换焦** —— 字化进虚焦里，取景框中的画面从模糊里显影，
杯垫已经别在了外套胸口。字与景互为景深，一次滚动完成一次"叙事接力"。
demo 用纯 CSS 占位画复现（滚轮 / 拖拽推进），不借任何照片。

## 要点

- 巨型标题横穿的速度与滚动 1:1（`translateX` 直接吃滚动值折算），是"页面在动"最诚实的信号 —— 比任何入场动画都跟手
- 辉光不是 `filter: drop-shadow` 是三层 `text-shadow` 叠的 bloom（近层白、中层暖白、远层琥珀），强度吃进度的正弦信封：入场渐亮、中段过曝、出场熄灭
- **换焦（rack focus）就是两层 `filter: blur` 互换**：文字层 0→16px、场景层 18px→0，透明度同步交叉 —— 电影语言里最便宜的注意力转移，浏览器里两行 CSS
- 字穿过取景框时在产品"层前层后"穿行的错觉：取景框和内容分层，标题 z 序夹在中间，加上模糊层次，纵深就有了
- 取景框四角刻度（细线框 + 4 个角标 + 轨道圆点）是整站的"摄影棚取景器"版式母题，一套 border 伪元素就够
- 场景层的"人像"是纯 CSS 画的占位（渐变外套 + 胸口徽章杯垫）：拆解复刻不搬原站摄影素材，构图气质到位即可

## 照片滑轨

<iframe src="/skills/frontend-styles/oryzo/assets/photo-rail-demo.html"
        style="width:100%;height:560px;border:1px solid #8884;border-radius:10px"
        loading="lazy" title="横向照片滑轨：纵向滚动折算横向走片"></iframe>

换焦之后这一幕的后半段：编辑部风格的玩梗大片（别帽上、当眼罩、咬嘴里、揣口袋……）
排成横向滑轨，纵向滚动被折算成横向走片，依次经过视口中央钉死的取景框。

- 纵向滚动折算 `translateX`：用户只会一种滚动，但画面多了一个行进方向 —— 单调的下滑变成了"走片"
- **每张停一拍（手写版 scroll-snap）**：把滚动里程按卡切段（每卡固定 640 虚拟像素），段首 30% 钉在当前卡、后 70% `smoothstep` 滑向下一张；再加空闲吸附（松手 250ms 后 target 缓动到最近整卡位）—— 任何时刻框里都有一张端正的"正片"，最后一张也能精确进框（里程 = (卡数-1)×段长，与轨道长度、视口宽度彻底解耦）
- **过框感不用 IntersectionObserver**：每帧算卡片中心到取景框中心的距离，距离 → scale / 亮度 / 饱和 / 模糊的连续函数 —— 无级过渡，倒着滚也天然对称
- 取景框钉死不动、卡片从底下流过：动的是内容不是相机，和转台一幕"文案钉住、世界在动"同一个版式哲学
- 玩梗贴纸是叙事的一部分：WARNING 缎带（"专业人士操作，请勿模仿"）、糖纸红底、斜排水印 —— 假产品的真广告腔全靠这些道具撑
- 卡片全是 CSS 画的占位大片：渐变布光 + 软木圆盘道具，一张图片都不用

## 源码（折叠）

??? abstract "wearable-typography-demo.html"

    ```html
    --8<-- "skills/frontend-styles/oryzo/assets/wearable-typography-demo.html"
    ```

??? abstract "photo-rail-demo.html"

    ```html
    --8<-- "skills/frontend-styles/oryzo/assets/photo-rail-demo.html"
    ```
