import test,{before,beforeEach,after} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash,randomUUID} from 'node:crypto';
import {PGlite} from '@electric-sql/pglite';
import ts from 'typescript';

const hash=s=>createHash('sha256').update(s).digest('hex');
const admin='a'.repeat(64),origin='https://fuuhaku.cc',serviceKey='analytics-tests-only';
let db,handler,createTracker;
async function moduleFrom(path){const source=await readFile(new URL(path,import.meta.url),'utf8');const compiled=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText;return import('data:text/javascript;base64,'+Buffer.from(compiled).toString('base64'));}
before(async()=>{
 db=new PGlite();await db.exec('create role anon;create role authenticated;create role service_role bypassrls;');
 await db.exec(await readFile(new URL('../supabase/schema.sql',import.meta.url),'utf8'));
 await db.query('insert into meme_private.settings values ($1,$2)',['admin_key_hash',hash(admin)]);
 const migration=await readFile(new URL('../supabase/analytics.sql',import.meta.url),'utf8');
 await db.exec(migration);await db.exec(migration); // Safe to apply twice; no history reset.
 const {createHandler}=await moduleFrom('../supabase/functions/feedback/index.ts');
 ({createTracker}=await moduleFrom('../src/analytics.ts'));
 handler=createHandler({url:'https://database.invalid',serviceKey},async(url,options)=>{
  assert.equal(url,'https://database.invalid/rest/v1/rpc/meme_analytics');
  const p=JSON.parse(options.body);
  assert.equal(p.p_payload.visitorId,undefined);
  assert.equal(p.p_payload.nickname,undefined);
  await db.exec('set role service_role');
  try{const r=await db.query('select public.meme_analytics($1,$2,$3,$4,$5) as data',[p.p_action,p.p_payload,p.p_visitor_hash,p.p_ip_hash,p.p_admin_hash]);return Response.json(r.rows[0].data);}
  catch(e){return Response.json({message:e.message},{status:400});}
  finally{await db.exec('reset role');}
 });
});
beforeEach(async()=>{await db.exec('truncate meme_private.analytics_views,meme_private.analytics_limits,meme_private.analytics_plays');await db.query("update meme_private.settings set value=clock_timestamp()::text where name='analytics_started_at'");});
after(async()=>{await db?.close();});
function call(path,method='GET',body,headers={}){return handler(new Request('https://project.supabase.co/functions/v1/feedback'+path,{method,headers:{Origin:origin,...(body?{'Content-Type':'application/json'}:{}),...headers},body:body?JSON.stringify(body):undefined}));}
const record=(body,headers)=>call('/api/analytics','POST',body,headers);
const event=(visitorId=randomUUID(),viewId=randomUUID(),kind='pageview')=>({visitorId,viewId,event:kind});
const stats=async(days=7)=>(await call('/api/admin/analytics?days='+days,'GET',undefined,{'X-Admin-Key':admin})).json();

test('analytics starts empty, dates before installation are not invented',async()=>{const s=await stats();assert.deepEqual(s.total,{visitors:0,pageviews:0,players:0});assert.equal(s.daily.length,1);assert.equal(s.today.date,s.daily[0].date);assert.equal(s.timezone,'Asia/Singapore');assert.equal((await stats(30)).days,30);});
test('page retries, refreshes and game clicks have separate, deduplicated counts',async()=>{
 const first=event();assert.equal((await record(first)).status,200);assert.equal((await record(first)).status,200);
 await record({...first,event:'game_enter'});await record({...first,event:'game_enter'});
 await record(event(first.visitorId));await record(event());
 const s=await stats();assert.deepEqual(s.total,{visitors:2,pageviews:3,players:1});assert.equal(s.today.visitors,2);assert.equal(s.today.pageviews,3);assert.equal(s.today.players,1);
 const saved=await db.query('select * from meme_private.analytics_views where view_id=$1',[first.viewId]);assert.notEqual(saved.rows[0].visitor_hash,first.visitorId);assert.equal(saved.rows[0].visitor_hash.length,64);
});
test('game event arriving first records one visit; another browser cannot alter it',async()=>{const first=event();await record({...first,event:'game_enter'});await record(first);assert.deepEqual((await stats()).total,{visitors:1,pageviews:1,players:1});assert.equal((await record({...first,visitorId:randomUUID()})).status,409);assert.equal((await stats()).total.pageviews,1);});
test('UTC+8 day boundaries and cumulative visitors are computed independently',async()=>{
 await db.exec("update meme_private.settings set value=(now()-interval '3 days')::text where name='analytics_started_at'");
 await db.exec(`insert into meme_private.analytics_views(view_id,visitor_hash,created_at,game_at) values
  (gen_random_uuid(),repeat('a',64),(((now() at time zone 'Asia/Singapore')::date)::timestamp at time zone 'Asia/Singapore')-interval '1 second',now()),
  (gen_random_uuid(),repeat('a',64),now(),now()),
  (gen_random_uuid(),repeat('b',64),(((now() at time zone 'Asia/Singapore')::date)::timestamp at time zone 'Asia/Singapore')-interval '1 second',null)`);
 await db.exec("insert into meme_private.analytics_plays values(repeat('a',64),(now() at time zone 'Asia/Singapore')::date)");
 const s=await stats();assert.equal(s.daily.length,4);assert.equal(s.daily[0].pageviews,0);assert.equal(s.daily[2].pageviews,2);assert.equal(s.daily[2].visitors,2);assert.equal(s.daily[2].players,0);assert.equal(s.today.pageviews,1);assert.equal(s.today.visitors,1);assert.equal(s.today.players,1);assert.equal(s.total.visitors,2);assert.equal(s.total.pageviews,3);
});
test('admin statistics require the same valid access code as moderation',async()=>{assert.equal((await call('/api/admin/analytics')).status,403);assert.equal((await call('/api/admin/analytics','GET',undefined,{'X-Admin-Key':'b'.repeat(64)})).status,403);assert.equal((await call('/api/admin/analytics?days=365','GET',undefined,{'X-Admin-Key':admin})).status,400);});
test('anonymous analytics validates events and origin and ignores arbitrary metadata',async()=>{for(const patch of [{visitorId:'bad'},{viewId:'bad'},{event:'admin.stats'},{event:null}])assert.equal((await record({...event(),...patch})).status,400);assert.equal((await record(event(),{Origin:'https://evil.invalid'})).status,403);assert.equal((await record(event(),{Origin:''})).status,403);assert.equal((await record({...event(),nickname:'must not reach database',page:'https://private.invalid/?key=secret'})).status,200);});
test('anonymous write rate limit is enforced without storing a raw IP',async()=>{const dailyHash=hash(serviceKey+'|analytics-limit|'+new Date().toISOString().slice(0,10)+'|unknown');await db.query("insert into meme_private.analytics_limits values($1,date_trunc('hour',now()),600)",[dailyHash]);assert.equal((await record(event())).status,429);assert.equal((await stats()).total.pageviews,0);});
test('public database roles cannot read or write analytics or execute its RPC',async()=>{for(const role of ['anon','authenticated']){await db.exec('set role '+role);try{await assert.rejects(db.query('select * from meme_private.analytics_views'),/permission denied/);await assert.rejects(db.query('select * from meme_private.analytics_limits'),/permission denied/);await assert.rejects(db.query("select public.meme_analytics('admin.stats')"),/permission denied/);}finally{await db.exec('reset role');}}const result=await db.query("select relrowsecurity from pg_class where oid='meme_private.analytics_views'::regclass");assert.equal(result.rows[0].relrowsecurity,true);});
test('browser tracker reuses identity across loads, but each document has a new view',async()=>{const values=new Map(),storage={getItem:key=>values.get(key),setItem:(key,value)=>values.set(key,value)},sent=[];const options={enabled:true,storage,randomUUID,send:async p=>sent.push(p)};const track=createTracker(options);track('pageview');track('pageview');track('game_enter');track('game_enter');const next=createTracker(options);next('pageview');assert.equal(sent.length,3);assert.equal(sent[0].viewId,sent[1].viewId);assert.equal(sent[0].visitorId,sent[2].visitorId);assert.notEqual(sent[0].viewId,sent[2].viewId);});
test('disabled tracking has no storage/network side effects; blocked storage and network cannot break game clicks',async()=>{let attempted=0;const storage={getItem(){throw Error('blocked');},setItem(){throw Error('blocked');}};const disabled=createTracker({enabled:false,storage,randomUUID:()=>{throw Error('must not run');},send:async()=>{attempted++;}});disabled('pageview');assert.equal(attempted,0);const active=createTracker({enabled:true,storage,randomUUID,send:async()=>{attempted++;throw Error('offline');}});assert.doesNotThrow(()=>active('game_enter'));await new Promise(resolve=>setImmediate(resolve));assert.equal(attempted,1);});

test('same open page can enter games on successive days without another pageview',async()=>{const first=event();await record({...first,event:'game_enter'});await db.exec("update meme_private.analytics_plays set day=day-1;update meme_private.analytics_views set created_at=created_at-interval '1 day',game_at=game_at-interval '1 day'");await record({...first,event:'game_enter'});const s=await stats();assert.equal(s.total.pageviews,1);assert.equal(s.total.players,1);assert.equal(s.today.pageviews,0);assert.equal(s.today.players,1);assert.equal(s.today.visitors,1);const r=await db.query('select count(*)::int as count from meme_private.analytics_plays');assert.equal(r.rows[0].count,2);});
test('tracker allows game entry again after UTC+8 midnight with the same document identity',async()=>{let stamp=Date.parse('2026-11-06T15:59:59Z');const sent=[],storage={getItem:()=>null,setItem:()=>{}};const track=createTracker({enabled:true,storage,randomUUID,now:()=>stamp,send:async p=>sent.push(p)});track('pageview');track('game_enter');stamp+=2000;track('pageview');track('game_enter');track('game_enter');assert.equal(sent.length,3);assert.equal(sent[1].viewId,sent[2].viewId);});
