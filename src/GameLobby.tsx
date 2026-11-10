import {ArrowUpRight} from 'lucide-react';
import './lobby.css';

export default function GameLobby(){
 return <main className="lobby">
  <header className="lobby-heading">
   <p className="lobby-kicker">FUUHAKU.CC <span>／</span> GAMES</p>
   <h1>今天玩哪一款？</h1>
  </header>
  <nav className="lobby-games" aria-label="选择游戏">
   <a className="lobby-game lobby-meme" href="./?game=meme">
    <div className="lobby-art">
     <img className="lobby-cover" src="./arena-cover.png" alt="" />
    </div>
    <div className="lobby-card">
     <div><p className="lobby-tag">同屏格斗</p><h2>梗斗</h2><p className="lobby-description">选个梗王上场，和朋友同屏对战。</p></div>
     <span className="lobby-action">玩梗斗 <ArrowUpRight aria-hidden="true" size={18}/></span>
    </div>
   </a>
   <a className="lobby-game lobby-forest" href="./forest/campaign.html">
    <div className="lobby-art">
     <img className="lobby-cover" src="./forest/assets/pixel-world/forest.png" alt="" />
     <img className="lobby-character" src="./forest/assets/alice-pixel/model.png" alt="" />
    </div>
    <div className="lobby-card">
     <div><p className="lobby-tag">横版探索</p><h2>森境</h2><p className="lobby-description">跟随白狼穿过森林，赴爱丽丝的茶会。</p></div>
     <span className="lobby-action">玩森境 <ArrowUpRight aria-hidden="true" size={18}/></span>
    </div>
   </a>
  </nav>
 </main>;
}
