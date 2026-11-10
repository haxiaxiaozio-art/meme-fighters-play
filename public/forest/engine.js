(function (root) {
  'use strict';
  const S = typeof module !== 'undefined' && module.exports ? require('./sprites.js') : root.SwordSprites;
  const C = typeof module !== 'undefined' && module.exports ? require('./combat-config.js') : root.ForestCombatConfig;
  const GROUND = 590, WIDTH = 1280, STEP = 1 / 120, JUMP_SPEED = C.movement.jumpSpeed, AIR_JUMP_SPEED = C.movement.airJumpSpeed;
  const DEFENSE_COOLDOWN = .55, REWARD_DURATION = 2, REWARD_SCALE = C.time.enemy, COUNTER_SCALE = C.time.counter, PLAYER_SCALE = C.time.player;
  const WEAPONS = Object.freeze({
    sword: Object.freeze({ label: '剑', attackDuration: 1, damageScale: 1, rangeScale: 1, guard: 18 / 60, counterGuard: 14 / 60, airEvade: 12 / 60, reward: 2, counterReward: 2.5, evadeMove: 0, moveSpeed: 310 }),
    dagger: Object.freeze({ label: '匕首', attackDuration: .62, damageScale: .8, rangeScale: .68, guard: 10 / 60, counterGuard: 8 / 60, airEvade: 24 / 60, reward: 3.2, counterReward: 3.8, evadeMove: 320, moveSpeed: 340 }),
    staff: Object.freeze({ label: '法杖', attackDuration: C.staff.attackDuration, damageScale: C.staff.damageScale, rangeScale: C.staff.rangeScale, guard: 18 / 60, counterGuard: 14 / 60, airEvade: 12 / 60, reward: 2, counterReward: 2.5, evadeMove: 0, moveSpeed: 290 })
  });
  const ABILITIES = {
    specialNeutral: { label: '回旋斩', keys: 'L', cooldown: .9 },
    specialUp: { label: '升龙斩', keys: '↑ L', cooldown: .9 },
    specialDown: { label: '落剑震击', keys: '↓ L', cooldown: .9 },
    specialSide: { label: '突进斩', keys: '↔ L', cooldown: .9 },
    dashAttack: { label: '疾步斩', keys: 'K → J', cooldown: .7, requiresDash: true },
    specialDash: { label: '破风斩', keys: 'K → L', cooldown: 1.6, requiresDash: true },
    dash: { label: '冲刺', keys: 'K', cooldown: .5 },
    defense: { label: '格挡 / 回避', keys: 'F', cooldown: DEFENSE_COOLDOWN },
    daggerSpecial: { label: '往返影刃', cooldown: 1.2, hidden: true },
    staffHeal: { label: '森林祈愈', cooldown: C.staff.healCooldown, hidden: true },
    staffPurge: { label: '净空圆环', cooldown: C.staff.purgeCooldown, hidden: true }
  };
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const approach = (v, target, step) => v < target ? Math.min(v + step, target) : Math.max(v - step, target);
  const intersects = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  const isAttack = name => !!S.animations[name].damage;
  const isCombo = name => /^attack[123]$/.test(name);
  const isCasting = name => name === 'staffHeal' || name === 'staffPurge';
  class Practice {
    constructor() { this.reset(); }
    reset() {
      this.player = { x: 420, y: GROUND, vx: 0, vy: 0, facing: 1, grounded: true, jumpsUsed: 0, weapon: 'sword', actionWeapon: 'sword', action: 'idle', time: 0, invulnerable: 0, phaseTimer: 0, boostTimer: 0, switchCooldown: 0, cooldowns: Object.fromEntries(Object.keys(ABILITIES).map(id => [id, 0])) };
      this.dummy = { x: 910, y: GROUND, w: 56, h: 100, flash: 0, sway: 0, windup: 0, attackTimer: 3.2 };
      this.elapsed = 0; this.hits = 0; this.totalDamage = 0; this.events = []; this.particles = []; this.ghosts = [];
      this.shockwave = 0; this.hitStop = 0; this.shake = 0; this.comboQueued = false; this.comboGrace = 0; this.lastCombo = 0;
      this.hasHit = false; this.launched = false; this.impacted = false; this.jumpBuffer = 0;
      this.rewardTimer = 0; this.rewardFlash = 0; this.worldElapsed = 0; this.worldScale = 1;
      this.projectiles = []; this.autoAttacks = false; this.blocks = 0; this.evades = 0; this.received = 0;
      this.combo = 0; this.maxCombo = 0; this.comboTimer = 0; this.pendingCommand = null;
      this.rewardDuration = REWARD_DURATION; this.rewardScale = REWARD_SCALE;
      this.friendlyDaggers = []; this.switchFlash = 0; this.jumpEffect = null; this.magicEffect = null; this.castReleased = false; this.playerScale = 1;
      this.player.hp = 300; this.player.maxHP = 300;
    }
    weaponStats(weapon = this.player.weapon) { return WEAPONS[weapon]; }
    hasSkill(id) { return !this.skillGate || this.skillGate(id); }
    actionDuration(name = this.player.action, weapon = this.player.actionWeapon) {
      const stats = this.weaponStats(weapon);
      if (name === 'staffHeal') return C.staff.healWindup + .25;
      if (name === 'staffPurge') return C.staff.purgeWindup + .2;
      if (name === 'guard' || name === 'counterGuard' || name === 'airEvade') return stats[name];
      return S.animations[name].duration * (isAttack(name) ? stats.attackDuration : 1);
    }
    playerFrame() { return S.frameAt(this.player.action, this.player.time / this.actionDuration() * S.animations[this.player.action].duration); }
    attackDamage(base, weapon = this.player.actionWeapon) { return Math.round(base * this.weaponStats(weapon).damageScale * (this.player.boostTimer > 0 ? 1.5 : 1)); }
    switchWeapon() {
      const p = this.player;
      if (p.action === 'hurt' || p.switchCooldown > 0) return false;
      const weapons = this.availableWeapons?.() ?? Object.keys(WEAPONS);
      if (weapons.length < 2) return false;
      p.weapon = weapons[(weapons.indexOf(p.weapon) + 1) % weapons.length];
      p.switchCooldown = .35; this.switchFlash = .28; this.comboGrace = 0; this.lastCombo = 0;
      this.setAction(p.grounded ? 'idle' : 'fall');
      this.events.push({ type: 'weaponSwitch', weapon: p.weapon });
      this.events.push({ type: 'notice', text: '切换 · ' + this.weaponStats().label });
      return true;
    }
    setAction(name) {
      const p = this.player; p.action = name; p.time = 0; p.actionWeapon = p.weapon;
      this.hasHit = false; this.launched = false; this.impacted = false;
      this.castReleased = false;
      this.comboQueued = false;
      this.pendingCommand = null;
      this.swingSoundFired = false;
      if (isCasting(name)) this.events.push({ type: 'castStart', action: name, weapon: p.actionWeapon, x: p.x });
    }
    abilityState(id) {
      const p = this.player, dagger = p.weapon === 'dagger', staff = p.weapon === 'staff';
      const directional = ['specialNeutral', 'specialUp', 'specialSide', 'specialDash'].includes(id);
      const resolved = staff && id === 'specialDown' ? 'staffPurge' : staff && directional ? 'staffHeal' : dagger && directional ? 'daggerSpecial' : id;
      const a = ABILITIES[resolved], free = false, remaining = p.cooldowns[resolved];
      const contextReady = (!ABILITIES[id].requiresDash || p.action === 'dash') && !(dagger && id === 'specialDown' && !p.grounded);
      const duration = !staff && id === 'specialDown' && p.grounded ? 1.2 : a.cooldown;
      const label = !staff && id === 'specialDown' && (p.grounded || dagger) ? '反击架势' : a.label;
      return { id: resolved, label, remaining, duration, free, contextReady, ready: remaining <= 0 && contextReady, visible: !ABILITIES[id].hidden && !((dagger || staff) && ['specialUp', 'specialSide', 'specialDash'].includes(id)) };
    }
    useAbility(id) {
      const state = this.abilityState(id);
      if (!this.hasSkill(state.id)) { this.events.push({type:'notice',text:'尚未解锁 · '+state.label}); return false; }
      if (state.remaining > 0) {
        this.events.push({ type: 'notice', text: state.label + '冷却中 · ' + state.remaining.toFixed(1) + 's' }); return false;
      }
      if (!state.contextReady) return false;
      this.player.cooldowns[state.id] = state.free ? 0 : state.duration;
      return true;
    }
    startDash(input) {
      const p = this.player, defensive = ['guard', 'counterGuard', 'parry', 'airEvade', 'hurt'].includes(p.action);
      if (!p.grounded && !this.hasSkill('airDash')) { this.events.push({type:'notice',text:'尚未解锁 · 空中冲刺'}); return; }
      if (!p.grounded && p.airDashSpent) return;
      if (p.action === 'hurt' || isCasting(p.action) || p.action.startsWith('special') || (defensive && this.rewardTimer <= 0) || !this.useAbility('dash')) return;
      const axis = Number(!!input.right) - Number(!!input.left);
      if (axis) p.facing = axis;
      this.setAction('dash'); p.vy = 0; p.vx = p.facing * 830;
      if (!p.grounded && p.airDashSpent !== undefined) p.airDashSpent = true;
      this.events.push({ type: 'dash' });
    }
    attack() {
      const p = this.player;
      if (!p.grounded && !this.hasSkill('airAttack')) { this.events.push({type:'notice',text:'尚未解锁 · 跳跃攻击'}); return; }
      const reward = this.rewardTimer > 0;
      if (p.action === 'hurt' || (isCasting(p.action) && !this.castReleased)) return;
      if (p.action === 'dash') {
        if (this.useAbility('dashAttack')) this.setAction('dashAttack');
        return;
      }
      if (isAttack(p.action) && reward && !this.canCancel()) {
        this.pendingCommand = { type: 'attack', ttl: .25 }; return;
      }
      if (isCombo(p.action) && !reward) { this.comboQueued = true; return; }
      if (!reward && (isAttack(p.action) || ['guard', 'counterGuard', 'parry', 'airEvade'].includes(p.action))) return;
      if (!p.grounded) this.setAction('airAttack');
      else {
        const next = reward && isCombo(p.action) ? Number(p.action.slice(-1)) % 3 + 1 : (this.comboGrace > 0 && this.lastCombo < 3 ? this.lastCombo + 1 : 1);
        this.setAction('attack' + next);
        p.vx = p.facing * 95;
      }
    }
    canCancel() {
      const p = this.player;
      if (isCasting(p.action)) return this.castReleased;
      return !isAttack(p.action) || this.hasHit || p.time / this.actionDuration() >= .3;
    }
    special(input) {
      const p = this.player;
      const reward = this.rewardTimer > 0;
      if (p.action === 'hurt' || (isCasting(p.action) && !this.castReleased) || (!reward && ['guard', 'counterGuard', 'parry', 'airEvade'].includes(p.action))) return;
      if (reward && !this.canCancel()) {
        this.pendingCommand = { type: 'special', input: { up: input.up, down: input.down, left: input.left, right: input.right }, ttl: .25 }; return;
      }
      if (p.weapon === 'staff') {
        const id = input.down && !input.up ? 'staffPurge' : 'staffHeal';
        if (id === 'staffHeal' && p.hp >= p.maxHP) { this.events.push({ type: 'notice', text: '生命已满' }); return; }
        if (this.useAbility(id)) { this.setAction(id); p.vx = 0; this.events.push({ type: 'notice', text: ABILITIES[id].label + ' · 施法中' }); }
        return;
      }
      // Grounded down-special prepares a counter for blades; the staff clears bullets.
      if (input.down && !input.up && p.grounded) {
        if (!this.useAbility('specialDown')) return;
        const axis = Number(!!input.right) - Number(!!input.left); if (axis) p.facing = axis;
        this.setAction('counterGuard'); p.vx = 0;
        this.events.push({ type: 'guard' }, { type: 'notice', text: '反击架势 · 挡住正面攻击后自动反击' }); return;
      }
      if (p.weapon === 'dagger') { this.castDaggers(input); return; }
      const action = p.action === 'dash' ? 'specialDash' : input.up ? 'specialUp' : input.down ? 'specialDown' : input.left !== input.right && (input.left || input.right) ? 'specialSide' : 'specialNeutral';
      if (!this.useAbility(action)) return;
      const horizontal = Number(!!input.right) - Number(!!input.left);
      if (horizontal && action !== 'specialDash') p.facing = horizontal;
      this.setAction(action);
      if (action === 'specialDown') {
        if (p.grounded) { p.vy = -260; p.grounded = false; p.jumpsUsed = Math.max(1, p.jumpsUsed); }
      }
      this.events.push({ type: 'notice', text: S.animations[p.action].label });
    }
    castDaggers(input) {
      if (!this.useAbility('daggerSpecial')) return;
      const p = this.player, dashing = p.action === 'dash';
      let dx = dashing ? p.facing : Number(!!input.right) - Number(!!input.left);
      const dy = dashing ? 0 : (input.up ? -1 : input.down ? 1 : 0);
      if (!dx && !dy) dx = p.facing;
      if (dx && !dashing) p.facing = Math.sign(dx);
      const length = Math.hypot(dx, dy) || 1;
      p.phaseTimer = .45; p.boostTimer = 3;
      this.friendlyDaggers.push({ x: p.x + p.facing * 23, y: p.y - 50, vx: dx / length * 860, vy: dy / length * 860, time: 0, life: 2, returning: false, hitOut: false, hitReturn: false, damage: 27 });
      this.setAction('daggerSpecial'); this.events.push({ type: 'daggerCast', x: p.x, y: p.y - 50 });
      this.events.push({ type: 'notice', text: '往返影刃 · 虚化 0.45s / 攻击增伤 50% · 3s' });
    }
    releaseStaffSpell() {
      const p = this.player; this.castReleased = true;
      if (p.action === 'staffHeal') {
        const healed = Math.min(C.staff.heal, Math.max(0, p.maxHP - p.hp)); p.hp += healed;
        this.magicEffect = { kind: 'heal', x: p.x, y: p.y - 45, radius: 50, life: .6 };
        this.events.push({ type: 'heal', amount: healed }, { type: 'notice', text: '森林祈愈 · +' + healed + ' HP' });
      } else {
        const x = p.x, y = p.y - 45, radius = C.staff.purgeRadius;
        const outside = q => Math.hypot(q.x - x, q.y - y) > radius;
        // Capture display coordinates before removal; the clear predicate and damage rules are unchanged.
        const cleared = [...this.projectiles, ...(this.blooms || []), ...(this.butterflyClouds || [])].filter(q => !outside(q)).map(q => ({ x: q.x, y: q.y }));
        const before = this.projectiles.length; this.projectiles = this.projectiles.filter(outside);
        if (this.blooms) this.blooms = this.blooms.filter(outside);
        if (this.butterflyClouds) this.butterflyClouds = this.butterflyClouds.filter(outside);
        this.magicEffect = { kind: 'purge', x, y, radius, life: .6 };
        this.events.push({ type: 'purge', count: before - this.projectiles.length, cleared }, { type: 'notice', text: '净空圆环 · 清除周围弹幕' });
      }
    }
    updateFriendlyDaggers(dt) {
      const active = [];
      for (const q of this.friendlyDaggers) {
        const oldX = q.x, oldY = q.y; q.time += dt; q.life -= dt;
        if (!q.returning && (q.time >= .42 || q.x < 30 || q.x > (this.level?.width ?? WIDTH) - 30 || q.y < 30 || q.y > (this.level?.height ?? GROUND) - 8)) q.returning = true;
        let caught = false;
        if (q.returning) {
          const dx = this.player.x - q.x, dy = this.player.y - 50 - q.y, distance = Math.hypot(dx, dy);
          if (distance <= 940 * dt + 10) { q.x = this.player.x; q.y = this.player.y - 50; caught = true; }
          else { q.vx = dx / distance * 940; q.vy = dy / distance * 940; q.x += q.vx * dt; q.y += q.vy * dt; }
        } else { q.x += q.vx * dt; q.y += q.vy * dt; }
        const key = q.returning ? 'hitReturn' : 'hitOut';
        if (!q[key] && this.damageProjectile({ x: Math.min(oldX, q.x) - 10, y: Math.min(oldY, q.y) - 6, w: Math.abs(q.x - oldX) + 20, h: Math.abs(q.y - oldY) + 12 }, q.damage)) q[key] = true;
        if (this.status && this.status !== 'fight') { this.friendlyDaggers = []; return; }
        if (!caught && q.life > 0) active.push(q);
      }
      this.friendlyDaggers = active;
    }
    defend(input) {
      const p = this.player;
      if (p.action === 'hurt' || !this.useAbility('defense')) return;
      const axis = Number(!!input.right) - Number(!!input.left);
      if (axis) p.facing = axis;
      const airborne = !p.grounded;
      this.setAction(airborne ? 'airEvade' : 'guard');
      p.vx = 0;
      if (airborne) { p.vy = 0; this.ghosts = []; }
      this.events.push({ type: airborne ? 'evade' : 'guard' });
    }
    requestShot() {
      if (this.dummy.windup > 0) return;
      this.dummy.windup = .55;
      this.events.push({ type: 'charge' });
    }
    setAutoAttacks(enabled) {
      this.autoAttacks = !!enabled; this.dummy.attackTimer = 1.2;
    }
    awardParry(counter = false) {
      const stats = this.weaponStats(this.player.actionWeapon);
      this.blocks++; this.rewardDuration = counter ? stats.counterReward : stats.reward;
      this.rewardTimer = this.rewardDuration; this.rewardFlash = .4; this.rewardScale = counter ? COUNTER_SCALE : REWARD_SCALE;
      this.worldScale = this.rewardScale; this.playerScale = PLAYER_SCALE; this.comboTimer = Math.max(this.comboTimer, this.rewardDuration + .2);
      this.player.invulnerable = .18;
      this.setAction(counter ? 'riposte' : 'parry');
      if (counter) this.player.invulnerable = this.actionDuration() / PLAYER_SCALE + .05;
      this.hitStop = .035;
      this.events.push({ type: 'parry', x: this.player.x, y: this.player.y - 50 });
      if (counter) this.events.push({ type: 'counter' });
      this.events.push({ type: 'notice', text: counter ? '格挡反击 · 双方减速 / 技能保留CD' : '格挡成功 · 双方减速 / 技能保留CD' });
    }
    receiveBolt(bolt) {
      const p = this.player;
      if (p.action === 'airEvade') { this.evades++; this.events.push({ type: 'evaded' }); return; }
      const inFront = p.facing === -Math.sign(bolt.vx);
      if (['guard', 'counterGuard'].includes(p.action) && p.grounded && p.time < this.actionDuration() && inFront) { this.awardParry(p.action === 'counterGuard'); return; }
      if (p.invulnerable > 0 || p.phaseTimer > 0) return;
      this.received++; this.rewardTimer = 0; this.worldScale = 1; this.playerScale = 1; this.combo = 0; this.comboTimer = 0;
      this.setAction('hurt'); p.invulnerable = .65; p.vx = Math.sign(bolt.vx) * 180;
      this.hitStop = .05; this.shake = 5;
      this.events.push({ type: 'hurt' });
      this.events.push({ type: 'notice', text: '受到练习弹攻击 · 面向弹丸，接近时按防御键格挡' });
    }
    updateWorld(dt) {
      const d = this.dummy, p = this.player;
      this.worldElapsed += dt;
      if (this.autoAttacks && d.windup <= 0) {
        d.attackTimer -= dt;
        if (d.attackTimer <= 0) { this.requestShot(); d.attackTimer = 3.2; }
      }
      if (d.windup > 0) {
        d.windup = Math.max(0, d.windup - dt);
        if (d.windup === 0) {
          const direction = p.x < d.x ? -1 : 1, x = d.x + direction * 38, y = d.y - 62;
          const dx = p.x - x, dy = p.y - 49 - y, length = Math.hypot(dx, dy) || 1;
          this.projectiles.push({ x, y, vx: dx / length * 390, vy: dy / length * 390, life: 5 });
          this.events.push({ type: 'shot' });
        }
      }
      const playerBox = { x: p.x - 19, y: p.y - 86, w: 38, h: 84 };
      this.projectiles = this.projectiles.filter(bolt => {
        bolt.x += bolt.vx * dt; bolt.y += bolt.vy * dt; bolt.life -= dt;
        if (intersects(playerBox, { x: bolt.x - 8, y: bolt.y - 8, w: 16, h: 16 })) { this.receiveBolt(bolt); return false; }
        return bolt.life > 0 && bolt.x > -30 && bolt.x < WIDTH + 30 && bolt.y < GROUND + 25 && bolt.y > -30;
      });
    }
    damageTarget(box, impact = false) {
      if (this.hasHit) return;
      const d = this.dummy;
      if (!intersects(box, { x: d.x - d.w / 2, y: d.y - d.h, w: d.w, h: d.h })) return;
      this.hasHit = true;
      this.hitDummy(this.attackDamage(S.animations[this.player.action].damage || 30), impact);
    }
    damageProjectile(box, damage) {
      const d = this.dummy;
      if (!intersects(box, { x: d.x - d.w / 2, y: d.y - d.h, w: d.w, h: d.h })) return false;
      this.hitDummy(damage, false, 'dagger'); return true;
    }
    hitDummy(damage, impact, weapon = this.player.actionWeapon) {
      const d = this.dummy; this.hits++;
      this.totalDamage += damage; d.flash = .16; d.sway = this.player.facing * 10;
      this.combo++; this.maxCombo = Math.max(this.maxCombo, this.combo);
      this.comboTimer = Math.max(1.2, this.rewardTimer + .2);
      this.hitStop = impact ? .06 : .035; this.shake = impact ? 6 : 3;
      this.events.push({ type: 'hit', weapon, target: 'dummy', x: d.x, y: d.y - d.h - 15, damage, fx: { x: d.x, y: d.y - 60, impact } });
      for (let i = 0; i < 15; i++) this.particles.push({ x: d.x, y: d.y - 60, vx: (Math.random() - .5) * 330, vy: -Math.random() * 240, life: .35 + Math.random() * .2, color: i % 2 ? '#efdb95' : '#a8d1a6' });
    }
    movePlayer(dt) {
      const p=this.player; p.x=clamp(p.x+p.vx*dt,55,WIDTH-55);p.y+=p.vy*dt;
      if(p.y>=GROUND){const landed=!p.grounded;p.y=GROUND;p.vy=0;p.grounded=true;p.jumpsUsed=0;return landed;}return false;
    }
    update(input = {}, dt = STEP) {
      dt = Math.min(dt, .05);
      const p = this.player;
      // Reward, cooldowns and temporary buffs use real time; both sides' actions use their own scale.
      this.rewardTimer = Math.max(0, this.rewardTimer - dt); this.rewardFlash = Math.max(0, this.rewardFlash - dt);
      this.worldScale = this.rewardTimer > 0 ? this.rewardScale : 1;
      this.playerScale = this.rewardTimer > 0 ? PLAYER_SCALE : 1;
      this.comboTimer = Math.max(0, this.comboTimer - dt); if (this.comboTimer === 0) this.combo = 0;
      p.invulnerable = Math.max(0, p.invulnerable - dt);
      p.phaseTimer = Math.max(0, p.phaseTimer - dt); p.boostTimer = Math.max(0, p.boostTimer - dt);
      p.switchCooldown = Math.max(0, p.switchCooldown - dt); this.switchFlash = Math.max(0, this.switchFlash - dt);
      if (this.jumpEffect) { this.jumpEffect.life -= dt; if (this.jumpEffect.life <= 0) this.jumpEffect = null; }
      if (this.magicEffect) { this.magicEffect.life -= dt; if (this.magicEffect.life <= 0) this.magicEffect = null; }
      for (const id of Object.keys(p.cooldowns)) p.cooldowns[id] = Math.max(0, p.cooldowns[id] - dt);
      if (this.pendingCommand) { this.pendingCommand.ttl -= dt; if (this.pendingCommand.ttl <= 0 || this.rewardTimer <= 0) this.pendingCommand = null; }
      if (input.switchWeapon) this.switchWeapon();
      if (input.defense) this.defend(input);
      if (input.trainingShot) this.requestShot();
      if (input.dash && !input.defense) this.startDash(input);
      if (input.special && !input.defense) this.special(input);
      this.updateWorld(dt * this.worldScale);
      this.updateFriendlyDaggers(dt * this.playerScale);
      // Buffer button edges even during impact freeze so a combo input is never dropped.
      if (input.jump) this.jumpBuffer = .12;
      if (this.hitStop > 0) {
        if (input.attack && !input.special && !input.defense) this.attack();
        this.hitStop = Math.max(0, this.hitStop - dt); return;
      }
      this.comboGrace = Math.max(0, this.comboGrace - dt); this.jumpBuffer = Math.max(0, this.jumpBuffer - dt);
      dt *= this.playerScale; this.elapsed += dt;
      this.dummy.flash = Math.max(0, this.dummy.flash - dt); this.dummy.sway *= Math.exp(-dt * 11);
      this.shake *= Math.exp(-dt * 20); this.shockwave = Math.max(0, this.shockwave - dt);
      const axis = Number(!!input.right) - Number(!!input.left);
      const defensive = ['guard', 'counterGuard', 'parry', 'airEvade', 'hurt'].includes(p.action);
      if (!isAttack(p.action) && p.action !== 'dash' && !defensive && !(p.wallKick > 0) && axis) p.facing = axis;
      const canJump = !isCasting(p.action) && (p.grounded ? !isAttack(p.action) && p.action !== 'dash' && (!defensive || this.rewardTimer > 0) : p.jumpsUsed < (this.hasSkill('doubleJump') ? 2 : 1) && !defensive);
      const wallJumped = this.jumpBuffer > 0 && !input.defense && this.tryWallJump?.(axis);
      if (!wallJumped && this.jumpBuffer > 0 && canJump && !input.defense) {
        const second = !p.grounded;
        p.jumpsUsed = second ? 2 : 1; p.vy = second ? -AIR_JUMP_SPEED : -JUMP_SPEED; p.grounded = false; this.setAction('jump'); this.jumpBuffer = 0;
        if (second) this.jumpEffect = { x: p.x, y: p.y + 7, life: .28 };
        this.events.push({ type: second ? 'doubleJump' : 'jump' });
      }
      // Resolve jump before attack, so simultaneous inputs produce an aerial slash.
      if (input.attack && !input.special && !input.defense) this.attack();
      p.time += dt;
      if (isCasting(p.action) && !this.castReleased && p.time >= (p.action === 'staffHeal' ? C.staff.healWindup : C.staff.purgeWindup)) this.releaseStaffSpell();
      const a = S.animations[p.action], duration = this.actionDuration(), t = p.time / duration;
      // Sound follows action time, including weapon speed and bullet time; canceled windups stay silent.
      if (isAttack(p.action) && !this.swingSoundFired && t >= .18) {
        this.swingSoundFired = true; this.events.push({ type: 'swing', action: p.action, weapon: p.actionWeapon, x: p.x });
      }
      if (p.action === 'airEvade') {
        const speed = this.weaponStats(p.actionWeapon).evadeMove;
        p.vx = speed ? approach(p.vx, axis * speed, 2600 * dt) : 0; p.vy = 0;
        if (axis && speed) p.facing = axis;
      } else if (p.action === 'guard' || p.action === 'counterGuard' || p.action === 'parry') {
        p.vx = 0;
      } else if (p.action === 'hurt') {
        p.vx = approach(p.vx, 0, 800 * dt);
      } else if (p.action === 'dash') {
        p.vx = p.facing * 830; p.vy = 0;
        if (Math.floor(p.time / .035) !== Math.floor((p.time - dt) / .035)) this.ghosts.push({ x: p.x, y: p.y, facing: p.facing, name: p.action, frame: S.frameAt(p.action, p.time), life: .2 });
      } else if (p.action === 'dashAttack') {
        p.vx = t < .45 ? p.facing * 520 : approach(p.vx, 0, 2600 * dt);
      } else if (p.action === 'specialDash') {
        p.vx = p.facing * (t > .1 && t < .45 ? 900 : 80);
        if (t > .1 && t < .45 && Math.floor(p.time / .04) !== Math.floor((p.time - dt) / .04)) this.ghosts.push({ x: p.x, y: p.y, facing: p.facing, name: p.action, frame: S.frameAt(p.action, p.time), life: .16 });
      } else if (p.action === 'specialSide') {
        p.vx = p.facing * (t > .2 && t < .62 ? 740 : 50);
      } else if (p.wallKick > 0 && p.action === 'jump') {
        p.wallKick = Math.max(0, p.wallKick - dt);
      } else {
        const locked = isAttack(p.action);
        p.vx = approach(p.vx, axis * (locked ? 35 : this.weaponStats().moveSpeed), (locked ? 1100 : 2400) * dt);
      }
      if (p.action === 'specialUp' && t >= .18 && !this.launched) {
        p.vy = -700; p.grounded = false; p.jumpsUsed = Math.max(1, p.jumpsUsed); this.launched = true;
      }
      if (p.action === 'specialDown' && t >= .24 && !p.grounded) p.vy = 1050;
      if (!p.grounded && p.action !== 'dash' && p.action !== 'airEvade') {
        p.vy = Math.min(p.vy + C.movement.gravity * dt, 1100);
        if (!input.jumpHeld && p.action === 'jump' && p.vy < -240) p.vy = -240;
      }
      this.updateWallSlide?.(axis,dt);
      const landed = this.movePlayer(dt);
      if (p.grounded && p.airDashSpent !== undefined) p.airDashSpent = false;
      if (landed) {
          this.events.push({ type: 'land' });
          if (p.action === 'specialDown' && !this.impacted) {
            this.impacted = true; this.shockwave = .4; this.shake = 5;
            // Impact is independent of the sword's aerial hit box.
            this.damageTarget({ x: p.x - 145, y: p.y - 120, w: 290, h: 125 }, true);
            p.time = Math.max(p.time, a.duration * .62);
            this.events.push({ type: 'slam', x: p.x });
          } else if (p.action === 'fall' || p.action === 'jump') this.setAction('land');
      }
      if (isAttack(p.action)) {
        const current = S.animations[p.action], phase = p.time / this.actionDuration();
        if (phase >= .28 && phase <= .68) {
          const range = current.range * this.weaponStats(p.actionWeapon).rangeScale;
          let box = { x: p.facing > 0 ? p.x - 8 : p.x - range, y: p.y - 95, w: range + 8, h: 100 };
          if (p.action === 'specialNeutral') box = { x: p.x - range, y: p.y - 100, w: range * 2, h: 115 };
          if (p.action === 'specialUp') box.y -= 35;
          if (p.action === 'specialDown') box = { x: p.x - 30, y: p.y - 15, w: 60, h: 80 };
          this.damageTarget(box);
        }
        if (isCombo(p.action) && this.comboQueued && phase >= .8) {
          const stage = Number(p.action.slice(-1));
          if (stage < 3 && p.grounded) { this.setAction('attack' + (stage + 1)); p.vx = p.facing * 110; }
        }
      }
      if (this.pendingCommand && this.rewardTimer > 0 && this.canCancel()) {
        const command = this.pendingCommand; this.pendingCommand = null;
        if (command.type === 'attack') this.attack(); else this.special(command.input);
      }
      if (!S.animations[p.action].loop && p.time >= this.actionDuration()) {
        if (p.action === 'dash' && this.inputDashRecovery) p.vx = axis * this.weaponStats().moveSpeed;
        if (isCombo(p.action)) { this.lastCombo = Number(p.action.slice(-1)); this.comboGrace = .26; }
        this.setAction(p.grounded ? (axis ? 'run' : 'idle') : (p.vy < 0 ? 'jump' : 'fall'));
      }
      if (['idle', 'run', 'jump', 'fall'].includes(p.action)) {
        const desired = p.grounded ? (axis ? 'run' : 'idle') : (p.vy < 0 ? 'jump' : 'fall');
        if (p.action !== desired) this.setAction(desired);
      }
      for (const q of this.particles) { q.x += q.vx * dt; q.y += q.vy * dt; q.vy += 500 * dt; q.life -= dt; }
      this.particles = this.particles.filter(q => q.life > 0);
      for (const q of this.ghosts) q.life -= dt;
      this.ghosts = this.ghosts.filter(q => q.life > 0);
    }
    drainEvents() { return this.events.splice(0); }
    snapshot() {
      return { player: { ...this.player, cooldowns: { ...this.player.cooldowns } }, abilities: Object.fromEntries(Object.keys(ABILITIES).map(id => [id, this.abilityState(id)])), hits: this.hits, damage: this.totalDamage, frame: this.playerFrame(), actionDuration: this.actionDuration(), reward: this.rewardTimer, rewardDuration: this.rewardDuration, rewardScale: this.rewardScale, playerScale: this.playerScale, magicEffect: this.magicEffect ? { ...this.magicEffect } : null, switchFlash: this.switchFlash, friendlyDaggers: this.friendlyDaggers.map(q => ({ ...q })), worldScale: this.worldScale, worldTime: this.worldElapsed, blocks: this.blocks, evades: this.evades, received: this.received, combo: this.combo, maxCombo: this.maxCombo, autoAttacks: this.autoAttacks, projectiles: this.projectiles.map(b => ({ ...b })), windup: this.dummy.windup };
    }
  }
  const api = { Practice, GROUND, WIDTH, STEP, JUMP_SPEED, AIR_JUMP_SPEED, intersects, REWARD_DURATION, REWARD_SCALE, COUNTER_SCALE, PLAYER_SCALE, DEFENSE_COOLDOWN, ABILITIES, WEAPONS };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.ForestEngine = api;
})(typeof window !== 'undefined' ? window : globalThis);
