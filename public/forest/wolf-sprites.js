(function (root) {
  'use strict';
  const S = typeof module !== 'undefined' && module.exports ? require('./sprites.js') : root.SwordSprites;
  const combatBase = typeof module !== 'undefined' && module.exports ? require('./assets/wolf-combat/data.js') : root.WolfCombatData;
  const combat = { ...combatBase, asset: 'assets/wolf-motion-v2/combat.png' };
  const FX = typeof module !== 'undefined' && module.exports ? require('./wolf-fx') : root.WolfFx;
  // Atlas pixels are half-size exports; registration stays in the original 384 x 512 coordinates.
  const CELL_W = 192, CELL_H = 256, SCALE = .25;
  const ASSET = 'assets/wolf-motion-v2/atlas.png', WIDTH = 1536, HEIGHT = 1792;
  const clips = {
    idle: { row: 0, count: 8, duration: 1.04, label: '待机', origin: [212.5, 474] },
    walk: { row: 1, count: 8, duration: .64, label: '行走（素材预览）', origin: [220, 458] },
    run: { row: 2, count: 8, duration: .42, label: '疾跑（常态移动）', origin: [226, 458] },
    dash: { row: 6, count: 8, duration: .22, label: '爆发冲刺', origins: [[214,443],[228,444],[240,442],[263,462],[239,462],[235,462],[240,443],[236,443]] },
    jump: { row: 3, count: 8, duration: .8, label: '跳跃', origins: [[220, 475], [225, 475], [232, 462], [238, 436], [234, 424], [230, 450], [226, 476], [228, 476]] },
    dodge: { row: 4, count: 8, duration: .48, label: '地面翻滚（素材预览）', origin: [222, 445] },
    airdodge: { row: 5, count: 8, duration: .2, label: '空中闪避', origins: [[220, 458], [220, 450], [220, 450], [236, 456], [240, 462], [235, 455], [225, 450], [225, 458]] }
  };
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
  function frameAt(name, elapsed, duration = clips[name].duration, loop = false) {
    const t = Math.max(0, Number.isFinite(elapsed) ? elapsed : 0);
    return clamp(Math.floor((loop ? t % duration : t) / duration * clips[name].count), 0, clips[name].count - 1);
  }
  function cel(clip, frame, extra = {}) {
    frame = clamp(Math.floor(frame), 0, clips[clip].count - 1);
    return { clip, frame, count: clips[clip].count, temporary: false, ...extra };
  }
  function combatCel(name, frame) {
    const a = combat.clips[name];
    return { clip: name, frame: clamp(Math.floor(frame), 0, a.count - 1), count: a.count, atlas: 'combat', temporary: false, weaponAction: name };
  }
  function combatFrame(name, elapsed, duration) {
    const progress = Math.max(0, Number.isFinite(elapsed) ? elapsed : 0) / Math.max(.00001, duration);
    return combat.clips[name].edges.reduce((frame, edge, i) => progress >= edge ? i : frame, 0);
  }
  function sample(player, duration = S.animations[player.action]?.duration || 1) {
    const name = player.action, t = player.time || 0;
    if (name === 'idle') return cel('idle', frameAt('idle', t, clips.idle.duration, true));
    if (name === 'run') return cel('run', frameAt('run', t, clips.run.duration, true));
    if (name === 'dash') return cel('dash', frameAt('dash', t, duration));
    if (name === 'airEvade') return cel('airdodge', frameAt('airdodge', t, duration));
    // Use vertical velocity, not the full baked jump sequence: airtime belongs to physics.
    if (name === 'jump') return cel('jump', player.vy < -450 ? 2 : player.vy < -220 ? 3 : 4);
    if (name === 'fall') return cel('jump', player.vy < 180 ? 4 : 5);
    if (name === 'land') return cel('jump', t / duration < .5 ? 6 : 7);
    if (!combat.clips[name]) throw new Error('Unknown player action: ' + name);
    let frame = combatFrame(name, t, duration);
    // The engine owns landing: never show a grounded impact while still descending.
    if (name === 'specialDown') frame = player.grounded === false ? Math.min(frame, 3) : Math.max(frame, 4);
    return combatCel(name, frame);
  }
  function sampleGhost(ghost) {
    const a = S.animations[ghost.name];
    return sample({ action: ghost.name, time: ghost.frame / a.count * a.duration, grounded: true }, a.duration);
  }
  function preview(name, frame) {
    if (clips[name]) return cel(name, frame);
    if (combat.clips[name]) return combatCel(name, frame);
    if (name === 'airEvade') return cel('airdodge', frame);
    const a = S.animations[name];
    return sample({ action: name, time: frame / a.count * a.duration, grounded: name !== 'airAttack', vy: 0 }, a.duration);
  }
  function geometry(selection) {
    if (selection.atlas === 'combat') {
      const a = combat.clips[selection.clip], f = a.frames[selection.frame];
      return { sx: selection.frame * combat.cellWidth, sy: a.row * combat.cellHeight, sw: combat.cellWidth, sh: combat.cellHeight,
        dx: -f.origin[0] * SCALE, dy: -f.origin[1] * SCALE, dw: combat.cellWidth * 2 * SCALE, dh: combat.cellHeight * 2 * SCALE };
    }
    const a = clips[selection.clip], origin = a.origins ? a.origins[selection.frame] : a.origin;
    return { sx: selection.frame * CELL_W, sy: a.row * CELL_H, sw: CELL_W, sh: CELL_H,
      dx: -origin[0] * SCALE, dy: -origin[1] * SCALE, dw: CELL_W * 2 * SCALE, dh: CELL_H * 2 * SCALE };
  }
  function attachment(selection) {
    if (selection.atlas !== 'combat') return null;
    const f = combat.clips[selection.clip].frames[selection.frame];
    return { ...f, frame: selection.frame, x: (f.hand[0] - f.origin[0]) * SCALE, y: (f.hand[1] - f.origin[1]) * SCALE };
  }
  function draw(ctx, atlas, selection, x, y, facing, alpha = 1, weapon = 'sword', combatAtlas, fxImages) {
    const g = geometry(selection), hand = attachment(selection), texture = hand ? combatAtlas : atlas;
    if (!texture) throw new Error('Missing wolf texture: ' + (hand ? combat.asset : ASSET));
    ctx.save(); ctx.translate(x, y); ctx.scale(facing, 1); ctx.globalAlpha *= alpha;
    ctx.imageSmoothingEnabled = false;
    const drawWeapon = () => FX.drawWeapon(ctx, fxImages, weapon, selection.clip, selection.frame, hand.x, hand.y);
    if (hand && !hand.hidden && hand.behind) drawWeapon();
    ctx.drawImage(texture, g.sx, g.sy, g.sw, g.sh, g.dx, g.dy, g.dw, g.dh);
    if (hand && !hand.hidden && !hand.behind) {
      drawWeapon();
      // Reuse the original glove pixels above the handle; no painted replacement hand.
      ctx.drawImage(texture, g.sx + hand.hand[0] / 2 - 9, g.sy + hand.hand[1] / 2 - 8, 18, 16, hand.x - 4.5, hand.y - 4, 9, 8);
    }
    ctx.restore();
  }
  function animationInfo(name) { return clips[name] || combat.clips[name] || (name === 'airEvade' ? clips.airdodge : S.animations[name]); }
  function phaseLabel(name, frame) {
    if (!combat.clips[name]) return animationInfo(name).label.replace('（素材预览）', '');
    if (name === 'hurt') return frame < 4 ? '受击后仰' : '恢复';
    if (name === 'daggerSpecial') return frame < 3 ? '出手' : '收势';
    if (name.startsWith('staff')) return frame < 3 ? '起手' : frame < 6 ? '施法' : '收势';
    if (['guard', 'counterGuard', 'parry'].includes(name)) return frame < 2 ? '抬手' : frame < 6 ? '防御' : '收势';
    return frame < 3 ? '起手' : frame < 6 ? '出招' : '收招';
  }
  const api = { ASSET, WIDTH, HEIGHT, CELL_W, CELL_H, SCALE, clips, combat, animationInfo, phaseLabel, attachment, combatFrame, frameAt, sample, sampleGhost, preview, geometry, draw };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.WolfSprites = api;
})(typeof window !== 'undefined' ? window : globalThis);
