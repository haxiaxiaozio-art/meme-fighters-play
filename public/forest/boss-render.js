(function (root) {
  'use strict';
  const A = root.AliceSprites;
  const circle = (c, x, y, rx, ry, color) => { c.fillStyle = color; c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); c.fill(); };
  function rose(c, x, y, size = 8, color, image) {
    A.drawProp(c,image,'rose',x,y,{scale:size*2/270});
  }
  function parasol(c, x, y, angle = 0, open = true, scale = 1, image) {
    A.drawProp(c,image,open?'openParasol':'closedParasol',x,y,{angle,scale:.27*scale,origin:open?[192,220]:[220,278]});
  }
  function hat(c, x, y, angle = 0, image) {
    A.drawProp(c,image,'hat',x,y,{angle,scale:.18,origin:[200,285]});
  }
  function dagger(c, x, y, angle, image) { A.drawProp(c,image,'dagger',x,y,{angle,scale:.1}); }
  function heart(c, x, y, size, color, image) { A.drawProp(c,image,'heart',x,y,{scale:size*2.4/270}); }
  function warningLine(c, line, active = false) {
    c.save(); c.strokeStyle = active ? '#cce4b0' : '#de91aa99'; c.lineWidth = root.AliceBoss.CONFIG.thornWidth;
    if (!active) { c.globalAlpha = .25; } c.beginPath(); c.moveTo(line.x, line.y); c.lineTo(line.endX, line.endY); c.stroke();
    c.globalAlpha = 1; c.lineWidth = active ? 4 : 2; if (!active) c.setLineDash([10, 8]);
    c.beginPath(); c.moveTo(line.x, line.y); c.lineTo(line.endX, line.endY); c.stroke();
    if (active) {
      const length = Math.hypot(line.endX - line.x, line.endY - line.y), angle = Math.atan2(line.endY - line.y, line.endX - line.x);
      c.translate(line.x, line.y); c.rotate(angle); c.fillStyle = '#759263';
      for (let x = 20; x < length; x += 31) { c.beginPath(); c.moveTo(x - 8, 0); c.lineTo(x + 4, -10); c.lineTo(x + 10, 0); c.lineTo(x - 4, 10); c.closePath(); c.fill(); }
    }
    c.restore();
  }
  function animal(c, q, image) {
    circle(c,q.x,q.y+2,25,5,'#10221b66'); A.drawAnimal(c,image,q);
  }
  function draw(c, challenge, image, fxImages) {
    const b = challenge.boss;
    if (b.state === 'telegraph' && b.attack === 'thorn') for (const line of challenge.thornLines()) warningLine(c, line);
    for (const line of challenge.thorns) root.AliceFx.thorn(c, fxImages?.thorn, line);
    for (const cloud of challenge.butterflyClouds) for (let i = 0; i < cloud.count; i++) {
      const a = i * Math.PI * 2 / cloud.count + cloud.time * 2;
      root.AliceFx.butterfly(c, fxImages?.butterfly, cloud.x + Math.cos(a) * 17, cloud.y + Math.sin(a) * 13, cloud.time + i);
    }
    for (const q of challenge.blooms) {
      const radius = q.radius ?? root.AliceBoss.CONFIG.bloomRadius[b.phase];
      const size = radius;
      c.save(); c.globalAlpha = q.exploded ? Math.max(0, 1 - (q.age - .7) / .4) : .8;
      if (q.exploded) { circle(c, q.x, q.y, radius, radius, '#d68baa35'); }
      c.strokeStyle = q.exploded ? '#ebaccb' : '#ad789b'; c.lineWidth = 2;
      if (!q.exploded) c.setLineDash([5, 7]);
      c.beginPath(); c.arc(q.x, q.y, size, 0, Math.PI * 2); c.stroke();
      if (!q.exploded) {
        c.setLineDash([]); c.strokeStyle = '#72986a'; c.beginPath(); c.moveTo(q.x - 20, q.y + 12); c.quadraticCurveTo(q.x, q.y - 35, q.x + 24, q.y + 8); c.stroke(); rose(c, q.x, q.y, 9 + q.age * 15, null, image);
      } c.restore();
    }
    for (const q of challenge.summons) animal(c, q, image);
    for (const q of challenge.projectiles) {
      if (q.delay > 0) {
        const bounds = [q.vx > 0 ? (1245 - q.x) / q.vx : q.vx < 0 ? (35 - q.x) / q.vx : Infinity, q.vy > 0 ? (590 - q.y) / q.vy : q.vy < 0 ? (90 - q.y) / q.vy : Infinity];
        const length = Math.max(0, Math.min(...bounds));
        c.save(); c.setLineDash([7, 8]); c.strokeStyle = '#e2abc588'; c.lineWidth = 2; c.beginPath(); c.moveTo(q.x, q.y); c.lineTo(q.x + q.vx * length, q.y + q.vy * length); c.stroke(); c.restore(); continue;
      }
      if (q.kind === 'dagger') dagger(c, q.x, q.y, Math.atan2(q.vy, q.vx), image);
      else if (q.kind === 'butterfly') root.AliceFx.butterfly(c, fxImages?.butterfly, q.x, q.y, challenge.worldElapsed);
      else if (q.kind === 'card') {
        c.save(); c.strokeStyle = '#e7687899'; c.lineWidth = 3; c.beginPath();
        (q.trail || []).forEach((point, i) => i ? c.lineTo(point.x, point.y) : c.moveTo(point.x, point.y)); c.lineTo(q.x, q.y); c.stroke();
        A.drawProp(c,image,'card',q.x,q.y,{angle:challenge.worldElapsed*6,scale:.095}); c.restore();
      }
      else if (q.kind === 'candy') {
        A.drawProp(c,image,'candy',q.x,q.y,{angle:challenge.worldElapsed*4,scale:.1});
      } else {
        c.strokeStyle = q.homing ? '#de99d975' : '#b8dccf60'; c.lineWidth = 2; c.beginPath(); c.moveTo(q.x, q.y); c.lineTo(q.x - q.vx * .045, q.y - q.vy * .045); c.stroke(); rose(c, q.x, q.y, q.kind === 'rose' ? 9 : 7, q.homing ? '#c787dd' : '#dc8c9e', image);
      }
    }
    if (challenge.hat) hat(c, challenge.hat.x, challenge.hat.y, Math.sin(challenge.hat.time * 3) * .13, image);
    if (challenge.umbrella && !challenge.umbrella.returned) parasol(c, challenge.umbrella.x, challenge.umbrella.y, challenge.umbrella.angle, true, .9, image);
    if (challenge.status === 'won') return;
    circle(c, b.x, 594, 27, 6, '#0b201978');
    A.draw(c, challenge, image);
    if (challenge.heart) {
      const h = challenge.heart;
      c.save(); c.strokeStyle = '#e891b377'; c.lineWidth = 1.5; c.setLineDash([5, 6]); c.beginPath(); c.moveTo(h.x, h.y); c.lineTo(b.x, b.y - 60); c.stroke(); c.setLineDash([]);
      c.strokeStyle = '#e9adc688'; c.lineWidth = 3; c.beginPath(); c.ellipse(b.x, b.y - 58, 43, 76, 0, 0, Math.PI * 2); c.stroke();
      circle(c, h.x, h.y, 34, 34, '#cc69932b'); heart(c, h.x, h.y, 22, h.flash > 0 ? '#ffe1e9' : '#dd658d', image);
      c.fillStyle = '#43273c'; c.fillRect(h.x - 30, h.y + 32, 60, 5); c.fillStyle = '#ef9ab7'; c.fillRect(h.x - 30, h.y + 32, 60 * h.hp / h.maxHP, 5);
      c.font = '12px "Microsoft YaHei",sans-serif'; c.textAlign = 'center'; c.fillStyle = '#f9c5dc'; c.fillText('红心 ' + Math.ceil(h.hp), h.x, h.y + 52); c.restore();
    }
    if (b.state === 'laugh' || b.state === 'counterStance') {
      c.save(); c.font = 'bold 18px "Microsoft YaHei",sans-serif'; c.textAlign = 'center'; c.fillStyle = b.state === 'laugh' ? '#f0dba4' : '#ed98b7';
      c.fillText(b.state === 'laugh' ? '哈、哈哈！' : '当身 · 停止攻击', b.x, Math.max(110, b.y - 155));
      if (b.state === 'counterStance') { c.strokeStyle = '#ed98b7'; c.lineWidth = 3; c.beginPath(); c.arc(b.x, b.y - 60, 63, 0, Math.PI * 2 * Math.max(0, 1 - b.time / root.AliceBoss.CONFIG.counterDuration[b.phase])); c.stroke(); }
      c.restore();
    }
    if (b.state === 'telegraph') {
      c.strokeStyle = '#efb6c9'; c.lineWidth = 2; c.beginPath(); c.arc(b.x, b.y - 70, 83, -Math.PI / 2, -Math.PI / 2 + Math.min(1, b.time / challenge.telegraphDuration()) * Math.PI * 2); c.stroke();
      c.fillStyle = '#f3d4e3'; c.font = '14px "Microsoft YaHei", sans-serif'; c.textAlign = 'center'; c.fillText(root.AliceBoss.LABELS[b.attack], b.x, Math.max(135, b.y - 177));
    }
    if (b.state === 'triple') {
      const reach = root.AliceBoss.CONFIG.umbrellaReach[b.phase];
      if ([.28, .7, 1.12].some(at => b.time >= at && b.time < at + .13)) {
        c.save(); c.translate(b.x, b.y - 53); c.scale(b.facing, 1);
        c.fillStyle = '#d7d6ed19'; c.strokeStyle = '#d7d6ed'; c.lineWidth = 3;
        c.beginPath(); c.ellipse(0, 0, reach, 53, 0, -Math.PI / 2, Math.PI / 2); c.closePath(); c.fill(); c.stroke(); c.restore();
      }
    }
    if (challenge.bindTimer > 0) {
      const p = challenge.player; c.strokeStyle = '#c48cd6'; c.lineWidth = 3;
      for (let i = 0; i < 3; i++) { c.beginPath(); c.ellipse(p.x, p.y - 17 - i * 22, 25, 10, -.2, 0, Math.PI * 2); c.stroke(); }
    }
  }
  root.AliceArt = { draw, sprites: A };
})(window);
