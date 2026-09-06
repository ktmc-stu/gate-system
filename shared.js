/* shared.js — 所有頁面共用 */
firebase.initializeApp(FIREBASE_CONFIG);
const db   = firebase.database();
const auth = firebase.auth();
auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);

const HOUSE_META = {
  K:{color:'#e5484d',text:'#ffffff'},  // K 紅
  T:{color:'#3d7bfd',text:'#ffffff'},  // T 藍
  M:{color:'#1fa45c',text:'#ffffff'},  // M 綠
  C:{color:'#f5b90f',text:'#161200'}   // C 黃
};
function houseMeta(h){ h=String(h||'').toUpperCase().trim(); return HOUSE_META[h]||{color:'#7e8aa2',text:'#fff'}; }

/* ---- 活動場景 ---- */
const SCENARIOS = {
  track:{ en:'Sports Day',    zh:'陸運會',
          in:{en:'INSIDE STAND', zh:'看台內'}, out:{en:'OUTSIDE STAND', zh:'看台外'} },
  swim: { en:'Swimming Gala', zh:'水運會',
          in:{en:'INSIDE VENUE', zh:'場館內'}, out:{en:'OUTSIDE VENUE', zh:'場館外'} }
};
function scenarioMeta(k){ return SCENARIOS[k] || SCENARIOS.track; }
function watchScenario(cb){ db.ref('config/scenario').on('value',s=>cb(s.val()==='swim'?'swim':'track')); }

const esc = s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pad2 = n=>String(n).padStart(2,'0');
function fmtClock(ts){const d=new Date(ts);return `${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`;}
function fmtHM(ts){const d=new Date(ts);return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;}
function fmtDate(ts){const d=new Date(ts);return `${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}`;}
function fmtDur(ms){ms=Math.max(0,ms);const s=Math.floor(ms/1000),h=Math.floor(s/3600),m=Math.floor(s%3600/60),ss=s%60;
  return h>0?`${h}h ${pad2(m)}m ${pad2(ss)}s`:`${m}m ${pad2(ss)}s`;}

/* ---- 聲音回饋 ---- */
let AC=null;
function tone(f,d,t,g){try{AC=AC||new (window.AudioContext||window.webkitAudioContext)();
  if(AC.state==='suspended')AC.resume();
  const o=AC.createOscillator(),v=AC.createGain();o.type=t||'square';o.frequency.value=f;v.gain.value=g||.05;
  o.connect(v);v.connect(AC.destination);o.start();o.stop(AC.currentTime+d);}catch(e){}}
function sound(kind){
  if(window.MUTED)return;
  if(kind==='out'){tone(740,.09);setTimeout(()=>tone(988,.12),100);}
  else if(kind==='in'){tone(620,.1);setTimeout(()=>tone(830,.14),110);}
  else if(kind==='warn'){tone(196,.22,'sawtooth',.07);setTimeout(()=>tone(150,.3,'sawtooth',.07),200);}
  else if(kind==='err'){tone(220,.18,'square',.06);}
}

/* ---- 密碼鎖（通用密碼 = Firebase 職員帳號）---- */
/* favicon（順手解決 404）*/
(function(){const l=document.createElement('link');l.rel='icon';
l.href='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><rect width=%22100%22 height=%22100%22 rx=%2224%22 fill=%22%23ffb224%22/><text x=%2250%22 y=%2270%22 font-size=%2256%22 text-anchor=%22middle%22 font-family=%22Arial%22 font-weight=%22900%22 fill=%22%23241500%22>G</text></svg>';
document.head.appendChild(l);})();
/* 登入鎖 */
(function(){const s=document.createElement('style');s.textContent=
`#lock{position:fixed;inset:0;z-index:300;display:flex;align-items:center;justify-content:center;
 background:radial-gradient(900px 500px at 70% -10%,rgba(75,139,255,.2),transparent 60%),radial-gradient(700px 500px at 10% 110%,rgba(255,178,36,.16),transparent 60%),rgba(5,9,18,.94);backdrop-filter:blur(10px)}
#lock form{width:min(400px,92vw);border-radius:26px;padding:38px 32px;border:1px solid rgba(148,180,255,.2);
 background:linear-gradient(180deg,rgba(23,37,66,.96),rgba(10,19,36,.98));box-shadow:0 40px 100px rgba(0,0,0,.6);
 font-family:'IBM Plex Sans','Noto Sans TC',sans-serif;color:#f2f6ff;animation:lk .35s cubic-bezier(.2,.9,.3,1.2)}
@keyframes lk{from{opacity:0;transform:translateY(16px) scale(.97)}}
#lock .mk{display:flex;align-items:center;gap:12px;font-family:Archivo,'Noto Sans TC',sans-serif;font-weight:900;font-size:28px;letter-spacing:.06em}
#lock .mk::before{content:'G';display:grid;place-items:center;width:46px;height:46px;border-radius:14px;flex:none;
 background:linear-gradient(135deg,#ffb224,#ff8a3d);color:#241500;font-size:25px;box-shadow:0 8px 24px rgba(255,150,40,.4)}
#lock .mk b{color:#ffb224}
#lock h1{font-size:16px;margin:18px 0 2px;font-weight:700}
#lock h1 span{color:#6d7ea6;font-weight:500;margin-left:8px;font-size:.85em}
#lock input{width:100%;margin:18px 0 14px;padding:15px 16px;border-radius:14px;border:1px solid rgba(148,180,255,.3);
 background:rgba(0,0,0,.35);color:#f2f6ff;font-size:16px;outline:none;transition:.2s}
#lock input:focus{border-color:#ffb224;box-shadow:0 0 0 4px rgba(255,178,36,.18)}
#lock button{width:100%;padding:15px;border:0;border-radius:14px;background:linear-gradient(180deg,#ffc95e,#ff9a2e);
 color:#2a1800;font-weight:900;font-size:15px;letter-spacing:.08em;cursor:pointer;box-shadow:0 12px 30px rgba(255,150,40,.35)}
#lock button:active{transform:scale(.98)}
#lock p.err{color:#ff8d88;font-size:13px;margin-top:12px;min-height:1.2em}`;
document.head.appendChild(s);})();

function showLock(){
  if(document.getElementById('lock'))return;
  const el=document.createElement('div');el.id='lock';
  el.innerHTML=`<form id="lockForm">
    <div class="mk">G<b>A</b>TE <span style="font-size:12px;color:#8fa1c5;letter-spacing:.2em">EVENT PASS SYSTEM 進出記錄系統</span></div>
    <h1>Staff Access<span>職員登入</span></h1>
    <input id="lockPwd" type="password" placeholder="Password 密碼" autocomplete="current-password" required>
    <button type="submit">UNLOCK 進入</button>
    <p class="err" id="lockErr"></p></form>`;
  document.body.appendChild(el);
  el.querySelector('#lockForm').addEventListener('submit',e=>{
    e.preventDefault();
    auth.signInWithEmailAndPassword(STAFF_EMAIL, el.querySelector('#lockPwd').value)
      .catch(err=>{
        const code=(err&&err.code)||'unknown';
        const msg={
          'auth/operation-not-allowed':'未啟用 Email/Password：去 Authentication → Sign-in method 啟用',
          'auth/user-not-found':'帳號不存在：去 Authentication → 使用者 → 新增使用者',
          'auth/wrong-password':'密碼錯誤',
          'auth/invalid-credential':'電郵或密碼不符（檢查 config.js 嘅 STAFF_EMAIL 是否同所建帳號完全一致）',
          'auth/invalid-email':'STAFF_EMAIL 格式有誤',
          'auth/network-request-failed':'網絡錯誤，或 config.js 網址有誤',
          'auth/invalid-api-key':'config.js 嘅 apiKey 錯誤'
        }[code];
        el.querySelector('#lockErr').textContent = msg || ('錯誤：'+code);
      });
  });
  setTimeout(()=>el.querySelector('#lockPwd').focus(),60);
}
function requireAuth(onReady){
  let booted=false;
  auth.onAuthStateChanged(u=>{
    if(u){booted=true;document.getElementById('lock')?.remove();onReady(u);}
    else{ booted ? location.reload() : showLock(); }
  });
}
function bindSignOut(){} /* 保留空函式，相容頁面呼叫 */
/* 登出：事件委託，三個頁面即時有效 */
document.addEventListener('click',e=>{
  if(e.target.closest('[data-signout]')){
    auth.signOut().then(()=>location.reload());
  }
});
function watchThreshold(cb){db.ref('config/overlongMin').on('value',s=>{const v=s.val();cb(v&&v>0?v:15);});}
