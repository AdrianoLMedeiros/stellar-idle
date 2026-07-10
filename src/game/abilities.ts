import { getOfficerAbility } from '../data/abilities';
import { getShipMaxHull, getShipMaxShield, getShipWeaponDamage } from './progression';
import type { AbilityEffectType, GameState } from './types';

export function tickOfficerAbilities(state: GameState, deltaSeconds: number): void {
  for (const hero of state.heroes) {
    hero.abilityCooldown = Math.max(0, (hero.abilityCooldown ?? 0) - deltaSeconds);
  }

  state.activeAbilityEffects = (state.activeAbilityEffects ?? [])
    .map((effect) => ({
      ...effect,
      remaining: effect.remaining - deltaSeconds,
    }))
    .filter((effect) => effect.remaining > 0);
}

export function getAbilityEffectMultiplier(state: GameState, type: AbilityEffectType): number {
  const bonus = (state.activeAbilityEffects ?? []).reduce((sum, activeEffect) => {
    return sum + activeEffect.effects
      .filter((effect) => effect.type === type)
      .reduce((effectSum, effect) => effectSum + effect.value, 0);
  }, 0);
  return 1 + bonus;
}

export function activateOfficerAbility(state: GameState, officerId: string): string | null {
  const hero = state.heroes.find((candidate) => candidate.id === officerId);
  if (!hero || hero.abilityCooldown > 0) return null;

  const ability = getOfficerAbility(officerId);
  hero.abilityCooldown = ability.cooldown;

  if (ability.kind === 'timed_effect') {
    state.activeAbilityEffects = state.activeAbilityEffects.filter((effect) => effect.id !== ability.id);
    state.activeAbilityEffects.push({
      id: ability.id,
      officerId,
      name: ability.name,
      remaining: ability.duration ?? 0,
      effects: ability.effects ?? [],
    });
    return ability.name;
  }

  if (ability.kind === 'instant_damage') {
    const damage = Math.floor(getShipWeaponDamage(state) * ability.value);
    state.combat.enemyHp = Math.max(0, state.combat.enemyHp - damage);
    return ability.name;
  }

  if (ability.kind === 'restore_shield') {
    const maxShield = getShipMaxShield(state);
    state.ship.maxShield = maxShield;
    state.ship.shield = Math.min(maxShield, state.ship.shield + maxShield * ability.value);
    return ability.name;
  }

  if (ability.kind === 'repair_hull') {
    const maxHull = getShipMaxHull(state);
    state.ship.maxHull = maxHull;
    state.ship.hull = Math.min(maxHull, state.ship.hull + maxHull * ability.value);
    return ability.name;
  }

  return null;
}
