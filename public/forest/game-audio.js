(function(root){
  'use strict';
  const node=typeof module!=='undefined'&&module.exports;
  const Bank=node?require('./sound-bank'):root.ForestSoundBank, C=Bank.config;
  const Voice=node?require('./assets/audio/alice-voice'):root.AliceVoiceData;
  const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
  function cuesFor(event,game){
    const p=game?.player||{},weapon=event.weapon||p.actionWeapon||p.weapon||'sword',x=event.x??p.x??640;
    const one=(name,options={})=>[{name,options:{x,...options}}];
    if(event.type==='sfx')return one(event.cue,{rate:event.rate??1});
    if(event.type==='swing'){
      const specials={specialNeutral:'swordSpin',specialUp:'swordRise',specialDown:'swordPlunge',specialSide:'swordBurst',specialDash:'swordBurst',dashAttack:'swordBurst',riposte:'riposte'};
      const name=weapon==='staff'?'staffStrike':weapon==='dagger'?'daggerSlash':specials[event.action]||'swordSlash';
      return one(name,{rate:event.action==='attack2'?1.07:event.action==='attack3'?.91:1,variation:true});
    }
    if(event.type==='hit'){
      const r=one(({sword:'swordImpact',dagger:'daggerImpact',staff:'staffImpact'})[weapon]||'swordImpact',{variation:true});
      if(event.target==='alice')r.push({name:'aliceHurt',options:{x}});return r;
    }
    if(event.type==='castStart')return one('staffCharge');
    if(event.type==='daggerCast')return one('daggerCast');
    if(event.type==='bossAttack')return one('aliceCharge',{x:game?.boss?.x??640});
    if(event.type==='victory')return one('aliceDefeat',{x:game?.boss?.x??640});
    if(event.type==='departed')return one('victory',{x:640});
    if(['heal','purge','slam','dash','jump','doubleJump','land','guard','parry','counter','evade','evaded','hurt','weaponSwitch','charge','shot','phase','lost'].includes(event.type))return one(event.type);
    return [];
  }
  function voiceSamples(){
    if(!Voice?.pcm16)throw new Error('Missing Alice voice data');
    const bytes=node?Buffer.from(Voice.pcm16,'base64'):Uint8Array.from(atob(Voice.pcm16),c=>c.charCodeAt(0));
    const pcm=new Float32Array(bytes.length/2);
    for(let i=0;i<pcm.length;i++){let n=bytes[i*2]|bytes[i*2+1]<<8;if(n>=32768)n-=65536;pcm[i]=n/32768;}return pcm;
  }
  class System{
    constructor(options={}){
      this.AudioClass=options.AudioClass;this.onError=options.onError||(()=>{});this.context=null;this.enabled=true;this.paused=false;
      this.volume=C.master;this.cache=new Map();this.active=[];this.last=new Map();this.serial=0;this.error=null;
    }
    async unlock(){
      if(!this.enabled)return;
      try{
        if(!this.context){
          if(!this.AudioClass)throw new Error('此环境不支持音效播放');
          const c=this.context=new this.AudioClass();this.master=c.createGain();this.master.gain.value=this.volume;
          this.compressor=c.createDynamicsCompressor();
          for(const [key,value] of Object.entries({threshold:-16,knee:12,ratio:5,attack:.006,release:.2}))this.compressor[key].value=value;
          this.effects=c.createGain();this.effects.gain.value=C.effects;this.voices=c.createGain();this.voices.gain.value=C.voice;
          this.limiter=c.createWaveShaper();const curve=new Float32Array(2049);
          // Unity gain below the knee. The old curve boosted quiet signals by 1.95x.
          for(let i=0;i<curve.length;i++){const x=i/(curve.length-1)*2-1,a=Math.abs(x);curve[i]=a<=.65?x:Math.sign(x)*(.65+.29*(1-Math.exp(-(a-.65)/.29)));}
          this.limiter.curve=curve;this.limiter.oversample='2x';
          this.effects.connect(this.compressor);this.voices.connect(this.compressor);this.compressor.connect(this.limiter);this.limiter.connect(this.master);this.master.connect(c.destination);
          // Build and cache the short PCM cues once, outside the combat update loop.
          for(const name of Object.keys(C.definitions))this.buffer(name);
        }
        if(this.context.state==='suspended')await this.context.resume();
        if(this.context.state!=='running')throw new Error('音频设备尚未就绪，请点击音效按钮重试');
        this.error=null;
      }catch(error){this.error=error.message;this.onError(this.error);}
    }
    buffer(name){
      if(this.cache.has(name))return this.cache.get(name);
      const samples=C.definitions[name]?.voice?voiceSamples():Bank.render(name),buffer=this.context.createBuffer(1,samples.length,C.definitions[name]?.voice?Voice.sampleRate:C.sampleRate);
      buffer.copyToChannel(samples,0);this.cache.set(name,buffer);return buffer;
    }
    setVolume(value){this.volume=clamp(Number(value)||0,0,1);if(this.master)this.master.gain.setTargetAtTime(this.enabled?this.volume:0,this.context.currentTime,.015);}
    setEnabled(value){this.enabled=!!value;if(!this.enabled)this.stopAll();this.setVolume(this.volume);}
    setPaused(value){this.paused=!!value;if(this.paused)this.stopAll();}
    stopVoice(v){
      if(v.stopped)return;v.stopped=true;
      const now=this.context.currentTime;v.gain.gain.cancelScheduledValues(now);v.gain.gain.setTargetAtTime(0,now,.008);v.source.stop(now+.035);
      this.active=this.active.filter(a=>a!==v);
    }
    stopAll(){for(const v of [...this.active])this.stopVoice(v);this.last.clear();}
    stopGroup(group){for(const v of [...this.active])if(v.group===group)this.stopVoice(v);}
    play(name,options={}){
      const c=this.context,def=C.definitions[name];
      if(!def)throw new Error('Unknown audio cue: '+name);
      if(!c||c.state!=='running'||!this.enabled||(this.paused&&!options.audition)||this.volume===0)return false;
      const now=c.currentTime;if(now-(this.last.get(name)??-Infinity)<def.cooldown)return false;
      if(def.group==='bullets'){
        const bullets=this.active.filter(v=>v.group==='bullets').sort((a,b)=>a.priority-b.priority||a.started-b.started);
        if(bullets.length>=C.maxBulletVoices){if(bullets[0].priority>def.priority)return false;this.stopVoice(bullets[0]);}
      }
      // Gameplay-critical cues may replace ambience, never the other way around.
      if(this.active.length>=C.maxVoices){const victim=[...this.active].sort((a,b)=>a.priority-b.priority||a.started-b.started)[0];if(victim.priority>def.priority)return false;this.stopVoice(victim);}
      if(def.group==='voice')this.stopGroup('voice');
      const source=c.createBufferSource(),gain=c.createGain(),pan=c.createStereoPanner?c.createStereoPanner():null;
      source.buffer=this.buffer(name);const variation=options.variation?((this.serial++%5)-2)*.012:0;
      source.playbackRate.value=def.voice?1:clamp((options.rate??1)+variation,.75,1.25);
      gain.gain.value=def.gain*(options.gain??1);source.connect(gain);
      const bus=def.voice?this.voices:this.effects;
      if(pan){pan.pan.value=clamp(((options.x??640)-640)/640,-1,1)*.55;gain.connect(pan);pan.connect(bus);}else gain.connect(bus);
      const v={name,source,gain,pan,priority:def.priority,group:def.group,started:now,stopped:false};this.active.push(v);this.last.set(name,now);
      source.onended=()=>{source.disconnect();gain.disconnect();pan?.disconnect();this.active=this.active.filter(a=>a!==v);};source.start(now);return true;
    }
    ingest(event,game){
      if(['phase','victory','lost','departed'].includes(event.type))this.stopAll();
      if(['heal','purge','hurt','weaponSwitch'].includes(event.type))this.stopGroup('charge');
      const cues=cuesFor(event,game);for(const cue of cues)this.play(cue.name,cue.options);return cues;
    }
    sync(game){
      if(!['staffHeal','staffPurge'].includes(game.player.action))this.stopGroup('charge');
      // Let the expressive laugh finish into the following counter pose.
      if(!['laugh','counterStance'].includes(game.boss?.state))this.stopGroup('voice');
    }
    snapshot(){return{enabled:this.enabled,volume:this.volume,paused:this.paused,ready:this.context?.state==='running',active:this.active.map(v=>v.name),error:this.error};}
  }
  const api={System,cuesFor,voiceSamples,config:C};if(node)module.exports=api;else root.ForestAudio=api;
})(typeof window!=='undefined'?window:globalThis);
