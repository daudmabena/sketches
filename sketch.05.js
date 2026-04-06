const canvasSketch = require('canvas-sketch');

const settings = {
  dimensions: [1920, 1080],
  animate: true,
  fps: 60
};

const drawAxes = ({ context, width, height, left, top, graphW, graphH }) => {
  const midY = top + graphH * 0.5;

  context.strokeStyle = '#334155';
  context.lineWidth = width * 0.0012;

  // X axis
  context.beginPath();
  context.moveTo(left, midY);
  context.lineTo(left + graphW, midY);
  context.stroke();

  // Y axis
  context.beginPath();
  context.moveTo(left, top);
  context.lineTo(left, top + graphH);
  context.stroke();
};

const drawWave = ({ context, width, left, top, graphW, graphH, time, fn, color, phase }) => {
  const midY = top + graphH * 0.5;
  const amp = graphH * 0.38;
  const samples = 720;

  context.strokeStyle = color;
  context.lineWidth = width * 0.0018;
  context.beginPath();

  for (let i = 0; i <= samples; i += 1) {
    const t = i / samples;
    const x = left + t * graphW;
    const angle = t * Math.PI * 4 + time * 1.5 + phase;
    const y = midY - fn(angle) * amp;
    if (i === 0) context.moveTo(x, y);
    else context.lineTo(x, y);
  }

  context.stroke();
};

const sketch = () => {
  return ({ context, width, height, time }) => {
    context.fillStyle = '#0b1220';
    context.fillRect(0, 0, width, height);

    const marginX = width * 0.09;
    const marginY = height * 0.16;
    const graphW = width - marginX * 2;
    const graphH = height - marginY * 2;

    drawAxes({
      context,
      width,
      height,
      left: marginX,
      top: marginY,
      graphW,
      graphH
    });

    drawWave({
      context,
      width,
      left: marginX,
      top: marginY,
      graphW,
      graphH,
      time,
      fn: Math.sin,
      color: '#22d3ee',
      phase: 0
    });

    drawWave({
      context,
      width,
      left: marginX,
      top: marginY,
      graphW,
      graphH,
      time,
      fn: Math.cos,
      color: '#f472b6',
      phase: 0
    });

    // Marker points at current phase.
    const probeT = (Math.sin(time * 1.5) * 0.5 + 0.5) * graphW;
    const xProbe = marginX + probeT;
    const theta = (probeT / graphW) * Math.PI * 4 + time * 1.5;
    const midY = marginY + graphH * 0.5;
    const amp = graphH * 0.38;

    const sinY = midY - Math.sin(theta) * amp;
    const cosY = midY - Math.cos(theta) * amp;

    context.fillStyle = '#22d3ee';
    context.beginPath();
    context.arc(xProbe, sinY, width * 0.005, 0, Math.PI * 2);
    context.fill();

    context.fillStyle = '#f472b6';
    context.beginPath();
    context.arc(xProbe, cosY, width * 0.005, 0, Math.PI * 2);
    context.fill();

    context.fillStyle = '#e2e8f0';
    context.font = `${Math.max(20, Math.floor(width * 0.015))}px Arial`;
    context.textAlign = 'left';
    context.fillText('Graph Demo: y = sin(x) and y = cos(x)', marginX, marginY - height * 0.05);

    context.font = `${Math.max(14, Math.floor(width * 0.01))}px Arial`;
    context.fillStyle = '#22d3ee';
    context.fillText('sin(x)', marginX + graphW - 160, marginY + 32);
    context.fillStyle = '#f472b6';
    context.fillText('cos(x)', marginX + graphW - 160, marginY + 58);
  };
};

canvasSketch(sketch, settings);
