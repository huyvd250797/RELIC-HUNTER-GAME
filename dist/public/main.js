const W = 1280, H = 720, WORLD_W = 4300, FLOOR_TOP = 620;
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

class AdventureScene extends Phaser.Scene{
  inputState={jump:false,attack:false,dash:false,skill:false}; joystickX=0; facing=1; canDash=true; dashReadyAt=0; isDashing=false; invincibleUntil=0; canAttack=true; attackReadyAt=0; attackStep=0; comboExpire=0; skillReadyAt=0; playerHP=100; ended=false; isMobileUI=false; controlWidgets=[]; pcSkillSlots=[]; mobileSkillSlots=[]; relics=[]; relicChoiceOpen=false; relicRewardQueue=[]; eliteRelicDropped=false; bossRelicDropped=false; relicHudItems=[]; burnTimers={}; boundUntil={}; bossSlowUntil=0;
  coins=0; checkpointX=120; chestOpened=false; portalUnlocked=false; bossActive=false; bossHP=900; bossPhase=1; bossBusy=false; bossNextAttack=0;
  enemies=[]; enemyId=0; miniBoss=null;
  constructor(){super('adventure')}
  preload() {
    this.load.image('kaiConcept', './public/assets/reference/kai-concept.png');
    this.load.json('assetManifest', './public/assets/asset-manifest.json');

    // Official asset slots.
    // Các file này có thể chưa tồn tại ở V0.4.2; fallback sẽ tự dùng runtime textures.
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
      kaiDeath: './public/assets/characters/kai/kai-death.png'
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
    this.createTextures(); this.setupOfficialKaiSprites(); this.createWorld(); this.createAmbientPolish(); this.createPlayer(); this.createEnemies(); this.createBoss(); this.createUI(); this.setupInput();
    this.cameras.main.startFollow(this.player,true,0.08,0.08); this.cameras.main.setBounds(0,0,WORLD_W,H); this.cameras.main.setDeadzone(240,110);
    this.physics.add.collider(this.player,this.ground);
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

    // Official-style small HUD portrait for V0.4.2.
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

  setKaiTexture(key){
    if(!this.player) return;
    if(key && key!==this.lastTexture){
      this.player.setTexture(key);
      this.lastTexture=key;
    }
  }

  createWorld(){
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
    for(let i=0;i<46;i++){
      const x=Phaser.Math.Between(80,WORLD_W-80), y=Phaser.Math.Between(505,650);
      this.add.triangle(x,y,x-8,y+18,x+10,y+18,i%2?0x214d40:0x193a34,0.8);
      if(i%5===0) this.add.circle(x+8,y+8,3,C.cyan,0.22);
    }
    this.add.text(70,105,'WHISPERING FOREST',{fontSize:'22px',fontStyle:'bold',color:'#8ff8f0'});
    this.add.text(70,133,'KAI Official Sprite Integration • Visual Foundation',{fontSize:'13px',color:'#8aa9a7'});
    this.checkpoint=this.add.container(1760,590);this.checkpoint.add(this.add.rectangle(0,0,18,95,C.cyan2,0.7));this.checkpoint.add(this.add.circle(0,-52,18,C.cyan,0.8));this.checkpoint.add(this.add.text(0,36,'CHECKPOINT',{fontSize:'12px',color:'#9ff'}).setOrigin(0.5));
    this.tweens.add({targets:this.checkpoint.list[1],scale:1.2,alpha:0.55,yoyo:true,repeat:-1,duration:850});
    this.chest=this.physics.add.staticSprite(2600,FLOOR_TOP-36,'chest');
    this.portal=this.add.container(4100,FLOOR_TOP-86).setVisible(false); const ring=this.add.circle(0,0,62,C.cyan,0.13).setStrokeStyle(7,C.cyan,0.8); const core=this.add.circle(0,0,32,C.cyan2,0.45); this.portal.add([ring,core,this.add.text(0,88,'EXIT PORTAL',{fontSize:'14px',color:'#bff'}).setOrigin(0.5)]); this.tweens.add({targets:core,scale:1.2,alpha:0.75,yoyo:true,repeat:-1,duration:700});
    this.physics.add.overlap(this.player??this.add.zone(-999,-999,1,1),this.chest,()=>{});
  }
  createAmbientPolish(){
    // V0.4.2 KAI Official Sprite Integration: lightweight runtime atmosphere.
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
  createPlayer(){this.player=this.physics.add.sprite(120,FLOOR_TOP-38,this.kaiTex.idle).setCollideWorldBounds(true).setDragX(1600).setMaxVelocity(520,900);this.player.body.setSize(38,68).setOffset(29,18);this.animLockUntil=0;this.hurtUntil=0;this.lastTexture=this.kaiTex.idle}
  spawnEnemy(x,type='slime'){const elite=type==='elite';const y=elite?FLOOR_TOP-40:FLOOR_TOP-21;const s=this.physics.add.sprite(x,y,elite?'elite':'slime').setCollideWorldBounds(true).setDragX(900).setBounce(0.02);s.body.setSize(elite?70:54,elite?70:34).setOffset(elite?13:7,elite?18:14);const e={id:++this.enemyId,sprite:s,type,hp:elite?170:65,maxHp:elite?170:65,damage:elite?12:7,speed:elite?85:65,active:true,floorY:y};this.enemies.push(e);return e}
  createEnemies(){[650,1040,1280,2050,2300,3150].forEach(x=>this.spawnEnemy(x));this.miniBoss=this.spawnEnemy(2850,'elite')}
  createBoss(){this.boss=this.physics.add.sprite(3820,FLOOR_TOP-62,'boss').setVisible(false).setActive(false).setCollideWorldBounds(true);this.boss.body.setSize(96,104).setOffset(20,18);this.boss.body.enable=false}
  setupInput(){if(this.input.keyboard)this.keys={left:this.input.keyboard.addKey('A'),right:this.input.keyboard.addKey('D'),left2:this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT),right2:this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT),jump:this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),attack:this.input.keyboard.addKey('J'),dash:this.input.keyboard.addKey('K'),skill:this.input.keyboard.addKey('L'),restart:this.input.keyboard.addKey('R'),choice1:this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE),choice2:this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO),choice3:this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.THREE)};}
  createUI(){
    this.isMobileUI = this.detectMobileUI();
    const ui=this.add.container(0,0).setScrollFactor(0).setDepth(100);
    ui.add(this.add.rectangle(18,18,350,62,0x061015,0.82).setOrigin(0));
    ui.add(this.add.image(47,49,'kaiPortrait').setDisplaySize(48,48));
    ui.add(this.add.text(82,27,'KAI',{fontSize:'16px',fontStyle:'bold',color:'#d8fffc'}));
    this.hpBar=this.add.graphics();ui.add(this.hpBar);
    this.objective=this.add.text(28,94,'OBJECTIVE: Reach the Forest Guardian',{fontSize:'16px',color:'#d8fffc',backgroundColor:'#061015aa',padding:{x:12,y:8}});ui.add(this.objective);
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
    const start=p=>{if(!this.isMobileUI||p.x>W*.45)return;this.joy.pointerId=p.id;this.updateJoy(p);base.setScale(1.04);knob.setScale(1.06)};
    zone.on('pointerdown',start);
    this.input.on('pointerdown',p=>{if(!this.isMobileUI)return;if(this.joy.pointerId===null&&p.x<W*.45&&p.y>H*.46)start(p)});
    this.input.on('pointermove',p=>{if(this.isMobileUI&&this.joy.pointerId===p.id)this.updateJoy(p)});
    const stop=p=>{if(this.joy.pointerId===p.id){this.resetJoy();base.setScale(1);knob.setScale(1)}};
    this.input.on('pointerup',stop);this.input.on('pointerupoutside',stop);
    ui.add([base,halo,knob,zone]);
    const btn=(x,y,r,key,field,bg,accent,label)=>{
      const shadow=this.add.circle(x+6,y+7,r+2,0x000000,.24);
      const ring=this.add.circle(x,y,r,bg,.9).setStrokeStyle(3,accent,.55).setInteractive();
      const inner=this.add.circle(x,y,r-10,accent,.08);
      const icon=this.add.image(x,y,key).setDisplaySize(r*1.08,r*1.08);
      const txt=this.add.text(x,y+r+13,label,{fontSize:'13px',fontStyle:'bold',color:'#eaffff',stroke:'#061015',strokeThickness:4}).setOrigin(.5);
      ring.on('pointerdown',()=>{if(!this.isMobileUI)return;this.inputState[field]=true;ring.setScale(.95);inner.setScale(.92);icon.setScale(.92)});
      const rel=()=>{this.inputState[field]=false;ring.setScale(1);inner.setScale(1);icon.setScale(1)};
      ring.on('pointerup',rel);ring.on('pointerout',rel);
      this.controlWidgets.push(shadow,ring,inner,icon,txt);
      ui.add([shadow,ring,inner,icon,txt]);
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
      const objects=[dockBg,dockTitle,shadow,ring,inner,icon,cd,cdText,keyBox,label];
      this.pcSkillSlots.push({...cfg,y,cooldownOverlay:cd,cooldownText:cdText,objects});
      ui.add([shadow,ring,inner,icon,cd,cdText,keyBox,label]);
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
  update(time){if(this.ended){if(this.keys&&Phaser.Input.Keyboard.JustDown(this.keys.restart))this.scene.restart();return}if(this.relicChoiceOpen){this.handleRelicChoiceKeys();this.updateControlCooldowns(time);this.drawUI();return}this.handlePlayer(time);this.updatePlayerVisual(time);this.updateEnemies();this.keepActorsAboveFloor();this.updateAdventure(time);this.updateBoss(time);this.drawUI();this.updateControlCooldowns(time);const rem=Math.max(0,this.skillReadyAt-time);if(this.skillText)this.skillText.setText(rem<=0?'Skill READY':`Skill ${(rem/1000).toFixed(1)}s`)}
  handleRelicChoiceKeys(){if(!this.keys||!this.relicChoiceOpen||!this.relicChoices)return;let idx=-1;if(Phaser.Input.Keyboard.JustDown(this.keys.choice1))idx=0;else if(Phaser.Input.Keyboard.JustDown(this.keys.choice2))idx=1;else if(Phaser.Input.Keyboard.JustDown(this.keys.choice3))idx=2;if(idx>=0&&this.relicChoices[idx]){const c=this.relicChoices[idx];this.selectRelic(c.id,c.source);}}
  handlePlayer(time){const b=this.player.body,left=this.joystickX<-.25||this.keys?.left.isDown||this.keys?.left2.isDown,right=this.joystickX>.25||this.keys?.right.isDown||this.keys?.right2.isDown;if(!this.isDashing){if(left){this.player.setVelocityX(-250);this.facing=-1;this.player.setFlipX(true)}else if(right){this.player.setVelocityX(250);this.facing=1;this.player.setFlipX(false)}else this.player.setVelocityX(0)}if(this.consume('jump',this.keys?.jump)&&b.blocked.down)this.player.setVelocityY(-510);if(this.consume('dash',this.keys?.dash)&&this.canDash)this.doDash(time);if(this.consume('attack',this.keys?.attack)&&this.canAttack)this.attack(time);if(this.consume('skill',this.keys?.skill)&&time>=this.skillReadyAt)this.skill(time)}
  doDash(time){const cd=this.getDashCooldown(),speed=this.hasRelic('wind_step')?760:650;this.canDash=false;this.dashReadyAt=time+cd;this.isDashing=true;this.invincibleUntil=time+190;this.animLockUntil=time+210;this.setKaiTexture(this.kaiTex.dash);this.player.setVelocityX(this.facing*speed).setTint(C.cyan);this.createDashTrail();if(this.hasRelic('thunder_dash')){this.applyThunderDash();this.time.delayedCall(110,()=>this.applyThunderDash());this.time.delayedCall(210,()=>this.applyThunderDash());}this.time.delayedCall(190,()=>{this.isDashing=false;this.player.clearTint()});this.time.delayedCall(cd,()=>this.canDash=true)}
  attack(time){this.canAttack=false;if(time>this.comboExpire)this.attackStep=0;this.attackStep=this.attackStep%3+1;this.comboExpire=time+520;const atkCd=this.attackStep===3?280:185;this.attackReadyAt=time+atkCd;this.animLockUntil=time+(this.attackStep===3?260:180);this.setKaiTexture(this.kaiTex['attack'+this.attackStep]);let dmg=[0,12,15,25][this.attackStep];if(this.hasRelic('heavy_impact')&&this.attackStep===3)dmg+=18;const reach=this.attackStep===3?105:82;this.fxSlash(this.player.x+this.facing*55,this.player.y-5,this.attackStep===3?1.3:1);for(const e of this.enemies){if(e.active&&Phaser.Math.Distance.Between(this.player.x,this.player.y,e.sprite.x,e.sprite.y)<reach+45){this.hitEnemy(e,dmg);if(this.hasRelic('fire_blade')&&Math.random()<0.35)this.applyBurn(e);if(this.hasRelic('heavy_impact')&&this.attackStep===3)this.bindEnemy(e,700);}}if(this.bossActive&&this.boss.active&&Phaser.Math.Distance.Between(this.player.x,this.player.y,this.boss.x,this.boss.y)<reach+100){this.hitBoss(dmg);if(this.hasRelic('fire_blade')&&Math.random()<0.35)this.applyBossBurn();if(this.hasRelic('heavy_impact')&&this.attackStep===3)this.bossSlowUntil=this.time.now+650;}this.time.delayedCall(atkCd,()=>this.canAttack=true)}
  skill(time){const cd=this.getSkillCooldown();this.skillReadyAt=time+cd;this.animLockUntil=time+360;this.setKaiTexture(this.kaiTex.skill);this.createSkillBurst(this.player.x+this.facing*50,this.player.y);const surge=this.hasRelic('relic_surge'),root=this.hasRelic('root_prison');const wave=this.physics.add.sprite(this.player.x+this.facing*55,this.player.y-6,'slash').setScale(surge?1.75:1.4,surge?2.95:2.5).setTint(root?0x6fff9a:0x8effff);wave.body.setAllowGravity(false);wave.setVelocityX(this.facing*(surge?820:720));const ev=this.time.addEvent({delay:35,repeat:22,callback:()=>{if(!wave.active)return;for(const e of this.enemies){if(e.active&&Phaser.Math.Distance.Between(wave.x,wave.y,e.sprite.x,e.sprite.y)<(surge?92:75)){this.hitEnemy(e,surge?48:34);if(root)this.bindEnemy(e,1800);wave.destroy();return}}if(this.bossActive&&this.boss.active&&Phaser.Math.Distance.Between(wave.x,wave.y,this.boss.x,this.boss.y)<(surge?130:110)){this.hitBoss(surge?48:34);if(root){this.bossSlowUntil=this.time.now+1800;this.createRootFx(this.boss.x,this.boss.y+42);}wave.destroy()}}});this.time.delayedCall(1050,()=>{ev.remove();if(wave.active)wave.destroy()})}
  fxSlash(x,y,s=1){const q=this.add.sprite(x,y,'slash').setScale(s,1.5*s).setTint(C.cyan).setAlpha(.85);const arc=this.add.graphics({x,y}).setDepth(11);arc.lineStyle(6*s,0x8effff,.9);arc.beginPath();arc.arc(0,0,58*s,this.facing>0?-0.8:Math.PI-0.8,this.facing>0?0.8:Math.PI+0.8,false);arc.strokePath();arc.lineStyle(2*s,0xffffff,.85);arc.beginPath();arc.arc(0,0,70*s,this.facing>0?-0.55:Math.PI-0.55,this.facing>0?0.55:Math.PI+0.55,false);arc.strokePath();this.tweens.add({targets:q,alpha:0,scaleX:s*1.4,duration:120,onComplete:()=>q.destroy()});this.tweens.add({targets:arc,alpha:0,scale:1.25,duration:160,onComplete:()=>arc.destroy()})}
  hitEnemy(e,dmg){if(!e.active)return;e.hp-=dmg;e.sprite.setTint(0xffffff);this.cameras.main.shake(45,.0025);this.createImpactSpark(e.sprite.x,e.sprite.y-18,e.type==='elite'?C.gold:C.cyan);this.time.delayedCall(70,()=>e.active&&e.sprite.clearTint());if(e.hp<=0){e.active=false;e.sprite.disableBody(true,true);this.coins+=e.type==='elite'?30:10;this.spawnCoinText(e.sprite.x,e.sprite.y,e.type==='elite'?30:10);if(this.hasRelic('blood_pact'))this.healPlayer(e.type==='elite'?18:8);if(e.type==='elite'){this.flash('ELITE DEFEATED • RELIC FOUND',900);if(!this.eliteRelicDropped){this.eliteRelicDropped=true;this.time.delayedCall(420,()=>this.showRelicChoices('elite'));}}}}
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
  updateEnemies(){for(const e of this.enemies){if(!e.active)continue;if(this.boundUntil[e.id]&&this.time.now<this.boundUntil[e.id]){e.sprite.setVelocityX(0);continue;}const d=this.player.x-e.sprite.x;if(Math.abs(d)<390)e.sprite.setVelocityX(Math.sign(d)*e.speed);else e.sprite.setVelocityX(0)}}
  keepActorsAboveFloor(){for(const e of this.enemies){if(!e.active)continue;if(e.sprite.y>e.floorY+4){e.sprite.setY(e.floorY);e.sprite.setVelocityY(0)}}if(this.boss&&this.boss.active&&this.boss.y>FLOOR_TOP-62){this.boss.setY(FLOOR_TOP-62);this.boss.setVelocityY(0)}}
  spawnCoinText(x,y,n){const t=this.add.text(x,y-40,`+${n} COIN`,{fontSize:'18px',fontStyle:'bold',color:'#ffd56a'}).setOrigin(.5);this.tweens.add({targets:t,y:y-85,alpha:0,duration:700,onComplete:()=>t.destroy()})}
  updateAdventure(){if(this.player.x>1700&&this.checkpointX<1700){this.checkpointX=1760;this.playerHP=Math.min(100,this.playerHP+25);this.flash('CHECKPOINT ACTIVATED • HP RESTORED',950)}if(!this.chestOpened&&this.player.x>2500&&this.player.x<2700&&this.miniBoss&&!this.miniBoss.active){this.chestOpened=true;this.coins+=50;this.chest.setTint(0xffe08a);this.flash('TREASURE CHEST • +50 COIN',950)}if(!this.bossActive&&this.player.x>3500){this.startBoss()}if(this.portalUnlocked&&this.player.x>4020){this.ended=true;this.flash('WORLD 1 CLEAR\nKAI Official Sprite Integration Complete • Press R',999999)}}
  startBoss(){this.bossActive=true;this.boss.setVisible(true).setActive(true);this.boss.body.enable=true;this.bossLabel.setVisible(true);this.bossBar.setVisible(true);this.bossNextAttack=this.time.now+1200;this.objective.setText('OBJECTIVE: Defeat the Forest Guardian');this.flash('BOSS ENCOUNTER',900)}
  updateBoss(time){if(!this.bossActive||!this.boss.active||this.bossBusy)return;if(this.bossHP<=405&&this.bossPhase===1){this.bossPhase=2;this.boss.setTint(0xff7777);this.flash('PHASE 2 • RAGE',1000)}if(time<this.bossNextAttack)return;const c=Phaser.Math.Between(0,2);c===0?this.bossCharge():c===1?this.bossSlam():this.bossRoots();const slowed=time<this.bossSlowUntil;this.bossNextAttack=time+(this.bossPhase===1?(slowed?2750:2050):(slowed?2050:1450))}
  bossCharge(){this.bossBusy=true;const dir=Math.sign(this.player.x-this.boss.x)||-1,w=this.add.rectangle(this.boss.x+dir*220,625,380,38,C.warning,.25);this.tweens.add({targets:w,alpha:.7,yoyo:true,repeat:2,duration:120});this.time.delayedCall(540,()=>{w.destroy();this.boss.setVelocityX(dir*(this.bossPhase===1?480:620));this.time.delayedCall(450,()=>{this.boss.setVelocityX(0);this.bossBusy=false})})}
  bossSlam(){this.bossBusy=true;const z=this.add.circle(this.boss.x,640,150,C.warning,.18);this.tweens.add({targets:z,scale:1.15,alpha:.5,duration:500});this.time.delayedCall(600,()=>{this.cameras.main.shake(180,.008);if(Phaser.Math.Distance.Between(this.player.x,this.player.y,this.boss.x,this.boss.y)<180)this.takeDamage(this.bossPhase===1?18:24);z.destroy();this.time.delayedCall(350,()=>this.bossBusy=false)})}
  bossRoots(){this.bossBusy=true;const x=Phaser.Math.Clamp(this.player.x+Phaser.Math.Between(-80,80),3550,4230),w=this.add.rectangle(x,630,95,16,C.warning,.45);this.tweens.add({targets:w,alpha:.9,yoyo:true,repeat:3,duration:120});this.time.delayedCall(650,()=>{w.destroy();const r=this.add.rectangle(x,575,46,130,0x6f8f45).setOrigin(.5,1);if(Math.abs(this.player.x-x)<65)this.takeDamage(this.bossPhase===1?16:22);this.time.delayedCall(500,()=>r.destroy());this.time.delayedCall(680,()=>this.bossBusy=false)})}
  hitBoss(dmg){this.bossHP=Math.max(0,this.bossHP-dmg);this.boss.setTint(0xffffff);this.cameras.main.shake(55,.003);this.createImpactSpark(this.boss.x,this.boss.y-22,this.bossPhase===2?C.red:C.cyan);this.time.delayedCall(70,()=>{if(this.boss.active)this.bossPhase===2?this.boss.setTint(0xff7777):this.boss.clearTint()});if(this.bossHP<=0){this.boss.disableBody(true,true);if(this.hasRelic('blood_pact'))this.healPlayer(35);if(!this.bossRelicDropped){this.bossRelicDropped=true;this.flash('BOSS DEFEATED • ANCIENT RELIC UNLOCKED',1100);this.time.delayedCall(550,()=>this.showRelicChoices('boss'));}else this.openPortalAfterRelic();}}
  contactDamage(enemy,dmg){if(this.time.now<this.invincibleUntil)return;this.takeDamage(dmg);this.player.setVelocityX(Math.sign(this.player.x-enemy.x)*260);this.player.setVelocityY(-180)}
  takeDamage(dmg){if(this.time.now<this.invincibleUntil||this.ended)return;if(this.hasRelic('guardian_shell'))dmg=Math.ceil(dmg*0.78);this.playerHP=Math.max(0,this.playerHP-dmg);this.invincibleUntil=this.time.now+700;this.hurtUntil=this.time.now+350;this.setKaiTexture(this.kaiTex.hurt);this.player.setTint(0xff7777);this.cameras.main.shake(100,.006);this.showDamageText(this.player.x,this.player.y-54,dmg,0xff6b6b,'-');this.time.delayedCall(150,()=>this.player.clearTint());if(this.playerHP<=0){this.player.setPosition(this.checkpointX,FLOOR_TOP-38);this.playerHP=100;this.invincibleUntil=this.time.now+1600;this.flash('KAI FALLEN • RESPAWN AT CHECKPOINT',1200)}}
  drawUI(){this.hpBar.clear().fillStyle(0x183434,.95).fillRoundedRect(118,40,218,18,8).fillStyle(C.green,1).fillRoundedRect(118,40,218*(this.playerHP/100),18,8);this.coinText.setText(`COIN ${this.coins}`);this.bossBar.clear().fillStyle(0x26161a,.95).fillRoundedRect(W/2-280,50,560,16,8).fillStyle(C.red,1).fillRoundedRect(W/2-280,50,560*(this.bossHP/900),16,8);this.updateRelicHud()}
  hasRelic(id){return this.relics.includes(id)}
  getDashCooldown(){return this.hasRelic('wind_step')?560:780}
  getSkillCooldown(){return this.hasRelic('relic_surge')?3600:5000}
  healPlayer(amount){const before=this.playerHP;this.playerHP=Math.min(100,this.playerHP+amount);if(this.playerHP>before)this.showDamageText(this.player.x,this.player.y-70,this.playerHP-before,0x6fcf97,'+')}
  showDamageText(x,y,n,color=0xffffff,prefix=''){const t=this.add.text(x,y,`${prefix}${n}`,{fontSize:'18px',fontStyle:'bold',color:'#'+color.toString(16).padStart(6,'0'),stroke:'#061015',strokeThickness:4}).setOrigin(.5).setDepth(80);this.tweens.add({targets:t,y:y-36,alpha:0,duration:650,onComplete:()=>t.destroy()})}
  applyBurn(e){if(!e||!e.active)return;this.burnTimers[e.id]=(this.burnTimers[e.id]||0)+1;e.sprite.setTint(0xff8b44);this.createBurnFx(e.sprite.x,e.sprite.y);let ticks=0;const ev=this.time.addEvent({delay:650,repeat:3,callback:()=>{if(!e.active){ev.remove();return}ticks++;this.hitEnemy(e,5);this.createBurnFx(e.sprite.x,e.sprite.y);if(ticks>=4)ev.remove();}})}
  applyBossBurn(){if(!this.boss.active)return;this.createBurnFx(this.boss.x,this.boss.y);let ticks=0;const ev=this.time.addEvent({delay:650,repeat:3,callback:()=>{if(!this.boss.active){ev.remove();return}ticks++;this.hitBoss(5);this.createBurnFx(this.boss.x,this.boss.y);if(ticks>=4)ev.remove();}})}
  bindEnemy(e,ms){if(!e||!e.active)return;this.boundUntil[e.id]=this.time.now+ms;e.sprite.setVelocityX(0);e.sprite.setTint(0x8dff9c);this.createRootFx(e.sprite.x,e.sprite.y+18);this.time.delayedCall(ms,()=>{if(e.active)e.sprite.clearTint()})}
  applyThunderDash(){for(const e of this.enemies){if(e.active&&Phaser.Math.Distance.Between(this.player.x,this.player.y,e.sprite.x,e.sprite.y)<92){this.hitEnemy(e,22);this.createLightningFx(e.sprite.x,e.sprite.y);}}if(this.bossActive&&this.boss.active&&Phaser.Math.Distance.Between(this.player.x,this.player.y,this.boss.x,this.boss.y)<130){this.hitBoss(18);this.createLightningFx(this.boss.x,this.boss.y);}}
  createBurnFx(x,y){const fx=this.add.circle(x,y-18,18,0xff7138,0.28).setDepth(14);this.tweens.add({targets:fx,scale:1.65,alpha:0,duration:360,onComplete:()=>fx.destroy()})}
  createLightningFx(x,y){const g=this.add.graphics({x,y}).setDepth(14);g.lineStyle(4,0x66e8ff,0.9);g.beginPath();g.moveTo(-28,-34);g.lineTo(0,-6);g.lineTo(-12,-3);g.lineTo(24,34);g.strokePath();this.tweens.add({targets:g,alpha:0,scale:1.25,duration:300,onComplete:()=>g.destroy()})}
  createRootFx(x,y){const g=this.add.graphics({x,y}).setDepth(13);g.lineStyle(5,0x7cf082,0.8);for(let i=-2;i<=2;i++){g.beginPath();g.moveTo(i*12,30);g.lineTo(i*8,-22);g.lineTo(i*18,-40);g.strokePath();}this.tweens.add({targets:g,alpha:0,y:y-12,duration:720,onComplete:()=>g.destroy()})}
  createImpactSpark(x,y,color=C.cyan){
    const g=this.add.graphics({x,y}).setDepth(18);
    g.lineStyle(3,color,0.92);
    for(let i=0;i<8;i++){
      const a=(Math.PI*2/8)*i;
      g.beginPath();
      g.moveTo(Math.cos(a)*8,Math.sin(a)*8);
      g.lineTo(Math.cos(a)*Phaser.Math.Between(22,42),Math.sin(a)*Phaser.Math.Between(22,42));
      g.strokePath();
    }
    g.fillStyle(0xffffff,0.75).fillCircle(0,0,8);
    this.tweens.add({targets:g,scale:1.3,alpha:0,duration:260,onComplete:()=>g.destroy()});
  }
  createRelicAcquireFx(color=C.cyan){
    const x=W/2,y=H/2;
    const g=this.add.graphics({x,y}).setScrollFactor(0).setDepth(340);
    g.lineStyle(5,color,0.9).strokeCircle(0,0,42);
    g.lineStyle(2,0xffffff,0.8).strokeCircle(0,0,68);
    for(let i=0;i<12;i++){
      const a=(Math.PI*2/12)*i;
      g.lineStyle(2,color,0.65);
      g.beginPath();g.moveTo(Math.cos(a)*76,Math.sin(a)*76);g.lineTo(Math.cos(a)*104,Math.sin(a)*104);g.strokePath();
    }
    this.tweens.add({targets:g,scale:1.45,alpha:0,duration:520,onComplete:()=>g.destroy()});
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
      const hit=this.add.zone(0,0,270,290).setOrigin(.5).setSize(270,290).setInteractive({useHandCursor:true});
      const hoverOn=()=>{card.setScale(1.04);bg.setFillStyle(0x0b2d31,0.98);bg.setStrokeStyle(4,r.color,0.95)};
      const hoverOff=()=>{card.setScale(1);bg.setFillStyle(0x07171b,0.96);bg.setStrokeStyle(3,r.color,0.72)};
      const choose=(pointer,localX,localY,event)=>{if(event&&event.stopPropagation)event.stopPropagation();this.selectRelic(r.id,source);};
      hit.on('pointerover',hoverOn);hit.on('pointerout',hoverOff);hit.on('pointerdown',choose);hit.on('pointerup',choose);
      card.add([bg,key,icon,title,type,desc,pick,hit]);
      layer.add(card);
    });
  }
  selectRelic(id,source){if(!this.relicChoiceOpen||this.relics.includes(id))return;this.relics.push(id);const r=RELIC_BY_ID[id];this.flash(`${r.name.toUpperCase()} ACQUIRED`,900);this.createRelicAcquireFx(r.color);if(this.relicLayer){this.relicLayer.destroy();this.relicLayer=null;}this.relicChoices=[];this.relicChoiceOpen=false;this.physics.world.resume();this.updateRelicHud(true);if(source==='boss')this.openPortalAfterRelic();}
  openPortalAfterRelic(){this.portalUnlocked=true;this.portal.setVisible(true);this.objective.setText('OBJECTIVE: Enter the Exit Portal');this.flash('VICTORY • EXIT PORTAL OPENED',1300)}
  updateRelicHud(force=false){if(!this.relicHud)return;if(!force&&this._lastRelicCount===this.relics.length)return;this._lastRelicCount=this.relics.length;this.relicHud.removeAll(true);this.relicHud.add(this.add.rectangle(0,0,390,70,0x061015,0.46).setOrigin(0));this.relicHud.add(this.add.text(12,8,'RELIC BUILD',{fontSize:'12px',fontStyle:'bold',color:'#8ff8f0'}));if(!this.relics.length){this.relicHud.add(this.add.text(12,31,'Chưa có Relic • Hạ Elite để chọn sức mạnh đầu tiên',{fontSize:'12px',color:'#b7d4d2'}));return;}this.relics.slice(0,5).forEach((id,i)=>{const r=RELIC_BY_ID[id];this.relicHud.add(this.add.image(24+i*66,43,'relic_'+id).setDisplaySize(36,36));this.relicHud.add(this.add.text(43+i*66,54,r.icon,{fontSize:'14px'}).setOrigin(.5));});if(this.relics.length>5)this.relicHud.add(this.add.text(346,32,`+${this.relics.length-5}`,{fontSize:'16px',fontStyle:'bold',color:'#f4c76b'}));}
  flash(text,duration){this.status.setText(text).setVisible(true).setAlpha(1);if(duration<999999)this.tweens.add({targets:this.status,alpha:0,delay:duration,duration:280,onComplete:()=>this.status.setVisible(false)})}
}

const rotate=document.createElement('div');rotate.id='rotate-hint';rotate.innerHTML='📱 Xoay điện thoại sang <b>ngang</b> để chơi RELIC HUNTER';document.body.appendChild(rotate);
new Phaser.Game({type:Phaser.AUTO,parent:'app',width:W,height:H,backgroundColor:'#07171b',physics:{default:'arcade',arcade:{gravity:{x:0,y:1100},debug:false}},scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH,width:W,height:H},render:{antialias:true,pixelArt:false,roundPixels:true},scene:[AdventureScene]});
