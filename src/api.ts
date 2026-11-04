declare global {interface Window {MEME_CONFIG?:{apiBase?:string}}}
let visitorToken='';
try{visitorToken=sessionStorage.getItem('meme-visitor-token')||'';}catch{}
export async function apiFetch(path:string,options:RequestInit={}){
 const base=window.MEME_CONFIG?.apiBase?.replace(/\/$/,'');
 if(!base)throw new Error('评论服务正在准备中，请稍后再试。');
 const headers=new Headers(options.headers);
 if(path==='/api/session'&&visitorToken)headers.set('X-Feedback-Token',visitorToken);
 const response=await fetch(base+path,{...options,headers,credentials:'omit'});
 if(path==='/api/session'&&response.ok){const result=await response.clone().json();if(typeof result.token==='string'){visitorToken=result.token;try{sessionStorage.setItem('meme-visitor-token',visitorToken);}catch{}}}
 return response;
}
