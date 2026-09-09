// Minimal line chart on <canvas>, hand-rolled so the dashboard has zero
// external chart-library dependency (works fully offline off an ESP32).
const Charts = (() => {
  function drawLine(canvas, points, opts = {}) {
    if (!canvas || !points || points.length < 2) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, rect.width, rect.height);

    const color = opts.color || '#2F6D4F';
    const padTop = 14, padBottom = 18, padX = 4;
    const w = rect.width - padX * 2;
    const h = rect.height - padTop - padBottom;

    const values = points.map((p) => p.v);
    const min = opts.min ?? Math.min(...values);
    const max = opts.max ?? Math.max(...values);
    const range = max - min || 1;

    const stepX = w / (points.length - 1);
    const xy = points.map((p, i) => ({
      x: padX + i * stepX,
      y: padTop + h - ((p.v - min) / range) * h,
    }));

    // Filled area under the line
    ctx.beginPath();
    ctx.moveTo(xy[0].x, padTop + h);
    xy.forEach((p) => ctx.lineTo(p.x, p.y));
    ctx.lineTo(xy[xy.length - 1].x, padTop + h);
    ctx.closePath();
    const grad = ctx.createLinearGradient(0, padTop, 0, padTop + h);
    grad.addColorStop(0, color + '33');
    grad.addColorStop(1, color + '02');
    ctx.fillStyle = grad;
    ctx.fill();

    // Line
    ctx.beginPath();
    xy.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.2;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.stroke();

    // Last point dot
    const lastPt = xy[xy.length - 1];
    ctx.beginPath();
    ctx.arc(lastPt.x, lastPt.y, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Min/max labels
    ctx.fillStyle = '#6B7A6E';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`${opts.suffix ? max.toFixed(0) + opts.suffix : max.toFixed(0)}`, padX, 10);
    ctx.fillText(`${opts.suffix ? min.toFixed(0) + opts.suffix : min.toFixed(0)}`, padX, rect.height - 4);
  }

  return { drawLine };
})();
