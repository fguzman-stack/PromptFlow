import './styles/main.css';
import { PROMPTS, AI_MODELS, CATEGORIES } from './data/prompts.js';

// State
let filtered = [...PROMPTS];
let favSet = new Set(JSON.parse(localStorage.getItem('pf:favs') || '[]'));
let pageSize = 12;
let visibleCount = pageSize;
let state = {
  q: '',
  category: '',
  model: '',
  difficulty: '',
  tag: '',
  favOnly: false,
  sort: 'popular',
};

// Elements
const els = {};
function $(id){ return document.getElementById(id); }

function initEls(){
  els.search = $('search-input');
  els.clearSearch = $('clear-search');
  els.categoryChips = $('category-chips');
  els.categoryFilter = $('category-filter');
  els.modelFilter = $('model-filter');
  els.modelBtn = $('model-dropdown-btn');
  els.modelLabel = $('model-dropdown-label');
  els.modelDropdown = $('model-dropdown');
  els.difficulty = $('difficulty-filter');
  els.sort = $('sort-filter');
  els.tagCloud = $('tag-cloud');
  els.activeFilters = $('active-filters');
  els.resultsInfo = $('results-info');
  els.container = $('prompts-container');
  els.empty = $('empty-state');
  els.loadMore = $('load-more');
  els.favCount = $('fav-count');
  els.favCountM = $('fav-count-m');
  els.statPrompts = $('stat-prompts');
  els.modal = $('prompt-modal');
  els.modalBackdrop = $('modal-backdrop');
  els.modalTitle = $('modal-title');
  els.modalText = $('modal-text');
  els.modalMeta = $('modal-meta');
  els.modalClose = $('modal-close');
  els.modalClose2 = $('modal-close-2');
  els.modalCopy = $('modal-copy');
  els.modalFav = $('modal-fav');
  els.toast = $('toast');
  els.toastMsg = $('toast-msg');
  els.toastIcon = $('toast-icon');
}

let currentModalId = null;

function saveFavs(){
  localStorage.setItem('pf:favs', JSON.stringify([...favSet]));
  updateFavUI();
}

function updateFavUI(){
  const n = favSet.size;
  if(els.favCount) els.favCount.textContent = String(n);
  if(els.favCountM) els.favCountM.textContent = n ? String(n) : '';
}

function toast(msg, icon='✅'){
  els.toastMsg.textContent = msg;
  els.toastIcon.textContent = icon;
  els.toast.classList.remove('hidden');
  els.toast.classList.add('flex');
  clearTimeout(toast._t);
  toast._t = setTimeout(()=>{ els.toast.classList.add('hidden'); els.toast.classList.remove('flex'); }, 2200);
}

function buildCategoryChips(){
  const chips = ['Todas', ...CATEGORIES];
  els.categoryChips.innerHTML = chips.map(c=>{
    const active = (c==='Todas' ? state.category==='' : state.category===c);
    return `<button data-cat="${c==='Todas' ? '' : c}" class="px-3 py-1.5 rounded-full text-sm font-semibold border-2 transition ${active ? 'bg-slate-900 text-white border-slate-900' : 'bg-white border-slate-200 hover:border-indigo-300'}">${c}</button>`;
  }).join('');
  els.categoryChips.querySelectorAll('button').forEach(b=>{
    b.addEventListener('click', ()=>{
      state.category = b.dataset.cat;
      visibleCount = pageSize;
      applyFilters();
    });
  });
  // populate hidden select
  els.categoryFilter.innerHTML = '<option value="">Todas</option>' + CATEGORIES.map(c=>`<option value="${c}">${c}</option>`).join('');
  els.categoryFilter.value = state.category;
}

function buildModelDropdown(){
  // label
  els.modelLabel.textContent = state.model ? AI_MODELS.find(m=>m.id===state.model)?.label : `Todas las IAs (${AI_MODELS.length})`;
  const html = `<div class="p-1">
    <button data-model="" class="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 text-sm ${state.model===''?'bg-slate-900 text-white hover:bg-slate-900':''}">✨ Todas las IAs (${AI_MODELS.length})</button>
    ${AI_MODELS.map(m=>`
      <button data-model="${m.id}" class="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 text-sm flex items-center gap-2 ${state.model===m.id?'bg-indigo-50 border border-indigo-200':''}">
        <span>${m.icon}</span><span class="font-medium">${m.label}</span><span class="ml-auto text-xs text-slate-500">${m.vendor}</span>
      </button>
    `).join('')}
  </div>`;
  els.modelDropdown.innerHTML = html;
  els.modelDropdown.querySelectorAll('button').forEach(b=>{
    b.addEventListener('click', ()=>{
      state.model = b.dataset.model;
      els.modelFilter.value = state.model;
      els.modelDropdown.classList.add('hidden');
      visibleCount = pageSize;
      applyFilters();
    });
  });
}

function buildTagCloud(){
  const allTags = [...new Set(PROMPTS.flatMap(p=>p.tags||[]))].slice(0,14);
  els.tagCloud.innerHTML = allTags.map(t=>{
    const active = state.tag===t;
    return `<button data-tag="${t}" class="px-2.5 py-1 rounded-full text-xs font-bold border transition ${active ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white border-slate-200 hover:border-indigo-300'}">#${t}</button>`;
  }).join('');
  els.tagCloud.querySelectorAll('button').forEach(b=>{
    b.addEventListener('click', ()=>{
      state.tag = state.tag===b.dataset.tag ? '' : b.dataset.tag;
      visibleCount = pageSize;
      applyFilters();
    });
  });
}

function renderActiveFilters(){
  const parts = [];
  if(state.q) parts.push({label:`“${state.q}”`, key:'q'});
  if(state.category) parts.push({label:state.category, key:'category'});
  if(state.model) parts.push({label: AI_MODELS.find(m=>m.id===state.model)?.label || state.model, key:'model'});
  if(state.difficulty) parts.push({label:state.difficulty, key:'difficulty'});
  if(state.tag) parts.push({label:`#${state.tag}`, key:'tag'});
  if(state.favOnly) parts.push({label:'Solo favoritos', key:'favOnly'});
  if(parts.length===0){ els.activeFilters.innerHTML=''; return; }
  els.activeFilters.innerHTML = parts.map(p=>`<span class="inline-flex items-center gap-1.5 bg-slate-900 text-white px-2.5 py-1 rounded-full text-xs font-semibold">${p.label} <button data-clear="${p.key}" class="w-4 h-4 grid place-items-center rounded-full bg-white/20 hover:bg-white/30">✕</button></span>`).join('') + `<button id="clear-active" class="text-xs font-semibold text-slate-500 hover:text-slate-700 underline">Limpiar todo</button>`;
  els.activeFilters.querySelectorAll('[data-clear]').forEach(b=>{
    b.addEventListener('click', ()=>{
      const k=b.dataset.clear;
      if(k==='q'){ state.q=''; els.search.value=''; }
      if(k==='category') state.category='';
      if(k==='model') state.model='';
      if(k==='difficulty'){ state.difficulty=''; els.difficulty.value=''; }
      if(k==='tag') state.tag='';
      if(k==='favOnly') state.favOnly=false;
      visibleCount=pageSize;
      applyFilters();
    });
  });
  const ca=$('clear-active');
  if(ca) ca.addEventListener('click', clearAll);
}

function clearAll(){
  state={q:'', category:'', model:'', difficulty:'', tag:'', favOnly:false, sort: state.sort};
  els.search.value='';
  els.difficulty.value='';
  els.sort.value=state.sort;
  els.modelFilter.value='';
  visibleCount=pageSize;
  applyFilters();
}

function applyFilters(){
  const q = state.q.toLowerCase();
  filtered = PROMPTS.filter(p=>{
    const matchesQ = !q || p.title.toLowerCase().includes(q) || p.text.toLowerCase().includes(q) || (p.tags||[]).join(' ').toLowerCase().includes(q) || p.category.toLowerCase().includes(q) || p.model.toLowerCase().includes(q);
    const matchesCat = !state.category || p.category===state.category;
    const matchesModel = !state.model || p.model===state.model;
    const matchesDiff = !state.difficulty || p.difficulty===state.difficulty;
    const matchesTag = !state.tag || (p.tags||[]).includes(state.tag);
    const matchesFav = !state.favOnly || favSet.has(String(p.id));
    return matchesQ && matchesCat && matchesModel && matchesDiff && matchesTag && matchesFav;
  });
  // sort
  if(state.sort==='popular') filtered.sort((a,b)=> (b.popularity||0)-(a.popularity||0));
  else if(state.sort==='newest') filtered.sort((a,b)=> b.id - a.id);
  else if(state.sort==='az') filtered.sort((a,b)=> a.title.localeCompare(b.title));

  // update chips & dropdown UI
  buildCategoryChips();
  buildModelDropdown();
  buildTagCloud();
  renderActiveFilters();
  updateResultsInfo();
  renderPrompts();
  syncToolbar();
  // show/hide clear search
  if(state.q) { els.clearSearch.classList.remove('opacity-0','pointer-events-none'); els.clearSearch.style.opacity='1'; els.clearSearch.style.pointerEvents='auto'; }
  else { els.clearSearch.style.opacity='0'; els.clearSearch.style.pointerEvents='none'; }
}

function updateResultsInfo(){
  const n=filtered.length;
  const total=PROMPTS.length;
  els.resultsInfo.textContent = n===total ? `Mostrando ${Math.min(visibleCount,n)} de ${total} prompts` : `Encontrados ${n} de ${total} · mostrando ${Math.min(visibleCount,n)}`;
}

function syncToolbar(){
  document.querySelectorAll('.btn-toolbar').forEach(b=>{
    b.classList.toggle('active', b.dataset.sort===state.sort);
    b.classList.toggle('bg-slate-900', b.dataset.sort===state.sort);
    b.classList.toggle('text-white', b.dataset.sort===state.sort);
    b.classList.toggle('border-slate-900', b.dataset.sort===state.sort);
  });
}

function cardHTML(p){
  const isFav = favSet.has(String(p.id));
  const modelMeta = AI_MODELS.find(m=>m.id===p.model);
  const diffColor = p.difficulty==='Beginner' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : p.difficulty==='Intermediate' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-rose-50 text-rose-700 border-rose-200';
  const excerpt = p.text.replace(/\n/g,' ').slice(0, 138);
  return `<article class="group bg-white rounded-2xl border-2 border-slate-200 p-5 flex flex-col hover:border-indigo-300 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 reveal" data-id="${p.id}">
    <div class="flex flex-wrap items-center gap-2">
      <span class="px-2.5 py-1 rounded-full text-[11px] font-bold tracking-widest uppercase bg-slate-900 text-white">${p.category}</span>
      <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border bg-white">${modelMeta ? modelMeta.icon : '🤖'} ${p.model}</span>
      <span class="px-2 py-1 rounded-full text-xs font-bold border ${diffColor}">${p.difficulty}</span>
      <button data-fav="${p.id}" class="ml-auto w-8 h-8 grid place-items-center rounded-xl border-2 ${isFav?'bg-pink-500 border-pink-500 text-white':'bg-white border-slate-200 hover:border-pink-300'} transition">${isFav?'♥':'♡'}</button>
    </div>
    <h3 class="font-semibold text-[16px] leading-tight mt-3 line-clamp-2 group-hover:text-indigo-600 transition">${escapeHTML(p.title)}</h3>
    <p class="text-sm text-slate-600 mt-2 line-clamp-3 leading-relaxed">${escapeHTML(excerpt)}…</p>
    <div class="flex flex-wrap gap-1.5 mt-3">
      ${(p.tags||[]).slice(0,3).map(t=>`<span class="text-[11px] px-2 py-1 rounded-full bg-slate-100 text-slate-600">#${t}</span>`).join('')}
      <span class="text-[11px] px-2 py-1 rounded-full bg-indigo-50 text-indigo-600 font-bold">★ ${p.popularity||90}</span>
    </div>
    <div class="flex gap-2 mt-4">
      <button data-copy="${p.id}" class="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2.5 rounded-xl text-sm font-semibold transition">▸ Copiar</button>
      <button data-view="${p.id}" class="px-3 py-2.5 rounded-xl border-2 border-slate-200 bg-white text-sm font-semibold hover:border-slate-300 transition">Ver</button>
    </div>
  </article>`;
}

function escapeHTML(s){ return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

function renderPrompts(){
  if(filtered.length===0){
    els.container.innerHTML='';
    els.empty.classList.remove('hidden');
    els.loadMore.classList.add('hidden');
    return;
  }
  els.empty.classList.add('hidden');
  const slice = filtered.slice(0, visibleCount);
  els.container.innerHTML = slice.map(cardHTML).join('');
  // load more visibility
  if(visibleCount < filtered.length) els.loadMore.classList.remove('hidden');
  else els.loadMore.classList.add('hidden');

  // stagger reveal
  requestAnimationFrame(()=>{
    const cards = els.container.querySelectorAll('.reveal');
    cards.forEach((c,i)=>{
      c.style.transitionDelay = (i*40)+'ms';
      requestAnimationFrame(()=> c.classList.add('in'));
    });
    // observe for scroll reveal fallback
    io.observeAll(cards);
  });

  // bind actions
  els.container.querySelectorAll('[data-copy]').forEach(b=>{
    b.addEventListener('click', (e)=>{
      e.stopPropagation();
      const id=Number(b.dataset.copy);
      copyPrompt(id, b);
    });
  });
  els.container.querySelectorAll('[data-view]').forEach(b=>{
    b.addEventListener('click', (e)=>{
      e.stopPropagation();
      viewPrompt(Number(b.dataset.view));
    });
  });
  els.container.querySelectorAll('[data-fav]').forEach(b=>{
    b.addEventListener('click', (e)=>{
      e.stopPropagation();
      toggleFav(String(b.dataset.fav));
    });
  });
  els.container.querySelectorAll('article').forEach(a=>{
    a.addEventListener('click', ()=> viewPrompt(Number(a.dataset.id)));
  });
}

function toggleFav(id){
  if(favSet.has(id)) favSet.delete(id); else favSet.add(id);
  saveFavs();
  applyFilters();
  toast(favSet.has(id) ? 'Añadido a favoritos' : 'Quitado de favoritos', favSet.has(id) ? '💖' : '🤍');
  if(currentModalId && String(currentModalId)===id) syncModalFav();
}

function syncModalFav(){
  const isFav = favSet.has(String(currentModalId));
  els.modalFav.textContent = isFav ? '♥ En favoritos' : '♡ Favorito';
  els.modalFav.className = isFav ? 'px-4 py-3 rounded-xl bg-pink-500 text-white font-semibold' : 'px-4 py-3 rounded-xl border-2 border-slate-200 bg-white font-semibold hover:border-pink-300 transition';
}

async function copyPrompt(id, btn){
  const p = PROMPTS.find(x=>x.id===id);
  if(!p) return;
  try{ await navigator.clipboard.writeText(p.text); } catch { /* fallback */ const ta=document.createElement('textarea'); ta.value=p.text; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove(); }
  if(btn){ const orig=btn.textContent; btn.textContent='✅ ¡Copiado!'; btn.classList.add('bg-emerald-600'); setTimeout(()=>{ btn.textContent=orig; btn.classList.remove('bg-emerald-600'); }, 1600); }
  toast('Prompt copiado al portapapeles');
}

function viewPrompt(id){
  const p = PROMPTS.find(x=>x.id===id);
  if(!p) return;
  currentModalId = id;
  const modelMeta = AI_MODELS.find(m=>m.id===p.model);
  els.modalTitle.textContent = p.title;
  els.modalText.textContent = p.text;
  els.modalMeta.innerHTML = `
    <span class="px-2.5 py-1 rounded-full bg-slate-900 text-white text-xs font-bold">${p.category}</span>
    <span class="px-2.5 py-1 rounded-full border bg-white text-xs font-semibold">${modelMeta?modelMeta.icon:''} ${p.model}</span>
    <span class="px-2.5 py-1 rounded-full border text-xs font-bold ${p.difficulty==='Beginner'?'bg-emerald-50 border-emerald-200 text-emerald-700':p.difficulty==='Intermediate'?'bg-amber-50 border-amber-200 text-amber-700':'bg-rose-50 border-rose-200 text-rose-700'}">${p.difficulty}</span>
    ${(p.tags||[]).map(t=>`<span class="px-2 py-1 rounded-full bg-slate-100 text-xs">#${t}</span>`).join('')}
  `;
  syncModalFav();
  els.modal.classList.remove('hidden');
  els.modal.classList.add('flex');
  document.body.style.overflow='hidden';
}

function closeModal(){
  els.modal.classList.add('hidden');
  els.modal.classList.remove('flex');
  document.body.style.overflow='';
  currentModalId=null;
}

function exportCSV(){
  const rows = filtered.map(p=>{
    const esc = s => `"${String(s).replace(/"/g,'""').replace(/\n/g,' ')}"`;
    return [esc(p.title), esc(p.category), esc(p.model), esc(p.difficulty), esc((p.tags||[]).join(', ')), esc(p.text)].join(',');
  }).join('\n');
  const header = '"Title","Category","Model","Difficulty","Tags","Prompt Text"\n';
  const blob = new Blob([header+rows], {type:'text/csv;charset=utf-8;'});
  const url = URL.createObjectURL(blob);
  const a=document.createElement('a');
  a.href=url; a.download=`promptflow-${new Date().toISOString().slice(0,10)}.csv`; a.click();
  URL.revokeObjectURL(url);
  toast('CSV exportado', '⬇️');
}

// IntersectionObserver for reveal
const io = {
  obs: null,
  observeAll(elsList){
    if(!this.obs){
      this.obs = new IntersectionObserver((entries)=>{
        entries.forEach(e=>{ if(e.isIntersecting) e.target.classList.add('in'); });
      }, {threshold:0.12});
    }
    elsList.forEach(el=> this.obs.observe(el));
  }
};

function animateCounters(){
  document.querySelectorAll('[data-count]').forEach(el=>{
    const target = Number(el.dataset.count);
    let cur=0;
    const step=Math.max(1, Math.round(target/40));
    const t=setInterval(()=>{
      cur+=step;
      if(cur>=target){ cur=target; clearInterval(t); }
      el.textContent=String(cur);
    }, 30);
  });
  if(els.statPrompts) els.statPrompts.textContent = String(PROMPTS.length);
}

function debounce(fn, ms=240){ let t; return (...a)=>{ clearTimeout(t); t=setTimeout(()=>fn(...a), ms); }; }

document.addEventListener('DOMContentLoaded', ()=>{
  initEls();
  updateFavUI();
  // hero counter
  animateCounters();
  // reveal observer for static sections
  document.querySelectorAll('.reveal').forEach(el=>{
    // initial in after mount staggered
    setTimeout(()=> el.classList.add('in'), 80);
  });
  // build UI
  buildCategoryChips();
  buildModelDropdown();
  buildTagCloud();
  applyFilters();

  // search
  els.search.addEventListener('input', debounce((e)=>{
    state.q = e.target.value.trim();
    visibleCount=pageSize;
    applyFilters();
  }, 220));
  els.clearSearch.addEventListener('click', ()=>{
    state.q=''; els.search.value=''; visibleCount=pageSize; applyFilters(); els.search.focus();
  });
  // difficulty & sort
  els.difficulty.addEventListener('change', (e)=>{ state.difficulty=e.target.value; visibleCount=pageSize; applyFilters(); });
  els.sort.addEventListener('change', (e)=>{ state.sort=e.target.value; applyFilters(); });
  // hidden model select sync
  els.modelFilter.addEventListener('change', (e)=>{ state.model=e.target.value; applyFilters(); });
  // dropdown toggle
  els.modelBtn.addEventListener('click', ()=> els.modelDropdown.classList.toggle('hidden'));
  document.addEventListener('click', (e)=>{
    if(!els.modelBtn.contains(e.target) && !els.modelDropdown.contains(e.target)) els.modelDropdown.classList.add('hidden');
  });
  // toolbar sort
  document.querySelectorAll('[data-sort]').forEach(b=>{
    b.addEventListener('click', ()=>{ state.sort=b.dataset.sort; if(els.sort) els.sort.value=state.sort; applyFilters(); });
  });
  // fav filter
  const favBtn = $('btn-fav-filter');
  favBtn.addEventListener('click', ()=>{
    state.favOnly = !state.favOnly;
    favBtn.textContent = state.favOnly ? '♥ Mostrando favoritos' : '♡ Solo favoritos';
    favBtn.className = state.favOnly ? 'px-4 py-3 rounded-xl bg-pink-500 text-white font-semibold text-sm' : 'px-4 py-3 rounded-xl border-2 border-slate-200 bg-white font-semibold text-sm hover:border-pink-300';
    visibleCount=pageSize;
    applyFilters();
  });
  // mobile fav same
  ['nav-fav','mobile-fav'].forEach(id=>{
    const el=$(id);
    if(el) el.addEventListener('click', (e)=>{ e.preventDefault(); state.favOnly=!state.favOnly; visibleCount=pageSize; applyFilters(); favBtn.textContent = state.favOnly ? '♥ Mostrando favoritos' : '♡ Solo favoritos'; });
  });
  // clear all
  $('btn-clear-all').addEventListener('click', clearAll);
  $('empty-clear').addEventListener('click', clearAll);
  // load more
  els.loadMore.addEventListener('click', ()=>{ visibleCount+=pageSize; renderPrompts(); updateResultsInfo(); });
  // export & random & hero copy
  $('btn-export').addEventListener('click', exportCSV);
  $('btn-random').addEventListener('click', ()=>{
    const r = PROMPTS[Math.floor(Math.random()*PROMPTS.length)];
    viewPrompt(r.id);
    toast('Prompt aleatorio', '🎲');
  });
  const hc=$('hero-copy');
  if(hc) hc.addEventListener('click', ()=> copyPrompt(5));
  // modal
  els.modalClose.addEventListener('click', closeModal);
  els.modalClose2.addEventListener('click', closeModal);
  els.modalBackdrop.addEventListener('click', closeModal);
  document.addEventListener('keydown', (e)=>{ if(e.key==='Escape') closeModal(); if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){ e.preventDefault(); els.search.focus(); } });
  els.modalCopy.addEventListener('click', async ()=>{
    if(!currentModalId) return;
    const p=PROMPTS.find(x=>x.id===currentModalId);
    try{ await navigator.clipboard.writeText(p.text); toast('Prompt copiado'); closeModal(); } catch{}
  });
  els.modalFav.addEventListener('click', ()=>{
    if(!currentModalId) return;
    toggleFav(String(currentModalId));
  });
  // keyboard hint: "/" to search
  document.addEventListener('keydown', (e)=>{
    if(e.key==='/' && document.activeElement.tagName!=='INPUT' && document.activeElement.tagName!=='TEXTAREA'){ e.preventDefault(); els.search.focus(); }
  });
});
