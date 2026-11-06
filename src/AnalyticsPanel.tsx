import {useEffect,useRef,useState} from 'react';
import {RefreshCw} from 'lucide-react';
import {apiFetch} from './api';

type Counts = {visitors:number;pageviews:number;players:number};
type Day = Counts & {date:string};
type Stats = {startedAt:string;asOf:string;today:Day;total:Counts;daily:Day[];days:number};
const metrics = [
 {key:'visitors',label:'访客数',color:'#356b55'},
 {key:'pageviews',label:'浏览次数',color:'#b9472d'},
 {key:'players',label:'进入游戏人数',color:'#65558f'},
] as const;
const format = (n:number) => n.toLocaleString('zh-CN');
const date = (value:string) => new Intl.DateTimeFormat('zh-CN',{timeZone:'Asia/Singapore',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(value));

function Trend({daily}:{daily:Day[]}) {
 const chart=useRef<SVGSVGElement>(null),[width,setWidth]=useState(900);
 useEffect(()=>{
  if(!chart.current)return;
  const observer=new ResizeObserver(([entry])=>setWidth(Math.max(280,entry.contentRect.width)));
  observer.observe(chart.current);return ()=>observer.disconnect();
 },[]);
 const height=210,left=width<500?30:44,right=20,top=18,bottom=32;
 const ceiling=Math.max(4,...daily.flatMap(d=>metrics.map(m=>d[m.key])));
 const max=Math.ceil(ceiling/4)*4;
 const x=(i:number)=>daily.length===1?(width+left-right)/2:left+i*(width-left-right)/(daily.length-1);
 const y=(n:number)=>height-bottom-n*(height-top-bottom)/max;
 return <svg ref={chart} className="analytics-chart" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="每日访客、浏览和进入游戏趋势，精确数字见下方每日明细">
  {[0,1,2,3,4].map(i=><g key={i}><line x1={left} x2={width-right} y1={y(i*max/4)} y2={y(i*max/4)} stroke="#e2dace"/><text x={left-10} y={y(i*max/4)+4} textAnchor="end">{format(i*max/4)}</text></g>)}
  {metrics.map(m=><g key={m.key}><polyline fill="none" stroke={m.color} strokeWidth="2.5" strokeLinejoin="round" points={daily.map((d,i)=>`${x(i)},${y(d[m.key])}`).join(' ')}/>{daily.map((d,i)=><circle key={d.date} cx={x(i)} cy={y(d[m.key])} r={daily.length>7?2.5:4} fill={m.color}><title>{d.date} · {m.label} {format(d[m.key])}</title></circle>)}</g>)}
  {daily.map((d,i)=>(i===0||i===daily.length-1||i%Math.max(1,Math.ceil(daily.length/(width<500?3:6)))===0)&&<text key={d.date} x={x(i)} y={height-8} textAnchor="middle">{d.date.slice(5).replace('-','/')}</text>)}
 </svg>;
}

export default function AnalyticsPanel({adminKey}:{adminKey:string}) {
 const [days,setDays]=useState(7),[refresh,setRefresh]=useState(0),[stats,setStats]=useState<Stats|null>(null);
 const [busy,setBusy]=useState(true),[error,setError]=useState('');
 useEffect(()=>{
  const controller=new AbortController();setBusy(true);setError('');
  apiFetch('/api/admin/analytics?days='+days,{headers:{'X-Admin-Key':adminKey},signal:controller.signal})
   .then(async response=>{const result=await response.json();if(!response.ok)throw new Error(result.error||'统计加载失败。');return result as Stats;})
   .then(result=>{if(!controller.signal.aborted)setStats(result);})
   .catch(error=>{if(!controller.signal.aborted)setError(error instanceof Error?error.message:'统计加载失败。');})
   .finally(()=>{if(!controller.signal.aborted)setBusy(false);});
  return ()=>controller.abort();
 },[adminKey,days,refresh]);
 return <section className="analytics" aria-labelledby="analytics-title" aria-busy={busy}>
  <div className="analytics-heading"><div><p className="eyebrow">MEME ARENA · SITE ACTIVITY</p><h1 id="analytics-title">访问统计</h1><p>访客与游戏入口点击概况。</p></div><button className="analytics-refresh" onClick={()=>setRefresh(n=>n+1)} disabled={busy}><RefreshCw size={16}/>{busy?'加载中…':'刷新统计'}</button></div>
  {error&&<p className="inline-error" role="alert">{error} {stats?'下方保留上次加载的数据。':''}</p>}
  {!stats&&!busy&&<div className="analytics-empty">暂未取得统计数据，点击“刷新统计”重试。</div>}
  {stats?<>
   <div className="analytics-date">今天 · {stats.today.date} <span>UTC+8</span></div>
   <div className="analytics-metrics">{metrics.map(m=><div key={m.key} className="analytics-metric"><span>{m.label}{m.key==='visitors'&&<small>按浏览器去重</small>}</span><strong>{format(stats.today[m.key])}</strong><p>累计 <b>{format(stats.total[m.key])}</b></p></div>)}</div>
   <div className="analytics-trend"><div className="analytics-trend-heading"><h2>每日趋势</h2><div className="analytics-range" role="group" aria-label="趋势时间范围">{[7,30].map(n=><button key={n} aria-pressed={days===n} onClick={()=>setDays(n)}>近 {n} 天</button>)}</div></div>
    <div className="analytics-legend">{metrics.map(m=><span key={m.key}><i style={{background:m.color}}/>{m.label}</span>)}</div>
    <Trend daily={stats.daily}/>
    {stats.total.pageviews===0&&<p className="analytics-empty">统计已开启，还没有收到访问记录。</p>}
    <details className="analytics-details"><summary>查看每日明细（{stats.daily.length} 天）</summary><table><thead><tr><th>日期</th>{metrics.map(m=><th key={m.key}>{m.label}</th>)}</tr></thead><tbody>{[...stats.daily].reverse().map(d=><tr key={d.date}><th scope="row">{d.date.slice(5).replace('-','/')}</th>{metrics.map(m=><td key={m.key}>{format(d[m.key])}</td>)}</tr>)}</tbody></table></details>
   </div>
   <p className="analytics-footnote">自 {date(stats.startedAt)} 开始记录 · 更新于 {new Intl.DateTimeFormat('zh-CN',{timeZone:'Asia/Singapore',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false}).format(new Date(stats.asOf))}</p>
   <details className="analytics-method"><summary>这些数字怎么算？</summary><p>访客数按浏览器标识去重，同一浏览器多次访问只算一个访客；换设备、无痕模式或清除数据可能重复计数。累计访客数独立去重，不是每日访客数相加。</p><p>每次打开或刷新试玩页计一次浏览。点击“进入擂台”或“独立窗口”记为进入游戏，人数按浏览器去重，不代表完成了一局。跨日留在页面后点击游戏，计入点击当天的访客和进入人数。</p><p>后台页面、本地开发和开启 Do Not Track 的浏览器不记录；直接打开游戏文件、请求被拦截或网络失败可能漏计。无历史回补，也不表示实时在线人数。</p></details>
  </>:busy&&<p className="analytics-empty" role="status">正在读取访问记录…</p>}
 </section>;
}
