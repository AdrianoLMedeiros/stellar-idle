import type { UpgradeTemplate } from '../game/types';

export const UPGRADE_TEMPLATES: UpgradeTemplate[] = [
  {
    id: 'weapons',
    name: 'Armas de Plasma',
    description: 'Aumenta o ataque de toda a tripulação.',
    baseCost: 50,
    costGrowth: 1.55,
    effectPerLevel: 2,
    effectLabel: 'ATK',
  },
  {
    id: 'shields',
    name: 'Escudos Defletores',
    description: 'Reduz o tempo entre ataques da equipe.',
    baseCost: 80,
    costGrowth: 1.6,
    effectPerLevel: 0.03,
    effectLabel: 'velocidade',
  },
  {
    id: 'scanner',
    name: 'Scanner de Loot',
    description: 'Aumenta créditos ganhos por vitória.',
    baseCost: 120,
    costGrowth: 1.65,
    effectPerLevel: 0.08,
    effectLabel: 'créditos',
  },
  {
    id: 'training',
    name: 'Simulador Tático',
    description: 'Acelera ganho de nível dos heróis.',
    baseCost: 150,
    costGrowth: 1.7,
    effectPerLevel: 0.1,
    effectLabel: 'XP',
  },
];

export function getUpgradeTemplate(id: string): UpgradeTemplate {
  const upgrade = UPGRADE_TEMPLATES.find((u) => u.id === id);
  if (!upgrade) throw new Error(`Upgrade desconhecido: ${id}`);
  return upgrade;
}
