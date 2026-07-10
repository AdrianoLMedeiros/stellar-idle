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
  credits: number;
  quantumCrystals: number;
  prestigeCount: number;
  ship: ShipState;
  heroes: HeroState[];
  upgrades: UpgradeState[];
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
