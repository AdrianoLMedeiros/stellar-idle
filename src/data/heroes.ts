import type { HeroTemplate } from '../game/types';

export const HERO_TEMPLATES: HeroTemplate[] = [
  {
    id: 'nova',
    name: 'Comandante Nova',
    role: 'captain',
    roleLabel: 'Comandante',
    color: '#2f6bff',
    accent: '#8ec5ff',
    baseAtk: 12,
    baseHp: 120,
    attackInterval: 1.2,
  },
  {
    id: 'vex',
    name: 'Atirador Vex',
    role: 'gunner',
    roleLabel: 'Artilheiro',
    color: '#ff4f6d',
    accent: '#ff9aa9',
    baseAtk: 18,
    baseHp: 80,
    attackInterval: 0.9,
  },
  {
    id: 'aria',
    name: 'Engenheira Aria',
    role: 'engineer',
    roleLabel: 'Engenheira',
    color: '#ffd166',
    accent: '#fff0b3',
    baseAtk: 10,
    baseHp: 100,
    attackInterval: 1.5,
  },
  {
    id: 'lyra',
    name: 'Médica Lyra',
    role: 'medic',
    roleLabel: 'Suporte',
    color: '#5cffb1',
    accent: '#b8ffe0',
    baseAtk: 8,
    baseHp: 90,
    attackInterval: 1.8,
  },
];

export function getHeroTemplate(id: string): HeroTemplate {
  const hero = HERO_TEMPLATES.find((h) => h.id === id);
  if (!hero) throw new Error(`Herói desconhecido: ${id}`);
  return hero;
}
