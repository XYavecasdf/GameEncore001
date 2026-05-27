export type Team = 'player' | 'enemy';

export type UnitType = 'rifleman' | 'rpg' | 'tank' | 'helicopter';

export interface UnitConfig {
  type: UnitType;
  name: string;
  cost: number;
  cooldownMs: number;
  maxHp: number;
  damage: number;
  attackRange: number;
  fireRateMs: number;
  speed: number;
  projectileSpeed: number;
  airborne?: boolean;
  width: number;
  height: number;
}

export const UNIT_CONFIG: Record<UnitType, UnitConfig> = {
  rifleman: { type: 'rifleman', name: 'Rifleman', cost: 2, cooldownMs: 1200, maxHp: 70, damage: 8, attackRange: 100, fireRateMs: 900, speed: 38, projectileSpeed: 180, width: 18, height: 30 },
  rpg: { type: 'rpg', name: 'RPG Soldier', cost: 4, cooldownMs: 2200, maxHp: 80, damage: 22, attackRange: 130, fireRateMs: 1900, speed: 30, projectileSpeed: 150, width: 18, height: 32 },
  tank: { type: 'tank', name: 'Tank', cost: 6, cooldownMs: 4500, maxHp: 360, damage: 40, attackRange: 150, fireRateMs: 2100, speed: 20, projectileSpeed: 130, width: 46, height: 28 },
  helicopter: { type: 'helicopter', name: 'Helicopter', cost: 7, cooldownMs: 5000, maxHp: 220, damage: 16, attackRange: 160, fireRateMs: 700, speed: 48, projectileSpeed: 200, airborne: true, width: 42, height: 22 }
};

export const MISSILE_ABILITY = { name: 'Missile Strike', cost: 8, cooldownMs: 6500, damage: 90, radius: 70 };
