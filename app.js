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
function load(){try{return JSON.parse(localStorage.getItem('jsPlannerEvents')||'[]')}catch{return[]}}
function store(a){localStorage.setItem('jsPlannerEvents',JSON.stringify(a))}
function meta(title){for(const [group,type,names] of activities)if(names.includes(title))return{group,type};return{group:'Overig',type:'other'}}
function short(title){if(title.startsWith('Scenariotraining '))return title.replace('Scenariotraining ','').replace(' gemeente','');if(title.startsWith('Seniortraining '))return title.replace('Seniortraining ','');return title}
function options(){activity.innerHTML=activities.map(([g,,names])=>`<optgroup label="${g}">${names.map(n=>`<option>${n}</option>`).join('')}</optgroup>`).join('')+'<optgroup label="Eigen activiteit"><option value="__new">+ Nieuwe activiteit</option></optgroup>'}
function render(){monthEl.textContent=view.toLocaleDateString('nl-NL',{month:'long',year:'numeric'});cal.innerHTML='';let first=new Date(view.getFullYear(),view.getMonth(),1),offset=(first.getDay()+6)%7,start=new Date(view.getFullYear(),view.getMonth(),1-offset),events=load(),today=key(new Date());for(let i=0;i<42;i++){let d=new Date(start);d.setDate(start.getDate()+i);let dk=key(d),cell=document.createElement('div');cell.className='day'+(d.getMonth()!=view.getMonth()?' out':'')+(dk===today?' today':'');cell.dataset.date=dk;cell.innerHTML=`<div class="num">${d.getDate()}</div>`;events.filter(e=>e.date===dk).forEach(e=>{let b=document.createElement('button');b.className=`event ${e.type}`;b.textContent=short(e.title);b.title=e.title;b.onclick=x=>{x.stopPropagation();openExisting(e)};cell.appendChild(b)});cell.onclick=()=>openNew(dk);cal.appendChild(cell)}}
function prettyDate(d){return new Date(d+'T12:00:00').toLocaleDateString('nl-NL',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}
function resetFields(){form.reset();$('#eventId').value='';$('#location').value='';$('#notes').value='';$('#start').value='';$('#end').value=''}
function openNew(d){editing=null;selectedDate=d;resetFields();$('#delete').style.visibility='hidden';$('#editorLabel').textContent='NIEUWE PLANNING';$('#dateTitle').textContent=prettyDate(d);dlg.showModal()}
function openExisting(e){editing=e.id;selectedDate=e.date;resetFields();activity.value=e.title;if(![...activity.options].some(o=>o.value===e.title)){let o=new Option(e.title,e.title);activity.add(o);activity.value=e.title}$('#start').value=e.start||'';$('#end').value=e.end||'';$('#location').value=e.location||'';$('#notes').value=e.notes||'';$('#delete').style.visibility='visible';$('#editorLabel').textContent=e.title.toUpperCase();$('#dateTitle').textContent=prettyDate(e.date);dlg.showModal()}
activity.addEventListener('change',()=>{if(activity.value==='__new'){let n=prompt('Naam van de nieuwe activiteit:');if(n){let o=new Option(n,n);activity.add(o);activity.value=n}else activity.selectedIndex=0}});
form.addEventListener('submit',e=>{e.preventDefault();let title=activity.value;if(!title||title==='__new')return;let events=load(),m=meta(title),obj={id:editing||crypto.randomUUID(),date:selectedDate,title,type:m.type,group:m.group,start:$('#start').value,end:$('#end').value,location:$('#location').value.trim(),notes:$('#notes').value.trim()};if(editing)events=events.map(x=>x.id===editing?obj:x);else events.push(obj);store(events);dlg.close();render()});
$('#delete').onclick=()=>{if(editing&&confirm('Deze planning verwijderen?')){store(load().filter(e=>e.id!==editing));dlg.close();render()}};
$('#prev').onclick=()=>{view.setMonth(view.getMonth()-1);render()};$('#next').onclick=()=>{view.setMonth(view.getMonth()+1);render()};$('#today').onclick=()=>{let n=new Date();view=new Date(n.getFullYear(),n.getMonth(),1);render()};
options();render();if('serviceWorker'in navigator)navigator.serviceWorker.register('./sw.js');