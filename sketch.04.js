const canvasSketch = require('canvas-sketch');

const settings = {
  dimensions: 'A3',
  orientation: 'portrait',
  pixelsPerInch: 300,
  units: 'cm'
};

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const mulberry32 = (seed) => {
  let t = seed;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), t | 1);
    r ^= r + Math.imul(r ^ (r >>> 7), r | 61);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
};

const sketch = () => {
  const random = mulberry32(20260406);

  return ({ context, width, height }) => {
    context.fillStyle = '#f7f4ec';
    context.fillRect(0, 0, width, height);

    const pageMargin = width * 0.095;
    const innerX = pageMargin;
    const innerY = pageMargin;
    const innerW = width - pageMargin * 2;
    const innerH = height - pageMargin * 2;

    // Subtle frame to make the print feel intentional.
    context.strokeStyle = '#151515';
    context.lineWidth = width * 0.004;
    context.strokeRect(innerX, innerY, innerW, innerH);

    const heroW = innerW * 0.82;
    const heroH = innerH * 0.58;
    const heroX = innerX + (innerW - heroW) * 0.5;
    const heroY = innerY + innerH * 0.12;

    // One large area split into three equal-share rectangles.
    context.strokeStyle = '#111111';
    context.lineWidth = width * 0.0032;
    context.strokeRect(heroX, heroY, heroW, heroH);

    const shareGap = heroW * 0.03;
    const shareW = (heroW - shareGap * 2) / 3;
    const shareStroke = [0.0026, 0.0042, 0.0062];

    for (let i = 0; i < 3; i += 1) {
      const shareX = heroX + i * (shareW + shareGap);
      const shareY = heroY;

      context.strokeStyle = '#111111';
      context.lineWidth = width * shareStroke[i];
      context.strokeRect(shareX, shareY, shareW, heroH);

      // Light hatch texture per share to preserve depth.
      const hatchLines = 22 + i * 8;
      context.save();
      context.beginPath();
      context.rect(shareX, shareY, shareW, heroH);
      context.clip();
      context.strokeStyle = 'rgba(17, 17, 17, 0.08)';
      context.lineWidth = width * 0.001;
      for (let j = 0; j < hatchLines; j += 1) {
        const t = j / Math.max(1, hatchLines - 1);
        const y = shareY + t * heroH;
        context.beginPath();
        context.moveTo(shareX, y);
        context.lineTo(shareX + shareW, y - heroH * (0.08 + i * 0.03));
        context.stroke();
      }
      context.restore();
    }

    const gridTop = heroY + heroH + innerH * 0.08;
    const gridBottom = innerY + innerH - innerH * 0.07;
    const gridH = gridBottom - gridTop;
    const cols = 12;
    const rows = 4;
    const gap = innerW * 0.02;
    const maxGridW = innerW * 0.9;
    const squareByWidth = (maxGridW - gap * (cols - 1)) / cols;
    const squareByHeight = (gridH - gap * (rows - 1)) / rows;
    const squareSize = Math.max(0, Math.min(squareByWidth, squareByHeight));
    const gridW = cols * squareSize + gap * (cols - 1);
    const gridRenderH = rows * squareSize + gap * (rows - 1);
    const gridX = innerX + (innerW - gridW) * 0.5;
    const gridY = gridTop + (gridH - gridRenderH) * 0.5;

    for (let row = 0; row < rows; row += 1) {
      for (let col = 0; col < cols; col += 1) {
        const x = gridX + col * (squareSize + gap);
        const y = gridY + row * (squareSize + gap);
        const accent = random();

        context.fillStyle = accent > 0.78 ? '#1b1b1b' : '#f7f4ec';
        context.strokeStyle = '#161616';
        context.lineWidth = width * (0.0018 + (row + col) * 0.00025);
        context.beginPath();
        context.rect(x, y, squareSize, squareSize);
        context.fill();
        context.stroke();
      }
    }

    // Minimal title mark for gallery-like finish.
    context.fillStyle = '#222222';
    context.font = `${(width * 0.018).toFixed(2)}px "Helvetica Neue", Arial, sans-serif`;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText('INVASION OF RECTANGLES', width * 0.5, innerY + innerH * 0.055);
  };
};

canvasSketch(sketch, settings);
