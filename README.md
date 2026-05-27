# Silhouette Frontline RTS (Prototype)

Browser-based 2D real-time strategy prototype inspired by classic mobile lane war games.

## Stack
- Phaser 3
- TypeScript
- Vite

## Features
- Side-view battlefield with player base (left) and enemy base (right)
- Auto-moving combat units and base assault
- Real-time energy regeneration and cost-based deployment
- Card bar controls (Rifleman, RPG Soldier, Tank, Helicopter, Missile Strike)
- Cooldowns per card and missile ability
- Basic AI targeting, projectiles, damage, and health bars
- Enemy wave spawning AI
- Explosion effects and minimalist silhouette military style
- Mobile-friendly tap controls and responsive layout

## Run
```bash
npm install
npm run dev
```

## Build
```bash
npm run build
npm run preview
```

## Architecture
- `src/config/units.ts`: Config-driven stats and costs
- `src/ecs/types.ts`: Component-shaped entity types
- `src/game/GameState.ts`: Pure-ish game state container
- `src/game/systems.ts`: Main gameplay systems and loop logic
- `src/scenes/BattleScene.ts`: Rendering, input, UI composition

Designed for easy extension toward future multiplayer by keeping gameplay state separated from scene rendering and IO.
