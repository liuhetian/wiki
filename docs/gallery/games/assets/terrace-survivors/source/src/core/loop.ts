// Fixed 60 Hz simulation with a variable-rate render. At most 4 catch-up steps per frame so a stall (tab switch,
// GC) slows the game down instead of spiralling.

export function startLoop(update: (dt: number) => void, render: (dt: number) => void): void {
  const STEP = 1 / 60;
  let acc = 0;
  let last = performance.now();
  const frame = (now: number) => {
    const dt = Math.min(0.1, (now - last) / 1000);
    last = now;
    acc += dt;
    let n = 0;
    while (acc >= STEP && n < 4) {
      update(STEP);
      acc -= STEP;
      n++;
    }
    if (n === 4) acc = 0;
    render(dt);
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}
