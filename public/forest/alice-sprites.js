(function (root) {
  'use strict';
  const data = typeof module !== 'undefined' && module.exports ? require('./assets/alice-pixel/data') : root.AlicePixelData;
  const boss = typeof module !== 'undefined' && module.exports ? require('./boss') : root.AliceBoss;
  const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n)), DEG = Math.PI / 180;
  function load(ImageClass, changed = () => {}) {
    const image = new ImageClass(), state = { image, ready: false, error: null };
    image.onerror = () => { state.ready = false; state.error = data.asset; changed(state); };
    image.onload = () => {
      if (image.naturalWidth !== data.width || image.naturalHeight !== data.height) { image.onerror(); return; }
      state.ready = true; state.error = null; changed(state);
    };
    image.src = data.asset; return state;
  }
  function preview(clip, frame) {
    if (!data.clips[clip]) throw new Error('Unknown Alice clip: ' + clip);
    return { clip, frame: clamp(Math.floor(frame), 0, 7) };
  }
  function sample(clip, time = 0, loop = false, duration = data.clips[clip].duration) {
    const t = Math.max(0, Number.isFinite(time) ? time : 0);
    return preview(clip, Math.floor((loop ? t % duration : t) / duration * 8));
  }
  function select(challenge) {
    const b = challenge.boss, t = b.time || 0;
    if (challenge.status === 'departing') return preview('depart', 3 + Math.floor((challenge.departureTime || 0) / .12) % 5);
    if (b.state === 'defeated') return preview('defeated', 7);
    if (b.state === 'transition') return sample('throw', challenge.transitionTime || 0);
    if (b.state === 'telegraph') {
      const clip = ['triple','rush'].includes(b.attack) ? 'thrust' : b.attack === 'leap' ? 'leap' : ['rain','ricochet','cards'].includes(b.attack) ? 'throw' : 'cast';
      return preview(clip, Math.min(2, Math.floor(t / Math.max(.01, challenge.telegraphDuration()) * 3)));
    }
    if (b.state === 'triple') {
      const strike = Math.min(2, Math.floor(t / .42)), local = t - strike * .42;
      const edges = [0,.06,.14,.28,.32,.35,.38,.405];
      return preview(strike === 1 ? 'sweep' : 'thrust', edges.reduce((frame, edge, i) => local + 1e-8 >= edge ? i : frame, 0));
    }
    if (b.state === 'rush') return preview('rush', 2 + Math.floor(t / .065) % 4);
    if (b.state === 'leap') {
      const u = clamp(t / boss.CONFIG.leapDuration[b.phase], 0, 1), arc = u * 2 % 1;
      return preview('leap', u >= .98 ? 6 : arc < .1 ? 1 : arc < .3 ? 2 : arc < .55 ? 3 : arc < .8 ? 4 : 5);
    }
    if (b.state === 'flowers' || b.state === 'thorn') return preview('cast', 3 + Math.floor(t / .1) % 3);
    if (b.state === 'cat' || b.state === 'rabbit') return sample('summon', t);
    if (b.state === 'rain') return sample('summon', t, true, 1.2);
    if (b.state === 'ricochet') return t < .3 ? preview('throw', 3 + Math.floor(t / .075)) : sample('cast', t, true);
    if (b.state === 'cards') return preview('throw', 3 + Math.floor(t / .12));
    if (b.state === 'laugh') return sample('laugh', t, true);
    if (b.state === 'counterStance') return preview('guard', 2 + Math.floor(t / .12) % 4);
    if (b.flash > 0 && ['idle','recover'].includes(b.state)) return sample('hurt', .2 - b.flash);
    if (b.state === 'idle' && challenge.status === 'fight' && Math.abs(b.x - challenge.player.x) > 130) return sample('walk', challenge.worldElapsed, true);
    return sample('idle', challenge.worldElapsed, true);
  }
  function geometry(pose) {
    const clip = data.clips[pose.clip], frame = clip.frames[pose.frame], s = data.scale;
    return { sx: pose.frame * data.cellWidth, sy: clip.row * data.cellHeight, sw: data.cellWidth, sh: data.cellHeight,
      dx: -frame.origin[0] * s, dy: -frame.origin[1] * s, dw: 384 * s, dh: 512 * s };
  }
  function attachment(pose) {
    const f = data.clips[pose.clip].frames[pose.frame], s = data.scale;
    return { ...f, x: (f.hand[0] - f.origin[0]) * s, y: (f.hand[1] - f.origin[1]) * s,
      hatX: (f.head[0] - f.origin[0]) * s, hatY: (f.head[1] - f.origin[1]) * s };
  }
  function drawProp(c, image, name, x, y, options = {}) {
    if (!image) throw new Error('Missing Alice texture: ' + data.asset);
    const p = data.props[name]; if (!p) throw new Error('Unknown Alice prop: ' + name);
    const scale = options.scale ?? .15, sx = options.scaleX ?? scale, sy = options.scaleY ?? scale;
    const origin = options.origin || p.origin;
    c.save(); c.translate(x,y); c.rotate(options.angle || 0); c.scale(options.facing || 1, 1); c.imageSmoothingEnabled = false;
    c.drawImage(image,p.frame*192,p.row*256,192,256,-origin[0]*sx,-origin[1]*sy,384*sx,512*sy);c.restore();
  }
  function drawAnimal(c, image, q) {
    const clip = data.animals[q.kind], frame = clip.frames[Math.floor(Math.max(0,q.time||0)/clip.duration*4)%4], s = q.kind === 'cat' ? .18 : .16;
    c.save();c.translate(q.x,q.y);c.scale(q.vx<0?-1:1,1);c.imageSmoothingEnabled=false;
    c.drawImage(image,frame.frame*192,clip.row*256,192,256,-frame.origin[0]*s,-frame.origin[1]*s,384*s,512*s);c.restore();
  }
  function drawPose(c, image, pose, x, y, facing = 1, options = {}) {
    if (!image) throw new Error('Missing Alice texture: ' + data.asset);
    const g = geometry(pose), hand = attachment(pose), stowed = ['summon','hurt','laugh'].includes(pose.clip);
    c.save(); c.translate(x,y); c.scale(facing,1); c.globalAlpha *= options.alpha ?? 1; c.imageSmoothingEnabled=false;
    const umbrella = options.umbrellaOn !== false && !['defeated','depart'].includes(pose.clip);
    if (umbrella && stowed) drawProp(c,image,'closedParasol',-15,-58,{scale:.28,angle:150*DEG});
    const open = pose.clip === 'leap' && pose.frame >= 2 && pose.frame <= 5;
    const angle = pose.clip === 'leap' && !open ? -42 : hand.angle;
    const behind = ['idle','walk','cast','throw','guard'].includes(pose.clip) || (pose.clip === 'leap' && !open) || angle < -60;
    const drawHeld = () => {
      const scale = open ? .25 : .31;
      // Keep the tip on the phase's actual horizontal hit reach during the impact cel.
      const reachScale = !open && Math.abs(angle) < 12 && options.reach ? Math.max(scale,(options.reach-hand.x)/278) : scale;
      drawProp(c,image,open?'openParasol':'closedParasol',hand.x,hand.y,{scale,scaleX:reachScale,angle:angle*DEG});
    };
    if (umbrella && !stowed && behind) drawHeld();
    c.drawImage(image,g.sx,g.sy,g.sw,g.sh,g.dx,g.dy,g.dw,g.dh);
    if (umbrella && !stowed && !behind) {
      drawHeld();
      // Original glove pixels cover the handle at the registered grip.
      c.drawImage(image,g.sx+hand.hand[0]/2-7,g.sy+hand.hand[1]/2-8,14,16,hand.x-3.5,hand.y-4,7,8);
    }
    if (options.hatOn !== false) drawProp(c,image,'hat',hand.hatX,hand.hatY,{scale:.19});
    c.restore();
  }
  function draw(c, challenge, image) {
    const b=challenge.boss;
    drawPose(c,image,select(challenge),b.x,b.y,challenge.status==='departing'?1:b.facing,{hatOn:b.hatOn,umbrellaOn:b.umbrellaOn,
      alpha:b.flash>0?.7:1,reach:['triple','rush'].includes(b.state)?boss.CONFIG.umbrellaReach[b.phase]:null});
  }
  function inspection(challenge) { return {format:'RGBA pixel sprite atlas',...select(challenge),hatOn:challenge.boss.hatOn,umbrellaOn:challenge.boss.umbrellaOn}; }
  const api={data,load,preview,sample,select,geometry,attachment,drawProp,drawAnimal,drawPose,draw,inspection};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.AliceSprites=api;
})(typeof window!=='undefined'?window:globalThis);
