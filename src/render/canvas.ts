import { getZone } from '../data/zones';
import { getEnemyPosition, getShipPosition } from '../game/combat';
import type { DamageEvent, GameState, Projectile, TacticalOrderVisual } from '../game/types';
import {
  drawDamageNumber,
  drawEnemySprite,
  drawProjectile,
  drawShipSprite,
  drawStarfield,
} from './sprites';

export class BattleRenderer {
  private ctx: CanvasRenderingContext2D;
  private width: number;
  private height: number;
  private damageEvents: DamageEvent[] = [];
  private projectiles: Projectile[] = [];
  private tacticalOrderVisuals: TacticalOrderVisual[] = [];
  private time = 0;

  constructor(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D não disponível');
    this.ctx = ctx;
    this.width = canvas.width;
    this.height = canvas.height;
  }

  addCombatFX(damageEvents: DamageEvent[], projectiles: Projectile[]): void {
    this.damageEvents.push(...damageEvents);
    this.projectiles.push(...projectiles);
  }

  addTacticalOrderFX(visual: TacticalOrderVisual): void {
    this.tacticalOrderVisuals.push(visual);
  }

  render(state: GameState, deltaSeconds: number): void {
    this.time += deltaSeconds;
    const ctx = this.ctx;

    drawStarfield(ctx, this.width, this.height, Math.floor(this.time * 10));

    const zone = getZone(state.combat.zoneId);
    const labelOrigin = this.getBattleLabelOrigin();
    ctx.fillStyle = 'rgba(61, 232, 255, 0.12)';
    ctx.font = '600 14px Orbitron, sans-serif';
    ctx.fillText(zone.name, labelOrigin.x, labelOrigin.y);
    if (state.combat.isBoss) {
      this.drawBossWarning(labelOrigin.x, labelOrigin.y + 22);
    }

    const shipBob = Math.sin(this.time * 2.8) * 3;
    drawShipSprite(
      ctx,
      getShipPosition().x,
      getShipPosition().y,
      state.ship.shield / Math.max(1, state.ship.maxShield),
      shipBob,
    );
    this.updateTacticalOrderVisuals(deltaSeconds);
    this.drawTacticalOrderVisuals(shipBob);

    const enemyBob = Math.sin(this.time * 2.5) * 4;
    if (state.combat.isBoss) {
      this.drawBossAura(getEnemyPosition().x, getEnemyPosition().y + enemyBob);
    }
    drawEnemySprite(
      ctx,
      getEnemyPosition().x,
      getEnemyPosition().y,
      state.combat.enemyColor,
      state.combat.enemyAccent,
      state.combat.enemySprite,
      enemyBob,
    );

    this.updateProjectiles(deltaSeconds);
    for (const projectile of this.projectiles) {
      const x = projectile.fromX + (projectile.toX - projectile.fromX) * projectile.progress;
      const y = projectile.fromY + (projectile.toY - projectile.fromY) * projectile.progress;
      drawProjectile(ctx, x, y, projectile.color);
    }

    this.updateDamageEvents(deltaSeconds);
    for (const event of this.damageEvents) {
      drawDamageNumber(
        ctx,
        event.x,
        event.y - (1 - event.life) * 30,
        event.amount,
        event.life,
        event.color,
      );
    }
  }

  private updateProjectiles(deltaSeconds: number): void {
    this.projectiles = this.projectiles
      .map((p) => ({ ...p, progress: p.progress + p.speed * deltaSeconds }))
      .filter((p) => p.progress < 1);
  }

  private updateDamageEvents(deltaSeconds: number): void {
    this.damageEvents = this.damageEvents
      .map((e) => ({ ...e, life: e.life - deltaSeconds }))
      .filter((e) => e.life > 0);
  }

  private updateTacticalOrderVisuals(deltaSeconds: number): void {
    this.tacticalOrderVisuals = this.tacticalOrderVisuals
      .map((visual) => ({ ...visual, life: visual.life - deltaSeconds }))
      .filter((visual) => visual.life > 0);
  }

  private drawTacticalOrderVisuals(shipBob: number): void {
    for (const visual of this.tacticalOrderVisuals) {
      if (visual.type === 'focused-fire') {
        this.drawFocusedFireFX(visual.life);
      } else if (visual.type === 'forward-shields') {
        this.drawForwardShieldsFX(visual.life, shipBob);
      } else {
        this.drawEvasiveManeuverFX(visual.life, shipBob);
      }
      this.drawTacticalOrderImpact(visual, shipBob);
    }
  }

  private drawFocusedFireFX(life: number): void {
    const ship = getShipPosition();
    const enemy = getEnemyPosition();
    const alpha = Math.min(1, life * 1.4);

    this.ctx.save();
    this.ctx.globalAlpha = alpha;
    this.ctx.lineCap = 'round';
    for (let i = -1; i <= 1; i += 1) {
      this.ctx.strokeStyle = i === 0 ? '#ffd166' : '#ff5c7a';
      this.ctx.shadowColor = this.ctx.strokeStyle;
      this.ctx.shadowBlur = 16;
      this.ctx.lineWidth = i === 0 ? 5 : 2;
      this.ctx.beginPath();
      this.ctx.moveTo(ship.x + 54, ship.y - 8 + i * 7);
      this.ctx.lineTo(enemy.x - 24, enemy.y + i * 10);
      this.ctx.stroke();
    }
    this.ctx.restore();
  }

  private drawForwardShieldsFX(life: number, shipBob: number): void {
    const ship = getShipPosition();
    const alpha = Math.min(1, life * 1.5);
    const pulse = 1 + Math.sin(this.time * 18) * 0.06;

    this.ctx.save();
    this.ctx.globalAlpha = alpha;
    this.ctx.strokeStyle = '#5cffb1';
    this.ctx.shadowColor = '#5cffb1';
    this.ctx.shadowBlur = 20;
    this.ctx.lineWidth = 4;
    this.ctx.beginPath();
    this.ctx.ellipse(ship.x + 22, ship.y + shipBob, 42 * pulse, 38 * pulse, 0, -Math.PI * 0.42, Math.PI * 0.42);
    this.ctx.stroke();
    this.ctx.restore();
  }

  private drawEvasiveManeuverFX(life: number, shipBob: number): void {
    const ship = getShipPosition();
    const alpha = Math.min(1, life * 1.6);

    this.ctx.save();
    this.ctx.globalAlpha = alpha;
    this.ctx.strokeStyle = '#8ef9ff';
    this.ctx.shadowColor = '#8ef9ff';
    this.ctx.shadowBlur = 14;
    this.ctx.lineWidth = 3;
    for (let i = 0; i < 3; i += 1) {
      const offset = 22 + i * 16;
      this.ctx.beginPath();
      this.ctx.moveTo(ship.x - offset, ship.y + shipBob - 18 + i * 10);
      this.ctx.lineTo(ship.x - offset - 38, ship.y + shipBob - 24 + i * 10);
      this.ctx.stroke();
    }
    this.ctx.restore();
  }

  private drawTacticalOrderImpact(visual: TacticalOrderVisual, shipBob: number): void {
    const ship = getShipPosition();
    const alpha = Math.min(1, visual.life * 1.7);
    const rise = (1 - visual.life) * 22;
    const x = ship.x - 66;
    const y = ship.y + shipBob - 58 - rise;

    this.ctx.save();
    this.ctx.globalAlpha = alpha;
    this.ctx.font = '700 12px Orbitron, sans-serif';
    const paddingX = 9;
    const width = this.ctx.measureText(visual.label).width + paddingX * 2;
    this.ctx.fillStyle = 'rgba(5, 10, 18, 0.74)';
    this.ctx.strokeStyle = visual.color;
    this.ctx.shadowColor = visual.color;
    this.ctx.shadowBlur = 12;
    this.roundRect(x, y - 17, width, 24, 7);
    this.ctx.fill();
    this.ctx.stroke();
    this.ctx.shadowBlur = 0;
    this.ctx.fillStyle = visual.color;
    this.ctx.fillText(visual.label, x + paddingX, y);
    this.ctx.restore();
  }

  private roundRect(x: number, y: number, width: number, height: number, radius: number): void {
    this.ctx.beginPath();
    this.ctx.moveTo(x + radius, y);
    this.ctx.lineTo(x + width - radius, y);
    this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    this.ctx.lineTo(x + width, y + height - radius);
    this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    this.ctx.lineTo(x + radius, y + height);
    this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    this.ctx.lineTo(x, y + radius);
    this.ctx.quadraticCurveTo(x, y, x + radius, y);
    this.ctx.closePath();
  }

  private getBattleLabelOrigin(): { x: number; y: number } {
    const canvas = this.ctx.canvas;
    const cssWidth = canvas.clientWidth || this.width;
    const cssHeight = canvas.clientHeight || this.height;
    const safeLeftPx = Math.min(360, cssWidth * 0.24);
    const safeTopPx = Math.min(170, cssHeight * 0.18);

    return {
      x: Math.max(20, (safeLeftPx / cssWidth) * this.width),
      y: Math.max(28, (safeTopPx / cssHeight) * this.height),
    };
  }

  private drawBossWarning(x: number, y: number): void {
    const pulse = 0.45 + Math.sin(this.time * 5) * 0.15;
    this.ctx.save();
    this.ctx.fillStyle = `rgba(255, 92, 122, ${pulse})`;
    this.ctx.font = '700 13px Orbitron, sans-serif';
    this.ctx.fillText('ALERTA DE CHEFE', x, y);
    this.ctx.restore();
  }

  private drawBossAura(x: number, y: number): void {
    const radius = 46 + Math.sin(this.time * 4) * 5;
    const gradient = this.ctx.createRadialGradient(x, y, 10, x, y, radius);
    gradient.addColorStop(0, 'rgba(255, 92, 122, 0.24)');
    gradient.addColorStop(0.55, 'rgba(255, 209, 102, 0.12)');
    gradient.addColorStop(1, 'rgba(255, 92, 122, 0)');

    this.ctx.save();
    this.ctx.fillStyle = gradient;
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.restore();
  }
}
