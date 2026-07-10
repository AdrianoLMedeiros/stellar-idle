import { getSkill, getSkillEffectMultiplier } from '../data/skills';
import { getUpgradeTemplate } from '../data/upgrades';
import { getZone } from '../data/zones';
import { getPremiumMultiplier } from './monetization';
import { BASE_SHIP_HULL, BASE_SHIP_SHIELD, getPrestigeMultiplier } from './state';
import { getTacticalEffectMultiplier } from './tacticalActions';
import type { GameState } from './types';

export function getUpgradeLevel(state: GameState, id: string): number {
  return state.upgrades.find((u) => u.id === id)?.level ?? 0;
}

export function getUpgradeCost(id: string, level: number): number {
  const template = getUpgradeTemplate(id);
  return Math.floor(template.baseCost * Math.pow(template.costGrowth, level));
}

export function getShipMaxHull(state: GameState): number {
  const captain = state.heroes.find((hero) => hero.id === 'nova');
  const captainBonus = captain ? (captain.level - 1) * 8 : 0;
  const engineer = state.heroes.find((hero) => hero.id === 'aria');
  const engineerBonus = engineer ? (engineer.level - 1) * 5 : 0;
  const prestige = getPrestigeMultiplier(state);
  const skillMultiplier = getSkillEffectMultiplier(state, 'ship_hull');
  return Math.floor((BASE_SHIP_HULL + captainBonus + engineerBonus) * prestige * skillMultiplier);
}

export function getShipMaxShield(state: GameState): number {
  const shieldLevel = getUpgradeLevel(state, 'shields');
  const engineer = state.heroes.find((hero) => hero.id === 'aria');
  const engineerBonus = engineer ? (engineer.level - 1) * 7 : 0;
  const upgradeBonus = shieldLevel * 14;
  const prestige = getPrestigeMultiplier(state);
  const skillMultiplier = getSkillEffectMultiplier(state, 'ship_shield');
  return Math.floor((BASE_SHIP_SHIELD + engineerBonus + upgradeBonus) * prestige * skillMultiplier);
}

export function getShipShieldRegen(state: GameState): number {
  const shieldLevel = getUpgradeLevel(state, 'shields');
  const support = state.heroes.find((hero) => hero.id === 'lyra');
  const supportBonus = support ? (support.level - 1) * 0.08 : 0;
  const skillMultiplier = getSkillEffectMultiplier(state, 'shield_regen');
  return (1.2 + shieldLevel * 0.18 + supportBonus) * skillMultiplier;
}

export function getShipWeaponDamage(state: GameState): number {
  const gunner = state.heroes.find((hero) => hero.id === 'vex');
  const gunnerLevel = gunner?.level ?? 1;
  const weaponLevel = getUpgradeLevel(state, 'weapons');
  const captain = state.heroes.find((hero) => hero.id === 'nova');
  const commandBonus = captain ? 1 + (captain.level - 1) * 0.02 : 1;
  const prestige = getPrestigeMultiplier(state);
  const skillMultiplier = getSkillEffectMultiplier(state, 'weapon_damage');
  const tacticalMultiplier = getTacticalEffectMultiplier(state, 'weapon_damage');
  return Math.floor(
    (18 + weaponLevel * 4 + (gunnerLevel - 1) * 3) * commandBonus * prestige * skillMultiplier * tacticalMultiplier,
  );
}

export function getShipWeaponInterval(state: GameState): number {
  const gunner = state.heroes.find((hero) => hero.id === 'vex');
  const gunnerBonus = gunner ? (gunner.level - 1) * 0.015 : 0;
  const trainingLevel = getUpgradeLevel(state, 'training');
  const tacticalBonus = trainingLevel * 0.01;
  const skillSpeedBonus = getSkillEffectMultiplier(state, 'weapon_speed') - 1;
  const abilitySpeedBonus = (state.activeAbilityEffects ?? []).reduce((sum, activeEffect) => {
    return sum + activeEffect.effects
      .filter((effect) => effect.type === 'weapon_speed')
      .reduce((effectSum, effect) => effectSum + effect.value, 0);
  }, 0);
  return Math.max(0.55, 1.35 * (1 - gunnerBonus - tacticalBonus - skillSpeedBonus - abilitySpeedBonus));
}

export function getFleetDps(state: GameState): number {
  return getShipWeaponDamage(state) / getShipWeaponInterval(state);
}

export function getCreditReward(state: GameState): number {
  const zone = getZone(state.combat.zoneId);
  const scannerLevel = getUpgradeLevel(state, 'scanner');
  const scannerBonus = 1 + getUpgradeTemplate('scanner').effectPerLevel * scannerLevel;
  const prestige = getPrestigeMultiplier(state);
  const waveBonus = 1 + (state.combat.wave - 1) * 0.05;
  const bossBonus = state.combat.isBoss ? 3 : 1;
  const skillMultiplier = getSkillEffectMultiplier(state, 'credit_gain');
  const premiumMultiplier = getPremiumMultiplier(state, 'credit_gain');
  const tacticalMultiplier = getTacticalEffectMultiplier(state, 'credit_gain');
  return Math.floor(
    12 * zone.creditMultiplier * scannerBonus * prestige * waveBonus * bossBonus * skillMultiplier * premiumMultiplier
      * tacticalMultiplier,
  );
}

export function getXpReward(state: GameState): number {
  const trainingLevel = getUpgradeLevel(state, 'training');
  const trainingBonus = 1 + getUpgradeTemplate('training').effectPerLevel * trainingLevel;
  const prestige = getPrestigeMultiplier(state);
  const bossBonus = state.combat.isBoss ? 3 : 1;
  const skillMultiplier = getSkillEffectMultiplier(state, 'xp_gain');
  const premiumMultiplier = getPremiumMultiplier(state, 'xp_gain');
  const tacticalMultiplier = getTacticalEffectMultiplier(state, 'xp_gain');
  return Math.floor(8 * trainingBonus * prestige * bossBonus * skillMultiplier * premiumMultiplier * tacticalMultiplier);
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
      hero.skillPoints += 1;
    } else {
      break;
    }
  }
}

export function canUnlockSkill(state: GameState, heroId: string, skillId: string): boolean {
  const hero = state.heroes.find((candidate) => candidate.id === heroId);
  if (!hero) return false;
  if (hero.unlockedSkills.includes(skillId)) return false;

  const skill = getSkill(skillId);
  return skill.officerId === heroId && hero.level >= skill.requiredLevel && hero.skillPoints >= skill.cost;
}

export function unlockSkill(state: GameState, heroId: string, skillId: string): boolean {
  if (!canUnlockSkill(state, heroId, skillId)) return false;

  const hero = state.heroes.find((candidate) => candidate.id === heroId);
  const skill = getSkill(skillId);
  if (!hero) return false;

  hero.skillPoints -= skill.cost;
  hero.unlockedSkills.push(skill.id);
  return true;
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
