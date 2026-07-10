import { HERO_TEMPLATES } from '../data/heroes';
import { UPGRADE_TEMPLATES } from '../data/upgrades';
import { getZone } from '../data/zones';
import type { CombatState, GameState, HeroState } from './types';

const BASE_ENEMY_HP = 40;

export function createInitialHeroes(): HeroState[] {
  return HERO_TEMPLATES.map((hero) => ({
    id: hero.id,
    level: 1,
    xp: 0,
    attackTimer: Math.random() * hero.attackInterval,
  }));
}

export function createInitialUpgrades() {
  return UPGRADE_TEMPLATES.map((upgrade) => ({
    id: upgrade.id,
    level: 0,
  }));
}

export function createEnemyForWave(zoneId: number, wave: number): CombatState {
  const zone = getZone(zoneId);
  const enemyIndex = (wave - 1) % zone.enemies.length;
  const enemy = zone.enemies[enemyIndex];
  const hpScale = zone.enemyHpMultiplier * Math.pow(1.12, wave - 1);
  const maxHp = Math.floor(BASE_ENEMY_HP * hpScale);

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
  };
}

export function createInitialState(): GameState {
  const now = Date.now();
  return {
    credits: 0,
    quantumCrystals: 0,
    prestigeCount: 0,
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
