const origins=new Set(['https://haxiaxiaozio-art.github.io','https://fuuhaku.cc','http://127.0.0.1:5174']);
const categories:Record<string,string>={experience:'玩后感',balance:'平衡建议',bug:'问题反馈',other:'其他'};
const digest=async(value:string)=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value))),b=>b.toString(16).padStart(2,'0')).join('');
const errorMap:Record<string,[number,string]>={FORBIDDEN:[403,'没有管理权限，访问码无效。'],SESSION_EXPIRED:[403,'评论会话已过期，请重新提交。'],RATE_LIMIT:[429,'发得有点快，请过30秒再试。'],REQUEST_CONFLICT:[409,'提交标识已使用，请刷新后重试。'],INVALID_INPUT:[400,'提交内容无效。'],NOT_FOUND:[404,'没有找到这条评论。']};
function validate(input:Record<string,unknown>){
 const nickname=typeof input.nickname==='string'?input.nickname.trim():'',body=typeof input.body==='string'?input.body.trim():'',category=input.category,rating=input.rating,requestKey=input.requestKey;
 if(input.website||nickname.length<1||nickname.length>20||/[\u0000-\u001f]/.test(nickname))throw new Error('昵称请填写1–20个字符。');
 if(body.length<2||body.length>600||/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(body))throw new Error('玩后感请填写2–600个字符。');
 if(typeof category!=='string'||!Object.hasOwn(categories,category)||(rating!==null&&(!Number.isInteger(rating)||Number(rating)<1||Number(rating)>5)))throw new Error('请选择有效的分类和评分。');
 if(typeof requestKey!=='string'||!/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/.test(requestKey))throw new Error('提交标识无效，请刷新后重试。');
 return {nickname,body,category,rating,requestKey};
}
export function createHandler(env:{url:string;serviceKey:string},fetcher:typeof fetch=fetch){return async(request:Request)=>{
 const origin=request.headers.get('origin'),allowed=!!origin&&origins.has(origin);
 const headers:Record<string,string>={'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','Vary':'Origin'};
 if(allowed)headers['Access-Control-Allow-Origin']=origin!;
 const json=(data:unknown,status=200)=>new Response(JSON.stringify(data),{status,headers});
 if(request.method==='OPTIONS')return allowed?new Response(null,{status:204,headers:{...headers,'Access-Control-Allow-Methods':'GET,POST,PATCH,OPTIONS','Access-Control-Allow-Headers':'Content-Type,X-Feedback-Token,X-Admin-Key','Access-Control-Max-Age':'600'}}):json({error:'访问来源不受支持。'},403);
 if(origin&&!allowed)return json({error:'访问来源不受支持。'},403);
 if(request.method!=='GET'&&!allowed)return json({error:'请从游戏页面提交。'},403);
 const url=new URL(request.url),path=url.pathname.slice(url.pathname.lastIndexOf('/api/'));
 const token=request.headers.get('x-feedback-token')||'',adminKey=request.headers.get('x-admin-key')||'';
 const tokenHash=/^[a-f0-9-]{72}$/.test(token)?await digest(token):null;
 const adminHash=/^[a-f0-9]{64}$/.test(adminKey)?await digest(adminKey):null;
 if(path.startsWith('/api/admin/')&&!adminHash)return json({error:'没有管理权限。'},403);
 const clientIp=request.headers.get('cf-connecting-ip')||request.headers.get('x-forwarded-for')?.split(',')[0].trim()||'unknown';
 const ipHash=await digest(env.serviceKey+'|'+clientIp);
 async function rpc(action:string,payload:unknown={}){const r=await fetcher(env.url+'/rest/v1/rpc/meme_feedback',{method:'POST',headers:{'Content-Type':'application/json','apikey':env.serviceKey,'Authorization':'Bearer '+env.serviceKey},body:JSON.stringify({p_action:action,p_payload:payload,p_token_hash:tokenHash,p_ip_hash:ipHash,p_admin_hash:adminHash})});const data=await r.json();if(!r.ok){const code=Object.keys(errorMap).find(key=>String(data.message).includes(key));throw {code:code||'SERVER_ERROR'};}return data;}
 async function payload(){if(!request.headers.get('content-type')?.startsWith('application/json'))throw {code:'INVALID_INPUT'};const raw=await request.text();if(raw.length>10000)throw {code:'INVALID_INPUT'};try{const data=JSON.parse(raw);if(!data||typeof data!=='object'||Array.isArray(data))throw 0;return data;}catch{throw {code:'INVALID_INPUT'};}}
 async function analyticsRpc(action:string,data:unknown={},visitorHash:string|null=null){
  const dailyIpHash=await digest(env.serviceKey+'|analytics-limit|'+new Date().toISOString().slice(0,10)+'|'+clientIp);
  const response=await fetcher(env.url+'/rest/v1/rpc/meme_analytics',{method:'POST',headers:{'Content-Type':'application/json','apikey':env.serviceKey,'Authorization':'Bearer '+env.serviceKey},body:JSON.stringify({p_action:action,p_payload:data,p_visitor_hash:visitorHash,p_ip_hash:dailyIpHash,p_admin_hash:adminHash})});
  const result=await response.json();
  if(!response.ok){const code=Object.keys(errorMap).find(key=>String(result.message).includes(key));throw {code:code||'SERVER_ERROR'};}
  return result;
 }
 try{
  if(path==='/api/analytics'&&request.method==='POST'){
   const p=await payload(),uuid=/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/;
   if(typeof p.visitorId!=='string'||!uuid.test(p.visitorId)||typeof p.viewId!=='string'||!uuid.test(p.viewId)||!['pageview','game_enter'].includes(p.event))throw {code:'INVALID_INPUT'};
   // Never persist or forward arbitrary client fields, URLs, nicknames or raw identifiers.
   return json(await analyticsRpc('record',{viewId:p.viewId,event:p.event},await digest(env.serviceKey+'|analytics-visitor|'+p.visitorId)));
  }
  if(path==='/api/admin/analytics'&&request.method==='GET'){
   const days=url.searchParams.get('days')||'7';if(!['7','30'].includes(days))throw {code:'INVALID_INPUT'};
   return json(await analyticsRpc('admin.stats',{days:Number(days)}));
  }
  if(path==='/api/session'&&request.method==='POST'){const nextToken=crypto.randomUUID()+crypto.randomUUID(),session=await rpc('session',{candidateHash:await digest(nextToken)});return json({token:session.existing?token:nextToken});}
  if(path==='/api/comments'&&request.method==='GET'){const c=Number(url.searchParams.get('cursor')),category=url.searchParams.get('category')||'all';return json(await rpc('list',{cursor:Number.isSafeInteger(c)&&c>0?c:null,category:Object.hasOwn(categories,category)?category:'all'}));}
  if(path==='/api/comments'&&request.method==='POST'){let p;try{p=validate(await payload());}catch(e){if(e instanceof Error)return json({error:e.message},400);throw e;}return json(await rpc('create',p),201);}
  if(path==='/api/admin/comments'&&request.method==='GET'){const c=Number(url.searchParams.get('cursor'));return json(await rpc('admin.list',{cursor:Number.isSafeInteger(c)&&c>0?c:null}));}
  if(path==='/api/admin/comments'&&request.method==='PATCH'){const p=await payload();if(!Number.isSafeInteger(p.id)||p.id<1||![0,1].includes(p.isPublic))return json({error:'参数无效。'},400);return json(await rpc('admin.moderate',{id:p.id,isPublic:p.isPublic}));}
  if(path==='/api/admin/export'&&request.method==='GET'){
   const first=await rpc('admin.list'),encoder=new TextEncoder();
   const cell=(value:unknown)=>{let s=String(value??'');if(/^\s*[=+@-]/.test(s))s="'"+s;return '"'+s.replaceAll('"','""')+'"';};
   const stream=new ReadableStream({async start(controller){try{controller.enqueue(encoder.encode('\uFEFF编号,昵称,分类,评分,评论,公开状态,提交时间\r\n'));let page=first;while(true){for(const c of page.comments)controller.enqueue(encoder.encode([c.id,c.nickname,categories[c.category],c.rating,c.body,c.isPublic?'公开':'已隐藏',new Date(c.createdAt).toISOString()].map(cell).join(',')+'\r\n'));if(!page.nextCursor)break;page=await rpc('admin.list',{cursor:page.nextCursor});}controller.close();}catch(e){controller.error(e);}}});
   return new Response(stream,{headers:{...headers,'Content-Type':'text/csv; charset=utf-8','Content-Disposition':'attachment; filename=player-feedback.csv'}});
  }
  return json({error:'接口不存在。'},404);
 }catch(e){const code=(e as {code?:string})?.code||'SERVER_ERROR',mapped=errorMap[code];return json({error:mapped?.[1]||(path.includes('analytics')?'访问统计暂时不可用，请稍后刷新。':'评论服务暂时不可用，内容已保留，请稍后再试。')},mapped?.[0]||503);}
};}
if(import.meta.main)Deno.serve(createHandler({url:Deno.env.get('SUPABASE_URL')!,serviceKey:Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!}));
