import { distributeXp, getCreditReward, getHeroAttack, getHeroAttackInterval, getXpReward } from './progression';
import { createEnemyForWave } from './state';
import type { CombatTickResult, DamageEvent, GameState, Projectile } from './types';

const HERO_POSITIONS = [
  { x: 120, y: 170 },
  { x: 170, y: 220 },
  { x: 220, y: 150 },
  { x: 270, y: 200 },
];

const ENEMY_POSITION = { x: 560, y: 180 };

export function getHeroPositions() {
  return HERO_POSITIONS;
}

export function getEnemyPosition() {
  return ENEMY_POSITION;
}

export function processCombatTick(state: GameState, deltaSeconds: number): CombatTickResult {
  const damageEvents: DamageEvent[] = [];
  const projectiles: Projectile[] = [];
  let killCount = 0;

  for (let i = 0; i < state.heroes.length; i++) {
    const hero = state.heroes[i];
    hero.attackTimer += deltaSeconds;

    const interval = getHeroAttackInterval(hero, state);
    while (hero.attackTimer >= interval) {
      hero.attackTimer -= interval;
      const damage = getHeroAttack(hero, state);
      state.combat.enemyHp = Math.max(0, state.combat.enemyHp - damage);

      const pos = HERO_POSITIONS[i];
      damageEvents.push({
        x: ENEMY_POSITION.x + (Math.random() - 0.5) * 30,
        y: ENEMY_POSITION.y - 40 + (Math.random() - 0.5) * 20,
        amount: damage,
        color: '#8ef9ff',
        life: 0.8,
      });

      projectiles.push({
        fromX: pos.x + 20,
        fromY: pos.y,
        toX: ENEMY_POSITION.x - 20,
        toY: ENEMY_POSITION.y,
        progress: 0,
        color: '#3de8ff',
        speed: 3.5,
      });

      if (state.combat.enemyHp <= 0) {
        killCount += resolveEnemyDefeat(state);
      }
    }
  }

  return { damageEvents, projectiles, killCount };
}

function resolveEnemyDefeat(state: GameState): number {
  state.credits += getCreditReward(state);
  distributeXp(state, getXpReward(state));
  state.totalEnemiesDefeated += 1;
  advanceCombatAfterVictory(state);

  return 1;
}

function advanceCombatAfterVictory(state: GameState): void {
  const nextWave = state.combat.wave + 1;
  const bossEvery = 10;

  if (nextWave > bossEvery && state.combat.zoneId < 4) {
    state.combat = createEnemyForWave(state.combat.zoneId + 1, 1);
    return;
  }

  if (nextWave > bossEvery * 2 && state.combat.zoneId === 4) {
    state.combat = createEnemyForWave(1, 1);
    return;
  }

  state.combat = createEnemyForWave(state.combat.zoneId, nextWave);
}

export function applyOfflineProgress(state: GameState, elapsedSeconds: number): number {
  const capped = Math.min(elapsedSeconds, 8 * 3600);
  const dps = state.heroes.reduce((sum, hero) => {
    return sum + getHeroAttack(hero, state) / getHeroAttackInterval(hero, state);
  }, 0);

  const kills = Math.floor((dps * capped * 0.5) / Math.max(1, state.combat.enemyMaxHp));
  let totalCredits = 0;

  for (let i = 0; i < kills; i++) {
    totalCredits += getCreditReward(state);
    distributeXp(state, Math.floor(getXpReward(state) * 0.5));
    state.totalEnemiesDefeated += 1;
    advanceCombatAfterVictory(state);
  }

  state.credits += totalCredits;
  return kills;
}
