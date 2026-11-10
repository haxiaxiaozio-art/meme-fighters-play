import {createRoot} from 'react-dom/client';
import {useState,type FormEvent} from 'react';
import Arena from './Arena';
import AdminPanel from './AdminPanel';
import GameLobby from './GameLobby';
import {apiFetch} from './api';
import './style.css';
function Admin(){const [key,setKey]=useState(''),[draft,setDraft]=useState(''),[error,setError]=useState(''),[busy,setBusy]=useState(false);
 async function login(e:FormEvent){e.preventDefault();setBusy(true);setError('');try{const r=await apiFetch('/api/admin/comments',{headers:{'X-Admin-Key':draft.trim()}});if(!r.ok){const j=await r.json();throw new Error(j.error||'管理访问码无效。');}setKey(draft.trim());setDraft('');}catch(e){setError(e instanceof Error?e.message:'暂时无法登录。');}finally{setBusy(false);}}
 return key?<><button className="admin-logout" onClick={()=>setKey('')}>退出管理</button><AdminPanel adminKey={key}/></>:<main className="admin-wrap"><a className="text-link" href="./?game=meme">返回试玩页</a><section className="feedback-panel" style={{maxWidth:440,margin:'48px auto'}}><h1 style={{fontSize:28}}>MEME 管理后台</h1><p>输入原有管理访问码，查看访问统计、管理留言和导出反馈。</p><form onSubmit={login}><label htmlFor="admin-key">管理访问码</label><input id="admin-key" type="password" value={draft} onChange={e=>setDraft(e.target.value)} required autoComplete="current-password"/><button className="submit-button" disabled={busy}>{busy?'正在验证…':'进入管理'}</button>{error&&<p className="inline-error" role="alert">{error}</p>}</form></section></main>;
}
const params=new URLSearchParams(location.search);
const admin=params.has('admin');
const meme=params.get('game')==='meme'||['#arena','#comments','#controls','#feedback'].includes(location.hash);
if(admin)document.title='MEME 大乱斗 · 管理后台';
else if(meme)document.title='MEME 大乱斗 · 玩一局，聊两句';
createRoot(document.getElementById('root')!).render(admin?<Admin/>:meme?<Arena/>:<GameLobby/>);
