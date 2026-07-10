import { createInitialState } from './state';
import type { GameState } from './types';

const SAVE_KEY = 'stellar-idle-rpg-save-v1';

export function loadGame(): GameState {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return createInitialState();
    const parsed = JSON.parse(raw) as GameState;
    return normalizeSave({ ...createInitialState(), ...parsed });
  } catch {
    return createInitialState();
  }
}

function normalizeSave(state: GameState): GameState {
  return {
    ...state,
    heroes: state.heroes.map((hero) => ({
      ...hero,
      xp: hero.xp ?? 0,
    })),
  };
}

export function saveGame(state: GameState): void {
  state.lastSave = Date.now();
  localStorage.setItem(SAVE_KEY, JSON.stringify(state));
}

export function resetSave(): void {
  localStorage.removeItem(SAVE_KEY);
}
