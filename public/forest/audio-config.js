(function(root){
  'use strict';
  // Original layered sound designs. Frequencies are Hz, times are seconds.
  // One shared timbre policy covers attacks, skills, enemy volleys and UI cues.
  const warmTone=f=>f<=600?f:Math.min(1200,600+(f-600)*.35);
  const warmBell=f=>f<=450?f:Math.min(1050,450+(f-450)*.32);
  const noise=(d,g,lo,hi,at=0,attack=.025)=>({kind:'noise',duration:d,gain:g,low:Math.min(lo*.6,650),high:Math.min(hi*.8,2600),start:at,attack:Math.max(.016,attack)});
  const tone=(d,g,f0,f1=f0,at=0,wave='sine')=>({kind:'tone',duration:d,gain:g,f0:warmTone(f0),f1:warmTone(f1),start:at,wave,attack:.012});
  const bell=(d,g,f,at=0)=>({kind:'metal',duration:d,gain:g,f0:warmBell(f),f1:warmBell(f)*.98,start:at,attack:.018});
  const chimes=(notes,d=.45,g=.28,gap=.055)=>notes.map((f,i)=>bell(d,g,f,i*gap));
  const definitions={};
  function cue(id,label,duration,layers,options={}) {
    const d={label,duration,layers,gain:.82,peak:.82,priority:2,cooldown:.045,group:'effects',...options};
    if(!d.voice){d.peak=Math.min(d.priority>=5?.64:.56,d.peak*.85);if(d.group==='bullets')d.cooldown=Math.max(.14,d.cooldown);}
    definitions[id]=d;
  }
  cue('swordSlash','长剑 · 柔风挥斩',.25,[noise(.22,.65,90,1500,0,.04),tone(.2,.35,180,85,.015)],{gain:.62,peak:.56});
  cue('daggerSlash','匕首 · 轻刃掠风',.18,[noise(.13,.55,170,1800,0,.025),noise(.10,.25,260,1500,.045,.022),tone(.13,.25,280,140)],{gain:.58,peak:.5});
  cue('staffStrike','法杖 · 温润共鸣',.43,[noise(.28,.25,110,1100,0,.05),tone(.35,.4,330,300),tone(.31,.2,495,450,.025),tone(.25,.2,130,90)],{gain:.6,peak:.52});
  cue('swordImpact','长剑 · 沉实命中',.23,[noise(.15,.4,100,1800,0,.018),tone(.2,.7,145,55),tone(.18,.15,360,260)],{priority:4,gain:.65,peak:.62});
  cue('daggerImpact','匕首 · 轻刺命中',.18,[noise(.10,.4,200,2000,0,.016),tone(.14,.55,230,100),tone(.13,.15,460,300)],{priority:4,gain:.62,peak:.58});
  cue('staffImpact','法杖 · 柔光命中',.4,[tone(.24,.55,130,55),noise(.14,.2,180,1400,0,.025),tone(.34,.3,392,370,.02),tone(.3,.15,588,555,.045)],{priority:4,gain:.6,peak:.58});
  cue('swordSpin','回旋斩 · 连续风刃',.57,[noise(.2,.9,350,5600,0,.025),noise(.2,.8,550,4800,.14,.025),noise(.24,1,300,6500,.28,.02),bell(.3,.25,1150,.2)]);
  cue('swordRise','升龙斩 · 上升刀鸣',.4,[noise(.32,.85,450,6500,0,.04),tone(.3,.3,220,1050),bell(.22,.3,1820,.16)]);
  cue('swordPlunge','落剑 · 下落破风',.3,[noise(.27,1,180,4800,0,.03),tone(.25,.35,610,80)]);
  cue('swordBurst','突进斩 · 裂风',.32,[noise(.23,1,250,7400,0,.018),tone(.19,.65,190,45),bell(.26,.3,1200,.025)]);
  cue('riposte','反击 · 强斩',.36,[noise(.23,.95,500,7600),tone(.23,.7,170,48),bell(.32,.5,1450)],{priority:5,peak:.92});
  cue('daggerCast','往返影刃 · 投掷',.38,[noise(.19,.8,1600,8000),tone(.22,.3,1100,270),bell(.3,.35,2640,.05)]);
  cue('staffCharge','法杖 · 聚能',.55,[noise(.46,.35,1000,4400,0,.12),tone(.46,.27,220,660),tone(.46,.15,330,990)],{group:'charge',priority:1});
  cue('heal','森林祈愈 · 回复',.85,[...chimes([523.25,659.25,783.99,1046.5],.6,.3,.07),noise(.55,.18,2500,8500,0,.1)],{priority:4});
  cue('purge','净空圆环 · 清弹爆发',.65,[noise(.36,1,180,8000,0,.014),tone(.34,.65,175,40),...chimes([880,1320,1760],.48,.27,.04)],{priority:5,peak:.92});
  cue('slam','落地震击 · 重爆',.47,[tone(.35,1,120,32),noise(.27,.8,60,2400),noise(.1,.3,1800,6500),bell(.4,.15,410)],{priority:5,peak:.94});
  cue('dash','冲刺 · 一次轻风',.24,[noise(.22,.65,90,1800,0,.04),tone(.18,.2,190,75)],{priority:3,gain:.62,peak:.56});
  cue('jump','跳跃 · 轻踏',.18,[noise(.14,.25,80,900,0,.025),tone(.16,.55,145,210)],{gain:.48,peak:.45,priority:1});
  cue('doubleJump','二段跳 · 柔风踏步',.26,[noise(.20,.28,130,1300,0,.04),tone(.23,.4,220,330),tone(.18,.15,330,440,.035)],{gain:.52,peak:.48,priority:2});
  cue('land','落地 · 靴底',.13,[noise(.10,.8,80,1400),tone(.085,.5,100,48)],{gain:.5,priority:1});
  cue('guard','格挡 · 举剑',.18,[noise(.075,.4,1300,5000),bell(.16,.55,1750)],{gain:.64});
  cue('parry','格挡成功 · 清脆交击',.42,[noise(.085,.65,2300,9200),bell(.35,.8,1400),bell(.39,.4,2240),tone(.14,.35,280,100)],{priority:6,peak:.94});
  cue('counter','反击判定 · 亮音',.36,[...chimes([1175,1760,2350],.27,.35,.025),noise(.08,.3,2600,8600)],{priority:6});
  cue('evade','空中回避 · 轻风',.23,[noise(.2,.75,1100,6500,0,.03),tone(.16,.16,620,200)],{gain:.65});
  cue('evaded','回避成功 · 闪响',.2,[bell(.17,.35,1760),bell(.17,.2,2640,.02)],{priority:4});
  cue('hurt','白狼受击 · 顿挫',.24,[noise(.14,.8,200,4000),tone(.18,.6,160,45)],{priority:5});
  cue('weaponSwitch','切换武器 · 三音',.35,chimes([440,660,990],.23,.4,.045),{priority:3});
  cue('charge','练习弹 · 蓄力',.25,[tone(.23,.4,160,420),noise(.15,.35,800,3400)],{priority:1});
  cue('shot','练习弹 · 发射',.18,[noise(.13,.7,800,6000),tone(.13,.4,500,130)]);
  cue('aliceCharge','爱丽丝 · 起手提示',.31,[bell(.27,.4,698),bell(.27,.25,1046),noise(.22,.3,1600,5400,0,.07)],{gain:.65,priority:3,cooldown:.3});
  cue('aliceThrust','爱丽丝 · 阳伞突刺',.25,[noise(.18,.75,750,6400,0,.015),bell(.21,.5,1120),tone(.12,.3,210,80)],{priority:4,cooldown:.13});
  cue('aliceSweep','爱丽丝 · 阳伞上挑',.32,[noise(.27,.8,300,5000,0,.02),bell(.26,.4,1540,.035),tone(.22,.2,210,560)],{priority:4,cooldown:.13});
  cue('aliceRush','爱丽丝 · 伞冲击',.36,[noise(.3,.9,180,4300,0,.035),bell(.25,.25,930),tone(.25,.35,210,55)],{priority:3});
  cue('aliceLeap','爱丽丝 · 开伞飞跃',.46,[noise(.12,.9,200,3400),noise(.3,.45,1200,6000,.06,.08),...chimes([698,932,1397],.28,.25,.045)]);
  cue('aliceFlower','爱丽丝 · 玫瑰弹',.18,[noise(.105,.55,1700,7400),bell(.14,.35,1568),tone(.1,.25,760,330)],{gain:.57,priority:1,cooldown:.095,group:'bullets'});
  cue('aliceBloom','爱丽丝 · 玫瑰爆裂',.32,[noise(.23,.9,180,4800),tone(.24,.6,130,40),bell(.27,.27,932)],{priority:3,cooldown:.09});
  cue('aliceCat','爱丽丝 · 柴郡猫召唤',.48,[...chimes([466,622,932],.3,.3,.055),tone(.29,.33,520,160,.05,'triangle'),noise(.17,.25,700,2300)]);
  cue('aliceRabbit','爱丽丝 · 三月兔召唤',.43,[...chimes([784,988,1568],.28,.3,.045),tone(.24,.3,300,850,0,'triangle'),noise(.1,.25,1900,6800)]);
  cue('aliceRain','爱丽丝 · 刀雨预警',.48,[...chimes([698,740,1046],.37,.35,.035),noise(.32,.5,1500,7800,0,.08)],{priority:4});
  cue('aliceKnives','爱丽丝 · 刀雨发射',.31,[noise(.24,.8,2200,9000),bell(.24,.4,2350),bell(.27,.3,3136,.025)],{gain:.65,priority:2,cooldown:.11,group:'bullets'});
  cue('aliceThrow','爱丽丝 · 飞伞投掷',.31,[noise(.26,.85,220,5600),bell(.27,.25,1397),tone(.22,.3,480,130)],{priority:3});
  cue('aliceBounce','爱丽丝 · 飞伞反弹',.18,[bell(.15,.65,1864),noise(.075,.5,1800,7000),tone(.1,.25,330,110)],{priority:2,cooldown:.1});
  cue('aliceCards','爱丽丝 · 飞牌',.24,[noise(.08,.7,1200,6500),noise(.09,.6,2300,7800,.045),noise(.10,.5,1800,6000,.09),bell(.17,.15,2794)],{priority:3});
  cue('aliceThorn','爱丽丝 · 荆棘爆发',.46,[noise(.3,.95,120,3200),noise(.16,.45,1500,6700,.04),tone(.32,.55,145,38),bell(.4,.2,349)],{priority:4,peak:.92});
  cue('aliceCounter','爱丽丝 · 当身架势',.38,[bell(.31,.6,932),bell(.34,.35,1397),noise(.10,.4,1800,6200)],{priority:4});
  cue('heartAppear','红心替身 · 凝聚',.6,[...chimes([698,880,1046,1397],.4,.28,.05),tone(.4,.3,100,190)],{priority:3});
  cue('heartBreak','红心替身 · 碎裂',.5,[noise(.25,.85,2000,10000),...chimes([2794,2093,1568],.32,.35,.04),tone(.24,.3,160,55)],{priority:5});
  cue('aliceHurt','爱丽丝 · 受击',.17,[noise(.12,.6,700,4600),bell(.14,.2,1397),tone(.1,.3,220,100)],{gain:.48,priority:2,cooldown:.15});
  cue('aliceDefeat','爱丽丝 · 败退',.9,[...chimes([1046,880,698,523],.6,.3,.075),noise(.42,.22,300,2100,0,.03)],{priority:6});
  cue('phase','爱丽丝 · 阶段转换',.95,[tone(.7,.4,87,65),...chimes([349,466,698,1046],.65,.32,.07),noise(.6,.5,350,5600,0,.14)],{priority:6,peak:.9});
  cue('catBind','柴郡猫 · 束缚',.28,[tone(.23,.35,580,170,0,'triangle'),bell(.22,.3,932),noise(.11,.4,1200,4300)],{priority:3});
  cue('candyThrow','三月兔 · 投糖',.18,[tone(.14,.35,420,900,0,'triangle'),noise(.09,.4,2200,7000)],{gain:.5,priority:1,cooldown:.1,group:'bullets'});
  cue('candyBounce','糖果 · 弹跳',.1,[tone(.08,.5,460,180,0,'triangle'),noise(.04,.3,1300,5000)],{gain:.27,priority:0,cooldown:.09,group:'bullets'});
  cue('hatReturn','爱丽丝 · 帽伞回收',.3,[noise(.14,.5,800,4000),...chimes([1046,1397],.2,.27,.035)],{gain:.65});
  cue('victory','挑战完成',1.0,chimes([523,659,784,1046],.65,.35,.09),{priority:6});
  cue('lost','挑战失败',.65,chimes([392,330,262],.4,.35,.09),{priority:6});
  cue('aliceLaugh','爱丽丝 · 得意的大笑',3.1,[],{priority:7,cooldown:1,group:'voice',gain:1,peak:.85,voice:true});
  const api={sampleRate:24000,master:.75,effects:.82,voice:.95,maxVoices:12,maxBulletVoices:3,
    processing:{lowpassHz:2600,fadeIn:.008,fadeOut:.018,metalPartials:[[1,.84],[2,.12],[3,.04]]},definitions};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.ForestAudioConfig=api;
})(typeof window!=='undefined'?window:globalThis);
