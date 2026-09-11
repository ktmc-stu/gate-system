/* shared.js — 共享初始化／工具／鎖／螢幕鍵盤 */
firebase.initializeApp(FIREBASE_CONFIG);
let db   = firebase.database();
let auth = firebase.auth();
try{ auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL); }catch(e){}

/* ---- 工具 ---- */
function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function fmtClock(t){return new Date(t).toTimeString().slice(0,8);}
function fmtHM(t){const d=new Date(t);return String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0');}
function fmtDate(t){const d=new Date(t);return d.getFullYear()+'/'+String(d.getMonth()+1).padStart(2,'0')+'/'+String(d.getDate()).padStart(2,'0');}
function fmtDur(ms){const s=Math.floor(ms/1000);const h=Math.floor(s/3600),m=Math.floor(s%3600/60),ss=s%60;return (h?h+'h ':'')+m+'m '+ss+'s';}
const HOUSE_COLORS={K:'#ff5d55',T:'#4b8bff',M:'#2fd37f',C:'#ffb224'};
function houseMeta(h){return {color:HOUSE_COLORS[String(h||'').toUpperCase()]||'#7e8aa2'};}
const PURPOSES={
  toilet:{en:'Toilet',zh:'廁所',icon:'🚻'},
  food:  {en:'Food',  zh:'小食部',icon:'🍱'},
  competition:{en:'Competition',zh:'參賽',icon:'🏅'},
  helper:{en:'Student Helper',zh:'工作人員',icon:'🦺'},
  other: {en:'Other', zh:'其他',icon:'📌'}
};
function purposeMeta(p){return PURPOSES[p]||{en:'—',zh:'—',icon:'·'};}
const SCENARIOS={
  track:{zh:'陸運會',en:'Sports Day',in:{zh:'看台內',en:'INSIDE STAND'},out:{zh:'看台外',en:'OUTSIDE STAND'}},
  swim:{zh:'水運會',en:'Swimming Gala',in:{zh:'場館內',en:'INSIDE VENUE'},out:{zh:'場館外',en:'OUTSIDE VENUE'}}
};
function scenarioMeta(s){return SCENARIOS[s]||SCENARIOS.track;}
function watchThreshold(cb){db.ref('config/overlongMin').on('value',s=>cb(parseInt(s.val(),10)||15));}
function watchScenario(cb){db.ref('config/scenario').on('value',s=>cb(s.val()||'track'));}

/* ---- 登出：事件委託 ---- */
function bindSignOut(){}
document.addEventListener('click',e=>{
  if(e.target.closest('[data-signout]')){ auth.signOut().then(()=>location.reload()); }
});

/* ==== 共享螢幕鍵盤（廢除系統鍵盤）==== */
(function(){
  const st=document.createElement('style');
  st.textContent=`
  #kbOv{position:fixed;inset:0;z-index:95;display:none;align-items:center;justify-content:center;background:rgba(4,8,16,.75);backdrop-filter:blur(6px);padding:20px}
  #kbOv.open{display:flex}
  #kbOv .kbx{width:min(430px,94vw);max-height:88vh;overflow:auto;border-radius:24px;padding:20px;border:1px solid rgba(148,180,255,.3);
   background:linear-gradient(180deg,rgba(23,37,66,.97),rgba(10,19,36,.97));box-shadow:0 24px 70px rgba(2,8,20,.6)}
  #kbOv .kbx-head{display:flex;justify-content:space-between;align-items:center;font-weight:800;font-size:17px;font-family:Archivo,'Noto Sans TC',sans-serif;color:#f2f6ff}
  #kbOv .kbx-head span{font-size:.65em;color:#6d7ea6;font-weight:500;margin-left:6px}
  #kbOv .kbx-x{background:none;border:0;color:#6d7ea6;font-size:18px;cursor:pointer}
  #kbOv .kbx-disp{margin:14px 0 8px;min-height:52px;display:flex;align-items:center;padding:0 14px;border-radius:12px;background:rgba(0,0,0,.35);
   border:1px solid rgba(148,180,255,.3);font-family:'IBM Plex Mono',monospace;font-size:22px;letter-spacing:.1em;color:#f2f6ff;overflow:hidden;white-space:nowrap}
  #kbOv .kbx-keys{display:grid;grid-template-columns:repeat(7,1fr);gap:8px}
  #kbOv .kbx-keys button{padding:12px 0;font-size:16px;font-weight:700;border-radius:12px;cursor:pointer;border:1px solid rgba(148,180,255,.14);background:rgba(255,255,255,.05);color:#f2f6ff}
  #kbOv .kbx-keys button:active{background:#ffb224;color:#241500}
  #kbOv .kbx-keys .a{border-color:rgba(255,178,36,.45);color:#ffb224;background:rgba(255,178,36,.06)}
  #kbOv .kbx-keys .f{border-color:rgba(75,139,255,.5);color:#4b8bff;background:rgba(75,139,255,.08)}
  #kbOv .kbx-keys .w2{grid-column:span 2}#kbOv .kbx-keys .w3{grid-column:span 3}
  #kbOv .kbx-go{width:100%;margin-top:12px;padding:15px;border:0;border-radius:12px;background:linear-gradient(180deg,#5ce8a4,#1fb86b);color:#03230f;font-weight:900;font-size:15px;cursor:pointer}
  #kbOv .kbx-err{min-height:1.1em;color:#ff5d55;font-size:12.5px;text-align:center;margin-top:6px}`;
  document.head.appendChild(st);
  const ov=document.createElement('div');
  ov.id='kbOv';
  ov.innerHTML=`<div class="kbx">
    <div class="kbx-head"><div id="kbTitle">Input<span>輸入</span></div><button class="kbx-x" id="kbClose">✕</button></div>
    <div class="kbx-disp" id="kbVal">&nbsp;</div>
    <div class="kbx-keys" id="kbKeys"></div>
    <p class="kbx-err" id="kbErr"></p>
    <button class="kbx-go" id="kbGo">CONFIRM 確定</button></div>`;
  document.body.appendChild(ov);
  let buf='',mask=false,mode='L',upper=true,done=null,max=64;
  const L=[['A','B','C','D','E','F','G'],['H','I','J','K','L','M','N'],['O','P','Q','R','S','T','U'],['V','W','X','Y','Z','SHIFT','BK'],['123:2','CLR:2','SP:3']];
  const D=[['1','2','3','4','5','6','7'],['8','9','0','-','_','.',','],['@','#','!','?','SP','\'','"'],['ABC:2','BK:2','CLR:3']];
  function disp(){document.getElementById('kbVal').textContent=buf?(mask?'•'.repeat(buf.length):buf):'\u00a0';}
  function render(){
    const wrap=document.getElementById('kbKeys');wrap.innerHTML='';
    (mode==='L'?L:D).forEach(row=>row.forEach(tok=>{
      let span=1,key=String(tok);
      const m=key.match(/^(.*):([23])$/);if(m){key=m[1];span=+m[2];}
      let label=key;
      if(key==='SHIFT')label=upper?'⇧':'';
      else if(key==='BK')label='⌫';
      else if(key==='SP')label='␣';
      else if(mode==='L'&&/^[A-Z]$/.test(key)){label=upper?key:key.toLowerCase();key=label;}
      const b=document.createElement('button');
      b.textContent=label;
      b.dataset.k=key==='SP'?'sp':key==='BK'?'bk':key==='CLR'?'clr':key==='SHIFT'?'shift':(key==='123'||key==='ABC')?'mode':key;
      if(span===2)b.classList.add('w2');if(span===3)b.classList.add('w3');
      if(mode==='L'&&/^[A-Za-z]$/.test(key))b.classList.add('a');
      if(key==='SHIFT'||key==='123'||key==='ABC')b.classList.add('f');
      wrap.appendChild(b);
    }));
  }
  document.getElementById('kbKeys').addEventListener('click',e=>{
    const b=e.target.closest('button');if(!b)return;const k=b.dataset.k;
    if(k==='shift'){upper=!upper;render();return;}
    if(k==='mode'){mode=mode==='L'?'D':'L';render();return;}
    if(k==='clr')buf='';
    else if(k==='bk')buf=buf.slice(0,-1);
    else if(k==='sp'){if(buf.length<max)buf+=' ';}
    else if(buf.length<max)buf+=k;
    disp();
  });
  document.getElementById('kbClose').onclick=()=>{ov.classList.remove('open');done=null;};
  document.getElementById('kbGo').onclick=()=>{
    if(done){const cb=done;done=null;ov.classList.remove('open');cb(buf);}
    else ov.classList.remove('open');
  };
  document.addEventListener('keydown',e=>{
    if(!ov.classList.contains('open'))return;
    if(e.key==='Enter'){e.preventDefault();document.getElementById('kbGo').click();return;}
    if(e.key==='Escape'){ov.classList.remove('open');done=null;return;}
    if(e.key==='Backspace'){buf=buf.slice(0,-1);disp();e.preventDefault();return;}
    if(e.key.length===1&&buf.length<max){buf+=e.key;disp();e.preventDefault();}
  });
  window.KeyPad={
    open(o){
      buf=o.initial||'';mask=!!o.mask;done=o.onDone||null;max=o.max||64;
      const t=document.getElementById('kbTitle');if(t&&o.title)t.innerHTML=o.title;
      mode='L';upper=true;render();disp();
      document.getElementById('kbErr').textContent='';
      ov.classList.add('open');
    },
    err(m){const e=document.getElementById('kbErr');if(e)e.textContent=m||'';},
    close(){ov.classList.remove('open');done=null;}
  };
  window.bindKeypadInput=function(el,o){
    o=o||{};
    el.setAttribute('readonly','readonly');
    el.style.cursor='pointer';
    el.addEventListener('click',()=>{
      KeyPad.open({title:o.title||'Input<span>輸入</span>',initial:el.value,max:o.max,mask:!!o.mask,onDone:v=>{
        const val=o.format?o.format(v):v;
        el.value=val;
        el.dispatchEvent(new Event('input',{bubbles:true}));
        el.dispatchEvent(new Event('change',{bubbles:true}));
      }});
    });
  };
})();

/* ---- 密碼鎖（螢幕鍵盤）---- */
function showLock(){
  const st=document.createElement('style');
  st.textContent=`
  #lock{position:fixed;inset:0;z-index:90;display:flex;align-items:center;justify-content:center;background:rgba(5,9,18,.9);backdrop-filter:blur(10px)}
  #lock .card{width:min(420px,92vw);border:1px solid rgba(148,180,255,.25);border-radius:22px;padding:32px;background:linear-gradient(180deg,rgba(20,32,58,.95),rgba(10,18,34,.95));box-shadow:0 30px 80px rgba(0,0,0,.6)}
  #lock h2{font-family:Archivo,'Noto Sans TC';font-size:24px;font-weight:800;margin-bottom:4px}
  #lock h2 span{font-size:.6em;color:#6d7ea6;font-weight:500;margin-left:8px}
  #lock .lk-hint{font-size:12.5px;color:#a5b4d4;margin:10px 0 16px;line-height:1.6}
  #lock .lk-err{min-height:1.2em;color:#ff5d55;font-size:13px;margin-bottom:10px}
  #lock .lk-btn{width:100%;padding:15px;border:0;border-radius:14px;background:linear-gradient(180deg,#ffc95e,#ff9a2e);color:#2a1800;font-weight:900;font-size:16px;letter-spacing:.06em;cursor:pointer}`;
  document.head.appendChild(st);
  const el=document.createElement('div');
  el.id='lock';
  el.innerHTML=`<div class="card">
    <h2>Staff Access <span>職員登入</span></h2>
    <p class="lk-hint">Enter the shared staff password using the on-screen keypad.<br>請使用螢幕鍵盤輸入共用職員密碼（實體鍵盤亦可）。</p>
    <p class="lk-err" id="lockErr"></p>
    <button class="lk-btn" id="lockGo">UNLOCK 進入</button>
  </div>`;
  document.body.appendChild(el);
  el.querySelector('#lockGo').onclick=()=>{
    KeyPad.open({title:'Staff Password<span>職員密碼</span>',mask:true,onDone:pwd=>{
      auth.signInWithEmailAndPassword(STAFF_EMAIL,pwd)
        .then(()=>{ location.reload(); })
        .catch(err=>{
          const code=(err&&err.code)||'';
          el.querySelector('#lockErr').textContent =
            code==='auth/wrong-password'||code==='auth/invalid-credential' ? 'Password incorrect 密碼錯誤' :
            code==='auth/too-many-requests' ? 'Too many attempts 嘗試次數過多，請稍後再試' : 'Login failed 登入失敗 ['+code+']';
        });
    }});
  };
}
function requireAuth(onReady){
  let booted=false;
  auth.onAuthStateChanged(u=>{
    if(u){
      if(typeof KIOSK_EMAIL!=='undefined' && u.email && u.email.toLowerCase()===String(KIOSK_EMAIL).toLowerCase()){ auth.signOut(); return; }
      booted=true;const l=document.getElementById('lock');if(l)l.remove();onReady(u);
    }
    else{ booted ? location.reload() : showLock(); }
  });
}
