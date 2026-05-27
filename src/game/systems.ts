import { UNIT_CONFIG, type Team, type UnitType } from '../config/units';
import { GameState } from './GameState';

const GROUND_Y = 360;

export function updateGame(state: GameState, dtMs: number, now: number, width: number) {
  state.energy = Math.min(state.maxEnergy, state.energy + (state.energyRegenPerSec * dtMs / 1000));

  for (const [, e] of state.entities) {
    if (!e.unit || !e.combat || !e.targeting) continue;
    const forward = e.unit.team === 'player' ? 1 : -1;
    const enemies = [...state.entities.values()].filter((o) => o.unit && o.unit.team !== e.unit!.team && o.health.hp > 0);
    let target = enemies.find((o) => Math.abs(o.position.x - e.position.x) <= e.combat!.range);
    if (!target) {
      e.velocity.vx = forward * UNIT_CONFIG[e.unit.unitType].speed;
    } else {
      e.velocity.vx = 0;
      const elapsed = now - e.combat.lastFiredAt;
      if (elapsed >= e.combat.fireRateMs) {
        const dx = target.position.x - e.position.x;
        const dy = target.position.y - e.position.y;
        const d = Math.max(1, Math.hypot(dx, dy));
        state.fireProjectile(e.unit.team, e.position.x, e.position.y, dx / d * e.combat.projectileSpeed, dy / d * e.combat.projectileSpeed, e.combat.damage, target.id);
        e.combat.lastFiredAt = now;
      }
    }
  }

  for (const [, e] of state.entities) {
    e.position.x += e.velocity.vx * dtMs / 1000;
    e.position.y = e.unit?.airborne ? 290 : GROUND_Y;

    if (e.unit?.team === 'player' && e.position.x >= width - 55) {
      state.baseHp.enemy -= 20 * dtMs / 1000;
      e.health.hp = 0;
    } else if (e.unit?.team === 'enemy' && e.position.x <= 55) {
      state.baseHp.player -= 20 * dtMs / 1000;
      e.health.hp = 0;
    }
  }

  for (const [id, p] of state.projectiles) {
    p.x += p.vx * dtMs / 1000;
    p.y += p.vy * dtMs / 1000;
    const t = state.entities.get(p.targetId);
    if (!t || t.health.hp <= 0) {
      state.projectiles.delete(id);
      continue;
    }
    if (Math.hypot(t.position.x - p.x, t.position.y - p.y) < 12) {
      t.health.hp -= p.damage;
      state.explosions.push({ x: p.x, y: p.y, ttl: 280, radius: 20 });
      state.projectiles.delete(id);
    }
  }

  state.explosions.forEach((e) => (e.ttl -= dtMs));
  state.explosions = state.explosions.filter((e) => e.ttl > 0);
  for (const [id, e] of state.entities) if (e.health.hp <= 0) state.entities.delete(id);

  state.enemySpawnAcc += dtMs;
  if (state.enemySpawnAcc >= 2200) {
    state.enemySpawnAcc = 0;
    const pool: UnitType[] = ['rifleman', 'rifleman', 'rpg', 'tank'];
    const pick = pool[Math.floor(Math.random() * pool.length)];
    state.spawnUnit(pick, 'enemy', width - 95, GROUND_Y);
  }
}

export function tryDeploy(state: GameState, unitType: UnitType, team: Team, now: number, width: number) {
  const cfg = UNIT_CONFIG[unitType];
  const key = `${team}-${unitType}`;
  if (state.energy < cfg.cost || !state.canUse(key, now)) return false;
  state.energy -= cfg.cost;
  state.setCooldown(key, now, cfg.cooldownMs);
  const x = team === 'player' ? 95 : width - 95;
  state.spawnUnit(unitType, team, x, 360);
  return true;
}
