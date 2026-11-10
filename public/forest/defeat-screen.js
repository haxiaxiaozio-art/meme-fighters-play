(function(root){
 'use strict';
 const RISE_MS=1550,FADE_MS=620,REDUCED_FADE_MS=160;
 function mount(host){
  let panel,prompt,title,continueButton,leaveButton,actions;
  function leave(){
   if(!panel.open||continueButton.disabled)return;
   panel.close();
   actions.leave();
  }
  function recover(){
   if(!panel.open||continueButton.disabled)return;
   continueButton.disabled=leaveButton.disabled=true;
   title.textContent='白狼正在起身';
   prompt.hidden=true;
   panel.classList.add('defeat-reviving');
   const reduced=root.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
   const fade=()=>{
    actions.prepare();
    panel.classList.add('defeat-fading');
    setTimeout(()=>{
     panel.close();
     actions.resume();
    },reduced?REDUCED_FADE_MS:FADE_MS);
   };
   if(reduced)fade();else setTimeout(fade,RISE_MS);
  }
  function build(){
   panel=document.createElement('dialog');
   panel.className='defeat-screen';
   panel.setAttribute('aria-labelledby','defeat-question');
   panel.style.cssText='--defeat-rise-ms:'+RISE_MS+'ms;--defeat-fade-ms:'+FADE_MS+'ms;--defeat-reduced-fade-ms:'+REDUCED_FADE_MS+'ms';

   const scene=document.createElement('div');
   scene.className='defeat-scene';
   scene.setAttribute('aria-hidden','true');
   const beam=document.createElement('div'),ground=document.createElement('div'),wolf=document.createElement('img'),rising=document.createElement('div');
   beam.className='defeat-beam';ground.className='defeat-ground';wolf.className='defeat-wolf';
   wolf.src='assets/expedition-art/wolf-defeated.png';wolf.alt='';
   rising.className='defeat-rise';
   scene.append(beam,ground,wolf,rising);

   prompt=document.createElement('div');title=document.createElement('h2');
   const buttons=document.createElement('div');
   prompt.className='defeat-prompt';title.id='defeat-question';title.textContent='是否继续？';
   buttons.className='defeat-actions';
   continueButton=document.createElement('button');continueButton.type='button';
   continueButton.className='defeat-continue';continueButton.textContent='继续';
   leaveButton=document.createElement('button');leaveButton.type='button';leaveButton.className='defeat-leave';
   continueButton.onclick=recover;leaveButton.onclick=leave;
   buttons.append(continueButton,leaveButton);prompt.append(title,buttons);panel.append(scene,prompt);
   panel.addEventListener('cancel',event=>event.preventDefault());
   panel.addEventListener('keydown',event=>{
    if(event.repeat&&(event.code==='Space'||event.code==='Enter'))event.preventDefault();
   });
   host.append(panel);
  }
  function show(next){
   if(!panel)build();
   if(panel.open)return;
   actions=next;leaveButton.textContent=next.leaveLabel??'返回入口';
   title.textContent='是否继续？';prompt.hidden=false;
   continueButton.disabled=leaveButton.disabled=false;
   panel.classList.remove('defeat-reviving','defeat-fading');
   panel.showModal();continueButton.focus({preventScroll:true});
  }
  return {show};
 }
 root.ForestDefeatScreen={mount};
})(window);
