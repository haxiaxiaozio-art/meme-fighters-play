(function(root){
 'use strict';
 const assets={butterfly:'assets/alice-fx-v2/butterfly.png',thorn:'assets/alice-fx-v2/thorn.png'};
 function load(ImageClass,changed=()=>{}){
  const state={images:{},ready:false,error:null};let loaded=0;
  for(const [id,path]of Object.entries(assets)){const image=state.images[id]=new ImageClass();image.onerror=()=>{state.error=path;state.ready=false;changed(state);};image.onload=()=>{if(image.naturalWidth!==1536||image.naturalHeight!==1024){image.onerror();return;}loaded++;state.ready=loaded===2&&!state.error;changed(state);};image.src=path;}return state;
 }
 function butterfly(c,image,x,y,time){if(!image)return;const frame=Math.floor(time*12)%8;c.save();c.imageSmoothingEnabled=false;c.drawImage(image,(frame%4)*384,Math.floor(frame/4)*512,384,512,x-19.2,y-27,38.4,51.2);c.restore();}
 function thorn(c,image,line){if(!image)return;const length=Math.hypot(line.endX-line.x,line.endY-line.y),frame=2+Math.min(3,Math.floor(Math.max(0,.28-(line.life??.28))*16));c.save();c.imageSmoothingEnabled=false;c.translate(line.x,line.y);c.rotate(Math.atan2(line.endY-line.y,line.endX-line.x));for(let at=0;at<length;at+=110){const width=Math.min(110,length-at);c.drawImage(image,frame%4*384+20,Math.floor(frame/4)*512+210,360*width/110,120,at,-11,width,22);}c.restore();}
 const api={assets,load,butterfly,thorn};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.AliceFx=api;
})(typeof window!=='undefined'?window:globalThis);
