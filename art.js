/* A source-linked research route map. No ambient motion. */
import {transit} from './theme-transit.js';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export async function createWork(records,{onSelect,onHover,onCount}){
 const ordered=records.filter(r=>r.countedAsReuse).sort((a,b)=>(a.date||'9999').localeCompare(b.date||'9999')||a.id.localeCompare(b.id));
 const designs=[{id:'underground',label:'Underground',render:transit}];
 const canvas=document.querySelector('#sculpture');canvas.hidden=true;const stage=document.querySelector('#flat-art');stage.hidden=false;stage.removeAttribute('aria-hidden');stage.classList.add('theme-stage');
 let active=Math.max(0,designs.findIndex(d=>d.id===new URLSearchParams(location.search).get('theme'))),ids=ordered.map(r=>r.id);
 const attributes=r=>`data-project="${esc(r.id)}" role="button" tabindex="0" aria-label="${esc(r.id==='origin'?'ASQ-PHI paper, code and dataset':(r.display?.shortName||r.name||r.id))}"`;
 const helpers={esc,attributes,shortName:r=>{const name=r.display?.shortName||r.name;return name.length>24?name.slice(0,23)+'…':name},month:d=>d?new Date(d+'T12:00:00Z').toLocaleDateString('en-GB',{month:'short',year:'2-digit',timeZone:'UTC'}):'Undated',date:d=>d?new Date(d+'T12:00:00Z').toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'}):'Undated'};

 function applyVisibility(){stage.querySelectorAll('[data-project]').forEach(el=>el.style.display=el.dataset.project==='origin'||ids.includes(el.dataset.project)?'':'none')}
 function render(){const design=designs[active];stage.innerHTML=`<svg viewBox="0 0 1000 700" aria-label="${esc(design.label)} · source-linked ASQ-PHI projects" xmlns="http://www.w3.org/2000/svg">${design.render(ordered,helpers)}</svg>`;applyVisibility();stage.querySelectorAll('[data-project]').forEach(el=>{const record=el.dataset.project==='origin'?{id:'origin'}:ordered.find(r=>r.id===el.dataset.project);el.addEventListener('pointerenter',()=>{stage.querySelectorAll('[data-project]').forEach(n=>n.classList.toggle('selected-project',n.dataset.project===el.dataset.project));onHover(record)});el.addEventListener('pointerleave',()=>{stage.querySelectorAll('.selected-project').forEach(n=>n.classList.remove('selected-project'));onHover(null)});el.addEventListener('focus',()=>onHover(record));el.addEventListener('blur',()=>onHover(null));el.addEventListener('click',()=>onSelect(el.dataset.project));el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();onSelect(el.dataset.project)}})});onHover(null)}
 function change(i){active=(i+designs.length)%designs.length;const address=new URL(location.href);address.searchParams.set('theme',designs[active].id);history.replaceState(null,'',address.pathname+address.search+address.hash);render()}
 render();
 return{setStudy:change,setProjects(next){ids=next;applyVisibility();onHover(null);onCount(ids.length)},setCount(n){ids=ordered.slice(0,n).map(r=>r.id);applyVisibility();onCount(n)},setTurn(){},reset(){},dispose(){}};
}
