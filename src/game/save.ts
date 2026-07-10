import { createEnemyForWave, createInitialShip, createInitialState } from './state';
import { getShipMaxHull, getShipMaxShield } from './progression';
import { getSkill } from '../data/skills';
import { createInitialPremiumState, pruneExpiredBoosts } from './monetization';
import type { GameState } from './types';

const SAVE_KEY = 'stellar-idle-rpg-save-v1';
const SAVE_SCHEMA = 'stellar-idle-rpg-save';
export const SAVE_VERSION = 2;
export const APP_VERSION = '0.1.0-alpha.1';

interface SaveEnvelope {
  schema: typeof SAVE_SCHEMA;
  saveVersion: number;
  appVersion: string;
  savedAt: number;
  exportedAt?: number;
  state: GameState;
}

export function loadGame(): GameState {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return createInitialState();
    return parseSaveData(raw);
  } catch {
    return createInitialState();
  }
}

export function exportSaveData(state: GameState): string {
  return JSON.stringify(createSaveEnvelope(state, Date.now()), null, 2);
}

export function importSaveData(raw: string): GameState {
  const state = parseSaveData(raw);
  saveGame(state);
  return state;
}

function parseSaveData(raw: string): GameState {
  const parsed = JSON.parse(raw) as Partial<GameState> | Partial<SaveEnvelope>;
  const state = isSaveEnvelope(parsed) ? parsed.state : parsed;
  return normalizeSave({ ...createInitialState(), ...state } as GameState);
}

function isSaveEnvelope(value: Partial<GameState> | Partial<SaveEnvelope>): value is SaveEnvelope {
  return 'schema' in value && value.schema === SAVE_SCHEMA && 'state' in value;
}

function normalizeSave(state: GameState): GameState {
  const combat = state.combat.isBoss === undefined
    ? createEnemyForWave(state.combat.zoneId, state.combat.wave)
    : state.combat;
  if (state.combat.isBoss === undefined) {
    const hpRatio = state.combat.enemyHp / Math.max(1, state.combat.enemyMaxHp);
    combat.enemyHp = Math.max(1, Math.floor(combat.enemyMaxHp * hpRatio));
  }

  const ship = {
    ...createInitialShip(),
    ...state.ship,
  };
  ship.maxHull = getShipMaxHull({ ...state, ship });
  ship.maxShield = getShipMaxShield({ ...state, ship });
  ship.hull = Math.min(ship.maxHull, ship.hull ?? ship.maxHull);
  ship.shield = Math.min(ship.maxShield, ship.shield ?? ship.maxShield);

  const premium = {
    ...createInitialPremiumState(),
    ...state.premium,
    entitlements: state.premium?.entitlements ?? [],
    activeBoosts: state.premium?.activeBoosts ?? [],
  };

  const normalized = {
    ...state,
    saveVersion: SAVE_VERSION,
    ship,
    premium,
    activeAbilityEffects: state.activeAbilityEffects ?? [],
    combat,
    heroes: state.heroes.map((hero) => ({
      ...hero,
      xp: hero.xp ?? 0,
      unlockedSkills: hero.unlockedSkills ?? [],
      skillPoints: hero.skillPoints ?? getRetroactiveSkillPoints(hero.level, hero.unlockedSkills ?? []),
      abilityCooldown: hero.abilityCooldown ?? 0,
    })),
  };
  pruneExpiredBoosts(normalized);
  return normalized;
}

function getRetroactiveSkillPoints(level: number, unlockedSkills: string[]): number {
  const spent = unlockedSkills.reduce((sum, skillId) => {
    try {
      return sum + getSkill(skillId).cost;
    } catch {
      return sum;
    }
  }, 0);
  return Math.max(0, level - 1 - spent);
}

export function saveGame(state: GameState): void {
  state.lastSave = Date.now();
  state.saveVersion = SAVE_VERSION;
  localStorage.setItem(SAVE_KEY, JSON.stringify(createSaveEnvelope(state)));
}

export function resetSave(): void {
  localStorage.removeItem(SAVE_KEY);
}

function createSaveEnvelope(state: GameState, exportedAt?: number): SaveEnvelope {
  return {
    schema: SAVE_SCHEMA,
    saveVersion: SAVE_VERSION,
    appVersion: APP_VERSION,
    savedAt: Date.now(),
    exportedAt,
    state: {
      ...state,
      saveVersion: SAVE_VERSION,
    },
  };
}
