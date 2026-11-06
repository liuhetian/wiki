// Keyboard + mouse. Mouse look uses pointer lock; when the lock is unavailable (or refused) dragging with the left
// button and Q/E also turn the camera.

export class Input {
  private keys = new Set<string>();
  private pressed = new Set<string>();
  mouseDX = 0;
  mouseDY = 0;
  wheel = 0;
  locked = false;
  private dragging = false;
  onLockChange: ((locked: boolean) => void) | null = null;

  constructor(private canvas: HTMLCanvasElement) {
    addEventListener('keydown', (e) => {
      if (e.repeat) return;
      this.keys.add(e.code);
      this.pressed.add(e.code);
      if (['Space', 'Tab', 'F1', 'F2', 'F3', 'F4', 'F5'].includes(e.code)) e.preventDefault();
    });
    addEventListener('keyup', (e) => this.keys.delete(e.code));
    addEventListener('blur', () => this.keys.clear());
    canvas.addEventListener('mousedown', (e) => {
      if (e.button === 0) this.dragging = true;
    });
    addEventListener('mouseup', () => (this.dragging = false));
    addEventListener('mousemove', (e) => {
      if (this.locked || this.dragging) {
        this.mouseDX += e.movementX;
        this.mouseDY += e.movementY;
      }
    });
    canvas.addEventListener('wheel', (e) => {
      this.wheel += Math.sign(e.deltaY);
      e.preventDefault();
    }, { passive: false });
    document.addEventListener('pointerlockchange', () => {
      this.locked = document.pointerLockElement === canvas;
      this.onLockChange?.(this.locked);
    });
  }

  requestLock(): void {
    if (this.locked) return;
    try {
      const p = this.canvas.requestPointerLock() as unknown as Promise<void> | undefined;
      p?.catch?.(() => {});
    } catch {
      /* drag look still works */
    }
  }

  releaseLock(): void {
    if (document.pointerLockElement) document.exitPointerLock();
  }

  down(code: string): boolean {
    return this.keys.has(code);
  }

  hit(code: string): boolean {
    return this.pressed.has(code);
  }

  axis(neg: string[], pos: string[]): number {
    let v = 0;
    for (const k of neg) if (this.keys.has(k)) v -= 1;
    for (const k of pos) if (this.keys.has(k)) v += 1;
    return Math.max(-1, Math.min(1, v));
  }

  /** After each simulation step: one-shot key presses are consumed. */
  endStep(): void {
    this.pressed.clear();
  }

  /** After each rendered frame: mouse deltas are consumed by the camera. */
  endFrame(): void {
    this.mouseDX = this.mouseDY = 0;
    this.wheel = 0;
  }
}
