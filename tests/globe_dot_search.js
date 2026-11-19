// In-page JS grid search for a WebGL city dot: dispatches pointermove on the globe canvas and waits a frame
async ([x0, x1, y0, y1, step]) => {
  const c = document.querySelector('[data-testid=globe-container] canvas');
  const wrap = document.querySelector('[data-testid=globe-container]');
  const raf = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  for (let y = y0; y < y1; y += step) {
    for (let x = x0; x < x1; x += step) {
      c.dispatchEvent(new PointerEvent('pointermove', { clientX: x, clientY: y, bubbles: true, pointerType: 'mouse' }));
      await raf();
      if (wrap.style.cursor === 'pointer') return [x, y];
    }
  }
  return null;
}
