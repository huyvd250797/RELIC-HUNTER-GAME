const W = 1280, H = 720, WORLD_W = 5200, FLOOR_TOP = 620;
const C={bg:0x07171b,cyan:0x61e6e1,cyan2:0x1aa8ae,bronze:0xb17b42,cream:0xe5ddc9,dark:0x10161a,red:0xe25757,red2:0x8f2d3b,green:0x6fcf97,gold:0xf4c76b,warning:0xef4c4c};

const RELICS=[
  {id:'fire_blade',icon:'🔥',name:'Fire Blade',type:'Attack Relic',color:0xff7a38,desc:'Đòn đánh có 35% gây Burn trong 3 giây.'},
  {id:'thunder_dash',icon:'⚡',name:'Thunder Dash',type:'Dash Relic',color:0x66e8ff,desc:'Dash xuyên quái sẽ gây sát thương sét.'},
  {id:'root_prison',icon:'🌿',name:'Root Prison',type:'Boss Relic',color:0x71d879,desc:'Crescent Slash trói quái và làm chậm boss.'},
  {id:'blood_pact',icon:'❤',name:'Blood Pact',type:'Survival Relic',color:0xff5f7c,desc:'Hạ quái hồi 8 HP, hạ Elite/Boss hồi nhiều hơn.'},
  {id:'guardian_shell',icon:'🛡',name:'Guardian Shell',type:'Defense Relic',color:0xb6e3ff,desc:'Giảm 22% sát thương nhận vào.'},
  {id:'wind_step',icon:'💨',name:'Wind Step',type:'Mobility Relic',color:0xb9fff5,desc:'Dash hồi nhanh hơn và lướt xa hơn.'},
  {id:'heavy_impact',icon:'💥',name:'Heavy Impact',type:'Combo Relic',color:0xffc65c,desc:'Combo hit 3 gây thêm sát thương và choáng quái.'},
  {id:'relic_surge',icon:'🔮',name:'Relic Surge',type:'Skill Relic',color:0xb88cff,desc:'Crescent Slash mạnh hơn và hồi chiêu nhanh hơn.'}
];
const RELIC_BY_ID=Object.fromEntries(RELICS.map(r=>[r.id,r]));

const RUN_AREAS=[
  {id:0,name:'Forest Entrance',start:0,end:950,rewardCoins:10,rewardHeal:6},
  {id:1,name:'Mossy Barricade Puzzle',start:950,end:1750,rewardCoins:16,rewardHeal:5},
  {id:2,name:'Fallen Tree Timing Trial',start:1750,end:2550,rewardCoins:20,rewardHeal:6},
  {id:3,name:'Ancient Ruins Seal Hunt',start:2550,end:3350,rewardCoins:24,rewardHeal:7},
  {id:4,name:'Root Gate Logic Trial',start:3350,end:4300,rewardCoins:32,rewardHeal:8},
  {id:5,name:'Boss Arena',start:4300,end:WORLD_W,rewardCoins:80,rewardHeal:0}
];


class AdventureScene extends Phaser.Scene{
  inputState={jump:false,attack:false,dash:false,skill:false}; joystickX=0; facing=1; canDash=true; dashReadyAt=0; isDashing=false; invincibleUntil=0; canAttack=true; attackReadyAt=0; attackStep=0; comboExpire=0; skillReadyAt=0; playerHP=100; ended=false; isMobileUI=false; controlWidgets=[]; pcSkillSlots=[]; mobileSkillSlots=[]; relics=[]; relicChoiceOpen=false; relicRewardQueue=[]; eliteRelicDropped=false; bossRelicDropped=false; relicHudItems=[]; burnTimers={}; boundUntil={}; bossSlowUntil=0;
  coins=0; checkpointX=120; chestOpened=false; portalUnlocked=false; bossActive=false; bossMaxHP=840; bossHP=840; bossPhase=1; bossBusy=false; bossNextAttack=0;
  enemies=[]; enemyId=0; miniBoss=null; forestRuneCollected=false; moonSealCollected=false; thornSealCollected=false; rootGateOpened=false; puzzleObstacles=[]; worldPuzzles=[]; puzzleTokens=[]; puzzleHud=null; puzzleGoalText=null; puzzleDecisionHint=null;
  constructor(){super('adventure')}
  preload() {
    this.load.image('kaiConcept', './public/assets/reference/kai-concept.png');
    this.load.json('assetManifest', './public/assets/asset-manifest.json');

    // Official asset slots.
    // Các file này có thể chưa tồn tại ở V0.6.1; fallback sẽ tự dùng runtime textures.
    this.officialAssetSlots = {
      kaiIdle: './public/assets/characters/kai/kai-idle.png',
      kaiRun: './public/assets/characters/kai/kai-run.png',
      kaiJump: './public/assets/characters/kai/kai-jump.png',
      kaiFall: './public/assets/characters/kai/kai-fall.png',
      kaiAttack1: './public/assets/characters/kai/kai-attack-1.png',
      kaiAttack2: './public/assets/characters/kai/kai-attack-2.png',
      kaiAttack3: './public/assets/characters/kai/kai-attack-3.png',
      kaiDash: './public/assets/characters/kai/kai-dash.png',
      kaiSkill: './public/assets/characters/kai/kai-skill.png',
      kaiHurt: './public/assets/characters/kai/kai-hurt.png',
      kaiDeath: './public/assets/characters/kai/kai-death.png',
      slimeIdle: './public/assets/enemies/slime/slime-idle.png',
      slimeMove: './public/assets/enemies/slime/slime-move.png',
      slimeHurt: './public/assets/enemies/slime/slime-hurt.png',
      slimeDeath: './public/assets/enemies/slime/slime-death.png',
      eliteIdle: './public/assets/enemies/elite/elite-idle.png',
      eliteAttack: './public/assets/enemies/elite/elite-attack.png',
      eliteHurt: './public/assets/enemies/elite/elite-hurt.png',
      eliteDeath: './public/assets/enemies/elite/elite-death.png',
      forestGuardianIdle: './public/assets/bosses/forest-guardian/forest-guardian-idle.png',
      forestGuardianCharge: './public/assets/bosses/forest-guardian/forest-guardian-charge.png',
      forestGuardianSlam: './public/assets/bosses/forest-guardian/forest-guardian-slam.png',
      forestGuardianRoot: './public/assets/bosses/forest-guardian/forest-guardian-root.png',
      forestGuardianRage: './public/assets/bosses/forest-guardian/forest-guardian-rage.png',
      forestGuardianDeath: './public/assets/bosses/forest-guardian/forest-guardian-death.png',
      forestSky: './public/assets/maps/whispering-forest/background/layer-sky.png',
      forestFarTrees: './public/assets/maps/whispering-forest/background/layer-far-trees.png',
      forestMidTrees: './public/assets/maps/whispering-forest/background/layer-mid-trees.png',
      forestRuins: './public/assets/maps/whispering-forest/background/layer-ruins.png',
      forestMist: './public/assets/maps/whispering-forest/background/layer-mist.png',
      forestForeground: './public/assets/maps/whispering-forest/background/layer-foreground.png',
      envRelicShard: './public/assets/maps/whispering-forest/props/relic-shard.png',
      envRockBlock: './public/assets/maps/whispering-forest/props/obstacle-rock-block.png',
      envFallenTree: './public/assets/maps/whispering-forest/props/obstacle-fallen-tree.png',
      envRootGate: './public/assets/maps/whispering-forest/props/puzzle-root-gate.png',
      envForestRune: './public/assets/maps/whispering-forest/props/puzzle-forest-rune.png',
      envMoonSeal: './public/assets/maps/whispering-forest/props/puzzle-moon-seal.png',
      envThornSeal: './public/assets/maps/whispering-forest/props/puzzle-thorn-seal.png',
      envForestSeal: './public/assets/maps/whispering-forest/props/puzzle-forest-seal.png',
      vfxSlashCrescent: './public/assets/vfx/slash/slash-crescent.png',
      vfxDashTrail: './public/assets/vfx/dash/dash-trail.png',
      vfxHitSpark: './public/assets/vfx/hit/hit-spark.png',
      vfxRootVine: './public/assets/vfx/root/root-vine.png',
      vfxBossWarning: './public/assets/vfx/boss/boss-warning-zone.png',
      vfxGroundCrack: './public/assets/vfx/boss/ground-slam-crack.png',
      vfxRelicAcquireRing: './public/assets/vfx/relic/relic-acquire-ring.png'
    };

    Object.entries(this.officialAssetSlots).forEach(([key, path]) => {
      this.load.image(key, path);
    });

    this.load.on('loaderror', (file) => {
      // Không chặn boot khi asset chính thức chưa có.
      console.warn('[Asset Slot Missing] fallback runtime texture:', file?.key || file?.src || file);
    });
  }
  create(){
    this.input.addPointer(4); this.cameras.main.setBackgroundColor(C.bg); this.physics.world.setBounds(0,0,WORLD_W,H);
    this.createTextures(); this.setupOfficialKaiSprites(); this.setupOfficialEnemyBossSprites(); this.initRunSystem(); this.createWorld(); this.createAmbientPolish(); this.createPlayer(); this.createEnemies(); this.createBoss(); this.createUI(); this.setupInput();
    this.cameras.main.startFollow(this.player,true,0.08,0.08); this.cameras.main.setBounds(0,0,WORLD_W,H); this.cameras.main.setDeadzone(240,110);
    this.physics.add.collider(this.player,this.ground);
    if(this.obstacles)this.physics.add.collider(this.player,this.obstacles);
    if(this.forestRune)this.physics.add.overlap(this.player,this.forestRune,()=>this.collectForestRune(),null,this);
    if(this.puzzleTokens&&this.puzzleTokens.length){for(const token of this.puzzleTokens){this.physics.add.overlap(this.player,token.sprite,()=>this.collectPuzzleToken(token),null,this);}}
    for(const e of this.enemies){this.physics.add.collider(e.sprite,this.ground); this.physics.add.overlap(this.player,e.sprite,()=>this.contactDamage(e.sprite,e.damage));}
    this.physics.add.collider(this.boss,this.ground); this.physics.add.overlap(this.player,this.boss,()=>this.contactDamage(this.boss,this.bossPhase===1?11:16));
    this.time.delayedCall(650,()=>this.flash('WORLD 1 • WHISPERING FOREST',1300));
  }
  createTextures(){
    const g=this.add.graphics();
    const makeKai=(key,pose={})=>{
      g.clear();
      const cx=48, base=84;
      const lean=pose.lean||0, bob=pose.bob||0;
      const scarf=pose.scf||1;
      const sword=pose.sword||'idle';
      // transparent frame is intentionally larger so attack/dash poses do not jitter.
      g.fillStyle(0x000000,0.18).fillEllipse(cx,base+5,42,10);
      // legs
      g.lineStyle(8,0x293038,1);
      if(pose.dead){
        g.lineStyle(9,0x293038,1); g.beginPath(); g.moveTo(30,70); g.lineTo(64,73); g.strokePath();
        g.lineStyle(9,0x3d2a20,1); g.beginPath(); g.moveTo(62,73); g.lineTo(80,70); g.strokePath();
      }else if(pose.run===1){
        g.beginPath(); g.moveTo(cx-8,57+bob); g.lineTo(cx-24,82); g.moveTo(cx+8,58+bob); g.lineTo(cx+25,80); g.strokePath();
      }else if(pose.run===2){
        g.beginPath(); g.moveTo(cx-8,58+bob); g.lineTo(cx-2,84); g.moveTo(cx+8,58+bob); g.lineTo(cx+17,82); g.strokePath();
      }else if(pose.jump){
        g.beginPath(); g.moveTo(cx-8,57); g.lineTo(cx-18,78); g.moveTo(cx+8,57); g.lineTo(cx+15,76); g.strokePath();
      }else{
        g.beginPath(); g.moveTo(cx-8,57+bob); g.lineTo(cx-14,84); g.moveTo(cx+8,57+bob); g.lineTo(cx+12,84); g.strokePath();
      }
      // boots
      g.fillStyle(0x6e492e,1).fillRoundedRect(cx-24,78,22,9,4).fillRoundedRect(cx+1,78,22,9,4);
      // scarf / cloak
      g.fillStyle(C.cyan2,1);
      const tail=pose.dash?[-34,22,-10,48,-42,60]:[-30*scarf,28+bob,-10,47+bob,-36*scarf,55+bob];
      g.fillTriangle(cx-10,30+bob,cx+tail[0],tail[1],cx+tail[4],tail[5]);
      g.fillStyle(0x2ddad1,0.65).fillTriangle(cx-5,36+bob,cx-28*scarf,30+bob,cx-18*scarf,45+bob);
      // torso and armor
      g.fillStyle(C.dark,1).fillRoundedRect(cx-16+lean,28+bob,34,37,10);
      g.fillStyle(C.cream,1).fillRoundedRect(cx-13+lean,29+bob,24,32,8);
      g.fillStyle(0x5b3b28,1).fillRect(cx-16+lean,50+bob,36,7);
      g.fillStyle(C.bronze,1).fillCircle(cx+17+lean,37+bob,8);
      g.fillStyle(C.cyan,1).fillCircle(cx+17+lean,37+bob,3);
      // arms
      g.lineStyle(8,0x3b2a21,1);
      if(sword==='attack1'){
        g.beginPath(); g.moveTo(cx+10,42+bob); g.lineTo(cx+36,32+bob); g.strokePath();
      }else if(sword==='attack2'){
        g.beginPath(); g.moveTo(cx+9,42+bob); g.lineTo(cx+36,56+bob); g.strokePath();
      }else if(sword==='attack3'||sword==='skill'){
        g.beginPath(); g.moveTo(cx+8,42+bob); g.lineTo(cx+42,38+bob); g.strokePath();
      }else if(pose.dead){
        g.beginPath(); g.moveTo(cx-5,48); g.lineTo(cx-30,66); g.strokePath();
      }else{
        g.beginPath(); g.moveTo(cx+11,42+bob); g.lineTo(cx+28,53+bob); g.moveTo(cx-11,42+bob); g.lineTo(cx-25,53+bob); g.strokePath();
      }
      // head + hair
      g.fillStyle(C.cream,1).fillCircle(cx+lean,20+bob,12);
      g.fillStyle(0x182126,1).fillCircle(cx-2+lean,15+bob,13);
      g.fillTriangle(cx-13+lean,14+bob,cx-4+lean,2+bob,cx+1+lean,16+bob);
      g.fillTriangle(cx+2+lean,13+bob,cx+13+lean,4+bob,cx+10+lean,18+bob);
      if(pose.hurt){g.fillStyle(0xff7373,0.9).fillCircle(cx+5+lean,20+bob,2)}
      else {g.fillStyle(0x07171b,1).fillCircle(cx+4+lean,20+bob,2)}
      // relic blade
      const drawSword=(x1,y1,x2,y2,w=4)=>{g.lineStyle(w+4,0x0b2528,1);g.beginPath();g.moveTo(x1,y1);g.lineTo(x2,y2);g.strokePath();g.lineStyle(w,C.cyan,1);g.beginPath();g.moveTo(x1,y1);g.lineTo(x2,y2);g.strokePath();g.fillStyle(0xeaffff,0.95).fillCircle(x2,y2,2)};
      if(sword==='attack1') drawSword(cx+34,32+bob,cx+74,18+bob,5);
      else if(sword==='attack2') drawSword(cx+35,55+bob,cx+76,70+bob,5);
      else if(sword==='attack3') drawSword(cx+40,39+bob,cx+87,39+bob,6);
      else if(sword==='skill') drawSword(cx+40,38+bob,cx+85,22+bob,6);
      else if(pose.dead) drawSword(cx+20,76,cx+74,78,3);
      else drawSword(cx+27,53+bob,cx+52,78+bob,4);
      g.generateTexture(key,96,96);
      g.clear();
    };

    makeKai('kai_idle_0',{bob:0,scf:1});
    makeKai('kai_idle_1',{bob:1,scf:1.08});
    makeKai('kai_run_0',{run:1,bob:0,scf:1.2});
    makeKai('kai_run_1',{run:2,bob:-1,scf:1.35});
    makeKai('kai_run_2',{run:1,bob:0,scf:1.1});
    makeKai('kai_run_3',{run:2,bob:1,scf:1.3});
    makeKai('kai_jump',{jump:true,scf:1.25});
    makeKai('kai_fall',{jump:true,bob:2,scf:1.05});
    makeKai('kai_dash',{dash:true,lean:4,scf:1.6});
    makeKai('kai_hurt',{hurt:true,lean:-2,scf:1});
    makeKai('kai_death',{dead:true});
    makeKai('kai_attack_1',{sword:'attack1',lean:2,scf:1.25});
    makeKai('kai_attack_2',{sword:'attack2',lean:3,scf:1.2});
    makeKai('kai_attack_3',{sword:'attack3',lean:4,scf:1.45});
    makeKai('kai_skill',{sword:'skill',lean:3,scf:1.55});
    g.fillStyle(C.dark).fillRoundedRect(4,12,44,64,12); g.fillStyle(C.cream).fillCircle(26,18,12); g.fillStyle(0x1d2428).fillCircle(26,14,13); g.fillStyle(C.cyan2).fillTriangle(12,32,42,32,8,58); g.fillStyle(C.bronze).fillRoundedRect(4,31,10,30,4); g.fillStyle(C.cyan).fillRect(39,28,5,42); g.generateTexture('kai',52,80); g.clear();

    // Official-style small HUD portrait for V0.6.1.
    g.fillStyle(0x061015,1).fillRoundedRect(0,0,74,74,16);
    g.lineStyle(3,C.cyan,0.75).strokeRoundedRect(3,3,68,68,14);
    g.fillStyle(0x0e3035,1).fillCircle(37,37,29);
    g.fillStyle(C.cyan2,0.9).fillTriangle(17,48,56,48,12,72);
    g.fillStyle(C.cream,1).fillCircle(37,29,14);
    g.fillStyle(0x172126,1).fillCircle(35,22,15);
    g.fillTriangle(22,22,32,4,39,24); g.fillTriangle(37,19,54,8,50,29);
    g.fillStyle(C.bronze,1).fillCircle(55,47,6);
    g.fillStyle(C.cyan,1).fillCircle(55,47,3);
    g.fillStyle(0x07171b,1).fillCircle(43,30,2);
    g.generateTexture('kaiPortrait',74,74); g.clear();

    // Updated creature silhouettes with small idle-readable details.
    g.fillStyle(0x142527,0.55).fillEllipse(34,43,74,14);
    g.fillStyle(0x365c52).fillEllipse(34,28,66,45);
    g.fillStyle(0x1d403c,1).fillTriangle(10,26,4,10,25,21); g.fillTriangle(58,26,65,10,43,21);
    g.fillStyle(0x83c982).fillCircle(18,20,6); g.fillCircle(50,20,6);
    g.fillStyle(0xe6f8d4).fillCircle(18,20,2); g.fillCircle(50,20,2);
    g.lineStyle(2,C.cyan,.55); g.beginPath(); g.moveTo(22,34); g.lineTo(34,39); g.lineTo(46,34); g.strokePath();
    g.generateTexture('slime',68,54); g.clear();

    g.fillStyle(0x0b171a,0.28).fillEllipse(48,88,76,16);
    g.fillStyle(0x263d45).fillRoundedRect(10,12,76,80,18);
    g.fillStyle(0x12252a).fillTriangle(15,20,2,2,36,15); g.fillTriangle(80,20,94,2,60,15);
    g.fillStyle(C.cyan).fillCircle(30,38,7); g.fillCircle(66,38,7);
    g.fillStyle(C.bronze).fillRect(14,76,68,8);
    g.lineStyle(4,C.cyan,.85); g.beginPath();g.moveTo(22,60);g.lineTo(48,68);g.lineTo(75,60);g.strokePath();
    g.generateTexture('elite',96,96); g.clear();

    g.fillStyle(0x0b171a,0.35).fillEllipse(68,120,132,22);
    g.fillStyle(0x34252d).fillRoundedRect(18,18,100,104,30);
    g.fillStyle(C.red2).fillTriangle(22,34,2,0,48,29); g.fillTriangle(114,34,134,0,88,29);
    g.lineStyle(5,0x151013,1);g.beginPath();g.moveTo(24,20);g.lineTo(4,58);g.moveTo(112,20);g.lineTo(132,58);g.strokePath();
    g.fillStyle(C.red).fillCircle(46,55,8); g.fillCircle(90,55,8);
    g.fillStyle(C.cyan,0.75).fillCircle(68,76,7);
    g.fillStyle(0xeedec8).fillRect(32,88,70,9);
    g.generateTexture('boss',136,124); g.clear();

    g.fillStyle(C.cyan).fillRoundedRect(0,0,80,10,5); g.generateTexture('slash',80,10); g.clear();
    g.fillStyle(0x7b4a20).fillRect(5,16,80,54); g.fillStyle(C.gold).fillRect(10,8,70,14); g.fillStyle(C.gold).fillRect(39,33,12,15); g.generateTexture('chest',90,72); g.clear();

    // Mobile action icons.
    g.lineStyle(7,0xffffff,1);g.beginPath();g.moveTo(16,46);g.lineTo(42,18);g.strokePath();g.fillStyle(0xffffff).fillTriangle(40,16,54,12,46,26);g.generateTexture('iconAttack',64,64);g.clear();
    g.lineStyle(7,0xffffff,1);g.beginPath();g.arc(30,34,17,3.7,6.4,false);g.strokePath();g.fillStyle(0xffffff).fillTriangle(44,18,57,25,46,31);g.generateTexture('iconSkill',64,64);g.clear();
    g.fillStyle(0xffffff).fillRoundedRect(10,38,18,6,3).fillRoundedRect(24,30,22,6,3).fillTriangle(45,19,58,25,46,31);g.generateTexture('iconDash',64,64);g.clear();
    g.fillStyle(0xffffff).fillRect(29,18,6,24).fillTriangle(18,28,46,28,32,10);g.generateTexture('iconJump',64,64);g.clear();

    for(const r of RELICS){
      g.fillStyle(0x061015,1).fillCircle(32,32,30);
      g.lineStyle(4,r.color,0.9); g.strokeCircle(32,32,27);
      g.fillStyle(r.color,0.16).fillCircle(32,32,21);
      g.lineStyle(3,0xffffff,0.78);
      if(r.id==='fire_blade'){g.beginPath();g.moveTo(34,12);g.lineTo(22,34);g.lineTo(34,52);g.lineTo(48,31);g.closePath();g.strokePath();}
      else if(r.id==='thunder_dash'){g.fillStyle(0xffffff,0.95).fillTriangle(38,8,18,36,33,34);g.fillTriangle(26,32,48,28,28,56);}
      else if(r.id==='root_prison'){g.beginPath();g.moveTo(32,54);g.lineTo(32,22);g.moveTo(32,42);g.lineTo(17,25);g.moveTo(32,38);g.lineTo(48,20);g.moveTo(32,31);g.lineTo(22,15);g.strokePath();}
      else if(r.id==='blood_pact'){g.fillStyle(0xffffff,0.95);g.fillCircle(25,26,8);g.fillCircle(39,26,8);g.fillTriangle(17,29,47,29,32,50);}
      else if(r.id==='guardian_shell'){g.beginPath();g.moveTo(32,10);g.lineTo(50,18);g.lineTo(45,43);g.lineTo(32,55);g.lineTo(19,43);g.lineTo(14,18);g.closePath();g.strokePath();}
      else if(r.id==='wind_step'){g.beginPath();g.moveTo(12,26);g.lineTo(46,26);g.moveTo(20,37);g.lineTo(56,37);g.moveTo(14,47);g.lineTo(40,47);g.strokePath();}
      else if(r.id==='heavy_impact'){g.beginPath();g.moveTo(32,11);g.lineTo(38,27);g.lineTo(55,30);g.lineTo(41,40);g.lineTo(44,56);g.lineTo(32,45);g.lineTo(20,56);g.lineTo(23,40);g.lineTo(9,30);g.lineTo(26,27);g.closePath();g.strokePath();}
      else {g.strokeCircle(32,32,12);g.beginPath();g.moveTo(32,12);g.lineTo(32,52);g.moveTo(12,32);g.lineTo(52,32);g.strokePath();}
      g.generateTexture('relic_'+r.id,64,64);g.clear();
    }
    g.destroy();
  }

  setupOfficialKaiSprites(){
    const pick=(slot,fallback)=>this.textures.exists(slot)?slot:fallback;
    this.kaiTex={
      idle:pick('kaiIdle','kai_idle_0'),
      idle2:pick('kaiIdle','kai_idle_1'),
      run:pick('kaiRun','kai_run_0'),
      runFrames:this.textures.exists('kaiRun')?['kaiRun']:['kai_run_0','kai_run_1','kai_run_2','kai_run_3'],
      jump:pick('kaiJump','kai_jump'),
      fall:pick('kaiFall','kai_fall'),
      attack1:pick('kaiAttack1','kai_attack_1'),
      attack2:pick('kaiAttack2','kai_attack_2'),
      attack3:pick('kaiAttack3','kai_attack_3'),
      dash:pick('kaiDash','kai_dash'),
      skill:pick('kaiSkill','kai_skill'),
      hurt:pick('kaiHurt','kai_hurt'),
      death:pick('kaiDeath','kai_death')
    };
    this.kaiOfficialActive = this.textures.exists('kaiIdle') || this.textures.exists('kaiRun') || this.textures.exists('kaiAttack1');
  }

  setupOfficialEnemyBossSprites(){
    const pick=(slot,fallback)=>this.textures.exists(slot)?slot:fallback;
    this.enemyTex={
      slime:{
        idle:pick('slimeIdle','slime'),
        move:pick('slimeMove','slime'),
        hurt:pick('slimeHurt','slime'),
        death:pick('slimeDeath','slime')
      },
      elite:{
        idle:pick('eliteIdle','elite'),
        move:pick('eliteIdle','elite'),
        attack:pick('eliteAttack','elite'),
        hurt:pick('eliteHurt','elite'),
        death:pick('eliteDeath','elite')
      }
    };
    this.bossTex={
      idle:pick('forestGuardianIdle','boss'),
      charge:pick('forestGuardianCharge','boss'),
      slam:pick('forestGuardianSlam','boss'),
      root:pick('forestGuardianRoot','boss'),
      rage:pick('forestGuardianRage','boss'),
      death:pick('forestGuardianDeath','boss')
    };
    this.enemyBossOfficialActive = this.textures.exists('slimeIdle') || this.textures.exists('eliteIdle') || this.textures.exists('forestGuardianIdle');
  }

  setEnemyTexture(e,state='idle'){
    if(!e||!e.sprite||!e.sprite.active)return;
    const group=this.enemyTex?.[e.type]||this.enemyTex?.slime;
    const key=group?.[state]||group?.idle||e.sprite.texture.key;
    if(key&&e.sprite.texture.key!==key)e.sprite.setTexture(key);
  }

  setBossTexture(state='idle'){
    if(!this.boss||!this.boss.active)return;
    const key=this.bossTex?.[state]||this.bossTex?.idle||this.boss.texture.key;
    if(key&&this.boss.texture.key!==key)this.boss.setTexture(key);
  }


  setKaiTexture(key){
    if(!this.player) return;
    if(key && key!==this.lastTexture){
      this.player.setTexture(key);
      this.lastTexture=key;
    }
  }


  createOfficialEnvironmentBackdrop(){
    this.envDrifters=[];
    const addStrip=(key,depth,scroll,alpha,y=0)=>{
      if(!this.textures.exists(key))return;
      for(let x=0;x<WORLD_W+W;x+=W){
        const img=this.add.image(x,y,key).setOrigin(0,0).setDepth(depth).setScrollFactor(scroll).setAlpha(alpha);
        img.setDisplaySize(W,H);
      }
    };
    addStrip('forestSky',-42,0.08,1,0);
    addStrip('forestFarTrees',-36,0.18,0.9,0);
    addStrip('forestMidTrees',-30,0.33,0.9,0);
    addStrip('forestRuins',-24,0.5,0.82,0);
    addStrip('forestMist',-16,0.64,0.52,0);
    addStrip('forestForeground',28,1.08,0.34,0);

    for(let i=0;i<8;i++){
      if(this.textures.exists('forestMist')){
        const fog=this.add.image(Phaser.Math.Between(0,WORLD_W),Phaser.Math.Between(385,635),'forestMist')
          .setDepth(22).setScrollFactor(0.9).setAlpha(Phaser.Math.FloatBetween(0.12,0.24));
        fog.setDisplaySize(780+Phaser.Math.Between(0,260),170+Phaser.Math.Between(0,80));
        fog.baseX=fog.x; fog.driftSpeed=Phaser.Math.FloatBetween(0.15,0.42); fog.phase=Phaser.Math.FloatBetween(0,6.28);
        this.envDrifters.push(fog);
      }
    }

    for(let i=0;i<18;i++){
      const x=Phaser.Math.Between(180,WORLD_W-180);
      if(this.textures.exists('envRelicShard')){
        const shard=this.add.image(x,FLOOR_TOP-Phaser.Math.Between(34,120),'envRelicShard')
          .setDepth(2).setScale(Phaser.Math.FloatBetween(0.32,0.62)).setAlpha(Phaser.Math.FloatBetween(0.24,0.55));
        this.tweens.add({targets:shard,y:shard.y-Phaser.Math.Between(5,14),alpha:shard.alpha+0.18,duration:1100+Phaser.Math.Between(0,950),yoyo:true,repeat:-1});
      }
    }
  }

  updateEnvironmentPolish(time){
    if(!this.envDrifters)return;
    for(const fog of this.envDrifters){
      fog.x = fog.baseX + Math.sin(time*0.00045 + fog.phase)*32 + time*0.00006*fog.driftSpeed*W;
      if(fog.x>WORLD_W+420){fog.x=-420;fog.baseX=-420;}
    }
  }

  createGroundCrack(x,y){
    if(this.textures.exists('vfxGroundCrack')){
      const crack=this.add.image(x,y,'vfxGroundCrack').setDepth(18).setAlpha(0.9).setScale(0.65+this.bossPhase*0.15);
      this.tweens.add({targets:crack,alpha:0,scaleX:1.25,scaleY:0.85,duration:700,onComplete:()=>crack.destroy()});
      return crack;
    }
    const g=this.add.graphics({x,y}).setDepth(18);
    g.lineStyle(5,C.red,0.8);g.beginPath();g.moveTo(-130,0);g.lineTo(-45,-12);g.lineTo(0,8);g.lineTo(55,-6);g.lineTo(135,4);g.strokePath();
    this.tweens.add({targets:g,alpha:0,duration:620,onComplete:()=>g.destroy()});
    return g;
  }

  createBossWarning(x,y,w,h,type='line'){
    let obj;
    if(this.textures.exists('vfxBossWarning')){
      obj=this.add.image(x,y,'vfxBossWarning').setDepth(17).setAlpha(0.55);
      obj.setDisplaySize(w,h);
    }else{
      obj=this.add.rectangle(x,y,w,h,C.warning,.25).setDepth(17);
    }
    this.tweens.add({targets:obj,alpha:0.9,yoyo:true,repeat:2,duration:120});
    return obj;
  }


  initRunSystem(){
    this.runAreas=RUN_AREAS.map(a=>({...a,cleared:false,entered:false}));
    this.runStats={
      runId:Date.now().toString(36).toUpperCase().slice(-6),
      startedAt:0,
      timeMs:0,
      kills:0,
      elites:0,
      bossDefeated:false,
      relicsCollected:0,
      coinsEarned:0,
      damageDealt:0,
      damageTaken:0,
      bestCombo:0,
      currentArea:0,
      completed:false,
      victory:false
    };
    this.pendingWaveReward=false;
  }

  startRunClock(){
    if(this.runStats && !this.runStats.startedAt)this.runStats.startedAt=this.time.now;
    this.markAreaEntered(0);
  }

  getAreaIndexByX(x){
    const idx=this.runAreas?this.runAreas.findIndex(a=>x>=a.start&&x<a.end):-1;
    return idx>=0?idx:0;
  }

  markAreaEntered(idx){
    if(!this.runAreas||!this.runAreas[idx]||this.runAreas[idx].entered)return;
    this.runAreas[idx].entered=true;
    if(this.areaText)this.areaText.setText(`AREA ${idx+1}/${this.runAreas.length} • ${this.runAreas[idx].name}`);
    if(idx>0)this.flash(`AREA ${idx+1} • ${this.runAreas[idx].name}`,850);
  }

  updateRunSystem(time){
    if(!this.runStats||this.runStats.completed)return;
    if(!this.runStats.startedAt)this.startRunClock();
    this.runStats.timeMs=time-this.runStats.startedAt;
    const idx=this.getAreaIndexByX(this.player.x);
    if(idx!==this.runStats.currentArea){
      this.runStats.currentArea=idx;
      this.markAreaEntered(idx);
    }
    if(this.runText){
      this.runText.setText(`RUN ${this.runStats.runId} • ${this.formatTime(this.runStats.timeMs)}`);
    }
    if(this.areaText){
      const area=this.runAreas[this.runStats.currentArea];
      this.areaText.setText(`AREA ${this.runStats.currentArea+1}/${this.runAreas.length} • ${area.name}`);
    }
  }

  formatTime(ms){
    const total=Math.max(0,Math.floor(ms/1000));
    const m=Math.floor(total/60).toString().padStart(2,'0');
    const s=(total%60).toString().padStart(2,'0');
    return `${m}:${s}`;
  }

  addCoins(amount){
    this.coins+=amount;
    if(this.runStats)this.runStats.coinsEarned+=amount;
  }

  recordKill(type){
    if(!this.runStats)return;
    this.runStats.kills++;
    if(type==='elite')this.runStats.elites++;
  }


  tryGrantAreaReward(areaId){
    if(areaId===undefined||areaId===null||!this.runAreas||!this.runAreas[areaId])return;
    const area=this.runAreas[areaId];
    if(area.cleared||areaId>=this.runAreas.length-1)return;
    const remaining=this.enemies.some(e=>e.areaId===areaId&&e.active);
    if(remaining)return;
    if(area.id===4&&!this.rootGateOpened){
      if(this.time.now>(this.nextPuzzleRewardReminder||0)){
        this.nextPuzzleRewardReminder=this.time.now+1800;
        this.flash('AREA NOT CLEAR YET\nSolve the Root Gate puzzle to claim this reward',1200);
      }
      return;
    }
    area.cleared=true;
    this.addCoins(area.rewardCoins);
    if(area.rewardHeal>0)this.healPlayer(area.rewardHeal);
    this.showAreaReward(area);
    if(area.id===4&&!this.relicChoiceOpen&&!this.ended)this.time.delayedCall(500,()=>this.showRelicChoices('area'));
  }

  showAreaReward(area){
    const t=this.add.text(W/2,185,`AREA CLEAR • ${area.name}\n+${area.rewardCoins} coin${area.rewardHeal?` • +${area.rewardHeal} HP`:''}`,{
      fontSize:'22px',
      fontStyle:'bold',
      color:'#ffe6ad',
      align:'center',
      stroke:'#061015',
      strokeThickness:6
    }).setOrigin(.5).setScrollFactor(0).setDepth(240);
    this.tweens.add({targets:t,y:150,alpha:0,duration:1200,onComplete:()=>t.destroy()});
  }

  finishRun(victory=false){
    if(this.runStats?.completed)return;
    this.ended=true;
    if(this.runStats){
      this.runStats.completed=true;
      this.runStats.victory=!!victory;
      this.runStats.timeMs=this.time.now-(this.runStats.startedAt||this.time.now);
      if(victory)this.runStats.bossDefeated=true;
    }
    this.physics.world.pause();
    this.showRunSummary(victory);
  }

  showRunSummary(victory=false){
    if(this.summaryLayer)this.summaryLayer.destroy();
    const st=this.runStats||{};
    const layer=this.add.container(0,0).setScrollFactor(0).setDepth(430);
    this.summaryLayer=layer;
    layer.add(this.add.rectangle(W/2,H/2,W,H,0x02080a,0.84));
    layer.add(this.add.rectangle(W/2,H/2,650,500,0x07171b,0.96).setStrokeStyle(3,victory?C.cyan:C.red,0.85));
    layer.add(this.add.text(W/2,130,victory?'RUN COMPLETE':'RUN FAILED',{
      fontSize:'34px',
      fontStyle:'bold',
      color:victory?'#c8fffb':'#ffd1d1',
      stroke:'#061015',
      strokeThickness:7
    }).setOrigin(.5));
    layer.add(this.add.text(W/2,171,victory?'Boss defeated • Portal escaped':'KAI fallen • Start a new run',{
      fontSize:'15px',
      color:'#ffe6ad'
    }).setOrigin(.5));

    const rows=[
      ['Time',this.formatTime(st.timeMs||0)],
      ['Enemies defeated',st.kills||0],
      ['Elite defeated',st.elites||0],
      ['Boss defeated',st.bossDefeated?'YES':'NO'],
      ['Relics collected',st.relicsCollected||this.relics.length],
      ['Coins earned',st.coinsEarned||0],
      ['Best combo',st.bestCombo||0],
      ['Damage dealt',st.damageDealt||0],
      ['Damage taken',st.damageTaken||0],
      ['Puzzle solved',this.rootGateOpened?`Root Gate • ${this.getPuzzleSealCount()}/3 seals`:`${this.getPuzzleSealCount()}/3 seals`]
    ];
    rows.forEach((row,i)=>{
      const y=214+i*28;
      layer.add(this.add.text(W/2-230,y,row[0],{fontSize:'16px',color:'#b7d4d2'}).setOrigin(0,.5));
      layer.add(this.add.text(W/2+210,y,String(row[1]),{fontSize:'16px',fontStyle:'bold',color:'#ffffff'}).setOrigin(1,.5));
    });

    const btnBg=this.add.rectangle(W/2,610,210,52,0xf4c76b,1).setStrokeStyle(3,0xffffff,0.25);
    const btnText=this.add.text(W/2,610,'NEW RUN / RETRY',{fontSize:'16px',fontStyle:'bold',color:'#07171b'}).setOrigin(.5);
    const btnHit=this.add.zone(W/2,610,250,82);
    [btnBg,btnText,btnHit].forEach(o=>this.makeUiButtonHit(o,(pointer)=>this.scene.restart()));
    btnHit.setDepth(999);
    layer.add([btnBg,btnText,btnHit]);
    layer.add(this.add.text(W/2,656,'PC: nhấn R • Mobile: tap nút NEW RUN / RETRY',{fontSize:'13px',color:'#89a5a4'}).setOrigin(.5));
    if(this.status)this.status.setVisible(false);
  }

  createWorld(){
    this.createOfficialEnvironmentBackdrop();
    // Layered dark-fantasy forest: silhouettes, ruins, mist, and teal relic glows.
    for(let i=0;i<36;i++){
      const x=i*140+20,h=110+(i%7)*30;
      this.add.rectangle(x,570-h/2,120,h,i%2?0x0b2427:0x071c20).setScrollFactor(0.25).setAlpha(0.75);
      if(i%3===0) this.add.circle(x+55,540-h,22,C.cyan,0.045).setScrollFactor(0.18);
    }
    for(let i=0;i<18;i++){
      const x=i*260+80;
      this.add.rectangle(x,470,18,260,0x123034,0.5).setScrollFactor(0.42);
      this.add.triangle(x,320,x-58,475,x+58,475,0x123034,0.55).setScrollFactor(0.42);
    }
    for(let i=0;i<10;i++){
      const x=i*420+260;
      this.add.rectangle(x,438,58,150,0x1b302f,0.68).setScrollFactor(0.55);
      this.add.rectangle(x,360,78,22,0x203b38,0.8).setScrollFactor(0.55);
      this.add.circle(x,386,10,C.cyan,0.18).setScrollFactor(0.55);
    }
    this.add.circle(1120,120,84,0x85fff6,0.08).setScrollFactor(0.12);
    this.ground=this.physics.add.staticGroup();
    const floor=this.add.rectangle(WORLD_W/2,FLOOR_TOP+50,WORLD_W,100,0x172a29);
    this.physics.add.existing(floor,true);this.ground.add(floor);
    [[420,555,180],[900,520,170],[1360,565,190],[1810,510,190],[2380,555,190],[2920,525,210],[3450,560,180]].forEach(([x,y,w])=>{
      const p=this.add.rectangle(x,y,w,22,0x23423d);
      this.physics.add.existing(p,true);this.ground.add(p);
      this.add.rectangle(x,y-15,w-22,4,C.cyan,0.13);
    });
    this.createWorld1Puzzles();
    for(let i=0;i<54;i++){
      const x=Phaser.Math.Between(80,WORLD_W-80), y=Phaser.Math.Between(505,650);
      this.add.triangle(x,y,x-8,y+18,x+10,y+18,i%2?0x214d40:0x193a34,0.8);
      if(i%5===0) this.add.circle(x+8,y+8,3,C.cyan,0.22);
    }
    this.add.text(70,105,'WHISPERING FOREST',{fontSize:'22px',fontStyle:'bold',color:'#8ff8f0'});
    this.add.text(70,133,'World 1 Puzzle Flow Fix & Difficulty Tuning • Puzzle Obstacles',{fontSize:'13px',color:'#8aa9a7'});
    this.checkpoint=this.add.container(1760,590);this.checkpoint.add(this.add.rectangle(0,0,18,95,C.cyan2,0.7));this.checkpoint.add(this.add.circle(0,-52,18,C.cyan,0.8));this.checkpoint.add(this.add.text(0,36,'CHECKPOINT',{fontSize:'12px',color:'#9ff'}).setOrigin(0.5));
    this.tweens.add({targets:this.checkpoint.list[1],scale:1.2,alpha:0.55,yoyo:true,repeat:-1,duration:850});
    this.chest=this.physics.add.staticSprite(2600,FLOOR_TOP-36,'chest');
    this.portal=this.add.container(5050,FLOOR_TOP-86).setVisible(false); const ring=this.add.circle(0,0,62,C.cyan,0.13).setStrokeStyle(7,C.cyan,0.8); const core=this.add.circle(0,0,32,C.cyan2,0.45); this.portal.add([ring,core,this.add.text(0,88,'EXIT PORTAL',{fontSize:'14px',color:'#bff'}).setOrigin(0.5)]); this.tweens.add({targets:core,scale:1.2,alpha:0.75,yoyo:true,repeat:-1,duration:700});
    this.physics.add.overlap(this.player??this.add.zone(-999,-999,1,1),this.chest,()=>{});
  }
  createAmbientPolish(){
    // V0.6.1 KAI Official Sprite Integration: lightweight runtime atmosphere.
    this.add.rectangle(WORLD_W/2, 0, WORLD_W, H, 0x031013, 0.16).setOrigin(0.5,0).setScrollFactor(0.12).setDepth(-8);
    for(let i=0;i<34;i++){
      const x=Phaser.Math.Between(120,WORLD_W-120);
      const y=Phaser.Math.Between(120,FLOOR_TOP-90);
      const p=this.add.circle(x,y,Phaser.Math.Between(2,5),C.cyan,Phaser.Math.FloatBetween(0.08,0.22)).setDepth(-1).setScrollFactor(Phaser.Math.FloatBetween(0.55,0.9));
      this.tweens.add({targets:p,y:y-Phaser.Math.Between(18,46),alpha:Phaser.Math.FloatBetween(0.02,0.14),duration:Phaser.Math.Between(1800,3600),yoyo:true,repeat:-1,delay:Phaser.Math.Between(0,1200)});
    }
    for(let i=0;i<9;i++){
      const x=Phaser.Math.Between(260,WORLD_W-260);
      const beam=this.add.rectangle(x,335,18,430,C.cyan,0.035).setAngle(Phaser.Math.Between(-8,8)).setDepth(-2).setScrollFactor(0.35);
      this.tweens.add({targets:beam,alpha:0.075,duration:2200+i*110,yoyo:true,repeat:-1});
    }
    for(let i=0;i<14;i++){
      const x=Phaser.Math.Between(220,WORLD_W-220);
      const relic=this.add.rectangle(x, FLOOR_TOP-Phaser.Math.Between(25,72), 8, 14, C.cyan, 0.16).setAngle(45).setDepth(1);
      this.tweens.add({targets:relic,alpha:0.36,scale:1.25,duration:900+Phaser.Math.Between(0,800),yoyo:true,repeat:-1});
    }
  }


  createWorld1Puzzles(){
    this.obstacles=this.physics.add.staticGroup();
    this.puzzleObstacles=[];
    this.puzzleTokens=[];
    this.moonSealCollected=false;
    this.thornSealCollected=false;
    this.forestRuneCollected=false;
    this.rootGateOpened=false;

    // Puzzle 1: Mossy Rock Block.
    // Người chơi không thể chỉ chạy thẳng. Muốn lấy Moon Seal phải quan sát bệ thấp/bệ cao.
    this.createObstacleSprite(1515,FLOOR_TOP-55,'envRockBlock',92,118,72,110,'MOSSY ROCK BLOCK');
    this.createPuzzleLedge(1360,532,128,'low step');
    this.createPuzzleLedge(1532,490,108,'middle');
    this.createPuzzleLedge(1688,456,116,'seal ledge');
    this.createPuzzleToken('moon',1688,412,'MOON SEAL',this.textures.exists('envMoonSeal')?'envMoonSeal':'envForestRune',0x66e8ff);
    this.addPuzzleHint(1496,FLOOR_TOP-156,'PUZZLE 1 • Đá chắn đường\nKhông chạy thẳng được\nQuan sát bệ thấp → bệ cao → lấy Moon Seal');

    // Puzzle 2: Fallen Tree.
    // Buộc người chơi thử timing Jump + Dash để lấy Thorn Seal, nếu bỏ qua sẽ kẹt ở Root Gate.
    this.createObstacleSprite(2320,FLOOR_TOP-27,'envFallenTree',270,62,250,48,'FALLEN TREE');
    this.createPuzzleLedge(2172,532,112,'start');
    this.createPuzzleLedge(2328,492,96,'dash gap');
    this.createPuzzleLedge(2502,462,116,'thorn');
    this.createPuzzleToken('thorn',2502,416,'THORN SEAL',this.textures.exists('envThornSeal')?'envThornSeal':'envForestRune',0x71d879);
    this.addPuzzleHint(2320,FLOOR_TOP-136,'PUZZLE 2 • Cây đổ chắn đường\nNhảy qua nhánh thấp\nDash đúng nhịp để lấy Thorn Seal');

    // Puzzle 3: Ancient Root Gate.
    // Forest Rune chỉ mở cổng nếu người chơi đã thu đủ 2 seal trước đó.
    this.createPuzzleLedge(3120,540,130,'ruins 1');
    this.createPuzzleLedge(3286,500,110,'ruins 2');
    this.createPuzzleLedge(3432,458,120,'rune altar');
    this.forestRune=this.physics.add.staticImage(3432,410,this.textures.exists('envForestSeal')?'envForestSeal':(this.textures.exists('envForestRune')?'envForestRune':'envRelicShard')).setDepth(18).setDisplaySize(64,64).refreshBody();
    this.tweens.add({targets:this.forestRune,y:400,alpha:0.72,duration:760,yoyo:true,repeat:-1});
    this.rootGateVisual=this.add.image(3670,FLOOR_TOP-92,this.textures.exists('envRootGate')?'envRootGate':'envRelicShard').setDepth(16).setDisplaySize(118,172);
    this.rootGateBody=this.add.rectangle(3670,FLOOR_TOP-72,78,150,0x000000,0.001).setDepth(16);
    this.physics.add.existing(this.rootGateBody,true);this.obstacles.add(this.rootGateBody);
    this.addPuzzleHint(3432,365,'PUZZLE 3 • FOREST RUNE\nCổng chỉ mở khi có đủ\nMoon Seal + Thorn Seal + Forest Rune');
    this.gateHint=this.add.text(3670,FLOOR_TOP-206,'ROOT GATE LOCKED\nCần 3 dấu ấn: Moon + Thorn + Forest', {fontSize:'13px',fontStyle:'bold',color:'#c8fffb',align:'center',stroke:'#061015',strokeThickness:4,wordWrap:{width:260}}).setOrigin(.5).setDepth(35);

    // Một "false low route" nhỏ để người chơi hiểu phải suy nghĩ bằng đường cao.
    this.addPuzzleHint(2870,FLOOR_TOP-120,'Gợi ý: Không phải lối nào chạy thẳng cũng đúng\nHãy nhìn dấu sáng trên bệ cao');
  }

  createObstacleSprite(x,y,key,displayW,displayH,bodyW,bodyH,label){
    const tex=this.textures.exists(key)?key:'envRelicShard';
    const visual=this.add.image(x,y,tex).setDepth(14).setDisplaySize(displayW,displayH);
    const body=this.add.rectangle(x,y,bodyW,bodyH,0x000000,0.001).setDepth(13);
    this.physics.add.existing(body,true);
    this.obstacles.add(body);
    body.puzzleLabel=label;
    this.puzzleObstacles.push({visual,body,label});
    return body;
  }

  createPuzzleLedge(x,y,w,label=''){
    const p=this.add.rectangle(x,y,w,20,0x294841,0.94).setDepth(9);
    this.physics.add.existing(p,true);this.ground.add(p);
    this.add.rectangle(x,y-14,w-20,4,C.cyan,0.18).setDepth(10);
    if(label)this.add.text(x,y-35,label,{fontSize:'10px',fontStyle:'bold',color:'#9ff',stroke:'#061015',strokeThickness:3}).setOrigin(.5).setDepth(20).setAlpha(.75);
    return p;
  }

  addPuzzleHint(x,y,text){
    const t=this.add.text(x,y,text,{fontSize:'13px',fontStyle:'bold',color:'#eaffff',align:'center',stroke:'#061015',strokeThickness:4,wordWrap:{width:220}}).setOrigin(.5).setDepth(31).setAlpha(.82);
    this.worldPuzzles.push(t);
    this.tweens.add({targets:t,y:y-8,alpha:.58,duration:1100,yoyo:true,repeat:-1});
    return t;
  }


  createPuzzleToken(id,x,y,label,key,color){
    const sprite=this.physics.add.staticImage(x,y,key).setDepth(22).setDisplaySize(58,58).refreshBody();
    sprite.setTint(color);
    const aura=this.add.circle(x,y,32,color,0.13).setDepth(20);
    const text=this.add.text(x,y-48,label,{fontSize:'11px',fontStyle:'bold',color:'#eaffff',align:'center',stroke:'#061015',strokeThickness:4}).setOrigin(.5).setDepth(32).setAlpha(.86);
    this.tweens.add({targets:[sprite,aura],y:y-8,alpha:0.82,duration:820,yoyo:true,repeat:-1});
    const token={id,label,sprite,aura,text,color,collected:false};
    this.puzzleTokens.push(token);
    return token;
  }

  collectPuzzleToken(token){
    if(!token||token.collected)return;
    token.collected=true;
    if(token.id==='moon')this.moonSealCollected=true;
    if(token.id==='thorn')this.thornSealCollected=true;
    if(token.sprite){this.tweens.add({targets:token.sprite,scale:1.55,alpha:0,y:token.sprite.y-44,duration:420,onComplete:()=>token.sprite.destroy()});}
    if(token.aura){this.tweens.add({targets:token.aura,scale:1.9,alpha:0,duration:420,onComplete:()=>token.aura.destroy()});}
    if(token.text){token.text.setText(token.label); this.tweens.add({targets:token.text,alpha:0,y:token.text.y-22,duration:520,onComplete:()=>token.text.destroy()});}
    this.addCoins(12);
    this.flash(`${token.label} ACQUIRED • Puzzle seal ${this.getPuzzleSealCount()}/3`,1050);
    this.updatePuzzleHud();
    this.tryOpenRootGate();
  }

  getPuzzleSealCount(){
    return (this.moonSealCollected?1:0)+(this.thornSealCollected?1:0)+(this.forestRuneCollected?1:0);
  }

  tryOpenRootGate(){
    this.updatePuzzleHud();
    if(this.rootGateOpened)return;
    if(this.moonSealCollected&&this.thornSealCollected&&this.forestRuneCollected){
      this.openRootGate();
      return;
    }
    if(this.forestRuneCollected){
      const missing=[];
      if(!this.moonSealCollected)missing.push('Moon Seal ở khu đá chắn');
      if(!this.thornSealCollected)missing.push('Thorn Seal ở khu cây đổ');
      this.flash(`ROOT GATE STILL LOCKED\nThiếu: ${missing.join(' + ')}`,1500);
      if(this.gateHint)this.gateHint.setText(`ROOT GATE LOCKED\nThiếu: ${missing.join(' + ')}`);
    }
  }

  updatePuzzleHud(){
    const c=this.getPuzzleSealCount?this.getPuzzleSealCount():0;
    const parts=[
      this.moonSealCollected?'✓ Moon':'□ Moon',
      this.thornSealCollected?'✓ Thorn':'□ Thorn',
      this.forestRuneCollected?'✓ Forest':'□ Forest'
    ];
    if(this.puzzleHud)this.puzzleHud.setText(`PUZZLE SEALS ${c}/3 • ${parts.join('  ')}`);
    if(this.puzzleGoalText){
      const goal=this.rootGateOpened?'Root Gate opened • Boss path unlocked':'Find 3 seals to unlock Root Gate';
      this.puzzleGoalText.setText(goal);
    }
  }



  collectForestRune(){
    if(this.forestRuneCollected)return;
    this.forestRuneCollected=true;
    if(this.forestRune){this.tweens.add({targets:this.forestRune,scale:1.45,alpha:0,y:this.forestRune.y-42,duration:420,onComplete:()=>this.forestRune.destroy()});}
    this.addCoins(16);
    this.healPlayer(6);
    this.flash(`FOREST RUNE ACQUIRED • Puzzle seal ${this.getPuzzleSealCount()}/3`,1100);
    this.tryOpenRootGate();
  }


  openRootGate(){
    if(this.rootGateOpened)return;
    this.rootGateOpened=true;
    if(this.rootGateBody){this.rootGateBody.body.enable=false;this.rootGateBody.destroy();this.rootGateBody=null;}
    if(this.gateHint)this.gateHint.setText('ROOT GATE OPENED\nBoss path unlocked').setColor('#9dffb0');
    if(this.rootGateVisual){this.tweens.add({targets:this.rootGateVisual,alpha:0.12,y:this.rootGateVisual.y-32,scaleX:0.82,scaleY:0.82,duration:520});}
    this.createRootFx(3670,FLOOR_TOP-25);
    this.addCoins(18);
    this.healPlayer(8);
    if(this.objective)this.objective.setText('OBJECTIVE: Root Gate solved • Reach the Boss Arena');
    this.flash('PUZZLE SOLVED • ROOT GATE OPENED',1300);
    this.updatePuzzleHud();
  }

  createPlayer(){this.player=this.physics.add.sprite(120,FLOOR_TOP-38,this.kaiTex.idle).setCollideWorldBounds(true).setDragX(1600).setMaxVelocity(520,900);this.player.body.setSize(38,68).setOffset(29,18);this.animLockUntil=0;this.hurtUntil=0;this.lastTexture=this.kaiTex.idle}
  spawnEnemy(x,type='slime'){const elite=type==='elite';const y=elite?FLOOR_TOP-54:FLOOR_TOP-30;const tex=elite?this.enemyTex.elite.idle:this.enemyTex.slime.idle;const s=this.physics.add.sprite(x,y,tex).setCollideWorldBounds(true).setDragX(900).setBounce(0.02).setDepth(10);s.body.setSize(elite?76:58,elite?78:38).setOffset(elite?26:19,elite?38:23);const hp=elite?155:60;const e={id:++this.enemyId,sprite:s,type,hp,maxHp:hp,damage:elite?11:6,speed:elite?78:62,active:true,floorY:y,state:'idle',areaId:this.getAreaIndexByX(x)};this.enemies.push(e);return e}
  createEnemies(){[620,1040,1280,1980,2240,2570,3150,3890,4140].forEach(x=>this.spawnEnemy(x));this.miniBoss=this.spawnEnemy(2850,'elite');this.spawnEnemy(4050,'elite')}
  createBoss(){this.boss=this.physics.add.sprite(4720,FLOOR_TOP-76,this.bossTex.idle).setVisible(false).setActive(false).setCollideWorldBounds(true).setDepth(12);this.boss.body.setSize(96,104).setOffset(20,18);this.boss.body.enable=false}
  setupInput(){if(this.input.setTopOnly)this.input.setTopOnly(false);else this.input.topOnly=false;if(this.input.keyboard)this.keys={left:this.input.keyboard.addKey('A'),right:this.input.keyboard.addKey('D'),left2:this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT),right2:this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT),jump:this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),attack:this.input.keyboard.addKey('J'),dash:this.input.keyboard.addKey('K'),skill:this.input.keyboard.addKey('L'),restart:this.input.keyboard.addKey('R'),choice1:this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE),choice2:this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO),choice3:this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.THREE)};this.input.on('pointerdown',p=>this.handlePointerButtonFallback(p));}

  stopUiEvent(event){if(event&&event.stopPropagation)event.stopPropagation();}

  pressVirtualAction(field,hold=false){
    if(this.relicChoiceOpen||this.ended)return;
    this.inputState[field]=true;
    if(!hold)this.time.delayedCall(90,()=>{this.inputState[field]=false;});
  }

  makeUiButtonHit(target,onPick){
    target.setInteractive({useHandCursor:true});
    target.on('pointerdown',(pointer,localX,localY,event)=>{this.stopUiEvent(event);onPick(pointer);});
    target.on('pointerup',(pointer,localX,localY,event)=>this.stopUiEvent(event));
    target.on('pointerupoutside',(pointer,localX,localY,event)=>this.stopUiEvent(event));
    return target;
  }


  canMeleeHit(target,reach,verticalGapLimit=18,behindAllowance=28){
    if(!this.player||!target||!this.player.body||!target.body||!target.body.enable)return false;
    const pb=this.player.body,tb=target.body;
    const p={left:pb.x,right:pb.x+pb.width,top:pb.y,bottom:pb.y+pb.height,cx:pb.x+pb.width/2,cy:pb.y+pb.height/2};
    const t={left:tb.x,right:tb.x+tb.width,top:tb.y,bottom:tb.y+tb.height,cx:tb.x+tb.width/2,cy:tb.y+tb.height/2};
    const inFront=this.facing>0?t.cx>=p.cx-4:t.cx<=p.cx+4;
    const frontGap=this.facing>0?t.left-p.right:p.left-t.right;
    const verticalOverlap=Math.min(p.bottom,t.bottom)-Math.max(p.top,t.top);
    const centerYGap=Math.abs(p.cy-t.cy);
    // V0.6.1: stricter combat tier. KAI đứng trên bệ/tường không còn chém xuyên xuống tầng dưới.
    const footGap=Math.abs(p.bottom-t.bottom);
    const sameCombatLevel=(verticalOverlap>=16 || centerYGap<=verticalGapLimit) && footGap<=46;
    if(!inFront||frontGap>reach||frontGap<-behindAllowance||!sameCombatLevel)return false;
    return !this.isObstacleBetween(p,t);
  }

  isObstacleBetween(p,t){
    if(!this.puzzleObstacles||!this.puzzleObstacles.length)return false;
    const left=Math.min(p.cx,t.cx),right=Math.max(p.cx,t.cx);
    const y=(p.cy+t.cy)/2;
    return this.puzzleObstacles.some(o=>{
      const b=o.body?.body;if(!b||!b.enable)return false;
      const cx=b.x+b.width/2,top=b.y,bottom=b.y+b.height;
      return cx>left&&cx<right&&y>top-12&&y<bottom+12;
    });
  }

  handlePointerButtonFallback(pointer){
    if(!pointer)return;
    // Robust PC/touch fallback in case Phaser zone ordering misses the click.
    if(this.relicChoiceOpen&&this.relicChoices&&this.relicChoices.length){
      const sx=W/2-315;
      for(let i=0;i<this.relicChoices.length;i++){
        const x=sx+i*315,y=345;
        if(pointer.x>=x-150&&pointer.x<=x+150&&pointer.y>=y-165&&pointer.y<=y+165){const c=this.relicChoices[i];this.selectRelic(c.id,c.source);return;}
      }
    }
    if(this.ended&&pointer.x>=W/2-140&&pointer.x<=W/2+140&&pointer.y>=560&&pointer.y<=655){this.scene.restart();return;}
    if(!this.isMobileUI&&!this.relicChoiceOpen&&!this.ended){
      const map=[{field:'jump',x:W/2-126,y:H-52,r:50},{field:'dash',x:W/2-42,y:H-52,r:52},{field:'skill',x:W/2+44,y:H-52,r:54},{field:'attack',x:W/2+132,y:H-52,r:58}];
      for(const b of map){if(Math.hypot(pointer.x-b.x,pointer.y-b.y)<=b.r){this.pressVirtualAction(b.field);return;}}
    }
  }

  createUI(){
    this.isMobileUI = this.detectMobileUI();
    const ui=this.add.container(0,0).setScrollFactor(0).setDepth(100);
    ui.add(this.add.rectangle(18,18,350,62,0x061015,0.82).setOrigin(0));
    ui.add(this.add.image(47,49,'kaiPortrait').setDisplaySize(48,48));
    ui.add(this.add.text(82,27,'KAI',{fontSize:'16px',fontStyle:'bold',color:'#d8fffc'}));
    this.hpBar=this.add.graphics();ui.add(this.hpBar);
    this.objective=this.add.text(28,94,'OBJECTIVE: Solve seal puzzles, clear areas and build Relics',{fontSize:'16px',color:'#d8fffc',backgroundColor:'#061015aa',padding:{x:12,y:8}});ui.add(this.objective);
    ui.add(this.add.rectangle(386,18,455,82,0x061015,0.70).setOrigin(0));
    this.runText=this.add.text(402,28,'RUN ------ • 00:00',{fontSize:'15px',fontStyle:'bold',color:'#ffe6ad'});ui.add(this.runText);
    this.areaText=this.add.text(402,53,'AREA 1/6 • Forest Entrance',{fontSize:'13px',color:'#8ff8f0'});ui.add(this.areaText);
    this.puzzleHud=this.add.text(402,76,'PUZZLE SEALS 0/3 • □ Moon  □ Thorn  □ Forest',{fontSize:'12px',fontStyle:'bold',color:'#bffaf5',stroke:'#061015',strokeThickness:3});ui.add(this.puzzleHud);
    this.relicHud=this.add.container(28,140);
    this.relicHud.add(this.add.rectangle(0,0,390,70,0x061015,0.46).setOrigin(0));
    this.relicHud.add(this.add.text(12,8,'RELIC BUILD',{fontSize:'12px',fontStyle:'bold',color:'#8ff8f0'}));
    this.relicHud.add(this.add.text(12,31,'Chưa có Relic • Hạ Elite để chọn sức mạnh đầu tiên',{fontSize:'12px',color:'#b7d4d2'}));
    ui.add(this.relicHud);
    this.coinText=this.add.text(W-220,25,'COIN 0',{fontSize:'18px',fontStyle:'bold',color:'#f7d77d'});ui.add(this.coinText);
    this.skillText=this.add.text(W-220,52,'Skill READY',{fontSize:'14px',color:'#8ff8f0'}).setVisible(this.isMobileUI);ui.add(this.skillText);
    this.bossLabel=this.add.text(W/2,20,'CORRUPTED FOREST GUARDIAN',{fontSize:'17px',fontStyle:'bold',color:'#ffd6d6'}).setOrigin(.5,0).setVisible(false);this.bossBar=this.add.graphics().setVisible(false);ui.add([this.bossLabel,this.bossBar]);
    this.status=this.add.text(W/2,115,'',{fontSize:'30px',fontStyle:'bold',color:'#fff',stroke:'#07171b',strokeThickness:7,align:'center'}).setOrigin(.5).setVisible(false);ui.add(this.status);
    this.pcHint=this.add.text(26,H-30,'PC: A/D hoặc ←/→ để di chuyển • SPACE/J/K/L dùng kỹ năng',{fontSize:'13px',color:'#89a5a4'}).setVisible(!this.isMobileUI);ui.add(this.pcHint);
    this.mobileHint=this.add.text(26,H-30,'Mobile: joystick bên trái • nút kỹ năng bên phải',{fontSize:'13px',color:'#89a5a4'}).setVisible(this.isMobileUI);ui.add(this.mobileHint);
    this.createMobileControls(ui);
    this.createPcSkillDock(ui);
    this.applyResponsiveControls();
    this.scale.on('resize',()=>this.applyResponsiveControls());
    this.drawUI();
  }
  detectMobileUI(){
    const ua = (navigator.userAgent || '').toLowerCase();
    const mobileUa = /android|iphone|ipad|ipod|mobile/.test(ua);
    const coarse = !!(window.matchMedia && window.matchMedia('(pointer: coarse)').matches);
    return mobileUa || (coarse && window.innerWidth <= 1200);
  }
  applyResponsiveControls(){
    this.isMobileUI = this.detectMobileUI();
    if(!this.isMobileUI){this.resetJoy();this.inputState={jump:false,attack:false,dash:false,skill:false};}
    if(this.skillText)this.skillText.setVisible(this.isMobileUI);
    if(this.pcHint)this.pcHint.setVisible(!this.isMobileUI);
    if(this.mobileHint)this.mobileHint.setVisible(this.isMobileUI);
    for(const o of this.controlWidgets){ if(o && o.setVisible) o.setVisible(this.isMobileUI); }
    for(const slot of this.pcSkillSlots){
      for(const o of slot.objects){ if(o && o.setVisible) o.setVisible(!this.isMobileUI); }
      if(slot.cooldownOverlay) slot.cooldownOverlay.setVisible(false);
      if(slot.cooldownText) slot.cooldownText.setVisible(false);
    }
  }
  createMobileControls(ui){
    this.joy={baseX:130,baseY:H-118,radius:56,pointerId:null};
    const base=this.add.circle(130,H-118,56,0x103137,.28).setStrokeStyle(2,C.cyan,.22);
    const halo=this.add.circle(130,H-118,40,C.cyan,.035).setStrokeStyle(1,0xffffff,.04);
    const knob=this.add.circle(130,H-118,28,0x1b4b52,.46).setStrokeStyle(2,0xffffff,.14);
    const zone=this.add.circle(130,H-118,92,0,0.001).setInteractive();
    this.joy.base=base;this.joy.knob=knob;this.controlWidgets.push(base,halo,knob,zone);
    const start=p=>{if(!this.isMobileUI||this.relicChoiceOpen||this.ended||p.x>W*.45)return;this.joy.pointerId=p.id;this.updateJoy(p);base.setScale(1.04);knob.setScale(1.06)};
    zone.on('pointerdown',(pointer,localX,localY,event)=>{this.stopUiEvent(event);start(pointer);});
    this.input.on('pointerdown',p=>{if(!this.isMobileUI||this.relicChoiceOpen||this.ended)return;if(this.joy.pointerId===null&&p.x<W*.45&&p.y>H*.46)start(p)});
    this.input.on('pointermove',p=>{if(this.isMobileUI&&this.joy.pointerId===p.id)this.updateJoy(p)});
    const stop=p=>{if(this.joy.pointerId===p.id){this.resetJoy();base.setScale(1);knob.setScale(1)}};
    this.input.on('pointerup',stop);this.input.on('pointerupoutside',stop);
    ui.add([base,halo,knob,zone]);
    const btn=(x,y,r,key,field,bg,accent,label)=>{
      const shadow=this.add.circle(x+6,y+7,r+2,0x000000,.24);
      const ring=this.add.circle(x,y,r,bg,.9).setStrokeStyle(3,accent,.55);
      const inner=this.add.circle(x,y,r-10,accent,.08);
      const icon=this.add.image(x,y,key).setDisplaySize(r*1.08,r*1.08);
      const txt=this.add.text(x,y+r+13,label,{fontSize:'13px',fontStyle:'bold',color:'#eaffff',stroke:'#061015',strokeThickness:4}).setOrigin(.5);
      const hit=this.add.zone(x,y,(r+20)*2,(r+20)*2).setOrigin(.5).setInteractive({useHandCursor:true});
      hit.on('pointerdown',(pointer,localX,localY,event)=>{this.stopUiEvent(event);if(!this.isMobileUI)return;this.inputState[field]=true;ring.setScale(.95);inner.setScale(.92);icon.setScale(.92)});
      const rel=(pointer,localX,localY,event)=>{this.stopUiEvent(event);this.inputState[field]=false;ring.setScale(1);inner.setScale(1);icon.setScale(1)};
      hit.on('pointerup',rel);hit.on('pointerupoutside',rel);hit.on('pointerout',rel);
      this.controlWidgets.push(shadow,ring,inner,icon,txt,hit);
      ui.add([shadow,ring,inner,icon,txt,hit]);
    };
    btn(W-116,H-112,58,'iconAttack','attack',0x4a2e27,C.bronze,'ATTACK');
    btn(W-250,H-132,42,'iconSkill','skill',0x16363c,C.cyan,'SKILL');
    btn(W-184,H-222,38,'iconDash','dash',0x16363c,C.cyan,'DASH');
    btn(W-322,H-184,38,'iconJump','jump',0x16363c,C.cyan,'JUMP');
  }
  createPcSkillDock(ui){
    this.pcSkillSlots=[];
    const slots=[
      {field:'jump',key:'iconJump',hotkey:'SPACE',name:'JUMP',x:W/2-126,r:25,ready:()=>0,bg:0x14282f,accent:C.cyan},
      {field:'dash',key:'iconDash',hotkey:'K',name:'DASH',x:W/2-42,r:27,ready:()=>this.dashReadyAt,bg:0x14282f,accent:C.cyan},
      {field:'skill',key:'iconSkill',hotkey:'L',name:'CRESCENT',x:W/2+44,r:28,ready:()=>this.skillReadyAt,bg:0x14282f,accent:C.cyan},
      {field:'attack',key:'iconAttack',hotkey:'J',name:'ATTACK',x:W/2+132,r:31,ready:()=>this.attackReadyAt,bg:0x3c2822,accent:C.bronze}
    ];
    const dockBg=this.add.rectangle(W/2,H-52,390,88,0x061015,.38).setStrokeStyle(1,C.bronze,.16);
    ui.add(dockBg);
    const dockTitle=this.add.text(W/2,H-94,'COMBAT SKILLS',{fontSize:'10px',fontStyle:'bold',color:'#8ff8f0'}).setOrigin(.5).setAlpha(.75);
    ui.add(dockTitle);
    for(const cfg of slots){
      const y=H-52;
      const shadow=this.add.circle(cfg.x+4,y+5,cfg.r+2,0x000000,.14);
      const ring=this.add.circle(cfg.x,y,cfg.r,cfg.bg,.78).setStrokeStyle(2,cfg.accent,.42);
      const inner=this.add.circle(cfg.x,y,Math.max(7,cfg.r-9),cfg.accent,.055);
      const icon=this.add.image(cfg.x,y,cfg.key).setDisplaySize(cfg.r*.95,cfg.r*.95).setAlpha(.9);
      const cd=this.add.graphics().setVisible(false);
      const cdText=this.add.text(cfg.x,y,'',{fontSize:'15px',fontStyle:'bold',color:'#ffffff',stroke:'#061015',strokeThickness:4}).setOrigin(.5).setVisible(false);
      const keyBox=this.add.text(cfg.x,y-cfg.r-13,cfg.hotkey,{fontSize:'10px',fontStyle:'bold',color:'#f8ddb0',backgroundColor:'#061015aa',padding:{x:5,y:2}}).setOrigin(.5).setAlpha(.85);
      const label=this.add.text(cfg.x,y+cfg.r+13,cfg.name,{fontSize:'9px',fontStyle:'bold',color:'#d8fffc'}).setOrigin(.5).setAlpha(.85);
      const hit=this.add.zone(cfg.x,y,(cfg.r+28)*2,(cfg.r+28)*2).setOrigin(.5).setDepth(1000);
      this.makeUiButtonHit(hit,()=>{
        this.pressVirtualAction(cfg.field);
        ring.setScale(.93);inner.setScale(.9);icon.setScale(.9);
        this.time.delayedCall(90,()=>{ring.setScale(1);inner.setScale(1);icon.setScale(1);});
      });
      const objects=[dockBg,dockTitle,shadow,ring,inner,icon,cd,cdText,keyBox,label,hit];
      this.pcSkillSlots.push({...cfg,y,cooldownOverlay:cd,cooldownText:cdText,objects});
      ui.add([shadow,ring,inner,icon,cd,cdText,keyBox,label,hit]);
    }
  }
  updateControlCooldowns(time){
    if(!this.pcSkillSlots)return;
    for(const slot of this.pcSkillSlots){
      const readyAt=slot.ready?slot.ready():0;
      const remain=Math.max(0,readyAt-time);
      if(this.isMobileUI||remain<=0){
        slot.cooldownOverlay.clear().setVisible(false);
        slot.cooldownText.setVisible(false);
        continue;
      }
      const pct=Phaser.Math.Clamp(remain/Math.max(1,(slot.field==='skill'?this.getSkillCooldown():slot.field==='dash'?this.getDashCooldown():280)),0,1);
      slot.cooldownOverlay.clear().setVisible(true);
      slot.cooldownOverlay.fillStyle(0x000000,.56).slice(slot.x,slot.y,slot.r,Phaser.Math.DegToRad(-90),Phaser.Math.DegToRad(-90+360*pct),true).fillPath();
      slot.cooldownOverlay.lineStyle(2,slot.accent,.55).strokeCircle(slot.x,slot.y,slot.r);
      slot.cooldownText.setText((remain/1000).toFixed(remain>950?0:1)).setVisible(true);
    }
  }
  updateJoy(p){const dx=p.x-130,dy=p.y-(H-118),d=Math.hypot(dx,dy)||1,m=Math.min(d,56);this.joy.knob.x=130+dx/d*m;this.joy.knob.y=H-118+dy/d*m;this.joystickX=Phaser.Math.Clamp((dx/d*m)/56,-1,1)} resetJoy(){this.joy.pointerId=null;this.joystickX=0;this.joy.knob.setPosition(130,H-118)}
  consume(field,key){const t=this.inputState[field];if(t)this.inputState[field]=false;return !!t||!!(key&&Phaser.Input.Keyboard.JustDown(key))}
  update(time){this.updateEnvironmentPolish(time);if(this.ended){if(this.keys&&Phaser.Input.Keyboard.JustDown(this.keys.restart))this.scene.restart();this.updateControlCooldowns(time);this.drawUI();return}if(this.relicChoiceOpen){this.handleRelicChoiceKeys();this.updateControlCooldowns(time);this.drawUI();return}this.updateRunSystem(time);this.handlePlayer(time);this.updatePlayerVisual(time);this.updateEnemies();this.keepActorsAboveFloor();this.updateAdventure(time);this.updateBoss(time);this.drawUI();this.updateControlCooldowns(time);const rem=Math.max(0,this.skillReadyAt-time);if(this.skillText)this.skillText.setText(rem<=0?'Skill READY':`Skill ${(rem/1000).toFixed(1)}s`)}
  handleRelicChoiceKeys(){if(!this.keys||!this.relicChoiceOpen||!this.relicChoices)return;let idx=-1;if(Phaser.Input.Keyboard.JustDown(this.keys.choice1))idx=0;else if(Phaser.Input.Keyboard.JustDown(this.keys.choice2))idx=1;else if(Phaser.Input.Keyboard.JustDown(this.keys.choice3))idx=2;if(idx>=0&&this.relicChoices[idx]){const c=this.relicChoices[idx];this.selectRelic(c.id,c.source);}}
  handlePlayer(time){const b=this.player.body,left=this.joystickX<-.25||this.keys?.left.isDown||this.keys?.left2.isDown,right=this.joystickX>.25||this.keys?.right.isDown||this.keys?.right2.isDown;if(!this.isDashing){if(left){this.player.setVelocityX(-250);this.facing=-1;this.player.setFlipX(true)}else if(right){this.player.setVelocityX(250);this.facing=1;this.player.setFlipX(false)}else this.player.setVelocityX(0)}if(this.consume('jump',this.keys?.jump)&&b.blocked.down)this.player.setVelocityY(-510);if(this.consume('dash',this.keys?.dash)&&this.canDash)this.doDash(time);if(this.consume('attack',this.keys?.attack)&&this.canAttack)this.attack(time);if(this.consume('skill',this.keys?.skill)&&time>=this.skillReadyAt)this.skill(time)}
  doDash(time){const cd=this.getDashCooldown(),speed=this.hasRelic('wind_step')?760:650;this.canDash=false;this.dashReadyAt=time+cd;this.isDashing=true;this.invincibleUntil=time+190;this.animLockUntil=time+210;this.setKaiTexture(this.kaiTex.dash);this.player.setVelocityX(this.facing*speed).setTint(C.cyan);this.createDashTrail();if(this.hasRelic('thunder_dash')){this.applyThunderDash();this.time.delayedCall(110,()=>this.applyThunderDash());this.time.delayedCall(210,()=>this.applyThunderDash());}this.time.delayedCall(190,()=>{this.isDashing=false;this.player.clearTint()});this.time.delayedCall(cd,()=>this.canDash=true)}
  attack(time){this.canAttack=false;if(time>this.comboExpire)this.attackStep=0;this.attackStep=this.attackStep%3+1;if(this.runStats)this.runStats.bestCombo=Math.max(this.runStats.bestCombo,this.attackStep);this.comboExpire=time+520;const atkCd=this.attackStep===3?285:185;this.attackReadyAt=time+atkCd;this.animLockUntil=time+(this.attackStep===3?255:175);this.setKaiTexture(this.kaiTex['attack'+this.attackStep]);let dmg=[0,12,15,25][this.attackStep];if(this.hasRelic('heavy_impact')&&this.attackStep===3)dmg+=14;const reach=this.attackStep===3?96:74;this.fxSlash(this.player.x+this.facing*52,this.player.y-5,this.attackStep===3?1.22:0.96);for(const e of this.enemies){const yGap=e.type==='elite'?18:10;const behind=e.type==='elite'?34:18;if(e.active&&this.canMeleeHit(e.sprite,reach+(e.type==='elite'?38:20),yGap,behind)){this.hitEnemy(e,dmg);if(this.hasRelic('fire_blade')&&Math.random()<0.28)this.applyBurn(e);if(this.hasRelic('heavy_impact')&&this.attackStep===3)this.bindEnemy(e,560);}}if(this.bossActive&&this.boss.active&&this.canMeleeHit(this.boss,reach+98,30,58)){this.hitBoss(dmg);if(this.hasRelic('fire_blade')&&Math.random()<0.28)this.applyBossBurn();if(this.hasRelic('heavy_impact')&&this.attackStep===3)this.bossSlowUntil=this.time.now+560;}this.time.delayedCall(atkCd,()=>this.canAttack=true)}
  skill(time){const cd=this.getSkillCooldown();this.skillReadyAt=time+cd;this.animLockUntil=time+360;this.setKaiTexture(this.kaiTex.skill);this.createSkillBurst(this.player.x+this.facing*50,this.player.y);const surge=this.hasRelic('relic_surge'),root=this.hasRelic('root_prison');const wave=this.physics.add.sprite(this.player.x+this.facing*55,this.player.y-6,this.textures.exists('vfxSlashCrescent')?'vfxSlashCrescent':'slash').setScale(surge?1.75:1.4,surge?2.95:2.5).setTint(root?0x6fff9a:0x8effff);wave.body.setAllowGravity(false);wave.setVelocityX(this.facing*(surge?820:720));const ev=this.time.addEvent({delay:35,repeat:22,callback:()=>{if(!wave.active)return;for(const e of this.enemies){if(e.active&&Phaser.Math.Distance.Between(wave.x,wave.y,e.sprite.x,e.sprite.y)<(surge?92:75)){this.hitEnemy(e,surge?48:34);if(root)this.bindEnemy(e,1800);wave.destroy();return}}if(this.bossActive&&this.boss.active&&Phaser.Math.Distance.Between(wave.x,wave.y,this.boss.x,this.boss.y)<(surge?130:110)){this.hitBoss(surge?48:34);if(root){this.bossSlowUntil=this.time.now+1800;this.createRootFx(this.boss.x,this.boss.y+42);}wave.destroy()}}});this.time.delayedCall(1050,()=>{ev.remove();if(wave.active)wave.destroy()})}
  fxSlash(x,y,s=1){const key=this.textures.exists('vfxSlashCrescent')?'vfxSlashCrescent':'slash';const q=this.add.sprite(x,y,key).setDepth(15).setScale(this.facing>0?s*0.72:-s*0.72,s*0.72).setAlpha(.9);if(key==='slash')q.setScale(s,1.5*s).setTint(C.cyan);const arc=this.add.graphics({x,y}).setDepth(16);arc.lineStyle(5*s,0x8effff,.65);arc.beginPath();arc.arc(0,0,60*s,this.facing>0?-0.8:Math.PI-0.8,this.facing>0?0.8:Math.PI+0.8,false);arc.strokePath();arc.lineStyle(2*s,0xffffff,.85);arc.beginPath();arc.arc(0,0,73*s,this.facing>0?-0.55:Math.PI-0.55,this.facing>0?0.55:Math.PI+0.55,false);arc.strokePath();this.tweens.add({targets:q,alpha:0,scaleX:q.scaleX*1.22,scaleY:q.scaleY*1.22,duration:155,onComplete:()=>q.destroy()});this.tweens.add({targets:arc,alpha:0,scale:1.35,duration:190,onComplete:()=>arc.destroy()})}
  hitEnemy(e,dmg){if(!e.active)return;const dealt=Math.min(dmg,e.hp);e.hp-=dmg;if(this.runStats)this.runStats.damageDealt+=dealt;this.setEnemyTexture(e,'hurt');e.sprite.setTint(0xffffff);this.cameras.main.shake(45,.0025);this.createImpactSpark(e.sprite.x,e.sprite.y-18,e.type==='elite'?C.gold:C.cyan);this.time.delayedCall(90,()=>{if(e.active){e.sprite.clearTint();this.setEnemyTexture(e,'idle');}});if(e.hp<=0){e.active=false;this.recordKill(e.type);e.sprite.body.enable=false;this.setEnemyTexture(e,'death');e.sprite.clearTint();this.tweens.add({targets:e.sprite,alpha:0,y:e.sprite.y-16,scale:e.type==='elite'?0.92:0.88,duration:360,onComplete:()=>e.sprite.disableBody(true,true)});const reward=e.type==='elite'?30:10;this.addCoins(reward);this.spawnCoinText(e.sprite.x,e.sprite.y,reward);this.createDeathBurst(e.sprite.x,e.sprite.y-14,e.type==='elite'?C.gold:C.cyan);if(this.hasRelic('blood_pact'))this.healPlayer(e.type==='elite'?16:7);this.tryGrantAreaReward(e.areaId);if(e.type==='elite'){this.flash('ELITE DEFEATED • RELIC FOUND',900);if(!this.eliteRelicDropped){this.eliteRelicDropped=true;this.time.delayedCall(420,()=>this.showRelicChoices('elite'));}}}}
  updatePlayerVisual(time){
    if(this.ended){this.setKaiTexture(this.kaiTex.death);return}
    this.player.setFlipX(this.facing<0);
    if(time<this.animLockUntil||time<this.hurtUntil)return;
    const b=this.player.body;
    let tex=this.kaiTex.idle;
    if(!b.blocked.down) tex=b.velocity.y<0?this.kaiTex.jump:this.kaiTex.fall;
    else if(Math.abs(b.velocity.x)>35){
      const frames=this.kaiTex.runFrames||[this.kaiTex.run];
      tex=frames[Math.floor(time/100)%frames.length];
    } else tex=(Math.floor(time/520)%2===0)?this.kaiTex.idle:this.kaiTex.idle2;
    this.setKaiTexture(tex);
  }
  createDashTrail(){
    if(this.textures.exists('vfxDashTrail')){
      const tr=this.add.image(this.player.x-this.facing*54,this.player.y+2,'vfxDashTrail').setDepth(13).setAlpha(0.58).setScale(this.facing>0?0.68:-0.68,0.68);
      this.tweens.add({targets:tr,alpha:0,x:tr.x-this.facing*92,scaleX:tr.scaleX*1.35,duration:260,onComplete:()=>tr.destroy()});
    }
    for(let i=0;i<3;i++){
      const ghost=this.add.image(this.player.x-this.facing*(18+i*18),this.player.y,(this.kaiTex.runFrames||[this.kaiTex.run])[i%((this.kaiTex.runFrames||[this.kaiTex.run]).length)]).setAlpha(0.22-i*0.045).setTint(C.cyan).setFlipX(this.facing<0).setDepth(this.player.depth-1);
      this.tweens.add({targets:ghost,alpha:0,x:ghost.x-this.facing*34,duration:220+i*40,onComplete:()=>ghost.destroy()});
    }
  }
  createSkillBurst(x,y){
    const burst=this.add.graphics({x,y}).setDepth(12);
    burst.lineStyle(4,C.cyan,0.9);burst.strokeCircle(0,0,24);burst.lineStyle(2,0xeaffff,0.8);burst.strokeCircle(0,0,38);
    this.tweens.add({targets:burst,scale:1.7,alpha:0,duration:360,onComplete:()=>burst.destroy()});
  }
  updateEnemies(){for(const e of this.enemies){if(!e.active)continue;if(this.boundUntil[e.id]&&this.time.now<this.boundUntil[e.id]){e.sprite.setVelocityX(0);this.setEnemyTexture(e,'idle');continue;}const d=this.player.x-e.sprite.x;if(Math.abs(d)<390){e.sprite.setVelocityX(Math.sign(d)*e.speed);e.sprite.setFlipX(d<0);this.setEnemyTexture(e,e.type==='elite'&&Math.abs(d)<95?'attack':'move');}else{e.sprite.setVelocityX(0);this.setEnemyTexture(e,'idle');}}}
  keepActorsAboveFloor(){for(const e of this.enemies){if(!e.active)continue;if(e.sprite.y>e.floorY+4){e.sprite.setY(e.floorY);e.sprite.setVelocityY(0)}}if(this.boss&&this.boss.active&&this.boss.y>FLOOR_TOP-76){this.boss.setY(FLOOR_TOP-76);this.boss.setVelocityY(0)}}
  spawnCoinText(x,y,n){const t=this.add.text(x,y-40,`+${n} COIN`,{fontSize:'18px',fontStyle:'bold',color:'#ffd56a'}).setOrigin(.5);this.tweens.add({targets:t,y:y-85,alpha:0,duration:700,onComplete:()=>t.destroy()})}

  updateAdventure(){
    if(this.player.x>1700&&this.checkpointX<1700){this.checkpointX=1760;this.playerHP=Math.min(100,this.playerHP+22);this.flash('CHECKPOINT ACTIVATED • HP RESTORED',950)}
    if(this.player.x>3650&&this.checkpointX<3650&&this.rootGateOpened){this.checkpointX=3700;this.playerHP=Math.min(100,this.playerHP+16);this.flash('ROOT GATE CHECKPOINT • HP RESTORED',950)}
    if(!this.chestOpened&&this.player.x>2500&&this.player.x<2700&&this.miniBoss&&!this.miniBoss.active){
      this.chestOpened=true;this.addCoins(34);this.healPlayer(8);this.chest.setTint(0xffe08a);this.flash('TREASURE CHEST • +34 COIN • +8 HP',950);
      this.time.delayedCall(420,()=>{if(!this.relicChoiceOpen&&!this.ended)this.showRelicChoices('chest');});
    }
    if(!this.rootGateOpened&&this.player.x>3550&&this.player.x<3720&&this.time.now>(this.nextGateReminder||0)){
      this.nextGateReminder=this.time.now+2200;
      this.tryOpenRootGate();
    }
    if(!this.bossActive&&this.rootGateOpened&&this.player.x>4400){this.startBoss()}
    if(this.portalUnlocked&&this.player.x>5020){this.finishRun(true)}
  }

  startBoss(){this.bossActive=true;this.boss.setVisible(true).setActive(true);this.boss.body.enable=true;this.setBossTexture('idle');this.bossLabel.setVisible(true);this.bossBar.setVisible(true);this.bossNextAttack=this.time.now+1200;this.objective.setText('OBJECTIVE: Defeat the Forest Guardian');this.flash('BOSS ENCOUNTER',900)}
  updateBoss(time){if(!this.bossActive||!this.boss.active||this.bossBusy)return;if(this.bossHP<=this.bossMaxHP*0.45&&this.bossPhase===1){this.bossPhase=2;this.setBossTexture('rage');this.boss.setTint(0xff7777);this.createDeathBurst(this.boss.x,this.boss.y-40,C.red);this.flash('PHASE 2 • RAGE',1000)}if(time<this.bossNextAttack)return;const c=Phaser.Math.Between(0,2);c===0?this.bossCharge():c===1?this.bossSlam():this.bossRoots();const slowed=time<this.bossSlowUntil;this.bossNextAttack=time+(this.bossPhase===1?(slowed?2950:2200):(slowed?2200:1580))}
  bossCharge(){this.bossBusy=true;this.setBossTexture('charge');const dir=Math.sign(this.player.x-this.boss.x)||-1,w=this.createBossWarning(this.boss.x+dir*220,625,420,54,'charge');this.time.delayedCall(540,()=>{w.destroy();this.boss.setVelocityX(dir*(this.bossPhase===1?450:585));this.time.delayedCall(450,()=>{this.boss.setVelocityX(0);this.setBossTexture(this.bossPhase===2?'rage':'idle');this.bossBusy=false})})}
  bossSlam(){this.bossBusy=true;this.setBossTexture('slam');const z=this.add.circle(this.boss.x,640,150,C.warning,.18).setDepth(17);this.tweens.add({targets:z,scale:1.18,alpha:.55,duration:500});this.time.delayedCall(600,()=>{this.cameras.main.shake(180,.008);this.createGroundCrack(this.boss.x,646);if(Phaser.Math.Distance.Between(this.player.x,this.player.y,this.boss.x,this.boss.y)<180)this.takeDamage(this.bossPhase===1?15:20);z.destroy();this.time.delayedCall(350,()=>{this.setBossTexture(this.bossPhase===2?'rage':'idle');this.bossBusy=false})})}
  bossRoots(){this.bossBusy=true;this.setBossTexture('root');const x=Phaser.Math.Clamp(this.player.x+Phaser.Math.Between(-80,80),3550,4230),w=this.createBossWarning(x,630,130,36,'root');this.time.delayedCall(650,()=>{w.destroy();this.createRootFx(x,610);const r=this.add.rectangle(x,575,46,130,0x6f8f45,0.42).setOrigin(.5,1).setDepth(16);if(Math.abs(this.player.x-x)<65)this.takeDamage(this.bossPhase===1?16:22);this.time.delayedCall(500,()=>r.destroy());this.time.delayedCall(680,()=>{this.setBossTexture(this.bossPhase===2?'rage':'idle');this.bossBusy=false})})}
  hitBoss(dmg){const dealt=Math.min(dmg,this.bossHP);this.bossHP=Math.max(0,this.bossHP-dmg);if(this.runStats)this.runStats.damageDealt+=dealt;this.boss.setTint(0xffffff);this.cameras.main.shake(55,.003);this.createImpactSpark(this.boss.x,this.boss.y-22,this.bossPhase===2?C.red:C.cyan);this.time.delayedCall(80,()=>{if(this.boss.active){this.bossPhase===2?this.boss.setTint(0xff7777):this.boss.clearTint();if(!this.bossBusy)this.setBossTexture(this.bossPhase===2?'rage':'idle');}});if(this.bossHP<=0){if(this.runStats)this.runStats.bossDefeated=true;this.setBossTexture('death');this.boss.body.enable=false;this.createDeathBurst(this.boss.x,this.boss.y-40,C.red);this.tweens.add({targets:this.boss,alpha:0,scale:0.92,duration:520,onComplete:()=>this.boss.disableBody(true,true)});if(this.hasRelic('blood_pact'))this.healPlayer(30);if(!this.bossRelicDropped){this.bossRelicDropped=true;this.flash('BOSS DEFEATED • ANCIENT RELIC UNLOCKED',1100);this.time.delayedCall(550,()=>this.showRelicChoices('boss'));}else this.openPortalAfterRelic();}}
  contactDamage(enemy,dmg){if(this.time.now<this.invincibleUntil)return;this.takeDamage(dmg);this.player.setVelocityX(Math.sign(this.player.x-enemy.x)*260);this.player.setVelocityY(-180)}
  takeDamage(dmg){if(this.time.now<this.invincibleUntil||this.ended)return;if(this.hasRelic('guardian_shell'))dmg=Math.ceil(dmg*0.78);if(this.runStats)this.runStats.damageTaken+=dmg;this.playerHP=Math.max(0,this.playerHP-dmg);this.invincibleUntil=this.time.now+700;this.hurtUntil=this.time.now+350;this.setKaiTexture(this.kaiTex.hurt);this.player.setTint(0xff7777);this.cameras.main.shake(100,.006);this.showDamageText(this.player.x,this.player.y-54,dmg,0xff6b6b,'-');this.time.delayedCall(150,()=>this.player.clearTint());if(this.playerHP<=0){this.setKaiTexture(this.kaiTex.death);this.flash('KAI FALLEN • RUN FAILED',900);this.time.delayedCall(450,()=>this.finishRun(false));}}
  drawUI(){this.hpBar.clear().fillStyle(0x183434,.95).fillRoundedRect(118,40,218,18,8).fillStyle(C.green,1).fillRoundedRect(118,40,218*(this.playerHP/100),18,8);this.coinText.setText(`COIN ${this.coins}`);this.bossBar.clear().fillStyle(0x26161a,.95).fillRoundedRect(W/2-280,50,560,16,8).fillStyle(C.red,1).fillRoundedRect(W/2-280,50,560*(this.bossHP/this.bossMaxHP),16,8);this.updateRelicHud();this.updatePuzzleHud&&this.updatePuzzleHud()}
  hasRelic(id){return this.relics.includes(id)}
  getDashCooldown(){return this.hasRelic('wind_step')?520:720}
  getSkillCooldown(){return this.hasRelic('relic_surge')?3400:4700}
  healPlayer(amount){const before=this.playerHP;this.playerHP=Math.min(100,this.playerHP+amount);if(this.playerHP>before)this.showDamageText(this.player.x,this.player.y-70,this.playerHP-before,0x6fcf97,'+')}
  showDamageText(x,y,n,color=0xffffff,prefix=''){const t=this.add.text(x,y,`${prefix}${n}`,{fontSize:'18px',fontStyle:'bold',color:'#'+color.toString(16).padStart(6,'0'),stroke:'#061015',strokeThickness:4}).setOrigin(.5).setDepth(80);this.tweens.add({targets:t,y:y-36,alpha:0,duration:650,onComplete:()=>t.destroy()})}
  applyBurn(e){if(!e||!e.active)return;this.burnTimers[e.id]=(this.burnTimers[e.id]||0)+1;e.sprite.setTint(0xff8b44);this.createBurnFx(e.sprite.x,e.sprite.y);let ticks=0;const ev=this.time.addEvent({delay:650,repeat:3,callback:()=>{if(!e.active){ev.remove();return}ticks++;this.hitEnemy(e,5);this.createBurnFx(e.sprite.x,e.sprite.y);if(ticks>=4)ev.remove();}})}
  applyBossBurn(){if(!this.boss.active)return;this.createBurnFx(this.boss.x,this.boss.y);let ticks=0;const ev=this.time.addEvent({delay:650,repeat:3,callback:()=>{if(!this.boss.active){ev.remove();return}ticks++;this.hitBoss(5);this.createBurnFx(this.boss.x,this.boss.y);if(ticks>=4)ev.remove();}})}
  bindEnemy(e,ms){if(!e||!e.active)return;this.boundUntil[e.id]=this.time.now+ms;e.sprite.setVelocityX(0);e.sprite.setTint(0x8dff9c);this.createRootFx(e.sprite.x,e.sprite.y+18);this.time.delayedCall(ms,()=>{if(e.active)e.sprite.clearTint()})}
  applyThunderDash(){for(const e of this.enemies){if(e.active&&Phaser.Math.Distance.Between(this.player.x,this.player.y,e.sprite.x,e.sprite.y)<92){this.hitEnemy(e,22);this.createLightningFx(e.sprite.x,e.sprite.y);}}if(this.bossActive&&this.boss.active&&Phaser.Math.Distance.Between(this.player.x,this.player.y,this.boss.x,this.boss.y)<130){this.hitBoss(18);this.createLightningFx(this.boss.x,this.boss.y);}}
  createBurnFx(x,y){const fx=this.add.circle(x,y-18,20,0xff7138,0.22).setDepth(14);const ember=this.add.circle(x+Phaser.Math.Between(-8,8),y-34,5,0xffc65c,0.75).setDepth(15);this.tweens.add({targets:fx,scale:1.9,alpha:0,duration:420,onComplete:()=>fx.destroy()});this.tweens.add({targets:ember,y:ember.y-36,alpha:0,duration:520,onComplete:()=>ember.destroy()})}
  createLightningFx(x,y){const g=this.add.graphics({x,y}).setDepth(18);g.lineStyle(5,0x66e8ff,0.95);g.beginPath();g.moveTo(-34,-42);g.lineTo(2,-10);g.lineTo(-10,-2);g.lineTo(30,42);g.strokePath();g.lineStyle(2,0xffffff,0.8);g.beginPath();g.moveTo(-20,-34);g.lineTo(10,-2);g.lineTo(0,4);g.lineTo(24,35);g.strokePath();this.tweens.add({targets:g,alpha:0,scale:1.38,duration:330,onComplete:()=>g.destroy()})}
  createRootFx(x,y){if(this.textures.exists('vfxRootVine')){const v=this.add.image(x,y-18,'vfxRootVine').setDepth(15).setAlpha(0.9).setScale(0.82);this.tweens.add({targets:v,alpha:0,y:v.y-18,scale:1.08,duration:760,onComplete:()=>v.destroy()});return;}const g=this.add.graphics({x,y}).setDepth(13);g.lineStyle(5,0x7cf082,0.8);for(let i=-2;i<=2;i++){g.beginPath();g.moveTo(i*12,30);g.lineTo(i*8,-22);g.lineTo(i*18,-40);g.strokePath();}this.tweens.add({targets:g,alpha:0,y:y-12,duration:720,onComplete:()=>g.destroy()})}
  createImpactSpark(x,y,color=C.cyan){
    if(this.textures.exists('vfxHitSpark')){
      const sp=this.add.image(x,y,'vfxHitSpark').setDepth(20).setAlpha(0.9).setScale(0.55).setTint(color);
      this.tweens.add({targets:sp,scale:1.05,alpha:0,angle:Phaser.Math.Between(-28,28),duration:290,onComplete:()=>sp.destroy()});
      return;
    }
    const g=this.add.graphics({x,y}).setDepth(18);
    g.lineStyle(3,color,0.92);
    for(let i=0;i<8;i++){const a=(Math.PI*2/8)*i;g.beginPath();g.moveTo(Math.cos(a)*8,Math.sin(a)*8);g.lineTo(Math.cos(a)*Phaser.Math.Between(22,42),Math.sin(a)*Phaser.Math.Between(22,42));g.strokePath();}
    g.fillStyle(0xffffff,0.75).fillCircle(0,0,8);
    this.tweens.add({targets:g,scale:1.3,alpha:0,duration:260,onComplete:()=>g.destroy()});
  }
  createDeathBurst(x,y,color=C.cyan){for(let i=0;i<10;i++){const p=this.add.circle(x,y,Phaser.Math.Between(2,5),color,0.75).setDepth(60);this.tweens.add({targets:p,x:x+Phaser.Math.Between(-52,52),y:y+Phaser.Math.Between(-46,20),alpha:0,scale:0.25,duration:420+Phaser.Math.Between(0,220),onComplete:()=>p.destroy()});}}
  createRelicAcquireFx(color=C.cyan){
    const x=W/2,y=H/2;
    if(this.textures.exists('vfxRelicAcquireRing')){
      const ring=this.add.image(x,y,'vfxRelicAcquireRing').setScrollFactor(0).setDepth(340).setAlpha(0.95).setTint(color).setScale(0.56);
      this.tweens.add({targets:ring,scale:1.12,alpha:0,angle:25,duration:650,onComplete:()=>ring.destroy()});
    }
    const g=this.add.graphics({x,y}).setScrollFactor(0).setDepth(341);
    g.lineStyle(5,color,0.9).strokeCircle(0,0,42);
    g.lineStyle(2,0xffffff,0.8).strokeCircle(0,0,68);
    for(let i=0;i<16;i++){const a=(Math.PI*2/16)*i;g.lineStyle(2,color,0.65);g.beginPath();g.moveTo(Math.cos(a)*76,Math.sin(a)*76);g.lineTo(Math.cos(a)*112,Math.sin(a)*112);g.strokePath();}
    this.tweens.add({targets:g,scale:1.55,alpha:0,duration:560,onComplete:()=>g.destroy()});
  }
  chooseRelicPool(source){const owned=new Set(this.relics);let pool=RELICS.filter(r=>!owned.has(r.id));if(source==='boss'){pool=pool.sort((a,b)=>(a.id==='root_prison'?-1:b.id==='root_prison'?1:0));}
    const shuffled=pool.sort(()=>Math.random()-0.5);return shuffled.slice(0,Math.min(3,shuffled.length));}
  showRelicChoices(source='elite'){
    if(this.relicChoiceOpen)return;
    const choices=this.chooseRelicPool(source);
    if(!choices.length){if(source==='boss')this.openPortalAfterRelic();return;}
    this.relicChoiceOpen=true;
    this.relicChoices=choices.map(r=>({id:r.id,source}));
    this.physics.world.pause();
    const layer=this.add.container(0,0).setScrollFactor(0).setDepth(300);
    this.relicLayer=layer;
    layer.add(this.add.rectangle(W/2,H/2,W,H,0x02080a,0.78));
    layer.add(this.add.text(W/2,102,source==='boss'?'ANCIENT BOSS RELIC UNLOCKED':'CHOOSE YOUR RELIC',{fontSize:'31px',fontStyle:'bold',color:'#ffe6ad',stroke:'#061015',strokeThickness:5}).setOrigin(.5));
    layer.add(this.add.text(W/2,140,'Click/tap vào card hoặc nhấn 1 / 2 / 3 để chọn Relic',{fontSize:'15px',color:'#c8fffb'}).setOrigin(.5));
    const startX=W/2-315;
    choices.forEach((r,i)=>{
      const x=startX+i*315,y=345;
      const card=this.add.container(x,y).setSize(270,290);
      const bg=this.add.rectangle(0,0,270,290,0x07171b,0.96).setStrokeStyle(3,r.color,0.72);
      const key=this.add.text(-112,-122,`${i+1}`,{fontSize:'18px',fontStyle:'bold',color:'#07171b',backgroundColor:'#f4c76b',padding:{x:8,y:4}}).setOrigin(.5);
      const icon=this.add.image(0,-85,'relic_'+r.id).setDisplaySize(82,82);
      const title=this.add.text(0,-20,`${r.icon} ${r.name}`,{fontSize:'20px',fontStyle:'bold',color:'#ffffff',align:'center'}).setOrigin(.5);
      const type=this.add.text(0,14,r.type,{fontSize:'12px',fontStyle:'bold',color:'#'+r.color.toString(16).padStart(6,'0')}).setOrigin(.5);
      const desc=this.add.text(0,62,r.desc,{fontSize:'14px',color:'#d8fffc',align:'center',wordWrap:{width:220}}).setOrigin(.5);
      const pick=this.add.text(0,118,'CHỌN RELIC',{fontSize:'13px',fontStyle:'bold',color:'#07171b',backgroundColor:'#f4c76b',padding:{x:18,y:8}}).setOrigin(.5);
      const hit=this.add.zone(0,0,310,330).setOrigin(.5).setDepth(999).setInteractive({useHandCursor:true});
      card.setInteractive(new Phaser.Geom.Rectangle(-143,-153,286,306), Phaser.Geom.Rectangle.Contains);
      const hoverOn=()=>{card.setScale(1.04);bg.setFillStyle(0x0b2d31,0.98);bg.setStrokeStyle(4,r.color,0.95)};
      const hoverOff=()=>{card.setScale(1);bg.setFillStyle(0x07171b,0.96);bg.setStrokeStyle(3,r.color,0.72)};
      let picked=false;
      const choose=(pointer,localX,localY,event)=>{this.stopUiEvent(event);if(picked||!this.relicChoiceOpen)return;picked=true;this.selectRelic(r.id,source);};
      [card,bg,pick,hit].forEach(o=>{o.on('pointerover',hoverOn);o.on('pointerout',hoverOff);o.on('pointerdown',choose);});
      card.add([bg,key,icon,title,type,desc,pick,hit]);
      layer.add(card);
    });
  }
  selectRelic(id,source){if(!this.relicChoiceOpen||this.relics.includes(id))return;this.relics.push(id);if(this.runStats)this.runStats.relicsCollected=this.relics.length;const r=RELIC_BY_ID[id];this.flash(`${r.name.toUpperCase()} ACQUIRED`,900);this.createRelicAcquireFx(r.color);if(this.relicLayer){this.relicLayer.destroy();this.relicLayer=null;}this.relicChoices=[];this.relicChoiceOpen=false;this.physics.world.resume();this.updateRelicHud(true);if(source==='boss')this.openPortalAfterRelic();}
  openPortalAfterRelic(){this.portalUnlocked=true;this.portal.setVisible(true);this.objective.setText('OBJECTIVE: Enter the Exit Portal');this.flash('VICTORY • EXIT PORTAL OPENED',1300)}
  updateRelicHud(force=false){if(!this.relicHud)return;if(!force&&this._lastRelicCount===this.relics.length)return;this._lastRelicCount=this.relics.length;this.relicHud.removeAll(true);this.relicHud.add(this.add.rectangle(0,0,390,70,0x061015,0.46).setOrigin(0));this.relicHud.add(this.add.text(12,8,'RELIC BUILD',{fontSize:'12px',fontStyle:'bold',color:'#8ff8f0'}));if(!this.relics.length){this.relicHud.add(this.add.text(12,31,'Chưa có Relic • Hạ Elite để chọn sức mạnh đầu tiên',{fontSize:'12px',color:'#b7d4d2'}));return;}this.relics.slice(0,5).forEach((id,i)=>{const r=RELIC_BY_ID[id];this.relicHud.add(this.add.image(24+i*66,43,'relic_'+id).setDisplaySize(36,36));this.relicHud.add(this.add.text(43+i*66,54,r.icon,{fontSize:'14px'}).setOrigin(.5));});if(this.relics.length>5)this.relicHud.add(this.add.text(346,32,`+${this.relics.length-5}`,{fontSize:'16px',fontStyle:'bold',color:'#f4c76b'}));}
  flash(text,duration){this.status.setText(text).setVisible(true).setAlpha(1);if(duration<999999)this.tweens.add({targets:this.status,alpha:0,delay:duration,duration:280,onComplete:()=>this.status.setVisible(false)})}
}

const rotate=document.createElement('div');rotate.id='rotate-hint';rotate.innerHTML='📱 Xoay điện thoại sang <b>ngang</b> để chơi RELIC HUNTER';document.body.appendChild(rotate);
new Phaser.Game({type:Phaser.AUTO,parent:'app',width:W,height:H,backgroundColor:'#07171b',physics:{default:'arcade',arcade:{gravity:{x:0,y:1100},debug:false}},scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH,width:W,height:H},render:{antialias:true,pixelArt:false,roundPixels:true},scene:[AdventureScene]});
