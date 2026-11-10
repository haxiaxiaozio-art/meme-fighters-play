(function(root){
 'use strict';
 const names=['wind','wall','mirror','socket','swordSpin','swordRise','daggerEcho','fireball',
  'iceArrow','shock','health','spirit','sword','dagger','staff','frame'];
 const cells=Object.fromEntries(names.map((name,index)=>[name,[index%4,Math.floor(index/4)]]));
 const ASSETS={
  icons:{path:'assets/expedition-art/icons.png',width:256,height:256},
  wall:{path:'assets/expedition-art/wall.png',width:512,height:512},
  fireball:{path:'assets/expedition-art/fireball.png',width:196,height:88},
  iceArrow:{path:'assets/expedition-art/ice-arrow.png',width:196,height:62},
  shock:{path:'assets/expedition-art/shock.png',width:180,height:164},
  vine:{path:'assets/expedition-art/vine.png',width:64,height:159},
  bridge:{path:'assets/expedition-art/ice-bridge.png',width:216,height:78}
 };
 function setIcon(el,id){
  const [col,row]=cells[id]||cells.socket;
  el.classList.add('game-icon');
  el.style.backgroundPosition=(col*100/3)+'% '+(row*100/3)+'%';
  el.setAttribute('data-icon',id);
 }
 function icon(id){
  const el=document.createElement('span');
  el.setAttribute('aria-hidden','true');
  setIcon(el,id);return el;
 }
 function drawIcon(c,images,id,x,y,size){
  const [col,row]=cells[id]||cells.socket;
  c.drawImage(images.icons,col*64,row*64,64,64,x,y,size,size);
 }
 function wallFrame(p){
  if(!p.wallSliding&&!(p.wallPose>0))return null;
  const side=p.wallSide<0?2:0;
  return p.wallSliding
   ?{row:side,frame:Math.floor((p.wallSlideTime||0)*10)%4}
   :{row:side+1,frame:Math.min(3,Math.max(0,Math.floor((.34-p.wallPose)/.078)))};
 }
 function drawWall(c,images,p,alpha){
  const selection=wallFrame(p);
  if(!selection)return false;
  c.save();c.globalAlpha*=alpha;
  c.drawImage(images.wall,selection.frame*128,selection.row*128,128,128,p.x-64,p.y-118,128,128);
  c.restore();return true;
 }
 const api={ASSETS,setIcon,icon,drawIcon,wallFrame,drawWall};
 if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.ForestExpeditionArt=api;
})(typeof window!=='undefined'?window:globalThis);
