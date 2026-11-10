(function(root){
 'use strict';
 const D=root.ForestLevelData,Art=root.ForestExpeditionArt,$=id=>document.getElementById(id);
 const button=(text,className)=>{
  const el=document.createElement('button');el.type='button';el.className=className;el.textContent=text;return el;
 };
 const text=(tag,copy)=>{
  const el=document.createElement(tag);el.textContent=copy;return el;
 };
 function mount(keys){
  const groups=$('socket-groups'),tray=$('socket-inventory'),slots=$('socket-slots'),status=$('socket-status');
  const ghost=$('socket-ghost'),panel=$('build-panel'),save=$('save-camp');
  const labels={sigil:'符印',...D.WEAPON_NAMES};
  const keyNames={neutral:keys.special,up:keys.up+' + '+keys.special,down:keys.down+' + '+keys.special};
  let store,game,group='sigil',selected=null,flash=null,drag=null;
  function cancelDrag(){
   drag=null;ghost.hidden=true;panel.classList.remove('dragging');
  }
  function place(slot,id){
   if(id===undefined)return;
   const result=store.equip(group,slot,id);
   const names=group==='sigil'?D.SIGILS:D.RUNES;
   if(!result.ok){status.textContent=result.reason;return;}
   game.player.spirit=Math.min(game.player.spirit,store.spiritLimit());
   status.textContent=(id?'已镶嵌 '+names[id].name:'已卸下')+(store.preview?' · 试玩中生效':' · 已存档');
   flash=id===null?null:slot;
   selected=null;render();
   [...slots.children].find(el=>el.getAttribute?.('data-position')===String(slot))?.firstElementChild?.focus();
  }
  function startDrag(e,id,el){
   if(!store.inCamp||e.button!==0)return;
   drag={id,startX:e.clientX,startY:e.clientY,moved:false};
   el.setPointerCapture?.(e.pointerId);
  }
  function moveDrag(e,name){
   if(!drag)return;
   if(!drag.moved&&Math.hypot(e.clientX-drag.startX,e.clientY-drag.startY)<7)return;
   if(!drag.moved)ghost.replaceChildren(Art.icon(drag.id),text('span',name));
   drag.moved=true;ghost.hidden=false;
   ghost.style.left=e.clientX+12+'px';ghost.style.top=e.clientY+12+'px';
   panel.classList.add('dragging');
  }
  function endDrag(e){
   if(!drag)return false;
   const {id,moved}=drag;
   const target=moved?document.elementFromPoint(e.clientX,e.clientY)?.closest('[data-socket-slot]'):null;
   cancelDrag();
   if(target&&!target.disabled){
    const raw=target.getAttribute('data-socket-slot');
    place(group==='sigil'?Number(raw):raw,id);
   }
   return moved;
  }
  function render(){
   const d=store.data,isSigil=group==='sigil',editable=!!store.inCamp;
   const capacity=d.capacity[group],owned=isSigil?d.sigils:d.runes.filter(id=>D.RUNES[id].weapon===group);
   const names=isSigil?D.SIGILS:D.RUNES,positions=isSigil?[0,1,2]:D.SOCKETS[group];
   $('socket-location').textContent=editable?'营地 · 可镶嵌与存档':'旅途中 · 可查看，镶嵌与存档需回营地';
   $('socket-tray-title').textContent=isSigil?'已收集的符印':'已收集的技能';
   $('socket-capacity').textContent=positions.filter(slot=>d.sockets[group][slot]).length+' / '+capacity+' 已镶嵌';
   save.disabled=!editable;
   groups.replaceChildren();tray.replaceChildren();slots.replaceChildren();
   for(const [id,name] of Object.entries(labels)){
    const tab=button('','socket-tab');
    tab.append(Art.icon(id==='sigil'?'wind':id),text('span',name+(id!=='sigil'&&!d.weapons.includes(id)?' · 未获取':'')));
    tab.setAttribute('aria-pressed',String(group===id));
    tab.onclick=()=>{group=id;selected=null;status.textContent='';render();groups.children[Object.keys(labels).indexOf(id)]?.focus();};groups.append(tab);
   }
   if(!owned.length)tray.append(text('p',!isSigil&&!d.weapons.includes(group)?'在地图中找到这把武器，可解锁首个技能槽。':'沿途收集后会出现在这里。'));
   for(const id of owned){
    const item=names[id],equipped=positions.some(slot=>d.sockets[group][slot]===id);
    const token=button('','rune-token');token.disabled=!editable||!isSigil&&!d.weapons.includes(group);
    token.setAttribute('aria-pressed',String(selected===id));
    token.setAttribute('title',item.text);
    const copy=document.createElement('span');
    copy.append(text('b',item.name),text('small',(item.cost?item.cost+' 灵能 · ':'')+(equipped?'已镶嵌':isSigil?item.text:'未镶嵌')));
    token.append(Art.icon(id),copy);
    let dragged=false;
    token.onpointerdown=e=>{dragged=false;startDrag(e,id,token);};
    token.onpointermove=e=>moveDrag(e,item.name);
    token.onpointerup=e=>{dragged=endDrag(e);};
    token.onpointercancel=cancelDrag;
    token.onclick=()=>{
     if(dragged){dragged=false;return;}
     selected=selected===id?null:id;
     status.textContent=selected?'已选中 '+item.name+'，请选择槽位':'';
     render();
     if(selected)[...slots.children].find(row=>!row.children[0].disabled)?.children[0].focus();
    };
    tray.append(token);
   }
   for(const [index,slot] of positions.entries()){
    const id=d.sockets[group][slot],locked=index>=capacity||!isSigil&&!d.weapons.includes(group);
    const row=document.createElement('div');row.className='socket-row';row.setAttribute('data-position',slot);
    const target=button('','socket'+(slot===flash?' socket-flash':''));
    target.disabled=locked||!editable;target.setAttribute('data-socket-slot',slot);
    const caption=isSigil?'符印槽 '+(index+1):keyNames[slot];
    const copy=document.createElement('span');
    copy.append(text('small',caption),text('b',locked?'未解锁':id?names[id].name:'空槽'));
    target.append(Art.icon(id??(isSigil?'socket':'frame')),copy);
    target.onclick=()=>place(slot,selected??undefined);
    row.append(target);
    if(id){
     const remove=button('卸下','socket-remove');remove.disabled=!editable;
     remove.setAttribute('aria-label','卸下 '+names[id].name);
     remove.onclick=()=>place(slot,null);row.append(remove);
    }
    slots.append(row);
   }
   flash=null;
  }
  save.onclick=()=>{
   const result=store.writeAtCamp();
   status.textContent=result.ok?(store.preview?'试玩进度已记录':'营地进度已保存'):result.reason;
  };
  return{
   show(nextStore,nextGame){if(nextStore!==store)group='sigil';store=nextStore;game=nextGame;selected=null;status.textContent='';render();},
   cancelDrag
  };
 }
 root.ForestSockets={mount};
})(window);
