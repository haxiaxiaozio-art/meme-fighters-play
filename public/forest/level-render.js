(function(root){
 'use strict';
 const D=typeof module!=='undefined'&&module.exports?require('./level-data'):root.ForestLevelData;
 const Art=typeof module!=='undefined'&&module.exports?require('./expedition-art'):root.ForestExpeditionArt;
 const origins=typeof module!=='undefined'&&module.exports?require('./assets/forest-enemies/registration'):root.ForestEnemyOrigins;
 const ASSETS=Object.fromEntries(Object.keys(D.ENEMIES).map(k=>[k,{path:'assets/forest-enemies/'+k+'.png',width:1536,height:1024}]));
 function load(ImageClass,changed=()=>{}){const s={images:{},ready:false,error:null,loaded:new Set()};for(const [id,a]of Object.entries(ASSETS)){const i=new ImageClass();s.images[id]=i;i.onerror=()=>{s.error=a.path;s.ready=false;changed(s);};i.onload=()=>{if(i.naturalWidth!==a.width||i.naturalHeight!==a.height)return i.onerror();s.loaded.add(id);s.ready=!s.error&&s.loaded.size===4;changed(s);};i.src=a.path;}return s;}
 function frame(e,t){return e.dead?7:e.flash>0?6:({windup:3,attack:4,recover:5}[e.state]??Math.floor(t*6)%3);}
 function label(c,text,x,y,color='#e8e9d1'){c.font='14px "Microsoft YaHei", sans-serif';c.textAlign='center';c.fillStyle=color;c.fillText(text,x,y);}
 function marker(c,q,claimed=false){c.save();c.translate(q.x,q.y);c.fillStyle=claimed?'#46695b':'#e5c57c';c.strokeStyle='#fff1c7';c.lineWidth=2;
  if(q.type==='chest'){c.fillRect(-22,-30,44,30);c.strokeRect(-22,-30,44,30);c.fillStyle='#725943';c.fillRect(-22,-18,44,5);c.fillRect(-3,-19,6,12);label(c,claimed?'已开启':'E · '+q.points+' 技能点',0,-42);}
  else if(q.type==='checkpoint'||q.type==='spawn'){c.fillStyle=claimed?'#d8e9a2':'#82b7ba';c.fillRect(-3,-75,6,75);c.beginPath();c.moveTo(3,-74);c.lineTo(38,-62);c.lineTo(3,-48);c.fill();label(c,q.type==='spawn'?'起点 · 可重分配':'检查点 · 可重分配',0,-87);}
  else if(q.type==='exit'){c.strokeStyle='#d9ebad';c.strokeRect(-28,-100,56,100);label(c,'关卡出口',0,-112);}
  c.restore();
 }
 function expeditionMarker(c,g,q,art){
  const d=g.store.data;
  if(q.type==='camp'){
   const x=q.x+q.w/2,y=q.y+q.h;
   c.fillStyle='#efb97317';c.fillRect(q.x,q.y,q.w,q.h);
   c.fillStyle='#d69566';c.fillRect(x-26,y-6,52,5);
   c.fillStyle='#faac64';c.beginPath();c.moveTo(x-14,y-9);c.lineTo(x+3,y-41);c.lineTo(x+14,y-9);c.fill();
   c.fillStyle='#fff2a6';c.fillRect(x-3,y-20,7,12);
   if(g.store.inCamp===q.id)label(c,'Tab',x,y-76,'#f6d499');
  }else if(q.type==='grant'&&!d.claimed.includes(q.id)){
   const x=q.x+q.w/2,y=q.y+q.h-43+Math.sin(g.worldElapsed*3+q.x)*4,locked=q.guard&&!d.burned.includes(q.guard);
   c.save();c.globalAlpha=locked?.40:1;
   Art.drawIcon(c,art,q.grantKind==='slot'?'socket':q.grantId,x-24,y-24,48);
   c.restore();
  }else if(q.type==='vine'&&!d.burned.includes(q.id)){
   c.drawImage(art.vine,q.x,q.y,q.w,q.h);
   Art.drawIcon(c,art,'fireball',q.x-33,q.y+12,32);
  }else if(q.type==='water'){
   c.fillStyle='#224e66';c.fillRect(q.x,q.y,q.w,q.h);
   c.fillStyle='#68a9bb';c.fillRect(q.x,q.y,q.w,4);
   for(let x=q.x+14;x<q.x+q.w-20;x+=48)c.fillRect(x,q.y+18+Math.sin(x+g.worldElapsed*3)*5,18,2);
   const ice=g.ice.get(q.id);
   if(ice){
    c.save();
    if(ice.until-g.worldElapsed<2)c.globalAlpha=.7+.3*Math.sin(g.worldElapsed*18);
    const pieces=Math.ceil(ice.w/108),size=ice.w/pieces;
    for(let i=0;i<pieces;i++)c.drawImage(art.bridge,ice.x+i*size,ice.y-2,size+1,29);
    c.restore();
   }else Art.drawIcon(c,art,'iceArrow',q.x-42,q.y-47,35);
  }else if(q.type==='exit')Art.drawIcon(c,art,'mirror',q.x-27,q.y-82,54);
 }
 function world(c,g,images,worldImages,camera,art){
  c.drawImage(worldImages.forest,0,0,1280,720);c.fillStyle='#0d21194a';c.fillRect(0,0,1280,720);c.save();c.translate(-camera.x,-camera.y);
  for(const q of g.level.objects){if(q.x+(q.w||100)<camera.x-100||q.x>camera.x+1380)continue;
   if(q.type==='platform'){
    c.save();c.beginPath();c.rect(q.x,q.y,q.w,q.h);c.clip();c.fillStyle='#20382b';c.fillRect(q.x,q.y,q.w,q.h);
    for(let x=q.x;x<q.x+q.w;x+=512)c.drawImage(worldImages.ground,x,q.y,512,171);
    c.restore();c.fillStyle='#a4c58b';c.fillRect(q.x,q.y,q.w,3);
    if(q.climb){
     c.fillStyle='#d3d78a';
     for(let y=q.y+15;y<q.y+q.h-10;y+=22){c.fillRect(q.x+3,y,7,12);c.fillRect(q.x+q.w-10,y,7,12);}
    }
    if(g.expedition&&q.climb)Art.drawIcon(c,art,'wall',q.x+q.w/2-16,q.y+20,32);
   }
   else if(q.type==='reward'&&!g.store.data.claimed.includes(q.id)){c.fillStyle='#c3dfa724';c.fillRect(q.x,q.y,q.w,q.h);label(c,'路段 +'+q.points,q.x+q.w/2,q.y-12);}
   else if(q.type==='bossRoom'){
    const clear=g.store.data.clearedRooms.includes(q.id);c.fillStyle=clear?'#8dbb9333':'#b98ebc44';c.fillRect(q.x,q.y-q.h,q.entryWidth,q.h);
    c.strokeStyle=clear?'#a9ddad':'#e5b5e3';c.strokeRect(q.x,q.y-q.h,q.entryWidth,q.h);
    if(g.expedition)Art.drawIcon(c,art,'mirror',q.x+q.entryWidth/2-26,q.y-q.h+14,52);
    else label(c,clear?'茶会已结束':q.name+' · 进入封闭战斗',q.x+q.entryWidth/2,q.y-q.h-18);
   }
   else if(g.expedition)expeditionMarker(c,g,q,art);
   else marker(c,q,g.store.data.claimed.includes(q.id)||g.store.data.checkpointId===q.id);
  }
  for(const s of g.enemySlots){const e=s.enemy;if(!e||e.x<camera.x-200||e.x>camera.x+1480)continue;const d=D.ENEMIES[e.kind],f=frame(e,g.worldElapsed),scale=d.scale;
   if(e.state==='windup'){c.strokeStyle='#f0b36b';c.lineWidth=2;c.strokeRect(e.x-d.w/2-6,e.y-d.h-6,d.w+12,d.h+8);label(c,'!',e.x,e.y-d.h-14,'#ffd198');if(e.kind==='treant'){c.fillStyle='#efbe7155';c.fillRect(e.target.x-35,e.target.y-5,70,5);}}
   c.save();c.translate(e.x,e.y);c.scale(e.facing,1);c.drawImage(images[e.kind],f%4*384,Math.floor(f/4)*512,384,512,-origins[e.kind][f][0]*scale,-origins[e.kind][f][1]*scale,384*scale,512*scale);c.restore();
   if(!g.expedition&&!e.dead){c.fillStyle='#24312b';c.fillRect(e.x-25,e.y-d.h-8,50,4);c.fillStyle='#c0d88a';c.fillRect(e.x-25,e.y-d.h-8,50*e.hp/e.maxHP,4);}
  }
  for(const h of g.hazards){c.fillStyle=h.age<.25?'#efba6866':'#9ab77c';if(h.age<.25)c.fillRect(h.x-35,h.y-5,70,5);else for(let i=0;i<5;i++){const x=h.x-35+i*14;c.beginPath();c.moveTo(x,h.y);c.lineTo(x+7,h.y-70);c.lineTo(x+14,h.y);c.fill();}}
  for(const q of g.projectiles){c.fillStyle='#f1d59b';c.beginPath();c.ellipse(q.x,q.y,8,5,Math.atan2(q.vy,q.vx),0,Math.PI*2);c.fill();}
  c.restore();
 }
 const api={ASSETS,load,frame,world,marker};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.ForestLevelArt=api;
})(typeof window!=='undefined'?window:globalThis);
