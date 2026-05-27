import Phaser from 'phaser';
import { MISSILE_ABILITY, UNIT_CONFIG, type UnitType } from '../config/units';
import { GameState } from '../game/GameState';
import { tryDeploy, updateGame } from '../game/systems';

const unitCards: UnitType[] = ['rifleman', 'rpg', 'tank', 'helicopter'];

export class BattleScene extends Phaser.Scene {
  private state = new GameState();
  private bg!: Phaser.GameObjects.Graphics;
  private gfx!: Phaser.GameObjects.Graphics;
  private ui!: Phaser.GameObjects.Graphics;
  private energyText!: Phaser.GameObjects.Text;
  private baseText!: Phaser.GameObjects.Text;
  private hintText!: Phaser.GameObjects.Text;
  private statusText!: Phaser.GameObjects.Text;
  private selectedAbility: 'missile' | null = null;
  private cardTexts: Phaser.GameObjects.Text[] = [];

  constructor() { super('battle'); }

  create() {
    this.bg = this.add.graphics();
    this.gfx = this.add.graphics();
    this.ui = this.add.graphics();
    this.energyText = this.add.text(12, 10, '', { color: '#d6dce8', fontSize: '18px' }).setDepth(8);
    this.baseText = this.add.text(12, 34, '', { color: '#f0f6ff', fontSize: '14px' }).setDepth(8);
    this.hintText = this.add.text(12, 54, '', { color: '#ffc66d', fontSize: '13px' }).setDepth(8);
    this.statusText = this.add.text(0, 0, '', { color: '#ffffff', fontSize: '30px' }).setOrigin(0.5).setDepth(10).setVisible(false);

    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => {
      const w = this.scale.width;
      const h = this.scale.height;
      const cardTop = h - 90;
      const now = this.time.now;

      if (p.y > cardTop) {
        const cardW = w / 5;
        const idx = Math.floor(p.x / cardW);
        if (idx >= 0 && idx < 4) {
          tryDeploy(this.state, unitCards[idx], 'player', now, w);
          this.selectedAbility = null;
        } else if (idx === 4 && this.state.energy >= MISSILE_ABILITY.cost && this.state.canUse('player-missile', now)) {
          this.selectedAbility = 'missile';
        }
        return;
      }

      if (this.selectedAbility === 'missile') {
        this.state.energy -= MISSILE_ABILITY.cost;
        this.state.setCooldown('player-missile', now, MISSILE_ABILITY.cooldownMs);
        this.state.castMissile('player', Phaser.Math.Clamp(p.worldX, 120, w - 120), Phaser.Math.Clamp(p.worldY, 230, 370));
        this.selectedAbility = null;
      }
    });

    this.scale.on('resize', this.renderFrame, this);
    this.renderFrame();
  }

  update(_: number, dt: number) {
    updateGame(this.state, dt, this.time.now, this.scale.width);
    this.renderFrame();

    if (this.state.baseHp.enemy <= 0 || this.state.baseHp.player <= 0) {
      this.statusText.setPosition(this.scale.width / 2, this.scale.height / 2).setVisible(true);
      this.statusText.setText(this.state.baseHp.enemy <= 0 ? 'VICTORY' : 'DEFEAT');
      this.scene.pause();
    }
  }

  private renderFrame = () => {
    const w = this.scale.width;
    const h = this.scale.height;
    this.bg.clear();
    this.gfx.clear();
    this.ui.clear();
    this.cardTexts.forEach((t) => t.destroy());
    this.cardTexts = [];

    this.bg.fillGradientStyle(0x1a1a2e, 0x1a1a2e, 0xe06f43, 0x202230, 1);
    this.bg.fillRect(0, 0, w, h);

    this.gfx.fillStyle(0x0b0e14, 1).fillRect(0, 380, w, h - 380);
    this.gfx.fillStyle(0x11151c, 1).fillRect(20, 300, 40, 80);
    this.gfx.fillStyle(0x11151c, 1).fillRect(w - 60, 300, 40, 80);

    for (const [, e] of this.state.entities) {
      if (!e.unit) continue;
      const c = e.unit.team === 'player' ? 0x0e1118 : 0x050608;
      this.gfx.fillStyle(c, 1).fillRect(e.position.x - 12, e.position.y - (e.unit.airborne ? 20 : 30), UNIT_CONFIG[e.unit.unitType].width, UNIT_CONFIG[e.unit.unitType].height);
      const hpPct = e.health.hp / e.health.maxHp;
      this.gfx.fillStyle(0x2b2b2b, 1).fillRect(e.position.x - 12, e.position.y - 38, 30, 4);
      this.gfx.fillStyle(0x66ff88, 1).fillRect(e.position.x - 12, e.position.y - 38, 30 * Math.max(0, hpPct), 4);
    }

    this.gfx.fillStyle(0xffc66d, 1);
    for (const [, p] of this.state.projectiles) this.gfx.fillCircle(p.x, p.y, 2);
    for (const ex of this.state.explosions) {
      const a = ex.ttl / 500;
      this.gfx.fillStyle(0xff9f43, Math.max(0.15, a)).fillCircle(ex.x, ex.y, ex.radius * (1 - a * 0.4));
    }

    this.energyText.setText(`Energy: ${this.state.energy.toFixed(1)} / ${this.state.maxEnergy}`);
    this.baseText.setText(`Base HP   You: ${Math.max(0, Math.floor(this.state.baseHp.player))}  Enemy: ${Math.max(0, Math.floor(this.state.baseHp.enemy))}`);
    this.hintText.setText(this.selectedAbility === 'missile' ? 'Missile armed: tap battlefield to strike' : 'Tap cards to deploy units');

    const cardY = h - 86;
    const cardW = w / 5;
    const cards = [...unitCards, 'missile'] as const;
    cards.forEach((c, i) => {
      const x = i * cardW + 5;
      const isMissile = c === 'missile';
      const cost = isMissile ? MISSILE_ABILITY.cost : UNIT_CONFIG[c].cost;
      const label = isMissile ? 'Missile' : UNIT_CONFIG[c].name;
      const key = isMissile ? 'player-missile' : `player-${c}`;
      const canUse = this.state.energy >= cost && this.state.canUse(key, this.time.now);
      const selected = isMissile && this.selectedAbility === 'missile';
      this.ui.fillStyle(selected ? 0x3d2a18 : canUse ? 0x0f1520 : 0x202734, 0.95).fillRect(x, cardY, cardW - 10, 76);
      this.ui.lineStyle(1, canUse ? 0x8ab4ff : 0x556b8d, 1).strokeRect(x, cardY, cardW - 10, 76);
      this.ui.fillStyle(0xdce5ff, 1);
      this.ui.fillRect(x + 8, cardY + 56, ((cardW - 26) * Math.min(1, this.state.energy / cost)), 6);
      this.cardTexts.push(this.add.text(x + 8, cardY + 8, `${label}\n${cost}⚡`, { fontSize: '12px', color: canUse ? '#dce5ff' : '#6b7d98' }).setDepth(9));
    });
  };
}
