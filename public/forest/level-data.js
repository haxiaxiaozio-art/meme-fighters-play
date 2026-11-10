(function(root){
 'use strict';
 const SKILLS={
  doubleJump:{name:'二段跳',cost:2,requires:[],text:'空中再次起跳，探索高处平台。'},
  airDash:{name:'空中冲刺',cost:2,requires:['doubleJump'],text:'在空中按冲刺键跨越长间隙。'},
  airAttack:{name:'跳跃攻击',cost:1,requires:[],text:'跳跃中可以挥动武器。'},
  specialNeutral:{name:'回旋斩',cost:1,requires:[],text:'剑的无方向特殊技。'},
  specialUp:{name:'升龙斩',cost:1,requires:['specialNeutral'],text:'剑的向上特殊技。'},
  specialDown:{name:'反击 / 落剑',cost:1,requires:[],text:'剑与匕首的地面反击；剑的空中下劈。'},
  specialSide:{name:'突进斩',cost:1,requires:['specialNeutral'],text:'剑的水平方向特殊技。'},
  dashAttack:{name:'疾步斩',cost:1,requires:[],text:'冲刺中接普攻。'},
  specialDash:{name:'破风斩',cost:2,requires:['specialSide'],text:'剑在冲刺中接特殊技。'},
  daggerSpecial:{name:'往返影刃',cost:2,requires:[],text:'匕首特殊技，投出并收回飞刀。'},
  staffHeal:{name:'森林祈愈',cost:2,requires:[],text:'法杖无方向特殊技，回复生命。'},
  staffPurge:{name:'净空圆环',cost:2,requires:[],text:'法杖下方向特殊技，清除附近弹幕。'}
 };
 const branches=[['balance','守衡','均衡',1,1],['swift','迅影','缩短出手时间，单次伤害降低',.72,.9],['heavy','重击','提高单次伤害，收招变长',1.35,.95],['reach','长锋','扩大攻击距离，单次伤害降低',1.1,1.35],['resonance','共鸣','攻击力上限更高，但区间波动更大',1.05,1.05]];
 const power={sword:[[12,17],[8,12],[20,27],[10,15],[9,24]],dagger:[[10,14],[6,10],[16,22],[8,12],[7,20]],staff:[[5,9],[3,6],[10,14],[4,8],[3,13]]};
 const names={sword:'霜牙长剑',dagger:'赤晶匕首',staff:'青晶法杖'},WEAPONS={};
 for(const family of Object.keys(names))branches.forEach(([branch,suffix,text,speed,reach],i)=>{const id=family+'-'+branch;WEAPONS[id]={id,family,name:names[family]+'·'+suffix,branch,text,minAttack:power[family][i][0],maxAttack:power[family][i][1],speed,reach};});
 const ENEMIES={slime:{name:'史莱姆',hp:45,damage:10,w:54,h:44,range:220,speed:65,windup:.5,attack:.65,recover:.8,scale:.22},goblin:{name:'哥布林',hp:75,damage:15,w:42,h:80,range:78,speed:135,windup:.45,attack:.18,recover:.75,scale:.28},fairy:{name:'森之妖精',hp:42,damage:9,w:36,h:65,range:370,speed:70,windup:.65,attack:.16,recover:1.6,scale:.22},treant:{name:'树妖',hp:150,damage:20,w:64,h:100,range:390,speed:0,windup:.85,attack:.28,recover:1.35,scale:.34}};
 const TYPES=['platform','spawn','exit','checkpoint','chest','reward','enemy','bossRoom'];
 const EXPEDITION_TYPES=['platform','spawn','exit','camp','grant','enemy','bossRoom','vine','water'];
 const SIGILS={
  wind:{name:'风跃符印',text:'二段跳、地面冲刺与空中冲刺'},
  wall:{name:'攀木符印',text:'贴墙缓落，按跳跃蹬墙'},
  mirror:{name:'镜心符印',text:'灵能上限 +2 格'}
 };
 const WEAPON_NAMES={sword:'霜牙长剑',dagger:'赤晶匕首',staff:'青晶月杖'};
 const SOCKETS={sword:['neutral','up'],dagger:['neutral'],staff:['neutral','up','down']};
 const RUNES={
  swordSpin:{name:'回旋斩',weapon:'sword',cost:2,text:'横扫周围的敌人。'},
  swordRise:{name:'升龙斩',weapon:'sword',cost:2,text:'向上斩击并腾空。'},
  daggerEcho:{name:'往返影刃',weapon:'dagger',cost:2,text:'飞刃穿透目标，随后返回。'},
  fireball:{name:'火球',weapon:'staff',cost:2,text:'火球命中后爆炸，可烧毁藤蔓。',damage:38,color:'#ffc47d'},
  iceArrow:{name:'寒冰箭',weapon:'staff',cost:2,text:'冰箭穿入流水，凝成 8 秒落脚点。',damage:30,color:'#a0eafa'},
  shock:{name:'电流冲击',weapon:'staff',cost:3,text:'打击自身附近的多个目标。',damage:47,color:'#e4bbff'}
 };
 const SLOT_UPGRADES={
  'sigil-2':{name:'双纹符印座',target:'sigil',capacity:2},
  'sigil-3':{name:'三纹符印座',target:'sigil',capacity:3},
  'sword-2':{name:'长剑拓槽石',target:'sword',capacity:2},
  'staff-2':{name:'月杖拓槽石',target:'staff',capacity:2},
  'staff-3':{name:'月杖双纹拓槽石',target:'staff',capacity:3}
 };
 const GRANTS={sigil:SIGILS,weapon:WEAPON_NAMES,rune:RUNES,slot:SLOT_UPGRADES};
 const grantName=(kind,id)=>GRANTS[kind]?.[id]?.name||WEAPON_NAMES[id]||id;
 const clone=o=>JSON.parse(JSON.stringify(o));
 function validate(input){
  if(!input||typeof input!=='object'||![1,2].includes(input.version))throw Error('关卡版本必须为 1 或 2');
  const expedition=input.version===2,types=expedition?EXPEDITION_TYPES:TYPES;
  if(typeof input.id!=='string'||!/^[-a-zA-Z0-9_]{1,64}$/.test(input.id))throw Error('关卡 ID 只能包含字母、数字、横线和下划线');
  if(typeof input.name!=='string'||!input.name.trim()||input.name.length>60)throw Error('关卡名称需要 1 至 60 个字');
  for(const [k,min,max]of [['width',1600,30000],['height',720,2400]])if(!Number.isFinite(input[k])||input[k]<min||input[k]>max)throw Error('关卡 '+k+' 超出范围');
  if(!Array.isArray(input.objects)||input.objects.length>300)throw Error('关卡对象不得超过 300 个');
  const ids=new Set(),objects=[];
  for(const q of input.objects){
   if(!q||!types.includes(q.type)||typeof q.id!=='string'||!/^[-a-zA-Z0-9_]{1,64}$/.test(q.id)||ids.has(q.id))throw Error('对象类型或 ID 无效/重复');ids.add(q.id);
   if(!Number.isFinite(q.x)||!Number.isFinite(q.y)||q.x<0||q.x>input.width||q.y<0||q.y>input.height)throw Error(q.id+' 坐标越界');
   const o={id:q.id,type:q.type,x:q.x,y:q.y,name:String(q.name||q.type).slice(0,60)};
   if(['platform','reward','bossRoom','camp','grant','vine','water'].includes(q.type)){for(const k of ['w','h'])if(!Number.isFinite(q[k])||q[k]<16||q[k]>(k==='w'?input.width:input.height))throw Error(q.id+' 尺寸无效');o.w=q.w;o.h=q.h;if(o.x+o.w>input.width||(q.type==='bossRoom'?o.y-o.h<0:o.y+o.h>input.height))throw Error(q.id+' 区域越界');}
   if(!expedition&&['chest','reward','bossRoom'].includes(q.type)){if(!Number.isInteger(q.points)||q.points<0||q.points>99)throw Error(q.id+' 技能点需为 0 至 99 的整数');o.points=q.points;}
   if(expedition&&q.type==='platform')o.climb=q.climb===true;
   if(q.type==='grant'){
    if(!Object.hasOwn(GRANTS,q.grantKind)||!Object.hasOwn(GRANTS[q.grantKind],q.grantId))throw Error(q.id+' 授予内容无效');
    o.grantKind=q.grantKind;o.grantId=q.grantId;
    o.guard=q.guard||'';
   }
   if(q.type==='enemy'){if(!Object.hasOwn(ENEMIES,q.kind))throw Error('未知敌人');o.kind=q.kind;for(const [k,min,max]of [['patrol',0,1600],['respawn',0,600]]){if(!Number.isFinite(q[k])||q[k]<min||q[k]>max)throw Error(q.id+' '+k+' 无效');o[k]=q[k];}}
   if(q.type==='bossRoom'){for(const [k,min,max]of [['entryWidth',32,500],['exitX',0,input.width],['exitY',0,input.height]]){if(!Number.isFinite(q[k])||q[k]<min||q[k]>max)throw Error(q.id+' '+k+' 无效');o[k]=q[k];}if(expedition){o.sigil=q.sigil||'mirror';if(!Object.hasOwn(SIGILS,o.sigil))throw Error(q.id+' 符印无效');}}
   objects.push(o);
  }
  for(const type of ['spawn','exit'])if(objects.filter(q=>q.type===type).length!==1)throw Error('必须且只能有一个 '+(type==='spawn'?'出生点':'终点'));
  if(!objects.some(q=>q.type==='platform'))throw Error('至少需要一块地面');
  for(const q of objects)if(q.guard&&!objects.some(g=>g.type==='vine'&&g.id===q.guard))throw Error(q.id+' 引用的藤蔓不存在');
  return{version:input.version,id:input.id,name:input.name,width:input.width,height:input.height,objects};
 }
 function object(type,id,x,y,extra={}){return{id,type,x,y,name:{platform:'路面',spawn:'出生点',exit:'通关出口',checkpoint:'检查点',chest:'宝箱',reward:'路段奖励',enemy:'敌人刷新点',bossRoom:'爱丽丝的茶会'}[type],...(['platform','reward','bossRoom'].includes(type)?{w:type==='bossRoom'?1280:240,h:type==='platform'?48:160}:{}),...(['chest','reward','bossRoom'].includes(type)?{points:type==='bossRoom'?5:2}:{}),...(type==='enemy'?{kind:'slime',patrol:220,respawn:20}:{}),...(type==='bossRoom'?{entryWidth:100,exitX:x+1360,exitY:y}:{}),...extra};}
 function demo(){const o=[];const add=(type,id,x,y,p)=>o.push(object(type,id,x,y,p));
  [[0,1600],[1730,1370],[3240,1560],[4930,3170]].forEach(([x,w],i)=>add('platform','ground-'+i,x,590,{w,h:130}));
  add('spawn','start',140,590);add('exit','finish',7950,590);
  [1900,3500,5100,6200].forEach((x,i)=>add('checkpoint','checkpoint-'+i,x,590));
  [1450,2900,4600,6000].forEach((x,i)=>add('reward','section-'+i,x,430,{w:100,h:160,points:2,name:'路段 '+(i+1)}));
  [[550,590,2],[2450,590,3],[3900,590,3],[5600,590,3],[1210,375,3],[4770,300,3]].forEach(([x,y,points],i)=>add('chest','chest-'+i,x,y,{points}));
  add('platform','high-route',1080,375,{w:260,h:32,name:'二段跳探索台'});
  add('platform','air-route-a',4070,450,{w:180,h:32});add('platform','air-route-b',4650,300,{w:230,h:32,name:'空中冲刺探索台'});
  [['slime',820,590],['goblin',2200,590],['fairy',2770,420],['treant',3710,590],['slime',4370,590],['goblin',5310,590],['fairy',5840,420]].forEach(([kind,x,y],i)=>add('enemy','enemy-'+i,x,y,{kind}));
  add('bossRoom','alice-room',6380,590,{w:1280,h:180,exitX:7770,exitY:590,points:5});return validate({version:1,id:'forest-whitebox',name:'森境 · 初行者的小径',width:8100,height:900,objects:o});
 }
 function expeditionObject(type,id,x,y,extra={}){
  const names={camp:'露营地',grant:'固定授予',vine:'缠生藤蔓',water:'流水'};
  const sizes={camp:{w:140,h:105},grant:{w:90,h:100},vine:{w:60,h:110},water:{w:420,h:70}};
  if(!names[type])return object(type,id,x,y,{...(type==='bossRoom'?{sigil:'mirror'}:{}),...extra});
  return{id,type,x,y,name:names[type],...sizes[type],...(type==='grant'?{grantKind:'sigil',grantId:'wind',guard:''}:{}),...extra};
 }
 function expedition(){
  const objects=[];
  const add=(type,id,x,y,extra)=>objects.push(expeditionObject(type,id,x,y,extra));
  const floor=(id,x,y,w,h=85,climb=false,name='路面')=>add('platform',id,x,y,{w,h,climb,name});
  const grant=(id,x,y,grantKind,grantId,guard='')=>add('grant',id,x,y-100,{name:grantName(grantKind,grantId),grantKind,grantId,guard});
  const camp=(id,name,x,y)=>add('camp',id,x,y-105,{name});
  floor('ground-0',0,590,700);floor('roots-floor',300,900,780);floor('roots-step',820,735,185,85,false,'折返踏台');
  floor('lookout',800,385,930,85,false,'茶会高台 · 风跃');floor('shaft-approach',1610,590,900);
  floor('shaft-left',2200,180,55,285,true);floor('shaft-right',2480,250,65,340,true,'攀木井 · 贴墙后按跳跃');
  floor('canopy',2480,250,1360);floor('vine-shelf',3300,115,365,35);
  floor('tea-road',3920,250,4860);floor('river-west',3720,590,580);floor('river-east',5180,590,430);
  floor('river-end',5550,250,70,500);
  add('spawn','start',140,590);add('exit','finish',8600,250,{name:'镜后庭院'});
  camp('camp-roots','林口营地',480,590);camp('camp-wind','树根营地',520,900);camp('camp-shaft','攀木营地',1900,590);
  camp('camp-staff','树冠营地',2700,250);camp('camp-river','河岸营地',3800,590);
  camp('camp-tea','茶会前营地',6380,250);camp('camp-mirror','镜后营地',8180,250);
  grant('wind-sigil',565,900,'sigil','wind');grant('sword-spin',910,385,'rune','swordSpin');
  grant('dagger',1190,385,'weapon','dagger');grant('dagger-echo',1370,385,'rune','daggerEcho');
  grant('sigil-seat-2',1780,590,'slot','sigil-2');grant('wall-sigil',1920,590,'sigil','wall');grant('staff',2810,250,'weapon','staff');
  grant('fire-rune',2930,250,'rune','fireball');grant('ice-rune',3050,250,'rune','iceArrow');
  grant('staff-slot-2',3140,250,'slot','staff-2');
  add('vine','shock-vine',3480,8,{name:'火球可烧毁的藤蔓',w:67,h:107});
  grant('shock-rune',3550,115,'rune','shock','shock-vine');
  grant('staff-slot-3',3600,115,'slot','staff-3','shock-vine');
  add('water','river',4300,590,{name:'寒冰箭可冻结的流水',w:880,h:110});
  grant('rise-rune',5360,590,'rune','swordRise');
  grant('sword-slot-2',5430,590,'slot','sword-2');
  grant('sigil-seat-3',8200,250,'slot','sigil-3');
  for(const [id,x,y,kind] of [
   ['first-slime',295,590,'slime'],['roots-slime',875,900,'slime'],['lookout-goblin',1550,385,'goblin'],
   ['canopy-slime',3200,250,'slime'],['canopy-goblin',3300,250,'goblin'],['canopy-fairy',3400,165,'fairy'],
   ['river-slime',3960,590,'slime'],['river-goblin',4080,590,'goblin'],['river-fairy',4125,450,'fairy'],['river-east-slime',5475,590,'slime'],
   ['tea-slime',4830,250,'slime'],['tea-goblin',4990,250,'goblin'],['tea-fairy',5090,135,'fairy'],
   ['tea-treant',5360,250,'treant'],['tea-slime-2',5480,250,'slime'],['tea-goblin-2',5620,250,'goblin'],
   ['tea-fairy-2',5880,135,'fairy'],['tea-treant-2',6060,250,'treant'],['mirror-fairy',8460,120,'fairy']
  ])add('enemy',id,x,y,{kind,patrol:120,respawn:12});
  add('bossRoom','alice-room',6750,250,{w:1280,h:180,exitX:8080,exitY:250,sigil:'mirror'});
  return validate({version:2,id:'forest-expedition',name:'森境 · 通往茶会的小径',width:8800,height:1150,objects});
 }
 function upgrade(level){
  if(level.version===2)return level;
  const objects=level.objects.filter(q=>!['chest','reward'].includes(q.type)).map(q=>q.type==='checkpoint'
   ?expeditionObject('camp',q.id,Math.max(0,Math.min(q.x-45,level.width-90)),Math.max(0,Math.min(q.y-80,level.height-80)),{name:'露营地',w:90,h:80}):q);
  const start=level.objects.find(q=>q.type==='spawn');
  let index=0;
  const nextId=prefix=>{let id;do{id=prefix+'-'+index++;}while(objects.some(q=>q.id===id));return id;};
  objects.push(expeditionObject('camp',nextId('camp'),Math.max(0,Math.min(start.x-50,level.width-140)),Math.max(0,Math.min(start.y-95,level.height-105)),{name:'起点营地'}));
  objects.push(expeditionObject('grant',nextId('wind'),Math.max(0,Math.min(start.x-30,level.width-90)),Math.max(0,Math.min(start.y-70,level.height-100)),{name:SIGILS.wind.name}));
  return validate({...level,version:2,objects});
 }
 const api={SKILLS,WEAPONS,ENEMIES,TYPES,EXPEDITION_TYPES,SIGILS,WEAPON_NAMES,SOCKETS,RUNES,SLOT_UPGRADES,GRANTS,grantName,validate,object,demo,expeditionObject,expedition,upgrade,clone};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.ForestLevelData=api;
})(typeof window!=='undefined'?window:globalThis);
