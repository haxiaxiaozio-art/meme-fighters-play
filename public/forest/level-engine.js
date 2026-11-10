(function(root){
 'use strict';
 const node=typeof module!=='undefined'&&module.exports,E=node?require('./engine'):root.ForestEngine,D=node?require('./level-data'):root.ForestLevelData,P=node?require('./level-progress'):root.ForestProgress,S=node?require('./sprites'):root.SwordSprites;
 const Magic=node?require('./level-magic'):root.ForestMagic;
 const clamp=(n,a,b)=>Math.max(a,Math.min(b,n)),distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),box=p=>({x:p.x-19,y:p.y-86,w:38,h:84});
 class World extends E.Practice{
  constructor(level,store){
   super();
   this.level=D.validate(level);this.store=store;this.expedition=this.level.version===2;
   this.terrain=this.level.objects.filter(q=>q.type==='platform');
   this.gates=this.level.objects.filter(q=>['vine','water'].includes(q.type));this.ice=new Map();
   this.rebuildSolids();
   this.enemySlots=this.level.objects.filter(q=>q.type==='enemy').map(q=>({source:q,enemy:null,timer:0}));
   this.hazards=[];this.blooms=[];this.activeRoom=null;this.completed=false;this.struck=new Set();
   if(this.expedition)Magic.bind(this,store);else P.applyBuild(this,store);
   this.respawn(false);
  }
  rebuildSolids(){
   const vines=this.gates.filter(q=>q.type==='vine'&&!this.store.data.burned.includes(q.id));
   this.solids=[...this.terrain,...vines,...this.ice.values()];
  }
  setAction(name){
   super.setAction(name);this.struck=new Set();
   if(this.expedition&&!['jump','fall'].includes(name)){
    this.player.wallPose=0;this.player.wallSlideTime=0;this.player.wallSliding=false;this.player.wallKick=0;
   }
  }
  notify(text){this.events.push({type:'notice',text});}
  surface(x,y){return this.solids.filter(q=>x>=q.x&&x<=q.x+q.w&&q.y>=y-3).sort((a,b)=>a.y-b.y)[0];}
  checkpoint(){
   const id=this.expedition?this.store.data.campId:this.store.data.checkpointId;
   const q=this.level.objects.find(q=>q.id===id)||this.level.objects.find(q=>q.type==='spawn');
   return q.type==='camp'?{...q,x:q.x+q.w/2,y:q.y+q.h}:q;
  }
  respawn(penalty=true){
   this.respawnSerial=(this.respawnSerial||0)+1;
   this.defeated=false;
   const q=this.checkpoint(),p=this.player;
   p.x=q.x;p.y=q.y;p.vx=p.vy=0;
   p.grounded=!!this.surface(p.x,p.y)&&Math.abs(this.surface(p.x,p.y).y-p.y)<4;
   p.jumpsUsed=0;p.hp=penalty&&!this.expedition?Math.max(1,p.hp-20):p.maxHP;p.invulnerable=1;
   this.setAction(p.grounded?'idle':'fall');this.projectiles=[];this.hazards=[];this.friendlyDaggers=[];
   if(this.expedition){
    p.wallKick=0;p.wallSliding=false;p.wallPose=0;p.wallSlideTime=0;p.airDashSpent=false;this.store.inCamp=null;
    this.elementShots=[];this.elementBursts=[];this.hitStop=0;
   }else if(penalty)this.notify('返回检查点 · -20 生命');
  }
  lose(cause){
   if(this.defeated)return;
   this.defeated=true;this.store.inCamp=null;
   const p=this.player;
   p.hp=0;p.vx=p.vy=0;
   this.setAction('fall');
   this.friendlyDaggers=[];this.elementShots=[];this.elementBursts=[];
   this.events.push({type:'lost',cause});
  }
  wallAt(axis){
   const p=this.player;
   if(!this.expedition||p.grounded||!axis||!['jump','fall'].includes(p.action)||!this.store.hasSigil('wall'))return false;
   const edge=p.x+axis*19;
   return this.terrain.some(q=>q.climb&&p.y>q.y+2&&p.y-84<q.y+q.h-2&&Math.abs(edge-(axis>0?q.x:q.x+q.w))<=3);
  }
  tryWallJump(axis){
   if(!this.wallAt(axis))return false;
   const p=this.player;
   p.facing=-axis;p.vx=-axis*565;p.vy=-745;p.wallKick=.15;p.wallSliding=false;p.wallSide=axis;p.wallPose=.34;p.jumpsUsed=1;
   this.jumpBuffer=0;this.setAction('jump');this.events.push({type:'jump'});
   return true;
  }
  updateWallSlide(axis,dt){
   if(!this.expedition)return;
   const p=this.player;
   p.wallPose=Math.max(0,(p.wallPose||0)-dt);
   p.wallSliding=p.vy>0&&this.wallAt(axis);
   p.wallSlideTime=p.wallSliding?(p.wallSlideTime||0)+dt:0;
   if(p.wallSliding){p.vy=Math.min(p.vy,94);p.wallSide=axis;p.wallPose=0;}
  }
  elementGate(shot,rect){
   for(const q of this.gates){
    if(!E.intersects(rect,q))continue;
    if(q.type==='vine'&&shot.id==='fireball'&&!this.store.data.burned.includes(q.id)){
     this.store.data.burned.push(q.id);this.rebuildSolids();this.notify('火球烧开了藤蔓');return true;
    }
    if(q.type==='water'&&shot.id==='iceArrow'){
     const w=Math.min(500,q.w);
     this.ice.set(q.id,{x:q.x+(q.w-w)/2,y:q.y,w,h:18,until:this.worldElapsed+8});
     this.rebuildSolids();this.notify('冰面 · 8 秒内可落脚');return true;
    }
   }
   return false;
  }
  movePlayer(dt){const p=this.player,was=p.grounded,ox=p.x,oy=p.y;let nx=clamp(ox+p.vx*dt,22,this.level.width-22),ny=oy+p.vy*dt;
   for(const q of this.solids)if(oy>q.y+1&&oy-84<q.y+q.h-1){if(p.vx>0&&ox+19<=q.x&&nx+19>q.x){nx=q.x-19;p.vx=0;}else if(p.vx<0&&ox-19>=q.x+q.w&&nx-19<q.x+q.w){nx=q.x+q.w+19;p.vx=0;}}
   p.grounded=false;let floor=Infinity;
   for(const q of this.solids)if(nx+18>q.x&&nx-18<q.x+q.w){if(p.vy>=0&&oy<=q.y+.5&&ny>=q.y){floor=Math.min(floor,q.y);}else if(p.vy<0&&oy-84>=q.y+q.h&&ny-84<q.y+q.h){ny=q.y+q.h+84;p.vy=0;}}
   if(Number.isFinite(floor)){ny=floor;p.vy=0;p.grounded=true;p.jumpsUsed=0;}p.x=nx;p.y=ny;
   if(was&&!p.grounded)p.jumpsUsed=Math.max(1,p.jumpsUsed);
   if(this.expedition&&p.y>this.level.height+86){this.lose('fall');return false;}
   if(p.y>this.level.height+140){this.respawn();return false;}
   return !was&&p.grounded;
  }
  campAt(){
   const p=this.player;
   return p.grounded&&this.level.objects.find(q=>q.type==='camp'&&p.x>=q.x&&p.x<=q.x+q.w&&Math.abs(p.y-q.y-q.h)<12);
  }
  receiveBolt(bolt){
   if(this.defeated||this.expedition&&this.campAt())return;
   const before=this.received;
   super.receiveBolt(bolt);
   if(this.received===before)return;
   const damage=bolt.damage||12;
   this.player.hp=Math.max(0,this.player.hp-(this.incomingDamage?.(damage)??damage));
   if(this.player.hp>0)return;
   if(this.expedition){
    this.lose('damage');
   }else{
    this.respawn(false);this.notify('倒下了 · 已返回检查点');
   }
  }
  spawn(slot){const q=slot.source,d=D.ENEMIES[q.kind];slot.enemy={id:q.id,kind:q.kind,x:q.x,y:q.y,homeX:q.x,homeY:q.y,vx:0,vy:0,facing:-1,hp:d.hp,maxHP:d.hp,state:'patrol',time:0,flash:0,cooldown:.6,hit:false,dead:false};}
  hurtEnemy(e,damage,weapon){if(e.dead)return;e.hp=Math.max(0,e.hp-damage);e.flash=.18;this.hits++;this.totalDamage+=damage;this.combo++;this.maxCombo=Math.max(this.maxCombo,this.combo);this.comboTimer=1.2;this.hitStop=.025;this.events.push({type:'hit',weapon,target:'enemy',damage,x:e.x,y:e.y-D.ENEMIES[e.kind].h-8,fx:{x:e.x,y:e.y-35}});if(e.hp===0){e.dead=true;e.state='dead';e.time=0;}}
  damageTarget(rect){for(const slot of this.enemySlots){const e=slot.enemy;if(!e||e.dead||this.struck.has(e.id))continue;const d=D.ENEMIES[e.kind];if(E.intersects(rect,{x:e.x-d.w/2,y:e.y-d.h,w:d.w,h:d.h})){this.struck.add(e.id);this.hasHit=true;this.hurtEnemy(e,this.attackDamage(S.animations[this.player.action].damage||30),this.player.actionWeapon);}}}
  damageProjectile(rect,damage){let hit=false;for(const slot of this.enemySlots){const e=slot.enemy;if(!e||e.dead)continue;const d=D.ENEMIES[e.kind];if(E.intersects(rect,{x:e.x-d.w/2,y:e.y-d.h,w:d.w,h:d.h})){this.hurtEnemy(e,damage,'dagger');hit=true;}}return hit;}
  releaseStaffSpell(){const purge=this.player.action==='staffPurge';super.releaseStaffSpell();if(purge)this.hazards=this.hazards.filter(h=>distance(h,this.player)>185);}
  updateEnemy(e,slot,dt){const d=D.ENEMIES[e.kind],p=this.player;e.time+=dt;e.flash=Math.max(0,e.flash-dt);e.cooldown=Math.max(0,e.cooldown-dt);
   if(e.dead){if(e.time>.5&&slot.source.respawn>0){slot.enemy=null;slot.timer=slot.source.respawn;}return;}
   const dx=p.x-e.x,dy=p.y-e.y,near=Math.abs(dx)<d.range&&Math.abs(dy)<180;
   if(e.state==='patrol'){
    if(near&&e.cooldown===0){e.state='windup';e.time=0;e.facing=dx>=0?1:-1;e.target={x:p.x,y:e.kind==='treant'?(this.surface(p.x,p.y)?.y??p.y):p.y};e.vx=0;return;}
    if(e.kind==='fairy'){e.x+=e.facing*d.speed*.3*dt;e.y=e.homeY+Math.sin(this.worldElapsed*2+e.homeX)*18;if(Math.abs(e.x-e.homeX)>slot.source.patrol/2)e.facing*=-1;}
    else if(e.kind!=='treant'){if(e.kind==='goblin'&&Math.abs(dx)<420)e.facing=dx>=0?1:-1;const ahead=e.x+e.facing*26,support=this.surface(ahead,e.y);if(!support||support.y>e.y+12||Math.abs(e.x-e.homeX)>slot.source.patrol/2)e.facing=e.x>=e.homeX?-1:1;e.x+=e.facing*d.speed*dt;const floor=this.surface(e.x,e.y);if(floor&&floor.y-e.y<20)e.y=floor.y;}
   }else if(e.state==='windup'&&e.time>=d.windup){e.state='attack';e.time=0;e.hit=false;
    if(e.kind==='slime'){e.vx=e.facing*260;e.vy=-280;}
    if(e.kind==='fairy'){const ax=e.target.x-e.x,ay=e.target.y-45-(e.y-40),len=Math.hypot(ax,ay)||1;this.projectiles.push({x:e.x,y:e.y-40,vx:ax/len*230,vy:ay/len*230,life:4,damage:d.damage,kind:'fairy'});this.events.push({type:'shot',x:e.x});}
    if(e.kind==='treant'){const floor=this.surface(e.target.x,e.target.y);this.hazards.push({x:e.target.x,y:floor?.y??e.target.y,age:0,damage:d.damage,hit:false});}
   }else if(e.state==='attack'){
    if(e.kind==='slime'){e.x+=e.vx*dt;const oy=e.y;e.vy+=900*dt;e.y+=e.vy*dt;const floor=this.surface(e.x,oy);if(e.vy>=0&&floor&&e.y>=floor.y){e.y=floor.y;e.vx=e.vy=0;}if(!e.hit&&E.intersects(box(p),{x:e.x-28,y:e.y-38,w:56,h:38})){e.hit=true;this.receiveBolt({vx:e.facing,damage:d.damage});}}
    if(e.kind==='goblin'&&!e.hit&&E.intersects(box(p),{x:e.facing>0?e.x:e.x-80,y:e.y-78,w:80,h:76})){e.hit=true;this.receiveBolt({vx:e.facing,damage:d.damage});}
    if(e.time>=d.attack){e.state='recover';e.time=0;e.vx=0;}
   }else if(e.state==='recover'&&e.time>=d.recover){e.state='patrol';e.time=0;e.cooldown=.3;}
   if(e.y>this.level.height+100){e.dead=true;e.state='dead';e.time=0;}
  }
  updateWorld(dt){this.worldElapsed+=dt;const serial=this.respawnSerial;
   for(const slot of this.enemySlots){if(!slot.enemy){slot.timer=Math.max(0,slot.timer-dt);if(slot.timer===0)this.spawn(slot);}if(slot.enemy)this.updateEnemy(slot.enemy,slot,dt);if(this.defeated||serial!==this.respawnSerial)return;}
   const bolts=[];for(const q of this.projectiles){q.x+=q.vx*dt;q.y+=q.vy*dt;q.life-=dt;if(E.intersects(box(this.player),{x:q.x-7,y:q.y-7,w:14,h:14})){this.receiveBolt(q);if(this.defeated||serial!==this.respawnSerial)return;}else if(q.life>0&&q.x>=0&&q.x<=this.level.width&&q.y<this.level.height)bolts.push(q);}this.projectiles=bolts;
   const hazards=[];for(const h of this.hazards){h.age+=dt;if(h.age>.25&&!h.hit&&E.intersects(box(this.player),{x:h.x-35,y:h.y-80,w:70,h:80})){h.hit=true;this.receiveBolt({vx:Math.sign(this.player.x-h.x)||1,damage:h.damage});if(this.defeated||serial!==this.respawnSerial)return;}if(h.age<.55)hazards.push(h);}this.hazards=hazards;
  }
  interact(){const p=this.player;for(const q of this.level.objects)if(q.type==='chest'&&distance(q,p)<85&&!this.store.data.claimed.includes(q.id)){const r=this.store.claim(q.id,q.points);this.notify(r.ok?'宝箱 · +'+q.points+' 技能点':r.reason);return r.ok;}this.notify('靠近宝箱按 E 开启');return false;}
  canRefund(){return this.level.objects.some(q=>['spawn','checkpoint'].includes(q.type)&&distance(q,this.player)<85);}
  refund(){if(!this.canRefund())return{ok:false,reason:'请回到检查点重新分配技能'};return this.store.refund();}
  completeBoss(room,hp){
   if(this.expedition)this.store.clearRoom(room);
   else{
    const result=this.store.claim(room.id,room.points,true);
    if(!result.ok&&!this.store.data.clearedRooms.includes(room.id)){this.notify(result.reason);return false;}
   }
   this.activeRoom=null;this.player.x=room.exitX;this.player.y=room.exitY;this.player.hp=Math.max(1,hp);
   this.player.vx=this.player.vy=0;this.player.grounded=false;this.setAction('fall');
   this.notify(this.expedition?'获得 '+D.SIGILS[room.sigil].name+' · 在营地镶嵌':'BOSS 房通关 · +'+room.points+' 技能点');
   return true;
  }
  updateExpedition(){
   const p=this.player,objects=this.level.objects;
   let thawed=false;
   for(const [id,q] of this.ice)if(q.until<=this.worldElapsed){this.ice.delete(id);thawed=true;}
   if(thawed)this.rebuildSolids();
   let granted=false;
   for(const q of objects){
    if(q.type==='grant'&&E.intersects(box(p),q)&&(!q.guard||this.store.data.burned.includes(q.guard))&&this.store.grant(q)){
     granted=true;
     this.notify('获得 '+D.grantName(q.grantKind,q.grantId)+(q.grantKind==='sigil'||q.grantKind==='rune'?' · 在营地镶嵌':''));
    }
   }
   const camp=this.campAt();
   if(this.store.inCamp!==(camp?.id??null)){
    this.store.inCamp=camp?.id??null;
    if(camp){
     p.hp=p.maxHP;this.store.data.campId=camp.id;
     const result=this.store.writeAtCamp();this.notify(result.ok?camp.name+(this.store.preview?' · 生命恢复':' · 生命恢复，进度已保存'):result.reason);
    }
   }else if(camp&&granted){
    const result=this.store.writeAtCamp();
    if(!result.ok)this.notify(result.reason);
   }
   const d=this.store.data;
   for(const q of objects){
    if(q.type==='bossRoom'&&!d.clearedRooms.includes(q.id)&&p.x>=q.x&&p.x<=q.x+q.entryWidth&&p.y>=q.y-q.h-110&&p.y<=q.y+18){
     this.store.inCamp=null;this.activeRoom=q;this.events.push({type:'enterBoss',room:q});return;
    }
    if(q.type==='exit'&&distance(q,p)<65&&!d.completed){
     if(objects.some(o=>o.type==='bossRoom'&&!d.clearedRooms.includes(o.id))){this.notify('先完成茶会');continue;}
     d.completed=true;this.events.push({type:'levelComplete'});
    }
   }
  }
  update(input={},dt=E.STEP){if(this.activeRoom||this.completed||this.defeated)return;super.update(input,dt);if(this.expedition){if(!this.defeated)this.updateExpedition();return;}if(input.interact)this.interact();const p=this.player;
   for(const q of this.level.objects){
    if(q.type==='checkpoint'&&distance(q,p)<65&&this.store.data.checkpointId!==q.id){const r=this.store.commit(s=>{s.checkpointId=q.id;});if(r.ok){p.hp=p.maxHP;this.notify('检查点 · 生命恢复');}else this.notify(r.reason);}
    if(q.type==='reward'&&!this.store.data.claimed.includes(q.id)&&E.intersects(box(p),q)){const r=this.store.claim(q.id,q.points);this.notify(r.ok?'路段完成 · +'+q.points+' 技能点':r.reason);}
    if(q.type==='bossRoom'&&!this.store.data.clearedRooms.includes(q.id)&&p.x>=q.x&&p.x<=q.x+q.entryWidth&&Math.abs(p.y-q.y)<170){this.activeRoom=q;this.events.push({type:'enterBoss',room:q});break;}
    if(q.type==='exit'&&distance(q,p)<65){const remaining=this.level.objects.filter(o=>o.type==='bossRoom'&&!this.store.data.clearedRooms.includes(o.id));if(remaining.length){this.notify('先完成本关的爱丽丝 BOSS 房');continue;}const r=this.store.commit(s=>{s.completed=true;});if(r.ok){this.completed=true;this.events.push({type:'levelComplete'});}else this.notify(r.reason);}
   }
  }
  snapshot(){return{...super.snapshot(),levelId:this.level.id,progress:D.clone(this.store.data),enemies:this.enemySlots.map(s=>s.enemy?{...s.enemy}:null),hazards:this.hazards.map(h=>({...h})),activeRoom:this.activeRoom?.id??null,completed:this.completed};}
 }
 const api={World};if(node)module.exports=api;else root.ForestLevelEngine=api;
})(typeof window!=='undefined'?window:globalThis);
