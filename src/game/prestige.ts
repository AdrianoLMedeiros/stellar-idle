import { createInitialHeroes, createInitialUpgrades, createEnemyForWave, estimatePrestigeGain } from './state';
import type { GameState } from './types';

export function performPrestige(state: GameState): number {
  const gain = estimatePrestigeGain(state);
  state.quantumCrystals += gain;
  state.prestigeCount += 1;
  state.credits = 0;
  state.heroes = createInitialHeroes();
  state.upgrades = createInitialUpgrades();
  state.combat = createEnemyForWave(1, 1);
  state.totalEnemiesDefeated = 0;
  return gain;
}

export function getPrestigeBonusPercent(state: GameState): number {
  return Math.round(state.quantumCrystals * 5);
}
