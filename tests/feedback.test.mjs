import test,{before,after} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {PGlite} from '@electric-sql/pglite';
import ts from 'typescript';
const hash=s=>createHash('sha256').update(s).digest('hex');
const admin='a'.repeat(64), origin='https://haxiaxiaozio-art.github.io';
let db,handler,token,id;
before(async()=>{
 db=new PGlite();
 await db.exec('create role anon;create role authenticated;create role service_role bypassrls;');
 await db.exec(await readFile(new URL('../supabase/schema.sql',import.meta.url),'utf8'));
 await db.query('insert into meme_private.settings values ($1,$2)',['admin_key_hash',hash(admin)]);
 const source=await readFile(new URL('../supabase/functions/feedback/index.ts',import.meta.url),'utf8');
 const compiled=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText;
 const {createHandler}=await import('data:text/javascript;base64,'+Buffer.from(compiled).toString('base64'));
 handler=createHandler({url:'https://database.invalid',serviceKey:'test-server-only'},async(url,options)=>{
  assert.equal(url,'https://database.invalid/rest/v1/rpc/meme_feedback');
  const p=JSON.parse(options.body);
  await db.exec('set role service_role');
  try{const r=await db.query('select public.meme_feedback($1,$2,$3,$4,$5) as data',[p.p_action,p.p_payload,p.p_token_hash,p.p_ip_hash,p.p_admin_hash]);return Response.json(r.rows[0].data);}
  catch(e){return Response.json({message:e.message},{status:400});}
  finally{await db.exec('reset role');}
 });
});
after(async()=>{await db?.close();});
function call(path,method='GET',body,headers={}){return handler(new Request('https://project.supabase.co/functions/v1/feedback'+path,{method,headers:{Origin:origin,...(body?{'Content-Type':'application/json'}:{}),...headers},body:body?JSON.stringify(body):undefined}));}
const data=()=>({nickname:'测试玩家',body:'香蕉猫的回场很有意思！',category:'experience',rating:5,website:'',requestKey:crypto.randomUUID()});
test('public list starts empty and CORS permits the game origin',async()=>{const r=await call('/api/comments');assert.equal(r.status,200);assert.equal(r.headers.get('Access-Control-Allow-Origin'),origin);const j=await r.json();assert.deepEqual(j.comments,[]);assert.equal(j.summary.total,0);});
test('unapproved browser origin and missing mutation origin are rejected',async()=>{assert.equal((await call('/api/session','POST',undefined,{Origin:'https://evil.invalid'})).status,403);assert.equal((await handler(new Request('https://project.supabase.co/functions/v1/feedback/api/session',{method:'POST'}))).status,403);const r=await call('/api/session','OPTIONS');assert.equal(r.status,204);});
test('create session and reuse its token without issuing a new identity',async()=>{const r=await call('/api/session','POST');assert.equal(r.status,200);token=(await r.json()).token;assert.equal(token.length,72);const repeat=await call('/api/session','POST',undefined,{'X-Feedback-Token':token});assert.equal((await repeat.json()).token,token);});
test('comment validation rejects bad rating, category, empty nickname and honeypot',async()=>{for(const patch of [{rating:6},{category:'unknown'},{nickname:' '},{website:'spam'},{body:'a'}]){const r=await call('/api/comments','POST',{...data(),...patch},{'X-Feedback-Token':token});assert.equal(r.status,400);}});
test('comments require an issued unexpired session',async()=>{assert.equal((await call('/api/comments','POST',data())).status,403);});
test('comment is saved exactly once when a submission is retried',async()=>{const p=data();const a=await call('/api/comments','POST',p,{'X-Feedback-Token':token});assert.equal(a.status,201);id=(await a.json()).comment.id;const b=await call('/api/comments','POST',p,{'X-Feedback-Token':token});assert.equal(b.status,201);assert.equal((await b.json()).comment.id,id);const j=await(await call('/api/comments')).json();assert.equal(j.summary.total,1);assert.equal(j.summary.averageRating,5);assert.equal(j.comments[0].nickname,p.nickname);});
test('rapid repeat comments are rate limited',async()=>{assert.equal((await call('/api/comments','POST',data(),{'X-Feedback-Token':token})).status,429);});
test('admin routes reject absent and incorrect access codes',async()=>{assert.equal((await call('/api/admin/comments')).status,403);assert.equal((await call('/api/admin/comments','GET',undefined,{'X-Admin-Key':'b'.repeat(64)})).status,403);assert.equal((await call('/api/admin/export','GET',undefined,{'X-Admin-Key':'b'.repeat(64)})).status,403);});
test('admin can hide and restore, public lists and rating summaries follow visibility',async()=>{const hdr={'X-Admin-Key':admin};let r=await call('/api/admin/comments','PATCH',{id,isPublic:0},hdr);assert.equal(r.status,200);let j=await(await call('/api/comments')).json();assert.equal(j.summary.total,0);assert.equal(j.summary.averageRating,null);assert.deepEqual(j.comments,[]);j=await(await call('/api/admin/comments','GET',undefined,hdr)).json();assert.equal(j.comments[0].isPublic,0);r=await call('/api/admin/comments','PATCH',{id,isPublic:1},hdr);assert.equal(r.status,200);assert.equal((await(await call('/api/comments')).json()).summary.total,1);});
test('filters and cursor pagination do not skip or duplicate rows',async()=>{for(let n=0;n<22;n++)await db.query('insert into meme_private.comments(request_key,nickname,body,category,rating,visitor_id,ip_hash,created_at) values ($1,$2,$3,$4,$5,$6,$7,$8)',[crypto.randomUUID(),'玩家'+n,'分页测试'+n,n%2?'bug':'balance',null,crypto.randomUUID(),'test-ip',Date.now()-60000]);const first=await(await call('/api/comments')).json();assert.equal(first.comments.length,20);assert.ok(first.nextCursor);const second=await(await call('/api/comments?cursor='+first.nextCursor)).json();assert.equal(second.comments.length,3);assert.equal(new Set([...first.comments,...second.comments].map(c=>c.id)).size,23);const bugs=await(await call('/api/comments?category=bug')).json();assert.equal(bugs.comments.length,11);assert.ok(bugs.comments.every(c=>c.category==='bug'));});
test('CSV export preserves Chinese and neutralizes spreadsheet formulas',async()=>{await db.query('update meme_private.comments set nickname=$1,body=$2 where id=$3',['=1+1','+危险公式',id]);const r=await call('/api/admin/export','GET',undefined,{'X-Admin-Key':admin});assert.equal(r.status,200);assert.match(r.headers.get('Content-Type'),/text\/csv/);const csv=await r.text();assert.ok(csv.includes('"\'=1+1"'));assert.ok(csv.includes('"\'+危险公式"'));assert.ok(csv.includes('玩后感'));assert.equal(csv.trim().split('\r\n').length,24);});
test('anonymous database roles cannot bypass API or read private tables',async()=>{for(const role of ['anon','authenticated']){await db.exec('set role '+role);try{await assert.rejects(db.query('select * from meme_private.comments'),/permission denied/);await assert.rejects(db.query("select public.meme_feedback('list')"),/permission denied/);}finally{await db.exec('reset role');}}const result=await db.query("select relrowsecurity from pg_class where oid='meme_private.comments'::regclass");assert.equal(result.rows[0].relrowsecurity,true);});
