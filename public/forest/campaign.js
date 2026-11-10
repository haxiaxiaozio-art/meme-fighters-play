(function(){
 'use strict';
 const $=id=>document.getElementById(id),D=window.ForestLevelData,P=window.ForestProgress,E=window.ForestEngine;
 const W=window.WolfSprites,FX=window.WolfFx,A=window.AliceSprites,R=window.ForestLevelArt,M=window.ForestMagic;
 const Art=window.ForestExpeditionArt;
 const canvas=$('canvas'),c=canvas.getContext('2d');
 const defeat=window.ForestDefeatScreen.mount($('play-stage'));
 const preview=new URLSearchParams(location.search).get('preview')==='1'&&window.parent!==window;
 const audio=new window.ForestAudio.System({AudioClass:window.AudioContext||window.webkitAudioContext,onError:notice});
 const effects=new FX.System(),held=new Set(),edges=new Set();
 const activeLevelKey='forest.active.level.v1';
 let level=D.expedition(),store,world,boss=null,ready=false,mode='loading',last=performance.now(),acc=0;
 let primary=()=>{},secondary=null,pendingPreview=null,storage;
 let assets={},camera={x:0,y:0},toastUntil=Infinity,hudState='';
 try{storage=window.localStorage;}catch{}
 const bindings=window.ForestKeys.load(storage),keymap=window.ForestKeys.keymap(bindings);
 const key=id=>bindings[id].map(window.ForestKeys.label).join('/');
 const sockets=window.ForestSockets.mount({special:key('special'),up:key('up'),down:key('down')});
 const meterStates=new Map();
 $('volume').value=String(Math.round(audio.volume*100));

 function notice(text,brief=false){
  $('toast').textContent=text;
  toastUntil=brief?last+1850:Infinity;
 }
 function clear(){held.clear();edges.clear();acc=0;}
 function setMode(next){mode=next;clear();audio.setPaused(next!=='playing');}
 function dialog(title,copy,action,label='继续',other=null,otherLabel='返回入口'){
  $('dialog-title').textContent=title;$('dialog-copy').textContent=copy;
  $('dialog-primary').textContent=label;$('dialog-primary').disabled=!ready;
  $('dialog-secondary').hidden=!other;$('dialog-secondary').textContent=otherLabel;
  primary=action;secondary=other;$('overlay').hidden=false;setMode('dialog');
 }
 function resume(){
  sockets.cancelDrag();$('overlay').hidden=true;showBuild(false);
  setMode('playing');audio.unlock();canvas.focus({preventScroll:true});
 }
 function initialize(next,options={}){
  level=D.upgrade(D.validate(next));boss=null;effects.clear();audio.stopAll();
  showBuild(false);
  $('level-name').textContent=level.name+(preview?' · 关卡模拟器':'');
  try{
   if(!preview&&!storage)throw Error('无法访问本机存档，请检查存储权限后重试');
   store=new P.ExpeditionStore(level,storage,preview);
   if(preview&&options.allSkills)store.fillPreview();
   if(preview&&options.startId&&level.objects.some(q=>q.id===options.startId&&['spawn','camp'].includes(q.type)))store.data.campId=options.startId;
   world=new window.ForestLevelEngine.World(level,store);
  }catch(error){
   world=null;
   dialog('无法读取行旅进度',error.message,()=>$('builtin-level').click(),'返回内置地图');
   return;
  }
  if(preview&&options.bossRoomId){
   const room=level.objects.find(q=>q.id===options.bossRoomId&&q.type==='bossRoom');
   if(room){world.activeRoom=room;enterBoss(room);return;}
  }
  dialog(preview?'开始模拟':'通往茶会的小径',
   '营地按 Tab 镶嵌。普攻命中积攒灵能。',
   resume,store.data.completed?'再次探索':'进入关卡');
 }
 function prepareBoss(){
  store.inCamp=null;
  boss=new window.AliceBoss.Challenge();M.bind(boss,store);
  boss.player.hp=world.player.hp;boss.player.spirit=world.player.spirit;
  boss.player.cooldowns={...world.player.cooldowns};
  world.elementShots=[];world.elementBursts=[];effects.clear();audio.stopAll();
 }
 function enterBoss(room){
  prepareBoss();
  dialog(room.name,'一位白狼旅人，真有意思，欢迎来到仙境。\n击败爱丽丝后可进入镜后庭院。',()=>{boss.start();resume();},'进入战斗');
 }
 function returnFromBoss(){
  world.completeBoss(world.activeRoom,boss.player.hp);
  world.player.weapon=boss.player.weapon;world.player.spirit=boss.player.spirit;
  world.player.cooldowns={...boss.player.cooldowns};
  boss=null;effects.clear();resume();
 }
 function showDefeat(){
  setMode('defeated');
  defeat.show({
   prepare(){
    if(boss){
     world.player.hp=world.player.maxHP;prepareBoss();boss.start();
    }else{
     world.respawn(false);effects.clear();
    }
   },
   resume,
   leave(){
    if(preview)window.parent.postMessage({type:'forest-preview-close'},location.origin);
    else location.assign('index.html');
   },
   leaveLabel:preview?'结束试玩':'返回入口'
  });
 }
 function showBuild(open){
  $('build-panel').hidden=!open;
  $('play-header').inert=open;$('play-main').inert=open;
 }
 function build(){
  if(!world||mode!=='playing')return;
  setMode('build');showBuild(true);
  sockets.show(store,boss||world);$('build-close').focus({preventScroll:true});
 }
 function pause(){
  if(mode==='playing')dialog('林间小憩','',resume,'继续行旅');
  else if(mode==='dialog'&&$('dialog-title').textContent==='林间小憩')resume();
 }
 function event(e,g){
  effects.ingest(e,g);
  audio.ingest({...e,x:e.x===undefined?undefined:boss?e.x:e.x-camera.x},g);
  if(e.type==='notice'){
   const [short,detail]=e.text.split(' · ');
   if(short==='尚未解锁'&&detail)notice(detail+'未解锁',true);
   else if(/^(获得 |灵能不足|进度保存失败|火球烧开|冰面|倒下了|失足|此槽为空|红心)/.test(short))notice(short,true);
  }
  if(e.type==='enterBoss')enterBoss(e.room);
  if(e.type==='levelComplete')dialog('抵达镜后庭院','可回到镜后营地存档并镶嵌镜心符印。',resume,'继续探索');
  if(e.type==='victory')dialog('茶会暂告一段落','干得漂亮，不过你逃不出这里的。\n离开茶会可取得'+D.SIGILS[world.activeRoom.sigil].name+'。',returnFromBoss,'领取符印并离开');
  if(e.type==='lost')showDefeat();
 }
 function input(){
  return{left:held.has('left'),right:held.has('right'),up:held.has('up'),down:held.has('down'),
   jumpHeld:held.has('jump'),jump:edges.has('jump'),attack:edges.has('attack'),dash:edges.has('dash'),
   special:edges.has('special'),defense:edges.has('defense'),switchWeapon:edges.has('switchWeapon')};
 }
 function meter(id,name,art,value,max){
  const count=Math.max(0,Math.min(max,Math.ceil(value))),state=count+'/'+max;
  if(meterStates.get(id)===state)return;
  meterStates.set(id,state);
  const el=$(id),segments=[];
  el.setAttribute('aria-label',name+' '+count+' / '+max);
  for(let i=0;i<max;i++){
   const segment=Art.icon(art);segment.className=i<count?'game-icon filled':'game-icon';
   segments.push(segment);
  }
  el.replaceChildren(...segments);
 }
 function renderWeapon(p){
  const slots=store.data.sockets[p.weapon];
  const state=JSON.stringify([p.weapon,p.spirit,slots]);
  if(hudState===state)return;
  hudState=state;
  $('player-hud').textContent=D.WEAPON_NAMES[p.weapon];
  Art.setIcon($('weapon-icon'),p.weapon);
  const keys={neutral:'',up:'↑',down:'↓'};
  const nodes=D.SOCKETS[p.weapon].filter(slot=>slots[slot]).map(slot=>{
   const id=slots[slot],rune=D.RUNES[id],item=document.createElement('div'),hint=document.createElement('kbd');
   item.className='quick-skill'+(p.spirit<rune.cost?' uncharged':'');
   item.setAttribute('title',rune.name+' · '+rune.cost+' 灵能');
   item.setAttribute('aria-label',rune.name);
   hint.textContent=keys[slot]+window.ForestKeys.label(bindings.special[0]);
   item.append(Art.icon(id),hint);return item;
  });
  $('quick-skills').replaceChildren(...nodes);
 }
 function render(){
  if(!ready||!world)return;
  const g=boss||world,p=g.player;
  c.setTransform(1,0,0,1,0,0);c.imageSmoothingEnabled=false;c.clearRect(0,0,1280,720);
  camera=boss?{x:0,y:0}:{x:Math.max(0,Math.min(level.width-1280,p.x-440)),y:Math.max(0,Math.min(level.height-720,p.y-550))};
  if(boss){window.PixelWorld.draw(c,assets.world);window.AliceArt.draw(c,boss,assets.alice,assets.aliceFx);}
  else R.world(c,world,assets.enemies,assets.world,camera,assets.expedition);
  c.save();c.translate(-camera.x,-camera.y);
  const dur=g.actionDuration(),pose=W.sample(p,dur),hand=W.attachment(pose);
  for(const ghost of g.ghosts)W.draw(c,assets.wolf,W.sampleGhost(ghost),ghost.x,ghost.y,ghost.facing,ghost.life/.2*.25,p.actionWeapon,assets.combat,assets.fx);
  for(const q of g.friendlyDaggers)FX.drawProjectile(c,assets.fx,q);
  FX.drawMagic(c,assets.fx,g.magicEffect);FX.drawAmbient(c,assets.fx,g,p);
  effects.draw(c,assets.fx,'back');FX.drawAction(c,assets.fx,p,dur,'back',hand);
  const alpha=p.invulnerable>.2?.65:1;
  if(!Art.drawWall(c,assets.expedition,p,alpha))W.draw(c,assets.wolf,pose,p.x,p.y,p.facing,alpha,p.actionWeapon,assets.combat,assets.fx);
  FX.drawAction(c,assets.fx,p,dur,'front',hand);effects.draw(c,assets.fx,'front');
  M.draw(c,g,assets.expedition);c.restore();
  renderWeapon(p);
  meter('health-meter','生命','health',p.hp,p.maxHP);
  meter('spirit-meter','灵能','spirit',p.spirit,g.spiritLimit());
  $('boss-hud').textContent=boss&&boss.boss.state==='telegraph'?window.AliceBoss.LABELS[boss.boss.attack]:'';
  if(last>=toastUntil){$('toast').textContent='';toastUntil=Infinity;}
 }
 function tick(now){
  const dt=Math.min(.05,(now-last)/1000);last=now;
  if(mode==='playing'&&world){
   acc+=dt;
   while(acc>=E.STEP&&mode==='playing'){
    const g=boss||world,before=g.elapsed;
    g.update(input(),E.STEP);effects.advance(Math.max(0,g.elapsed-before));
    edges.clear();acc-=E.STEP;
    for(const e of g.drainEvents())event(e,g);
    audio.sync(g);
   }
  }
  render();requestAnimationFrame(tick);
 }
 $('dialog-primary').onclick=()=>primary();
 $('dialog-secondary').onclick=()=>secondary?.();
 $('pause-button').onclick=pause;$('build-button').onclick=build;$('build-close').onclick=resume;
 $('volume').oninput=()=>{audio.setVolume(Number($('volume').value)/100);audio.unlock();};
 $('reset-progress').onclick=()=>{
  if(!ready)return;
  dialog('重置本关进度','清除本地图的符印、武器、镶嵌、营地与机关记录。',()=>{
   try{if(!preview)storage.removeItem('forest.level.v2.'+level.id);initialize(level);}
   catch(e){notice(e.message);}
  },'确认重置',()=>initialize(level),'取消');
 };
 $('import-level').onchange=async e=>{
  const file=e.target.files[0];if(!file)return;
  const was=mode;setMode('loading');
  try{
   if(file.size>1024*1024)throw Error('关卡文件不可超过 1 MB');
   const next=D.upgrade(D.validate(JSON.parse(await file.text())));
   if(!preview)storage.setItem(activeLevelKey,JSON.stringify(next));initialize(next);
  }catch(error){notice('导入失败 · '+error.message);setMode(was);}
  e.target.value='';
 };
 $('builtin-level').onclick=()=>{
  if(!ready)return;
  try{if(!preview)storage.removeItem(activeLevelKey);initialize(D.expedition());}
  catch(e){notice(e.message);}
 };
 window.addEventListener('keydown',e=>{
  if(e.code==='Escape'&&!e.repeat){if(mode==='build'){e.preventDefault();resume();}else if(mode==='playing'||mode==='dialog'){e.preventDefault();pause();}return;}
  if(['INPUT','SELECT','TEXTAREA'].includes(e.target.tagName))return;
  if(mode==='build')return;
  if(e.code==='Tab'&&mode==='playing'&&e.target.tagName==='CANVAS'){e.preventDefault();if(!e.repeat)build();return;}
  if(mode==='dialog'&&['Enter','Space','KeyE'].includes(e.code)&&e.target.tagName!=='BUTTON'){
   e.preventDefault();if(!e.repeat&&ready)primary();return;
  }
  const action=keymap[e.code];
  if(mode!=='playing'||!action||action==='trainingShot')return;
  e.preventDefault();held.add(action);if(!e.repeat)edges.add(action);
 });
 window.addEventListener('keyup',e=>{const action=keymap[e.code];if(action)held.delete(action);});
 window.addEventListener('blur',()=>{clear();if(mode==='playing')pause();});
 $('controls').textContent=key('left')+' / '+key('right')+' 移动　'+key('jump')+' 跳跃 / 蹬墙　'+key('attack')+' 普攻　'+key('dash')+' 冲刺　'+key('special')+' 施放槽位技能　'+key('defense')+' 防御　'+key('switchWeapon')+' 切换武器　Tab 镶嵌';
 function image(path,width,height){
  return new Promise((resolve,reject)=>{
   const i=new Image();
   i.onload=()=>i.naturalWidth===width&&i.naturalHeight===height?resolve(i):reject(Error('素材尺寸错误 · '+path));
   i.onerror=()=>reject(Error('素材加载失败 · '+path));i.src=path;
  });
 }
 async function group(entries){return Object.fromEntries(await Promise.all(Object.entries(entries).map(async([k,a])=>[k,await image(a.path,a.width,a.height)])));}
 if(preview){
  $('home').hidden=true;$('builtin-level').hidden=true;$('import-level').parentElement.hidden=true;
  window.addEventListener('message',e=>{
   if(e.source!==window.parent||e.origin!==location.origin||e.data?.type!=='forest-preview')return;
   pendingPreview=e.data;
   if(ready)try{initialize(e.data.level,e.data);}catch(error){notice(error.message);}
  });
  window.parent.postMessage({type:'forest-preview-ready'},location.origin);
 }
 Promise.all([
  image(W.ASSET,W.WIDTH,W.HEIGHT),image(W.combat.asset,W.combat.width,W.combat.height),group(FX.ASSETS),
  group(window.PixelWorld.ASSETS),image(A.data.asset,A.data.width,A.data.height),group(R.ASSETS),
  group(Object.fromEntries(Object.entries(window.AliceFx.assets).map(([k,path])=>[k,{path,width:1536,height:1024}]))),group(Art.ASSETS)
 ]).then(([wolf,combat,fx,worldImages,alice,enemies,aliceFx,expedition])=>{
  assets={wolf,combat,fx,world:worldImages,alice,enemies,aliceFx,expedition};ready=true;
  if(preview){if(pendingPreview)initialize(pendingPreview.level,pendingPreview);else $('dialog-copy').textContent='等待编辑器关卡数据…';}
  else try{
   const saved=storage?.getItem(activeLevelKey);initialize(saved?JSON.parse(saved):level);
  }catch(e){dialog('载入上次关卡失败',e.message,()=>$('builtin-level').click(),'返回内置地图');}
 }).catch(e=>{$('dialog-title').textContent='素材加载失败';$('dialog-copy').textContent=e.message;});
 requestAnimationFrame(tick);
})();
