const canvasSketch = require('canvas-sketch');

const settings = {
  dimensions: [ 2048, 2048 ],
  animate: true,
  fps: 60
};

// Path extracted from football.svg to stay browser-compatible (no fs usage).
const footballPathData = 'M61.44,0c16.97,0,32.33,6.88,43.44,18c11.12,11.12,18,26.48,18,43.44c0,16.97-6.88,32.33-18,43.44 c-11.12,11.12-26.48,18-43.44,18S29.11,116,18,104.88C6.88,93.77,0,78.41,0,61.44C0,44.47,6.88,29.11,18,18 C29.11,6.88,44.47,0,61.44,0L61.44,0z M76.85,117.08L76.73,117l6.89-23.09L69.41,78.15L52.66,78L39.38,94.62l6.66,22.32l-0.15,0.1 c4.95,1.38,10.16,2.12,15.55,2.12C66.78,119.16,71.95,118.44,76.85,117.08L76.85,117.08z M12.22,91.61l24.34,0.12L49.28,75.8 l-5.26-16.12l-21.42-9.3L3.78,64.08C4.23,74.14,7.26,83.53,12.22,91.61L12.22,91.61z M16.77,24.88l7.4,22.14l19.98,8.68 l15.44-11.97V20.94L40.51,7.63c-7.52,2.93-14.28,7.39-19.89,13C19.27,21.98,17.98,23.4,16.77,24.88L16.77,24.88z M81.7,7.37 L63.3,20.77V43.7L77.8,54.91l20.81-8.92l7.18-21.49c-1.12-1.35-2.3-2.64-3.54-3.88C96.48,14.85,89.49,10.29,81.7,7.37L81.7,7.37z M119.09,64.36l-0.02,0.01L99.09,49.82l-19.81,8.49l-6.08,18.03l13.73,15.23c0.06,0.06,0.09,0.13,0.11,0.21l23.6-0.11 C115.56,83.65,118.59,74.34,119.09,64.36L119.09,64.36z';
const footballSize = 122.88;

const drawFootball = ({ context, x, y, size, rotation }) => {
  if (!footballPathData || typeof Path2D !== 'function') {
    // Fallback shape if Path2D SVG parsing is unavailable.
    context.save();
    context.translate(x, y);
    context.rotate(rotation);
    context.fillStyle = '#ffffff';
    context.strokeStyle = '#0f172a';
    context.lineWidth = size * 0.08;
    context.beginPath();
    context.arc(0, 0, size * 0.5, 0, Math.PI * 2);
    context.fill();
    context.stroke();
    context.restore();
    return;
  }

  const footballPath = new Path2D(footballPathData);
  const scale = size / footballSize;

  context.save();
  context.translate(x, y);
  context.rotate(rotation);
  context.scale(scale, scale);
  context.translate(-footballSize * 0.5, -footballSize * 0.5);
  context.fillStyle = '#ffffff';
  context.strokeStyle = '#0f172a';
  context.lineWidth = 4;
  context.fill(footballPath, 'evenodd');
  context.stroke(footballPath);
  context.restore();
};

const sketch = () => {
  return ({ context, width, height, time }) => {
    context.fillStyle = '#f6f7fb';
    context.fillRect(0, 0, width, height);

    const cx = width * 0.5;
    const cy = height * 0.5;
    const count = 12;
    const maxRadius = Math.min(width, height) * 0.38;
    const minRadius = maxRadius * 0.2;
    const baseThickness = width * 0.003;
    const beat = Math.sin(time * 0.9) * 0.5 + 0.5;

    context.save();
    context.translate(cx, cy);

    // Orbital wobble keeps the composition alive while preserving 12 hour angles.
    const orbitAmount = maxRadius * 0.07;
    const ox = Math.cos(time * 0.35) * orbitAmount;
    const oy = Math.sin(time * 0.48) * orbitAmount;
    context.translate(ox, oy);

    let longestLine = null;

    for (let i = 0; i < count; i += 1) {
      const angle = (Math.PI * 2 * i) / count - Math.PI * 0.5;
      const phase = time * 1.4 + i * 0.7;
      const pulse = Math.sin(phase) * 0.5 + 0.5;
      const stretch = Math.cos(time * 0.8 + i * 1.2) * 0.5 + 0.5;

      const inner = minRadius * (0.55 + beat * 0.7) + stretch * maxRadius * 0.08;
      const outer = minRadius + (maxRadius - minRadius) * (0.3 + pulse * 0.7);

      const x1 = Math.cos(angle) * inner;
      const y1 = Math.sin(angle) * inner;
      const x2 = Math.cos(angle) * outer;
      const y2 = Math.sin(angle) * outer;
      const length = Math.hypot(x2 - x1, y2 - y1);

      context.lineWidth = baseThickness + pulse * baseThickness * 1.9;
      context.lineCap = 'round';
      context.strokeStyle = `hsla(${210 + pulse * 120}, 85%, ${22 + pulse * 45}%, ${0.35 + pulse * 0.65})`;
      context.beginPath();
      context.moveTo(x1, y1);
      context.lineTo(x2, y2);
      context.stroke();

      // Accent dots run along each line to mimic a "clock spark" effect.
      const dotTravel = 0.2 + (Math.sin(time * 2.4 + i * 0.9) * 0.5 + 0.5) * 0.75;
      const dx = x1 + (x2 - x1) * dotTravel;
      const dy = y1 + (y2 - y1) * dotTravel;
      context.fillStyle = `hsla(${250 + pulse * 80}, 90%, ${45 + pulse * 35}%, ${0.4 + pulse * 0.6})`;
      context.beginPath();
      context.arc(dx, dy, baseThickness * (0.5 + pulse * 1.8), 0, Math.PI * 2);
      context.fill();

      if (!longestLine || length > longestLine.length) {
        longestLine = { x1, y1, x2, y2, length, angle };
      }
    }

    if (longestLine) {
      const follow = 0.55 + (Math.sin(time * 3.2) * 0.5 + 0.5) * 0.4;
      const fx = longestLine.x1 + (longestLine.x2 - longestLine.x1) * follow;
      const fy = longestLine.y1 + (longestLine.y2 - longestLine.y1) * follow;
      const footballRenderSize = maxRadius * 0.1;
      drawFootball({
        context,
        x: fx,
        y: fy,
        size: footballRenderSize,
        rotation: longestLine.angle + time * 3
      });
    }

    // Keep a second football at the exact center.
    drawFootball({
      context,
      x: 0,
      y: 0,
      size: maxRadius * 0.12,
      rotation: -time * 2.2
    });

    // Core ring to anchor the clock visually.
    context.strokeStyle = `hsla(230, 40%, 20%, ${0.4 + beat * 0.4})`;
    context.lineWidth = baseThickness * 2;
    context.beginPath();
    context.arc(0, 0, minRadius * (0.75 + beat * 0.25), 0, Math.PI * 2);
    context.stroke();

    context.restore();
  };
};

canvasSketch(sketch, settings);
