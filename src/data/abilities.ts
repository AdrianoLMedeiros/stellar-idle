import type { OfficerAbility } from '../game/types';

export const OFFICER_ABILITIES: OfficerAbility[] = [
  {
    id: 'nova-combat-order',
    officerId: 'nova',
    name: 'Ordem de Combate',
    shortName: 'Ordem',
    description: '+30% cadencia das armas por 8s.',
    cooldown: 35,
    duration: 8,
    kind: 'timed_effect',
    value: 0,
    effects: [{ type: 'weapon_speed', value: 0.3 }],
  },
  {
    id: 'vex-focused-burst',
    officerId: 'vex',
    name: 'Rajada Focada',
    shortName: 'Rajada',
    description: 'Dispara uma rajada de dano imediato.',
    cooldown: 28,
    kind: 'instant_damage',
    value: 4,
  },
  {
    id: 'aria-shield-surge',
    officerId: 'aria',
    name: 'Surto de Escudo',
    shortName: 'Escudo',
    description: 'Restaura 45% do escudo maximo.',
    cooldown: 32,
    kind: 'restore_shield',
    value: 0.45,
  },
  {
    id: 'lyra-emergency-repair',
    officerId: 'lyra',
    name: 'Reparo Emergencial',
    shortName: 'Reparo',
    description: 'Repara 25% do casco maximo.',
    cooldown: 40,
    kind: 'repair_hull',
    value: 0.25,
  },
];

export function getOfficerAbility(officerId: string): OfficerAbility {
  const ability = OFFICER_ABILITIES.find((candidate) => candidate.officerId === officerId);
  if (!ability) throw new Error(`Habilidade ativa desconhecida para oficial: ${officerId}`);
  return ability;
}
