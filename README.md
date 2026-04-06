# Sketches

Creative coding sketches built with `canvas-sketch`.

## Setup

```bash
npm install
```

## Create a New Drawing

1. Generate a new sketch file from the CLI template:

```bash
canvas-sketch sketch.03.js --new
```

1. Run your sketch:

```bash
npx canvas-sketch sketch.03.js
```

1. Export frames/images:

```bash
npx canvas-sketch sketch.03.js --output=output/03
```

1. Iterate quickly:

- Change colors, line widths, spacing, and randomness.
- Add animation by using `time` with `Math.sin(...)` and `Math.cos(...)`.
- Re-run command after edits to preview results.

## Working With SVG Assets

- Keep SVG files in the project root (example: `football.svg`).
- If the sketch runs in a browser-like context, avoid Node-only APIs like `fs.readFileSync`.
- Prefer embedding path data or loading assets with browser-compatible methods.

## Sample Prompts for New Sketches

Use prompts like these when asking an AI assistant to generate a new `canvas-sketch` file:

1. `Create sketch.03.js with a generative mandala using 24 radial segments, soft neon palette, subtle grain texture, and smooth breathing animation at 60fps.`
2. `Build sketch.04.js that draws a city skyline made from rectangles, with windows flickering over time and a moon moving slowly across the sky.`
3. `Implement sketch.05.js as a clock-inspired animation with 12 spokes, each with independent pulse timing and color shifts, plus a central symbol.`
4. `Create sketch.06.js with flowing contour lines driven by noise-like waves, monochrome palette, and occasional accent dots.`
5. `Make sketch.07.js where an SVG icon follows the longest animated line segment each frame, with center anchor and rotational easing.`

## Suggested Project Structure

```text
sketches/
  sketch.o1.js
  sketch.02.js
  sketch.03.js
  football.svg
  output/
    01/
    02/
    03/
```
