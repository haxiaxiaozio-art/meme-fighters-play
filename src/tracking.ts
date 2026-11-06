import {apiFetch} from './api';
import {createTracker} from './analytics';

export const track = createTracker({
 enabled: ['fuuhaku.cc','haxiaxiaozio-art.github.io'].includes(location.hostname)
  && !new URLSearchParams(location.search).has('admin') && navigator.doNotTrack !== '1',
 storage: {
  getItem: key => localStorage.getItem(key),
  setItem: (key,value) => localStorage.setItem(key,value),
 },
 randomUUID: () => crypto.randomUUID(),
 send: async payload => {
  const response = await apiFetch('/api/analytics',{method:'POST',keepalive:true,
   headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
  if (!response.ok) throw new Error('访问统计未记录：'+response.status);
 },
 onError: error => console.warn('访问统计暂时不可用。',error),
});
