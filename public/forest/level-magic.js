(function(root){
 'use strict';
 const node=typeof module!=='undefined'&&module.exports;
 const D=node?require('./level-data'):root.ForestLevelData;
 const E=node?require('./engine'):root.ForestEngine;
 const hitBox=(x,y,r)=>({x:x-r,y:y-r,w:r*2,h:r*2});
 const bladeActions={swordSpin:'specialNeutral',swordRise:'specialUp',daggerEcho:'daggerSpecial'};
 const basicHits=new Set(['attack1','attack2','attack3','airAttack','dashAttack','parry']);

 function bind(game,store){
  const p=game.player;
  p.hp=p.maxHP=6;
  p.spirit=0;
  p.airDashSpent=false;
  game.inputDashRecovery=true;
  p.weapon=p.actionWeapon=store.data.weapon;
  game.elementShots=[];
  game.elementBursts=[];
  game.incomingDamage=damage=>game.boss&&damage>=35?2:1;
  game.availableWeapons=()=>Object.keys(D.WEAPON_NAMES).filter(id=>store.data.weapons.includes(id));
  const switchWeapon=game.switchWeapon.bind(game);
  game.switchWeapon=()=>{
   const switched=switchWeapon();
   if(switched)store.data.weapon=p.weapon;
   return switched;
  };
  game.hasSkill=id=>{
   if(['doubleJump','dash','airDash','dashAttack'].includes(id))return store.hasSigil('wind');
   if(id==='airAttack'||id==='guard'||id==='evade')return true;
   if(!Object.hasOwn(D.SKILLS,id))return true;
   return Object.values(store.data.sockets[p.weapon]).some(rune=>bladeActions[rune]===id);
  };
  game.spiritLimit=()=>store.spiritLimit();

  const hit=game.damageTarget.bind(game);
  game.damageTarget=function(rect,...args){
   const count=this.hits;
   hit(rect,...args);
   if(basicHits.has(p.action)){
    p.spirit=Math.min(store.spiritLimit(),p.spirit+this.hits-count);
   }
  };
  game.special=function(input){
   if(['hurt','guard','counterGuard','parry','airEvade','staffPurge'].includes(p.action)||this.bindTimer>0)return;
   const slot=input.up?'up':input.down?'down':'neutral';
   const id=store.data.sockets[p.weapon][slot],rune=D.RUNES[id];
   if(!rune){this.events.push({type:'notice',text:'此槽为空 · 到营地镶嵌技能'});return;}
   if(p.spirit<rune.cost){this.events.push({type:'notice',text:'灵能不足 · 普攻命中可补充'});return;}
   const axis=Number(!!input.right)-Number(!!input.left);
   if(axis)p.facing=axis;
   if(rune.weapon==='staff'){
    p.pendingElement=id;
    this.setAction('staffPurge');
    p.vx=0;
   }else if(id==='daggerEcho'){
    const before=this.friendlyDaggers.length;
    this.castDaggers(input);
    if(this.friendlyDaggers.length===before)return;
   }else{
    const action=bladeActions[id];
    if(!this.useAbility(action))return;
    this.setAction(action);
   }
   p.spirit-=rune.cost;
  };
  game.releaseStaffSpell=function(){
   this.castReleased=true;
   const id=p.pendingElement,rune=D.RUNES[id];
   p.pendingElement=null;
   if(!rune)return;
   const x=p.x+p.facing*31,y=p.y-49;
   this.events.push({type:'purge',x});
   if(id==='shock'){
    this.elementBursts.push({id,x:p.x,y,r:150,life:.33,maxLife:.33});
    this.strikeElement(hitBox(p.x,y,145),rune.damage);
    return;
   }
   this.elementShots.push({id,x,y,vx:p.facing*(id==='fireball'?650:690),vy:id==='iceArrow'?160:0,life:1.1});
  };
  game.strikeElement=function(rect,damage){
   if(this.enemySlots){
    let found=false;
    for(const {enemy:e} of this.enemySlots){
     if(!e||e.dead)continue;
     const {w,h}=D.ENEMIES[e.kind];
     if(E.intersects(rect,{x:e.x-w/2,y:e.y-h,w,h})){
      if(damage>0)this.hurtEnemy(e,damage,'staff');found=true;
     }
    }
    return found;
   }
   if(damage>0)return this.damageProjectile(rect,damage,'staff');
   const b=this.boss;
   return this.status==='fight'&&(this.heart&&E.intersects(rect,this.heartBox())||E.intersects(rect,{x:b.x-28,y:b.y-125,w:56,h:125}));
  };
  const update=game.updateWorld.bind(game);
  game.updateWorld=function(dt){
   const serial=this.respawnSerial;
   update(dt);
   if(this.defeated||serial!==this.respawnSerial||this.status&&this.status!=='fight'){this.elementShots=[];this.elementBursts=[];return;}
   this.elementBursts=this.elementBursts.filter(q=>(q.life-=dt)>0);
   this.elementShots=this.elementShots.filter(q=>{
    q.x+=q.vx*dt;q.y+=q.vy*dt;q.life-=dt;
    if(q.life<=0||q.x<0||q.x>(this.level?.width??E.WIDTH))return false;
    const fire=q.id==='fireball',rect=hitBox(q.x,q.y,fire?17:10);
    const gate=this.elementGate?.(q,rect);
    const solid=this.solids?.some(s=>E.intersects(s,rect));
    const found=!gate&&!solid&&this.strikeElement(rect,fire?0:D.RUNES[q.id].damage);
    if(!gate&&!solid&&!found)return true;
    const r=fire?100:28;
    this.elementBursts.push({id:q.id,x:q.x,y:q.y,r,life:.3,maxLife:.3});
    if(fire)this.strikeElement(hitBox(q.x,q.y,r),D.RUNES[q.id].damage);
    return false;
   });
  };
 }
 function draw(c,game,art){
  for(const q of game.elementShots||[]){
   const fire=q.id==='fireball',w=fire?82:74,h=fire?37:23;
   c.save();c.translate(q.x,q.y);c.rotate(Math.atan2(q.vy,q.vx));
   c.drawImage(art[q.id],-w*.78,-h/2,w,h);
   c.restore();
  }
  for(const q of game.elementBursts||[]){
   c.save();c.globalAlpha=q.life/q.maxLife;
   const r=q.r*(1.18-.48*c.globalAlpha);
   if(q.id==='fireball')c.drawImage(art.fireball,108,0,88,88,q.x-r,q.y-r,r*2,r*2);
   else if(q.id==='iceArrow')c.drawImage(art.iceArrow,112,0,84,62,q.x-r,q.y-r*.74,r*2,r*1.48);
   else c.drawImage(art.shock,q.x-r,q.y-r,r*2,r*2);
   c.restore();
  }
 }
 const api={bind,draw};
 if(node)module.exports=api;else root.ForestMagic=api;
})(typeof window!=='undefined'?window:globalThis);
