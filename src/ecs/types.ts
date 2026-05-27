import type { Team, UnitType } from '../config/units';

export interface Position { x: number; y: number }
export interface Velocity { vx: number; vy: number }
export interface Health { hp: number; maxHp: number }
export interface Combat { damage: number; range: number; fireRateMs: number; projectileSpeed: number; lastFiredAt: number }
export interface Targeting { targetId?: number }
export interface UnitTag { unitType: UnitType; team: Team; airborne: boolean }

export interface Entity {
  id: number;
  position: Position;
  velocity: Velocity;
  health: Health;
  combat?: Combat;
  targeting?: Targeting;
  unit?: UnitTag;
  base?: { team: Team };
}
