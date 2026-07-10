import { getStoreItem } from '../data/store';
import type { GameState, MonetizationEffectType, PremiumState } from './types';

export function createInitialPremiumState(): PremiumState {
  return {
    entitlements: [],
    activeBoosts: [],
  };
}

export function getPremiumMultiplier(state: GameState, effect: MonetizationEffectType): number {
  const now = Date.now();
  return state.premium.activeBoosts
    .filter((boost) => boost.effect === effect && boost.expiresAt > now)
    .reduce((multiplier, boost) => multiplier * boost.multiplier, 1);
}

export function getActiveBoostTimeRemaining(state: GameState, boostId: string): number {
  const now = Date.now();
  const boost = state.premium.activeBoosts.find((candidate) => candidate.id === boostId);
  if (!boost) return 0;
  return Math.max(0, Math.ceil((boost.expiresAt - now) / 1000));
}

export function pruneExpiredBoosts(state: GameState): void {
  const now = Date.now();
  state.premium.activeBoosts = state.premium.activeBoosts.filter((boost) => boost.expiresAt > now);
}

export function grantStoreItem(state: GameState, itemId: string): boolean {
  const item = getStoreItem(itemId);
  if (!item) return false;

  const now = Date.now();
  for (const grant of item.grants) {
    if ('effect' in grant) {
      const existing = state.premium.activeBoosts.find((boost) => boost.id === grant.id);
      const baseStart = existing ? Math.max(existing.expiresAt, now) : now;
      const expiresAt = baseStart + grant.durationSeconds * 1000;

      if (existing) {
        existing.expiresAt = expiresAt;
        existing.multiplier = grant.multiplier;
        existing.name = grant.name;
        existing.effect = grant.effect;
      } else {
        state.premium.activeBoosts.push({
          id: grant.id,
          name: grant.name,
          effect: grant.effect,
          multiplier: grant.multiplier,
          expiresAt,
        });
      }
      continue;
    }

    if (!state.premium.entitlements.some((entitlement) => entitlement.id === grant.id)) {
      state.premium.entitlements.push({
        id: grant.id,
        name: grant.name,
        type: grant.type,
        acquiredAt: now,
      });
    }
  }

  pruneExpiredBoosts(state);
  return true;
}
