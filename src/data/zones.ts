import type { ZoneTemplate } from '../game/types';

export const ZONES: ZoneTemplate[] = [
  {
    id: 1,
    name: 'Estação Órbita-7',
    description: 'Docas abandonadas infestadas de drones.',
    enemyHpMultiplier: 1,
    creditMultiplier: 1,
    enemies: [
      { name: 'Drone de Patrulha', color: '#5a6b8a', accent: '#9eb4d8', sprite: 'drone' },
      { name: 'Scanner Hostil', color: '#4d5f7a', accent: '#7fd0ff', sprite: 'drone' },
    ],
  },
  {
    id: 2,
    name: 'Cinturão de Asteroides',
    description: 'Piratas xeno atacam comboios minerais.',
    enemyHpMultiplier: 1.8,
    creditMultiplier: 1.6,
    enemies: [
      { name: 'Raider Xeno', color: '#8b5cf6', accent: '#d8b4fe', sprite: 'alien' },
      { name: 'Stalker Biomecânico', color: '#6d28d9', accent: '#c4b5fd', sprite: 'alien' },
    ],
  },
  {
    id: 3,
    name: 'Nebulosa Kryon',
    description: 'Máquinas de guerra corrompidas vagam no vácuo.',
    enemyHpMultiplier: 3.2,
    creditMultiplier: 2.8,
    enemies: [
      { name: 'Mech Corrompido', color: '#ef4444', accent: '#fca5a5', sprite: 'mech' },
      { name: 'Titã de Ferro', color: '#b91c1c', accent: '#fecaca', sprite: 'mech' },
    ],
  },
  {
    id: 4,
    name: 'Núcleo da Singularidade',
    description: 'A IA central envia sua guarda de elite.',
    enemyHpMultiplier: 6,
    creditMultiplier: 5,
    enemies: [
      { name: 'Guardião Quântico', color: '#06b6d4', accent: '#a5f3fc', sprite: 'boss' },
      { name: 'Arconte Sintético', color: '#0891b2', accent: '#67e8f9', sprite: 'boss' },
    ],
  },
];

export function getZone(id: number): ZoneTemplate {
  const zone = ZONES.find((z) => z.id === id);
  if (!zone) return ZONES[ZONES.length - 1];
  return zone;
}
