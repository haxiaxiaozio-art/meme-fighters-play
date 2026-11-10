(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  const canvas = $('canvas'), ctx = canvas.getContext('2d'), stage = $('game');
  const defeat = window.ForestDefeatScreen.mount(stage);
  const S = window.SwordSprites, W = window.WolfSprites, FX = window.WolfFx, P = window.PixelWorld, A = window.AliceSprites, E = window.ForestEngine, B = window.ForestKeys, Audio = window.ForestAudio;
  let bindingStorage;
  try { bindingStorage = window.localStorage; } catch { bindingStorage = null; }
  let bindings = B.load(bindingStorage), keymap = B.keymap(bindings);
  let settingsOpen = false, bindingDraft = null, capturingAction = null;
  let practice = new E.Practice(), gameKind = 'practice';
  const isChallenge = () => gameKind === 'challenge';
  const wolfAsset = new Image(), combatAsset = new Image();
  let wolfReady = false, combatReady = false, wolfError = null, combatError = null, worldState = null, fxState = null, aliceState = null, aliceFxState = null;
  const effects = new FX.System();
  const soundSystem = new Audio.System({ AudioClass: window.AudioContext || window.webkitAudioContext, onError: message => { $('audio-status').textContent = message; } });
  try { const saved = bindingStorage?.getItem('forest.audio.volume.v1'); if (saved !== null && saved !== undefined && Number.isFinite(Number(saved))) soundSystem.setVolume(Number(saved)); } catch { /* Local volume is optional. */ }
  function updateAssetStatus() {
    const error = wolfError || combatError || aliceState?.error || aliceFxState?.error || fxState?.error || worldState?.error, ready = wolfReady && combatReady && fxState?.ready && worldState?.ready && aliceState?.ready && aliceFxState?.ready;
    $('hero-asset-status').hidden = !!ready;
    $('hero-asset-status').textContent = error ? '素材加载失败，请确认 ' + error + ' 与游戏放在一起，再重新打开。' : '正在载入角色与像素森林…';
    $('challenge-button').disabled = $('start-button').disabled = !ready;
  }
  function assetFailure() {
    wolfReady = false; wolfError = W.ASSET; updateAssetStatus();
  }
  wolfAsset.onload = () => {
    if (wolfAsset.naturalWidth !== W.WIDTH || wolfAsset.naturalHeight !== W.HEIGHT) { assetFailure(); return; }
    wolfReady = true; updateAssetStatus();
    if (!$('sequence-panel').hidden) drawSequence();
  };
  wolfAsset.onerror = assetFailure;
  wolfAsset.src = W.ASSET;
  combatAsset.onload = () => {
    if (combatAsset.naturalWidth !== W.combat.width || combatAsset.naturalHeight !== W.combat.height) { combatAsset.onerror(); return; }
    combatReady = true; updateAssetStatus();
    if (!$('sequence-panel').hidden) drawSequence();
  };
  combatAsset.onerror = () => { combatReady = false; combatError = W.combat.asset; updateAssetStatus(); };
  combatAsset.src = W.combat.asset;
  worldState = P.load(Image, updateAssetStatus);
  fxState = FX.load(Image, updateAssetStatus);
  aliceState = A.load(Image, updateAssetStatus);
  aliceFxState = window.AliceFx.load(Image, updateAssetStatus);
  const defeatedPortrait = new Image(); defeatedPortrait.src = 'assets/alice-pixel/defeated-portrait.png';
  const held = new Set(), edges = new Set(), keyHeld = new Set(), touchHeld = new Map();
  const edgeDirections = new Map();
  const iconPaths = {
    specialNeutral: 'M19 7a8 8 0 1 0 1 8 M19 3v5h-5 M8 15l8-8 M8 11v4h4',
    specialUp: 'M12 21V4 M7 9l5-5 5 5 M5 20c5-1 9-4 12-10',
    specialDown: 'M12 3v14 M7 12l5 5 5-5 M3 21l5-2 4 2 4-2 5 2',
    specialSide: 'M3 12h18 M7 8l-4 4 4 4 M17 8l4 4-4 4 M10 5l4 14',
    dashAttack: 'M4 20 18 6l3-3-1 6L7 22 M3 15l6 6 M2 7h8 M3 3h11',
    specialDash: 'M2 6h10 M2 12h6 M2 18h10 M10 12h12 M17 7l5 5-5 5 M14 3l-3 18',
    dash: 'M2 7h8 M2 12h5 M2 17h8 M11 5l7 7-7 7 M16 5l7 7-7 7',
    defense: 'M12 2 21 6v6c0 6-9 10-9 10S3 18 3 12V6l9-4 M12 6v12'
  };
  const abilitySlots = Object.entries(E.ABILITIES).filter(([, a]) => !a.hidden).map(([id, a]) => {
    const slot = document.createElement('div'); slot.className = 'ability-slot'; slot.dataset.ability = id;
    slot.innerHTML = '<div class="ability-mask"></div><svg viewBox="0 0 24 24" aria-hidden="true"><path d="' + iconPaths[id] + '"></path></svg><span class="ability-name"></span><span class="ability-key"></span><span class="ability-state"></span>';
    slot.querySelector('.ability-name').textContent = a.label;
    slot.querySelector('.ability-key').textContent = a.keys;
    $('ability-dock').appendChild(slot);
    return { id, slot, mask: slot.querySelector('.ability-mask'), state: slot.querySelector('.ability-state'), name: slot.querySelector('.ability-name') };
  });
  let mode = 'title', sound = true, last = performance.now(), accumulator = 0;
  let viewW = 1280, camera = 0, toastTimer = 0, popups = [], lastHud = '', motion = !matchMedia('(prefers-reduced-motion: reduce)').matches;
  function ellipse(c, x, y, rx, ry, color) { c.fillStyle = color; c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); c.fill(); }
  function poly(c, points, color) { c.fillStyle = color; c.beginPath(); points.forEach((p, i) => i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])); c.closePath(); c.fill(); }
  function stroke(c, points, color, width) { c.strokeStyle = color; c.lineWidth = width; c.lineCap = 'round'; c.beginPath(); points.forEach((p, i) => i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])); c.stroke(); }
  function resize() {
    const r = stage.getBoundingClientRect(), dpr = Math.min(devicePixelRatio || 1, 2);
    viewW = Math.min(1280, 720 * r.width / r.height);
    canvas.width = Math.round(viewW * dpr); canvas.height = Math.round(720 * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  new ResizeObserver(resize).observe(stage); resize();
  function drawDummy(time) {
    const d = practice.dummy;
    ellipse(ctx, d.x, E.GROUND + 3, 36, 9, '#09231770');
    ctx.save(); ctx.translate(d.x, d.y); ctx.rotate(Math.sin(time * 25) * d.sway * .008);
    ctx.fillStyle = '#775a3e'; ctx.fillRect(-8, -98, 16, 98);
    stroke(ctx, [[-32, -63], [33, -63]], '#997b50', 10);
    poly(ctx, [[-21, -83], [20, -83], [25, -40], [-22, -40]], '#6b6148');
    poly(ctx, [[-14, -80], [16, -80], [17, -44], [-14, -44]], d.flash ? '#eed5a0' : '#9a8260');
    stroke(ctx, [[-21, -69], [22, -67]], '#c2a171', 3);
    ellipse(ctx, 0, -98, 17, 20, d.flash ? '#f2d994' : '#a99668');
    poly(ctx, [[-19, -106], [0, -124], [20, -106]], '#77734e');
    stroke(ctx, [[-7, -99], [-4, -99]], '#524e32', 2); stroke(ctx, [[5, -99], [8, -99]], '#524e32', 2);
    ellipse(ctx, 1, -61, 10, 11, '#98724d'); ellipse(ctx, 1, -61, 5, 6, '#c9a377');
    if (d.windup > 0) {
      ellipse(ctx, 1, -61, 17 + Math.sin(d.windup * 26) * 4, 17 + Math.sin(d.windup * 26) * 4, '#f0946388');
      ctx.strokeStyle = '#f0b078'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(1, -61, 26, -Math.PI / 2, -Math.PI / 2 + (1 - d.windup / .55) * Math.PI * 2); ctx.stroke();
    }
    ctx.restore();
    ctx.fillStyle = d.windup ? '#f1c39a' : '#c2c6a1'; ctx.font = '10px "Microsoft YaHei", sans-serif'; ctx.textAlign = 'center'; ctx.fillText(d.windup ? '准备攻击' : '练习木桩', d.x, d.y - 144);
  }
  function swordEffects(p, layer = 'back') {
    if (!fxState.ready) return;
    const duration = practice.actionDuration(p.action, p.actionWeapon), pose = W.sample(p, duration);
    FX.drawAction(ctx, fxState.images, p, duration, layer, W.attachment(pose));
  }
  function render(now) {
    const time = mode === 'title' ? now / 1000 : practice.worldElapsed, p = practice.player;
    const hero = mode === 'title' ? { ...p, x: 585, action: 'idle', time } : p;
    const focusX = isChallenge() ? (hero.x + practice.boss.x) / 2 : hero.x;
    const targetCam = Math.max(0, Math.min(1280 - viewW, focusX - viewW * .5));
    camera += (targetCam - camera) * .1;
    const dpr = canvas.height / 720; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, viewW, 720); ctx.save();
    const shake = motion && mode === 'playing' ? practice.shake : 0;
    ctx.translate(-camera + (Math.random() - .5) * shake, (Math.random() - .5) * shake);
    if (worldState.ready) P.draw(ctx, worldState.images, E.GROUND, E.WIDTH, 720);
    else { ctx.fillStyle = '#143c46'; ctx.fillRect(0, 0, 1280, 720); }
    if (practice.rewardTimer > 0) {
      ctx.fillStyle = '#7ba8b916'; ctx.fillRect(camera, 0, viewW, 720);
      if (motion) {
        ctx.strokeStyle = '#d5edc52b'; ctx.lineWidth = 1;
        for (let i = 0; i < 7; i++) stroke(ctx, [[camera + i * viewW / 6, 110], [hero.x, hero.y - 50]], '#d5edc517', 1);
      }
    }
    if (motion) {
      for (let i = 0; i < 22; i++) {
        const x = (i * 137 + time * (4 + i % 4)) % 1280, y = 180 + (i * 97 % 360) + Math.sin(time * .7 + i) * 19;
        ellipse(ctx, x, y, i % 3 ? 1.3 : 2, i % 3 ? 1.3 : 2, '#e0dda759');
      }
    }
    if (isChallenge()) window.AliceArt.draw(ctx, practice, aliceState.image, aliceFxState.images);
    else drawDummy(mode === 'paused' ? practice.elapsed : time);
    if (fxState.ready) for (const q of practice.friendlyDaggers) FX.drawProjectile(ctx, fxState.images, q);
    for (const bolt of isChallenge() ? [] : practice.projectiles) {
      const angle = Math.atan2(bolt.vy, bolt.vx);
      ctx.save(); ctx.translate(bolt.x, bolt.y); ctx.rotate(angle);
      stroke(ctx, [[-32, 0], [-6, 0]], '#f2ac6780', 4);
      poly(ctx, [[11, 0], [-3, -7], [-10, 0], [-3, 7]], '#eead75');
      poly(ctx, [[7, 0], [-2, -3], [-6, 0], [-2, 3]], '#fff1bd');
      ctx.restore();
    }
    ellipse(ctx, hero.x, E.GROUND + 4, Math.max(10, 27 - (E.GROUND - hero.y) * .05), 6, '#102c1d80');
    if (wolfReady && combatReady && fxState.ready) for (const ghost of practice.ghosts) W.draw(ctx, wolfAsset, W.sampleGhost(ghost), ghost.x, ghost.y, ghost.facing, ghost.life / .2 * .28, p.actionWeapon, combatAsset, fxState.images);
    swordEffects(hero);
    if (fxState.ready) {
      FX.drawMagic(ctx, fxState.images, practice.magicEffect);
      FX.drawAmbient(ctx, fxState.images, practice, hero);
      effects.draw(ctx, fxState.images, 'back');
    }
    const heroAlpha = hero.action === 'airEvade' || p.phaseTimer > 0 ? .65 : (p.invulnerable > .2 ? .65 + Math.sin(practice.elapsed * 40) * .2 : 1);
    const heroPose = W.sample(hero, practice.actionDuration(hero.action, hero.actionWeapon));
    if (wolfReady && combatReady && fxState.ready) W.draw(ctx, wolfAsset, heroPose, hero.x, hero.y, hero.facing, heroAlpha, hero.actionWeapon, combatAsset, fxState.images);
    swordEffects(hero, 'front');
    if (fxState.ready) effects.draw(ctx, fxState.images, 'front');
    for (const q of popups) { ctx.globalAlpha = Math.min(1, q.life * 2); ctx.fillStyle = '#f3d49b'; ctx.font = 'bold 23px "Palatino Linotype", serif'; ctx.textAlign = 'center'; ctx.fillText(q.text, q.x, q.y); } ctx.globalAlpha = 1;
    ctx.restore();
    const frame = heroPose.frame, a = S.animations[hero.action];
    const signature = hero.action + ':' + heroPose.clip + ':' + frame + ':' + practice.hits;
    if (signature !== lastHud) {
      $('action-name').textContent = a.label;
      $('frame-number').textContent = '白狼 · ' + String(frame + 1).padStart(2, '0') + ' / ' + String(heroPose.count).padStart(2, '0');
      $('hit-count').textContent = String(practice.hits).padStart(2, '0'); lastHud = signature;
    }
    $('reward-hud').hidden = practice.rewardTimer <= 0 || mode === 'title';
    $('reward-seconds').textContent = practice.rewardTimer.toFixed(1) + 's';
    $('reward-fill').style.width = practice.rewardTimer / practice.rewardDuration * 100 + '%';
    $('reward-kind').textContent = practice.rewardScale === E.COUNTER_SCALE ? '格挡反击 · 双方减速' : '格挡成功 · 双方减速';
    $('weapon-name').textContent = E.WEAPONS[p.weapon].label;
    $('weapon-key').textContent = key('switchWeapon');
    $('weapon-hud').hidden = mode === 'title'; $('weapon-hud').dataset.weapon = p.weapon;
    $('weapon-detail').textContent = p.boostTimer > 0 ? '增伤 +50% · ' + p.boostTimer.toFixed(1) + 's' : p.weapon === 'staff' ? '慢攻 / 清弹 / 回血' : p.weapon === 'dagger' ? '速攻 / 移动回避' : '剑式 / 原地回避';
    $('jump-charge').textContent = '跳跃 ' + Math.max(0, 2 - p.jumpsUsed) + ' / 2';
    $('touch-weapon').textContent = '切换 · ' + E.WEAPONS[p.weapon].label;
    const weaponStats = E.WEAPONS[p.weapon];
    $('defense-caption').textContent = '地面格挡 ' + Math.round(weaponStats.guard * 60) + ' 帧 / 空中回避 ' + Math.round(weaponStats.airEvade * 60) + ' 帧';
    $('defense-hint').textContent = '面向攻击；普通格挡奖励 ' + weaponStats.reward + ' 秒，特殊反击奖励 ' + weaponStats.counterReward + ' 秒。' + (p.weapon === 'dagger' ? '空中回避可左右移动。' : '空中回避保持原地。');
    $('block-count').textContent = practice.blocks; $('evade-count').textContent = practice.evades; $('hurt-count').textContent = practice.received;
    $('combo-display').hidden = practice.combo <= 1; $('combo-count').textContent = practice.combo;
    stage.classList.toggle('reward-active', practice.rewardTimer > 0);
    stage.classList.toggle('in-practice', mode !== 'title');
    stage.classList.toggle('in-challenge', isChallenge() && mode !== 'title');
    if (isChallenge()) {
      const b = practice.boss;
      $('boss-hp').textContent = Math.ceil(b.hp) + ' / 3000';
      $('boss-phase').textContent = ['第一阶段', '第二阶段', '第三阶段'][b.phase - 1];
      $('alice-hp-fill').style.width = b.hp / b.maxHP * 100 + '%';
      $('boss-attack').textContent = b.state === 'telegraph' ? '准备 · ' + window.AliceBoss.LABELS[b.attack] : window.AliceBoss.LABELS[b.attack] || '玫瑰阳伞';
      if (b.state === 'laugh') $('boss-attack').textContent = '大笑 · 喘息机会';
      if (b.state === 'counterStance') $('boss-attack').textContent = '当身 · 停止攻击爱丽丝';
      if (practice.heart) $('boss-attack').textContent += ' · 红心保护 ' + Math.ceil(practice.heart.hp) + ' HP';
      $('player-hp-number').textContent = practice.player.hp + ' / ' + practice.player.maxHP;
      $('player-hp-fill').style.width = practice.player.hp / practice.player.maxHP * 100 + '%';
      $('bind-status').textContent = practice.bindTimer > 0 ? '束缚 ' + practice.bindTimer.toFixed(1) + 's · 可攻击 / 格挡' : '';
      $('phase-announcement').hidden = practice.status !== 'transition';
      if (practice.status === 'transition') {
        $('phase-title').textContent = b.phase === 2 ? '礼帽的秘密' : '最后一场茶会';
        $('phase-description').textContent = b.phase === 2 ? '第二阶段 · 场中匕首 / 加速 / 追踪花弹' : '第三阶段 · 猫兔常驻 / 千刀万剐 / 伞折射';
      }
    }
    for (const { id, slot, mask, state, name } of abilitySlots) {
      const status = practice.abilityState(id);
      slot.hidden = !status.visible;
      slot.classList.toggle('cooling', status.remaining > 0);
      slot.classList.toggle('free', status.free);
      slot.classList.toggle('context-unavailable', !status.contextReady);
      mask.style.transform = 'scaleY(' + status.remaining / status.duration + ')';
      const text = status.free ? '无CD' : status.remaining > 0 ? (Math.ceil(status.remaining * 10) / 10).toFixed(1) + 's' : !status.contextReady ? id === 'specialDown' ? '需落地' : '先冲刺' : id === 'dashAttack' || id === 'specialDash' ? '可接' : '就绪';
      if (state.textContent !== text) state.textContent = text;
      if (id === 'defense') name.textContent = p.grounded ? '格挡' : '空中回避';
      else name.textContent = status.label;
      slot.classList.toggle('active', p.action === id || (id === 'specialNeutral' && ['daggerSpecial', 'staffHeal'].includes(p.action)) || (id === 'specialDown' && ['counterGuard', 'riposte', 'staffPurge'].includes(p.action)) || (id === 'defense' && ['guard', 'parry', 'airEvade'].includes(p.action)));
      slot.setAttribute('aria-label', status.label + '，' + B.abilityKey(bindings, id) + '，' + text);
    }
  }
  function initializeAudio() { return soundSystem.unlock(); }
  function notify(text) { $('toast').textContent = text; $('toast').classList.add('visible'); toastTimer = 1.5; }
  function syncHeld() {
    held.clear(); for (const code of keyHeld) if (keymap[code]) held.add(keymap[code]);
    for (const control of touchHeld.values()) held.add(control);
  }
  function captureEdge(action) {
    edges.add(action);
    if (['attack', 'special', 'dash', 'defense'].includes(action)) edgeDirections.set(action, { left: held.has('left'), right: held.has('right'), up: held.has('up'), down: held.has('down') });
  }
  function clearInput() { held.clear(); edges.clear(); edgeDirections.clear(); keyHeld.clear(); touchHeld.clear(); document.querySelectorAll('.pressed').forEach(b => b.classList.remove('pressed')); }
  const key = action => B.primary(bindings, action);
  function refreshKeyHints() {
    for (const { id, slot } of abilitySlots) slot.querySelector('.ability-key').textContent = B.abilityKey(bindings, id);
    $('practice-instruction').textContent = isChallenge() ? key('defense') + ' 格挡 · ' + key('attack') + ' / 方向 + ' + key('special') + ' 接续连招' : key('trainingShot') + ' 发射练习弹 · ' + key('defense') + ' 格挡后衔接连招';
    $('start-hint').textContent = key('jump') + ' 二段跳 · ' + key('attack') + ' 攻击 · ' + key('dash') + ' 冲刺 · ' + key('special') + ' 技能 · ' + key('switchWeapon') + ' 切换武器';
    $('attack-guide').textContent = '连续按 ' + key('attack') + '：三段连击。空中按 ' + key('attack') + '：跳跃攻击。';
    $('reward-hud').querySelector('small').textContent = '玩家 ' + Math.round(E.PLAYER_SCALE * 100) + '% 速度 · 技能保留 CD · ' + key('attack') + ' / ' + key('special') + ' 衔接';
    const guide = document.querySelector('.keyboard-guide'); guide.replaceChildren();
    for (const [actions, text] of [[['left', 'right'], '移动'], [['jump'], '二段跳'], [['attack'], '攻击'], [['dash'], '冲刺'], [['special'], '特殊键'], [['defense'], '格挡 / 回避'], [['switchWeapon'], '切换武器'], [[], '暂停']]) {
      const span = document.createElement('span');
      for (const text of actions.length ? actions.map(key) : ['Esc']) { const k = document.createElement('kbd'); k.textContent = text; span.appendChild(k); }
      span.appendChild(document.createTextNode(' ' + text)); guide.appendChild(span);
    }
    const combos = ['specialUp', 'specialDown', 'specialSide', 'specialNeutral', 'dashAttack', 'specialDash'];
    document.querySelectorAll('.skills kbd').forEach((k, i) => { k.textContent = B.abilityKey(bindings, combos[i]); });
    document.querySelector('.skills small').textContent = '匕首：' + key('special') + ' 发射往返飞刀并虚化增伤。法杖：' + key('special') + ' 回复 30 HP；' + key('down') + ' + ' + key('special') + ' 圆形清弹。' + key('switchWeapon') + ' 按剑 → 匕首 → 法杖循环切换。';
    document.querySelector('.defense-training p>kbd').textContent = key('defense');
    $('shot-button').querySelector('kbd').textContent = key('trainingShot');
    stage.setAttribute('aria-label', '剑式练习，' + key('left') + ' / ' + key('right') + ' 移动，' + key('jump') + ' 二段跳，' + key('attack') + ' 攻击，' + key('dash') + ' 冲刺，' + key('special') + ' 配合方向释放技能，' + key('defense') + ' 格挡或空中回避，' + key('switchWeapon') + ' 切换剑、匕首与法杖，Esc 暂停并调整键位');
  }
  function bindingStatus(text, error = false) { $('keybind-status').textContent = text; $('keybind-status').classList.toggle('error', error); }
  function renderBindingRows() {
    $('keybind-list').replaceChildren();
    for (const action of B.ACTIONS) {
      const row = document.createElement('div'); row.className = 'keybind-row';
      const label = document.createElement('span'); label.textContent = action.label;
      const button = document.createElement('button'); button.className = 'keybind-key'; button.dataset.bindAction = action.id;
      button.textContent = bindingDraft[action.id].map(B.label).join(' / ');
      button.setAttribute('aria-label', '调整' + action.label + '键位');
      button.addEventListener('click', () => {
        capturingAction = action.id;
        document.querySelectorAll('.keybind-key').forEach(b => { b.classList.remove('capturing'); b.textContent = bindingDraft[b.dataset.bindAction].map(B.label).join(' / '); });
        button.classList.add('capturing'); button.textContent = '请按新键…';
        bindingStatus('为“' + action.label + '”按下新键，Esc 取消此次输入。');
      });
      row.append(label, button); $('keybind-list').appendChild(row);
    }
  }
  function openSettings() {
    if (mode !== 'paused') return;
    clearInput(); settingsOpen = true; bindingDraft = B.copy(bindings); capturingAction = null;
    $('overlay').classList.add('settings-overlay');
    $('state-panel').hidden = true; $('keybind-panel').hidden = false;
    renderBindingRows(); bindingStatus('游戏保持暂停，保存后生效。');
    $('keybind-list').scrollTop = 0; $('keybind-close').focus({ preventScroll: true });
  }
  function closeSettings() {
    settingsOpen = false; capturingAction = null; bindingDraft = null; clearInput();
    $('overlay').classList.remove('settings-overlay');
    $('keybind-panel').hidden = true;
    if (mode === 'paused') { $('state-panel').hidden = false; $('keybind-button').focus({ preventScroll: true }); }
  }
  function settingsKey(event) {
    if (event.repeat) return;
    if (capturingAction) {
      event.preventDefault();
      const action = capturingAction;
      if (event.code === 'Escape') { capturingAction = null; renderBindingRows(); bindingStatus('已取消此次输入，其他调整保留。'); }
      else {
        const result = B.assign(bindingDraft, action, event.code);
        if (!result.ok) { bindingStatus(result.error, true); return; }
        bindingDraft = result.bindings; capturingAction = null; renderBindingRows();
        bindingStatus('“' + B.ACTIONS.find(a => a.id === action).label + '”已改为 ' + B.label(event.code) + '，点击保存生效。');
      }
      const button = $('keybind-list').querySelector('[data-bind-action="' + action + '"]');
      button.focus({ preventScroll: true }); button.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    } else if (event.code === 'Escape') { event.preventDefault(); closeSettings(); }
  }
  function begin(kind = 'practice', retrying = false) {
    if (!wolfReady || !combatReady || !fxState.ready || !worldState.ready || !aliceState.ready || !aliceFxState.ready) return;
    closeSettings();
    soundSystem.stopAll(); soundSystem.setPaused(retrying);
    gameKind = kind;
    practice = isChallenge() ? new window.AliceBoss.Challenge() : new E.Practice(); effects.clear();
    mode = retrying ? 'recovering' : 'playing'; camera = Math.max(0, practice.player.x - viewW * .44);
    clearInput(); accumulator = 0; popups = []; $('overlay').hidden = true; $('hud').hidden = false;
    $('intro').hidden = true; $('title-alice').hidden = true; $('state-panel').hidden = true;
    $('overlay').classList.remove('title-overlay'); $('dialogue').hidden = true; $('phase-announcement').hidden = true;
    $('alice-hud').hidden = !isChallenge(); $('player-hp').hidden = !isChallenge();
    $('reset-button').innerHTML = (isChallenge() ? '重置挑战' : '重置练习') + ' <span aria-hidden="true">↻</span>';
    refreshKeyHints();
    $('pause-button').textContent = 'Ⅱ'; $('pause-button').setAttribute('aria-label', '暂停' + (isChallenge() ? '挑战' : '练习'));
    $('combat-summary').hidden = false;
    $('ability-dock').hidden = false;
    $('auto-attack-button').setAttribute('aria-pressed', 'false'); $('auto-attack-button').textContent = '自动攻击：关';
    if (retrying) { practice.start(); return; }
    initializeAudio(); stage.focus({ preventScroll: true });
    if (isChallenge()) showDialogue(false); else notify(key('trainingShot') + ' 发射练习弹，弹丸接近时按 ' + key('defense') + ' 格挡。');
  }
  function showDialogue(outro) {
    mode = 'dialogue'; clearInput(); accumulator = 0;
    $('dialogue').hidden = false; $('dialogue').classList.toggle('outro-dialogue', outro);
    $('dialogue-portrait').src = outro ? 'assets/alice-pixel/defeated-portrait.png' : 'assets/alice-pixel/model.png';
    $('dialogue-portrait').alt = outro ? '爱丽丝虚弱跪坐，扶着收起的玫瑰阳伞' : '爱丽丝立绘';
    $('dialogue-chapter').textContent = outro ? '终幕 · 尚未结束的仙境' : '序幕 · 仙境的来客';
    $('dialogue-line').textContent = outro ? '干得漂亮，不过你逃不出这里的。' : '一位白狼旅人，真有意思，欢迎来到仙境。';
    $('dialogue-next').innerHTML = (outro ? '继续' : '进入战斗') + ' <span aria-hidden="true">→</span>';
    $('dialogue-next').focus({ preventScroll: true });
  }
  function advanceDialogue() {
    if (mode !== 'dialogue') return;
    if (practice.status === 'intro') practice.start(); else practice.finishDialogue();
    mode = 'playing'; $('dialogue').hidden = true; clearInput(); accumulator = 0; stage.focus({ preventScroll: true });
  }
  function showResult(won) {
    mode = 'ended'; clearInput(); accumulator = 0;
    if (!won) {
      defeat.show({
        prepare: () => begin(gameKind, true),
        resume() {
          mode = 'playing'; clearInput(); accumulator = 0;
          soundSystem.setPaused(false); initializeAudio(); stage.focus({ preventScroll: true });
        },
        leave: returnTitle
      });
      return;
    }
    $('overlay').hidden = false; $('state-panel').hidden = false;
    $('state-eyebrow').textContent = '茶会暂告一段落';
    $('state-title').textContent = '爱丽丝已离场';
    $('keybind-button').hidden = true;
    $('state-copy').textContent = '挑战完成 · 最高 ' + practice.maxCombo + ' Combo · 成功格挡 ' + practice.blocks + ' 次';
    $('continue-button').innerHTML = '重新挑战 <span aria-hidden="true">→</span>';
    $('continue-button').focus({ preventScroll: true });
  }
  function returnTitle() {
    closeSettings();
    soundSystem.stopAll(); soundSystem.setPaused(false);
    practice = new E.Practice(); effects.clear(); gameKind = 'practice'; mode = 'title'; clearInput(); accumulator = 0;
    for (const id of ['hud', 'combat-summary', 'ability-dock', 'alice-hud', 'player-hp', 'phase-announcement', 'dialogue', 'state-panel']) $(id).hidden = true;
    $('overlay').hidden = false; $('intro').hidden = false; $('title-alice').hidden = false; $('overlay').classList.add('title-overlay');
    $('reset-button').innerHTML = '重置练习 <span aria-hidden="true">↻</span>'; $('challenge-button').focus({ preventScroll: true });
  }
  function pause() {
    if (settingsOpen) { closeSettings(); return; }
    if (mode !== 'playing' && mode !== 'paused') return;
    mode = mode === 'paused' ? 'playing' : 'paused'; soundSystem.setPaused(mode === 'paused'); clearInput(); accumulator = 0;
    $('overlay').hidden = mode === 'playing'; $('overlay').classList.remove('title-overlay'); $('intro').hidden = true; $('state-panel').hidden = false;
    $('pause-button').textContent = mode === 'paused' ? '▷' : 'Ⅱ'; $('pause-button').setAttribute('aria-label', mode === 'paused' ? '继续练习' : '暂停练习');
    $('state-eyebrow').textContent = '稍作停留'; $('state-title').textContent = '林间小憩';
    $('keybind-button').hidden = false;
    $('state-copy').textContent = '按 Esc 或点击按钮，继续' + (isChallenge() ? '挑战。' : '练习。');
    $('continue-button').innerHTML = '继续' + (isChallenge() ? '挑战' : '练习') + ' <span aria-hidden="true">→</span>';
    if (mode === 'paused') $('continue-button').focus({ preventScroll: true }); else { initializeAudio(); stage.focus({ preventScroll: true }); }
  }
  function tick(now) {
    const dt = Math.min((now - last) / 1000, .05); last = now;
    if (mode === 'playing') {
      accumulator += dt;
      while (accumulator >= E.STEP) {
        const input = { left: held.has('left'), right: held.has('right'), up: held.has('up'), down: held.has('down'), jumpHeld: held.has('jump'), jump: edges.has('jump'), attack: edges.has('attack'), dash: edges.has('dash'), special: edges.has('special'), defense: edges.has('defense'), trainingShot: edges.has('trainingShot'), switchWeapon: edges.has('switchWeapon') };
        const direction = ['defense', 'special', 'dash', 'attack'].find(action => edges.has(action));
        if (direction && edgeDirections.has(direction)) Object.assign(input, edgeDirections.get(direction));
        const beforeElapsed = practice.elapsed;
        practice.update(input, E.STEP);
        effects.advance(Math.max(0, practice.elapsed - beforeElapsed)); edges.clear(); edgeDirections.clear(); accumulator -= E.STEP;
        for (const event of practice.drainEvents()) {
          effects.ingest(event, practice);
          soundSystem.ingest(event, practice);
          if (event.type === 'notice') notify(event.text);
          else if (event.type === 'hit') { popups.push({ x: event.x, y: event.y, text: String(event.damage), life: .75 }); }
          else if (event.type === 'victory') showDialogue(true);
          else if (event.type === 'lost') showResult(false);
          else if (event.type === 'departed') showResult(true);
          else if (event.type === 'bossAttack' || event.type === 'phase') notify(event.text);

        }
        soundSystem.sync(practice);
        if (mode !== 'playing') break;
      }
      popups.forEach(q => { q.life -= dt; q.y -= dt * 38; }); popups = popups.filter(q => q.life > 0);
      toastTimer -= dt; if (toastTimer <= 0) $('toast').classList.remove('visible');
    }
    render(now); requestAnimationFrame(tick);
  }
  $('hud').hidden = true;
  $('start-button').addEventListener('click', () => begin('practice'));
  $('challenge-button').addEventListener('click', () => begin('challenge'));
  $('dialogue-next').addEventListener('click', advanceDialogue);
  $('back-button').addEventListener('click', returnTitle);
  $('continue-button').addEventListener('click', () => mode === 'ended' ? begin(gameKind) : pause());
  $('pause-button').addEventListener('click', pause);
  $('keybind-button').addEventListener('click', openSettings);
  $('keybind-close').addEventListener('click', closeSettings);
  $('keybind-cancel').addEventListener('click', closeSettings);
  $('keybind-defaults').addEventListener('click', () => { bindingDraft = B.copy(); capturingAction = null; renderBindingRows(); bindingStatus('已恢复默认，点击保存生效。'); });
  $('keybind-save').addEventListener('click', () => {
    if (!B.save(bindingStorage, bindingDraft)) { bindingStatus('暂时无法保存键位，请检查本机存储后重试。', true); return; }
    bindings = B.copy(bindingDraft); keymap = B.keymap(bindings); refreshKeyHints(); closeSettings(); notify('键位已保存，下次启动继续生效。');
  });
  $('reset-button').addEventListener('click', () => begin(gameKind));
  $('shot-button').addEventListener('click', () => {
    if (isChallenge() || mode === 'title') begin('practice'); else if (mode === 'paused') pause();
    practice.requestShot(); initializeAudio(); stage.focus({ preventScroll: true });
  });
  $('auto-attack-button').addEventListener('click', () => {
    if (isChallenge() || mode === 'title') begin('practice'); else if (mode === 'paused') pause();
    practice.setAutoAttacks(!practice.autoAttacks);
    $('auto-attack-button').setAttribute('aria-pressed', String(practice.autoAttacks));
    $('auto-attack-button').textContent = '自动攻击：' + (practice.autoAttacks ? '开' : '关');
    stage.focus({ preventScroll: true });
  });
  $('sound-button').addEventListener('click', () => { sound = !sound; soundSystem.setEnabled(sound); initializeAudio(); $('sound-button').setAttribute('aria-pressed', String(sound)); $('sound-button').setAttribute('aria-label', sound ? '关闭音效' : '开启音效'); $('sound-button').textContent = sound ? '♪' : '♩'; });
  for (const [id, cue] of Object.entries(Audio.config.definitions)) { const option = document.createElement('option'); option.value = id; option.textContent = cue.label; $('audio-select').appendChild(option); }
  $('audio-select').value = 'swordSlash';
  $('audio-volume').value = String(Math.round(soundSystem.volume * 100)); $('audio-volume-value').textContent = $('audio-volume').value + '%';
  $('audio-volume').addEventListener('input', () => { soundSystem.setVolume(Number($('audio-volume').value) / 100); $('audio-volume-value').textContent = $('audio-volume').value + '%'; try { bindingStorage?.setItem('forest.audio.volume.v1', String(soundSystem.volume)); } catch { /* Volume still applies for this session. */ } });
  $('audio-preview-button').addEventListener('click', async () => {
    if (!sound || soundSystem.volume === 0) { $('audio-status').textContent = '请先开启音效并调高音量。'; return; }
    if (mode === 'playing') pause();
    await initializeAudio(); soundSystem.stopAll();
    if (soundSystem.play($('audio-select').value, { audition: true, x: 640 })) $('audio-status').textContent = Audio.config.definitions[$('audio-select').value].label;
  });
  $('fullscreen-button').addEventListener('click', async () => {
    try { if (document.fullscreenElement) await document.exitFullscreen(); else if (stage.requestFullscreen) await stage.requestFullscreen(); else notify('浏览器暂不支持全屏。'); } catch { notify('浏览器暂不支持全屏。'); }
  });
  document.addEventListener('fullscreenchange', () => { $('fullscreen-button').setAttribute('aria-label', document.fullscreenElement ? '退出全屏' : '进入全屏'); });
  window.addEventListener('keydown', event => {
    if (settingsOpen) { settingsKey(event); return; }
    if (['SELECT', 'INPUT', 'TEXTAREA'].includes(event.target.tagName)) return;
    if (mode === 'dialogue' && (event.code === 'Enter' || event.code === 'Space')) { event.preventDefault(); if (!event.repeat) advanceDialogue(); return; }
    if (event.code === 'Escape') { if (mode !== 'title') event.preventDefault(); if (!event.repeat) pause(); return; }
    if (mode !== 'playing' || !keymap[event.code]) return;
    if (event.target.tagName === 'BUTTON' && event.code === 'Space') return;
    event.preventDefault();
    if (!keyHeld.has(event.code) && !event.repeat) captureEdge(keymap[event.code]);
    keyHeld.add(event.code); syncHeld();
  });
  window.addEventListener('keyup', event => { keyHeld.delete(event.code); syncHeld(); });
  window.addEventListener('blur', () => { if (mode === 'playing') pause(); clearInput(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden && mode === 'playing') pause(); });
  for (const button of document.querySelectorAll('[data-control]')) {
    button.addEventListener('pointerdown', event => {
      event.preventDefault(); if (mode !== 'playing') return;
      button.setPointerCapture(event.pointerId); touchHeld.set(event.pointerId, button.dataset.control); syncHeld(); captureEdge(button.dataset.control); button.classList.add('pressed');
    });
    const release = event => { touchHeld.delete(event.pointerId); syncHeld(); button.classList.remove('pressed'); };
    button.addEventListener('pointerup', release); button.addEventListener('pointercancel', release); button.addEventListener('lostpointercapture', release);
  }
  function drawSequence() {
    const name = $('sequence-select').value, rawFx = name.startsWith('fx-'), rawAlice = name.startsWith('alice-'), key = rawFx ? name.slice(3) : rawAlice ? name.slice(6) : name;
    const a = rawFx ? FX.data.clips[key] : rawAlice ? A.data.clips[key] : W.animationInfo(name), preview = $('sequence-canvas');
    const cellWidth = 280;
    preview.width = a.count * cellWidth; preview.height = 290;
    const c = preview.getContext('2d');
    for (let i = 0; i < a.count; i++) {
      const x = i * cellWidth + 130;
      c.fillStyle = i % 2 ? '#1d3025' : '#213429'; c.fillRect(i * cellWidth, 0, cellWidth, 290);
      if (wolfReady && combatReady && fxState.ready) {
        if (rawAlice && aliceState.ready) A.drawPose(c, aliceState.image, A.preview(key,i), x, 225, 1);
        else if (rawFx) FX.drawCel(c, fxState.images, key, i, x, ['ground','heal'].includes(key) ? 210 : 135, { scale:.46 });
        else if (!rawAlice) {
          const pose = W.preview(name, i), action = name === 'walk' ? 'run' : name === 'airdodge' ? 'airEvade' : name;
          const combat = W.combat.clips[action], duration = S.animations[action]?.duration || a.duration;
          const p = { action, time: combat ? (combat.edges[i] + .001) * duration : i / 8 * duration, x, y:190, facing:1, grounded:action !== 'airAttack' && !(action === 'specialDown' && i < 4), actionWeapon:practice.player.weapon };
          const hand = W.attachment(pose);
          FX.drawAction(c, fxState.images, p, duration, 'back', hand);
          W.draw(c, wolfAsset, pose, x, 190, 1, 1, practice.player.weapon, combatAsset, fxState.images);
          FX.drawAction(c, fxState.images, p, duration, 'front', hand);
        }
      }
      c.fillStyle = '#b4b99b'; c.font = '10px "Microsoft YaHei", sans-serif'; c.textAlign = 'center';
      c.fillText(String(i + 1).padStart(2, '0') + ' · ' + (rawFx || rawAlice ? a.label : W.phaseLabel(name, i)), i * cellWidth + 140, 275);
    }
  }
  $('sequence-button').addEventListener('click', () => { const panel = $('sequence-panel'); panel.hidden = !panel.hidden; $('sequence-button').setAttribute('aria-expanded', String(!panel.hidden)); if (!panel.hidden) drawSequence(); });
  $('sequence-select').addEventListener('change', drawSequence);
  // Read-only inspection surface used for reproducible verification and sprite export.
  window.demo = { snapshot: () => ({ ...practice.snapshot(), mode, gameKind, settingsOpen, character: 'wolf', audio: soundSystem.snapshot(), bossReady: aliceState.ready, characterReady: wolfReady && combatReady && fxState.ready, effects: effects.snapshot(), characterPose: W.sample(practice.player, practice.actionDuration()), bindings: B.copy(bindings), ...(isChallenge() ? { bossAnimation: A.inspection(practice) } : {}) }), atlas: wolfAsset, combatAtlas: combatAsset, aliceAtlas: aliceState.image, animations: S.animations, wolfAnimations: W.clips, combatAnimations: W.combat.clips };
  refreshKeyHints();
  requestAnimationFrame(tick);
})();
