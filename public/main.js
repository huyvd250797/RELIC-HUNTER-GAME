const W = 1280;
const H = 720;

const COLORS = {
  bg: 0x07171b,
  cyan: 0x61e6e1,
  cyan2: 0x1aa8ae,
  bronze: 0xb17b42,
  cream: 0xe5ddc9,
  dark: 0x10161a,
  red: 0xe25757,
  red2: 0x8f2d3b,
  green: 0x6fcf97,
  warning: 0xef4c4c,
};

class CombatScene extends Phaser.Scene {
  inputState = { jump:false, attack:false, dash:false, skill:false };
  facing = 1;
  canDash = true;
  isDashing = false;
  invincibleUntil = 0;
  attackStep = 0;
  comboExpire = 0;
  canAttack = true;
  skillReadyAt = 0;
  playerHP = 100;
  bossHP = 850;
  slimeHP = 70;
  bossActive = false;
  bossPhase = 1;
  bossNextAttack = 0;
  bossBusy = false;
  ended = false;
  joystickX = 0;
  joystickY = 0;

  constructor() { super('combat'); }

  preload() {
    this.load.image('kaiConcept', './public/assets/reference/kai-concept.png');
  }

  create() {
    this.input.addPointer(4);
    this.cameras.main.setBackgroundColor(COLORS.bg);
    this.physics.world.setBounds(0,0,2400,H);
    this.createTextures();
    this.createWorld();
    this.createPlayer();
    this.createEnemies();
    this.createUI();
    this.setupInput();
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    this.cameras.main.setBounds(0,0,2400,H);
    this.cameras.main.setDeadzone(220, 100);

    this.physics.add.collider(this.player, this.ground);
    this.physics.add.collider(this.slime, this.ground);
    this.physics.add.collider(this.boss, this.ground);
    this.physics.add.overlap(this.player, this.slime, () => this.contactDamage(this.slime, 7));
    this.physics.add.overlap(this.player, this.boss, () => this.contactDamage(this.boss, this.bossPhase === 1 ? 10 : 15));

    this.time.delayedCall(700, () => this.flashMessage('KAI • Combat Prototype', 1200));
  }

  createTextures() {
    const g = this.add.graphics();

    // Player / enemies
    g.fillStyle(COLORS.dark).fillRoundedRect(4, 12, 44, 64, 12);
    g.fillStyle(COLORS.cream).fillCircle(26, 18, 12);
    g.fillStyle(0x1d2428).fillCircle(26, 14, 13);
    g.fillStyle(COLORS.cyan2).fillTriangle(12, 32, 42, 32, 8, 58);
    g.fillStyle(COLORS.bronze).fillRoundedRect(4, 31, 10, 30, 4);
    g.fillStyle(COLORS.cyan).fillRect(39, 28, 5, 42);
    g.generateTexture('kai', 52, 80);
    g.clear();

    g.fillStyle(0x365c52).fillEllipse(34, 25, 66, 45);
    g.fillStyle(0x83c982).fillCircle(18, 19, 6); g.fillCircle(50, 19, 6);
    g.fillStyle(0xe6f8d4).fillCircle(18, 19, 2); g.fillCircle(50, 19, 2);
    g.generateTexture('slime', 68, 50);
    g.clear();

    g.fillStyle(0x34252d).fillRoundedRect(18, 18, 100, 104, 30);
    g.fillStyle(COLORS.red2).fillTriangle(22, 34, 2, 0, 48, 29); g.fillTriangle(114, 34, 134, 0, 88, 29);
    g.fillStyle(COLORS.red).fillCircle(46, 55, 8); g.fillCircle(90,55,8);
    g.fillStyle(0xeedec8).fillRect(32, 86, 70, 9);
    g.generateTexture('boss', 136, 124);
    g.clear();

    g.fillStyle(COLORS.cyan).fillRoundedRect(0,0,80,10,5);
    g.generateTexture('slash',80,10);
    g.clear();

    // Mobile control icons
    g.lineStyle(7, 0xffffff, 1);
    g.beginPath();
    g.moveTo(16, 46); g.lineTo(42, 18);
    g.strokePath();
    g.fillStyle(0xffffff).fillTriangle(40, 16, 54, 12, 46, 26);
    g.lineStyle(5, 0xffffff, 1);
    g.beginPath();
    g.moveTo(24, 38); g.lineTo(14, 28);
    g.moveTo(26, 40); g.lineTo(16, 50);
    g.strokePath();
    g.generateTexture('iconAttack', 64, 64);
    g.clear();

    g.lineStyle(8, 0xffffff, 1);
    g.beginPath();
    g.arc(28, 34, 16, Phaser.Math.DegToRad(220), Phaser.Math.DegToRad(10), false);
    g.strokePath();
    g.lineStyle(4, 0xffffff, 0.95);
    g.beginPath();
    g.arc(36, 30, 22, Phaser.Math.DegToRad(215), Phaser.Math.DegToRad(40), false);
    g.strokePath();
    g.fillStyle(0xffffff, 0.92).fillTriangle(44, 18, 56, 24, 46, 30);
    g.generateTexture('iconSkill', 64, 64);
    g.clear();

    g.fillStyle(0xffffff, 1);
    g.fillRoundedRect(12, 38, 18, 6, 3);
    g.fillRoundedRect(24, 30, 22, 6, 3);
    g.fillRoundedRect(40, 22, 12, 6, 3);
    g.fillTriangle(46, 18, 58, 24, 46, 30);
    g.generateTexture('iconDash', 64, 64);
    g.clear();

    g.fillStyle(0xffffff, 1);
    g.fillRect(29, 18, 6, 24);
    g.fillTriangle(18, 28, 46, 28, 32, 10);
    g.generateTexture('iconJump', 64, 64);
    g.clear();

    g.destroy();
  }

  createWorld() {
    for (let i=0;i<18;i++) {
      const x = i*170 + 40;
      const h = 110 + (i%5)*35;
      this.add.rectangle(x, 560-h/2, 120, h, i%2 ? 0x0d282b : 0x0a2024)
        .setScrollFactor(0.35)
        .setOrigin(0.5);
    }
    this.add.circle(980,110,70,0x7fd9d2,0.10).setScrollFactor(0.1);
    this.ground = this.physics.add.staticGroup();
    const floor = this.add.rectangle(1200, 676, 2400, 88, 0x172a29);
    this.physics.add.existing(floor, true);
    this.ground.add(floor);

    [390, 760, 1120].forEach((x,i)=>{
      const p = this.add.rectangle(x, 540 - i*20, 180, 24, 0x23423d);
      this.physics.add.existing(p,true);
      this.ground.add(p);
    });

    this.add.rectangle(1880, 320, 10, 620, COLORS.cyan2, 0.12);
    this.add.text(1870, 75, 'BOSS GATE', { fontSize:'16px', color:'#7dddd7' })
      .setOrigin(0.5)
      .setAngle(-90);
  }

  createPlayer() {
    this.player = this.physics.add.sprite(120, 590, 'kai');
    this.player.setCollideWorldBounds(true).setDragX(1600).setMaxVelocity(500,900);
    const body = this.player.body;
    body.setSize(38,68).setOffset(7,10);
  }

  createEnemies() {
    this.slime = this.physics.add.sprite(720, 610, 'slime');
    this.slime.setBounce(0.1).setCollideWorldBounds(true);
    this.boss = this.physics.add.sprite(2150, 560, 'boss');
    this.boss.setCollideWorldBounds(true).setImmovable(false).setVisible(false).setActive(false);
    this.boss.body.enable = false;
  }

  setupInput() {
    if (this.input.keyboard) {
      this.keys = {
        left: this.input.keyboard.addKey('A'),
        right: this.input.keyboard.addKey('D'),
        left2: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT),
        right2: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT),
        jump: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
        attack: this.input.keyboard.addKey('J'),
        dash: this.input.keyboard.addKey('K'),
        skill: this.input.keyboard.addKey('L'),
        restart: this.input.keyboard.addKey('R')
      };
    }
  }

  createUI() {
    const ui = this.add.container(0,0).setScrollFactor(0).setDepth(100);
    ui.add(this.add.rectangle(18,18,330,54,0x061015,0.78).setOrigin(0));
    ui.add(this.add.text(34,29,'KAI', {fontSize:'15px',fontStyle:'bold',color:'#d8fffc'}));
    this.playerHpBar = this.add.graphics();
    ui.add(this.playerHpBar);

    this.bossLabel = this.add.text(W/2, 22, 'CORRUPTED FOREST GUARDIAN', {
      fontSize:'17px', fontStyle:'bold', color:'#ffd6d6'
    }).setOrigin(0.5,0).setVisible(false);
    this.bossHpBar = this.add.graphics().setVisible(false);
    ui.add(this.bossLabel);
    ui.add(this.bossHpBar);

    this.skillLabel = this.add.text(W-210,24,'Skill: READY', {fontSize:'15px',color:'#8ff8f0'});
    ui.add(this.skillLabel);

    this.statusText = this.add.text(W/2, 104, '', {
      fontSize:'30px',fontStyle:'bold',color:'#ffffff',stroke:'#07171b',strokeThickness:7
    }).setOrigin(0.5).setVisible(false);
    ui.add(this.statusText);

    const hint = this.add.text(26,H-34,'A/D hoặc ←/→: chạy • SPACE: nhảy • J: đánh • K: dash • L: skill • R: restart', {
      fontSize:'14px',color:'#a4bfbd'
    });
    ui.add(hint);

    this.createTouchControls(ui);
    this.drawBars();
  }

  createTouchControls(ui) {
    this.joy = {
      baseX: 130,
      baseY: H - 118,
      radius: 56,
      pointerId: null,
      base: null,
      knob: null,
      halo: null,
    };

    const joyShadow = this.add.circle(this.joy.baseX + 7, this.joy.baseY + 8, this.joy.radius + 8, 0x000000, 0.18);
    const joyBase = this.add.circle(this.joy.baseX, this.joy.baseY, this.joy.radius, 0x103137, 0.78)
      .setStrokeStyle(3, COLORS.cyan, 0.42);
    const joyHalo = this.add.circle(this.joy.baseX, this.joy.baseY, this.joy.radius - 14, COLORS.cyan, 0.08)
      .setStrokeStyle(1, 0xffffff, 0.06);
    const joyKnobShadow = this.add.circle(this.joy.baseX + 4, this.joy.baseY + 5, 28, 0x000000, 0.18);
    const joyKnob = this.add.circle(this.joy.baseX, this.joy.baseY, 28, 0x1b4b52, 0.95)
      .setStrokeStyle(3, 0xffffff, 0.2);
    const joyZone = this.add.circle(this.joy.baseX, this.joy.baseY, this.joy.radius + 34, 0x000000, 0.001).setInteractive();

    this.joy.base = joyBase;
    this.joy.knob = joyKnob;
    this.joy.halo = joyHalo;

    const startJoystick = (pointer) => {
      if (pointer.x > W * 0.45) return;
      this.joy.pointerId = pointer.id;
      this.updateJoystick(pointer);
      joyBase.setScale(1.04);
      joyKnob.setScale(1.06);
    };

    joyZone.on('pointerdown', startJoystick);

    this.input.on('pointerdown', (pointer) => {
      if (this.joy.pointerId !== null) return;
      if (pointer.x < W * 0.45 && pointer.y > H * 0.46) {
        startJoystick(pointer);
      }
    });

    this.input.on('pointermove', (pointer) => {
      if (this.joy.pointerId === pointer.id) this.updateJoystick(pointer);
    });

    const releaseJoystick = (pointer) => {
      if (this.joy.pointerId !== pointer.id) return;
      this.resetJoystick();
      joyBase.setScale(1);
      joyKnob.setScale(1);
    };

    this.input.on('pointerup', releaseJoystick);
    this.input.on('pointerupoutside', releaseJoystick);

    ui.add([joyShadow, joyBase, joyHalo, joyKnobShadow, joyKnob, joyZone]);

    const makeSkillButton = (x, y, r, iconKey, field, bg, accent=COLORS.cyan) => {
      const shadow = this.add.circle(x + 6, y + 7, r + 2, 0x000000, 0.22);
      const ring = this.add.circle(x, y, r, bg, 0.9).setStrokeStyle(3, accent, 0.55).setInteractive();
      const inner = this.add.circle(x, y, r - 10, accent, 0.09);
      const icon = this.add.image(x, y, iconKey).setDisplaySize(r * 1.08, r * 1.08);

      ring.on('pointerdown', () => {
        this.inputState[field] = true;
        ring.setScale(0.95);
        inner.setScale(0.92);
        icon.setScale(0.92);
      });
      const release = () => {
        this.inputState[field] = false;
        ring.setScale(1);
        inner.setScale(1);
        icon.setScale(1);
      };
      ring.on('pointerup', release);
      ring.on('pointerout', release);

      ui.add([shadow, ring, inner, icon]);
    };

    makeSkillButton(W - 116, H - 112, 58, 'iconAttack', 'attack', 0x4a2e27, COLORS.bronze);
    makeSkillButton(W - 250, H - 132, 42, 'iconSkill', 'skill', 0x16363c, COLORS.cyan);
    makeSkillButton(W - 184, H - 222, 38, 'iconDash', 'dash', 0x16363c, COLORS.cyan);
    makeSkillButton(W - 322, H - 184, 38, 'iconJump', 'jump', 0x16363c, COLORS.cyan);
  }

  updateJoystick(pointer) {
    const dxRaw = pointer.x - this.joy.baseX;
    const dyRaw = pointer.y - this.joy.baseY;
    const dist = Math.hypot(dxRaw, dyRaw) || 1;
    const max = this.joy.radius;
    const clamp = Math.min(dist, max);
    const dx = (dxRaw / dist) * clamp;
    const dy = (dyRaw / dist) * clamp;

    this.joy.knob.x = this.joy.baseX + dx;
    this.joy.knob.y = this.joy.baseY + dy;
    this.joystickX = Phaser.Math.Clamp(dx / max, -1, 1);
    this.joystickY = Phaser.Math.Clamp(dy / max, -1, 1);
  }

  resetJoystick() {
    this.joy.pointerId = null;
    this.joystickX = 0;
    this.joystickY = 0;
    this.joy.knob.x = this.joy.baseX;
    this.joy.knob.y = this.joy.baseY;
  }

  update(time) {
    if (this.ended) {
      if (this.keys && Phaser.Input.Keyboard.JustDown(this.keys.restart)) this.scene.restart();
      return;
    }
    this.handlePlayer(time);
    this.updateSlime();
    this.updateBoss(time);
    this.drawBars();

    const remaining = Math.max(0, this.skillReadyAt - time);
    this.skillLabel.setText(remaining <= 0 ? 'Skill: READY' : `Skill: ${(remaining / 1000).toFixed(1)}s`);
    if (!this.bossActive && this.player.x > 1880) this.startBoss();
  }

  handlePlayer(time) {
    const body = this.player.body;
    const left = this.joystickX < -0.25 || this.keys?.left.isDown || this.keys?.left2.isDown;
    const right = this.joystickX > 0.25 || this.keys?.right.isDown || this.keys?.right2.isDown;

    if (!this.isDashing) {
      if (left) {
        this.player.setVelocityX(-245);
        this.facing = -1;
        this.player.setFlipX(true);
      } else if (right) {
        this.player.setVelocityX(245);
        this.facing = 1;
        this.player.setFlipX(false);
      } else {
        this.player.setVelocityX(0);
      }
    }

    const jumpPressed = this.consume('jump', this.keys?.jump);
    if (jumpPressed && body.blocked.down) this.player.setVelocityY(-510);

    if (this.consume('dash', this.keys?.dash) && this.canDash) this.doDash(time);
    if (this.consume('attack', this.keys?.attack) && this.canAttack) this.doAttack(time);
    if (this.consume('skill', this.keys?.skill) && time >= this.skillReadyAt) this.doSkill(time);
  }

  consume(field, key) {
    const touch = this.inputState[field];
    if (touch) this.inputState[field] = false;
    return !!touch || (!!key && Phaser.Input.Keyboard.JustDown(key));
  }

  doDash(time) {
    this.canDash = false;
    this.isDashing = true;
    this.invincibleUntil = time + 180;
    this.player.setVelocityX(this.facing * 650);
    this.player.setTint(COLORS.cyan);
    this.time.delayedCall(180, () => {
      this.isDashing = false;
      this.player.clearTint();
    });
    this.time.delayedCall(780, () => this.canDash = true);
  }

  doAttack(time) {
    this.canAttack = false;
    if (time > this.comboExpire) this.attackStep = 0;
    this.attackStep = (this.attackStep % 3) + 1;
    this.comboExpire = time + 520;

    const dmg = [0, 12, 14, 24][this.attackStep];
    const reach = this.attackStep === 3 ? 92 : 72;
    const slash = this.physics.add.sprite(this.player.x + this.facing * 55, this.player.y - 5, 'slash')
      .setAlpha(0.78)
      .setTint(this.attackStep === 3 ? 0xffffff : COLORS.cyan);
    slash.setFlipX(this.facing < 0);
    slash.body.setAllowGravity(false);
    this.tweens.add({ targets: slash, alpha: 0, duration: 130, onComplete: () => slash.destroy() });

    if (this.slime.active && Phaser.Math.Distance.Between(this.player.x, this.player.y, this.slime.x, this.slime.y) < reach + 40) {
      this.damageSlime(dmg);
    }
    if (this.bossActive && this.boss.active && Phaser.Math.Distance.Between(this.player.x, this.player.y, this.boss.x, this.boss.y) < reach + 95) {
      this.damageBoss(dmg);
    }
    this.hitPause(this.attackStep === 3 ? 50 : 24);
    this.time.delayedCall(this.attackStep === 3 ? 270 : 180, () => this.canAttack = true);
  }

  doSkill(time) {
    this.skillReadyAt = time + 5000;
    const wave = this.physics.add.sprite(this.player.x + this.facing * 55, this.player.y - 6, 'slash')
      .setScale(1.35, 2.3)
      .setTint(0x8effff);
    wave.body.setAllowGravity(false);
    wave.setVelocityX(this.facing * 700);
    wave.setFlipX(this.facing < 0);

    const check = this.time.addEvent({
      delay: 30,
      repeat: 22,
      callback: () => {
        if (!wave.active) return;
        if (this.slime.active && Phaser.Math.Distance.Between(wave.x, wave.y, this.slime.x, this.slime.y) < 65) {
          this.damageSlime(32);
          wave.destroy();
        } else if (this.bossActive && this.boss.active && Phaser.Math.Distance.Between(wave.x, wave.y, this.boss.x, this.boss.y) < 100) {
          this.damageBoss(32);
          wave.destroy();
        }
      }
    });

    this.time.delayedCall(1000, () => {
      check.remove();
      if (wave.active) wave.destroy();
    });
  }

  updateSlime() {
    if (!this.slime.active) return;
    const d = this.player.x - this.slime.x;
    if (Math.abs(d) < 360) this.slime.setVelocityX(Math.sign(d) * 65);
    else this.slime.setVelocityX(0);
  }

  damageSlime(dmg) {
    this.slimeHP -= dmg;
    this.slime.setTint(0xffffff);
    this.time.delayedCall(70, () => this.slime.active && this.slime.clearTint());
    this.slime.setVelocityX(this.facing * 150);
    this.cameras.main.shake(55, 0.0025);
    if (this.slimeHP <= 0) {
      this.slime.disableBody(true, true);
      this.flashMessage('Corrupted Slime defeated', 900);
    }
  }

  startBoss() {
    this.bossActive = true;
    this.boss.setVisible(true).setActive(true);
    this.boss.body.enable = true;
    this.bossLabel.setVisible(true);
    this.bossHpBar.setVisible(true);
    this.bossNextAttack = this.time.now + 1200;
    this.cameras.main.stopFollow();
    this.cameras.main.pan(2050, 360, 550, 'Sine.easeInOut');
    this.flashMessage('CORRUPTED FOREST GUARDIAN', 1300);
    this.time.delayedCall(1100, () => this.cameras.main.startFollow(this.player, true, 0.08, 0.08));
  }

  updateBoss(time) {
    if (!this.bossActive || !this.boss.active || this.bossBusy) return;
    if (this.bossHP <= 850 * 0.45 && this.bossPhase === 1) {
      this.bossPhase = 2;
      this.boss.setTint(0xff7777);
      this.flashMessage('PHASE 2 • RAGE', 1100);
    }
    if (time < this.bossNextAttack) return;
    const choice = Phaser.Math.Between(0, 2);
    if (choice === 0) this.bossCharge();
    else if (choice === 1) this.bossSlam();
    else this.bossRoots();
    this.bossNextAttack = time + (this.bossPhase === 1 ? 2100 : 1450);
  }

  bossCharge() {
    this.bossBusy = true;
    const dir = Math.sign(this.player.x - this.boss.x) || -1;
    const warning = this.add.rectangle(this.boss.x + dir * 220, 625, 380, 40, COLORS.warning, 0.25).setDepth(4);
    this.tweens.add({ targets: warning, alpha: 0.65, yoyo: true, repeat: 2, duration: 120 });
    this.time.delayedCall(540, () => {
      warning.destroy();
      this.boss.setVelocityX(dir * (this.bossPhase === 1 ? 470 : 620));
      this.time.delayedCall(480, () => {
        this.boss.setVelocityX(0);
        this.bossBusy = false;
      });
    });
  }

  bossSlam() {
    this.bossBusy = true;
    const zone = this.add.circle(this.boss.x, 640, 145, COLORS.warning, 0.18).setDepth(3);
    this.tweens.add({ targets: zone, scale: 1.15, alpha: 0.5, duration: 500 });
    this.time.delayedCall(600, () => {
      this.cameras.main.shake(180, 0.008);
      if (Phaser.Math.Distance.Between(this.player.x, this.player.y, this.boss.x, this.boss.y) < 175) {
        this.takeDamage(this.bossPhase === 1 ? 18 : 24);
      }
      zone.destroy();
      this.time.delayedCall(360, () => this.bossBusy = false);
    });
  }

  bossRoots() {
    this.bossBusy = true;
    const x = Phaser.Math.Clamp(this.player.x + Phaser.Math.Between(-80,80), 1910, 2330);
    const warning = this.add.rectangle(x, 630, 95, 16, COLORS.warning, 0.45);
    this.tweens.add({ targets: warning, alpha: 0.9, yoyo: true, repeat: 3, duration: 120 });
    this.time.delayedCall(650, () => {
      warning.destroy();
      const root = this.add.rectangle(x, 575, 46, 130, 0x6f8f45).setOrigin(0.5, 1);
      if (Math.abs(this.player.x - x) < 65) this.takeDamage(this.bossPhase === 1 ? 16 : 22);
      this.time.delayedCall(500, () => root.destroy());
      this.time.delayedCall(680, () => this.bossBusy = false);
    });
  }

  damageBoss(dmg) {
    this.bossHP = Math.max(0, this.bossHP - dmg);
    this.cameras.main.shake(60, 0.003);
    this.boss.setTint(0xffffff);
    this.time.delayedCall(70, () => {
      if (this.boss.active) this.bossPhase === 2 ? this.boss.setTint(0xff7777) : this.boss.clearTint();
    });
    if (this.bossHP <= 0) {
      this.boss.disableBody(true, true);
      this.win();
    }
  }

  contactDamage(enemy, dmg) {
    if (this.time.now < this.invincibleUntil) return;
    this.takeDamage(dmg);
    this.player.setVelocityX(Math.sign(this.player.x - enemy.x) * 260);
    this.player.setVelocityY(-180);
  }

  takeDamage(dmg) {
    if (this.time.now < this.invincibleUntil || this.ended) return;
    this.playerHP = Math.max(0, this.playerHP - dmg);
    this.invincibleUntil = this.time.now + 700;
    this.player.setTint(0xff7777);
    this.cameras.main.shake(120, 0.006);
    this.time.delayedCall(160, () => this.player.active && this.player.clearTint());
    if (this.playerHP <= 0) this.lose();
  }

  drawBars() {
    this.playerHpBar.clear()
      .fillStyle(0x183434, 0.95)
      .fillRoundedRect(76,35,250,18,8)
      .fillStyle(COLORS.green,1)
      .fillRoundedRect(76,35,250 * (this.playerHP / 100),18,8);
    this.bossHpBar.clear()
      .fillStyle(0x26161a, 0.95)
      .fillRoundedRect(W / 2 - 280,50,560,16,8)
      .fillStyle(COLORS.red,1)
      .fillRoundedRect(W / 2 - 280,50,560 * (this.bossHP / 850),16,8);
  }

  win() {
    this.ended = true;
    this.flashMessage('VICTORY • Forest Guardian defeated\nNhấn R để chơi lại', 999999);
  }

  lose() {
    this.ended = true;
    this.player.setTint(0x555555);
    this.flashMessage('DEFEAT\nNhấn R để thử lại', 999999);
  }

  flashMessage(text, duration) {
    this.statusText.setText(text).setVisible(true).setAlpha(1);
    if (duration < 999999) {
      this.tweens.add({
        targets: this.statusText,
        alpha: 0,
        delay: duration,
        duration: 280,
        onComplete: () => this.statusText.setVisible(false)
      });
    }
  }

  hitPause(ms) {
    this.physics.world.pause();
    this.time.delayedCall(ms, () => !this.ended && this.physics.world.resume());
  }
}

const rotate = document.createElement('div');
rotate.id = 'rotate-hint';
rotate.innerHTML = '📱 Xoay điện thoại sang <b>ngang</b> để chơi RELIC HUNTER';
document.body.appendChild(rotate);

new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'app',
  width: W,
  height: H,
  backgroundColor: '#07171b',
  physics: { default:'arcade', arcade:{ gravity:{x:0,y:1100}, debug:false } },
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH, width:W, height:H },
  render: { antialias:true, pixelArt:false, roundPixels:true },
  scene: [CombatScene]
});
