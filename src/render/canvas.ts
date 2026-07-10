import { getZone } from '../data/zones';
import { getEnemyPosition, getShipPosition } from '../game/combat';
import type { DamageEvent, GameState, Projectile } from '../game/types';
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

  render(state: GameState, deltaSeconds: number): void {
    this.time += deltaSeconds;
    const ctx = this.ctx;

    drawStarfield(ctx, this.width, this.height, Math.floor(this.time * 10));

    const zone = getZone(state.combat.zoneId);
    ctx.fillStyle = 'rgba(61, 232, 255, 0.12)';
    ctx.font = '600 14px Orbitron, sans-serif';
    ctx.fillText(zone.name, 20, 28);
    if (state.combat.isBoss) {
      this.drawBossWarning();
    }

    const shipBob = Math.sin(this.time * 2.8) * 3;
    drawShipSprite(
      ctx,
      getShipPosition().x,
      getShipPosition().y,
      state.ship.shield / Math.max(1, state.ship.maxShield),
      shipBob,
    );

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

  private drawBossWarning(): void {
    const pulse = 0.45 + Math.sin(this.time * 5) * 0.15;
    this.ctx.save();
    this.ctx.fillStyle = `rgba(255, 92, 122, ${pulse})`;
    this.ctx.font = '700 13px Orbitron, sans-serif';
    this.ctx.fillText('ALERTA DE CHEFE', 20, 50);
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
