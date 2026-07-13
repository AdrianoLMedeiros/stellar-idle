import {
  distributeXp,
  getCreditReward,
  getFleetDps,
  getShipMaxHull,
  getShipMaxShield,
  getShipShieldRegen,
  getShipWeaponDamage,
  getShipWeaponInterval,
  getXpReward,
} from './progression';
import { tickOfficerAbilities } from './abilities';
import { getPremiumMultiplier } from './monetization';
import { createEnemyForWave } from './state';
import { tickTacticalActions } from './tacticalActions';
import {
  consumeTacticalOrderEffect,
  getTacticalOrderEffectValue,
  getTacticalOrderMultiplier,
  tickTacticalOrders,
} from './tacticalOrders';
import type { CombatTickResult, DamageEvent, GameState, Projectile } from './types';

const HERO_POSITIONS = [
  { x: 120, y: 170 },
  { x: 170, y: 220 },
  { x: 220, y: 150 },
  { x: 270, y: 200 },
];

const ENEMY_POSITION = { x: 560, y: 180 };
const SHIP_POSITION = { x: 180, y: 180 };

export function getHeroPositions() {
  return HERO_POSITIONS;
}

export function getShipPosition() {
  return SHIP_POSITION;
}

export function getEnemyPosition() {
  return ENEMY_POSITION;
}

export function processCombatTick(state: GameState, deltaSeconds: number): CombatTickResult {
  const damageEvents: DamageEvent[] = [];
  const projectiles: Projectile[] = [];
  let killCount = 0;
  let retreatCount = 0;

  tickOfficerAbilities(state, deltaSeconds);
  tickTacticalActions(state, deltaSeconds);
  tickTacticalOrders(state, deltaSeconds);
  syncShipStats(state);
  regenerateShield(state, deltaSeconds);

  if (state.combat.enemyHp <= 0) {
    killCount += resolveEnemyDefeat(state);
  }

  state.ship.weaponTimer += deltaSeconds;
  while (state.ship.weaponTimer >= getShipWeaponInterval(state)) {
    state.ship.weaponTimer -= getShipWeaponInterval(state);
    const damage = getShipWeaponDamage(state);
    state.combat.enemyHp = Math.max(0, state.combat.enemyHp - damage);

    damageEvents.push({
      x: ENEMY_POSITION.x + (Math.random() - 0.5) * 30,
      y: ENEMY_POSITION.y - 40 + (Math.random() - 0.5) * 20,
      amount: damage,
      color: '#8ef9ff',
      life: 0.8,
    });

    projectiles.push({
      fromX: SHIP_POSITION.x + 42,
      fromY: SHIP_POSITION.y - 8,
      toX: ENEMY_POSITION.x - 24,
      toY: ENEMY_POSITION.y,
      progress: 0,
      color: '#3de8ff',
      speed: 3.5,
    });

    if (state.combat.enemyHp <= 0) {
      killCount += resolveEnemyDefeat(state);
    }
  }

  state.combat.enemyAttackTimer += deltaSeconds;
  while (state.combat.enemyAttackTimer >= state.combat.enemyAttackInterval) {
    state.combat.enemyAttackTimer -= state.combat.enemyAttackInterval;
    const evasiveManeuver = getTacticalOrderEffectValue(state, 'evasion') > 0;
    const damage = evasiveManeuver
      ? 0
      : Math.max(1, Math.floor(state.combat.enemyAtk * getTacticalOrderMultiplier(state, 'incoming_damage_reduction')));
    if (evasiveManeuver) {
      consumeTacticalOrderEffect(state, 'evasion');
    } else {
      applyShipDamage(state, damage);
    }

    damageEvents.push({
      x: SHIP_POSITION.x + (Math.random() - 0.5) * 36,
      y: SHIP_POSITION.y - 38 + (Math.random() - 0.5) * 18,
      amount: damage,
      color: evasiveManeuver ? '#5cffb1' : '#ff8ea8',
      life: 0.8,
    });

    projectiles.push({
      fromX: ENEMY_POSITION.x - 24,
      fromY: ENEMY_POSITION.y,
      toX: SHIP_POSITION.x + 36,
      toY: SHIP_POSITION.y - 8,
      progress: 0,
      color: '#ff5c7a',
      speed: 2.8,
    });

    if (state.ship.hull <= 0) {
      retreatCount += resolveShipRetreat(state);
      break;
    }
  }

  return { damageEvents, projectiles, killCount, retreatCount };
}

function resolveEnemyDefeat(state: GameState): number {
  state.credits += getCreditReward(state);
  distributeXp(state, getXpReward(state));
  state.totalEnemiesDefeated += 1;
  restoreShipAfterVictory(state);
  advanceCombatAfterVictory(state);

  return 1;
}

function syncShipStats(state: GameState): void {
  const nextMaxHull = getShipMaxHull(state);
  const nextMaxShield = getShipMaxShield(state);
  state.ship.maxHull = nextMaxHull;
  state.ship.maxShield = nextMaxShield;
  state.ship.hull = Math.min(state.ship.hull, nextMaxHull);
  state.ship.shield = Math.min(state.ship.shield, nextMaxShield);
}

function regenerateShield(state: GameState, deltaSeconds: number): void {
  if (state.ship.shield >= state.ship.maxShield) return;
  state.ship.shield = Math.min(
    state.ship.maxShield,
    state.ship.shield + getShipShieldRegen(state) * deltaSeconds,
  );
}

function applyShipDamage(state: GameState, damage: number): void {
  const shieldDamage = Math.min(state.ship.shield, damage);
  state.ship.shield -= shieldDamage;
  state.ship.hull = Math.max(0, state.ship.hull - (damage - shieldDamage));
}

function restoreShipAfterVictory(state: GameState): void {
  const hullRepair = state.ship.maxHull * 0.08;
  const shieldRepair = state.ship.maxShield * 0.35;
  state.ship.hull = Math.min(state.ship.maxHull, state.ship.hull + hullRepair);
  state.ship.shield = Math.min(state.ship.maxShield, state.ship.shield + shieldRepair);
}

function resolveShipRetreat(state: GameState): number {
  state.ship.hull = Math.max(1, Math.floor(state.ship.maxHull * 0.55));
  state.ship.shield = Math.floor(state.ship.maxShield * 0.35);
  state.ship.weaponTimer = 0;
  state.combat = createEnemyForWave(state.combat.zoneId, state.combat.wave, state.combat.cycle);
  return 1;
}

function advanceCombatAfterVictory(state: GameState): void {
  const nextWave = state.combat.wave + 1;
  const bossEvery = 10;

  if (nextWave > bossEvery && state.combat.zoneId < 4) {
    state.combat = createEnemyForWave(state.combat.zoneId + 1, 1, state.combat.cycle);
    return;
  }

  if (nextWave > bossEvery * 2 && state.combat.zoneId === 4) {
    state.combat = createEnemyForWave(1, 1, state.combat.cycle + 1);
    return;
  }

  state.combat = createEnemyForWave(state.combat.zoneId, nextWave, state.combat.cycle);
}

export function applyOfflineProgress(state: GameState, elapsedSeconds: number): number {
  const capped = Math.min(elapsedSeconds, 8 * 3600);
  const dps = getFleetDps(state);

  const offlineEfficiency = 0.5 * getPremiumMultiplier(state, 'offline_efficiency');
  const kills = Math.floor((dps * capped * offlineEfficiency) / Math.max(1, state.combat.enemyMaxHp));
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
