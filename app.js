/* JS Planner — maandplanning met optionele GitHub-synchronisatie */
const activities=[
['Politie','police',['Dagdienst','Ochtenddienst','Middagdienst','Nachtdienst','ZSM ochtend','ZSM middag','Netwerkdag drugs','Commissie geweldsaanwending','PRVT','OIBT']],
['Scenariotraining','scenario',['Scenariotraining Velsen','Scenariotraining Alkmaar','Scenariotraining Heemskerk','Scenariotraining BUCH gemeente','Scenariotraining Pijnacker','Scenariotraining Hilversum','Scenariotraining Leiden']],
['Seniortraining','senior',['Seniortraining BUCH','Seniortraining Velsen']],
['Overig','other',['Training Solutions','Brunssum']]
];
const $=s=>document.querySelector(s),cal=$('#calendar'),monthEl=$('#month'),dlg=$('#editor'),form=$('#form'),activity=$('#activity');
const EV='jsPlannerEvents',CU='jsPlannerCustom',CFG='jsPlannerSync',TOMB_DAYS=120;
let view=new Date(), selectedDate='', editing=null;
view=new Date(view.getFullYear(),view.getMonth(),1);

/* ---------- opslag ---------- */
function key(d){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
function now(){return new Date().toISOString()}
function uid(){return crypto.randomUUID?crypto.randomUUID():'id-'+Date.now()+'-'+Math.random().toString(16).slice(2)}
function esc(s){return String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]))}
function raw(k,d){try{const a=JSON.parse(localStorage.getItem(k)||'null');return Array.isArray(a)?a:d}catch{return d}}
function allEvents(){return raw(EV,[]).map(e=>e&&!e.updatedAt?Object.assign({},e,{updatedAt:'1970-01-01T00:00:00.000Z'}):e).filter(Boolean)}
function load(){return allEvents().filter(e=>!e.deleted)}
function custom(){return raw(CU,[])}
function save(events,customs){
  try{
    localStorage.setItem(EV,JSON.stringify(purge(events)));
    if(customs)localStorage.setItem(CU,JSON.stringify([...new Set(customs)]));
  }catch{alert('Opslaan is niet gelukt. Staat je browser opslag toe (geen privémodus)?')}
}
function purge(list){const cut=Date.now()-TOMB_DAYS*864e5;return list.filter(e=>!(e.deleted&&(Date.parse(e.deletedAt||e.updatedAt||0)||0)<cut))}
function addCustom(n){const a=custom();if(!a.includes(n)){a.push(n);try{localStorage.setItem(CU,JSON.stringify(a))}catch{}}}
function stamp(e){return Math.max(Date.parse(e.updatedAt||0)||0,Date.parse(e.deletedAt||0)||0)}
function merge(a,b){const m=new Map();for(const e of a.concat(b)){if(!e||!e.id)continue;const c=m.get(e.id);if(!c||stamp(e)>stamp(c))m.set(e.id,e)}return [...m.values()]}
function sameSet(a,b){const n=x=>JSON.stringify([...x].sort((p,q)=>String(p.id).localeCompare(String(q.id))));return n(a)===n(b)}

/* ---------- kalender ---------- */
function meta(title){
  const t=String(title||'');
  for(const [group,type,names] of activities)if(names.includes(t))return{group,type};
  if(/\bhovj\b|\bh\.?o\.?v\.?j\b|politie|\bzsm\b|piket|dagdienst|ochtenddienst|middagdienst|avonddienst|nachtdienst|netwerkdag|commissie\s*geweld|geweldsaanwending|\bprvt\b|\boibt\b/i.test(t))return{group:'Politie',type:'police'};
  if(/seniortraining/i.test(t))return{group:'Seniortraining',type:'senior'};
  if(/scenario/i.test(t))return{group:'Scenariotraining',type:'scenario'};
  return{group:'Overig',type:'other'};
}
function short(t){if(t.startsWith('Scenariotraining '))return t.replace('Scenariotraining ','').replace(' gemeente','');if(t.startsWith('Seniortraining '))return t.replace('Seniortraining ','');return t}
/* zachte afbreekstreepjes in samengestelde woorden: Ochtend-dienst, Senior-training */
function soft(t){return String(t).replace(/([a-zà-ÿ]{3,})(dienst|training|trainingen|aanwending)\b/gi,'$1\u00AD$2')}
function span(e){if(!e.start&&!e.end)return'';const over=e.start&&e.end&&e.end<e.start;return [e.start,e.end].filter(Boolean).join('–')+(over?' (+1)':'')}
function options(){
  const std=activities.flatMap(a=>a[2]),own=custom().filter(x=>!std.includes(x));
  activity.innerHTML=activities.map(([g,,n])=>`<optgroup label="${g}">${n.map(x=>`<option>${esc(x)}</option>`).join('')}</optgroup>`).join('')
    +(own.length?`<optgroup label="Eigen activiteiten">${own.map(x=>`<option>${esc(x)}</option>`).join('')}</optgroup>`:'')
    +'<optgroup label="Nieuw"><option value="__new">+ Nieuwe activiteit</option></optgroup>';
}
function render(){
  monthEl.textContent=view.toLocaleDateString('nl-NL',{month:'long',year:'numeric'});
  cal.innerHTML='';
  const first=new Date(view.getFullYear(),view.getMonth(),1),offset=(first.getDay()+6)%7,
        start=new Date(view.getFullYear(),view.getMonth(),1-offset),events=load(),today=key(new Date());
  for(let i=0;i<42;i++){
    const d=new Date(start);d.setDate(start.getDate()+i);
    const dk=key(d),cell=document.createElement('div');
    cell.className='day'+(d.getMonth()!=view.getMonth()?' out':'')+(dk===today?' today':'');
    cell.dataset.date=dk;
    cell.innerHTML=`<div class="num">${d.getDate()}</div>`;
    events.filter(e=>e.date===dk).sort((a,b)=>(a.start||'99:99').localeCompare(b.start||'99:99')).forEach(e=>{
      const b=document.createElement('button');
      b.type='button';b.className='event '+meta(e.title).type;
      if(e.start){const tm=document.createElement('span');tm.className='tm';tm.textContent=e.start;b.appendChild(tm)}
      const lbl=document.createElement('span');lbl.className='lbl';lbl.textContent=soft(short(e.title));b.appendChild(lbl);
      b.title=[e.title,span(e),e.location,e.notes].filter(Boolean).join(' · ');
      b.onclick=x=>{x.stopPropagation();openExisting(e)};
      cell.appendChild(b);
    });
    cell.onclick=()=>openNew(dk);
    cal.appendChild(cell);
  }
  fitLabels();
}
/* lange woorden niet midden in het woord afbreken: tekst iets verkleinen tot het past */
function fitLabels(){
  cal.querySelectorAll('.event .lbl').forEach(l=>{
    l.style.fontSize='';
    let f=parseFloat(getComputedStyle(l).fontSize);
    while(l.scrollWidth>l.clientWidth+.5&&f>7){f-=.5;l.style.fontSize=f+'px'}
  });
}
let fitT;addEventListener('resize',()=>{clearTimeout(fitT);fitT=setTimeout(fitLabels,120)});
function prettyDate(d){return new Date(d+'T12:00:00').toLocaleDateString('nl-NL',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}
function resetFields(){$('#eventId').value='';$('#location').value='';$('#notes').value='';$('#start').value='';$('#end').value='';activity.selectedIndex=0}
function openNew(d){editing=null;selectedDate=d;options();resetFields();$('#delete').style.visibility='hidden';$('#editorLabel').textContent='NIEUWE PLANNING';$('#dateTitle').textContent=prettyDate(d);dlg.showModal()}
function openExisting(e){
  editing=e.id;selectedDate=e.date;options();resetFields();
  if(![...activity.options].some(o=>o.value===e.title))activity.add(new Option(e.title,e.title));
  activity.value=e.title;
  $('#start').value=e.start||'';$('#end').value=e.end||'';$('#location').value=e.location||'';$('#notes').value=e.notes||'';
  $('#delete').style.visibility='visible';$('#editorLabel').textContent=e.title.toUpperCase();$('#dateTitle').textContent=prettyDate(e.date);
  dlg.showModal();
}
activity.addEventListener('change',()=>{
  if(activity.value==='__new'){
    const n=(prompt('Naam van de nieuwe activiteit:')||'').trim();
    if(n){addCustom(n);options();if(![...activity.options].some(o=>o.value===n))activity.add(new Option(n,n));activity.value=n;queueSync()}
    else activity.selectedIndex=0;
  }
});
form.addEventListener('submit',e=>{
  e.preventDefault();
  const title=activity.value;
  if(!title||title==='__new'){alert('Kies eerst een activiteit.');return}
  const m=meta(title),list=allEvents(),
    obj={id:editing||uid(),date:selectedDate,title,type:m.type,group:m.group,start:$('#start').value,end:$('#end').value,
         location:$('#location').value.trim(),notes:$('#notes').value.trim(),updatedAt:now()};
  save(editing?list.map(x=>x.id===editing?Object.assign({},x,obj,{deleted:false,deletedAt:undefined}):x):list.concat([obj]));
  dlg.close();render();queueSync();
});
$('#delete').onclick=()=>{
  if(editing&&confirm('Deze planning verwijderen?')){
    save(allEvents().map(x=>x.id===editing?{id:x.id,deleted:true,deletedAt:now(),updatedAt:now()}:x));
    dlg.close();render();queueSync();
  }
};
$('#cancelBtn').onclick=()=>dlg.close();
$('#closeBtn').onclick=()=>dlg.close();
$('#prev').onclick=()=>{view.setMonth(view.getMonth()-1);render()};
$('#next').onclick=()=>{view.setMonth(view.getMonth()+1);render()};
$('#today').onclick=()=>{const n=new Date();view=new Date(n.getFullYear(),n.getMonth(),1);render()};

/* ---------- back-up ---------- */
const bdlg=$('#backupDlg');
$('#backup').onclick=()=>bdlg.showModal();
$('#backupClose').onclick=()=>bdlg.close();
$('#exportBtn').onclick=()=>{
  const blob=new Blob([JSON.stringify({app:'js-planner',version:2,exported:now(),events:load(),custom:custom()},null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob),a=document.createElement('a');
  a.href=url;a.download=`js-planner-backup-${key(new Date())}.json`;document.body.appendChild(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),2000);
};
$('#importBtn').onclick=()=>$('#importFile').click();
$('#importFile').addEventListener('change',ev=>{
  const f=ev.target.files[0];if(!f)return;
  const r=new FileReader();
  r.onload=()=>{
    try{
      const d=JSON.parse(r.result),inc=(Array.isArray(d)?d:d.events||[]).filter(e=>e&&e.date&&e.title)
        .map(e=>Object.assign({updatedAt:now()},e,{id:e.id||uid(),type:e.type||meta(e.title).type}));
      const before=load().length,merged=merge(allEvents(),inc);
      save(merged,custom().concat(Array.isArray(d.custom)?d.custom:[]));
      options();render();bdlg.close();queueSync();
      alert(`Terugzetten gelukt: ${merged.filter(e=>!e.deleted).length-before} afspraken erbij.`);
    }catch{alert('Dit bestand kon niet worden gelezen.')}
    ev.target.value='';
  };
  r.readAsText(f);
});

/* ---------- GitHub-synchronisatie ---------- */
const sdlg=$('#syncDlg');
function cfg(){try{return JSON.parse(localStorage.getItem(CFG)||'null')}catch{return null}}
function setCfg(c){c?localStorage.setItem(CFG,JSON.stringify(c)):localStorage.removeItem(CFG)}
function b64enc(str){const b=new TextEncoder().encode(str);let s='';for(let i=0;i<b.length;i+=0x8000)s+=String.fromCharCode.apply(null,b.subarray(i,i+0x8000));return btoa(s)}
function b64dec(b64){const bin=atob(String(b64).replace(/\s/g,''));return new TextDecoder().decode(Uint8Array.from(bin,c=>c.charCodeAt(0)))}
function status(state,text){
  const dot=$('#syncDot'),t=$('#syncText');
  dot.className='dot '+state;t.textContent=text;
  $('#syncBtn').title=text;
}
function showStatus(){
  const c=cfg();
  if(!c||!c.token)return status('off','Niet gekoppeld');
  if(!navigator.onLine)return status('warn','Offline');
  const l=c.lastSync?new Date(c.lastSync):null;
  status('ok',l?'Gesynct '+l.toLocaleTimeString('nl-NL',{hour:'2-digit',minute:'2-digit'}):'Gekoppeld');
}
async function api(path,opts={}){
  const c=cfg();
  const res=await fetch('https://api.github.com'+path,Object.assign({},opts,{headers:Object.assign({
    'Authorization':'Bearer '+c.token,'Accept':'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28'
  },opts.headers||{})}));
  if(res.status===401||res.status===403){const e=new Error('auth');e.code=res.status;throw e}
  return res;
}
let syncing=false,again=false,timer=null;
function queueSync(){clearTimeout(timer);timer=setTimeout(()=>sync(),1200)}
async function sync(manual){
  const c=cfg();
  if(!c||!c.token){showStatus();return false}
  if(syncing){again=true;return false}
  if(!navigator.onLine){status('warn','Offline — lokaal bewaard');return false}
  syncing=true;status('busy','Synchroniseren…');
  const file=`/repos/${c.owner}/${c.repo}/contents/${encodeURIComponent(c.path||'events.json')}`;
  try{
    for(let attempt=0;attempt<4;attempt++){
      const get=await api(file+'?ref='+encodeURIComponent(c.branch||'main')+'&t='+Date.now(),{cache:'no-store'});
      let remote={events:[],custom:[]},sha=null;
      if(get.ok){const j=await get.json();sha=j.sha;try{const p=JSON.parse(b64dec(j.content||''));remote={events:Array.isArray(p.events)?p.events:[],custom:Array.isArray(p.custom)?p.custom:[]}}catch{}}
      else if(get.status!==404){throw new Error('HTTP '+get.status)}
      const localEv=allEvents(),localCu=custom();
      const mergedEv=purge(merge(localEv,remote.events)),mergedCu=[...new Set(localCu.concat(remote.custom))];
      if(!sameSet(mergedEv,localEv)||mergedCu.length!==localCu.length){save(mergedEv,mergedCu);options();render()}
      if(sameSet(mergedEv,remote.events)&&mergedCu.length===remote.custom.length&&sha){break}
      const body={message:'planner: update '+new Date().toLocaleString('nl-NL'),
        content:b64enc(JSON.stringify({app:'js-planner',version:2,updated:now(),events:mergedEv,custom:mergedCu},null,1)),
        branch:c.branch||'main'};
      if(sha)body.sha=sha;
      const put=await api(file,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
      if(put.ok)break;
      if(put.status===409||put.status===422){await new Promise(r=>setTimeout(r,400*(attempt+1)));continue}
      throw new Error('HTTP '+put.status);
    }
    setCfg(Object.assign({},cfg(),{lastSync:now()}));showStatus();
    if(manual)flash('Synchronisatie gelukt');
    return true;
  }catch(err){
    if(err.code===401||err.code===403){status('err','Token afgewezen');if(manual)alert('GitHub weigert het token. Maak een nieuw token aan en koppel opnieuw.')}
    else{status('warn','Sync mislukt — lokaal bewaard');if(manual)alert('Synchroniseren lukte niet: '+err.message)}
    return false;
  }finally{
    syncing=false;
    if(again){again=false;setTimeout(()=>sync(),300)}
  }
}
function flash(msg){const el=$('#flash');el.textContent=msg;el.classList.add('show');setTimeout(()=>el.classList.remove('show'),2200)}
$('#syncBtn').onclick=()=>{
  const c=cfg()||{};
  $('#repoField').value=(c.owner&&c.repo)?`${c.owner}/${c.repo}`:'JSLegalForce/planner-data';
  $('#tokenField').value='';
  $('#tokenField').placeholder=c.token?'Token is opgeslagen op dit apparaat':'github_pat_…';
  $('#disconnect').style.display=c.token?'':'none';
  $('#pairBtn').style.display=c.token?'':'none';
  hidePair();
  $('#syncNow').style.display=c.token?'':'none';
  sdlg.showModal();
};
$('#syncClose').onclick=()=>{hidePair();sdlg.close()};
$('#connect').onclick=async()=>{
  const m=/^\s*([\w.-]+)\s*\/\s*([\w.-]+)\s*$/.exec($('#repoField').value||'');
  if(!m){alert('Vul de repository in als eigenaar/naam, bijvoorbeeld JSLegalForce/planner-data');return}
  const token=$('#tokenField').value.trim()||(cfg()||{}).token;
  if(!token){alert('Plak je GitHub-token.');return}
  const prev=cfg();
  setCfg({owner:m[1],repo:m[2],path:'events.json',branch:'main',token});
  status('busy','Controleren…');
  try{
    const r=await api(`/repos/${m[1]}/${m[2]}`);
    if(!r.ok){throw new Error(r.status===404?'Repository niet gevonden (of het token heeft er geen toegang toe).':'HTTP '+r.status)}
    const j=await r.json();
    if(!j.permissions||!j.permissions.push)throw new Error('Het token mag alleen lezen. Geef het Contents: Read and write.');
    $('#tokenField').value='';
    const ok=await sync(false);
    sdlg.close();
    flash(ok?'Gekoppeld aan '+m[1]+'/'+m[2]:'Gekoppeld, maar eerste sync mislukte');
  }catch(err){
    setCfg(prev);showStatus();
    alert('Koppelen lukte niet. '+(err.code===401?'Het token is ongeldig of verlopen.':err.message));
  }
};
$('#syncNow').onclick=()=>sync(true);
$('#disconnect').onclick=()=>{
  if(confirm('Token van dit apparaat verwijderen? Je afspraken blijven lokaal staan en de rest blijft op GitHub.')){
    setCfg(null);showStatus();sdlg.close();flash('Ontkoppeld op dit apparaat');
  }
};
window.addEventListener('online',()=>{showStatus();sync()});
window.addEventListener('offline',showStatus);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)sync()});
setInterval(()=>{if(!document.hidden)sync()},90000);


/* ---------- ander apparaat koppelen via QR ---------- */
function b64url(s){return btoa(s).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')}
function unb64url(s){s=s.replace(/-/g,'+').replace(/_/g,'/');return atob(s+'='.repeat((4-s.length%4)%4))}
function pairUrl(){
  const c=cfg();if(!c||!c.token)return'';
  return location.origin+location.pathname+'#pair='+b64url(JSON.stringify({o:c.owner,r:c.repo,t:c.token}));
}
function showPair(){
  const box=$('#pairBox'),url=pairUrl();
  if(!url){alert('Koppel dit apparaat eerst.');return}
  try{
    const q=qrcode(0,'M');q.addData(url);q.make();
    $('#qr').innerHTML=q.createSvgTag({cellSize:5,margin:8,scalable:true});
    box.hidden=false;
  }catch(e){alert('De koppelcode kon niet worden gemaakt.')}
}
function hidePair(){$('#pairBox').hidden=true;$('#qr').innerHTML=''}
$('#pairBtn').onclick=showPair;
$('#pairClose').onclick=hidePair;
function takePairing(){
  const m=/[#&]pair=([A-Za-z0-9\-_]+)/.exec(location.hash||'');
  if(!m)return false;
  history.replaceState(null,'',location.pathname+location.search);
  try{
    const p=JSON.parse(unb64url(m[1]));
    if(!p.o||!p.r||!p.t)throw 0;
    setCfg({owner:p.o,repo:p.r,path:'events.json',branch:'main',token:p.t});
    return true;
  }catch{alert('Deze koppelcode is niet geldig.');return false}
}

/* ---------- start ---------- */
function herclassificeer(){
  const list=allEvents();let veranderd=false;
  const fixed=list.map(e=>{
    if(e.deleted||!e.title)return e;
    const m=meta(e.title);
    if(e.type===m.type&&e.group===m.group)return e;
    veranderd=true;
    return Object.assign({},e,{type:m.type,group:m.group,updatedAt:now()});
  });
  if(veranderd)save(fixed);
  return veranderd;
}
const paired=takePairing();
const hersteld=herclassificeer();
options();render();showStatus();
sync().then(ok=>{if(paired&&ok)flash('Dit apparaat is gekoppeld');else if(hersteld&&ok)flash('Kleuren bijgewerkt')});
if('serviceWorker'in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
