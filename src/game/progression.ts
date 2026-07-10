import { getHeroTemplate } from '../data/heroes';
import { getUpgradeTemplate } from '../data/upgrades';
import { getZone } from '../data/zones';
import { getPrestigeMultiplier } from './state';
import type { GameState, HeroState } from './types';

export function getUpgradeLevel(state: GameState, id: string): number {
  return state.upgrades.find((u) => u.id === id)?.level ?? 0;
}

export function getUpgradeCost(id: string, level: number): number {
  const template = getUpgradeTemplate(id);
  return Math.floor(template.baseCost * Math.pow(template.costGrowth, level));
}

export function getHeroAttack(hero: HeroState, state: GameState): number {
  const template = getHeroTemplate(hero.id);
  const weaponLevel = getUpgradeLevel(state, 'weapons');
  const weaponBonus = getUpgradeTemplate('weapons').effectPerLevel * weaponLevel;
  const prestige = getPrestigeMultiplier(state);
  const levelScale = 1 + (hero.level - 1) * 0.15;
  return Math.floor((template.baseAtk + weaponBonus) * levelScale * prestige);
}

export function getHeroAttackInterval(hero: HeroState, state: GameState): number {
  const template = getHeroTemplate(hero.id);
  const shieldLevel = getUpgradeLevel(state, 'shields');
  const speedBonus = getUpgradeTemplate('shields').effectPerLevel * shieldLevel;
  return Math.max(0.35, template.attackInterval * (1 - speedBonus));
}

export function getFleetDps(state: GameState): number {
  return state.heroes.reduce((total, hero) => {
    const atk = getHeroAttack(hero, state);
    const interval = getHeroAttackInterval(hero, state);
    return total + atk / interval;
  }, 0);
}

export function getCreditReward(state: GameState): number {
  const zone = getZone(state.combat.zoneId);
  const scannerLevel = getUpgradeLevel(state, 'scanner');
  const scannerBonus = 1 + getUpgradeTemplate('scanner').effectPerLevel * scannerLevel;
  const prestige = getPrestigeMultiplier(state);
  const waveBonus = 1 + (state.combat.wave - 1) * 0.05;
  return Math.floor(12 * zone.creditMultiplier * scannerBonus * prestige * waveBonus);
}

export function getXpReward(state: GameState): number {
  const trainingLevel = getUpgradeLevel(state, 'training');
  const trainingBonus = 1 + getUpgradeTemplate('training').effectPerLevel * trainingLevel;
  const prestige = getPrestigeMultiplier(state);
  return Math.floor(8 * trainingBonus * prestige);
}

export function xpToLevel(level: number): number {
  return Math.floor(40 * Math.pow(1.22, level - 1));
}

export function addHeroXp(state: GameState, heroId: string, amount: number): void {
  const hero = state.heroes.find((h) => h.id === heroId);
  if (!hero) return;

  hero.xp += amount;
  while (hero.xp > 0) {
    const needed = xpToLevel(hero.level);
    if (hero.xp >= needed) {
      hero.xp -= needed;
      hero.level += 1;
    } else {
      break;
    }
  }
}

export function distributeXp(state: GameState, amount: number): void {
  const perHero = Math.max(1, Math.floor(amount / state.heroes.length));
  for (const hero of state.heroes) {
    addHeroXp(state, hero.id, perHero);
  }
}

export function buyUpgrade(state: GameState, id: string): boolean {
  const upgrade = state.upgrades.find((u) => u.id === id);
  if (!upgrade) return false;

  const cost = getUpgradeCost(id, upgrade.level);
  if (state.credits < cost) return false;

  state.credits -= cost;
  upgrade.level += 1;
  return true;
}
