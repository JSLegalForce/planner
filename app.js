const activities=[
['Politie','police',['Dagdienst','Ochtenddienst','Middagdienst','Nachtdienst','ZSM ochtend','ZSM middag']],
['Scenariotraining','scenario',['Scenariotraining Velsen','Scenariotraining Alkmaar','Scenariotraining Heemskerk','Scenariotraining BUCH gemeente','Scenariotraining Pijnacker','Scenariotraining Hilversum','Scenariotraining Leiden']],
['Seniortraining','senior',['Seniortraining BUCH','Seniortraining Velsen']],
['Overig','other',['Training Solutions','Brunssum']]
];
const $=s=>document.querySelector(s),cal=$('#calendar'),monthEl=$('#month'),dlg=$('#editor'),form=$('#form'),activity=$('#activity');
let view=new Date(), selectedDate='', editing=null;
view=new Date(view.getFullYear(),view.getMonth(),1);

function key(d){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
function load(){try{const a=JSON.parse(localStorage.getItem('jsPlannerEvents')||'[]');return Array.isArray(a)?a:[]}catch{return[]}}
function store(a){try{localStorage.setItem('jsPlannerEvents',JSON.stringify(a))}catch(e){alert('Opslaan is niet gelukt. Controleer of je browser opslag toestaat (geen privémodus).')}}
function uid(){return (crypto.randomUUID?crypto.randomUUID():'id-'+Date.now()+'-'+Math.random().toString(16).slice(2))}
function meta(title){for(const [group,type,names] of activities)if(names.includes(title))return{group,type};return{group:'Overig',type:'other'}}
function short(title){if(title.startsWith('Scenariotraining '))return title.replace('Scenariotraining ','').replace(' gemeente','');if(title.startsWith('Seniortraining '))return title.replace('Seniortraining ','');return title}
function custom(){try{const a=JSON.parse(localStorage.getItem('jsPlannerCustom')||'[]');return Array.isArray(a)?a:[]}catch{return[]}}
function addCustom(n){const a=custom();if(!a.includes(n)){a.push(n);try{localStorage.setItem('jsPlannerCustom',JSON.stringify(a))}catch{}}}
function options(){
  const own=custom();
  activity.innerHTML=activities.map(([g,,names])=>`<optgroup label="${g}">${names.map(n=>`<option>${esc(n)}</option>`).join('')}</optgroup>`).join('')
    +(own.length?`<optgroup label="Eigen activiteiten">${own.map(n=>`<option>${esc(n)}</option>`).join('')}</optgroup>`:'')
    +'<optgroup label="Nieuw"><option value="__new">+ Nieuwe activiteit</option></optgroup>';
}
function esc(s){return String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]))}
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
      b.type='button';
      b.className=`event ${e.type||'other'}`;
      b.textContent=(e.start?e.start+' ':'')+short(e.title);
      b.title=[e.title,span(e),e.location,e.notes].filter(Boolean).join(' · ');
      b.onclick=x=>{x.stopPropagation();openExisting(e)};
      cell.appendChild(b);
    });
    cell.onclick=()=>openNew(dk);
    cal.appendChild(cell);
  }
}
function span(e){if(!e.start&&!e.end)return'';const over=e.start&&e.end&&e.end<e.start;return [e.start,e.end].filter(Boolean).join('–')+(over?' (+1)':'')}
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
    if(n){addCustom(n);options();if(![...activity.options].some(o=>o.value===n))activity.add(new Option(n,n));activity.value=n}
    else activity.selectedIndex=0;
  }
});
form.addEventListener('submit',e=>{
  e.preventDefault();
  const title=activity.value;
  if(!title||title==='__new'){alert('Kies eerst een activiteit.');return}
  let events=load();
  const m=meta(title),obj={id:editing||uid(),date:selectedDate,title,type:m.type,group:m.group,start:$('#start').value,end:$('#end').value,location:$('#location').value.trim(),notes:$('#notes').value.trim()};
  events=editing?events.map(x=>x.id===editing?obj:x):events.concat([obj]);
  store(events);dlg.close();render();
});
$('#delete').onclick=()=>{if(editing&&confirm('Deze planning verwijderen?')){store(load().filter(e=>e.id!==editing));dlg.close();render()}};
$('#cancelBtn').onclick=()=>dlg.close();
$('#closeBtn').onclick=()=>dlg.close();
$('#prev').onclick=()=>{view.setMonth(view.getMonth()-1);render()};
$('#next').onclick=()=>{view.setMonth(view.getMonth()+1);render()};
$('#today').onclick=()=>{const n=new Date();view=new Date(n.getFullYear(),n.getMonth(),1);render()};

/* Back-up */
const bdlg=$('#backupDlg');
$('#backup').onclick=()=>bdlg.showModal();
$('#backupClose').onclick=()=>bdlg.close();
$('#exportBtn').onclick=()=>{
  const data={app:'js-planner',version:1,exported:new Date().toISOString(),events:load(),custom:custom()};
  const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));
  const a=document.createElement('a');a.href=url;a.download=`js-planner-backup-${key(new Date())}.json`;
  document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2000);
};
$('#importBtn').onclick=()=>$('#importFile').click();
$('#importFile').addEventListener('change',ev=>{
  const f=ev.target.files[0];if(!f)return;
  const r=new FileReader();
  r.onload=()=>{
    try{
      const d=JSON.parse(r.result);
      const inc=Array.isArray(d)?d:(d.events||[]);
      if(!Array.isArray(inc))throw 0;
      const cur=load(),ids=new Set(cur.map(e=>e.id));
      const merged=cur.concat(inc.filter(e=>e&&e.date&&e.title&&!ids.has(e.id)).map(e=>Object.assign({},e,{id:e.id||uid(),type:e.type||meta(e.title).type})));
      store(merged);
      if(Array.isArray(d.custom))d.custom.forEach(addCustom);
      options();render();bdlg.close();
      alert(`Terugzetten gelukt: ${merged.length-cur.length} afspraken toegevoegd.`);
    }catch{alert('Dit bestand kon niet worden gelezen.')}
    ev.target.value='';
  };
  r.readAsText(f);
});

options();render();
if('serviceWorker'in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
