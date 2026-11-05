// Real Cubism Core validation: no browser, screenshot, or mock model.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const motion = require('./live2d-motion.js');
const root = path.resolve(__dirname, '../../../../..');
const vendor = path.join(root, 'docs/vendor/live2d');
const assets = path.join(__dirname, 'dafeiyu');
const read = name => JSON.parse(fs.readFileSync(path.join(assets, name), 'utf8'));

(async () => {
  const context = {console, require, process, Buffer, setTimeout, clearTimeout, WebAssembly, performance, __dirname: vendor};
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(path.join(vendor, 'live2dcubismcore.min.js'), 'utf8'), context);
  await new Promise(resolve => setTimeout(resolve, 200));
  const C = context.Live2DCubismCore;
  const manifest = read('deepseek-maid-joints.model3.json'), refs = manifest.FileReferences;
  function checkRefs(value) {
    if (typeof value === 'string' && /\.(moc3|png|json)$/.test(value)) assert(fs.existsSync(path.join(assets, value)), value);
    else if (Array.isArray(value)) value.forEach(checkRefs);
    else if (value && typeof value === 'object') Object.values(value).forEach(checkRefs);
  }
  checkRefs(refs);
  const buffer = fs.readFileSync(path.join(assets, refs.Moc));
  const moc = C.Moc.fromArrayBuffer(buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength));
  assert(moc, 'Official Core must accept this MOC3');
  const raw = C.Model.fromMoc(moc), p = raw.parameters;
  assert.equal(p.count, 32); assert.equal(raw.drawables.count, 35);
  const indices = new Map(Array.from(p.ids, (id, i) => [id, i]));
  function vertices() {return Array.from(raw.drawables.vertexPositions, v => Array.from(v)).flat();}
  p.values.set(p.defaultValues); raw.update();
  const baseline = vertices();
  function displacement() {
    const current = vertices();
    assert(current.every(Number.isFinite), 'All evaluated vertex coordinates must be finite');
    return Math.max(...current.map((v, i) => Math.abs(v - baseline[i])));
  }
  const motions = [];
  for (const [group, entries] of Object.entries(refs.Motions)) {
    const compiled = motion.compile(read(entries[0].File));
    let max = 0;
    for (let frame = 0; frame <= 60; frame++) {
      p.values.set(p.defaultValues); motion.apply(raw, compiled, compiled.duration * frame / 60, indices); raw.update();
      assert(Array.from(p.values).every(Number.isFinite));
      max = Math.max(max, displacement());
    }
    assert(max > 1e-6, 'Animation must deform the model: ' + group);
    motions.push({group, duration:compiled.duration, samples:61, max_vertex_displacement:max});
  }
  const parameters = [];
  for (let i = 0; i < p.count; i++) {
    let max = 0;
    for (const v of [p.minimumValues[i], p.maximumValues[i]]) {
      p.values.set(p.defaultValues); p.values[i] = v; raw.update(); max = Math.max(max, displacement());
    }
    parameters.push({id:p.ids[i], min:p.minimumValues[i], max:p.maximumValues[i], max_vertex_displacement:max});
  }
  const expressions = [];
  for (const entry of refs.Expressions) {
    const data = read(entry.File); p.values.set(p.defaultValues);
    for (const param of data.Parameters) {
      assert(indices.has(param.Id), param.Id);
      const i = indices.get(param.Id);
      if (param.Blend === 'Multiply') p.values[i] *= param.Value;
      else if (param.Blend === 'Overwrite') p.values[i] = param.Value;
      else p.values[i] += param.Value;
    }
    raw.update(); expressions.push({name:entry.Name, max_vertex_displacement:displacement()});
  }
  // Independent curve checks, including nonuniform Bezier timing.
  const linear = motion.compile({Meta:{Duration:2},Curves:[{Target:'Parameter',Id:'p',Segments:[0,0,0,2,10]}]}).curves[0];
  assert.equal(motion.value(linear, 1), 5);
  const bezier = motion.compile({Meta:{Duration:1},Curves:[{Target:'Parameter',Id:'p',Segments:[0,0,1,.1,0,.3,1,1,1]}]}).curves[0];
  assert(Math.abs(motion.value(bezier, .5) - .5) > .05, 'Use Bezier time inversion, not a linear shortcut');
  const report = {success:true, checked_on:'2026-11-05', core_version:C.Version.csmGetVersion(), moc_version:5, parameters:parameters.length, drawables:raw.drawables.count, motions, expressions, parameter_extremes:parameters, browser_render_tested:false};
  fs.writeFileSync(path.join(__dirname, 'live2d-validation.json'), JSON.stringify(report,null,2)+'\n');
  raw.release(); moc._release();
  console.log(JSON.stringify({success:true, parameters:32, drawables:35, motions:motions.length, motion_poses:motions.length*61, expressions:expressions.length, parameter_extremes:parameters.length*2}));
})().catch(error => {console.error(error); process.exit(1);});
