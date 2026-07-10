import { applyOfflineProgress, processCombatTick } from './combat';
import { activateOfficerAbility } from './abilities';
import { grantStoreItem, pruneExpiredBoosts } from './monetization';
import { buyUpgrade, unlockSkill } from './progression';
import { performPrestige } from './prestige';
import { exportSaveData, importSaveData, loadGame, saveGame } from './save';
import { createInitialState } from './state';
import type { CombatTickResult, GameState } from './types';

const TICK_RATE = 1 / 60;
const SAVE_INTERVAL_MS = 30_000;

export class GameLoop {
  private state: GameState;
  private accumulator = 0;
  private lastFrame = performance.now();
  private lastSave = Date.now();
  private running = false;

  constructor(
    private onTick: (state: GameState, delta: number) => void,
    private onCombat: (result: CombatTickResult) => void,
  ) {
    this.state = loadGame();
  }

  getState(): GameState {
    return this.state;
  }

  start(): void {
    const now = Date.now();
    const offlineSeconds = Math.max(0, (now - this.state.lastTick) / 1000);
    if (offlineSeconds > 60) {
      const kills = applyOfflineProgress(this.state, offlineSeconds);
      this.onTick(this.state, 0);
      if (kills > 0) {
        const hours = offlineSeconds / 3600;
        this.onOffline?.(kills, hours);
      }
    }
    this.state.lastTick = now;
    this.running = true;
    this.lastFrame = performance.now();
    requestAnimationFrame(this.frame);
  }

  onOffline?: (kills: number, hours: number) => void;

  private frame = (timestamp: number): void => {
    if (!this.running) return;

    const frameDelta = Math.min(0.1, (timestamp - this.lastFrame) / 1000);
    this.lastFrame = timestamp;
    this.accumulator += frameDelta;

    while (this.accumulator >= TICK_RATE) {
      pruneExpiredBoosts(this.state);
      const result = processCombatTick(this.state, TICK_RATE);
      this.onCombat(result);
      this.accumulator -= TICK_RATE;
    }

    this.state.lastTick = Date.now();
    this.onTick(this.state, frameDelta);

    if (Date.now() - this.lastSave >= SAVE_INTERVAL_MS) {
      saveGame(this.state);
      this.lastSave = Date.now();
    }

    requestAnimationFrame(this.frame);
  };

  tryUpgrade(id: string): boolean {
    const ok = buyUpgrade(this.state, id);
    if (ok) saveGame(this.state);
    return ok;
  }

  tryPrestige(): number | null {
    const gain = performPrestige(this.state);
    saveGame(this.state);
    return gain;
  }

  tryUnlockSkill(heroId: string, skillId: string): boolean {
    const ok = unlockSkill(this.state, heroId, skillId);
    if (ok) saveGame(this.state);
    return ok;
  }

  tryClaimStoreItem(itemId: string): boolean {
    const ok = grantStoreItem(this.state, itemId);
    if (ok) saveGame(this.state);
    return ok;
  }

  tryActivateOfficerAbility(heroId: string): string | null {
    const abilityName = activateOfficerAbility(this.state, heroId);
    if (abilityName) saveGame(this.state);
    return abilityName;
  }

  saveNow(): void {
    this.state.lastTick = Date.now();
    saveGame(this.state);
    this.lastSave = Date.now();
  }

  exportSave(): string {
    this.saveNow();
    return exportSaveData(this.state);
  }

  importSave(raw: string): void {
    this.state = importSaveData(raw);
    this.accumulator = 0;
    this.lastFrame = performance.now();
    this.lastSave = Date.now();
    this.onTick(this.state, 0);
  }

  resetProgress(): void {
    this.state = createInitialState();
    this.accumulator = 0;
    this.lastFrame = performance.now();
    saveGame(this.state);
    this.lastSave = Date.now();
  }
}
