(function (root) {
  'use strict';
  const CELL_W = 256, CELL_H = 256, ORIGIN_X = 128, ORIGIN_Y = 163;
  const animations = {
    idle: { count: 8, duration: 1.2, loop: true, label: '待机' },
    run: { count: 8, duration: .58, loop: true, label: '奔跑' },
    jump: { count: 4, duration: .3, label: '跳跃' },
    fall: { count: 4, duration: .3, loop: true, label: '下落' },
    dash: { count: 6, duration: .22, label: '冲刺' },
    attack1: { count: 12, duration: .44, label: '一式 · 横斩', damage: 10, range: 105 },
    attack2: { count: 12, duration: .44, label: '二式 · 逆斩', damage: 14, range: 108 },
    attack3: { count: 12, duration: .52, label: '三式 · 突刺', damage: 22, range: 130 },
    airAttack: { count: 10, duration: .42, label: '空中斩', damage: 16, range: 112 },
    specialNeutral: { count: 12, duration: .64, label: '回旋斩', damage: 24, range: 135 },
    specialUp: { count: 12, duration: .66, label: '升龙斩', damage: 26, range: 105 },
    specialDown: { count: 12, duration: .7, label: '落剑震击', damage: 30, range: 145 },
    counterGuard: { count: 12, duration: 14 / 60, label: '反击架势' },
    riposte: { count: 12, duration: .48, label: '格挡反击', damage: 42, range: 170 },
    daggerSpecial: { count: 12, duration: .32, label: '往返影刃' },
    staffHeal: { count: 12, duration: .9, label: '森林祈愈' },
    staffPurge: { count: 12, duration: .42, label: '净空圆环' },
    specialSide: { count: 12, duration: .52, label: '突进斩', damage: 28, range: 130 },
    land: { count: 4, duration: .12, label: '落地' },
    guard: { count: 12, duration: 18 / 60, label: '格挡' },
    parry: { count: 6, duration: .16, label: '格挡成功' },
    airEvade: { count: 8, duration: 12 / 60, label: '空中回避' },
    hurt: { count: 6, duration: .24, label: '受击' },
    dashAttack: { count: 12, duration: .38, label: '疾步斩', damage: 18, range: 120 },
    specialDash: { count: 12, duration: .58, label: '破风斩', damage: 36, range: 160 }
  };
  Object.keys(animations).forEach((name, row) => { animations[name].row = row; });
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  const lerp = (a, b, t) => a + (b - a) * t;
  function keyframe(values, progress) {
    const x = progress * (values.length - 1), n = Math.floor(x);
    return lerp(values[n], values[Math.min(n + 1, values.length - 1)], x - n);
  }
  function frameAt(name, elapsed) {
    const a = animations[name] || animations.idle;
    const t = a.loop ? elapsed % a.duration : Math.min(elapsed, a.duration - .00001);
    return clamp(Math.floor(t / a.duration * a.count), 0, a.count - 1);
  }
  function poseAt(name, frame) {
    const a = animations[name], t = frame / Math.max(1, a.count - 1);
    const p = { tilt: 0, bob: 0, spread: 10, stride: 0, wristX: 21, wristY: -37, sword: 58, cape: 0, crouch: 0, trail: 0 };
    if (name === 'idle') { p.bob = Math.sin(t * Math.PI * 2) * 1.5; p.cape = Math.sin(t * Math.PI * 2) * 3; }
    if (name === 'run') {
      p.tilt = 9; p.stride = Math.sin(t * Math.PI * 2) * 22; p.bob = -Math.abs(Math.sin(t * Math.PI * 2)) * 4;
      p.wristX = 5 + Math.sin(t * Math.PI * 2) * 7; p.wristY = -37; p.sword = 152; p.cape = -18;
    }
    if (name === 'jump' || name === 'fall') {
      p.tilt = 3; p.stride = name === 'jump' ? 18 : -13; p.crouch = name === 'jump' ? 8 : 4;
      p.sword = name === 'jump' ? 38 : 58; p.cape = -14 + t * 10;
    }
    if (name === 'dash') { p.tilt = 27; p.crouch = 12; p.stride = 24; p.wristX = 0; p.wristY = -33; p.sword = 164; p.cape = -27; }
    if (name === 'land') { p.crouch = (1 - t) * 14; p.tilt = (1 - t) * 8; }
    if (name === 'guard' || name === 'parry') {
      p.sword = name === 'parry' ? keyframe([-93, -107, -110, -95, -92], t) : keyframe([35, -85, -94, -94, -94, -92], t);
      p.wristX = name === 'parry' ? 29 - Math.sin(t * Math.PI) * 5 : 29;
      p.wristY = -35; p.spread = 18; p.crouch = 7;
      p.tilt = name === 'parry' ? -Math.sin(t * Math.PI) * 12 : -4;
      p.cape = -6;
    }
    if (name === 'airEvade') {
      p.tilt = keyframe([0, -4, 2, -3, 0], t); p.stride = 0; p.spread = 8;
      p.crouch = keyframe([0, 10, 12, 12, 0], t);
      p.sword = -75; p.wristX = 16; p.wristY = -43; p.cape = Math.sin(t * Math.PI) * 3;
      p.turn = keyframe([1, .5, -.6, -.45, .55, 1], t); p.cape = Math.sin(t * Math.PI * 2) * 18;
      if (Math.abs(p.turn) < .3) p.turn = Math.sign(p.turn || 1) * .3;
    }
    if (name === 'hurt') {
      p.tilt = -Math.sin(t * Math.PI) * 22; p.crouch = 8;
      p.wristX = 5; p.wristY = -32; p.sword = 40; p.cape = 10;
    }
    if (name === 'dashAttack') {
      p.sword = keyframe([-145, -155, -116, -24, 28, 42, 58], t);
      p.wristX = keyframe([-7, -5, 17, 35, 31, 21], t); p.wristY = keyframe([-47, -61, -59, -45, -34, -37], t);
      p.tilt = keyframe([22, 25, 28, 17, 4, 0], t); p.spread = 24; p.crouch = 8; p.cape = -26;
      p.trail = frame >= 3 && frame <= 8 ? 1 : 0;
    }
    if (name === 'specialDash') {
      p.sword = keyframe([-142, -167, -171, -8, 0, 0, 30, 58], t);
      p.wristX = keyframe([-11, -12, 10, 42, 43, 31, 21], t); p.wristY = keyframe([-49, -50, -53, -49, -46, -37], t);
      p.tilt = keyframe([18, 24, 29, 26, 16, 0], t); p.spread = 26; p.crouch = 7; p.cape = -28;
      p.trail = frame >= 3 && frame <= 8 ? 2 : 0;
    }
    if (name === 'attack1') {
      p.sword = keyframe([-136, -155, -138, -75, 22, 40, 48, 62], t);
      p.wristX = keyframe([-12, -16, 2, 28, 29, 24], t); p.wristY = keyframe([-58, -70, -58, -45, -35], t);
      p.tilt = keyframe([-6, -10, 14, 16, 4, 0], t); p.spread = 19; p.cape = -15; p.trail = frame >= 4 && frame <= 7 ? 1 : 0;
    }
    if (name === 'attack2') {
      p.sword = keyframe([80, 105, 100, 28, -64, -97, -77, 58], t);
      p.wristX = keyframe([18, 25, 32, 12, 8, 21], t); p.wristY = keyframe([-33, -30, -36, -63, -76, -37], t);
      p.tilt = keyframe([10, 10, -9, -12, 0], t); p.spread = 21; p.cape = 12; p.trail = frame >= 4 && frame <= 7 ? -1 : 0;
    }
    if (name === 'attack3' || name === 'specialSide') {
      p.sword = keyframe([-140, -165, -172, -7, 0, 0, 22, 58], t);
      p.wristX = keyframe([-9, -14, 1, 39, 45, 33, 21], t); p.wristY = keyframe([-48, -47, -48, -49, -47, -37], t);
      p.tilt = keyframe([-10, -12, 13, 26, 22, 7, 0], t); p.spread = 25; p.crouch = 6; p.cape = -25;
      p.trail = frame >= 4 && frame <= 7 ? 2 : 0;
    }
    if (name === 'airAttack') {
      p.sword = keyframe([-140, -163, -123, -35, 58, 92, 83, 58], t);
      p.wristX = keyframe([-9, -7, 18, 29, 25, 21], t); p.wristY = keyframe([-66, -77, -60, -33, -30, -37], t);
      p.stride = 15; p.crouch = 10; p.tilt = keyframe([-12, -15, 16, 24, 5], t); p.cape = -19;
      p.trail = frame >= 3 && frame <= 6 ? 1 : 0;
    }
    if (name === 'specialNeutral') {
      p.sword = keyframe([-150, -175, -110, 15, 140, 255, 335, 400, 418], t);
      p.wristX = Math.cos(p.sword * Math.PI / 180) * 21; p.wristY = -49 + Math.sin(p.sword * Math.PI / 180) * 11;
      p.tilt = Math.sin(t * Math.PI * 2) * 15; p.spread = 21; p.cape = -20; p.trail = frame >= 3 && frame <= 9 ? 1 : 0;
    }
    if (name === 'specialUp') {
      p.sword = keyframe([98, 126, 105, 12, -68, -97, -98, -65, 58], t);
      p.wristX = keyframe([18, 18, 26, 22, 9, 5, 21], t); p.wristY = keyframe([-29, -27, -35, -56, -85, -79, -37], t);
      p.crouch = keyframe([16, 19, 3, 0, 4, 0], t); p.stride = 17; p.tilt = keyframe([10, 16, -10, -15, 0], t);
      p.cape = 13; p.trail = frame >= 3 && frame <= 8 ? -1 : 0;
    }
    if (name === 'specialDown') {
      p.sword = keyframe([-94, -95, -98, 78, 90, 90, 90, 58], t);
      p.wristX = keyframe([2, 4, 11, 16, 16, 21], t); p.wristY = keyframe([-88, -86, -68, -34, -27, -37], t);
      p.crouch = keyframe([5, 0, 3, 20, 24, 0], t); p.tilt = keyframe([-5, -8, 7, 15, 0], t); p.spread = 17;
      p.trail = frame >= 4 && frame <= 8 ? 2 : 0;
    }
    if (name === 'counterGuard') {
      p.crouch = 11; p.tilt = -5; p.spread = 16;
      p.wristX = 20; p.wristY = -60; p.sword = -72 + Math.sin(t * Math.PI) * 8;
    }
    if (name === 'riposte') {
      p.sword = keyframe([-78, -65, -20, 2, 5, 40], t);
      p.wristX = keyframe([19, 18, 31, 47, 50, 20], t);
      p.wristY = keyframe([-64, -67, -55, -49, -47, -42], t);
      p.tilt = keyframe([-8, -5, 10, 14, 8, 0], t); p.spread = 21;
      p.trail = frame >= 3 && frame <= 8 ? 1 : 0;
    }
    if (name === 'daggerSpecial') {
      p.sword = keyframe([-110, -55, 0, 15, 25], t);
      p.wristX = keyframe([2, 13, 36, 43, 20], t); p.wristY = keyframe([-65, -69, -58, -49, -42], t);
      p.tilt = Math.sin(t * Math.PI) * 9; p.cape = -12; p.spread = 14;
    }
    if (name === 'staffHeal' || name === 'staffPurge') {
      p.sword = -85; p.wristX = 19; p.wristY = keyframe([-38, -65, -75, -66, -38], t);
      p.tilt = -4; p.spread = 16; p.bob = -Math.sin(t * Math.PI) * 3; p.cape = 6;
    }
    return p;
  }
  function polygon(ctx, points, fill, stroke) {
    ctx.beginPath(); points.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.closePath();
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 1.5; ctx.stroke(); }
  }
  function line(ctx, points, color, width) {
    ctx.strokeStyle = color; ctx.lineWidth = width; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath(); points.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.stroke();
  }
  function drawPose(ctx, p, weapon = 'sword') {
    ctx.save(); ctx.translate(ORIGIN_X, ORIGIN_Y + p.bob);
    if (p.turn !== undefined) ctx.scale(p.turn, 1);
    const hipY = -29 + p.crouch, tx = p.tilt;
    // Each cel includes a new cape silhouette, limbs, hands, torso and weapon pose.
    polygon(ctx, [[tx - 6, -64 + p.crouch], [-22 + p.cape, -48 + p.crouch], [-35 + p.cape, -9], [-8, -20 + p.crouch], [tx + 10, -56 + p.crouch]], '#315752', '#1e3634');
    polygon(ctx, [[tx - 5, -62 + p.crouch], [-16 + p.cape, -45 + p.crouch], [-26 + p.cape, -16], [-16, -23]], '#47746a');
    const backFoot = -p.spread - p.stride * .7, frontFoot = p.spread + p.stride * .7;
    line(ctx, [[-5, hipY], [backFoot * .7, -16 + Math.max(0, p.stride * .28)], [backFoot, -3 - Math.max(0, -p.stride * .28)]], '#433e32', 10);
    line(ctx, [[6, hipY], [frontFoot * .65, -16 + Math.max(0, -p.stride * .28)], [frontFoot, -3 - Math.max(0, p.stride * .28)]], '#a1ac91', 10);
    line(ctx, [[backFoot - 4, -3 - Math.max(0, -p.stride * .28)], [backFoot + 6, -3 - Math.max(0, -p.stride * .28)]], '#3b3027', 8);
    line(ctx, [[frontFoot - 3, -3 - Math.max(0, p.stride * .28)], [frontFoot + 9, -3 - Math.max(0, p.stride * .28)]], '#574232', 8);
    line(ctx, [[tx - 9, -53 + p.crouch], [tx - 17, -39 + p.crouch], [tx - 7, -29 + p.crouch]], '#637964', 9);
    polygon(ctx, [[tx - 12, -59 + p.crouch], [tx + 11, -56 + p.crouch], [11, hipY - 3], [-11, hipY]], '#d6d5b6', '#455447');
    polygon(ctx, [[tx - 11, -57 + p.crouch], [tx - 3, -57 + p.crouch], [-1, hipY], [-10, hipY]], '#a5b09a');
    line(ctx, [[-10, hipY], [11, hipY - 2]], '#5e4833', 5);
    ctx.fillStyle = '#c7a66a'; ctx.fillRect(-1, hipY - 3, 5, 5);
    line(ctx, [[tx - 5, -56 + p.crouch], [tx + 7, -57 + p.crouch]], '#bc7c54', 8);
    polygon(ctx, [[tx - 7, -59 + p.crouch], [tx - 13 + p.cape * .4, -41 + p.crouch], [tx - 2, -42 + p.crouch]], '#c69466');
    const headX = tx * .7, headY = -72 + p.crouch;
    ctx.fillStyle = '#e5c8a2'; ctx.beginPath(); ctx.ellipse(headX, headY, 10, 12, -.12, 0, Math.PI * 2); ctx.fill();
    polygon(ctx, [[headX - 12, headY - 1], [headX - 11, headY - 12], [headX - 1, headY - 18], [headX + 11, headY - 11], [headX + 11, headY - 4], [headX + 2, headY - 6], [headX - 3, headY + 3], [headX - 11, headY + 6]], '#3b5b50', '#1e3530');
    polygon(ctx, [[headX - 9, headY - 10], [headX - 1, headY - 15], [headX + 6, headY - 9], [headX - 2, headY - 7]], '#57806b');
    line(ctx, [[headX + 4, headY - 2], [headX + 8, headY - 2]], '#28382a', 2);
    const wx = p.wristX + tx * .15, wy = p.wristY + p.crouch;
    line(ctx, [[tx + 8, -52 + p.crouch], [(wx + tx) * .52 + 5, (wy - 45 + p.crouch) * .5 + 5], [wx, wy]], '#c5ccb0', 9);
    ctx.fillStyle = '#788d77'; ctx.beginPath(); ctx.ellipse(tx + 9, -53 + p.crouch, 8, 7, .4, 0, Math.PI * 2); ctx.fill();
    drawWeapon(ctx, p, weapon, wx, wy);
    ctx.fillStyle = '#dabb90'; ctx.beginPath(); ctx.arc(wx, wy, 4.5, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
  function drawWeapon(ctx, p, weapon, wx, wy) {
    ctx.save(); ctx.translate(wx, wy); ctx.rotate(p.sword * Math.PI / 180);
    if (weapon === 'dagger') ctx.scale(.5, .9);
    if (p.trail) {
      ctx.save(); ctx.globalAlpha = .35;
      line(ctx, [[15, -9 * p.trail], [44, -16 * p.trail], [73, -11 * p.trail]], '#f4dc9c', 7);
      ctx.restore();
    }
    if (weapon === 'staff') {
      line(ctx, [[-30, 0], [67, 0]], '#806342', 5);
      line(ctx, [[50, -9], [66, -13], [77, 0], [66, 13], [50, 9]], '#c5b983', 3);
      polygon(ctx, [[56, 0], [66, -9], [73, 0], [66, 9]], '#abdcd0', '#e5ead3');
    } else {
      line(ctx, [[-8, 0], [7, 0]], '#604837', 5);
      line(ctx, [[6, -8], [6, 8]], '#c7ac70', 3);
      polygon(ctx, [[9, -4], [64, -3], [75, 0], [64, 4], [9, 4]], '#dce9d5', '#869e8c');
      polygon(ctx, [[10, -3], [64, -2], [73, 0], [10, 0]], '#fbf6d3');
    }
    ctx.fillStyle = '#d5bc85'; ctx.beginPath(); ctx.arc(-8, 0, 3, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
  function createAtlas(weapon = 'sword') {
    const canvas = document.createElement('canvas'); canvas.width = CELL_W * 12; canvas.height = CELL_H * Object.keys(animations).length;
    const ctx = canvas.getContext('2d');
    for (const [name, a] of Object.entries(animations)) {
      for (let frame = 0; frame < a.count; frame++) {
        ctx.save(); ctx.translate(frame * CELL_W, a.row * CELL_H);
        ctx.beginPath(); ctx.rect(0, 0, CELL_W, CELL_H); ctx.clip();
        drawPose(ctx, poseAt(name, frame), weapon); ctx.restore();
      }
    }
    return canvas;
  }
  function draw(ctx, atlas, name, frame, x, y, facing, alpha = 1) {
    const a = animations[name] || animations.idle;
    ctx.save(); ctx.translate(x, y); ctx.scale(facing, 1); ctx.globalAlpha *= alpha;
    ctx.drawImage(atlas, frame * CELL_W, a.row * CELL_H, CELL_W, CELL_H, -ORIGIN_X, -ORIGIN_Y, CELL_W, CELL_H);
    ctx.restore();
  }
  const api = { animations, frameAt, createAtlas, draw, drawWeapon, poseAt, CELL_W, CELL_H, ORIGIN_X, ORIGIN_Y };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.SwordSprites = api;
})(typeof window !== 'undefined' ? window : globalThis);
