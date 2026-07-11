import { DEFAULT_OPERATIONAL_FOCUS_ID, getOperationalFocus } from '../data/operationalFocus';
import type { GameState, OperationalFocusEffectType } from './types';

export function normalizeOperationalFocusId(focusId: string | undefined): string {
  return getOperationalFocus(focusId ?? DEFAULT_OPERATIONAL_FOCUS_ID).id;
}

export function setOperationalFocus(state: GameState, focusId: string): boolean {
  const nextFocusId = normalizeOperationalFocusId(focusId);
  if (state.operationalFocusId === nextFocusId) return false;
  state.operationalFocusId = nextFocusId;
  return true;
}

export function getOperationalFocusMultiplier(state: GameState, type: OperationalFocusEffectType): number {
  const focus = getOperationalFocus(state.operationalFocusId);
  const bonus = focus.effects
    .filter((effect) => effect.type === type)
    .reduce((sum, effect) => sum + effect.value, 0);
  return 1 + bonus;
}
