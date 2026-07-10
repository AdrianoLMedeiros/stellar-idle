import type { OperationalFocus } from '../game/types';

export const DEFAULT_OPERATIONAL_FOCUS_ID = 'balanced';

export const OPERATIONAL_FOCUSES: OperationalFocus[] = [
  {
    id: DEFAULT_OPERATIONAL_FOCUS_ID,
    name: 'Postura Equilibrada',
    shortName: 'Equilibrado',
    description: 'Mantem a nave em regime padrao, sem bonus especifico.',
    effects: [],
  },
  {
    id: 'assault',
    name: 'Prioridade Ofensiva',
    shortName: 'Ofensivo',
    description: '+10% dano das armas.',
    effects: [{ type: 'weapon_damage', value: 0.1 }],
  },
  {
    id: 'guard',
    name: 'Prioridade Defensiva',
    shortName: 'Defensivo',
    description: '+8% casco, +8% escudo e +10% regeneracao.',
    effects: [
      { type: 'ship_hull', value: 0.08 },
      { type: 'ship_shield', value: 0.08 },
      { type: 'shield_regen', value: 0.1 },
    ],
  },
  {
    id: 'survey',
    name: 'Prioridade de Exploracao',
    shortName: 'Exploracao',
    description: '+10% creditos e XP obtidos.',
    effects: [
      { type: 'credit_gain', value: 0.1 },
      { type: 'xp_gain', value: 0.1 },
    ],
  },
];

export function getOperationalFocus(focusId: string): OperationalFocus {
  return OPERATIONAL_FOCUSES.find((focus) => focus.id === focusId) ?? OPERATIONAL_FOCUSES[0];
}
