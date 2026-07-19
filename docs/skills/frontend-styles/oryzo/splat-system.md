# 高斯泼溅渲染系统

oryzo.ai 一切照片感的地基：three.js 之上自研的 3D Gaussian Splatting 渲染器。
这一篇把整套系统的三个关键部件放在一起讲 —— 光栅化管线、异步排序、假反射 ——
三个 demo 全部按公开算法（Kerbl et al. 2023）从零实现，管线彼此同源。

## 光栅化管线

<iframe src="/skills/frontend-styles/oryzo/assets/gaussian-splat-demo.html"
        style="width:100%;height:560px;border:1px solid #8884;border-radius:10px"
        loading="lazy" title="迷你高斯泼溅：3DGS 光栅化管线"></iframe>

约 5,700 个程序化高斯拼出"杯垫 + 切割垫"，拖拽旋转；勾选右上角能看到每个 splat 的包围四边形，泼溅渲染的 overdraw 代价一目了然。

- 一个高斯 = 中心 + 各向异性缩放 + 旋转四元数 + 颜色 + 不透明度；3D 协方差 Σ=(RS)(RS)ᵀ
- 顶点着色器用透视雅可比把 Σ 投成屏幕 2×2 协方差，特征分解出椭圆长短轴撑开 quad（3σ），一次 instanced draw 画全部
- 片元用 conic（协方差之逆）算 `exp(-½ dᵀΣ′⁻¹d)` 衰减；对角 +0.3px² 当最小 footprint 兼抗锯齿
- **近平面剔除是保命**：高斯贴近相机时 focal/z 爆炸，一个高斯就能糊满全屏 —— 复刻时实测中招
- **原站的照片感在数据里不在渲染器里**：它的杯垫是训练出来的扫描资产 —— 对实物多视角拍摄，用 3DGS 优化管线让几十万个高斯的位置/形状/颜色/球谐被梯度下降摆到"渲染 = 照片"。渲染器（本文复刻的这套）只负责画
- 程序化没法训练，但可以逼近训练资产的三个性质（demo 两版翻车换来的）：① 颜色必须来自**同一张纹理**按位置采样（离屏 canvas 画软木颗粒 + 气孔），每粒各自随机 = 泥；② 粒子要贴在**光滑车削曲面**上黄金角螺旋均匀采样，σ 咬住间距（0.85×spacing）——随机撒点的轮廓是花菜；③ 光照要有方向性：每粒带法线做 N·L + 分区 AO + 接触阴影 —— 训练资产的光照烤在球谐里，程序化用这三样近似
- 原站的工程化：属性量化打包进整数纹理（texelFetch + 位运算解包），颜色是球谐按视角求值
- 原站资产 `.sog` = 免压缩 ZIP 装 meta.json + 一组 webp（均值/缩放/旋转/球谐各一张图），`createImageBitmap` 直送纹理 —— 借浏览器图片解码器给量化数据做解压；量化细节：均值对数编码、四元数最小三分量 + 2bit 模式位、缩放 log 插值、球谐 11-11-10 打包

## 异步深度排序

<iframe src="/skills/frontend-styles/oryzo/assets/worker-sort-demo.html"
        style="width:100%;height:560px;border:1px solid #8884;border-radius:10px"
        loading="lazy" title="Worker 异步深度排序实验台"></iframe>

半透明高斯必须从远到近画，相机一动就得重排全场。实验台里三团穿插的半透明球当"照妖镜"，三种模式 + 排序耗时滑杆，各架构的代价当场现形。

- 三种模式：Worker 异步 = 帧率稳但顺序晚 N 帧到货（穿插处"游一下"，即 splat swimming）；主线程同步 = 顺序新鲜但 FPS 跳水；不排序 = 前后关系胡说八道
- oryzo 用 **Rust→wasm 的 SplatSorter**（38.5KB）跑在 Worker 里：positions/indices 直接开在 wasm 线性内存（零拷贝），近平面剔除也在排序阶段做掉（返回 validCount）
- 消息协议（demo 照形状复刻）：`INIT{positions}` 一次常驻 → `READY`；每单 `SORT{视线方向, 排序缓冲}` → `SORT_DONE{排序缓冲}`，索引缓冲 **transferable 往返 ping-pong**，零克隆零 GC
- 一次只挂一单：排序在途不发新请求，新相机角度并进下一单 —— 排序幂等，丢中间帧无害
- 原站排序结果写进"索引纹理"由顶点着色器间接寻址；demo 简化为重排实例缓冲

## 镜像假反射

<iframe src="/skills/frontend-styles/oryzo/assets/mirror-reflection-demo.html"
        style="width:100%;height:560px;border:1px solid #8884;border-radius:10px"
        loading="lazy" title="镜像泼溅假反射"></iframe>

桌面那层产品摄影式的反光不是实时反射：原站加载**第二份镜像泼溅资产** `table_reflection.sog`（0.5MB），opacity 0.5 垫底画 —— 用渲染顺序换掉一整套屏幕空间反射。

- 三件套：镜像变换 + 全局透明度 + 先画垫底；没有反射探针、没有 SSR
- 镜像不只翻中心：协方差跟着 Σ′=FΣFᵀ 变（F=diag(1,1,-1)），代码里就是把 M=R·S 第三行取反
- 相机限制在桌面以上 → "倒影整体先画"永远是正确遮挡序，两个 pass 各自内部排序
- demo 加料（原站无）：倒影随离面深度指数衰减，开关可对比；桌面交给 CSS 渐变，canvas 开 `premultipliedAlpha:false` 直接合成

## 源码（折叠）

??? abstract "gaussian-splat-demo.html"

    ```html
    --8<-- "skills/frontend-styles/oryzo/assets/gaussian-splat-demo.html"
    ```

??? abstract "worker-sort-demo.html（含内联 Worker）"

    ```html
    --8<-- "skills/frontend-styles/oryzo/assets/worker-sort-demo.html"
    ```

??? abstract "mirror-reflection-demo.html"

    ```html
    --8<-- "skills/frontend-styles/oryzo/assets/mirror-reflection-demo.html"
    ```
