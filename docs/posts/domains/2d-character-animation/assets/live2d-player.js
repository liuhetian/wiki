(async function () {
  'use strict';
  const $ = id => document.getElementById(id);
  const base = new URL('dafeiyu/', location.href);
  const read = async name => {
    const response = await fetch(new URL(name, base));
    if (!response.ok) throw new Error(name + ': HTTP ' + response.status);
    return response.json();
  };
  try {
    if (!window.Live2DCubismCore || !window.PIXI?.live2d) throw new Error('Live2D 运行库未加载');
    const manifestName = 'deepseek-maid-joints.model3.json';
    const manifest = await read(manifestName), refs = manifest.FileReferences;
    const [motionEntries, expressionEntries] = await Promise.all([
      Promise.all(Object.entries(refs.Motions).map(async ([name, entries]) => [name, Live2DMotion.compile(await read(entries[0].File))])),
      Promise.all(refs.Expressions.map(async entry => [entry.Name, await read(entry.File)])),
    ]);
    const motions = new Map(motionEntries), expressions = new Map(expressionEntries);
    const app = new PIXI.Application({view: $('canvas'), autoStart: false, backgroundAlpha: 0, antialias: true, resolution: Math.min(devicePixelRatio || 1, 2), autoDensity: true});
    const model = await PIXI.live2d.Live2DModel.from(new URL(manifestName, base).href, {autoUpdate: false, autoInteract: false, motionPreload: 'NONE'});
    app.stage.addChild(model);
    const internal = model.internalModel, core = internal.coreModel, raw = core._model;
    const indices = new Map(Array.from(raw.parameters.ids, (id, i) => [id, i]));
    const meshCanvas = $('mesh'), ctx = meshCanvas.getContext('2d');
    let animation = 'Idle', time = 0, playing = true, manual = false, speed = 1, expression = '';
    let wireframe = false, frame = 0, previous = 0, raf = 0, inView = true;
    const overrides = new Map(), controls = new Map();
    const motionLabels = {Idle:'悠闲待机', Blink:'眨眼', Nod:'点头', Shake:'摇头', TailSwing:'摆尾巴', Shy:'害羞', Wave:'挥手', HeadTilt:'歪头', Cheer:'欢呼', Sway:'身体摇摆', EarTwitch:'动耳朵'};
    const expressionLabels = {Smile:'微笑', Sad:'难过', Angry:'生气', Surprised:'惊讶'};
    const parameterLabels = {ParamAngleX:'左右转头',ParamAngleY:'上下转头',ParamAngleZ:'歪头',ParamEyeLOpen:'左眼开合',ParamEyeROpen:'右眼开合',ParamMouthOpenY:'嘴巴开合',ParamMouthForm:'嘴型',ParamEarL:'左耳',ParamEarR:'右耳',ParamTail1:'尾巴',ParamSkelTailSwing:'尾巴摆动',ParamEyeBallX:'视线左右',ParamEyeBallY:'视线上下',ParamBodyAngleX:'身体左右',ParamBodyAngleY:'身体上下',ParamBodyAngleZ:'身体倾斜',ParamBreath:'呼吸',ParamArmRA:'右上臂',ParamArmRB:'右前臂',ParamArmLA:'左上臂',ParamArmLB:'左前臂'};
    const primary = new Set(['ParamAngleX','ParamAngleY','ParamEyeLOpen','ParamEyeROpen','ParamMouthOpenY']);
    function setPlaying(value) {playing = value; previous = 0; $('play').textContent = value ? '暂停' : '播放'; schedule();}
    function syncButtons() {
      document.querySelectorAll('[data-motion]').forEach(b => {const active = !manual && b.dataset.motion === animation; b.classList.toggle('active', active); b.setAttribute('aria-pressed', String(active));});
    }
    function select(name) {animation = name; time = 0; manual = false; overrides.clear(); syncButtons(); setPlaying(true);}
    function pose(delta) {
      raw.parameters.values.set(raw.parameters.defaultValues);
      if (!manual) Live2DMotion.apply(raw, motions.get(animation), time, indices);
      const exp = expressions.get(expression);
      if (exp) for (const p of exp.Parameters) {
        const i = indices.get(p.Id); if (i === undefined) continue;
        if (p.Blend === 'Multiply') raw.parameters.values[i] *= p.Value;
        else if (p.Blend === 'Overwrite') raw.parameters.values[i] = p.Value;
        else raw.parameters.values[i] += p.Value;
      }
      if (!manual && delta > 0 && internal.physics) internal.physics.evaluate(core, delta);
      for (const [id, v] of overrides) raw.parameters.values[indices.get(id)] = v;
      for (let i = 0; i < raw.parameters.count; i++) raw.parameters.values[i] = Math.max(raw.parameters.minimumValues[i], Math.min(raw.parameters.maximumValues[i], raw.parameters.values[i]));
      core.update();
    }
    function mesh() {
      ctx.clearRect(0, 0, meshCanvas.width, meshCanvas.height);
      if (!wireframe) return;
      ctx.lineWidth = .55; ctx.strokeStyle = 'rgba(52,158,198,.65)';
      const ppu = raw.canvasinfo.PixelsPerUnit, ox = raw.canvasinfo.CanvasOriginX, oy = raw.canvasinfo.CanvasOriginY;
      for (let d = 0; d < raw.drawables.count; d++) {
        if (raw.drawables.opacities[d] < .02) continue;
        const positions = raw.drawables.vertexPositions[d], triangles = raw.drawables.indices[d];
        ctx.beginPath();
        for (let t = 0; t < triangles.length; t += 3) {
          for (let k = 0; k < 3; k++) {
            const i = triangles[t + k] * 2;
            const local = internal.localTransform.apply(new PIXI.Point(positions[i] * ppu + ox, -positions[i + 1] * ppu + oy));
            const p = model.worldTransform.apply(local);
            if (k === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y);
          }
          ctx.closePath();
        }
        ctx.stroke();
      }
    }
    function draw(delta = 0) {
      pose(delta); app.renderer.render(app.stage); mesh(); frame++;
      const duration = motions.get(animation).duration;
      $('time').textContent = time.toFixed(2) + ' / ' + duration.toFixed(2) + ' s';
      $('timeline').value = time / duration * 1000;
      $('status').textContent = manual ? '参数调试' : playing ? motionLabels[animation] : '已暂停';
      for (const [id, field] of controls) {
        if (document.activeElement === field.input) continue;
        const v = raw.parameters.values[indices.get(id)]; field.input.value = v; field.output.textContent = v.toFixed(2);
      }
    }
    function tick(now) {
      // dt 只在 rAF 自己的时间戳之间算：rAF 的 now 是这一帧的起始时刻，主线程忙时 Chrome 会给出
      // 已经错过的 vsync 时刻，比上一帧回调里取的 performance.now() 还早，混用两个时钟会算出负 dt、
      // 时间倒走。previous 为 0 表示刚（重新）开始播放，这一帧不推进时间。
      raf = 0; const dt = previous ? Math.max(0, Math.min((now - previous) / 1000, .05)) * speed : 0; previous = now;
      if (playing && !manual) {
        const duration = motions.get(animation).duration;
        time += dt;
        if (time >= duration) {if ($('loop').checked) time %= duration; else {time = duration; setPlaying(false);}}
        draw(dt);
      }
      schedule();
    }
    function schedule() {if (!raf && playing && !manual && inView && !document.hidden) raf = requestAnimationFrame(tick);}
    function stop() {if (raf) {cancelAnimationFrame(raf); raf = 0;} previous = 0;}
    function fit() {
      const w = $('stage').clientWidth, h = $('stage').clientHeight;
      app.renderer.resize(w, h); meshCanvas.width = w; meshCanvas.height = h;
      model.anchor.set(.5, .5); model.scale.set(Math.min(w / internal.width, h / internal.height) * 1.08);
      model.position.set(w / 2, h * .53); draw();
    }
    for (const name of motions.keys()) {
      const button = document.createElement('button'); button.dataset.motion = name; button.textContent = motionLabels[name] || name; button.onclick = () => select(name); $('motions').append(button);
    }
    for (const name of expressions.keys()) {const option = document.createElement('option'); option.value = name; option.textContent = expressionLabels[name] || name; $('expression').append(option);}
    let advancedCount = 0;
    for (let i = 0; i < raw.parameters.count; i++) {
      const id = raw.parameters.ids[i], field = document.createElement('div'); field.className = 'field';
      const label = document.createElement('label'), text = document.createElement('span'), output = document.createElement('output'), input = document.createElement('input');
      input.id = 'parameter-' + id; label.htmlFor = input.id; text.textContent = parameterLabels[id] || id; label.title = id;
      input.type = 'range'; input.min = raw.parameters.minimumValues[i]; input.max = raw.parameters.maximumValues[i]; input.step = Math.max((+input.max - +input.min) / 500, .001); input.value = raw.parameters.defaultValues[i];
      output.textContent = (+input.value).toFixed(2); label.append(text, output); field.append(label, input); controls.set(id, {input, output});
      input.oninput = () => {manual = true; setPlaying(false); overrides.set(id, +input.value); output.textContent = (+input.value).toFixed(2); syncButtons(); draw();};
      if (primary.has(id)) $('parameters').append(field); else {$('advanced').append(field); advancedCount++;}
    }
    $('advanced-title').textContent = '更多参数（' + advancedCount + '）';
    $('play').onclick = () => {if (manual) {manual = false; overrides.clear(); syncButtons(); setPlaying(true);} else setPlaying(!playing);};
    $('reset').onclick = () => {expression = ''; $('expression').value = ''; select('Idle'); draw();};
    $('timeline').oninput = e => {manual = false; overrides.clear(); setPlaying(false); time = +e.target.value / 1000 * motions.get(animation).duration; syncButtons(); draw();};
    $('expression').onchange = e => {expression = e.target.value; draw();};
    $('wireframe').onchange = e => {wireframe = e.target.checked; draw();};
    $('speed').oninput = e => {speed = +e.target.value; $('speed-value').textContent = speed.toFixed(2) + '×';};
    document.querySelectorAll('[data-bg]').forEach(b => b.onclick = () => {
      const name = b.dataset.bg; $('stage').classList.toggle('checker', name === 'checker');
      $('stage').style.background = name === 'dark' ? '#252c3e' : name === 'light' ? 'radial-gradient(ellipse at 48% 40%,#fff,#e7edf8)' : '';
      document.querySelectorAll('[data-bg]').forEach(x => x.classList.toggle('active', x === b));
    });
    document.addEventListener('visibilitychange', () => {if (document.hidden) stop(); else schedule();});
    new IntersectionObserver(entries => {inView = entries[0].isIntersecting; if (!inView) stop(); else schedule();}).observe($('stage'));
    new ResizeObserver(fit).observe($('stage'));
    document.addEventListener('keydown', e => {if (e.code === 'Space' && !['INPUT','BUTTON','SELECT','SUMMARY'].includes(e.target.tagName)) {e.preventDefault(); $('play').click();}});
    $('stats').textContent = raw.parameters.count + ' 参数 · ' + motions.size + ' 动作';
    $('meta').textContent = raw.drawables.count + ' 个绘制部件 · ' + expressions.size + ' 个表情。动作和参数直接驱动 .moc3 模型；暂停或滚出视口后停止连续绘制。';
    window.live2dDemo = {ready:true, get frames(){return frame;}, sample(name, t){animation=name; time=t; manual=false; overrides.clear(); setPlaying(false); draw();}, model, raw};
    syncButtons(); fit(); schedule();
  } catch (error) {
    $('status').textContent = '加载失败'; $('error').textContent = '模型加载失败：' + error.message; console.error(error);
    window.live2dDemoError = String(error.stack || error);
  }
})();
