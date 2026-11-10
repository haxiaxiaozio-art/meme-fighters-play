(function(root){
  'use strict';
  const C=typeof module!=='undefined'&&module.exports?require('./audio-config'):root.ForestAudioConfig;
  function seed(name){let n=2166136261;for(const c of name)n=Math.imul(n^c.charCodeAt(0),16777619);return n>>>0;}
  function render(name,sampleRate=C.sampleRate){
    const def=C.definitions[name];if(!def||def.voice)throw new Error('Not a synthesized sound: '+name);
    const out=new Float32Array(Math.ceil(def.duration*sampleRate));let state=seed(name),dc=0;
    const random=()=>{state^=state<<13;state^=state>>>17;state^=state<<5;return (state>>>0)/2147483648-1;};
    for(const layer of def.layers){
      const start=Math.round((+layer.start||0)*sampleRate),count=Math.ceil(layer.duration*sampleRate);let phase=0,lp=0,hpLow=0;
      for(let i=0;i<count&&start+i<out.length;i++){
        const t=i/sampleRate,u=t/layer.duration,attack=Math.min(1,t/(layer.attack||.004));
        const env=attack*Math.exp(-u*(layer.kind==='noise'?3.1:4.2))*Math.min(1,(layer.duration-t)/.012);
        let value;
        if(layer.kind==='noise'){
          const white=random(),low=layer.low||100,high=layer.high||6000;
          lp+=(white-lp)*(1-Math.exp(-2*Math.PI*high/sampleRate));
          hpLow+=(lp-hpLow)*(1-Math.exp(-2*Math.PI*low/sampleRate));value=(lp-hpLow)*2.4;
        }else{
          const f=layer.f0*Math.pow(layer.f1/layer.f0,u);phase+=2*Math.PI*f/sampleRate;
          if(layer.kind==='metal')value=C.processing.metalPartials.reduce((sum,[multiple,gain])=>sum+(f*multiple<sampleRate/2?Math.sin(phase*multiple)*gain:0),0);
          else if(layer.wave==='triangle')value=Math.asin(Math.sin(phase))*2/Math.PI;
          else value=Math.sin(phase);
        }
        out[start+i]+=value*env*layer.gain;
      }
    }
    // Bake a fourth-order Butterworth low pass into every synthesized cue.
    // Avoid saturation here: it would recreate sharp harmonics after softening layers.
    for(let i=0;i<out.length;i++){const v=out[i];dc+=(v-dc)*.003;out[i]=v-dc;}
    const omega=2*Math.PI*Math.min(C.processing.lowpassHz,sampleRate*.4)/sampleRate,cos=Math.cos(omega),sin=Math.sin(omega);
    for(const q of [.5411961001,1.306562965]){
      const alpha=sin/(2*q),a0=1+alpha,b0=(1-cos)/2/a0,b1=(1-cos)/a0,b2=b0,a1=-2*cos/a0,a2=(1-alpha)/a0;let x1=0,x2=0,y1=0,y2=0;
      for(let i=0;i<out.length;i++){const x=out[i],y=b0*x+b1*x1+b2*x2-a1*y1-a2*y2;out[i]=y;x2=x1;x1=x;y2=y1;y1=y;}
    }
    let peak=0;for(const v of out)peak=Math.max(peak,Math.abs(v));
    const gain=def.peak/Math.max(peak,.0001);
    for(let i=0;i<out.length;i++)out[i]*=gain*Math.min(1,i/(sampleRate*C.processing.fadeIn),(out.length-1-i)/(sampleRate*C.processing.fadeOut));
    return out;
  }
  const api={render,config:C};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.ForestSoundBank=api;
})(typeof window!=='undefined'?window:globalThis);
