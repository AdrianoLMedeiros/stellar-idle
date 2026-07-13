import { HERO_TEMPLATES } from '../data/heroes';
import { UPGRADE_TEMPLATES } from '../data/upgrades';
import { getZone } from '../data/zones';
import { createInitialPremiumState } from './monetization';
import { createInitialTacticalActions } from './tacticalActions';
import { createInitialTacticalOrders } from './tacticalOrders';
import type { CombatState, GameState, HeroState } from './types';

const BASE_ENEMY_HP = 40;
const BASE_ENEMY_ATK = 5;
const BOSS_EVERY_WAVES = 10;
const BOSS_HP_MULTIPLIER = 4.5;
const BOSS_ATK_MULTIPLIER = 2.25;
// Applied once per full loop through all zones (see advanceCombatAfterVictory), so
// grinding past a prestige reset keeps escalating instead of repeating zone 1-4 flat.
const CYCLE_DIFFICULTY_GROWTH = 1.85;
const CYCLE_REWARD_GROWTH = 1.5;

export const BASE_SHIP_HULL = 180;
export const BASE_SHIP_SHIELD = 90;

export function createInitialHeroes(): HeroState[] {
  return HERO_TEMPLATES.map((hero) => ({
    id: hero.id,
    level: 1,
    xp: 0,
    skillPoints: 0,
    unlockedSkills: [],
    abilityCooldown: 0,
  }));
}

export function createInitialUpgrades() {
  return UPGRADE_TEMPLATES.map((upgrade) => ({
    id: upgrade.id,
    level: 0,
  }));
}

export function createInitialShip() {
  return {
    hull: BASE_SHIP_HULL,
    maxHull: BASE_SHIP_HULL,
    shield: BASE_SHIP_SHIELD,
    maxShield: BASE_SHIP_SHIELD,
    weaponTimer: 0,
  };
}

export function createEnemyForWave(zoneId: number, wave: number, cycle = 0): CombatState {
  const zone = getZone(zoneId);
  const enemyIndex = (wave - 1) % zone.enemies.length;
  const isBoss = wave % BOSS_EVERY_WAVES === 0;
  const enemy = isBoss ? zone.boss : zone.enemies[enemyIndex];
  const bossScale = isBoss ? BOSS_HP_MULTIPLIER : 1;
  const cycleScale = Math.pow(CYCLE_DIFFICULTY_GROWTH, cycle);
  const hpScale = zone.enemyHpMultiplier * Math.pow(1.12, wave - 1) * bossScale * cycleScale;
  const maxHp = Math.floor(BASE_ENEMY_HP * hpScale);
  const atkScale = zone.enemyHpMultiplier * Math.pow(1.08, wave - 1) * (isBoss ? BOSS_ATK_MULTIPLIER : 1) * cycleScale;
  const enemyAtk = Math.floor(BASE_ENEMY_ATK * atkScale);

  return {
    zoneId,
    wave,
    cycle,
    enemyIndex,
    enemyHp: maxHp,
    enemyMaxHp: maxHp,
    enemyName: enemy.name,
    enemySprite: enemy.sprite,
    enemyColor: enemy.color,
    enemyAccent: enemy.accent,
    isBoss,
    enemyAtk,
    enemyAttackInterval: isBoss ? 2.4 : 2.8,
    enemyAttackTimer: 0,
  };
}

export function createInitialState(): GameState {
  const now = Date.now();
  return {
    saveVersion: 6,
    credits: 0,
    quantumCrystals: 0,
    prestigeCount: 0,
    ship: createInitialShip(),
    heroes: createInitialHeroes(),
    upgrades: createInitialUpgrades(),
    premium: createInitialPremiumState(),
    activeAbilityEffects: [],
    tacticalActions: createInitialTacticalActions(),
    activeTacticalEffects: [],
    tacticalOrders: createInitialTacticalOrders(),
    activeTacticalOrderEffects: [],
    operationalFocusId: 'balanced',
    combat: createEnemyForWave(1, 1),
    lastTick: now,
    lastSave: now,
    totalEnemiesDefeated: 0,
  };
}

export function getPrestigeMultiplier(state: GameState): number {
  return 1 + state.quantumCrystals * 0.05;
}

export function getCycleRewardMultiplier(state: GameState): number {
  return Math.pow(CYCLE_REWARD_GROWTH, state.combat.cycle);
}

export function estimatePrestigeGain(state: GameState): number {
  const zoneBonus = state.combat.zoneId * 2;
  const waveBonus = Math.floor(state.combat.wave / 5);
  const defeatBonus = Math.floor(state.totalEnemiesDefeated / 25);
  const cycleBonus = state.combat.cycle * 12;
  return Math.max(1, zoneBonus + waveBonus + defeatBonus + cycleBonus);
}

export function canPrestige(state: GameState): boolean {
  return state.combat.zoneId >= 2 || state.combat.wave >= 15;
}
