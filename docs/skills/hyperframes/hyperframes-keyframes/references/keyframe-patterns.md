<!-- 中译自 heygen-com/hyperframes@46f6cb3 的 skills/hyperframes-keyframes/references/keyframe-patterns.md（Apache-2.0）；改动说明见 maintenance/skills/hyperframes.md -->

# 关键帧机制参考

在 `SKILL.md` 之后、选择具体实现机制时使用。它是一个零件架，不是风格指南。先从一种主要机制开始；只有当辅助运动能让想法更清楚时才加上它。

## Runtime 骨架

GSAP：

```js
const root = document.querySelector("[data-composition-id]");
const id = root.dataset.compositionId;
const tl = gsap.timeline({ paused: true });
tl.to("<selector>", {
  keyframes: [
    /* derive poses from the scene */
  ],
  ease: "none",
});
window.__timelines = window.__timelines || {};
window.__timelines[id] = tl;
```

CSS：

```css
.<subject > {
  animation: <name> <duration> <ease> both;
  animation-iteration-count: 1;
}
@keyframes <name> {
  0% {
    transform: <pose-a>;
    opacity: <a>;
  }
  100% {
    transform: <pose-b>;
    opacity: <b>;
  }
}
```

Anime.js：

```js
const animation = anime.createTimeline({ autoplay: false });
animation.add("<selector>", {
  /* derived channels */
});
window.__hfAnime = window.__hfAnime || [];
window.__hfAnime.push(animation);
```

Three/WebGL：

```js
const state = { progress: 0 };
tl.to(state, {
  progress: 1,
  duration: <duration>,
  onUpdate: () => {
    // derive camera/object/material values from state.progress
    renderer.render(scene, camera);
  },
});
```

## 机制

| 机制           | 解决的问题                                         | 关键帧                                                           | Runtime                                    | 验证                                         |
| ------------------- | ---------------------------------------------- | ------------------------------------------------------------------ | ------------------------------------------ | ---------------------------------------------- |
| 路径移动         | 主体必须明显地沿一条路线移动            | 路径进度、切线方向旋转、跟随者偏移、拖尾不透明度    | GSAP MotionPath 或采样的 x/y/z           | 在拐弯处拍条带图；最终 snapshot            |
| 描边描画         | 一条线、一个环或一个轮廓随时间出现     | dash / 描画范围、描边不透明度、端点状态                    | DrawSVG 或 SVG dash 回退方案               | 中途部分绘制的 snapshot；最终完整状态           |
| 形状插值 | 一个剪影变成另一个                 | 源路径、中间路径、目标路径、填充 / 描边                 | MorphSVG 或路径 tween                     | 首 / 中 / 末 snapshot                      |
| 共享元素      | 同一个主体改变框或层级          | 源框、目标框、x/y、缩放、圆角、上下文不透明度        | GSAP Flip 或手写 FLIP                   | 移动的是同一个身份；没有替代性的交叉淡化    |
| 裁切 / 遮罩揭示    | 运动的边界露出内容              | clip path、遮罩位置 / 尺寸、边缘柔和度、内部反向运动 | CSS、SVG、GSAP 或 shader                  | 对边缘帧和最终未裁切状态做 snapshot |
| 有序重复  | 许多项按顺序进场、离场或变换 | 按索引延迟、x/y、缩放、不透明度、最终对齐                | GSAP stagger、Anime stagger、CSS 变量      | 检查第一项 / 中间项 / 最后一项的计时            |
| 文字细分    | 文字运动需要可读的内部计时     | 行 / 词 / 字符 / 条带包裹层、y/x、不透明度、最终适配              | SplitText、手写 span、Anime splitText | 条带图加最终可读性 snapshot     |
| 表面变换   | 图片 / 卡片拉伸、裁切或改变形状  | 父级缩放 / 倾斜 / 裁切、子级反向缩放、变换原点      | GSAP/CSS keyframes                         | 最终状态没有意外的扭曲                     |
| UI 状态机    | 界面依次经过若干语义状态       | 关闭、激活、加载中、成功 / 错误、最终                      | GSAP/CSS/Anime                             | snapshot 按顺序命中各个状态                  |
| DOM 纵深           | HTML 元素需要 3D 分离               | 透视、z、rotationX/Y、不透明度、交叉时的图层顺序         | CSS 3D + GSAP/CSS/Anime                    | 倾斜角度的 `--shot`；重叠处 snapshot              |
| 镜头 / 对象 3D    | Canvas/WebGL 场景在纵深上运动              | 镜头、目标、对象 transform、材质不透明度                 | Three.js/WebGL + GSAP 代理                | `--ghost`；在证明姿态处 snapshot            |
| Shader uniform      | 像素效果由一个标量进度驱动      | 进度、边缘宽度、噪声、颜色混合、不透明度                    | ShaderMaterial/WebGL uniform              | `--ghost`；在 0 / 边缘 / 中间 / 最终处 snapshot           |
| 实例化系统    | 许多 3D 对象作为一个系统运动             | 实例 transform、缩放、颜色 / 不透明度、镜头                  | Three InstancedMesh                        | 用 snapshot，因为 DOM 框看不到内部    |
| 导入的模型      | 模型动画必须能确定性地拖动   | `AnimationMixer.setTime`、镜头、材质、灯光                 | Three AnimationMixer                       | 由 HyperFrames 时间驱动；`--ghost`         |

## 来源链接

- GSAP keyframes：https://gsap.com/resources/keyframes/
- GSAP timeline：https://gsap.com/docs/v3/GSAP/Timeline/
- GSAP MotionPathPlugin：https://gsap.com/docs/v3/Plugins/MotionPathPlugin/
- GSAP Flip：https://gsap.com/docs/v3/Plugins/Flip/
- GSAP DrawSVGPlugin：https://gsap.com/docs/v3/Plugins/DrawSVGPlugin/
- GSAP MorphSVGPlugin：https://gsap.com/docs/v3/Plugins/MorphSVGPlugin/
- GSAP SplitText：https://gsap.com/docs/v3/Plugins/SplitText/
- GSAP CSSPlugin：https://gsap.com/docs/v3/GSAP/CorePlugins/CSS/
- Anime.js 文档：https://animejs.com/documentation/
- Anime.js stagger 网格：https://animejs.com/documentation/utilities/stagger/stagger-parameters/stagger-grid/
- Anime.js timeline：https://animejs.com/documentation/timeline/
- Anime.js SVG 辅助工具：https://animejs.com/documentation/svg/createmotionpath/
- MDN CSS 动画：https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_animations/Using_CSS_animations
- MDN `@keyframes`：https://developer.mozilla.org/en-US/docs/Web/CSS/@keyframes
- MDN `clip-path`：https://developer.mozilla.org/en-US/docs/Web/CSS/clip-path
- MDN CSS 遮罩：https://developer.mozilla.org/en-US/docs/Web/CSS/mask
- MDN perspective：https://developer.mozilla.org/en-US/docs/Web/CSS/perspective
- MDN transform-style：https://developer.mozilla.org/en-US/docs/Web/CSS/transform-style
- Three.js AnimationMixer：https://threejs.org/docs/#api/en/animation/AnimationMixer
- Three.js ShaderMaterial：https://threejs.org/docs/#api/en/materials/ShaderMaterial
- Three.js InstancedMesh：https://threejs.org/docs/#api/en/objects/InstancedMesh
