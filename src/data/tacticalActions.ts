import type { TacticalAction } from '../game/types';

export const TACTICAL_ACTIONS: TacticalAction[] = [
  {
    id: 'emergency-repair',
    name: 'Reparo de Emergencia',
    shortName: 'Reparar',
    description: 'Recupera 18% do casco maximo da nave.',
    cooldown: 34,
    kind: 'repair_hull',
    value: 0.18,
    hotkey: '1',
  },
  {
    id: 'shield-barrier',
    name: 'Barreira Defletora',
    shortName: 'Barreira',
    description: 'Recupera 30% do escudo maximo.',
    cooldown: 28,
    kind: 'restore_shield',
    value: 0.3,
    hotkey: '2',
  },
  {
    id: 'weapon-overcharge',
    name: 'Sobrecarga de Armas',
    shortName: 'Sobrecarga',
    description: '+35% dano das armas por 8s.',
    cooldown: 38,
    duration: 8,
    kind: 'timed_effect',
    value: 0,
    effects: [{ type: 'weapon_damage', value: 0.35 }],
    hotkey: '3',
  },
  {
    id: 'tactical-scan',
    name: 'Varredura Tatica',
    shortName: 'Varredura',
    description: '+35% creditos e XP por 12s.',
    cooldown: 42,
    duration: 12,
    kind: 'timed_effect',
    value: 0,
    effects: [
      { type: 'credit_gain', value: 0.35 },
      { type: 'xp_gain', value: 0.35 },
    ],
    hotkey: '4',
  },
];

export function getTacticalAction(actionId: string): TacticalAction {
  const action = TACTICAL_ACTIONS.find((candidate) => candidate.id === actionId);
  if (!action) throw new Error(`Acao tatica desconhecida: ${actionId}`);
  return action;
}
