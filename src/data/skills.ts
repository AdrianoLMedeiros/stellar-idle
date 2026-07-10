import type { OfficerSkill, SkillEffectType, GameState } from '../game/types';

export const OFFICER_SKILLS: OfficerSkill[] = [
  {
    id: 'nova-command-matrix',
    officerId: 'nova',
    name: 'Matriz de Comando',
    description: '+8% casco máximo e +4% dano das armas.',
    requiredLevel: 2,
    cost: 1,
    effects: [
      { type: 'ship_hull', value: 0.08 },
      { type: 'weapon_damage', value: 0.04 },
    ],
  },
  {
    id: 'nova-fire-discipline',
    officerId: 'nova',
    name: 'Disciplina de Fogo',
    description: '+8% créditos obtidos em combate.',
    requiredLevel: 4,
    cost: 1,
    effects: [{ type: 'credit_gain', value: 0.08 }],
  },
  {
    id: 'vex-targeting-suite',
    officerId: 'vex',
    name: 'Suite de Mira',
    description: '+10% dano das armas da nave.',
    requiredLevel: 2,
    cost: 1,
    effects: [{ type: 'weapon_damage', value: 0.1 }],
  },
  {
    id: 'vex-rapid-cycler',
    officerId: 'vex',
    name: 'Ciclo Rápido',
    description: '+7% cadência das armas.',
    requiredLevel: 4,
    cost: 1,
    effects: [{ type: 'weapon_speed', value: 0.07 }],
  },
  {
    id: 'aria-shield-lattice',
    officerId: 'aria',
    name: 'Malha Defletora',
    description: '+12% escudo máximo.',
    requiredLevel: 2,
    cost: 1,
    effects: [{ type: 'ship_shield', value: 0.12 }],
  },
  {
    id: 'aria-field-repair',
    officerId: 'aria',
    name: 'Reparo de Campo',
    description: '+12% regeneração de escudo.',
    requiredLevel: 4,
    cost: 1,
    effects: [{ type: 'shield_regen', value: 0.12 }],
  },
  {
    id: 'lyra-crew-drills',
    officerId: 'lyra',
    name: 'Rotinas de Bordo',
    description: '+10% XP para oficiais.',
    requiredLevel: 2,
    cost: 1,
    effects: [{ type: 'xp_gain', value: 0.1 }],
  },
  {
    id: 'lyra-containment-field',
    officerId: 'lyra',
    name: 'Campo de Contenção',
    description: '+8% escudo máximo e +8% regeneração.',
    requiredLevel: 4,
    cost: 1,
    effects: [
      { type: 'ship_shield', value: 0.08 },
      { type: 'shield_regen', value: 0.08 },
    ],
  },
];

export function getOfficerSkills(officerId: string): OfficerSkill[] {
  return OFFICER_SKILLS.filter((skill) => skill.officerId === officerId);
}

export function getSkill(id: string): OfficerSkill {
  const skill = OFFICER_SKILLS.find((candidate) => candidate.id === id);
  if (!skill) throw new Error(`Habilidade desconhecida: ${id}`);
  return skill;
}

export function getSkillEffectMultiplier(state: GameState, type: SkillEffectType): number {
  let bonus = 0;
  for (const officer of state.heroes) {
    for (const skillId of officer.unlockedSkills) {
      const skill = OFFICER_SKILLS.find((candidate) => candidate.id === skillId);
      if (!skill) continue;
      bonus += skill.effects
        .filter((effect) => effect.type === type)
        .reduce((sum, effect) => sum + effect.value, 0);
    }
  }
  return 1 + bonus;
}
