import { HERO_TEMPLATES } from '../data/heroes';
import { UPGRADE_TEMPLATES } from '../data/upgrades';
import { getZone } from '../data/zones';
import type { CombatState, GameState, HeroState } from './types';

const BASE_ENEMY_HP = 40;
const BASE_ENEMY_ATK = 5;
const BOSS_EVERY_WAVES = 10;
const BOSS_HP_MULTIPLIER = 4.5;
const BOSS_ATK_MULTIPLIER = 2.25;

export const BASE_SHIP_HULL = 180;
export const BASE_SHIP_SHIELD = 90;

export function createInitialHeroes(): HeroState[] {
  return HERO_TEMPLATES.map((hero) => ({
    id: hero.id,
    level: 1,
    xp: 0,
    skillPoints: 0,
    unlockedSkills: [],
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

export function createEnemyForWave(zoneId: number, wave: number): CombatState {
  const zone = getZone(zoneId);
  const enemyIndex = (wave - 1) % zone.enemies.length;
  const isBoss = wave % BOSS_EVERY_WAVES === 0;
  const enemy = isBoss ? zone.boss : zone.enemies[enemyIndex];
  const bossScale = isBoss ? BOSS_HP_MULTIPLIER : 1;
  const hpScale = zone.enemyHpMultiplier * Math.pow(1.12, wave - 1) * bossScale;
  const maxHp = Math.floor(BASE_ENEMY_HP * hpScale);
  const atkScale = zone.enemyHpMultiplier * Math.pow(1.08, wave - 1) * (isBoss ? BOSS_ATK_MULTIPLIER : 1);
  const enemyAtk = Math.floor(BASE_ENEMY_ATK * atkScale);

  return {
    zoneId,
    wave,
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
    credits: 0,
    quantumCrystals: 0,
    prestigeCount: 0,
    ship: createInitialShip(),
    heroes: createInitialHeroes(),
    upgrades: createInitialUpgrades(),
    combat: createEnemyForWave(1, 1),
    lastTick: now,
    lastSave: now,
    totalEnemiesDefeated: 0,
  };
}

export function getPrestigeMultiplier(state: GameState): number {
  return 1 + state.quantumCrystals * 0.05;
}

export function estimatePrestigeGain(state: GameState): number {
  const zoneBonus = state.combat.zoneId * 2;
  const waveBonus = Math.floor(state.combat.wave / 5);
  const defeatBonus = Math.floor(state.totalEnemiesDefeated / 25);
  return Math.max(1, zoneBonus + waveBonus + defeatBonus);
}

export function canPrestige(state: GameState): boolean {
  return state.combat.zoneId >= 2 || state.combat.wave >= 15;
}
