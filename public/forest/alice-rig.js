(function (root) {
  'use strict';
  // Original, deliberately small Canvas reader for the region/FK subset of Spine 4.2 JSON.
  // No Esoteric Software runtime code is included. Exported data is also editor-importable.
  const DEG = Math.PI / 180;
  const PARTS = ['hairBack', 'upperLegBack', 'lowerLegBack', 'shoeBack', 'upperLegFront', 'lowerLegFront', 'shoeFront', 'upperArmBack', 'forearmBack', 'handBack', 'torso', 'neck', 'skirtBack', 'skirtLeft', 'skirtRight', 'apron', 'head', 'headTired', 'hairFront', 'hat', 'ribbon', 'upperArmFront', 'forearmFront', 'umbrellaClosed', 'umbrellaOpen', 'handFront'];
  const ATLAS = { cell: 256, columns: 8, width: 2048, height: 1024, regions: Object.fromEntries(PARTS.map((name, i) => [name, { x: i % 8 * 256, y: Math.floor(i / 8) * 256, width: 256, height: 256 }])) };
  const CLIPS = { laugh: [1, true], counterStance: [1, true], thorn: [1.65, false], cards: [.6, false], idle: [1.2, true], walk: [.58, true], telegraph: [.65, false], triple: [1.65, false], rush: [.5, true], leap: [1, false], flowers: [2.6, false], summon: [.6, false], hatThrow: [.85, false], rain: [1.15, true], ricochet: [.85, false], recover: [.75, false], hurt: [.2, false], defeated: [.8, false], depart: [.58, true] };
  const LABELS = { laugh: '大笑', counterStance: '当身', thorn: '荆棘读条', cards: '投掷扑克', idle: '待机', walk: '移动', telegraph: '起手', triple: '三连伞击', rush: '伞冲击', leap: '花溅跃', flowers: '鲜花机关枪', summon: '投掷召唤', hatThrow: '抛帽', rain: '千刀万剐', ricochet: '伞折射', recover: '收招', hurt: '受击', defeated: '战败', depart: '离场' };
  function createSkeleton() {
    const bones = [
      { name: 'root' }, { name: 'pelvis', parent: 'root', y: 29 }, { name: 'body', parent: 'pelvis', length: 29 },
      { name: 'head', parent: 'body', y: 44 }, { name: 'hair', parent: 'head', y: -2 }, { name: 'hat', parent: 'head', y: 13 },
      { name: 'skirt', parent: 'pelvis', y: 2 }, { name: 'skirtL', parent: 'skirt', x: -5 }, { name: 'skirtR', parent: 'skirt', x: 5 },
      { name: 'thighBack', parent: 'pelvis', x: -6, rotation: -109, length: 15 }, { name: 'shinBack', parent: 'thighBack', x: 15, rotation: 24, length: 15 }, { name: 'footBack', parent: 'shinBack', x: 15, rotation: 85 },
      { name: 'thighFront', parent: 'pelvis', x: 6, rotation: -69, length: 15 }, { name: 'shinFront', parent: 'thighFront', x: 15, rotation: -25, length: 15 }, { name: 'footFront', parent: 'shinFront', x: 15, rotation: 94 },
      { name: 'armBack', parent: 'body', x: -9, y: 23, rotation: -110, length: 18 }, { name: 'forearmBack', parent: 'armBack', x: 18, rotation: -20, length: 17 }, { name: 'handBack', parent: 'forearmBack', x: 17 },
      { name: 'armFront', parent: 'body', x: 9, y: 23, rotation: -100, length: 19 }, { name: 'forearmFront', parent: 'armFront', x: 19, rotation: 115, length: 19 }, { name: 'handFront', parent: 'forearmFront', x: 19 },
      { name: 'weapon', parent: 'handFront', rotation: -60, length: 100 }, { name: 'ribbon', parent: 'body', x: -7, y: 28 }
    ];
    const associations = [
      ['hairBack', 'hair'], ['upperLegBack', 'thighBack'], ['lowerLegBack', 'shinBack'], ['shoeBack', 'footBack'],
      ['upperLegFront', 'thighFront'], ['lowerLegFront', 'shinFront'], ['shoeFront', 'footFront'],
      ['upperArmBack', 'armBack'], ['forearmBack', 'forearmBack'], ['handBack', 'handBack'], ['torso', 'body'], ['neck', 'body'],
      ['skirtBack', 'skirt'], ['skirtLeft', 'skirtL'], ['skirtRight', 'skirtR'], ['apron', 'skirt'],
      ['head', 'head'], ['hairFront', 'head'], ['hat', 'hat'], ['ribbon', 'ribbon'],
      ['upperArmFront', 'armFront'], ['forearmFront', 'forearmFront'], ['umbrella', 'weapon'], ['handFront', 'handFront']
    ];
    // The physical atlas cells are 256px; attachment units stay at 128 to match the hero scale.
    const slots = associations.map(([name, bone]) => ({ name, bone, attachment: name === 'umbrella' ? 'umbrellaClosed' : name }));
    const attachments = Object.fromEntries(slots.map(s => [s.name, { [s.attachment]: { type: 'region', path: s.attachment, width: 128, height: 128 } }]));
    attachments.head.headTired = { type: 'region', path: 'headTired', width: 128, height: 128 };
    attachments.umbrella.umbrellaOpen = { type: 'region', path: 'umbrellaOpen', width: 128, height: 128 };
    // Closed umbrella is long; its region is centered 43 units along the weapon bone.
    attachments.umbrella.umbrellaClosed.x = 43;
    attachments.umbrella.umbrellaOpen.y = 43;
    const data = { skeleton: { spine: '4.2.00', hash: 'forest-alice-fk-v1', x: -43, y: -3, width: 144, height: 122, fps: 60, images: './images/' }, bones, slots, skins: [{ name: 'default', attachments }], events: { umbrellaHit: {} }, animations: {} };
    function clip(name, times, poses) {
      const tracks = {};
      const rotate = (bone, values) => { tracks[bone] ||= {}; tracks[bone].rotate = times.map((time, i) => ({ time, value: values[i] === 0 ? 0 : values[i] })); };
      const translate = (bone, xs, ys) => { tracks[bone] ||= {}; tracks[bone].translate = times.map((time, i) => ({ time, x: xs[i], y: ys[i] })); };
      rotate('body', poses.map(p => p.body || 0)); rotate('head', poses.map(p => -(p.body || 0) * .5));
      rotate('hair', poses.map((p, i) => p.hair ?? Math.sin(i * 1.3) * 6));
      rotate('skirtL', poses.map(p => p.skirt || 0)); rotate('skirtR', poses.map(p => -(p.skirt || 0) * .7));
      rotate('ribbon', poses.map(p => (p.hair || 0) * 1.4));
      rotate('thighFront', poses.map(p => p.leg || 0)); rotate('thighBack', poses.map(p => -(p.leg || 0)));
      rotate('shinFront', poses.map(p => Math.max(0, p.leg || 0) * .8)); rotate('shinBack', poses.map(p => Math.max(0, -(p.leg || 0)) * .8));
      translate('pelvis', poses.map(p => p.x || 0), poses.map(p => p.y || 0));
      const upper = [], lower = [], weapon = [];
      for (const p of poses) {
        const dx = (p.handX ?? 23) - 9, dy = (p.handY ?? 8) - 23, distance = Math.max(.001, Math.min(37.5, Math.hypot(dx, dy)));
        const elbow = Math.acos(Math.max(-1, Math.min(1, (distance * distance - 722) / 722)));
        const arm = Math.atan2(dy, dx) - Math.acos(Math.min(1, distance / 38));
        upper.push(arm / DEG + 100); lower.push(elbow / DEG - 115);
        weapon.push((p.weapon ?? -45) - (arm + elbow) / DEG + 60);
      }
      rotate('armFront', upper); rotate('forearmFront', lower); rotate('weapon', weapon);
      rotate('armBack', poses.map(p => p.back || 0));
      data.animations[name] = { bones: tracks };
    }
    const idle = { body: 0, handX: 23, handY: 8, weapon: -45, hair: 0, skirt: 0 };
    clip('idle', [0, .3, .6, .9, 1.2], [idle, { ...idle, y: 1.2, hair: 3, skirt: 2 }, { ...idle, hair: 0 }, { ...idle, y: -1, hair: -3, skirt: -2 }, idle]);
    const walk = [0, .145, .29, .435, .58].map((t, i) => ({ ...idle, body: -5, leg: Math.sin(i * Math.PI / 2) * 25, y: Math.abs(Math.sin(i * Math.PI / 2)) * 2, hair: -7 + Math.sin(i * Math.PI / 2) * 4, skirt: Math.sin(i * Math.PI / 2) * 8, weapon: -63 }));
    clip('walk', [0, .145, .29, .435, .58], walk); clip('depart', [0, .145, .29, .435, .58], walk);
    clip('telegraph', [0, .2, .45, .65], [idle, { ...idle, body: 8, handX: 1, handY: 37, weapon: 130, y: -4, hair: 8 }, { ...idle, body: 10, handX: -2, handY: 39, weapon: 145, y: -5, skirt: 8 }, { ...idle, body: 10, handX: -2, handY: 39, weapon: 145, y: -5, skirt: 8 }]);
    clip('triple', [0, .16, .28, .4, .54, .7, .83, .98, 1.12, 1.25, 1.42, 1.65], [
      { ...idle, body: 8, handX: 0, handY: 36, weapon: 130 }, { ...idle, body: 12, handX: -3, handY: 39, weapon: 148, y: -3 },
      { ...idle, body: -14, handX: 33, handY: 21, weapon: 4, skirt: -12, hair: 15 }, { ...idle, body: -7, handX: 30, handY: 4, weapon: -36, skirt: -7, hair: 10 },
      { ...idle, body: -5, handX: 20, handY: -4, weapon: -70, y: -4 }, { ...idle, body: 8, handX: 34, handY: 23, weapon: -1, skirt: 11, hair: -13 },
      { ...idle, body: 5, handX: 20, handY: 43, weapon: 70, hair: -10 }, { ...idle, body: 9, handX: -5, handY: 34, weapon: 145, y: -6 },
      { ...idle, body: -15, x: 5, handX: 37, handY: 19, weapon: 0, leg: 14, skirt: -14, hair: 20 },
      { ...idle, body: -11, x: 5, handX: 37, handY: 19, weapon: 0, leg: 14, skirt: -10, hair: 15 },
      { ...idle, body: -4, handX: 28, handY: 9, weapon: -30, hair: 8 }, idle
    ]);
    data.animations.triple.events = [.28, .7, 1.12].map(time => ({ time, name: 'umbrellaHit' }));
    clip('rush', [0, .125, .25, .375, .5], [0, 1, 2, 3, 4].map(i => ({ ...idle, body: -22, y: -7, handX: 34, handY: 22, weapon: 2, leg: Math.sin(i * Math.PI / 2) * 17, skirt: -14, hair: 24 })));
    clip('leap', [0, .25, .5, .75, 1], [
      { ...idle, y: -4, handX: 17, handY: 21, weapon: 0, leg: 6, skirt: -4 },
      { ...idle, handX: 18, handY: 31, weapon: 0, leg: 26, skirt: -16, hair: 10 },
      { ...idle, handX: 16, handY: 24, weapon: -8, leg: -10, skirt: 9, hair: -6 },
      { ...idle, handX: 18, handY: 31, weapon: 0, leg: 26, skirt: -16, hair: 10 }, idle
    ]); data.animations.leap.slots = { umbrella: { attachment: [{ time: 0, name: 'umbrellaOpen' }, { time: .98, name: 'umbrellaClosed' }] } };
    clip('flowers', [0, .22, .44, 1.1, 1.98, 2.6], [idle, { ...idle, handX: 32, handY: 23, weapon: 3, body: 4 }, { ...idle, handX: 31, handY: 23, weapon: 1, body: -3 }, { ...idle, handX: 31, handY: 23, weapon: 0 }, { ...idle, handX: 31, handY: 23, weapon: 0 }, idle]);
    clip('summon', [0, .15, .3, .6], [idle, { ...idle, body: 8, back: -110, handX: 4, handY: 32 }, { ...idle, body: -11, back: 120, handX: 27, handY: 26, hair: 13 }, idle]);
    clip('hatThrow', [0, .25, .45, .85], [idle, { ...idle, body: 5, back: -160, handX: 7, handY: 41, weapon: 90 }, { ...idle, body: -9, back: 140, handX: 30, handY: 33, weapon: 60 }, idle]);
    clip('rain', [0, .35, .7, 1.15], [idle, { ...idle, body: 5, back: -160, hair: 8 }, { ...idle, body: -4, back: -135, hair: -4 }, idle]);
    clip('ricochet', [0, .2, .36, .55, .85], [idle, { ...idle, body: 12, handX: -6, handY: 34, weapon: 135 }, { ...idle, body: -19, handX: 37, handY: 22, weapon: 0, skirt: -10, hair: 18 }, { ...idle, body: -7, handX: 33, handY: 19, weapon: -10 }, idle]);
    clip('recover', [0, .25, .75], [{ ...idle, body: -5, handX: 30, handY: 14, weapon: -28, hair: 12 }, { ...idle, hair: 5, skirt: 5 }, idle]);
    clip('hurt', [0, .06, .2], [idle, { ...idle, body: 15, y: -4, handX: 10, handY: 13, hair: -15 }, idle]);
    clip('defeated', [0, .3, .8], [idle, { ...idle, body: -10, y: -15, leg: -35, handX: 22, handY: 10, weapon: -70 }, { ...idle, body: -18, y: -25, leg: -58, handX: 20, handY: 8, weapon: -75, skirt: 12, hair: 3 }]);
    data.animations.defeated.slots = { head: { attachment: [{ time: 0, name: 'headTired' }] } };
    clip('laugh', [0, .25, .5, .75, 1], [0, 1, 2, 3, 4].map(i => ({ ...idle, body: i % 2 ? 13 : 6, y: i % 2 ? 2 : 0, handX: 10, handY: 48, weapon: 100, back: -55, hair: i % 2 ? -8 : 8 })));
    clip('counterStance', [0, .5, 1], [0, 1, 2].map(i => ({ ...idle, body: 7, handX: 22, handY: 32, weapon: 82, back: -35, skirt: i % 2 ? 4 : 0 })));
    clip('thorn', [0, .5, 1.25, 1.65], [idle, { ...idle, body: 8, handX: 2, handY: 34, weapon: 135 }, { ...idle, body: -6, handX: 34, handY: 22, weapon: 0 }, { ...idle, body: -14, handX: 37, handY: 20, weapon: 0, hair: 16 }]);
    clip('cards', [0, .2, .35, .6], [idle, { ...idle, body: 9, back: -130 }, { ...idle, body: -9, back: 120, handX: 31, handY: 24, weapon: 10 }, idle]);
    return data;
  }
  const skeleton = root.AliceSkeletonData || createSkeleton();
  function valueAt(keys, time, field, fallback) {
    if (!keys || !keys.length || time < (keys[0].time || 0)) return fallback;
    let i = 0; while (i + 1 < keys.length && time >= (keys[i + 1].time || 0)) i++;
    const a = keys[i], b = keys[i + 1];
    if (!b || a.curve === 'stepped') return a[field] ?? fallback;
    const t = (time - (a.time || 0)) / (b.time - (a.time || 0));
    return (a[field] ?? fallback) + ((b[field] ?? fallback) - (a[field] ?? fallback)) * t;
  }
  function sample(name, time) {
    const clip = skeleton.animations[name] || skeleton.animations.idle;
    const definition = CLIPS[name] || CLIPS.idle;
    time = definition[1] ? time % definition[0] : Math.min(time, definition[0]);
    const locals = {};
    for (const b of skeleton.bones) {
      const track = clip.bones?.[b.name];
      locals[b.name] = { x: (b.x || 0) + valueAt(track?.translate, time, 'x', 0), y: (b.y || 0) + valueAt(track?.translate, time, 'y', 0), rotation: (b.rotation || 0) + valueAt(track?.rotate, time, 'value', 0), scaleX: (b.scaleX ?? 1) * valueAt(track?.scale, time, 'x', 1), scaleY: (b.scaleY ?? 1) * valueAt(track?.scale, time, 'y', 1) };
    }
    const slots = Object.fromEntries(skeleton.slots.map(s => [s.name, s.attachment]));
    for (const [slot, timelines] of Object.entries(clip.slots || {})) {
      for (const key of timelines.attachment || []) if (time >= (key.time || 0)) slots[slot] = key.name;
    }
    return { name, locals, slots };
  }
  function matrices(pose) {
    const world = {};
    for (const b of skeleton.bones) {
      const l = pose.locals[b.name], r = l.rotation * DEG;
      const local = { a: Math.cos(r) * l.scaleX, b: Math.sin(r) * l.scaleX, c: -Math.sin(r) * l.scaleY, d: Math.cos(r) * l.scaleY, x: l.x, y: l.y };
      const p = world[b.parent];
      world[b.name] = p ? { a: p.a * local.a + p.c * local.b, b: p.b * local.a + p.d * local.b, c: p.a * local.c + p.c * local.d, d: p.b * local.c + p.d * local.d, x: p.a * local.x + p.c * local.y + p.x, y: p.b * local.x + p.d * local.y + p.y } : local;
    }
    return world;
  }
  function polygon(c, points, fill, outline = '#293e3b') {
    c.beginPath(); points.forEach((p, i) => i ? c.lineTo(...p) : c.moveTo(...p)); c.closePath();
    c.fillStyle = fill; c.fill(); if (outline) { c.strokeStyle = outline; c.lineWidth = 1.5; c.stroke(); }
  }
  function line(c, points, color, width) { c.strokeStyle = color; c.lineWidth = width; c.lineCap = 'round'; c.lineJoin = 'round'; c.beginPath(); points.forEach((p, i) => i ? c.lineTo(...p) : c.moveTo(...p)); c.stroke(); }
  function oval(c, x, y, rx, ry, color) { c.fillStyle = color; c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); c.fill(); }
  function rosette(c, x, y, s = 3) { for (let i = 0; i < 5; i++) oval(c, x + Math.cos(i * 1.26) * s * .5, y + Math.sin(i * 1.26) * s * .5, s * .6, s * .6, '#bd717c'); oval(c, x, y, s * .45, s * .45, '#814953'); }
  function paintPart(c, name) {
    if (name === 'hairBack') {
      polygon(c, [[-10, 12], [-21, 5], [-26, -13], [-20, -19], [-28, -33], [-20, -36], [-21, -46], [-8, -38], [-6, -23], [1, 7]], '#bcaa72');
      polygon(c, [[-12, 7], [-17, -10], [-15, -20], [-21, -29], [-13, -31], [-12, -37], [-8, -30], [-7, -4]], '#d6c486', null);
    } else if (name.startsWith('upperLeg') || name.startsWith('lowerLeg')) {
      const end = name.startsWith('upperLeg') ? 16 : 16, dark = name.endsWith('Back');
      line(c, [[0, 0], [end, 0]], dark ? '#acb6a5' : '#d4d7bd', 8); line(c, [[3, 2], [end - 2, 2]], dark ? '#8d9d8d' : '#edf0d3', 2);
    } else if (name.startsWith('shoe')) {
      line(c, [[-4, 1], [8, 1]], name.endsWith('Back') ? '#30444e' : '#405b67', 7); line(c, [[0, 3], [7, 3]], '#8aa3a1', 1.5);
    } else if (name.startsWith('upperArm')) {
      line(c, [[0, 0], [18, 0]], name.endsWith('Back') ? '#637f91' : '#91afbd', 9); oval(c, 2, 0, 7, 8, name.endsWith('Back') ? '#557587' : '#7699ac'); line(c, [[7, 3], [14, 3]], '#c3d3cb', 2.5);
    } else if (name.startsWith('forearm')) {
      line(c, [[0, 0], [17, 0]], name.endsWith('Back') ? '#afbba9' : '#dddcc0', 7); line(c, [[0, -4], [0, 4]], '#9fb9b9', 3);
    } else if (name.startsWith('hand')) oval(c, 0, 0, 4.5, 4.5, '#e5c8a2');
    else if (name === 'torso') {
      polygon(c, [[-12, 28], [10, 28], [12, 0], [-11, 0]], '#7895a8'); polygon(c, [[-10, 27], [-3, 27], [-1, 0], [-10, 0]], '#536f83', null);
      polygon(c, [[-6, 25], [5, 25], [4, 5], [-5, 5]], '#d2d5bb', null); line(c, [[-10, 1], [11, 1]], '#48677a', 4); rosette(c, 2, 23, 3.5);
      line(c, [[-5, 19], [4, 16], [-5, 12], [4, 9]], '#a8b6a4', 1.2);
    } else if (name === 'neck') { line(c, [[0, 28], [0, 33]], '#e5c8a2', 6); }
    else if (name === 'skirtBack') polygon(c, [[-11, 5], [11, 5], [23, -18], [-22, -18]], '#4e7188');
    else if (name === 'skirtLeft') { polygon(c, [[-7, 5], [3, 4], [4, -17], [-18, -18]], '#6d8fa3'); line(c, [[-17, -18], [3, -17]], '#c6d0b6', 3); }
    else if (name === 'skirtRight') { polygon(c, [[-3, 4], [7, 5], [18, -18], [-4, -17]], '#87a7b6'); line(c, [[-3, -17], [17, -18]], '#e0e1c6', 3); rosette(c, 12, -10); }
    else if (name === 'apron') { polygon(c, [[-5, 2], [5, 2], [9, -15], [-9, -15]], '#d8d8bc', null); line(c, [[-8, -15], [8, -15]], '#f1ead1', 2); }
    else if (name === 'head' || name === 'headTired') {
      oval(c, 0, 0, 10, 12, '#e5c8a2'); polygon(c, [[-10, 5], [-10, -1], [-4, -8], [1, -11], [-9, -8]], '#c7ab85', null);
      line(c, [[4, 1], [8, 1 + (name === 'headTired' ? -1 : 0)]], '#4c797e', 2); if (name === 'head') oval(c, 7, 1, 1, 1.2, '#a6d6cf');
      line(c, [[4, -6], [7, -6]], '#9d776b', 1);
    } else if (name === 'hairFront') {
      polygon(c, [[-12, -1], [-11, 11], [-2, 17], [10, 11], [11, 5], [4, 7], [-3, 1], [-8, -6]], '#c7b576');
      polygon(c, [[-9, 10], [-2, 13], [6, 9], [-3, 7]], '#e1cf8c', null);
    } else if (name === 'hat') {
      polygon(c, [[-11, 2], [-10, 19], [7, 19], [11, 2]], '#42627a'); oval(c, 0, 1, 18, 4, '#6c8fa4'); line(c, [[-10, 6], [10, 6]], '#cad3bb', 3); rosette(c, 11, 5, 4);
    } else if (name === 'ribbon') {
      polygon(c, [[0, 0], [-7, -3], [-13, -23], [-4, -18], [4, -5]], '#6d8a92');
    } else if (name === 'umbrellaClosed') {
      line(c, [[-50, -7], [-54, -4], [-54, 0], [-34, 0]], '#bfa779', 3);
      polygon(c, [[-32, -6], [-20, -10], [39, -7], [53, 0], [39, 7], [-20, 10], [-32, 6]], '#789cad');
      polygon(c, [[-30, 1], [42, 3], [50, 0], [39, 7], [-20, 9]], '#b3c7c3', null);
      line(c, [[-28, -4], [43, -2]], '#55778c', 1); line(c, [[-28, 4], [43, 2]], '#d8dcc0', 1.5);
      line(c, [[-30, -7], [-30, 7]], '#bdad8e', 3); line(c, [[53, 0], [57, 0]], '#c5ac7b', 2); rosette(c, 0, 0, 3.5);
    } else if (name === 'umbrellaOpen') {
      // Attachment offset +43 puts its handle at the weapon bone and canopy above it.
      line(c, [[0, -45], [0, 30]], '#c5ac7b', 3);
      polygon(c, [[-43, 20], [-26, 40], [0, 48], [26, 40], [43, 20], [29, 17], [15, 21], [0, 18], [-15, 21], [-29, 17]], '#8eb0bc');
      line(c, [[-42, 20], [0, 48], [42, 20]], '#d8dfc8', 2); line(c, [[0, 48], [0, 19]], '#5d8498', 1); rosette(c, -26, 23); rosette(c, 0, 21, 4); rosette(c, 26, 23);
    }
  }
  function createAtlas() {
    const canvas = document.createElement('canvas'); canvas.width = ATLAS.width; canvas.height = ATLAS.height;
    const c = canvas.getContext('2d');
    for (const part of PARTS) {
      const r = ATLAS.regions[part]; c.save(); c.translate(r.x + 128, r.y + 128); c.scale(2, -2); paintPart(c, part); c.restore();
    }
    return canvas;
  }
  let fallback = null, atlasImage = null;
  if (typeof Image !== 'undefined') { atlasImage = new Image(); atlasImage.src = 'assets/alice-spine/forest-alice.png'; }
  const instances = new WeakMap();
  function select(challenge) {
    const b = challenge.boss;
    if (challenge.status === 'departing') return ['depart', challenge.departureTime];
    if (b.state === 'defeated') return ['defeated', .8];
    if (b.state === 'transition') return ['hatThrow', Math.min(.85, challenge.transitionTime)];
    if (b.state === 'telegraph') return [b.attack === 'thorn' ? 'thorn' : 'telegraph', b.time];
    if (['laugh','counterStance','cards'].includes(b.state)) return [b.state, b.time];
    if (b.state === 'thorn') return ['thorn', 1.65];
    if (b.state === 'triple') return ['triple', b.time];
    if (b.state === 'leap') return ['leap', b.time / root.AliceBoss.CONFIG.leapDuration[b.phase]];
    if (b.state === 'rush') return ['rush', b.time];
    if (b.state === 'flowers') return ['flowers', b.time];
    if (b.state === 'cat' || b.state === 'rabbit') return ['summon', b.time];
    if (b.state === 'rain') return ['rain', b.time];
    if (b.state === 'ricochet') return ['ricochet', b.time];
    if (b.state === 'recover') return ['recover', b.time];
    return [Math.abs(b.x - challenge.player.x) > 130 ? 'walk' : 'idle', challenge.worldElapsed];
  }
  function blendedPose(challenge) {
    const [name, time] = select(challenge), pose = sample(name, time), now = challenge.worldElapsed + (challenge.status === 'transition' ? challenge.transitionTime : 0);
    let state = instances.get(challenge);
    if (!state) { state = { name, previous: pose, start: now, current: pose }; instances.set(challenge, state); }
    if (name !== state.name) { state.previous = state.current; state.start = now; state.name = name; }
    const mix = Math.min(1, Math.max(0, (now - state.start) / .085));
    if (mix < 1 && name !== 'defeated') {
      for (const [bone, local] of Object.entries(pose.locals)) for (const key of ['x', 'y', 'rotation', 'scaleX', 'scaleY']) {
        const old = state.previous.locals[bone][key]; local[key] = old + (local[key] - old) * mix;
      }
    }
    state.current = pose;
    return pose;
  }
  function draw(c, challenge) {
    const b = challenge.boss, pose = blendedPose(challenge);
    if (b.flash > 0 && b.state !== 'defeated') {
      const flinch = sample('hurt', .16 - b.flash);
      pose.locals.body.rotation += flinch.locals.body.rotation * .45;
      pose.locals.head.rotation += flinch.locals.head.rotation * .45;
    }
    if (!b.hatOn) pose.slots.hat = null;
    if (!b.umbrellaOn || b.state === 'defeated' || challenge.status === 'departing') pose.slots.umbrella = null;
    // Weapon's extended silhouette and the attack sweep both reach the actual phase hit distance.
    if (b.state === 'triple' || b.state === 'rush') pose.locals.weapon.scaleX = (root.AliceBoss.CONFIG.umbrellaReach[b.phase] - 26) / 98;
    const world = matrices(pose), image = atlasImage?.complete && atlasImage.naturalWidth === ATLAS.width ? atlasImage : (fallback ||= createAtlas());
    c.save(); c.translate(b.x, b.y); c.scale(b.facing, -1); if (b.flash > 0) c.globalAlpha *= .7;
    const skin = skeleton.skins[0].attachments;
    for (const slot of skeleton.slots) {
      const attachment = pose.slots[slot.name]; if (!attachment) continue;
      const region = skin[slot.name][attachment], source = ATLAS.regions[region.path || attachment], matrix = world[slot.bone];
      c.save(); c.transform(matrix.a, matrix.b, matrix.c, matrix.d, matrix.x, matrix.y);
      c.translate(region.x || 0, region.y || 0); c.rotate((region.rotation || 0) * DEG); c.scale(region.scaleX ?? 1, -(region.scaleY ?? 1));
      c.drawImage(image, source.x, source.y, source.width, source.height, -region.width / 2, -region.height / 2, region.width, region.height); c.restore();
    }
    c.restore();
  }
  function inspection(challenge) { const [name, time] = select(challenge); return { format: 'Spine 4.2 JSON', animation: name, time, bones: skeleton.bones.length }; }
  const api = { draw, skeleton, createSkeleton, createAtlas, ATLAS, PARTS, CLIPS, LABELS, sample, matrices, valueAt, inspection, atlasImage };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.AliceRig = api;
})(typeof window !== 'undefined' ? window : globalThis);
