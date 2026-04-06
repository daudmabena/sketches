const canvasSketch = require('canvas-sketch');

const settings = {
  dimensions: [1920, 1080],
  animate: true,
  fps: 60
};

// Path extracted from football.svg to keep browser-style compatibility.
const footballPathData = 'M61.44,0c16.97,0,32.33,6.88,43.44,18c11.12,11.12,18,26.48,18,43.44c0,16.97-6.88,32.33-18,43.44 c-11.12,11.12-26.48,18-43.44,18S29.11,116,18,104.88C6.88,93.77,0,78.41,0,61.44C0,44.47,6.88,29.11,18,18 C29.11,6.88,44.47,0,61.44,0L61.44,0z M76.85,117.08L76.73,117l6.89-23.09L69.41,78.15L52.66,78L39.38,94.62l6.66,22.32l-0.15,0.1 c4.95,1.38,10.16,2.12,15.55,2.12C66.78,119.16,71.95,118.44,76.85,117.08L76.85,117.08z M12.22,91.61l24.34,0.12L49.28,75.8 l-5.26-16.12l-21.42-9.3L3.78,64.08C4.23,74.14,7.26,83.53,12.22,91.61L12.22,91.61z M16.77,24.88l7.4,22.14l19.98,8.68 l15.44-11.97V20.94L40.51,7.63c-7.52,2.93-14.28,7.39-19.89,13C19.27,21.98,17.98,23.4,16.77,24.88L16.77,24.88z M81.7,7.37 L63.3,20.77V43.7L77.8,54.91l20.81-8.92l7.18-21.49c-1.12-1.35-2.3-2.64-3.54-3.88C96.48,14.85,89.49,10.29,81.7,7.37L81.7,7.37z M119.09,64.36l-0.02,0.01L99.09,49.82l-19.81,8.49l-6.08,18.03l13.73,15.23c0.06,0.06,0.09,0.13,0.11,0.21l23.6-0.11 C115.56,83.65,118.59,74.34,119.09,64.36L119.09,64.36z';
const footballSize = 122.88;

const drawFootball = ({ context, x, y, size, rotation }) => {
  if (!footballPathData || typeof Path2D !== 'function') {
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
  context.strokeStyle = '#111827';
  context.lineWidth = 4;
  context.fill(footballPath, 'evenodd');
  context.stroke(footballPath);
  context.restore();
};

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

const sketch = () => {
  const state = {
    scoreA: 0,
    scoreB: 0,
    lastTime: 0,
    roundStart: 0,
    players: [],
    ball: null
  };

  return ({ context, width, height, time }) => {
    const dt = state.lastTime > 0 ? Math.min(0.05, time - state.lastTime) : 0;
    state.lastTime = time;

    const pitchX = width * 0.08;
    const pitchY = height * 0.11;
    const pitchW = width * 0.84;
    const pitchH = height * 0.78;

    // Official football pitch dimensions displayed in the dashboard and side labels.
    const pitchLengthM = 105;
    const pitchWidthM = 68;
    const pxPerMeter = Math.min(pitchW / pitchLengthM, pitchH / pitchWidthM);

    const midX = pitchX + pitchW * 0.5;
    const midY = pitchY + pitchH * 0.5;
    const penaltyW = 16.5 * pxPerMeter;
    const goalAreaW = 5.5 * pxPerMeter;
    const boxH = 40.3 * pxPerMeter;
    const goalAreaH = 18.32 * pxPerMeter;
    const centerCircleR = 9.15 * pxPerMeter;
    const penaltySpotOffset = 11 * pxPerMeter;
    const goalW = 7.32 * pxPerMeter;

    context.fillStyle = '#0b1220';
    context.fillRect(0, 0, width, height);

    // Grass stripes
    const stripeCount = 24;
    for (let i = 0; i < stripeCount; i += 1) {
      context.fillStyle = i % 2 === 0 ? '#1f9d55' : '#1c8f4e';
      context.fillRect(pitchX + (pitchW / stripeCount) * i, pitchY, pitchW / stripeCount, pitchH);
    }

    context.strokeStyle = '#e2fbe8';
    context.lineWidth = Math.max(2, width * 0.0022);

    // Outer line and half-way line
    context.strokeRect(pitchX, pitchY, pitchW, pitchH);
    context.beginPath();
    context.moveTo(midX, pitchY);
    context.lineTo(midX, pitchY + pitchH);
    context.stroke();

    // Center circle + spot
    context.beginPath();
    context.arc(midX, midY, centerCircleR, 0, Math.PI * 2);
    context.stroke();
    context.beginPath();
    context.arc(midX, midY, context.lineWidth * 0.7, 0, Math.PI * 2);
    context.fillStyle = '#e2fbe8';
    context.fill();

    // Penalty boxes and goal areas
    context.strokeRect(pitchX, midY - boxH * 0.5, penaltyW, boxH);
    context.strokeRect(pitchX, midY - goalAreaH * 0.5, goalAreaW, goalAreaH);
    context.strokeRect(pitchX + pitchW - penaltyW, midY - boxH * 0.5, penaltyW, boxH);
    context.strokeRect(pitchX + pitchW - goalAreaW, midY - goalAreaH * 0.5, goalAreaW, goalAreaH);

    // Penalty spots
    context.beginPath();
    context.arc(pitchX + penaltySpotOffset, midY, context.lineWidth * 0.7, 0, Math.PI * 2);
    context.arc(pitchX + pitchW - penaltySpotOffset, midY, context.lineWidth * 0.7, 0, Math.PI * 2);
    context.fill();

    // Goals (outside pitch line)
    const goalDepth = width * 0.012;
    context.strokeRect(pitchX - goalDepth, midY - goalW * 0.5, goalDepth, goalW);
    context.strokeRect(pitchX + pitchW, midY - goalW * 0.5, goalDepth, goalW);

    const ballRadius = Math.max(12, width * 0.0068);
    if (!state.ball) {
      state.ball = {
        x: midX,
        y: midY,
        vx: width * 0.18,
        vy: height * 0.04,
        rotation: 0
      };
    }

    // Goalkeeper tracks the ball but cannot keep up at full speed.
    const keeperX = pitchX + pitchW - goalAreaW * 0.4;
    const keeperTrack = Math.sin(time * 2.2) * goalW * 0.15 + (state.ball.y - midY) * 0.45;
    const keeperY = midY + keeperTrack;
    const keeperRadius = Math.max(12, width * 0.008);

    // Outfield players move dynamically across the full pitch.
    const playerRadius = Math.max(24, width * 0.0065);
    if (state.players.length === 0) {
      const playerCount = 12;
      for (let i = 0; i < playerCount; i += 1) {
        const team = i < playerCount / 2 ? 'A' : 'B';
        const speed = width * (0.055 + Math.random() * 0.03);
        const angle = Math.random() * Math.PI * 2;
        state.players.push({
          x: pitchX + playerRadius + Math.random() * (pitchW - playerRadius * 2),
          y: pitchY + playerRadius + Math.random() * (pitchH - playerRadius * 2),
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          targetSide: Math.random() > 0.5 ? 1 : 0,
          switchTimer: 2 + Math.random() * 3,
          team
        });
      }
    }

    const minX = pitchX + playerRadius;
    const maxX = pitchX + pitchW - playerRadius;
    const minY = pitchY + playerRadius;
    const maxY = pitchY + pitchH - playerRadius;
    const maxSpeed = width * 0.09;
    const touchOffset = playerRadius + ballRadius + width * 0.003;
    const pressureRadius = width * 0.19;

    for (let i = 0; i < state.players.length; i += 1) {
      const p = state.players[i];

      p.switchTimer -= dt;
      if (p.switchTimer <= 0) {
        p.targetSide = p.targetSide === 1 ? 0 : 1;
        p.switchTimer = 2 + Math.random() * 3;
      }

      const defaultTargetX = p.targetSide === 1 ? pitchX + pitchW * 0.84 : pitchX + pitchW * 0.16;
      const dxToBall = state.ball.x - p.x;
      const dyToBall = state.ball.y - p.y;
      const dToBall = Math.hypot(dxToBall, dyToBall);

      if (dToBall < pressureRadius) {
        // Team A attacks right goal, Team B attacks left goal.
        const goalX = p.team === 'A' ? pitchX + pitchW + goalDepth : pitchX - goalDepth;
        const goalY = midY;
        const shotDx = goalX - state.ball.x;
        const shotDy = goalY - state.ball.y;
        const shotLen = Math.hypot(shotDx, shotDy) || 1;
        const shotNx = shotDx / shotLen;
        const shotNy = shotDy / shotLen;

        // To preserve "opposite touch" behavior, player approaches from goal side.
        const approachX = state.ball.x + shotNx * touchOffset;
        const approachY = state.ball.y + shotNy * touchOffset;
        p.vx += (approachX - p.x) * dt * 4.2;
        p.vy += (approachY - p.y) * dt * 4.2;
      } else {
        const desiredVx = (defaultTargetX - p.x) * 0.75;
        p.vx += (desiredVx - p.vx) * Math.min(1, dt * 1.5);
        p.vy += (Math.random() - 0.5) * width * 0.01 * Math.max(dt, 0.01);
      }

      p.vx = clamp(p.vx, -maxSpeed, maxSpeed);
      p.vy = clamp(p.vy, -maxSpeed * 0.55, maxSpeed * 0.55);

      p.x += p.vx * dt;
      p.y += p.vy * dt;

      if (p.x <= minX || p.x >= maxX) {
        p.x = clamp(p.x, minX, maxX);
        p.vx *= -1;
      }
      if (p.y <= minY || p.y >= maxY) {
        p.y = clamp(p.y, minY, maxY);
        p.vy *= -1;
      }

      const dxBall = state.ball.x - p.x;
      const dyBall = state.ball.y - p.y;
      const minDist = playerRadius + ballRadius;
      const dist = Math.hypot(dxBall, dyBall);
      if (dist > 0 && dist < minDist) {
        const nx = dxBall / dist;
        const ny = dyBall / dist;
        const overlap = minDist - dist;
        state.ball.x += nx * overlap;
        state.ball.y += ny * overlap;

        // Ball goes opposite to player's touch/movement direction.
        const touchLen = Math.hypot(p.vx, p.vy);
        const tx = touchLen > 0.001 ? p.vx / touchLen : nx;
        const ty = touchLen > 0.001 ? p.vy / touchLen : ny;
        const kickSpeed = width * 0.22;
        const attackGoalX = p.team === 'A' ? pitchX + pitchW + goalDepth : pitchX - goalDepth;
        const attackGoalY = midY;
        const goalDx = attackGoalX - state.ball.x;
        const goalDy = attackGoalY - state.ball.y;
        const goalLen = Math.hypot(goalDx, goalDy) || 1;
        const goalNx = goalDx / goalLen;
        const goalNy = goalDy / goalLen;
        state.ball.vx = -tx * kickSpeed + nx * width * 0.03 + goalNx * width * 0.05;
        state.ball.vy = -ty * kickSpeed + ny * width * 0.02 + goalNy * width * 0.03;
      }

      context.fillStyle = p.team === 'A' ? '#1d4ed8' : '#dc2626';
      context.beginPath();
      context.arc(p.x, p.y, playerRadius, 0, Math.PI * 2);
      context.fill();
    }

    state.ball.x += state.ball.vx * dt;
    state.ball.y += state.ball.vy * dt;
    state.ball.vx *= Math.pow(0.992, dt * 60);
    state.ball.vy *= Math.pow(0.992, dt * 60);
    const ballSpeed = Math.hypot(state.ball.vx, state.ball.vy);
    const minBallSpeed = width * 0.03;
    if (ballSpeed < minBallSpeed) {
      // Keep the ball alive so it never remains idle.
      const boostAngle = time * 1.7 + Math.sin(time * 0.83) * 0.9;
      state.ball.vx += Math.cos(boostAngle) * width * 0.015;
      state.ball.vy += Math.sin(boostAngle) * width * 0.01;
    }

    const ballMinX = pitchX + ballRadius;
    const ballMaxX = pitchX + pitchW - ballRadius;
    const ballMinY = pitchY + ballRadius;
    const ballMaxY = pitchY + pitchH - ballRadius;
    if (state.ball.x <= ballMinX || state.ball.x >= ballMaxX) {
      state.ball.x = clamp(state.ball.x, ballMinX, ballMaxX);
      state.ball.vx *= -0.82;
    }
    if (state.ball.y <= ballMinY || state.ball.y >= ballMaxY) {
      state.ball.y = clamp(state.ball.y, ballMinY, ballMaxY);
      state.ball.vy *= -0.82;
    }

    // Keeper contact also deflects the ball opposite to keeper movement.
    const kdx = state.ball.x - keeperX;
    const kdy = state.ball.y - keeperY;
    const kDist = Math.hypot(kdx, kdy);
    const kMin = keeperRadius + ballRadius;
    if (kDist > 0 && kDist < kMin) {
      const knx = kdx / kDist;
      const kny = kdy / kDist;
      const keeperVx = 0;
      const keeperVy = Math.cos(time * 2.2) * goalW * 0.33;
      const kLen = Math.hypot(keeperVx, keeperVy);
      const ktx = kLen > 0.001 ? keeperVx / kLen : knx;
      const kty = kLen > 0.001 ? keeperVy / kLen : kny;
      state.ball.vx = -ktx * (width * 0.2) + knx * width * 0.02;
      state.ball.vy = -kty * (width * 0.2) + kny * width * 0.02;
      state.ball.x = keeperX + knx * kMin;
      state.ball.y = keeperY + kny * kMin;
    }

    // Draw goalkeeper
    context.fillStyle = '#fbbf24';
    context.beginPath();
    context.arc(keeperX, keeperY, keeperRadius, 0, Math.PI * 2);
    context.fill();

    // Draw the football icon from football.svg path data.
    drawFootball({
      context,
      x: state.ball.x,
      y: state.ball.y,
      size: ballRadius * 2.1,
      rotation: state.ball.rotation
    });
    state.ball.rotation += Math.hypot(state.ball.vx, state.ball.vy) * dt * 0.01;

    // Goal detection: count only if ball enters goal mouth and passes keeper x position.
    const inGoalMouth = Math.abs(state.ball.y - midY) <= goalW * 0.5;
    const crossedRight = state.ball.x >= pitchX + pitchW - ballRadius * 0.35;
    const crossedLeft = state.ball.x <= pitchX + ballRadius * 0.35;
    const passedKeeper = state.ball.x > keeperX + keeperRadius * 0.75;

    if (inGoalMouth && crossedRight && passedKeeper) {
      state.scoreA += 1;
      state.roundStart = time;
      state.ball.x = midX;
      state.ball.y = midY;
      state.ball.vx = width * (0.14 + Math.random() * 0.08);
      state.ball.vy = (Math.random() - 0.5) * height * 0.12;
    } else if (inGoalMouth && crossedLeft) {
      state.scoreB += 1;
      state.roundStart = time;
      state.ball.x = midX;
      state.ball.y = midY;
      state.ball.vx = -width * (0.14 + Math.random() * 0.08);
      state.ball.vy = (Math.random() - 0.5) * height * 0.12;
    }

    // Temporary dashboard (live in-session only).
    const panelW = width * 0.28;
    const panelH = height * 0.14;
    const panelX = width * 0.03;
    const panelY = height * 0.03;
    context.fillStyle = 'rgba(2, 6, 23, 0.7)';
    context.fillRect(panelX, panelY, panelW, panelH);
    context.strokeStyle = 'rgba(226, 251, 232, 0.5)';
    context.lineWidth = 2;
    context.strokeRect(panelX, panelY, panelW, panelH);

    context.fillStyle = '#e2fbe8';
    context.font = `${Math.floor(height * 0.024)}px sans-serif`;
    context.fillText(`Goals (temporary): Blue ${state.scoreA} - Red ${state.scoreB}`, panelX + panelW * 0.07, panelY + panelH * 0.42);
    context.fillText(`Pitch: ${pitchLengthM}m x ${pitchWidthM}m`, panelX + panelW * 0.07, panelY + panelH * 0.75);

    // Side labels for dimensions.
    context.fillStyle = 'rgba(226, 251, 232, 0.9)';
    context.font = `${Math.floor(height * 0.018)}px sans-serif`;
    context.fillText(`${pitchLengthM} m`, midX - width * 0.022, pitchY - height * 0.018);
    context.save();
    context.translate(pitchX - width * 0.02, midY + height * 0.02);
    context.rotate(-Math.PI * 0.5);
    context.fillText(`${pitchWidthM} m`, 0, 0);
    context.restore();
  };
};

canvasSketch(sketch, settings);
