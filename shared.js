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
(function(){const s=document.createElement('style');s.textContent=
`#lock{position:fixed;inset:0;z-index:300;display:flex;align-items:center;justify-content:center;background:rgba(7,12,24,.95);backdrop-filter:blur(8px)}
#lock form{width:min(380px,92vw);background:#121e35;border:1px solid #25385c;border-radius:14px;padding:34px 30px;box-shadow:0 30px 80px rgba(0,0,0,.5);font-family:'IBM Plex Sans','Noto Sans TC',sans-serif;color:#eef3fb;animation:lk .3s ease}
@keyframes lk{from{opacity:0;transform:translateY(12px)}}
#lock .mk{font-family:Archivo,'Noto Sans TC',sans-serif;font-weight:900;font-size:30px;letter-spacing:.06em}
#lock .mk b{color:#ffb224}
#lock h1{font-size:15px;margin:14px 0 4px;font-weight:700}
#lock h1 span{color:#8fa1c5;font-weight:500;margin-left:6px}
#lock input{width:100%;margin:16px 0 12px;padding:13px 14px;border-radius:9px;border:1px solid #31477a;background:#0c1526;color:#eef3fb;font-size:16px;outline:none}
#lock input:focus{border-color:#ffb224}
#lock button{width:100%;padding:13px;border:0;border-radius:9px;background:#ffb224;color:#241a00;font-weight:800;font-size:15px;cursor:pointer;letter-spacing:.05em}
#lock button:active{transform:scale(.98)}
#lock p.err{color:#ff8d88;font-size:13px;margin-top:10px;min-height:1em}`;
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
      .catch(()=>{el.querySelector('#lockErr').textContent='Incorrect password or network error 密碼錯誤或網絡問題';});
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
function bindSignOut(){document.querySelectorAll('[data-signout]').forEach(b=>b.addEventListener('click',()=>auth.signOut()));}
function watchThreshold(cb){db.ref('config/overlongMin').on('value',s=>{const v=s.val();cb(v&&v>0?v:15);});}
