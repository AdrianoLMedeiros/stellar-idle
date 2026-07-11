import type { TacticalOrder } from '../game/types';

export const TACTICAL_ORDERS: TacticalOrder[] = [
  {
    id: 'focused-fire',
    name: 'Fogo Concentrado',
    shortName: 'Fogo',
    description: '+45% dano das armas por 5s.',
    cooldown: 18,
    duration: 5,
    fx: 'focused-fire',
    impactLabel: '+45% dano',
    impactColor: '#ffd166',
    effects: [{ type: 'weapon_damage', value: 0.45 }],
  },
  {
    id: 'forward-shields',
    name: 'Escudos à Frente',
    shortName: 'Escudos',
    description: 'Reduz 45% do dano recebido por 5s.',
    cooldown: 22,
    duration: 5,
    fx: 'forward-shields',
    impactLabel: '-45% dano recebido',
    impactColor: '#5cffb1',
    effects: [{ type: 'incoming_damage_reduction', value: 0.45 }],
  },
  {
    id: 'evasive-maneuver',
    name: 'Manobra Evasiva',
    shortName: 'Evasiva',
    description: 'Evita o próximo ataque inimigo por até 4s.',
    cooldown: 26,
    duration: 4,
    fx: 'evasive-maneuver',
    impactLabel: 'Próximo ataque evitado',
    impactColor: '#8ef9ff',
    effects: [{ type: 'evasion', value: 1 }],
  },
];

export function getTacticalOrder(orderId: string): TacticalOrder {
  const order = TACTICAL_ORDERS.find((candidate) => candidate.id === orderId);
  if (!order) throw new Error(`Ordem tatica desconhecida: ${orderId}`);
  return order;
}
