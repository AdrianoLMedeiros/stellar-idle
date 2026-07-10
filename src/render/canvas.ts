import { getHeroTemplate } from '../data/heroes';
import { getZone } from '../data/zones';
import { getEnemyPosition, getHeroPositions } from '../game/combat';
import type { DamageEvent, GameState, Projectile } from '../game/types';
import {
  drawDamageNumber,
  drawEnemySprite,
  drawHeroSprite,
  drawProjectile,
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

    const heroPositions = getHeroPositions();
    state.heroes.forEach((hero, index) => {
      const template = getHeroTemplate(hero.id);
      const bob = Math.sin(this.time * 3 + index) * 3;
      drawHeroSprite(
        ctx,
        heroPositions[index].x,
        heroPositions[index].y,
        template.color,
        template.accent,
        template.role,
        bob,
      );
    });

    const enemyBob = Math.sin(this.time * 2.5) * 4;
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
      drawDamageNumber(ctx, event.x, event.y - (1 - event.life) * 30, event.amount, event.life);
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
}
