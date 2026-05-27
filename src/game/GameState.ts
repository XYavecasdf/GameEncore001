import { MISSILE_ABILITY, UNIT_CONFIG, type Team, type UnitType } from '../config/units';
import type { Entity } from '../ecs/types';

export interface Projectile { id: number; team: Team; x: number; y: number; vx: number; vy: number; damage: number; targetId: number; }
export interface Explosion { x: number; y: number; ttl: number; radius: number }

export class GameState {
  entities = new Map<number, Entity>();
  projectiles = new Map<number, Projectile>();
  explosions: Explosion[] = [];
  energy = 5;
  maxEnergy = 10;
  energyRegenPerSec = 0.8;
  baseHp = { player: 900, enemy: 900 };
  cooldowns = new Map<string, number>();
  nextEntityId = 1;
  nextProjectileId = 1;
  enemySpawnAcc = 0;

  canUse(key: string, now: number) { return (this.cooldowns.get(key) ?? 0) <= now; }
  setCooldown(key: string, now: number, ms: number) { this.cooldowns.set(key, now + ms); }

  spawnUnit(unitType: UnitType, team: Team, x: number, y: number) {
    const u = UNIT_CONFIG[unitType];
    const id = this.nextEntityId++;
    this.entities.set(id, {
      id,
      position: { x, y },
      velocity: { vx: 0, vy: 0 },
      health: { hp: u.maxHp, maxHp: u.maxHp },
      combat: { damage: u.damage, range: u.attackRange, fireRateMs: u.fireRateMs, projectileSpeed: u.projectileSpeed, lastFiredAt: 0 },
      targeting: {},
      unit: { unitType, team, airborne: Boolean(u.airborne) }
    });
  }

  fireProjectile(team: Team, x: number, y: number, vx: number, vy: number, damage: number, targetId: number) {
    const id = this.nextProjectileId++;
    this.projectiles.set(id, { id, team, x, y, vx, vy, damage, targetId });
  }

  castMissile(team: Team, x: number, y: number) {
    for (const [, e] of this.entities) {
      if (!e.unit || e.unit.team === team) continue;
      const dx = e.position.x - x;
      const dy = e.position.y - y;
      if ((dx * dx + dy * dy) <= MISSILE_ABILITY.radius * MISSILE_ABILITY.radius) {
        e.health.hp -= MISSILE_ABILITY.damage;
      }
    }
    this.explosions.push({ x, y, ttl: 500, radius: MISSILE_ABILITY.radius });
  }
}
