(function(root) {
  'use strict';
  const data = typeof module !== 'undefined' && module.exports ? require('./assets/wolf-fx/data') : root.WolfFxData;
  const ASSETS = data.assets;
  const clamp = (v,a,b) => Math.max(a,Math.min(b,v));
  const frameAt = progress => clamp(Math.floor(progress*8),0,7);
  const ACTION_FX = {
    attack1: {clip:'slash',x:18,y:-50,scale:.46}, attack2: {clip:'slash',x:18,y:-50,scale:.46,flipY:-1},
    attack3: {clip:'thrust',x:65,y:-50,scale:.4}, airAttack: {clip:'slash',x:16,y:-48,scale:.46,rotation:.3},
    specialNeutral: {clip:'spin',x:0,y:-48,scale:.75,layer:'back'}, specialUp: {clip:'rise',x:20,y:-65,scale:.5},
    specialDown: {clip:'plunge',x:0,y:-20,scale:.45,layer:'back'}, specialSide: {clip:'thrust',x:68,y:-50,scale:.43},
    dashAttack: {clip:'slash',x:20,y:-48,scale:.48}, specialDash: {clip:'thrust',x:80,y:-48,scale:.5},
    riposte: {clip:'thrust',x:75,y:-48,scale:.48}
  };
  function load(ImageClass, changed=()=>{}) {
    const state={images:{},loaded:new Set(),ready:false,error:null};
    for(const [id,a] of Object.entries(ASSETS)) {
      const image=new ImageClass();state.images[id]=image;
      image.onerror=()=>{state.error=a.path;state.ready=false;changed(state);};
      image.onload=()=>{if(image.naturalWidth!==a.width||image.naturalHeight!==a.height){image.onerror();return;}state.loaded.add(id);state.ready=!state.error&&state.loaded.size===Object.keys(ASSETS).length;changed(state);};
      image.src=a.path;
    }
    return state;
  }
  function drawCel(ctx,images,name,frame,x,y,options={}) {
    const a=data.clips[name];if(!a)throw Error('Unknown wolf effect: '+name);
    if(!images?.effects)throw Error('Missing wolf effect atlas: '+ASSETS.effects.path);
    const sx=options.scaleX??options.scale??.5, sy=options.scaleY??options.scale??.5;
    const origin=options.origin||a.origin;
    ctx.save();ctx.translate(x,y);ctx.scale(options.facing??1,options.flipY??1);ctx.rotate(options.rotation||0);ctx.globalAlpha*=options.alpha??1;ctx.imageSmoothingEnabled=false;
    ctx.drawImage(images.effects,frameAt(frame/8)*data.cellWidth,a.row*data.cellHeight,data.cellWidth,data.cellHeight,-origin[0]*sx,-origin[1]*sy,384*sx,512*sy);
    ctx.restore();
  }
  function drawWeapon(ctx,images,weapon,action,frame,x,y) {
    if(!images?.poses)throw Error('Missing wolf weapon atlas: '+ASSETS.poses.path);
    const rect=data.poses[weapon]?.[action]?.[frame];if(!rect)throw Error('Unknown weapon pose: '+weapon+'/'+action+'/'+frame);
    ctx.save();ctx.translate(x,y);ctx.imageSmoothingEnabled=false;
    ctx.drawImage(images.poses,rect.x,rect.y,data.poseCell,data.poseCell,-data.poseOrigin[0],-data.poseOrigin[1],data.poseCell,data.poseCell);ctx.restore();
  }
  function actionEffects(p,duration,hand) {
    const t=clamp(p.time/Math.max(.00001,duration),0,1), list=[], facing=p.facing||1;
    const add=(clip,frame,x,y,options={},layer='front')=>list.push({clip,frame,x:p.x+x*facing,y:p.y+y,options:{facing,...options},layer});
    const attack=ACTION_FX[p.action];
    if(attack&&t>=.12&&(t<1||p.action==='specialDown')&&!(p.action==='specialDown'&&p.grounded)) {
      const size=p.actionWeapon==='dagger'?.72:p.actionWeapon==='staff'?.85:1;
      // Follow the same nonuniform cel boundaries as the body and held weapon.
      const frame=hand?.frame??frameAt(t);
      add(attack.clip,p.action==='specialDown'?Math.min(3,frame):frame,attack.x,attack.y,{scale:attack.scale*size,flipY:attack.flipY,rotation:attack.rotation,alpha:.82},attack.layer||'front');
    }
    if(p.action==='dash'||(['dashAttack','specialDash','specialSide'].includes(p.action)&&t<.65)) add('dash',frameAt(t),-38,-43,{scale:.44,alpha:.7},'back');
    if(['guard','counterGuard','parry'].includes(p.action)) {
      const frame=p.action==='parry'?3+Math.min(4,Math.floor(t*5)):Math.min(2,Math.floor(t*6));
      add('guard',frame,28,-50,{scale:.32,alpha:p.action==='counterGuard'?.95:.8});
    }
    if(p.action==='airEvade') add('cast',frameAt(t),0,-48,{scale:.43,alpha:.75},'back');
    if(p.action==='riposte'&&t<.25) add('cast',frameAt(t/.25),0,-48,{scale:.43,alpha:.8},'back');
    if(p.action==='staffHeal'||p.action==='staffPurge') {
      const windup=duration-(p.action==='staffHeal'?.25:.2);
      if(p.time<windup) {
        const h=hand||{x:10,y:-45,angle:-90}, angle=h.angle*Math.PI/180;
        const tip=(315-data.weapons.staff.grip[0])*data.weapons.staff.scale;
        add('cast',Math.min(3,Math.floor(p.time/windup*4)),h.x+Math.cos(angle)*tip,h.y+Math.sin(angle)*tip,{scale:.2,alpha:.85});
      }
    }
    return list;
  }
  function drawAction(ctx,images,p,duration,layer='front',hand) {
    for(const q of actionEffects(p,duration,hand)) if(q.layer===layer) drawCel(ctx,images,q.clip,q.frame,q.x,q.y,q.options);
  }
  function magicGeometry(q) {
    return q.kind==='purge'?{x:q.x,y:q.y,scale:q.radius/data.clips.purge.radius}:{x:q.x,y:q.y+45,scale:.43};
  }
  function drawMagic(ctx,images,q) {
    if(!q)return;const g=magicGeometry(q);
    drawCel(ctx,images,q.kind==='purge'?'purge':'heal',frameAt(1-q.life/.6),g.x,g.y,{scale:g.scale,alpha:.8});
  }
  function drawProjectile(ctx,images,q) {
    const angle=Math.atan2(q.vy,q.vx), cycle=Math.floor(q.time*18)%3+3;
    drawCel(ctx,images,'dash',cycle,q.x-Math.cos(angle)*22,q.y-Math.sin(angle)*22,{scale:.18,rotation:angle,alpha:.7});
    drawCel(ctx,images,'dagger',cycle,q.x,q.y,{scale:.105,rotation:angle,origin:[192,263]});
  }
  function drawAmbient(ctx,images,game,hero) {
    if(game.jumpEffect){const q=game.jumpEffect;drawCel(ctx,images,'cast',frameAt(1-q.life/.28),q.x,q.y,{scaleX:.28,scaleY:.12,alpha:.65});}
    if(hero.boostTimer>0)drawCel(ctx,images,'cast',4+Math.floor((3-hero.boostTimer)*8)%4,hero.x,hero.y-48,{scale:.35,alpha:.35});
    if(game.switchFlash>0)drawCel(ctx,images,'cast',frameAt(1-game.switchFlash/.28),hero.x,hero.y-48,{scale:.46,alpha:.85});
  }
  class System {
    constructor(){this.items=[];}
    clear(){this.items=[];}
    advance(dt){for(const q of this.items)q.age+=Math.max(0,dt);this.items=this.items.filter(q=>q.age<q.duration);}
    spawn(clip,x,y,scale,duration=.32,layer='front'){if(!Number.isFinite(x)||!Number.isFinite(y))throw Error('Invalid VFX position');this.items.push({clip,x,y,scale,duration,layer,age:0});if(this.items.length>128)this.items.splice(0,this.items.length-128);}
    ingest(event,game){
      const p=game.player;
      if(['phase','victory','lost','departed'].includes(event.type)){this.clear();return;}
      if(event.type==='hit')this.spawn('hit',event.fx?.x??event.x,event.fx?.y??event.y,event.fx?.impact?.34:.25,.3);
      if(event.type==='hurt')this.spawn('hit',p.x,p.y-48,.22,.26);
      if(event.type==='parry')this.spawn('hit',p.x+p.facing*35,p.y-50,.26,.3);
      if(event.type==='counter')this.spawn('cast',p.x,p.y-48,.48,.4,'back');
      if(event.type==='slam')this.spawn('ground',event.x,p.y,.85,.4,'back');
      if(event.type==='purge')for(const q of event.cleared||[])this.spawn('cast',q.x,q.y,.12,.28);
      if(event.type==='evaded')this.spawn('cast',p.x,p.y-48,.32,.28);
    }
    draw(ctx,images,layer='front'){for(const q of this.items)if(q.layer===layer)drawCel(ctx,images,q.clip,frameAt(q.age/q.duration),q.x,q.y,{scale:q.scale,alpha:.9});}
    snapshot(){return this.items.map(q=>({...q}));}
  }
  const api={data,ASSETS,ACTION_FX,load,frameAt,drawCel,drawWeapon,actionEffects,drawAction,magicGeometry,drawMagic,drawProjectile,drawAmbient,System};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.WolfFx=api;
})(typeof window!=='undefined'?window:globalThis);
