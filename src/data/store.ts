import type { StoreItem } from '../game/types';

export const STORE_ITEMS: StoreItem[] = [
  {
    id: 'boost-credit-2h',
    name: 'Contrato de Salvamento',
    description: '+25% creditos por 2 horas.',
    category: 'boost',
    priceLabel: 'Dev',
    grants: [
      {
        id: 'boost-credit-2h',
        name: 'Contrato de Salvamento',
        effect: 'credit_gain',
        multiplier: 1.25,
        durationSeconds: 2 * 60 * 60,
      },
    ],
  },
  {
    id: 'boost-xp-2h',
    name: 'Treinamento Acelerado',
    description: '+20% XP de oficiais por 2 horas.',
    category: 'boost',
    priceLabel: 'Dev',
    grants: [
      {
        id: 'boost-xp-2h',
        name: 'Treinamento Acelerado',
        effect: 'xp_gain',
        multiplier: 1.2,
        durationSeconds: 2 * 60 * 60,
      },
    ],
  },
  {
    id: 'boost-offline-8h',
    name: 'Piloto Automatico Estendido',
    description: '+50% eficiencia offline por 8 horas.',
    category: 'boost',
    priceLabel: 'Dev',
    grants: [
      {
        id: 'boost-offline-8h',
        name: 'Piloto Automatico Estendido',
        effect: 'offline_efficiency',
        multiplier: 1.5,
        durationSeconds: 8 * 60 * 60,
      },
    ],
  },
  {
    id: 'cosmetic-aurora-hull',
    name: 'Casco Aurora',
    description: 'Cosmetico permanente para futuras skins da nave.',
    category: 'cosmetic',
    priceLabel: 'Dev',
    grants: [
      {
        id: 'cosmetic-aurora-hull',
        name: 'Casco Aurora',
        type: 'cosmetic',
      },
    ],
  },
];

export function getStoreItem(id: string): StoreItem | undefined {
  return STORE_ITEMS.find((item) => item.id === id);
}
