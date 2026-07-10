export function drawStarfield(ctx: CanvasRenderingContext2D, width: number, height: number, seed: number): void {
  ctx.fillStyle = '#050a12';
  ctx.fillRect(0, 0, width, height);

  for (let i = 0; i < 80; i++) {
    const x = ((seed * (i + 1) * 97) % width);
    const y = ((seed * (i + 3) * 53) % height);
    const size = (i % 3) + 1;
    ctx.fillStyle = i % 5 === 0 ? '#8ec5ff' : '#d8e8ff';
    ctx.globalAlpha = 0.3 + (i % 7) * 0.08;
    ctx.fillRect(x, y, size, size);
  }
  ctx.globalAlpha = 1;
}

export function drawHeroSprite(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  color: string,
  accent: string,
  role: string,
  bob: number,
): void {
  const py = y + bob;
  ctx.save();
  ctx.translate(x, py);

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.beginPath();
  ctx.ellipse(0, 28, 18, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  // Body
  ctx.fillStyle = color;
  ctx.fillRect(-14, -8, 28, 34);

  // Chest plate
  ctx.fillStyle = accent;
  ctx.fillRect(-10, -2, 20, 14);

  // Helmet
  ctx.fillStyle = '#0b1424';
  ctx.fillRect(-12, -24, 24, 18);
  ctx.fillStyle = accent;
  ctx.fillRect(-8, -20, 16, 6);

  // Role-specific details
  if (role === 'gunner') {
    ctx.fillStyle = '#ff8ea8';
    ctx.fillRect(10, 0, 18, 6);
    ctx.fillRect(24, -2, 8, 10);
  } else if (role === 'engineer') {
    ctx.fillStyle = '#ffe08a';
    ctx.fillRect(-18, 8, 10, 10);
    ctx.fillRect(-16, 10, 6, 6);
  } else if (role === 'medic') {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-3, 4, 6, 14);
    ctx.fillRect(-8, 9, 16, 4);
  } else {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-2, -12, 4, 10);
  }

  // Legs
  ctx.fillStyle = color;
  ctx.fillRect(-10, 24, 8, 10);
  ctx.fillRect(2, 24, 8, 10);

  ctx.restore();
}

export function drawEnemySprite(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  color: string,
  accent: string,
  sprite: 'drone' | 'alien' | 'mech' | 'boss',
  bob: number,
): void {
  const py = y + bob;
  ctx.save();
  ctx.translate(x, py);

  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.beginPath();
  ctx.ellipse(0, 30, 22, 7, 0, 0, Math.PI * 2);
  ctx.fill();

  if (sprite === 'drone') {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, -24);
    ctx.lineTo(24, 0);
    ctx.lineTo(0, 24);
    ctx.lineTo(-24, 0);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = accent;
    ctx.fillRect(-6, -6, 12, 12);
    ctx.fillStyle = '#ff5c7a';
    ctx.fillRect(-18, -2, 8, 4);
    ctx.fillRect(10, -2, 8, 4);
  } else if (sprite === 'alien') {
    ctx.fillStyle = color;
    ctx.fillRect(-16, -10, 32, 36);
    ctx.fillStyle = accent;
    ctx.fillRect(-10, -18, 20, 12);
    ctx.fillStyle = '#111827';
    ctx.fillRect(-8, -14, 5, 5);
    ctx.fillRect(3, -14, 5, 5);
    ctx.fillStyle = '#5cffb1';
    ctx.fillRect(-4, 8, 8, 12);
  } else if (sprite === 'mech') {
    ctx.fillStyle = color;
    ctx.fillRect(-22, -16, 44, 40);
    ctx.fillStyle = accent;
    ctx.fillRect(-16, -10, 32, 16);
    ctx.fillStyle = '#111827';
    ctx.fillRect(-10, -6, 8, 8);
    ctx.fillRect(2, -6, 8, 8);
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(-26, 4, 8, 20);
    ctx.fillRect(18, 4, 8, 20);
  } else {
    ctx.fillStyle = color;
    ctx.fillRect(-26, -28, 52, 52);
    ctx.fillStyle = accent;
    ctx.fillRect(-18, -18, 36, 20);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-10, -8);
    ctx.lineTo(10, -8);
    ctx.moveTo(0, -8);
    ctx.lineTo(0, 8);
    ctx.stroke();
    ctx.fillStyle = '#fde047';
    ctx.fillRect(-30, -4, 8, 24);
    ctx.fillRect(22, -4, 8, 24);
  }

  ctx.restore();
}

export function drawProjectile(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  color: string,
): void {
  ctx.save();
  ctx.fillStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = 12;
  ctx.beginPath();
  ctx.arc(x, y, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function drawDamageNumber(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  amount: number,
  alpha: number,
): void {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.font = '600 16px Orbitron, sans-serif';
  ctx.fillStyle = '#8ef9ff';
  ctx.strokeStyle = '#04313a';
  ctx.lineWidth = 3;
  ctx.strokeText(`-${amount}`, x, y);
  ctx.fillText(`-${amount}`, x, y);
  ctx.restore();
}

export function drawCrewPortrait(
  ctx: CanvasRenderingContext2D,
  color: string,
  accent: string,
  role: string,
): void {
  ctx.clearRect(0, 0, 56, 56);
  ctx.fillStyle = '#08111f';
  ctx.fillRect(0, 0, 56, 56);
  drawHeroSprite(ctx, 28, 30, color, accent, role, 0);
}
