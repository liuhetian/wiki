(async function () {
  const $ = id => document.getElementById(id);
  try {
    const config = JSON.parse($('preview-config').textContent);
    if (!window.spine) throw new Error('Spine 运行库未加载，请检查本地 vendor 文件');
    async function loadText(path) {
      const response = await fetch(path);
      if (!response.ok) throw new Error(`素材加载失败：${path}（HTTP ${response.status}）`);
      return response.text();
    }
    const [jsonText, atlasText] = await Promise.all([
      loadText(config.skeleton), loadText(config.atlas)
    ]);
    const data = JSON.parse(jsonText);
    const image = new Image();
    image.src = config.texture;
    await image.decode();
    const canvas = $('canvas');
    const context = new spine.webgl.ManagedWebGLRenderingContext(canvas, {alpha: true, antialias: true, premultipliedAlpha: true});
    const gl = context.gl;
    if (!gl) throw new Error('浏览器不支持 WebGL');
    if (config.premultipliedAlpha) gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
    const renderer = new spine.webgl.SceneRenderer(canvas, context, true);
    const atlas = new spine.TextureAtlas(atlasText, () => new spine.webgl.GLTexture(context, image));
    const skeletonData = new spine.SkeletonJson(new spine.AtlasAttachmentLoader(atlas)).readSkeletonData(data);
    const skeleton = new spine.Skeleton(skeletonData);
    const stateData = new spine.AnimationStateData(skeletonData);
    stateData.defaultMix = 0.15;
    const state = new spine.AnimationState(stateData);
    const labels = {idle:'待机',run:'奔跑',atk1:'攻击 1',atk2:'攻击 2',atk3:'攻击 3',atk3_weapon:'攻击 3 · 武器特效',dead:'倒地',dizzy:'眩晕',hit:'受击',neardeath:'濒危',wait:'待机',wait1:'待机 1',wait2:'待机 2',wait3:'待机 3',wait4:'待机 4',smile1:'开心 1',smile2:'开心 2',smile3:'开心 3',shy1:'害羞 1',shy2:'害羞 2',anger1:'生气 1',anger2:'生气 2',anger3:'生气 3',sad1:'难过 1',sad2:'难过 2',surp1:'惊讶 1',surp2:'惊讶 2',think:'思考',hello:'打招呼',yes:'点头',yes2:'点头 2',no:'摇头',no2:'摇头 2',touch:'触摸反应',skill1:'技能动作',face_wait:'平静',face_smile:'微笑',face_smile2:'微笑 2',face_smile3:'微笑 3',face_shy:'害羞',face_sad:'难过',face_cry:'哭泣',face_surp:'惊讶',face_anger:'生气',face_anger2:'生气 2',face_close:'闭眼',face_close2:'闭眼 2',lip_smile:'微笑嘴型',lip_smile2:'微笑嘴型 2',lip_sad:'难过嘴型',lip_trouble:'困惑嘴型',lip_anger:'生气嘴型',lip_anger2:'生气嘴型 2'};
    for (const a of skeletonData.animations) {
      if (config.layers && (/^(face_|lip_|eye_)/.test(a.name) || a.name === 'blank')) continue;
      const option = document.createElement('option');
      option.value = a.name; option.textContent = `${labels[a.name] || a.name} / ${a.name}`;
      $('animation').append(option);
    }
    let playing = true, speed = 1, zoom = 1, flip = false, debug = false, frameCount = 0;
    let bounds = {x:0,y:0,width:350,height:300};
    const boundsCache = new Map();
    if (config.layers) {
      function addOption(id, name, label) {
        const option = document.createElement('option');
        option.value = name; option.textContent = label;
        $(id).append(option);
      }
      addOption('expression', '', '跟随身体动作');
      for (const a of skeletonData.animations) {
        if (a.name.startsWith('face_')) addOption('expression', a.name, `${labels[a.name] || a.name} / ${a.name}`);
        if (a.name.startsWith('lip_') && !/_s\d*$/.test(a.name) && a.duration > 0) addOption('mouth', a.name, `${labels[a.name] || a.name} / ${a.name}`);
      }
      $('mouth').value = skeletonData.findAnimation('lip_smile') ? 'lip_smile' : $('mouth').value;
      $('expression').onchange = () => applyFace();
      $('mouth').onchange = () => applyMouth();
      $('speaking').onchange = () => applyMouth();
      for (const [id, name] of [['nod', 'yes'], ['shake', 'no']]) {
        $(id).onclick = () => {
          const animation = skeletonData.findAnimation(name);
          if (!animation) return;
          state.setAnimation(2, name, false);
          state.addEmptyAnimation(2, 0.15, animation.duration);
        };
      }
    }
    function applyFace() {
      if (!config.layers) return;
      const face = $('expression').value;
      if (face) state.setAnimation(1, face, true);
      else state.setEmptyAnimation(1, 0.15);
    }
    function applyMouth() {
      if (!config.layers) return;
      const name = $('mouth').value;
      if (!name) return;
      const entry = state.setAnimation(5, name, $('speaking').checked);
      entry.mixDuration = 0.1;
      if (!$('speaking').checked) entry.animationEnd = 0;
    }
    function measure(name) {
      if (boundsCache.has(name)) return boundsCache.get(name);
      const probe = new spine.Skeleton(skeletonData);
      const ps = new spine.AnimationState(stateData);
      ps.setAnimation(0, name, false);
      const offset = new spine.Vector2(), size = new spine.Vector2();
      const duration = skeletonData.findAnimation(name).duration;
      let minX=Infinity,minY=Infinity,maxX=-Infinity,maxY=-Infinity;
      for (let i=0;i<=30;i++) {
        if (i) ps.update(duration/30);
        ps.apply(probe);probe.updateWorldTransform();probe.getBounds(offset,size,[]);
        if (Number.isFinite(offset.x) && size.x>0 && size.y>0) {
          minX=Math.min(minX,offset.x);minY=Math.min(minY,offset.y);
          maxX=Math.max(maxX,offset.x+size.x);maxY=Math.max(maxY,offset.y+size.y);
        }
      }
      const b = Number.isFinite(minX) ? {x:minX,y:minY,width:maxX-minX,height:maxY-minY} : bounds;
      boundsCache.set(name,b);return b;
    }
    function select(name) {
      skeleton.setToSetupPose();state.clearTracks();
      state.setAnimation(0,name,$('loop').checked);
      applyFace();applyMouth();state.apply(skeleton);skeleton.updateWorldTransform();
      bounds=measure(name);$('animation').value=name;
      $('current').textContent=name;updateTime();
    }
    function updateTime() {
      const entry=state.getCurrent(0);if (!entry) return;
      const duration=entry.animation.duration;
      const time=duration ? (entry.loop ? entry.trackTime % duration : Math.min(entry.trackTime,duration)) : 0;
      $('timeline').value=duration ? time/duration*1000 : 0;
      $('time').textContent=`${time.toFixed(2)} / ${duration.toFixed(2)} s`;
    }
    function playPause() {playing=!playing;$('play').textContent=playing?'暂停':'播放';$('play').setAttribute('aria-label',playing?'暂停动画':'播放动画');}
    $('play').onclick=playPause;
    $('restart').onclick=()=>select($('animation').value);
    $('animation').onchange=e=>select(e.target.value);
    $('loop').onchange=e=>{state.getCurrent(0).loop=e.target.checked;};
    $('speed').oninput=e=>{speed=Number(e.target.value);$('speed-value').textContent=speed.toFixed(2)+'×';};
    $('zoom').oninput=e=>{zoom=Number(e.target.value);$('zoom-value').textContent=zoom.toFixed(2)+'×';};
    $('flip').onchange=e=>{flip=e.target.checked;};
    $('bones').onchange=e=>{debug=e.target.checked;};
    $('timeline').oninput=e=>{
      const previous = state.getCurrent(0);
      const name = previous.animation.name;
      const time = Number(e.target.value) / 1000 * previous.animation.duration;
      skeleton.setToSetupPose(); state.clearTracks();
      const entry = state.setAnimation(0, name, $('loop').checked);
      entry.trackTime = time;
      applyFace(); applyMouth();
      state.apply(skeleton);skeleton.updateWorldTransform();updateTime();
    };
    document.querySelectorAll('[data-color]').forEach(button=>button.onclick=()=>{
      $('stage').style.backgroundColor=button.dataset.color;
      document.querySelectorAll('[data-color]').forEach(b=>b.classList.toggle('active',b===button));
    });
    document.addEventListener('keydown',e=>{if(e.code==='Space'&&!['INPUT','SELECT','BUTTON'].includes(e.target.tagName)){e.preventDefault();playPause();}});
    select(config.initial);
    $('count').textContent=skeletonData.animations.length+' 个动画资源';
    // 用户的播放选择和浏览器可见性分开：离屏暂停不修改 playing。
    let last = performance.now(), raf = 0, inView = true, failed = false;
    const canRender = () => !document.hidden && inView && !failed;
    function invalidate() {
      if (!canRender() || raf) return;
      raf = requestAnimationFrame(render);
    }
    function suspend() {
      cancelAnimationFrame(raf); raf = 0;
    }
    function resume() {
      last = performance.now();
      invalidate();
    }
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) suspend(); else resume();
    });
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(entries => {
        inView = entries[0].isIntersecting;
        if (inView) resume(); else suspend();
      });
      observer.observe($('stage'));
    }
    // 暂停后仍能拖进度、切表情、改取景；每次操作只重画一帧。
    for (const event of ['input', 'change', 'click', 'keydown']) {
      document.addEventListener(event, invalidate);
    }
    window.addEventListener('resize', invalidate);
    canvas.addEventListener('webglcontextlost', event => {
      event.preventDefault(); failed = true; suspend();
      $('status').textContent = '渲染中断';
      $('error').textContent = 'WebGL 上下文已丢失，请刷新此演示重试。';
    });
    window.addEventListener('pagehide', suspend);
    window.addEventListener('pageshow', resume);
    function render(now) {
      raf = 0;
      if (!canRender()) return;
      try {
        const delta=Math.min((now-last)/1000,0.1);last=now;
        const dpr=Math.min(devicePixelRatio||1,2),w=Math.round(canvas.clientWidth*dpr),h=Math.round(canvas.clientHeight*dpr);
        if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}
        gl.viewport(0,0,w,h);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);
        if(playing) state.update(delta*speed);
        skeleton.flipX=flip;state.apply(skeleton);skeleton.updateWorldTransform();
        const aspect=w/h;
        const waist = config.layers && $('framing').value === 'waist';
        const worldHeight = waist
          ? Math.max(bounds.height * 0.66, bounds.width * 0.7 / aspect) / zoom
          : Math.max(bounds.height*1.2,bounds.width/aspect*1.2)/zoom;
        const centerY = waist ? bounds.y + bounds.height * 1.04 - worldHeight / 2 : bounds.y+bounds.height/2;
        renderer.camera.position.set((bounds.x+bounds.width/2)*(flip?-1:1),centerY,0);
        renderer.camera.setViewport(worldHeight*aspect,worldHeight);
        renderer.begin();renderer.drawSkeleton(skeleton,config.premultipliedAlpha);
        if(debug) renderer.drawSkeletonDebug(skeleton,false);
        renderer.end();
        updateTime();$('status').textContent=playing?'正在播放':'已暂停';
        canvas.dataset.frames=String(++frameCount);
        if (playing) invalidate();
      } catch (error) {
        failed = true; suspend();
        $('status').textContent = '渲染失败';
        $('error').textContent = '渲染失败：' + (error.message || error);
        console.error(error);
      }
    }
    invalidate();
  } catch (error) {
    $('status').textContent='加载失败';$('error').textContent='动画加载失败：'+(error.message||error);
    console.error(error);
  }
})();
