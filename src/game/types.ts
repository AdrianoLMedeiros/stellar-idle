export type HeroRole = 'captain' | 'gunner' | 'engineer' | 'medic';

export interface HeroTemplate {
  id: string;
  name: string;
  role: HeroRole;
  roleLabel: string;
  color: string;
  accent: string;
  baseAtk: number;
  baseHp: number;
  attackInterval: number;
}

export interface HeroState {
  id: string;
  level: number;
  xp: number;
  skillPoints: number;
  unlockedSkills: string[];
  abilityCooldown: number;
}

export type AbilityEffectType = 'weapon_speed';

export interface AbilityEffect {
  type: AbilityEffectType;
  value: number;
}

export type OfficerAbilityKind = 'timed_effect' | 'instant_damage' | 'restore_shield' | 'repair_hull';

export interface OfficerAbility {
  id: string;
  officerId: string;
  name: string;
  shortName: string;
  description: string;
  cooldown: number;
  duration?: number;
  kind: OfficerAbilityKind;
  value: number;
  effects?: AbilityEffect[];
}

export interface ActiveAbilityEffect {
  id: string;
  officerId: string;
  name: string;
  remaining: number;
  effects: AbilityEffect[];
}

export type SkillEffectType =
  | 'ship_hull'
  | 'ship_shield'
  | 'shield_regen'
  | 'weapon_damage'
  | 'weapon_speed'
  | 'xp_gain'
  | 'credit_gain';

export interface SkillEffect {
  type: SkillEffectType;
  value: number;
}

export interface OfficerSkill {
  id: string;
  officerId: string;
  name: string;
  description: string;
  requiredLevel: number;
  cost: number;
  effects: SkillEffect[];
}

export interface ShipState {
  hull: number;
  maxHull: number;
  shield: number;
  maxShield: number;
  weaponTimer: number;
}

export interface EnemyTemplate {
  name: string;
  color: string;
  accent: string;
  sprite: 'drone' | 'alien' | 'mech' | 'boss';
}

export interface ZoneTemplate {
  id: number;
  name: string;
  description: string;
  enemyHpMultiplier: number;
  creditMultiplier: number;
  enemies: EnemyTemplate[];
  boss: EnemyTemplate;
}

export interface UpgradeTemplate {
  id: string;
  name: string;
  description: string;
  baseCost: number;
  costGrowth: number;
  effectPerLevel: number;
  effectLabel: string;
}

export interface UpgradeState {
  id: string;
  level: number;
}

export type StoreItemCategory = 'boost' | 'cosmetic' | 'quality_of_life';

export type MonetizationEffectType = 'credit_gain' | 'xp_gain' | 'offline_efficiency';

export interface StoreBoostGrant {
  id: string;
  name: string;
  effect: MonetizationEffectType;
  multiplier: number;
  durationSeconds: number;
}

export interface StoreEntitlementGrant {
  id: string;
  name: string;
  type: 'cosmetic' | 'quality_of_life';
}

export interface StoreItem {
  id: string;
  name: string;
  description: string;
  category: StoreItemCategory;
  priceLabel: string;
  grants: Array<StoreBoostGrant | StoreEntitlementGrant>;
}

export interface ActiveBoost {
  id: string;
  name: string;
  effect: MonetizationEffectType;
  multiplier: number;
  expiresAt: number;
}

export interface Entitlement {
  id: string;
  name: string;
  type: 'cosmetic' | 'quality_of_life';
  acquiredAt: number;
}

export interface PremiumState {
  entitlements: Entitlement[];
  activeBoosts: ActiveBoost[];
}

export interface CombatState {
  zoneId: number;
  wave: number;
  enemyIndex: number;
  enemyHp: number;
  enemyMaxHp: number;
  enemyName: string;
  enemySprite: EnemyTemplate['sprite'];
  enemyColor: string;
  enemyAccent: string;
  isBoss: boolean;
  enemyAtk: number;
  enemyAttackInterval: number;
  enemyAttackTimer: number;
}

export interface GameState {
  saveVersion: number;
  credits: number;
  quantumCrystals: number;
  prestigeCount: number;
  ship: ShipState;
  heroes: HeroState[];
  upgrades: UpgradeState[];
  premium: PremiumState;
  activeAbilityEffects: ActiveAbilityEffect[];
  combat: CombatState;
  lastTick: number;
  lastSave: number;
  totalEnemiesDefeated: number;
}

export interface CombatTickResult {
  damageEvents: DamageEvent[];
  projectiles: Projectile[];
  killCount: number;
  retreatCount: number;
}

export interface DamageEvent {
  x: number;
  y: number;
  amount: number;
  color: string;
  life: number;
}

export interface Projectile {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  progress: number;
  color: string;
  speed: number;
}
