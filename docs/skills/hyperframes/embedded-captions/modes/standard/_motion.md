---
name: caption-template-motion
description: >
  各个单模板文件引用的、有名字的流动字幕 + 高潮入场 / 退场配方（GSAP，可安全 seek），外加动效数值（缓动色板、退场 = 入场的 75%、高潮停留、克制、情绪→动效）。每个模板都从这里挑一个 FLOW_IN/OUT 和一个 CLIMAX_IN/OUT —— 只查模板点名的那 2-3 个配方（grep `### name`），这是一份目录，不是从头读到尾的文档。
metadata:
  tags: gsap, easing, entrance, exit, timing, restraint, mood-matching, captions
---

# 字幕模板 —— 动效语言

`_anatomy.md` 在一条暂停的 timeline 上接了四个钩子：`FLOW_IN`、`FLOW_OUT`、`CLIMAX_IN`、`CLIMAX_OUT`。这个文件就是每个模板从中挑选的目录。每个配方都是作用在高潮 `span`（或流动字幕的 `.w`）上的一个 GSAP tween；放在绝对时间上，它就完全**可安全 seek**。多阶段的外观用 GSAP 的 `keyframes:{}`（依然可安全 seek）—— 绝不用 CSS keyframes。

## 数值（共用）

**缓动色板**（获准使用 —— 在视频上读起来干净，彼此区分明显）：

| 曲线 | GSAP | 用途 |
| --- | --- | --- |
| 过冲入场 | `back.out(1.4–1.7)` | 自信的到达（premium/epic/creator） |
| 厚重 / 精致 | `power3.out` | hero / 次要元素入场、滑动 |
| 通用 | `power2.out` | 淡入淡出、缩放 |
| 退场加速 | `power2.in` | 任何运动的*退场*一侧（离开时加速） |
| 利落 | `expo.out` | warp/fly/sonic 这类自信的快速定格 |
| 呼吸 | `sine.inOut` | 温和的养生类漂移 |
| 冲击闷响 | `back.out(1.5–2)` 或短促的 `expo.out` | slam/stomp/stamp 的落地 |
| 线性驱动 | `none` | 只用于 asr 当前词包络的驱动 |
| 数字卡顿 | `steps(n)` | glitch/vhs/blink/possess/cut |

**禁止：** `bounce.out`、`elastic.out` 在所有地方都禁止，**除了** Playful 簇（明确的俏皮感 —— KIDS 的下落弹跳、CANDY 的果冻）。其他地方，真实物体会减速；它们不会弹跳。需要获准的过冲时，用低参数的 `back.out`。

**时长** —— 流动字幕的词入场 0.30–0.50 s · 高潮入场 0.6–1.6 s · **退场 ≈ 入场的 75 %**（到达从容，离开利落）· 错开 50–150 ms / 词。

**克制（让它显得高级的那条规则）：** FLOW 保持干净 —— 一个有品味的揭示 + 当前词的强调色，不加特效。大的情绪动作 + 任何场景特效（闪白、冲击波、震动）**只在 CLIMAX 处**发生，然后清场。绝不要把特效撒在整条流动字幕上。

**高潮停留 ≥ 1 s**，从入场结束后算起 —— 高潮是标题那一拍。

**情绪 → 动效**（选一个物理特性和主题相符的入场）：

| 情绪 | 入场 |
| --- | --- |
| premium | deblur · rise · expose · breathe · flip |
| epic | slam · monument · fly · grandrise |
| cyber | glitch · type · scan · boot |
| horror | loom · possess · glimpse · seep（绝不弹跳 / 绝不干净） |
| luxury | tracking-expand · hairrise |
| retro | vhs · stamp · blink · type |
| neon | ignite · buzz |
| hype | stomp · punch · slap |
| playful | jelly · dropb · scrawl · popr |
| creator | boxpop · slideup · flip · shimmer |
| ultra（闪光在字里） | volt · hyper · liquid · prism · shatter · extrude |
| atelier（设计） | editwipe · rise · block · vert · ink · weight |
| impact（高潮处的场景特效） | nuke · meteor · sonic · seismic · judge |

---

## FLOW 入场 / 退场（作用于每个词 `.w`）

流动字幕按转录稿逐词揭示。当前词获得 `.act`（→ `--cacc`）。退场时硬隐藏整组。

- **fade-up**（premium/atelier 默认）—— `fromTo(w,{opacity:0,y:14},{opacity:1,y:0,duration:.42,ease:'power3.out'})`
- **pop**（epic/hype）—— `fromTo(w,{opacity:0,scale:.5},{opacity:1,scale:1,duration:.34,ease:'back.out(1.6)'})`
- **whip**（kinetic）—— `fromTo(w,{opacity:0,x:-30,filter:'blur(10px)'},{opacity:1,x:0,filter:'blur(0)',duration:.32,ease:'expo.out'})`
- **glitch**（cyber）—— `fromTo(w,{opacity:0,clipPath:'inset(45% 0 45% 0)'},{opacity:1,clipPath:'inset(0)',duration:.4,ease:'steps(6)'})`
- **type**（terminal/retro）—— `fromTo(w,{opacity:0},{opacity:1,duration:.2,ease:'steps(3)'})`，按说话节奏错开
- **blur-in**（horror）—— `fromTo(w,{opacity:0,filter:'blur(10px)',y:'.1em'},{opacity:1,filter:'blur(0)',y:0,duration:.6,ease:'power2.out'})`
- **karaoke**（creator）—— 词一开始就可见但偏暗；在 `w.start` 时 `set(w,{className:'w act'})`（当前词 → `--cacc`），前一个词回到已念过的状态。标志性的逐字照录机制。
- **流动字幕退场** —— fade-up-out `to{opacity:0,y:-10}` · horror 拖影 `to{opacity:0,x:6,skewX:10,filter:'blur(5px)'}` · 全部 ≈0.4–0.55 s。

---

## CLIMAX 入场

每一个都是 `gsap.fromTo(span, {from}, {to, duration, ease})`。凡是写了 `keyframes:{}` 的，把它作为第 2 个参数里的 `keyframes` 传入。

### premium

- **deblur** —— `{opacity:0,scale:.96,filter:'blur(8px)'}→{opacity:1,scale:1,filter:'blur(0)',duration:.8,ease:'power3.out'}`
- **rise** —— `{opacity:0,yPercent:48}→{opacity:1,yPercent:0,duration:.9,ease:'power3.out'}`
- **expose** —— `{opacity:0,filter:'brightness(3.2) blur(5px)',scale:1.05}→{opacity:1,filter:'brightness(1) blur(0)',scale:1,duration:1,ease:'power2.out'}`
- **breathe** —— `{opacity:0,scale:1.09,filter:'blur(8px)'}→{opacity:1,scale:1,filter:'blur(0)',duration:1.2,ease:'sine.out'}`
- **flip** —— `{opacity:0,rotationX:93,transformPerspective:720}→{opacity:1,rotationX:0,duration:.9,ease:'power3.out'}`

### epic

- **slam** —— `{opacity:0,scale:1.6,filter:'blur(12px)'}→{opacity:1,scale:1,filter:'blur(0)',duration:.7,ease:'back.out(1.6)'}`（带一声闷响落地；中途过冲约 1.03）
- **monument** —— `{opacity:0,scale:1.42,letterSpacing:'.12em'}→{opacity:1,scale:1,letterSpacing:'0',duration:1.3,ease:'power3.out'}`
- **fly** —— `{opacity:0,scale:.3,filter:'blur(14px)'}→{opacity:1,scale:1,filter:'blur(0)',duration:.8,ease:'expo.out'}`
- **grandrise** —— `{opacity:0,yPercent:66,scale:1.05}→{opacity:1,yPercent:0,scale:1,duration:1.15,ease:'power3.out'}`

### cyber

- **glitch** —— `{opacity:0}→{opacity:1,duration:.6,ease:'steps(8)',keyframes:{clipPath:['inset(40% 0 40% 0)','inset(0)','inset(60% 0 10% 0)','inset(0)'],x:[-8,5,-2,0],textShadow:['4px 0 #ff003c,-4px 0 #00ffd1','none']}}`
- **type** —— `{opacity:1,clipPath:'inset(0 100% 0 0)'}→{clipPath:'inset(0 0 0 0)',duration:.85,ease:'steps(13)'}`（打字机，从左到右）
- **scan** —— `{opacity:0,scaleY:.02,filter:'brightness(2.4)'}→{opacity:1,scaleY:1,filter:'brightness(1)',duration:.75,ease:'power3.out'}`
- **boot** —— `{opacity:0,scaleY:.1}→{opacity:1,scaleY:1,duration:1,ease:'steps(1)',keyframes:{opacity:[0,.6,.1,.85,.2,1]}}`（全息投影通电时的闪烁）

### horror（绝不弹跳，绝不干净）

- **loom** —— `{opacity:0,scale:.6,filter:'blur(17px)'}→{opacity:1,scale:1,filter:'blur(0)',duration:1.6,ease:'power2.in',keyframes:{scale:[.6,.93,1.07,1]}}`（从黑暗里缓缓逼近，然后猛地往前一扑）
- **possess** —— `{opacity:0}→{opacity:1,duration:1.15,ease:'steps(1)',keyframes:{x:[0,-5,6,-4,5,-2,0],skewX:[0,9,-10,7,-5,3,0],textShadow:['none','4px 0 #c00,-4px 0 #0aa','-6px 0 #c00,6px 0 #0aa','none']}}`（显形后一阵剧烈的恶魔般战栗）
- **glimpse** —— `{opacity:0}→{opacity:1,duration:1.35,ease:'steps(1)',keyframes:{opacity:[0,1,0,0,1,0,0,1,.05,1,.15,1],x:[0,0,0,3,0,-2,0]}}`（潜意识般、灯光将熄的闪烁）
- **seep** —— `{opacity:0,clipPath:'inset(-15% -8% 100% -8%)',filter:'blur(4px)'}→{opacity:1,clipPath:'inset(-15% -8% -15% -8%)',filter:'blur(0)',duration:1.35,ease:'power1.inOut'}`（血向下渗进字里；用负 inset，免得手写体的顶部被裁掉）

### luxury

- **tracking** —— `{opacity:0,letterSpacing:'-.05em'}→{opacity:1,letterSpacing:'.28em',duration:1.4,ease:'power3.out'}`（最「贵」的一招）
- **hairrise** —— `{opacity:0,yPercent:32,letterSpacing:'.07em'}→{opacity:1,yPercent:0,letterSpacing:'0',duration:1.1,ease:'power3.out'}`

### retro

- **vhs** —— `{opacity:0}→{opacity:1,duration:.8,ease:'steps(1)',keyframes:{x:[0,-7,6,-3,2,0],textShadow:['none','3px 0 #ff3b5c,-3px 0 #3aa0ff','none']}}`（磁迹锁定时的抖动 + 色差）
- **stamp** —— `{opacity:0,scale:1.7,rotation:-5}→{opacity:1,scale:1,rotation:0,duration:.7,ease:'back.out(2)'}`（印章盖下的闷响）
- **blink** —— `{opacity:0}→{opacity:1,duration:.75,ease:'steps(1)',keyframes:{opacity:[0,0,1,0,1,0,1,1]}}`（8-bit 闪烁出现）

### neon

- **ignite** —— `{opacity:0}→{opacity:1,duration:1.3,ease:'steps(1)',keyframes:{opacity:[.2,1,.2,1,.3,1,1]}}`（灯管打火 + 嗡嗡亮起；光晕是风格里的 `text-shadow`）
- **buzz** —— `{opacity:0}→{opacity:1,duration:1.2,ease:'steps(1)',keyframes:{opacity:[0,.7,.1,.85,.2,1,.5,1]}}`（更慢的预热节奏）

### hype

- **stomp** —— `{opacity:0,scale:1.5,filter:'blur(8px)'}→{opacity:1,scale:1,filter:'blur(0)',duration:.9,ease:'back.out(1.6)'}`
- **punch** —— `{opacity:0,xPercent:-55,scale:1.1,filter:'blur(9px)'}→{opacity:1,xPercent:0,scale:1,filter:'blur(0)',duration:.6,ease:'expo.out'}`（从侧面甩进来）
- **slap** —— `{opacity:0,rotation:12,scale:1.5,filter:'blur(7px)'}→{opacity:1,rotation:0,scale:1,filter:'blur(0)',duration:.7,ease:'back.out(2)'}`（贴纸 / 标签拍上去）

### playful（这里允许弹跳）

- **jelly** —— `{opacity:0,scale:.5}→{opacity:1,scale:1,duration:.8,ease:'back.out(2.2)',keyframes:{scale:[.5,1.12,.92,1.04,1],skewX:[0,0,6,-4,0]}}`
- **dropb** —— `{opacity:0,yPercent:-85}→{opacity:1,yPercent:0,duration:.95,ease:'power2.out',keyframes:{yPercent:[-85,0,-22,0,-8,0]}}`（下落 + 多次弹跳）。**❗opacity 必须到达 1 并保持住** —— 在 keyframes 的末尾声明它。
- **scrawl** —— `{opacity:0,clipPath:'inset(-12% 100% -12% 0)',rotation:-3}→{opacity:1,clipPath:'inset(-12% 0 -12% 0)',rotation:0,duration:.8,ease:'power2.out'}`（手写式逐笔写出，用于手写字体）
- **popr** —— `{opacity:0,scale:.4,rotation:8}→{opacity:1,scale:1,rotation:0,duration:.6,ease:'back.out(2)'}`

### creator

- **boxpop** —— `{opacity:0,scale:.5}→{opacity:1,scale:1,duration:.5,ease:'back.out(1.8)'}`（流动字幕当前词的高亮框是一种风格）
- **slideup** —— `{opacity:0,yPercent:44}→{opacity:1,yPercent:0,duration:.55,ease:'power3.out'}`
- **flip** —— 见 premium
- **shimmer** —— `{opacity:0,scale:.7,filter:'brightness(2.2)'}→{opacity:1,scale:1,filter:'brightness(1)',duration:.75,ease:'power2.out'}`

### ultra（闪光就在字里）

- **volt** —— `{opacity:0}→{opacity:1,duration:1.1,ease:'steps(1)',keyframes:{opacity:[0,1,.12,1,.35,1],x:[0,0,0,2,-2,0]}}`，然后稳定为发光 `text-shadow:0 0 8px #fff,0 0 22px #43f4ff,0 0 48px #1e90ff`（电击）
- **hyper** —— `{opacity:0,scale:.05,filter:'blur(3px) brightness(3)'}→{opacity:1,scale:1,filter:'blur(0) brightness(1)',duration:.9,ease:'expo.out'}`（从纵深处跃迁而出）
- **liquid** —— `{opacity:0,scale:.9,yPercent:6,filter:'blur(10px)'}→{opacity:1,scale:1,yPercent:0,filter:'blur(0)',duration:1,ease:'power2.out'}` + `.climax` *容器*带上 SVG `filter:url(#liquid)`；在 HF 里从 timeline 驱动 `feDisplacementMap@scale`（不要用 SMIL —— 不可安全 seek）
- **prism** —— `{opacity:0,textShadow:'-38px 0 #ff003c,38px 0 #00ffd1',filter:'blur(5px)',scale:1.08}→{opacity:1,textShadow:'-3px 0 #ff003c,3px 0 #00ffd1',filter:'blur(0)',scale:1,duration:1,ease:'power3.out'}`（色散收拢）
- **shatter** —— `{opacity:0,scale:1.9,rotation:-3,filter:'blur(14px)'}→{opacity:1,scale:1,rotation:0,filter:'blur(0)',duration:1,ease:'back.out(1.4)',keyframes:{scale:[1.9,.9,1.06,.98,1]}}`（+ 落地时 1 帧的白色 `text-shadow` 闪光）
- **extrude** —— `{opacity:0,rotationY:42,scale:.9,transformPerspective:700}→{opacity:1,rotationY:-9,scale:1,duration:.9,ease:'power3.out'}`（3D 转动；纵深靠风格里叠加的 `text-shadow`）

### atelier（设计导向）

- **editwipe** —— `{opacity:1,clipPath:'inset(-15% 100% -15% 0)'}→{clipPath:'inset(-15% -4% -15% 0)',duration:.7,ease:'power4.inOut'}`（瑞士风格的精准擦除；上下用负值，免得字形顶部被裁掉）
- **rise** —— 见 premium（更慢，`duration:.9`）
- **block** —— `{opacity:0,scaleY:0,transformOrigin:'bottom center'}→{opacity:1,scaleY:1,duration:.7,ease:'power3.out'}`（构成主义 / Bauhaus）
- **vert** —— `{opacity:0,clipPath:'inset(0 0 100% 0)'}→{opacity:1,clipPath:'inset(0 0 0 0)',duration:.9,ease:'power2.out'}`（竖向滴墨；`writing-mode:vertical-rl` 是一种风格，高潮词位于 `left:81%`）
- **ink** —— `{opacity:0,clipPath:'inset(-28% 100% -28% -4%)',filter:'blur(3px)'}→{opacity:1,clipPath:'inset(-28% -8% -28% -4%)',filter:'blur(0)',duration:.9,ease:'power2.out'}`（毛笔逐笔写出；给手写字体留足负 inset）
- **weight** —— `{opacity:0,fontVariationSettings:"'wght' 100",letterSpacing:'.18em'}→{opacity:1,fontVariationSettings:"'wght' 900",letterSpacing:'0',duration:1,ease:'power2.out'}`（可变字体形变；需要可变字体，例如 Inter `wght@100..900`）

### impact（唯一获准的场景特效，只在高潮处）

每一个都把文字动作和一个场景元素（`<div class="flash">` / `<div class="ring">`）和 / 或舞台震动配对。只限于高潮那一拍。

- **nuke** —— 文字：`{opacity:0,scale:.3,filter:'brightness(8) blur(10px)'}→{opacity:1,scale:1,filter:'brightness(1) blur(0)',duration:1,ease:'expo.out'}` + 白色 `.flash` 在 0.3 s 内 `to{opacity:0}` + 舞台短暂的 `x` 向震动
- **meteor** —— `{opacity:0,yPercent:-45,scale:1.12,filter:'blur(12px) brightness(2.2)'}→{opacity:1,yPercent:0,scale:1,filter:'blur(0)',duration:1,ease:'power4.in'}`（向下加速）+ 落地时舞台震动
- **sonic** —— `{opacity:0,scale:1.4,filter:'blur(8px)'}→{opacity:1,scale:1,filter:'blur(0)',duration:.9,ease:'expo.out'}` + 一个 `.ring` 缩放 `0→3`、透明度 `1→0`
- **seismic** —— `{opacity:0,scale:1.1}→{opacity:1,scale:1,duration:.9,ease:'power3.out'}` + 舞台 `x`/`y` 地震 `keyframes:[3,-3,2,-2,0]`，逐渐衰减
- **judge** —— `{opacity:0,yPercent:-45,scale:1.12,filter:'blur(12px) brightness(2.2)'}→{opacity:1,yPercent:0,scale:1,filter:'blur(0)',duration:1,ease:'power3.out'}`（从上方降下）+ 光柱 `.flash`

---

## CLIMAX 退场

默认是 **fade**，除非模板点名了别的。**每个退场都以 `opacity:0` 结束**（或完全裁掉），什么都不残留 —— 即使是 transform/clip 类退场，也要在末尾声明 opacity:0。

- **fade** —— `to{opacity:0,scale:1.03,duration:.6,ease:'power2.in'}`（premium/epic/大多数默认情况）
- **rise-off** —— `to{opacity:0,yPercent:-42,duration:.6}` · **sink** —— `to{opacity:0,yPercent:16,scale:.97}` · **lift** —— `to{opacity:0,yPercent:-26,letterSpacing:'.1em'}`
- **expose-off** —— `to{opacity:0,filter:'brightness(3.6) blur(4px)'}` · **breathe-off** —— `to{opacity:0,scale:1.08,filter:'blur(7px)'}`
- **flip-off** —— `to{opacity:0,rotationX:-90}` · **fly-off** —— `to{opacity:0,scale:2.5,filter:'blur(13px)'}`
- **untype** —— `to{clipPath:'inset(-15% 100% -15% 0)',opacity:0,ease:'steps(11)'}`（退格删除）· **scan-collapse** —— `to{opacity:0,scaleY:.02}` · **power-off** —— `keyframes:{opacity:[1,.3,1,.1,.5,0]}` + scaleY 塌缩
- **drag**（horror）—— `to{opacity:0,xPercent:-40,skewX:-20,filter:'blur(11px)',duration:.55,ease:'power2.in'}`（被拖走）
- **snap**（horror）—— `keyframes:{x:[0,7,-6,0],skewX:[0,-13,0],scale:[1,1.1,1.16,1.32],opacity:[1,1,1,0],textShadow:['none','8px 0 #c00,-8px 0 #0aa','none','none']}`（猛地一抽然后消失）
- **cut**（horror）—— `keyframes:{opacity:[1,0,1,0,.8,0]},ease:'steps(1)'`（掉帧）· **bleed** —— `to{opacity:0,yPercent:50,scale:.97,filter:'blur(6px)'}`（往下滴落）
- **knock** —— `to{opacity:0,xPercent:55,filter:'blur(9px)'}` · **peel** —— `to{opacity:0,rotation:14,xPercent:42,scale:.9}` · **spin-out** —— `to{opacity:0,rotation:180,scale:.3}`
- **hop** —— `keyframes:{yPercent:[0,-26,120],opacity:[1,1,0]},scaleY:.7` · **popout** —— `to{opacity:0,scale:.3,rotation:-10}` · **slidedown** —— `to{opacity:0,yPercent:42}` · **scrawl-off** —— `to{opacity:0,yPercent:-14,rotation:2}`
- **vhs-out** —— `keyframes:{x:[0,-9,8,0],opacity:[1,1,0]},scaleY:.2`（磁迹丢失后的滚动）· **blink-out** —— `keyframes:{opacity:[1,0,1,0,1,0,0]},ease:'steps(1)'` · **power-down** —— `keyframes:{opacity:[1,.2,.7,.1,0]},ease:'steps(2)'` · **lift2** —— `to{opacity:0,scale:1.12,filter:'blur(3px)'}`（印章抬起）· **shim-out** —— `to{opacity:0,scale:.8,filter:'brightness(1.9)'}`
- **iris-close** —— `to{opacity:0,clipPath:'circle(0% at 50% 46%)'}`（Bond 片头式）· **un-shine** —— `to{opacity:0,clipPath:'inset(0 0 0 100%)',filter:'brightness(1.7)'}` · **sweep-off** —— `to{opacity:1,clipPath:'inset(0 100% 0 0)'}`
- ultra 家族的退场：**glitch-out**、**neon-out**、**hyper-out** `to{opacity:0,scale:2.6,filter:'blur(13px)'}`、**liquid-out** `to{opacity:0,yPercent:40,scale:.96,filter:'blur(9px)'}`、**prism-out**（各色彩通道向外分离）、**shatter-out** `to{opacity:0,scale:1.45,filter:'blur(9px)',textShadow:'7px 0 #ff003c,-7px 0 #00ffd1'}`

## 搭配的 HF skill

- `hyperframes-gsap` —— 单条暂停 timeline、transform 别名、缓动列表、允许动画的属性白名单。
- `_anatomy.md` —— 这四个钩子挂在哪里。
- `hyperframes-animation/rules/asr-keyword-glow.md` —— 流动字幕用的逐字照录当前词包络。
