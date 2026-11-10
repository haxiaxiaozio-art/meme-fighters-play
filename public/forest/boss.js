(function (root) {
  'use strict';
  const E = typeof module !== 'undefined' && module.exports ? require('./engine.js') : root.ForestEngine;
  const S = typeof module !== 'undefined' && module.exports ? require('./sprites.js') : root.SwordSprites;
  const C = typeof module !== 'undefined' && module.exports ? require('./combat-config.js') : root.ForestCombatConfig;
  const { GROUND, WIDTH, intersects } = E;
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const move = (v, to, d) => v < to ? Math.min(to, v + d) : Math.max(to, v - d);
  const LABELS = { triple: '三连伞击', rush: '伞冲击', leap: '花溅跃', flowers: '鲜花机关枪', cat: '柴郡猫', rabbit: '三月兔', rain: '千刀万剐', ricochet: '伞折射', thorn: '荆棘之刺', taunt: '仙境嘲笑', cards: '红心女王扑克' };
  const ROTATIONS = {
    1: ['rush', 'taunt', 'thorn', 'flowers', 'cat', 'leap', 'rabbit', 'triple'],
    2: ['leap', 'taunt', 'thorn', 'flowers', 'rush', 'rabbit', 'triple', 'cat'],
    3: ['rain', 'taunt', 'thorn', 'ricochet', 'rush', 'flowers', 'leap', 'triple']
  };
  const CORNERS = [{ x: 95, y: 190 }, { x: 1185, y: 190 }, { x: 95, y: GROUND }, { x: 1185, y: GROUND }];
  const CONFIG = C.boss;
  const HEART_CORNERS = [{ x: 95, y: 310 }, { x: 1185, y: 310 }, { x: 95, y: 535 }, { x: 1185, y: 535 }];
  function segmentHitsBox(line, box, radius = 0) {
    let enter = 0, leave = 1;
    for (const [axis, size] of [['x', 'w'], ['y', 'h']]) {
      const start = line[axis], delta = line['end' + axis.toUpperCase()] - start, lo = box[axis] - radius, hi = box[axis] + box[size] + radius;
      if (Math.abs(delta) < 1e-9) { if (start < lo || start > hi) return false; }
      else { const a = (lo - start) / delta, b = (hi - start) / delta; enter = Math.max(enter, Math.min(a, b)); leave = Math.min(leave, Math.max(a, b)); if (enter > leave) return false; }
    }
    return true;
  }

  class Challenge extends E.Practice {
    reset() {
      super.reset();
      this.player.x = 340; this.player.hp = CONFIG.playerHP; this.player.maxHP = CONFIG.playerHP;
      this.boss = { x: 960, y: GROUND, hp: CONFIG.bossHP, maxHP: CONFIG.bossHP, phase: 1, facing: -1, state: 'idle', attack: '', time: 0, flash: 0, cooldown: 1.15, rotation: 0, corner: 0, hatOn: true, umbrellaOn: true, strikes: [], shots: 0 };
      this.status = 'intro'; this.summons = []; this.blooms = []; this.hat = null; this.umbrella = null;
      this.bindTimer = 0; this.transitionTime = 0; this.departureTime = 0;
      this.butterflyClouds = []; this.thorns = []; this.heart = null; this.heartTimer = CONFIG.heartInterval; this.heartCorner = 0; this.random = Math.random;
      this.stats = { phaseChanges: [], attacks: {}, candyBounces: 0, umbrellaBounces: 0, rainWaves: 0 };
    }
    start() { if (this.status === 'intro') { this.status = 'fight'; this.events.push({ type: 'notice', text: '挑战开始 · 面向攻击按 F，格挡后接续剑招' }); } }
    finishDialogue() { if (this.status === 'outro') { this.status = 'departing'; this.departureTime = 0; } }
    requestShot() {} // Training-only controls never introduce dummy projectiles into a challenge.
    setAutoAttacks() {}
    startDash(input) { if (this.bindTimer <= 0) super.startDash(input); }
    special(input) {
      if (this.bindTimer > 0 && (input.left || input.right || input.up || this.player.action === 'dash')) {
        super.special({}); return;
      }
      super.special(input);
    }
    receiveBolt(bolt) {
      if (this.status !== 'fight') return;
      const before = this.received, eventStart = this.events.length;
      super.receiveBolt(bolt);
      if (this.received !== before) {
        const damage = bolt.damage || 16;
        this.player.hp = Math.max(0, this.player.hp - (this.incomingDamage?.(damage) ?? damage));
        // Replace the practice-only hint, preserving the shared defense/reward logic.
        this.events.splice(eventStart, this.events.length - eventStart, { type: 'hurt' }, { type: 'notice', text: bolt.bind ? '柴郡猫束缚 · 仍可攻击 / 格挡' : '受到攻击 · 面向来袭方向按 F 格挡' });
        if (bolt.bind) { this.bindTimer = CONFIG.bindSeconds; this.events.push({ type: 'sfx', cue: 'catBind', x: this.player.x }); }
        if (this.player.hp === 0) {
          this.status = 'lost'; this.clearHazards(); this.rewardTimer = 0; this.bindTimer = 0;
          this.player.phaseTimer = 0; this.player.boostTimer = 0;
          this.events.push({ type: 'lost' });
        }
      }
    }
    damageTarget(box, impact = false) {
      const b = this.boss;
      if (this.status !== 'fight' || this.hasHit) return;
      const damage = this.attackDamage(S.animations[this.player.action].damage || 30) * CONFIG.damageScale;
      if (this.heart && intersects(box, this.heartBox())) { this.hasHit = true; this.damageHeart(damage); return; }
      if (!intersects(box, { x: b.x - 28, y: b.y - 125, w: 56, h: 125 })) return;
      this.hasHit = true;
      if (b.state === 'counterStance') { this.triggerCounter(); return; }
      if (this.heart) { this.events.push({ type: 'notice', text: '红心替身保护中 · 先击碎红心' }); return; }
      this.hitBoss(damage, impact);
    }
    damageProjectile(box, damage, weapon = 'dagger') {
      const b = this.boss;
      if (this.status !== 'fight') return false;
      if (this.heart && intersects(box, this.heartBox())) { this.damageHeart(damage * CONFIG.damageScale, weapon); return true; }
      if (!intersects(box, { x: b.x - 28, y: b.y - 125, w: 56, h: 125 })) return false;
      if (b.state === 'counterStance') { this.triggerCounter(); return true; }
      if (this.heart) return true;
      this.hitBoss(damage * CONFIG.damageScale, false, weapon); return true;
    }
    hitBoss(damage, impact, weapon = this.player.actionWeapon) {
      const b = this.boss;
      this.hits++; this.totalDamage += damage; this.combo++; this.maxCombo = Math.max(this.maxCombo, this.combo);
      this.comboTimer = Math.max(1.2, this.rewardTimer + .2); b.flash = .16;
      this.hitStop = impact ? .06 : .035; this.shake = impact ? 6 : 3;
      this.events.push({ type: 'hit', weapon, target: 'alice', x: b.x, y: b.y - 145, damage, fx: { x: b.x, y: b.y - 65, impact } });
      for (let i = 0; i < 12; i++) this.particles.push({ x: b.x, y: b.y - 65, vx: (Math.random() - .5) * 300, vy: -Math.random() * 250, life: .4, color: i % 2 ? '#efdb95' : '#eaa3b2' });
      this.damageBoss(damage);
    }
    damageBoss(amount) {
      if (this.status !== 'fight' || this.heart || !Number.isFinite(amount) || amount <= 0) return;
      const b = this.boss; b.hp = Math.max(0, b.hp - amount);
      if (b.hp === 0) {
        this.status = 'outro'; b.state = 'defeated'; b.time = 0; b.y = GROUND; b.hatOn = true; b.umbrellaOn = false;
        this.clearHazards(); this.bindTimer = 0; this.rewardTimer = 0; this.hitStop = 0; this.player.vx = 0;
        this.player.phaseTimer = 0; this.player.boostTimer = 0;
        this.events.push({ type: 'victory' }); return;
      }
      this.checkPhase();
    }
    checkPhase() {
      const b = this.boss;
      if (b.phase === 1 && b.hp <= 2000) this.changePhase(2);
      else if (b.phase === 2 && b.hp <= 1000) this.changePhase(3);
    }
    changePhase(phase) {
      const b = this.boss;
      this.clearHazards(); this.bindTimer = 0; this.jumpBuffer = 0; this.pendingCommand = null;
      this.status = 'transition'; this.transitionTime = 0;
      Object.assign(b, { phase, state: 'transition', time: 0, x: WIDTH / 2, y: GROUND, rotation: 0, cooldown: .8, hatOn: phase === 3, umbrellaOn: true });
      this.hat = phase === 2 ? { x: WIDTH / 2, y: GROUND - 105, mode: 'center', time: 0, fire: 1.4 } : null;
      if (phase === 3) { this.spawnSummon('cat', true); this.spawnSummon('rabbit', true); }
      this.stats.phaseChanges.push(phase);
      this.events.push({ type: 'phase', phase, text: phase === 2 ? '第二阶段 · 礼帽机关 / 追踪花弹' : '第三阶段 · 猫兔常驻 / 千刀万剐 / 伞折射' });
    }
    clearHazards() { this.projectiles = []; this.friendlyDaggers = []; this.summons = []; this.blooms = []; this.hat = null; this.umbrella = null; this.butterflyClouds = []; this.thorns = []; this.heart = null; this.magicEffect = null; }
    resting() { return ['recover', 'laugh', 'counterStance'].includes(this.boss.state); }
    relocate(x, y) {
      const b = this.boss;
      if (Math.hypot(x - b.x, y - b.y) > 2) this.leaveButterflies();
      b.x = x; b.y = y;
    }
    leaveButterflies() {
      const b = this.boss; b.cloudLeft = true; this.butterflyClouds.push({ x: b.x, y: clamp(b.y - 65, 100, GROUND - 30), phase: b.phase, count: CONFIG.butterflyCounts[b.phase], time: 0 });
    }
    updateButterflies(dt) {
      for (const q of this.butterflyClouds) {
        q.time += dt;
        if (q.time >= CONFIG.butterflyGather) {
          for (let i = 0; i < q.count; i++) { const a = i * Math.PI * 2 / q.count - Math.PI / 2; this.spawnProjectile('butterfly', q.x, q.y, Math.cos(a) * CONFIG.butterflySpeed, Math.sin(a) * CONFIG.butterflySpeed, { life: CONFIG.butterflyFlight, damage: 12 }); }
        }
      }
      this.butterflyClouds = this.butterflyClouds.filter(q => q.time < CONFIG.butterflyGather);
    }
    spawnHeart() {
      if (this.heart || this.boss.phase < 2 || this.status !== 'fight') return;
      const at = HEART_CORNERS[this.heartCorner++ % 4]; this.heart = { ...at, hp: CONFIG.heartHP, maxHP: CONFIG.heartHP, flash: 0 };
      this.heartTimer = CONFIG.heartInterval;
      this.events.push({ type: 'sfx', cue: 'heartAppear', x: at.x }, { type: 'notice', text: '红心替身 · 击碎四角红心解除无敌' });
    }
    heartBox() { return { x: this.heart.x - 27, y: this.heart.y - 27, w: 54, h: 54 }; }
    damageHeart(damage, weapon = this.player.actionWeapon) {
      if (!this.heart || this.status !== 'fight' || !Number.isFinite(damage) || damage <= 0) return;
      const h = this.heart, dealt = Math.min(h.hp, damage); h.hp -= dealt; h.flash = .16;
      this.hits++; this.totalDamage += dealt; this.combo++; this.maxCombo = Math.max(this.maxCombo, this.combo); this.comboTimer = 1.2;
      this.events.push({ type: 'hit', weapon, target: 'heart', x: h.x, y: h.y - 40, damage: dealt, fx: { x: h.x, y: h.y, impact: false } });
      if (h.hp === 0) {
        this.heart = null; this.heartTimer = CONFIG.heartInterval;
        this.events.push({ type: 'sfx', cue: 'heartBreak', x: h.x }, { type: 'notice', text: '红心破碎 · 爱丽丝无敌解除' });
        // Break the shield without interrupting phase or end-of-battle state.
        this.boss.followCards = false; this.endAttack(Math.max(CONFIG.heartBreakRest, CONFIG.recoverMin[this.boss.phase]));
        if (this.umbrella) this.umbrella.returning = true;
        if (this.hat?.mode === 'rain') this.hat.returning = true;
      }
    }
    triggerCounter() {
      const b = this.boss, p = this.player;
      this.bindTimer = CONFIG.counterBind; this.jumpBuffer = 0; this.pendingCommand = null;
      p.y = GROUND; p.grounded = true; p.vx = 0; p.vy = 0;
      b.facing = p.x < b.x ? -1 : 1;
      this.relocate(clamp(p.x - b.facing * 75, 65, 1215), GROUND);
      b.attack = 'triple'; b.state = 'triple'; b.time = 0; b.strikes = []; b.followCards = false;
      this.events.push({ type: 'sfx', cue: 'aliceCounter', x: b.x }, { type: 'notice', text: '当身反制 · 束缚三连击，可格挡' });
    }
    telegraphDuration() { return this.boss.attack === 'thorn' ? CONFIG.thornWindup : ['rain', 'ricochet'].includes(this.boss.attack) ? .85 : .65; }
    thornLines() {
      const b = this.boss, x = b.x + b.facing * 16, y = b.y - 55, lines = [{ x, y, endX: b.facing > 0 ? 1260 : 20, endY: y }];
      if (b.phase >= 2) { const length = Math.min(y - 90, b.facing > 0 ? 1260 - x : x - 20); lines.push({ x, y, endX: x + b.facing * length, endY: y - length }); }
      return lines;
    }
    spawnProjectile(kind, x, y, vx, vy, extra = {}) {
      const q = { kind, x, y, vx, vy, life: 9, damage: kind === 'dagger' ? 20 : 16, ...extra };
      this.projectiles.push(q);
      const cue = { dagger: 'aliceKnives', flower: 'aliceFlower', rose: 'aliceFlower', card: 'aliceCards', candy: 'candyThrow' }[kind];
      if (cue && !(q.delay > 0)) this.events.push({ type: 'sfx', cue, x });
      return q;
    }
    aim(kind, x, y, targetX, targetY, speed, extra) {
      const dx = targetX - x, dy = targetY - y, length = Math.hypot(dx, dy) || 1;
      return this.spawnProjectile(kind, x, y, dx / length * speed, dy / length * speed, extra);
    }
    spawnSummon(kind, permanent = false) {
      let q = this.summons.find(s => s.kind === kind);
      if (q) { q.permanent ||= permanent; q.life = CONFIG.summonLife; return q; }
      const b = this.boss;
      q = { kind, x: permanent ? (kind === 'cat' ? 180 : 1100) : b.x, y: permanent ? GROUND : b.y - 80, vx: permanent ? (kind === 'cat' ? CONFIG.catSpeed : 45) : b.facing * 210, vy: permanent ? 0 : -340, grounded: permanent, permanent, life: CONFIG.summonLife, time: 0, fire: CONFIG.rabbitFirstShot, contactCD: 0 };
      this.summons.push(q); return q;
    }
    beginAttack(name) {
      const b = this.boss;
      b.attack = name; b.state = 'telegraph'; b.time = 0; b.shots = 0; b.strikes = []; b.facing = this.player.x < b.x ? -1 : 1;
      b.targetX = this.player.x; b.originX = b.x; b.originY = b.y; b.trail = 0;
      b.followCards = false; b.cloudLeft = false;
      if (name === 'leap' || name === 'ricochet' || name === 'thorn') { this.relocate(b.x < WIDTH / 2 ? 95 : 1185, GROUND); b.facing = b.x < WIDTH / 2 ? 1 : -1; }
      if (name === 'flowers' || name === 'taunt') { const corner = CORNERS[b.corner++ % 4]; this.relocate(corner.x, corner.y); b.facing = b.x < this.player.x ? 1 : -1; }
      if (b.phase < 3 && ['flowers', 'leap', 'rush'].includes(name)) b.followCards = this.random() < CONFIG.cardChance;
      this.stats.attacks[name] = (this.stats.attacks[name] || 0) + 1;
      this.events.push({ type: 'bossAttack', attack: name, text: LABELS[name] });
    }
    activateAttack() {
      const b = this.boss; b.state = b.attack; b.time = 0; b.originX = b.x; b.originY = b.y; b.targetX = this.player.x;
      if (b.attack === 'taunt') b.state = 'laugh';
      const cue = { taunt: 'aliceLaugh', rush: 'aliceRush', leap: 'aliceLeap', thorn: 'aliceThorn', cat: 'aliceCat', rabbit: 'aliceRabbit', rain: 'aliceThrow', ricochet: 'aliceThrow' }[b.attack];
      if (cue) this.events.push({ type: 'sfx', cue, x: b.x });
      if ((b.attack === 'rush' || b.attack === 'leap') && !b.cloudLeft) this.leaveButterflies();
      if (b.attack === 'thorn') this.thorns = this.thornLines().map(q => ({ ...q, age: 0, hit: false }));
      if (b.attack === 'cat' || b.attack === 'rabbit') this.spawnSummon(b.attack);
      if (b.attack === 'rain') { b.hatOn = false; this.hat = { x: b.x, y: 145, mode: 'rain', time: 0, fire: .35, waves: 0, returning: false }; }
      if (b.attack === 'ricochet') {
        b.umbrellaOn = false;
        this.umbrella = { x: b.x, y: GROUND - 90, vx: b.facing * 780, vy: -410, bounces: 0, returning: false, returned: false, contactCD: 0, angle: 0 };
      }
    }
    endAttack(cooldown = .75) {
      const b = this.boss;
      if (b.followCards && b.phase < 3) { b.followCards = false; this.beginAttack('cards'); return; }
      this.thorns = [];
      this.relocate(b.x, GROUND);
      b.state = 'recover'; b.time = 0; b.cooldown = Math.max(cooldown, CONFIG.recoverMin[b.phase]); b.umbrellaOn = true;
    }
    playerBox() { const p = this.player; return { x: p.x - 18, y: p.y - 85, w: 36, h: 83 }; }
    strike(box, damage, sourceX, bind = false) {
      if (this.status !== 'fight' || !intersects(this.playerBox(), box)) return false;
      this.receiveBolt({ vx: this.player.x < sourceX ? -1 : 1, damage, bind }); return true;
    }
    updateBoss(dt) {
      const b = this.boss, p = this.player;
      b.time += dt; b.flash = Math.max(0, b.flash - dt);
      if (b.state === 'idle' || b.state === 'recover') {
        b.cooldown -= dt; b.facing = p.x < b.x ? -1 : 1;
        if (b.state === 'idle' && Math.abs(p.x - b.x) > 130) b.x = move(b.x, p.x, 140 * dt);
        if (b.cooldown <= 0) this.beginAttack(ROTATIONS[b.phase][b.rotation++ % ROTATIONS[b.phase].length]);
        return;
      }
      if (b.state === 'telegraph') { if (b.time >= this.telegraphDuration()) this.activateAttack(); return; }
      if (b.state === 'laugh') {
        if (b.time >= CONFIG.laughDuration[b.phase]) { b.state = 'counterStance'; b.time = 0; this.events.push({ type: 'sfx', cue: 'aliceCounter', x: b.x }, { type: 'notice', text: '当身架势 · 避免攻击爱丽丝，可回血或打红心' }); }
        return;
      }
      if (b.state === 'counterStance') { if (b.time >= CONFIG.counterDuration[b.phase]) this.endAttack(); return; }
      if (b.state === 'thorn') {
        for (const q of this.thorns) { q.age += dt; if (!q.hit && segmentHitsBox(q, this.playerBox(), CONFIG.thornWidth / 2)) { this.receiveBolt({ vx: b.facing, damage: 28 }); q.hit = true; } }
        if (b.time >= CONFIG.thornActive) { this.thorns = []; this.endAttack(); } return;
      }
      if (b.state === 'cards') {
        if (b.shots === 0) {
          const count = CONFIG.cardCounts[b.phase], aim = Math.atan2(p.y - 48 - (b.y - 65), p.x - b.x);
          for (let i = 0; i < count; i++) { const a = aim + (i - (count - 1) / 2) * .2; this.spawnProjectile('card', b.x, b.y - 65, Math.cos(a) * 350, Math.sin(a) * 350, { bounces: 0, life: 6, damage: 17, trail: [] }); }
          b.shots = 1;
        }
        if (b.time >= .6) this.endAttack(); return;
      }
      if (b.state === 'rush') {
        b.x = move(b.x, clamp(b.targetX - b.facing * 82, 65, 1215), CONFIG.rushSpeed[b.phase] * dt);
        if (Math.abs(b.x - clamp(b.targetX - b.facing * 82, 65, 1215)) < 2 || b.time > 1.5) { b.state = 'triple'; b.time = 0; b.strikes = []; }
      } else if (b.state === 'triple') {
        if (b.time < .2) { b.facing = p.x < b.x ? -1 : 1; b.x = move(b.x, clamp(p.x - b.facing * 75, 65, 1215), 280 * dt); }
        for (let i = 0; i < 3; i++) {
          const at = .28 + i * .42;
          if (b.time >= at && b.time - dt < at) this.events.push({ type: 'sfx', cue: i === 1 ? 'aliceSweep' : 'aliceThrust', x: b.x, rate: i === 2 ? .9 : 1 });
          if (b.time >= at && b.time < at + .13 && !b.strikes.includes(i)) {
            const reach = CONFIG.umbrellaReach[b.phase];
            if (this.strike({ x: b.facing > 0 ? b.x - 8 : b.x - reach, y: b.y - 105, w: reach + 8, h: 105 }, 18 + i * 2, b.x)) b.strikes.push(i);
          }
        }
        if (b.time > 1.65) this.endAttack(1.1);
      } else if (b.state === 'leap') {
        const t = clamp(b.time / CONFIG.leapDuration[b.phase], 0, 1);
        b.x = b.originX + b.facing * 1090 * t; b.y = GROUND - Math.abs(Math.sin(t * Math.PI * 2)) * 275;
        b.trail -= dt;
        if (b.trail <= 0 && t < .96) { b.trail = .2; this.blooms.push({ x: b.x, y: b.y - 25, radius: CONFIG.bloomRadius[b.phase], age: 0, exploded: false, touched: false }); }
        if (t === 1) this.endAttack(1.25);
      } else if (b.state === 'flowers') {
        const count = CONFIG.flowerCounts[b.phase], interval = CONFIG.flowerIntervals[b.phase];
        while (b.shots < count && b.time >= b.shots * interval) {
          this.aim('flower', b.x, b.y - 65, p.x, p.y - 48, b.phase === 1 ? 335 : 300, { homing: b.phase >= 2, life: 6 }); b.shots++;
        }
        if (b.time > (count - 1) * interval + .85) this.endAttack(1.15);
      } else if (b.state === 'cat' || b.state === 'rabbit') {
        if (b.time > .6) this.endAttack(.85);
      } else if (b.state === 'rain') {
        if (!this.hat) this.endAttack(1.2);
      } else if (b.state === 'ricochet') {
        while (b.shots < CONFIG.ricochetWaves * CONFIG.ricochetPerWave && b.time >= Math.floor(b.shots / CONFIG.ricochetPerWave) * CONFIG.ricochetInterval) {
          const index = b.shots % CONFIG.ricochetPerWave, wave = Math.floor(b.shots / CONFIG.ricochetPerWave), angle = (b.facing > 0 ? -.36 : Math.PI + .36) + (index - (CONFIG.ricochetPerWave - 1) / 2) * .22;
          this.spawnProjectile('rose', b.x, b.y - 65, Math.cos(angle) * (280 + wave * 12), Math.sin(angle) * 300, { life: 5 }); b.shots++;
        }
        if (this.umbrella && this.umbrella.returned) { this.umbrella = null; this.endAttack(1.4); }
      }
      b.x = clamp(b.x, 65, 1215);
    }
    updateHat(dt) {
      const h = this.hat;
      if (!h) return;
      h.time += dt; h.fire -= dt;
      if (h.mode === 'center') {
        h.y = move(h.y, 330, 240 * dt);
        if (this.resting()) { h.fire += dt; return; }
        if (h.fire <= 0) {
          h.fire += CONFIG.centerHatInterval;
          for (const corner of CORNERS) this.aim('dagger', h.x, h.y, corner.x, corner.y === GROUND ? GROUND - 15 : 125, 290, { life: 5 });
        }
      } else if (h.returning) {
        const b = this.boss;
        h.x = move(h.x, b.x, 850 * dt); h.y = move(h.y, b.y - 128, 850 * dt);
        if (Math.hypot(h.x - b.x, h.y - (b.y - 128)) < 5) { b.hatOn = true; this.hat = null; this.events.push({ type: 'sfx', cue: 'hatReturn', x: b.x }); }
      } else if (h.waves < 3 && h.fire <= 0) {
        h.x = h.waves === 2 ? WIDTH / 2 : clamp(this.player.x, 145, 1135); h.fire += CONFIG.rainInterval; h.waves++; this.stats.rainWaves++; this.events.push({ type: 'sfx', cue: 'aliceRain', x: h.x });
        // Each volley locks once. Telegraph lanes are visible before daggers are released.
        if (h.waves < 3) {
          for (let i = 0; i < 5; i++) this.spawnProjectile('dagger', h.x + (i - 2) * 58, h.y + 20, h.waves === 2 ? (i % 2 ? -1 : 1) * 210 : 0, 370, { delay: .5, lane: true, life: 3.5, branch: h.waves === 2 ? 'diagonal' : 'vertical' });
        } else {
          h.y = 330;
          for (let i = 0; i < 8; i++) { const a = (i + .5) * Math.PI * 2 / 8; this.spawnProjectile('dagger', h.x, h.y, Math.cos(a) * 290, Math.sin(a) * 290, { delay: .5, lane: true, life: 3.5, branch: 'radial' }); }
        }
      } else if (h.waves === 3 && h.fire <= 0) h.returning = true;
    }
    updateUmbrella(dt) {
      const u = this.umbrella, b = this.boss;
      if (!u || u.returned) return;
      u.angle += dt * 7; u.contactCD = Math.max(0, u.contactCD - dt);
      if (u.returning) {
        u.x = move(u.x, b.x, 1000 * dt); u.y = move(u.y, b.y - 65, 1000 * dt);
        if (Math.hypot(u.x - b.x, u.y - (b.y - 65)) < 8) { u.returned = true; b.umbrellaOn = true; this.events.push({ type: 'sfx', cue: 'hatReturn', x: b.x }); }
        return;
      }
      u.x += u.vx * dt; u.y += u.vy * dt;
      for (const [axis, lo, hi, velocity] of [['x', 45, 1235, 'vx'], ['y', 110, GROUND - 35, 'vy']]) {
        if (u.bounces >= 10) break;
        if (u[axis] < lo || u[axis] > hi) {
          u[axis] = clamp(u[axis], lo, hi); u[velocity] *= -1; u.bounces++; this.stats.umbrellaBounces++; this.events.push({ type: 'sfx', cue: 'aliceBounce', x: u.x });
        }
      }
      if (u.bounces === 10) u.returning = true;
      if (u.contactCD === 0 && this.strike({ x: u.x - 30, y: u.y - 28, w: 60, h: 56 }, 24, u.x)) u.contactCD = .65;
    }
    updateSummons(dt) {
      for (const q of this.summons) {
        if (this.status !== 'fight') break;
        q.time += dt; q.life -= dt; q.contactCD = Math.max(0, q.contactCD - dt);
        if (!q.grounded) { q.vy += 1000 * dt; q.x += q.vx * dt; q.y += q.vy * dt; if (q.y >= GROUND) { q.y = GROUND; q.grounded = true; q.vy = 0; q.vx = q.kind === 'cat' ? CONFIG.catSpeed : 45; } }
        else {
          q.x += q.vx * dt;
          if (q.x < 90 || q.x > 1190) { q.x = clamp(q.x, 90, 1190); q.vx *= -1; }
          if (q.kind === 'cat') {
            if (q.contactCD === 0 && this.strike({ x: q.x - 25, y: q.y - 35, w: 50, h: 35 }, 8, q.x, true)) q.contactCD = 2.2;
          } else {
            if (this.resting()) continue;
            q.fire -= dt;
            if (q.fire <= 0) {
              q.fire += CONFIG.rabbitIntervals[this.boss.phase];
              const direction = this.player.x < q.x ? -1 : 1;
              for (let i = 0; i < CONFIG.rabbitCounts[this.boss.phase]; i++) this.spawnProjectile('candy', q.x, q.y - 30, direction * (210 + i * 70), -460 - i * 35, { gravity: 850, bounces: 0, damage: 14, life: 12 });
            }
          }
        }
      }
      this.summons = this.summons.filter(q => q.permanent || q.life > 0);
    }
    updateProjectiles(dt) {
      const p = this.player;
      this.projectiles = this.projectiles.filter(q => {
        if (this.status !== 'fight') return false;
        q.life -= dt;
        if (q.delay > 0) { q.delay = Math.max(0, q.delay - dt);
          if (q.delay === 0 && q.kind === 'dagger') this.events.push({ type: 'sfx', cue: 'aliceKnives', x: q.x });
          return q.life > 0; }
        if (q.homing) {
          const desired = Math.atan2(p.y - 48 - q.y, p.x - q.x), angle = Math.atan2(q.vy, q.vx);
          const difference = Math.atan2(Math.sin(desired - angle), Math.cos(desired - angle)), turned = angle + clamp(difference, -1.25 * dt, 1.25 * dt), speed = Math.hypot(q.vx, q.vy);
          q.vx = Math.cos(turned) * speed; q.vy = Math.sin(turned) * speed;
        }
        if (q.gravity) q.vy += q.gravity * dt;
        if (q.kind === 'card') { q.trail ||= []; q.trail.push({ x: q.x, y: q.y }); if (q.trail.length > 14) q.trail.shift(); }
        q.x += q.vx * dt; q.y += q.vy * dt;
        if (q.kind === 'card') {
          for (const [axis, lo, hi, velocity] of [['x', 35, WIDTH - 35, 'vx'], ['y', 90, GROUND - 15, 'vy']]) {
            if (q[axis] < lo || q[axis] > hi) { if (q.bounces >= CONFIG.cardBounces) return false; q[axis] = clamp(q[axis], lo, hi); q[velocity] *= -1; q.bounces++; }
          }
        }
        if (q.kind === 'candy' && q.y >= GROUND - 9 && q.vy > 0) {
          q.y = GROUND - 9;
          if (q.bounces < 3) { q.bounces++; this.stats.candyBounces++; this.events.push({ type: 'sfx', cue: 'candyBounce', x: q.x }); q.vy = -Math.max(175, Math.abs(q.vy) * .66); }
          else return false;
        }
        const r = q.kind === 'candy' || q.kind === 'card' ? 10 : 7;
        if (intersects(this.playerBox(), { x: q.x - r, y: q.y - r, w: r * 2, h: r * 2 })) { this.receiveBolt(q); return false; }
        return q.life > 0 && q.x > -45 && q.x < WIDTH + 45 && q.y > -50 && q.y < GROUND + 40;
      });
    }
    updateBlooms(dt) {
      for (const q of this.blooms) {
        q.age += dt;
        if (q.age >= .7) {
          if (!q.exploded) this.events.push({ type: 'sfx', cue: 'aliceBloom', x: q.x });
          q.exploded = true;
          const box = this.playerBox(), radius = q.radius ?? CONFIG.bloomRadius[this.boss.phase];
          const closestX = clamp(q.x, box.x, box.x + box.w), closestY = clamp(q.y, box.y, box.y + box.h);
          if (!q.touched && q.age <= .95 && Math.hypot(q.x - closestX, q.y - closestY) <= radius) {
            this.receiveBolt({ vx: this.player.x < q.x ? -1 : 1, damage: 22 }); q.touched = true;
          }
        }
      }
      this.blooms = this.blooms.filter(q => q.age < 1.1);
    }
    updateWorld(dt) {
      this.worldElapsed += dt;
      if (this.status !== 'fight') return;
      this.updateBoss(dt);
      if (this.heart) this.heart.flash = Math.max(0, this.heart.flash - dt);
      else if (this.boss.phase >= 2) { this.heartTimer -= dt; if (this.heartTimer <= 0 && ['idle', 'recover'].includes(this.boss.state)) this.spawnHeart(); }
      for (const update of ['updateButterflies', 'updateHat', 'updateUmbrella', 'updateSummons', 'updateProjectiles', 'updateBlooms']) {
        if (this.status !== 'fight') break;
        this[update](dt);
      }
    }
    update(input = {}, dt = E.STEP) {
      dt = Math.min(dt, .05);
      if (this.status === 'intro' || this.status === 'outro' || this.status === 'lost' || this.status === 'won') return;
      if (this.status === 'departing') {
        this.departureTime += dt; this.boss.x = move(this.boss.x, WIDTH + 150, dt * 350);
        if (this.boss.x >= WIDTH + 150) { this.status = 'won'; this.events.push({ type: 'departed' }); }
        return;
      }
      if (this.status === 'transition') {
        this.transitionTime += dt;
        if (this.hat) { this.hat.y = move(this.hat.y, 330, 220 * dt); this.hat.time += dt; }
        if (this.transitionTime >= 1.65) {
          this.status = 'fight'; this.boss.state = 'idle'; this.checkPhase();
          if (this.status === 'fight') this.spawnHeart();
        }
        return;
      }
      this.bindTimer = Math.max(0, this.bindTimer - dt);
      const bound = this.bindTimer > 0, x = this.player.x, y = this.player.y;
      super.update(bound ? { ...input, left: false, right: false, up: false, jump: false, dash: false } : input, dt);
      if (bound && this.status === 'fight') { this.player.x = x; this.player.y = y; this.player.vx = 0; this.player.vy = 0; this.jumpBuffer = 0; }
    }
    snapshot() {
      return { ...super.snapshot(), encounter: this.status, boss: { ...this.boss, strikes: [...this.boss.strikes] }, playerHP: this.player.hp, bind: this.bindTimer, heart: this.heart ? { ...this.heart } : null, butterflyClouds: this.butterflyClouds.map(q => ({ ...q })), thorns: this.thorns.map(q => ({ ...q })), summons: this.summons.map(q => ({ ...q })), blooms: this.blooms.map(q => ({ ...q })), hat: this.hat ? { ...this.hat } : null, umbrella: this.umbrella ? { ...this.umbrella } : null, stats: JSON.parse(JSON.stringify(this.stats)) };
    }
  }
  const api = { Challenge, CONFIG, LABELS, ROTATIONS, CORNERS, HEART_CORNERS, segmentHitsBox };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.AliceBoss = api;
})(typeof window !== 'undefined' ? window : globalThis);
