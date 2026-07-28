# NEAT ANNOTATIONS 手绘标注标本

<iframe src="/skills/frontend-styles/assets/task7-neat-annotations-demo/"
        style="width:100%;height:800px;border:1px solid #8884;border-radius:10px"
        loading="lazy" title="NEAT ANNOTATIONS 手绘标注标本 demo"></iframe>

把组件 API 做成一页完整 specimen：方向、颜色和组合密集陈列，但暖纸、错位硬阴影与手写标注
让它仍像一张有性格的设计说明书。样本来自工作区 `task7`。

## 要点

- 用暖纸、蓝黑墨、钴蓝、珊瑚红和琥珀建立友好工具感，避免默认文档站的纯白灰
- Hero 直接展示最强组合效果，第一屏同时回答“是什么”和“长什么样”
- 按 API 心智模型拆成方向、颜色、组合三个 specimen 面板，不按源码文件组织内容
- 面板使用 1px 深色边、5px 错位硬阴影和零圆角，既像标本盒又保持信息密度
- 手绘标注由伪元素和 CSS 变量控制颜色、方向、偏移、旋转与最大宽度
- 高亮底纹只占文字下部，不把文字本身改成低对比色
- 演示格直接写出 class 名与效果，用户不需要在文档和预览之间来回对照
- 多方向样本放进规则网格，中心留出呼吸位，箭头不能互相穿过
- 颜色点既是图例也是可操作控件，点击后用同一 CSS 令牌替换全页标注色
- 长标签必须允许换行，并提供偏移变量处理容器边缘与嵌套标注
- 彩虹或摇摆动画遵守 `prefers-reduced-motion`，静态标记仍保留语义
- 工具页的装饰只服务理解：没有与 API 无关的粒子、3D、玻璃和大段入场

上面的 demo 由工作区 `task7` 原项目完整服务端渲染并静态迁移，保留八方向、
七种内置颜色、八组 marks 与 combinations、响应式标本布局、彩虹动画和减弱动画适配；
本地 `neat-annotations.css` 也随页面一起发布，不依赖远端运行时。

## 完整实现

- [运行入口](../assets/task7-neat-annotations-demo/index.html)
- [完整标本页面源码](../assets/task7-neat-annotations-demo/source/app/page.tsx)
- [页面视觉与响应式源码](../assets/task7-neat-annotations-demo/source/app/globals.css)
- [标注库完整 CSS](../assets/task7-neat-annotations-demo/neat-annotations.css)
- [工程依赖](../assets/task7-neat-annotations-demo/source/package.json)
