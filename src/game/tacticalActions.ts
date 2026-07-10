import { TACTICAL_ACTIONS, getTacticalAction } from '../data/tacticalActions';
import type { GameState, TacticalActionState, TacticalEffectType } from './types';

export function createInitialTacticalActions(): TacticalActionState[] {
  return TACTICAL_ACTIONS.map((action) => ({
    id: action.id,
    cooldown: 0,
  }));
}

export function tickTacticalActions(state: GameState, deltaSeconds: number): void {
  for (const action of state.tacticalActions) {
    action.cooldown = Math.max(0, action.cooldown - deltaSeconds);
  }

  state.activeTacticalEffects = (state.activeTacticalEffects ?? [])
    .map((effect) => ({
      ...effect,
      remaining: effect.remaining - deltaSeconds,
    }))
    .filter((effect) => effect.remaining > 0);
}

export function getTacticalEffectMultiplier(state: GameState, type: TacticalEffectType): number {
  const bonus = (state.activeTacticalEffects ?? []).reduce((sum, activeEffect) => {
    return sum + activeEffect.effects
      .filter((effect) => effect.type === type)
      .reduce((effectSum, effect) => effectSum + effect.value, 0);
  }, 0);
  return 1 + bonus;
}

export function activateTacticalAction(state: GameState, actionId: string): string | null {
  const actionState = state.tacticalActions.find((candidate) => candidate.id === actionId);
  if (!actionState || actionState.cooldown > 0) return null;

  const action = getTacticalAction(actionId);
  actionState.cooldown = action.cooldown;

  if (action.kind === 'repair_hull') {
    state.ship.hull = Math.min(state.ship.maxHull, state.ship.hull + state.ship.maxHull * action.value);
    return action.name;
  }

  if (action.kind === 'restore_shield') {
    state.ship.shield = Math.min(state.ship.maxShield, state.ship.shield + state.ship.maxShield * action.value);
    return action.name;
  }

  if (action.kind === 'timed_effect') {
    state.activeTacticalEffects = state.activeTacticalEffects.filter((effect) => effect.id !== action.id);
    state.activeTacticalEffects.push({
      id: action.id,
      name: action.name,
      remaining: action.duration ?? 0,
      effects: action.effects ?? [],
    });
    return action.name;
  }

  return null;
}
