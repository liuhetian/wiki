# 独立运行的 HyperFrames Slideshow Harness

## 1. 过渡定位 —— 它为什么存在

这些模式是给独立演示用的**临时变通方案**。长期的解决方案是由引擎托管：未来的 `hyperframes preview --slideshow` / Studio present 模式会在真正的 HyperFrames 引擎之上托管 composition，由引擎逐帧驱动可 seek 的 timeline、掌管手势帧，并直接从 composition 读取 slideshow island。那条路径上线后，下面的大部分内容都会被简化掉。

在那之前，通过裸播放器 bundle 打开的独立 slideshow 必须绕过三个事实：

1. composition 必须暴露一个可 seek 的 `window.__timelines.root` timeline。任何不在这条 seek 路径上的东西，比如 Three.js 循环或命令式的入场效果，都必须自行驱动。
2. `<hyperframes-slideshow>` 从它**自己的 innerHTML**（包装器元素）里读取 slideshow island，而不是从播放器加载的 composition 里读。island 必须在包装器里复制一份。
3. composition 运行在播放器的 **iframe** 里；用户的按键和指针事件落在**父页面**上。包装器自有的音效（SFX）/ 全局音频应当放在父页面里，那里的激活令牌是可靠的。普通的幻灯片媒体留在 composition 里，离开幻灯片时由 slideshow 播放器停止。

不要把这些当作正式认可的编写模型。引擎托管路径上线后，按常规方式编写的 composition 直接就能用。

**持续维护的参考实现：**

---

## 2. 父级包装器（交付物里是 `index.html`，示例里是 `demo.html`）

父页面承载两个 dist bundle，包装组件，复制 island，并掌管所有音频。

对于公开的或面向用户的生成项目，把这个包装器作为根目录的 `index.html`，这样在浏览器里打开项目就能运行 slideshow。把原始的 HyperFrames composition 放在单独的路径下，比如 `composition/index.html`。在仓库示例里，你可能仍会看到这个文件叫 `demo.html`；这个名字只是参考模式，不是独立 deck 首选的交付方式。

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>My Deck — Slideshow Demo</title>

    <!--
      Load both bundles from packages/player/dist.
      The global builds register <hyperframes-player> and <hyperframes-slideshow>
      as custom elements — no import map needed.
    -->
    <script src="../../../packages/player/dist/hyperframes-player.global.js"></script>
    <script src="../../../packages/player/dist/slideshow/hyperframes-slideshow.global.js"></script>

    <style>
      *,
      *::before,
      *::after {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }
      html,
      body {
        width: 100%;
        height: 100%;
        overflow: hidden;
        background: #111;
      }
    </style>
  </head>
  <body>
    <!--
      tabindex="0" is critical — <hyperframes-slideshow> binds keydown
      (ArrowLeft/Right, Space, Backspace) to itself. Without tabindex the
      element cannot receive focus and arrow keys are dead.
    -->
    <hyperframes-slideshow
      tabindex="0"
      style="display: block; position: relative; width: 100vw; height: 100vh"
    >
      <hyperframes-player
        interactive
        style="position: absolute; inset: 0"
        src="composition/index.html"
      ></hyperframes-player>

      <!--
        DUPLICATED ISLAND — keep in sync with the island inside index.html.
        <hyperframes-slideshow> reads from its own innerHTML, not from the
        composition the player loads. Every time slides/fragments/hotspots/
        sequences change in index.html, update this copy too.
      -->
      <script type="application/hyperframes-slideshow+json">
        {
          "slides": [
            { "sceneId": "scene-one", "notes": "..." },
            {
              "sceneId": "scene-two",
              "notes": "...",
              "fragments": [8.3, 8.6]
            }
          ],
          "slideSequences": [
            {
              "id": "branch-one",
              "label": "Branch label",
              "slides": [{ "sceneId": "branch-scene", "notes": "..." }]
            }
          ]
        }
      </script>
    </hyperframes-slideshow>
    <!-- The built-in slideshow nav capsule renders Present; do not add a wrapper-level button. -->

    <!-- Audio player lives here — see Section 6 -->
  </body>
</html>
```

对于带有可点击页面内容或媒体控件的 deck，`interactive` 是必需的。没有它，播放器外壳会禁用 iframe 的指针事件，对 composition 的一次点击可能被解释为播放器的播放 / 暂停切换，而不是一次幻灯片交互。

### 逐张幻灯片的 `autoplay`

在 island 里给某张幻灯片加上 `"autoplay": true`，演讲者到达这张幻灯片时，就会从头播放该幻灯片的第一个 `<video>`。slideshow 仍然会停住 —— 它从不自动前进 —— 所以演讲者准备好后点 Next；autoplay 只是省掉了在 composition 里手动点一次播放。

```json
{
  "sceneId": "cold-open",
  "autoplay": true,
  "notes": "Promo plays on enter; click Next when it ends."
}
```

当视频**就是**这张幻灯片的主要内容、并且它自然播完就是前进的信号时，才用 `autoplay` —— 比如开场的宣传短片、让它跑完再往下讲的演示片段。**不要**把它用于背景 / 氛围循环，或演讲者要边放边讲的素材画面；那些应该由演讲者自己掌握时机启动（通过 `interactive` 点击 clip 的控件），而不是自动开始。每张幻灯片只有一个 autoplay clip（场景中的第一个 `<video>`）。

### 面向交互式媒体的演讲者媒体桥接

演讲者 / 观众模式通过一个以 deck 为范围的 `BroadcastChannel` 同步幻灯片位置。如果预期演讲者会对 composition 里的媒体进行播放、暂停、seek、静音或改变速率，就通过同一个频道镜像这些原生媒体事件。让媒体元素保持为事实来源；不要镜像某个自定义按钮的私有状态。

有声播放还有一个额外的浏览器约束：`BroadcastChannel` 消息不会把演讲者的用户激活带到观众窗口。观众窗口应该先尝试以静音方式执行由演讲者驱动的播放，因为浏览器通常允许静音自动播放；即便如此，它仍然可能在接受远端 `currentTime` 更新的同时拒绝 `media.play()`。如果发生这种情况，不要继续追着演讲者的 `timeupdate` 消息跑；显示一个观众端的解锁控件，存下最新的播放意图，并在观众窗口收到一次点击 / 按键手势之后，按这个意图重试播放。

```js
(function () {
  if (typeof BroadcastChannel === "undefined") return;

  var sender =
    new URLSearchParams(location.search).get("mode") === "audience" ? "audience" : "presenter";
  var channel = new BroadcastChannel("hf-slideshow:" + location.pathname);
  var applyingRemote = false;
  var lastTimeBroadcast = 0;
  var pendingPlayByKey = {};
  var blockedPlayByKey = {};
  var mutedPlaybackByKey = {};
  var unlockButton = null;

  function frameDocument() {
    var player = document.querySelector("hyperframes-player");
    var frame = player && player.iframeElement;
    try {
      return frame && frame.contentDocument ? frame.contentDocument : null;
    } catch {
      return null;
    }
  }
  function mediaNodes() {
    var doc = frameDocument();
    return doc ? Array.from(doc.querySelectorAll("video,audio")) : [];
  }
  function mediaKey(el, index) {
    return el.id ? "id:" + el.id : el.tagName.toLowerCase() + ":" + index;
  }
  function findMedia(key) {
    return mediaNodes().find(function (el, index) {
      return mediaKey(el, index) === key;
    });
  }
  function syncMediaState(el, msg, allowTimeSync) {
    if (typeof msg.playbackRate === "number") el.playbackRate = msg.playbackRate;
    if (typeof msg.volume === "number") el.volume = Math.max(0, Math.min(1, msg.volume));
    if (sender === "audience" && mutedPlaybackByKey[msg.key]) {
      el.muted = true;
    } else if (typeof msg.muted === "boolean") {
      el.muted = msg.muted;
    }
    if (
      allowTimeSync &&
      typeof msg.currentTime === "number" &&
      Math.abs((el.currentTime || 0) - msg.currentTime) > 0.35
    ) {
      el.currentTime = Math.max(0, msg.currentTime);
    }
  }
  function hasBlockedPlay() {
    return Object.keys(blockedPlayByKey).length > 0;
  }
  function hideAudienceUnlockIfClear() {
    if (hasBlockedPlay() || !unlockButton) return;
    unlockButton.remove();
    unlockButton = null;
  }
  function showAudienceUnlock() {
    if (sender !== "audience" || unlockButton) return;
    unlockButton = document.createElement("button");
    unlockButton.type = "button";
    unlockButton.textContent = "Enable audience media";
    unlockButton.style.cssText =
      "position:fixed;left:50%;bottom:96px;transform:translateX(-50%);z-index:100000;border:0;border-radius:999px;padding:12px 18px;background:#fff;color:#111827;box-shadow:0 10px 32px rgba(0,0,0,.28);font:700 14px/1 system-ui,sans-serif;cursor:pointer;";
    unlockButton.addEventListener("click", retryBlockedPlays);
    document.body.appendChild(unlockButton);
  }
  function rememberBlockedPlay(msg) {
    pendingPlayByKey[msg.key] = msg;
    blockedPlayByKey[msg.key] = true;
    showAudienceUnlock();
  }
  function clearBlockedPlay(key) {
    delete blockedPlayByKey[key];
    hideAudienceUnlockIfClear();
  }
  function tryPlay(el, msg) {
    if (sender === "audience") mutedPlaybackByKey[msg.key] = true;
    syncMediaState(el, msg, true);
    if (sender === "audience") el.muted = true;
    try {
      var playResult = el.play();
      if (playResult && typeof playResult.then === "function") {
        playResult
          .then(function () {
            clearBlockedPlay(msg.key);
          })
          .catch(function () {
            rememberBlockedPlay(msg);
          });
      } else {
        clearBlockedPlay(msg.key);
      }
    } catch (e) {
      rememberBlockedPlay(msg);
    }
  }
  function retryBlockedPlays() {
    wireMedia();
    applyingRemote = true;
    try {
      Object.keys(pendingPlayByKey).forEach(function (key) {
        var msg = pendingPlayByKey[key];
        var el = findMedia(key);
        if (el && msg) tryPlay(el, msg);
      });
    } finally {
      setTimeout(function () {
        applyingRemote = false;
      }, 300);
    }
  }
  function publish(el, index, action) {
    if (sender !== "presenter") return;
    if (applyingRemote) return;
    if (action === "timeupdate") {
      var now = performance.now();
      if (now - lastTimeBroadcast < 450 && !el.paused) return;
      lastTimeBroadcast = now;
    }
    channel.postMessage({
      type: "media",
      sender,
      key: mediaKey(el, index),
      action,
      currentTime: el.currentTime || 0,
      paused: el.paused,
      ended: el.ended,
      muted: el.muted,
      volume: el.volume,
      playbackRate: el.playbackRate,
    });
  }
  function wireMedia() {
    mediaNodes().forEach(function (el, index) {
      if (el.dataset.hfPresenterMediaSync === "1") return;
      el.dataset.hfPresenterMediaSync = "1";
      [
        "play",
        "pause",
        "seeking",
        "seeked",
        "ratechange",
        "volumechange",
        "ended",
        "timeupdate",
      ].forEach(function (name) {
        el.addEventListener(name, function () {
          publish(el, index, name);
        });
      });
    });
  }
  channel.addEventListener("message", function (event) {
    var msg = event.data;
    if (!msg || msg.type !== "media" || msg.sender === sender) return;
    if (sender === "audience" && blockedPlayByKey[msg.key] && msg.action === "timeupdate") {
      pendingPlayByKey[msg.key] = msg;
      showAudienceUnlock();
      return;
    }
    var el = findMedia(msg.key);
    if (!el) return;
    applyingRemote = true;
    try {
      if (
        msg.action === "play" ||
        (sender === "audience" && msg.action === "timeupdate" && msg.paused === false && el.paused)
      ) {
        pendingPlayByKey[msg.key] = msg;
        tryPlay(el, msg);
      } else {
        syncMediaState(el, msg, true);
      }
      if (msg.action === "pause" || msg.action === "ended") {
        delete pendingPlayByKey[msg.key];
        delete mutedPlaybackByKey[msg.key];
        clearBlockedPlay(msg.key);
        el.pause();
      }
    } catch {
    } finally {
      setTimeout(function () {
        applyingRemote = false;
      }, 300);
    }
  });
  wireMedia();
  window.addEventListener("load", wireMedia);
  window.addEventListener("keydown", retryBlockedPlays, true);
  window.addEventListener("pointerdown", retryBlockedPlays, true);
  setInterval(wireMedia, 1000);
})();
```

### 自定义媒体可视化器

对于波形、节拍网格、canvas 或时间线播放器，把视觉状态接到原生媒体元素上。这样原生控件、自定义控件、演讲者同步、离开幻灯片时的清理和全局静音都走同一条事件路径。

```js
function wireMediaDrivenVisualizer(media, renderFrame, fireCrossedEvents) {
  var mediaFrame = 0;
  var lastTime = media.currentTime || 0;

  function update() {
    var time = media.currentTime || 0;
    if (Math.abs(time - lastTime) < 1.5 && time >= lastTime) {
      fireCrossedEvents(lastTime, time);
    }
    lastTime = time;
    renderFrame(time, media);
  }

  function start() {
    if (!media.requestVideoFrameCallback || mediaFrame) return;
    mediaFrame = media.requestVideoFrameCallback(function () {
      mediaFrame = 0;
      update();
      if (!media.paused && !media.ended) start();
    });
  }

  media.addEventListener("play", start);
  media.addEventListener("playing", start);
  media.addEventListener("pause", update);
  media.addEventListener("ended", update);
  media.addEventListener("timeupdate", update);
  media.addEventListener("seeking", function () {
    lastTime = media.currentTime || 0;
    renderFrame(lastTime, media);
  });
  media.addEventListener("seeked", update);
  media.addEventListener("ratechange", update);
  media.addEventListener("volumechange", update);
  renderFrame(media.currentTime || 0, media);
}
```

不要在 composition 内部用 `requestAnimationFrame` 做媒体同步；composition 的 lint 会拒绝基于挂钟时间的循环。想要与视频绑定的平滑更新，优先用 `HTMLVideoElement.requestVideoFrameCallback()`，并依靠原生的 `timeupdate`/seek 事件作为兜底。

使用一个专用的接线标记，比如 `data-media-sync-wired`。不要把 `data-wired` 这样的标记同时用来表示「时间线 DOM 已经渲染」和「媒体事件监听器已经挂上」；否则预先渲染好的时间线 HTML 会跳过监听器的设置。

### 可编辑的演讲者备注

共享的 `<hyperframes-slideshow>` 演讲者界面已经把演讲者备注渲染成一个可编辑的 textarea，并把编辑内容存进 `localStorage`。有共享播放器可用时，不要添加 deck 专属的备注编辑器。

对于无法使用共享演讲者界面的过渡期自定义包装器，严格使用下面这份确定性的存储约定，以便备注能干净地迁移：

```js
const NOTES_STORAGE_PREFIX = "hf-slideshow:presenter-notes:v1:";

function notesDeckKey(slideshowEl) {
  const explicit = slideshowEl.getAttribute("notes-storage-key");
  if (explicit && explicit.trim()) return explicit.trim();

  const playerSrc = slideshowEl.querySelector("hyperframes-player")?.getAttribute("src") || "";
  let resolvedPlayerSrc = playerSrc;
  try {
    resolvedPlayerSrc = new URL(playerSrc, location.href).href;
  } catch {}

  return `${location.origin}${location.pathname}|${document.title}|${resolvedPlayerSrc}`;
}

function notesStorageKey(slideshowEl, position, slide) {
  return `${NOTES_STORAGE_PREFIX}${JSON.stringify([
    notesDeckKey(slideshowEl),
    position.sequenceId,
    position.slideIndex,
    slide.sceneId || "",
  ])}`;
}

function readPresenterNotes(slideshowEl, position, slide) {
  const key = notesStorageKey(slideshowEl, position, slide);
  try {
    const stored = localStorage.getItem(key);
    return stored == null ? slide.notes || "" : stored;
  } catch {
    return slide.notes || "";
  }
}

function wirePresenterNotes(textarea, slideshowEl, position, slide) {
  const key = notesStorageKey(slideshowEl, position, slide);
  textarea.value = readPresenterNotes(slideshowEl, position, slide);
  textarea.addEventListener("input", function () {
    try {
      localStorage.setItem(key, textarea.value);
    } catch {}
  });
}
```

清空 textarea 时必须保存一个空字符串，而不是删除本地值，因为演讲者可能有意在自己这一场里把某条 manifest 备注清空。当独立演示有一个稳定的项目 id 时，在 `<hyperframes-slideshow>` 上使用 `notes-storage-key="stable-deck-id"`；否则兜底的 key 会按页面、标题和播放器 `src` 来隔离。

---

## 3. 由播放头驱动的场景可见性

没有引擎时，场景由一个 `root` GSAP timeline 驱动，这个 timeline 由 composition 按自己的时钟管理。可见性控制器通过该 timeline 的 `onUpdate` 回调读取 `window.__timelines.root.time()`，并相应地设置 `opacity`。只有当前场景可见。

关键之处：如果你想在场景后面放一个 Three.js canvas，场景背景必须是 `transparent`（而不是不透明的）；视觉上的底色由 body/html 背景和场景的内联 `background` 来设置。

对于转换过来的源页面，尽可能贴近地保留原页面的视觉设计、动效语言、交互行为、媒体行为和演示用的交互功能。尽可能精确地移植源页面特有的组件：自定义 canvas 播放器、波形 / 时间线装饰、扩散圆环、播放头、hover 状态和事件接线都是源素材，不是可有可无的润色。还要审查非典型的页面移动：随滚动推进的镜头、视差、固定分区、横向滚动区、分区吸附、平移 / 缩放的世界图层，或缩放到元素的导航。滚动往往是源页面的转场触发器，所以要提取滚动进度节点、easing 和镜头 / 焦点状态，然后通过 timeline 位置、fragment 或可复用的 harness 钩子，把这段动效重新挂到 slideshow 导航上。不要在幻灯片内部重现浏览器字面意义上的页面向下滚动动作；把它转译成镜头从一个焦点区域移动 / 缩放到下一个焦点区域。如果同样的机械行为在多个 deck 里都出现，就把它挪进播放器或这个 harness，而不是复制一段脆弱的一次性脚本。

### 转换页面的导航镜头转场

当源页面用滚动来移动一个平移 / 缩放的世界时，slideshow 导航通常会直接 seek 到每张幻灯片的停留帧。这次 seek 绕过了场景边界附近 timeline 内的任何插值，所以一个 deck 即使算出了正确的镜头位置，看起来仍然会跳变。为手动切换幻灯片添加一个显式的独立导航转场，同时让普通的 HyperFrames timeline seek 保持静态且确定。

这个模式只用于直接打开 / 演讲者模式的 slideshow UI。渲染视频输出时不要依赖 CSS transition；渲染出来的 composition 在 seek 到单独一帧时也必须是正确的。

```css
#world {
  transform-origin: 0 0;
  will-change: transform;
  transition:
    transform 760ms cubic-bezier(0.22, 1, 0.36, 1),
    opacity 0.3s ease;
}

#world.hf-camera-static {
  transition: opacity 0.3s ease;
}
```

```js
var currentCamera = null;
var currentSlideIndex = null;

function cameraTransform(cam) {
  return "translate(" + cam.tx + "px," + cam.ty + "px) scale(" + cam.s + ")";
}

function setWorldCamera(world, cam, animate) {
  if (!cam) return;
  if (!animate) world.classList.add("hf-camera-static");
  world.style.transform = cameraTransform(cam);
  world.style.opacity = "1";
  if (!animate) {
    world.getBoundingClientRect();
    world.classList.remove("hf-camera-static");
  }
  currentCamera = cam;
}

function slideIndexAtTime(t, slideDuration, slideCount) {
  return Math.max(0, Math.min(slideCount - 1, Math.floor(t / slideDuration)));
}

function updateCameraForTime(t, opts) {
  var nextSlideIndex = slideIndexAtTime(t, SLIDE_DURATION, SLIDES.length);
  var jumpedBetweenSlides =
    currentSlideIndex !== null &&
    nextSlideIndex !== currentSlideIndex &&
    Math.abs(t - lastTime) > 1.2;
  var animateCamera = Boolean(
    window.__hfCameraTransitionsEnabled && jumpedBetweenSlides && !(opts && opts.staticCamera),
  );
  var cam = cameraAtTime(t);
  setWorldCamera(world, cam, animateCamera);
  currentSlideIndex = nextSlideIndex;
}
```

测量期间，用 `hf-camera-static` 临时去掉 transform，计算所有元素的合并矩形，然后不带动画地恢复 `currentCamera`。在初次加载、resize 以及校验式的 seek 时，调用 `updateCameraForTime(t, { staticCamera: true })`。在独立包装器里，等播放器 iframe 可用后，设置 `iframe.contentWindow.__hfCameraTransitionsEnabled = true`。这样导出的 composition 保持可 seek，同时让演讲者导航能在各焦点之间平滑滑行。

校验之前，先解析好源页面的字体变量。HyperFrames lint 接受具体的通用字体栈，比如 `system-ui, sans-serif` 和 `ui-monospace, monospace`，或指向本地字体文件的真实 `@font-face` 声明。它不接受把 `font-family: var(--f-body)` / `var(--f-mono)` 当作渲染安全的字体族。

```html
<!-- In index.html (composition) -->

<!-- Shared scene CSS — all scenes start hidden -->
<style>
  .scene-frame {
    position: absolute;
    top: 0;
    left: 0;
    width: 1920px;
    height: 1080px;
    overflow: hidden;
    opacity: 0; /* hidden at rest — visibility controller shows the active one */
    visibility: hidden; /* opacity:0 alone still lets invisible frames block clicks */
    pointer-events: none; /* inactive scenes must not swallow events */
  }
</style>

<!--
  content-visible-at-rest: mark the first scene's elements with their
  final non-hidden state so the deck is not blank before the controller
  fires. The controller calls updateVisibility(0) synchronously on load.

  If using Three.js canvas behind scenes, set background: transparent
  here and let the 3D canvas + body color supply the fill.
-->
<div
  id="scene-cover"
  class="scene-frame clip"
  data-composition-id="cover"
  data-start="0"
  data-duration="9"
  style="background: transparent"
>
  <!-- content here -->
</div>

<div
  id="scene-problem"
  class="scene-frame clip"
  data-composition-id="problem"
  data-start="9"
  data-duration="9"
  style="background: transparent"
>
  <!-- content here -->
</div>

<!-- Root timeline — spans the full composition duration -->
<script>
  (function () {
    window.__timelines = window.__timelines || {};
    var tl = gsap.timeline({ paused: true });
    // A single to() for the full duration establishes the seekable range
    tl.to({}, { duration: 108 }); // replace 108 with your total seconds
    window.__timelines["root"] = tl;
  })();
</script>

<!-- Visibility controller -->
<script>
  (function () {
    var scenes = [
      { id: "scene-cover", start: 0, end: 9 },
      { id: "scene-problem", start: 9, end: 18 },
      // ... all scenes including branch scenes
    ];

    var lastActiveId = null;

    function updateVisibility(t) {
      for (var i = 0; i < scenes.length; i++) {
        var s = scenes[i];
        var el = document.getElementById(s.id);
        if (!el) continue;
        var active = t >= s.start && t < s.end;
        el.style.opacity = active ? "1" : "0";
        el.style.visibility = active ? "visible" : "hidden";
        el.style.pointerEvents = active ? "auto" : "none";

        if (active && lastActiveId !== s.id) {
          lastActiveId = s.id;
          fireEntrance(el); // see Section 4
        }
      }
      // fragment reveals here — see Section 4
    }

    window.__hfSetTime = updateVisibility;

    // Show first slide immediately — avoids blank on load
    updateVisibility(0);

    // Hook the root timeline so every seek drives visibility
    var root = window.__timelines && window.__timelines["root"];
    if (root) {
      root.eventCallback("onUpdate", function () {
        updateVisibility(root.time());
      });
    }
  })();
</script>
```

---

## 4. 幻灯片激活时的命令式入场

引擎托管路径会逐帧驱动 GSAP 的 seek timeline。没有它，seek timeline 上的 tween 永远不会触发。作为替代，每当一个场景变为激活状态，就触发命令式的 `gsap.from()` 调用 —— 它们运行在 GSAP 自己的 ticker 上，与任何播放头都无关。

fragment 揭示采用「播放头越过」的方式：可见性控制器检查播放头是否已经越过每个 fragment 的停留时间，并在第一次越过时触发动画。把 fragment 的停留时间集中放在场景起点附近（场景开始后的前 300–500 ms 内），这样连续按 ArrowRight 时感觉像是干脆利落的依次揭示，而不是漫长的等待。

```js
// --- Entrance animations ---

function fireEntrance(sceneEl) {
  // [data-anim] marks elements that should entrance on slide-activate.
  // Add data-anim to eyebrows, headlines, subheads, and card grids.
  var animEls = sceneEl.querySelectorAll("[data-anim]");
  if (!animEls.length) return;
  gsap.from(animEls, {
    opacity: 0,
    y: 28,
    duration: 0.4,
    stagger: 0.07,
    ease: "power2.out",
    overwrite: true, // cancel any in-flight animation on rapid slide changes
  });
}

// --- Fragment reveals ---

// Fragment config: times in absolute composition timeline seconds,
// bunched near the scene start for snappy successive reveals.
var fragments = [
  { time: 9.3, id: "prob-item1", revealed: false },
  { time: 9.6, id: "prob-item2", revealed: false },
];

function revealFragment(id) {
  var el = document.getElementById(id);
  if (!el) return;
  gsap.fromTo(
    el,
    { opacity: 0, x: -24 },
    { opacity: 1, x: 0, duration: 0.35, ease: "power2.out", overwrite: true },
  );
}

// Inside updateVisibility(t):
for (var f = 0; f < fragments.length; f++) {
  if (!fragments[f].revealed && t >= fragments[f].time) {
    fragments[f].revealed = true;
    revealFragment(fragments[f].id);
  }
}

// On problem scene re-entry, reset all fragment states:
if (active && lastActiveId !== s.id && s.id === "scene-problem") {
  for (var f = 0; f < fragments.length; f++) {
    fragments[f].revealed = false;
    var pEl = document.getElementById(fragments[f].id);
    if (pEl) gsap.set(pEl, { opacity: 0, clearProps: "transform" });
  }
}
```

fragment 元素在 CSS 中以 `opacity: 0` 起始。由可见性控制器揭示它们；在越过之前，入场驱动器不碰它们。

---

## 5. 场景引导的 postMessage

`<hyperframes-slideshow>` 必须知道每个场景的时间范围，才能把 `sceneId` 映射到播放头位置。没有引擎在运行时注入这些信息，composition 就必须在加载后手动发送它。

从 composition（index.html）发送 manifest，而不是从父级包装器发送：

```js
// In index.html — post after a brief delay so the parent frame has settled
(function () {
  var FPS = 30;
  var totalSeconds = 108; // match your composition's data-duration
  var totalFrames = totalSeconds * FPS;

  var scenes = [
    // EVERY scene — including branch scenes — must appear here.
    // id must match data-composition-id; start/duration in seconds.
    { id: "cover", start: 0, duration: 9 },
    { id: "problem", start: 9, duration: 9 },
    { id: "solution", start: 18, duration: 9 },
    // ... all main-line scenes ...
    // branch scene — listed last, NOT in main slides array in the island
    { id: "market-sizing", start: 99, duration: 9 },
  ];

  function postTimeline() {
    parent.postMessage(
      {
        source: "hf-preview",
        type: "timeline",
        durationInFrames: totalFrames,
        scenes: scenes,
      },
      "*",
    );
  }

  // ~300ms delay after load to let the parent settle
  if (document.readyState === "complete") {
    setTimeout(postTimeline, 300);
  } else {
    window.addEventListener("load", function () {
      setTimeout(postTimeline, 300);
    });
  }
})();
```

在这份 manifest 里漏掉任何场景（包括分支场景），都意味着 slideshow 组件无法 seek 到它。把 HTML 里声明的每个场景都包含进来，即使是只能通过热点到达的场景。

---

## 6. 音频 / 音效（SFX）—— 通过 `<hyperframes-slideshow sound>` 使用内置静音控件

包装器自有的音效（SFX）应当放在父页面里。浏览器对 AudioContext 和 HTMLAudioElement.play() 强制要求用户激活 —— 一个没有自己激活的 iframe（即用户从未在其中点击过）常常会被自动播放策略拦截。用户的按键落在父页面上，所以父页面才是播放点击 / 转场音效的可靠框架。

普通的幻灯片媒体应当留在 composition 里。slideshow 播放器现在会在幻灯片 / 序列切换时调用 `hyperframes-player.stopMedia()`，自动停止幻灯片媒体，它会暂停 iframe 里的 `<video>` / `<audio>`、运行时的 WebAudio，以及从 iframe 媒体接管过来的父页面代理。同一张幻灯片内的 fragment 揭示不会停止媒体，而 `audio-src` 这类全局 / deck 级别的父页面音频也不会被动到。不要为普通的视频 / 音频播放器手写逐张幻灯片的清理脚本。

每个复制过来、带 `src` 的 `<video>` / `<audio>`，都必须加上时间属性，交由 HyperFrames 管理：

```html
<video
  src="assets/demo.mp4"
  controls
  playsinline
  preload="metadata"
  data-start="0"
  data-duration="96"
  data-has-audio="true"
></video>
```

只有有声媒体才使用 `data-has-audio="true"`。静音的自动播放循环可以省略它。不要在转换后的 composition 里保留 `preload="none"`。

实现细节：iframe 中的媒体元素属于 iframe 的 DOM realm。父页面 / 播放器里的兜底代码不能对 iframe 节点使用父页面的 `el instanceof HTMLMediaElement` 检测；在真实浏览器里这个检测会失败，导致视频仍然有声音。在设置 `muted` 或调用 `pause()` 之前，使用 `el.ownerDocument.defaultView.HTMLMediaElement`，或者一个标签名 / 鸭子类型守卫。

### 静音开关 —— 内置的界面控件

在 demo.html 里给 `<hyperframes-slideshow>` 加上 `sound` 布尔属性。组件会把一个扬声器 / 扬声器静音的 SVG 按钮渲染为**导航胶囊条里最左边的一项**，样式与 prev/next 幽灵按钮完全一致。composition 里不再另设静音按钮。

```html
<hyperframes-slideshow tabindex="0" sound style="..."> ... </hyperframes-slideshow>
```

该组件：

- 跟踪 `muted` 状态（默认 `false`）；暴露一个 `muted` getter
- 静音时在宿主元素上反映为 `data-hf-muted` 属性
- 把静音全局应用到子 `<hyperframes-player>` 的媒体以及顶层页面的 `<audio>` / `<video>` 元素上
- 每次切换时派发 `CustomEvent("hf-sound", { detail: { muted }, bubbles: true, composed: true })`
- 变更之后在浏览器中检查实际的 iframe 媒体状态；点击导航栏静音按钮后，composition 里的每个 `<video>` / `<audio>` 都应报告 `muted: true`

包装器自有的 `new Audio(...)` 对象没有挂到 DOM 上，所以父页面的音频播放器必须把 `hf-sound` 事件镜像到每个 clip 上：

```js
var muted = false;
var slideshow = document.querySelector("hyperframes-slideshow");
if (slideshow) {
  slideshow.addEventListener("hf-sound", function (e) {
    muted = e.detail && e.detail.muted === true;
    Object.keys(clips).forEach(function (name) {
      clips[name].muted = muted;
    });
  });
}
// In message handler:
if (muted) return; // skip play
```

如果 `<hyperframes-slideshow>` 上**没有** `sound`（没有音频的 deck），静音控件会被隐藏 —— 胶囊条里只显示导航。

### Composition：无条件地发送音效提示

composition **无条件地**发送 sfx 提示 —— 它不跟踪静音状态。由父页面根据 `muted` 来把关：

**在 composition（index.html）中：**

```js
// Post an sfx cue at transition points — unconditionally.
// The parent audio player gates on the slideshow component's mute state.
function playSfx(name) {
  try {
    parent.postMessage({ type: "hf-sfx", name: name }, "*");
  } catch (e) {}
}

// Fire at scene transitions:
//   playSfx("advance")      — moving to the next main-line slide
//   playSfx("back")         — returning from a branch
//   playSfx("branch-enter") — entering a branch
//   playSfx("fragment")     — a fragment item is revealed
```

**不要**在 composition 里添加静音按钮。`#sfx-mute` 珊瑚色按钮的模式已被移除；静音由父页面界面中的导航胶囊条负责。

**在父页面（demo.html）中：**

```html
<script>
  (function () {
    // Audio elements are preloaded here, in the frame that receives user gestures.
    var clips = {
      advance: new Audio("sfx/advance.mp3"),
      fragment: new Audio("sfx/fragment.mp3"),
      "branch-enter": new Audio("sfx/branch-enter.mp3"),
      back: new Audio("sfx/back.mp3"),
    };
    clips.advance.volume = 0.45;
    clips.fragment.volume = 0.4;
    clips["branch-enter"].volume = 0.4;
    clips.back.volume = 0.4;
    Object.keys(clips).forEach(function (k) {
      clips[k].preload = "auto";
    });

    // Track mute state from the slideshow component's hf-sound event.
    var muted = false;
    var slideshow = document.querySelector("hyperframes-slideshow");
    if (slideshow) {
      slideshow.addEventListener("hf-sound", function (e) {
        muted = e.detail && e.detail.muted === true;
      });
    }

    var unlocked = false;

    function unlock() {
      if (unlocked) return;
      unlocked = true;
      // Prime wrapper-owned SFX clips: play muted then immediately pause/reset.
      // This moves the clip into the "allowed" state so later plays are instant.
      Object.keys(clips).forEach(function (name) {
        var el = clips[name];
        var v = el.volume;
        el.volume = 0;
        el.play()
          .then(function () {
            el.pause();
            el.currentTime = 0;
            el.volume = v;
          })
          .catch(function () {
            el.volume = v;
          });
      });
    }

    // Unlock on the first user gesture in the parent frame.
    window.addEventListener("keydown", unlock, true);
    window.addEventListener("pointerdown", unlock, true);
    window.addEventListener("click", unlock, true);

    window.addEventListener("message", function (e) {
      var d = e.data;
      if (!d || d.type !== "hf-sfx") return;
      // Gate on mute state — the component owns this.
      if (muted) return;
      var el = clips[d.name];
      if (!el || !unlocked) return;
      try {
        el.currentTime = 0;
        el.play().catch(function () {});
      } catch (err) {}
    });
  })();
</script>
```

**获取音效（SFX）文件：** 使用 HeyGen MCP 的 `search_audio_sounds` 工具，参数 `type=sound_effects`，关键词如 "whoosh"、"click"、"transition"。把结果下载到 `demo.html` 旁边的本地 `sfx/` 目录，并通过相对路径引用。不要在渲染时获取音效 —— HyperFrames 的确定性规则禁止运行时网络请求；预先下载并提交它们。

---

## 7. Three.js（可选）

在幻灯片后面加一个 Three.js 场景，提供氛围性的动态。关键规则：

- **自己的 rAF 循环** —— 不要接入 HF 的 seek timeline。Three.js 运行自己的 `requestAnimationFrame` 循环，与播放头位置无关。
- **一个常驻 canvas** —— canvas 只创建一次；按场景就地更新几何体 / 材质。
- **给渲染器创建加守卫** —— WebGL 可能不可用（软件 GL 环境、某些 CI 环境）。在 try/catch 里只创建一次渲染器；如果失败，隐藏 canvas 并暴露空操作的桩函数。不要刷屏 `console.error` —— 创建期间让它静默，并在 `finally` 里恢复。
- **满幅出血，位于内容之后** —— 把 canvas 固定在 `z-index: 0`、`pointer-events: none`，放在 `z-index: 1` 的场景画框后面。
- **透明的场景画框** —— 把场景背景设为 `transparent`，让 3D canvas 透出来。在文字容器上（而不是场景画框本身上）使用一个 radial-gradient 遮罩，在保证文字可读的同时让 3D 在边缘处显露。
- **暴露一个氛围钩子** —— 导出 `window.__threeApplyMood(sceneKey)`，这样当前场景变化时，可见性控制器可以切换粒子颜色、开关子对象，或改变清屏颜色。

```js
// In index.html — Three.js setup (module script)
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

var canvas = document.getElementById("three-canvas");
var renderer = null;
var _err = console.error;
console.error = function () {}; // silence THREE's multi-line GPU error during init
try {
  renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
} catch (e) {
  // renderer stays null
} finally {
  console.error = _err;
}

if (!renderer) {
  // Graceful degradation — branded layout is the fallback.
  canvas.style.display = "none";
  window.__threeApplyMood = function () {};
  // Do NOT start the rAF loop.
} else {
  renderer.setSize(1920, 1080);
  renderer.setPixelRatio(1);
  canvas.style.cssText =
    "position:fixed;top:0;left:0;width:1920px;height:1080px;z-index:0;pointer-events:none";

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(60, 1920 / 1080, 0.1, 1000);
  camera.position.set(0, 0, 5);

  // --- build your particle system, meshes, etc. here ---

  // Mood config: map sceneId → visual state (colors, sub-object visibility, bg color)
  var MOODS = {
    cover: {
      /* particle color, opacity, bg ... */
    },
    problem: {
      /* ... */
    },
    // one entry per scene key
  };

  window.__threeApplyMood = function (sceneKey) {
    var m = MOODS[sceneKey] || MOODS["cover"];
    // update geometry attributes, material opacity, sub-group visibility, etc.
  };
  window.__threeApplyMood("cover"); // apply initial state

  // --- own rAF loop ---
  var lastTime = null;
  function animate(ts) {
    requestAnimationFrame(animate);
    if (lastTime === null) lastTime = ts;
    var dt = Math.min((ts - lastTime) / 1000, 0.05);
    lastTime = ts;
    // update particles, rotate objects, etc.
    renderer.render(scene, camera);
  }
  requestAnimationFrame(animate);
}
```

**透明场景画框 + 遮罩的 CSS：**

```css
/* Three.js canvas — always behind everything */
#three-canvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 1920px;
  height: 1080px;
  z-index: 0;
  pointer-events: none;
}

/* Scene frames are transparent so the 3D canvas shows through */
.scene-frame {
  position: absolute;
  top: 0;
  left: 0;
  width: 1920px;
  height: 1080px;
  background: transparent; /* NOT opaque — 3D would be occluded */
  z-index: 1;
}

/* Scrim on the TEXT container — not the scene frame.
   Radial gradient: opaque in the center where text is, transparent at edges
   so 3D shows in the whitespace margins. */
.slide-inner.scrim-light {
  background: radial-gradient(
    ellipse 75% 80% at 50% 50%,
    rgba(255, 255, 255, 0.88) 30%,
    rgba(255, 255, 255, 0.6) 65%,
    rgba(255, 255, 255, 0) 100%
  );
}
```

---

## 8. 踩坑清单

| 故障 | 症状 | 一行修复 |
| --- | --- | --- |
| island 没有在包装器里复制一份 | slideshow 界面从不渲染；没有幻灯片计数器，没有 prev/next | 把 `<script type="application/hyperframes-slideshow+json">` 块原封不动地复制到 demo.html 中的 `<hyperframes-slideshow>` 元素里 |
| 包装器音效放在了 iframe 里 | 点击 / 转场音效没有声音 | 把音效 Audio 元素和解锁逻辑移到 demo.html；从 index.html 发送 `{type:'hf-sfx',name}` |
| composition 里没有自带时钟 | 所有场景画框叠在一起 / 加载时显示了错误的幻灯片 | 按第 3 节所示，添加根 GSAP timeline（`window.__timelines["root"]`）和 `onUpdate` 可见性控制器 |
| 没有引擎时内容是 opacity:0 | 空白幻灯片 —— `[data-anim]` 元素在静止时不可见 | 定义完控制器后同步调用 `updateVisibility(0)`，让第一张幻灯片立即显示 |
| keydown 绑在了没有焦点的元素上 | ArrowLeft/Right 失灵 | 给 `<hyperframes-slideshow>` 加上 `tabindex="0"`，让它能接收键盘焦点 |
| 不透明的场景背景遮挡了 Three.js canvas | 3D 始终不可见 | 在 `.scene-frame` 上设置 `background: transparent`；改把视觉底色放在文字遮罩容器上 |
| 在 headless 环境中创建 WebGL 渲染器时刷屏报错 | 控制台噪音，rAF 循环照样启动 | 在 `new THREE.WebGLRenderer(...)` 期间静默 `console.error`，在 `finally` 里恢复，并以 `renderer !== null` 为条件守卫 rAF 的启动 |
| 分支场景没有出现在 postMessage manifest 里 | 热点能导航过去，但幻灯片是空白的 | 把每个场景 —— 主线和分支 —— 都放进 `postTimeline()` 消息的 `scenes` 数组 |
| 导航胶囊条区域内有醒目的 3D / 内容 | 明亮元素渗到导航药丸条的后面 / 旁边 | 让右下角约 360×140px 的区域保持空白；对任何 3D 氛围在那个角落偏亮的幻灯片，添加一个与背景匹配的渐变 overlay |
| 自定义媒体可视化器使用自己的计时器 | canvas / 播放头与实际视频或原生控件发生漂移 | 根据媒体事件和 `media.currentTime` 驱动视觉状态；不要使用独立的 `setTimeout` 时钟 |
| 一个 `data-wired` 标志表示两件不同的事 | 预先渲染的时间线 HTML 跳过了媒体监听器的设置 | 使用分开的标记，比如 `data-timeline-rendered` 和 `data-media-sync-wired` |
| 演讲者的媒体事件没有被桥接 | 观众端跟着翻幻灯片，但不跟随播放 / 暂停 / seek / 静音 | 在带交互式媒体的独立包装器里，通过 `BroadcastChannel("hf-slideshow:" + location.pathname)` 镜像原生媒体事件 |
| 观众窗口中的远端播放被拦截 | 观众端媒体时间在跳，但视频始终不播放 | 先尝试静音播放；如果 `media.play()` 被拒绝，显示一个观众端解锁按钮，并在播放成功之前忽略实时的 `timeupdate` 追赶 |
| 观众端的静音自动播放把事件回传给了演讲者 | 演讲者端音频开始播放，随后被静音或中断 | 只在演讲者模式下发布媒体事件；观众端静音只是本地针对浏览器自动播放策略的变通，不是共享的媒体状态 |
| 复制过来的媒体缺少 HyperFrames 时间属性 | 未定时媒体触发 lint 错误；预览与渲染结果不一致 | 添加 `data-start`、`data-duration`，有声时再加 `data-has-audio="true"`；避免 `preload="none"` |
| 源页面字体的 CSS 变量被保留为 font-family 的值 | StaticGuard 的 font-family 约定报错 | 替换成具体的渲染安全字体栈，或添加本地 `@font-face` 声明 |
| 转换过来的滚动 / 镜头式源页面在幻灯片之间跳变 | 每张幻灯片的焦点都对，但手动导航时会猛地跳过去 | 添加一个独立的导航镜头转场钩子；在测量、初次加载、resize 以及渲染 / 校验 seek 时禁用它 |
