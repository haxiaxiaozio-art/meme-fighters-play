(function(root){
 'use strict';
 const node=typeof module!=='undefined'&&module.exports,D=node?require('./level-data'):root.ForestLevelData,E=node?require('./engine'):root.ForestEngine;
 function fresh(level){return{version:1,levelId:level.id,points:0,skills:[],claimed:[],clearedRooms:[],checkpointId:level.objects.find(q=>q.type==='spawn').id,selectedWeapons:{sword:'sword-balance',dagger:'dagger-balance',staff:'staff-balance'},equipped:'sword-balance',completed:false};}
 function validate(value,level){
  if(!value||value.version!==1||value.levelId!==level.id||!Number.isInteger(value.points)||value.points<0||value.points>30000)throw Error('存档内容无效，请选择重置本关进度');
  for(const key of ['skills','claimed','clearedRooms'])if(!Array.isArray(value[key])||value[key].length>300||value[key].some(id=>typeof id!=='string')||new Set(value[key]).size!==value[key].length)throw Error('存档列表无效');
  if(value.skills.some(id=>!D.SKILLS[id]||D.SKILLS[id].requires.some(p=>!value.skills.includes(p))))throw Error('存档技能关系无效');
  if(!D.WEAPONS[value.equipped]||!value.selectedWeapons||['sword','dagger','staff'].some(f=>D.WEAPONS[value.selectedWeapons[f]]?.family!==f))throw Error('存档装备无效');
  const next={...fresh(level),...D.clone(value)};if(!level.objects.some(q=>q.id===next.checkpointId&&['spawn','checkpoint'].includes(q.type)))next.checkpointId=fresh(level).checkpointId;return next;
 }
 class Store{
  constructor(level,storage=null,preview=false){this.level=level;this.storage=preview?null:storage;this.key='forest.level.v1.'+level.id;this.preview=preview;this.error=null;const raw=this.storage?.getItem(this.key);this.data=raw?validate(JSON.parse(raw),level):fresh(level);}
  commit(change){const next=D.clone(this.data);change(next);validate(next,this.level);try{this.storage?.setItem(this.key,JSON.stringify(next));}catch(e){this.error='进度保存失败：'+e.message;return{ok:false,reason:this.error};}this.data=next;this.error=null;return{ok:true};}
  claim(id,points,room=false){if(this.data.claimed.includes(id))return{ok:false,reason:'奖励已领取'};return this.commit(p=>{p.points+=points;p.claimed.push(id);if(room&&!p.clearedRooms.includes(id))p.clearedRooms.push(id);});}
  buy(id){const s=D.SKILLS[id],p=this.data;if(!s)return{ok:false,reason:'未知技能'};if(p.skills.includes(id))return{ok:false,reason:'技能已解锁'};if(p.points<s.cost)return{ok:false,reason:'技能点不足'};if(s.requires.some(k=>!p.skills.includes(k)))return{ok:false,reason:'前置技能尚未解锁'};return this.commit(next=>{next.points-=s.cost;next.skills.push(id);});}
  refund(){return this.commit(p=>{p.points+=p.skills.reduce((n,id)=>n+D.SKILLS[id].cost,0);p.skills=[];});}
  equip(id){const w=D.WEAPONS[id];if(!w)return{ok:false,reason:'未知装备'};return this.commit(p=>{p.equipped=id;p.selectedWeapons[w.family]=id;});}
 }
 function freshExpedition(level){
  return{version:2,levelId:level.id,campId:level.objects.find(q=>q.type==='spawn').id,weapon:'sword',
   sigils:[],weapons:['sword'],runes:[],claimed:[],burned:[],clearedRooms:[],
   capacity:{sigil:1,sword:1,dagger:0,staff:0},sockets:{sigil:[null,null,null],sword:{},dagger:{},staff:{}},completed:false};
 }
 function validateExpedition(value,level){
  if(value?.version!==2||value.levelId!==level.id)throw Error('行旅存档版本不匹配');
  const next=D.clone(value);
  const ids=types=>Object.fromEntries(level.objects.filter(q=>types.includes(q.type)).map(q=>[q.id,true]));
  const lists={sigils:D.SIGILS,weapons:D.WEAPON_NAMES,runes:D.RUNES,claimed:ids(['grant']),burned:ids(['vine']),clearedRooms:ids(['bossRoom'])};
  for(const [key,allowed] of Object.entries(lists)){
   if(!Array.isArray(next[key])||next[key].length>300||new Set(next[key]).size!==next[key].length||next[key].some(id=>typeof id!=='string'||!Object.hasOwn(allowed,id)))throw Error('无效的行旅记录 · '+key);
  }
  if(!next.weapons.includes('sword')||!next.weapons.includes(next.weapon))throw Error('存档武器无效');
  if(!Object.hasOwn(ids(['spawn','camp']),next.campId))next.campId=freshExpedition(level).campId;
  const caps={sigil:3,...Object.fromEntries(Object.entries(D.SOCKETS).map(([key,slots])=>[key,slots.length]))};
  for(const [group,max] of Object.entries(caps)){
   const capacity=next.capacity?.[group],min=group==='sigil'||next.weapons.includes(group)?1:0;
   if(!Number.isInteger(capacity)||capacity<min||capacity>max)throw Error('存档槽位上限无效');
   const used=new Set(),slots=group==='sigil'?[0,1,2]:D.SOCKETS[group];
   if(!next.sockets?.[group])throw Error('存档槽位缺失');
   for(const [index,slot] of slots.entries()){
    const id=next.sockets[group][slot];
    if(id==null)continue;
    const owned=group==='sigil'?next.sigils.includes(id):next.runes.includes(id)&&D.RUNES[id]?.weapon===group;
    if(index>=capacity||used.has(id)||!owned||group!=='sigil'&&!next.weapons.includes(group))throw Error('存档镶嵌无效');
    used.add(id);
   }
  }
  return next;
 }
 class ExpeditionStore{
  constructor(level,storage=null,preview=false){
   this.level=level;this.storage=preview?null:storage;this.key='forest.level.v2.'+level.id;
   this.inCamp=null;this.preview=preview;
   const raw=this.storage?.getItem(this.key);
   this.data=raw?validateExpedition(JSON.parse(raw),level):freshExpedition(level);
  }
  writeAtCamp(next=this.data){
   if(!this.inCamp)return{ok:false,reason:'请进入露营地存档'};
   const saved={...next,campId:this.inCamp};
   validateExpedition(saved,this.level);
   try{this.storage?.setItem(this.key,JSON.stringify(saved));}
   catch(error){return{ok:false,reason:'进度保存失败 · '+error.message};}
   this.data=saved;return{ok:true};
  }
  grant(q){
   if(this.data.claimed.includes(q.id))return false;
   const d=this.data;d.claimed.push(q.id);
   if(q.grantKind==='slot'){
    const {target,capacity}=D.SLOT_UPGRADES[q.grantId];
    d.capacity[target]=Math.max(d.capacity[target],capacity);
   }else{
    const list={sigil:d.sigils,weapon:d.weapons,rune:d.runes}[q.grantKind];
    if(!list.includes(q.grantId))list.push(q.grantId);
    if(q.grantKind==='weapon')d.capacity[q.grantId]=Math.max(1,d.capacity[q.grantId]);
   }
   return true;
  }
  equip(group,slot,id){
   if(!this.inCamp)return{ok:false,reason:'只可在露营地镶嵌'};
   const slots=group==='sigil'?[0,1,2]:Object.hasOwn(D.SOCKETS,group)?D.SOCKETS[group]:[];
   const index=slots.indexOf(slot),d=this.data;
   if(index<0||index>=d.capacity[group]||group!=='sigil'&&!d.weapons.includes(group))return{ok:false,reason:'槽位尚未解锁'};
   const owned=id===null||(group==='sigil'?d.sigils.includes(id):d.runes.includes(id)&&D.RUNES[id]?.weapon===group);
   if(!owned)return{ok:false,reason:'该符印或技能不能放入此槽'};
   const next=D.clone(d),current=next.sockets[group];
   for(const other of slots)if(current[other]===id)current[other]=null;
   current[slot]=id;
   return this.writeAtCamp(next);
  }
  hasSigil(id){return this.data.sockets.sigil.includes(id);}
  spiritLimit(){return this.hasSigil('mirror')?8:6;}
  clearRoom(room){
   if(this.data.clearedRooms.includes(room.id))return false;
   this.data.clearedRooms.push(room.id);
   if(!this.data.sigils.includes(room.sigil))this.data.sigils.push(room.sigil);
   return true;
  }
  fillPreview(){
   const d=this.data;
   d.weapons=Object.keys(D.WEAPON_NAMES);d.sigils=Object.keys(D.SIGILS);d.runes=Object.keys(D.RUNES);
   d.capacity={sigil:3,sword:2,dagger:1,staff:3};
   d.sockets={sigil:['wind','wall','mirror'],sword:{neutral:'swordSpin',up:'swordRise'},dagger:{neutral:'daggerEcho'},staff:{neutral:'fireball',up:'iceArrow',down:'shock'}};
  }
 }
 function applyBuild(game,store,random=Math.random){
  game.skillGate=id=>!D.SKILLS[id]||store.data.skills.includes(id);
  game.weaponStats=function(family=this.player.weapon){const base=E.WEAPONS[family],w=D.WEAPONS[store.data.selectedWeapons[family]];return{...base,attackDuration:base.attackDuration*w.speed,rangeScale:base.rangeScale*w.reach};};
  game.attackDamage=function(base,family=this.player.actionWeapon){const w=D.WEAPONS[store.data.selectedWeapons[family]],roll=w.minAttack+Math.floor(Math.min(.999999,Math.max(0,random()))*(w.maxAttack-w.minAttack+1));return Math.max(1,Math.round(roll*base/10*(this.player.boostTimer>0?1.5:1)));};
  game.abilityState=function(id){const a=E.Practice.prototype.abilityState.call(this,id),locked=!this.hasSkill(a.id);return{...a,locked,ready:a.ready&&!locked};};
  game.player.weapon=D.WEAPONS[store.data.equipped].family;game.player.actionWeapon=game.player.weapon;
 }
 const api={fresh,validate,Store,ExpeditionStore,applyBuild};if(node)module.exports=api;else root.ForestProgress=api;
})(typeof window!=='undefined'?window:globalThis);
