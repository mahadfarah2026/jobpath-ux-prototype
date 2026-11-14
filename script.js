
/* UED100 Assessment 2 — Test data and accessible UI interactions.
   This prototype has no backend, tracking or account authentication. */
'use strict';
const jobs = [
{id:1,title:'Registered Nurse – Acute Care',company:'Northside Health',initials:'NH',location:'Melbourne VIC',type:'Part-time',mode:'On-site',category:'Healthcare',salary:96000,age:1,description:'Support a collaborative acute care team with flexible rosters and professional development.'},
{id:2,title:'IT Service Desk Analyst',company:'BrightWave Technology',initials:'BT',location:'Melbourne VIC',type:'Full-time',mode:'Hybrid',category:'Technology',salary:78000,age:2,description:'Resolve technical requests, support Microsoft 365 users and develop your IT career.'},
{id:3,title:'UX/UI Designer',company:'Studio North',initials:'SN',location:'Richmond VIC',type:'Contract',mode:'Hybrid',category:'Design',salary:118000,age:3,description:'Design accessible digital experiences and test interactive prototypes with users.'},
{id:4,title:'Administration Coordinator',company:'Harbour Community',initials:'HC',location:'Reservoir VIC',type:'Part-time',mode:'On-site',category:'Administration',salary:68000,age:4,description:'Coordinate community services, appointments and office operations.'},
{id:5,title:'Cloud Support Associate',company:'Nexa Systems',initials:'NS',location:'Melbourne VIC',type:'Full-time',mode:'Remote',category:'Technology',salary:92000,age:1,description:'Assist customers with cloud platforms, troubleshooting and service reliability.'},
{id:6,title:'Disability Support Worker',company:'CareLink Services',initials:'CS',location:'Preston VIC',type:'Casual',mode:'On-site',category:'Healthcare',salary:75000,age:5,description:'Provide person-centred support and help participants reach everyday goals.'},
{id:7,title:'Senior Product Designer',company:'OpenField Digital',initials:'OD',location:'Sydney NSW',type:'Full-time',mode:'Remote',category:'Design',salary:145000,age:2,description:'Lead research-informed interface design across web and mobile products.'},
{id:8,title:'Customer Support Specialist',company:'GoodWork Group',initials:'GG',location:'Melbourne VIC',type:'Full-time',mode:'Hybrid',category:'Administration',salary:72000,age:6,description:'Help customers solve problems through clear communication and digital tools.'}
];
const $ = id => document.getElementById(id);
const state = {keyword:'',location:'',salary:0,types:new Set(),modes:new Set(),categories:new Set(),saved:new Set(),compared:new Set(),sort:'relevant'};
/* Format fictional annual salaries consistently for Australian readers. */
const money = value => '$'+value.toLocaleString('en-AU');
/* Escape dynamic strings before inserting them into HTML templates. */
const escapeHTML = value => String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
/** Match common job-search synonyms without changing the user's entered text.
 *  This small, explicit dictionary keeps the prototype easy to explain. */
function searchTerms(keyword) {
 const term = keyword.toLowerCase().trim();
 const synonyms = { nursing: ['nurse', 'nursing'], nurse: ['nurse', 'nursing'],
   'it support': ['it support', 'service desk', 'technical support', 'cloud support'],
   'ux design': ['ux', 'ui designer', 'product designer', 'user experience'] };
 return synonyms[term] || (term ? [term] : []);
}
/** Return listings matching keyword, location, salary, selected filters and sorting. */
function filteredJobs(){
 const terms=searchTerms(state.keyword), place=state.location.toLowerCase().trim();
 const result=jobs.filter(j=>(!terms.length||[j.title,j.company,j.category,j.description].some(x=>terms.some(term=>x.toLowerCase().includes(term))))&&(!place||j.location.toLowerCase().includes(place))&&j.salary>=state.salary&&(!state.types.size||state.types.has(j.type))&&(!state.modes.size||state.modes.has(j.mode))&&(!state.categories.size||state.categories.has(j.category)));
 if(state.sort==='salary')result.sort((a,b)=>b.salary-a.salary);
 if(state.sort==='newest')result.sort((a,b)=>a.age-b.age);
 return result;
}
/** Announce important changes without forcing screen-reader users to reread cards. */
function announce(message) { $('actionStatus').textContent = ''; requestAnimationFrame(() => { $('actionStatus').textContent = message; }); }
/** Move focus to the matching action after a job card is re-rendered. */
function restoreCardFocus(attribute, id) {
 const button = document.querySelector(`[${attribute}="${id}"]`);
 if (button) button.focus({preventScroll:true});
}
/** Update the results list with escaped, semantic article cards. */
function renderJobs(){
 const result=filteredJobs();$('resultCount').textContent=`${result.length} ${result.length===1?'job':'jobs'} found`;
 $('emptyState').hidden=result.length>0;
 $('jobList').innerHTML=result.map(j=>`<article class="job-card" aria-labelledby="job-${j.id}"><div class="job-top"><div class="company-icon" aria-hidden="true">${j.initials}</div><div class="job-main"><h3 id="job-${j.id}">${escapeHTML(j.title)}</h3><div class="company-name">${escapeHTML(j.company)}</div></div><button type="button" class="save-button" data-save="${j.id}" aria-pressed="${state.saved.has(j.id)}" aria-label="${state.saved.has(j.id)?'Remove saved':'Save'} ${escapeHTML(j.title)}">${state.saved.has(j.id)?'♥':'♡'}</button></div><div class="job-meta"><span class="pill salary-pill">${money(j.salary)} / year</span><span class="pill">${escapeHTML(j.type)}</span><span class="pill">${escapeHTML(j.location)}</span><span class="pill">${escapeHTML(j.mode)}</span></div><p class="job-description">${escapeHTML(j.description)}</p><div class="job-bottom"><span class="posted">Posted ${j.age} ${j.age===1?'day':'days'} ago · Demo listing</span><div class="job-actions"><button class="small-button details-button" data-details="${j.id}">View details</button><button type="button" class="small-button" data-compare="${j.id}" aria-pressed="${state.compared.has(j.id)}">${state.compared.has(j.id)?'✓ Selected':'+ Compare'}</button></div></div></article>`).join('');
 renderSaved();renderCompareBar();
}
/** Render session-only saved jobs and the navigation count. */
function renderSaved(){
 $('savedCount').textContent=state.saved.size;
 $('savedSummary').textContent=state.saved.size?`${state.saved.size} ${state.saved.size===1?'job':'jobs'} saved in this session. Your selections are not stored after you leave.`:'Save jobs to review them later. Selections last only while this page is open.';
 $('savedList').innerHTML=[...state.saved].map(id=>jobs.find(j=>j.id===id)).filter(Boolean).map(j=>`<div class="saved-item"><strong>${escapeHTML(j.title)}</strong><span>${escapeHTML(j.company)} · ${money(j.salary)} / year</span><div><button type="button" class="small-button" data-save="${j.id}">Remove saved job</button></div></div>`).join('');
}
/** Show the compare tray only when at least one job is selected. */
function renderCompareBar(){
 const n=state.compared.size;$('compareBar').hidden=n===0;$('compareSummary').textContent=`${n} of 2 jobs selected`;$('openCompare').disabled=n!==2;
}
/** Build a two-column comparison table for the modal. */
function renderComparison(){
 const selected=[...state.compared].map(id=>jobs.find(j=>j.id===id));
 const rows=[['Job title','title'],['Employer','company'],['Annual salary','salary'],['Employment type','type'],['Location','location'],['Work arrangement','mode'],['Category','category'],['Summary','description']];
 $('comparisonContent').innerHTML=`<table class="comparison-table"><caption class="sr-only">Comparison of two selected jobs</caption><thead><tr><th scope="col">Criteria</th>${selected.map(j=>`<th scope="col">${escapeHTML(j.title)}</th>`).join('')}</tr></thead><tbody>${rows.map(([label,key])=>`<tr><th scope="row">${label}</th>${selected.map(j=>`<td>${escapeHTML(key==='salary'?money(j.salary):j[key])}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
}
/** Clear search and filters while preserving saved jobs. */
function resetFilters(){
 state.keyword='';state.location='';state.salary=0;state.types.clear();state.modes.clear();state.categories.clear();
 $('keyword').value='';$('location').value='';$('salary').value='0';$('salaryValue').textContent='Any salary';
 document.querySelectorAll('.filters input[type="checkbox"]').forEach(x=>x.checked=false);renderJobs();announce('Filters cleared. '+filteredJobs().length+' jobs available.');
}
/** Validate the search form and announce matching results. */
$('searchForm').addEventListener('submit',e=>{
 e.preventDefault();
 const keyword=$('keyword').value.trim(), location=$('location').value.trim();
 const feedback=$('searchFeedback');
 if(!keyword && !location && !state.types.size && !state.modes.size && !state.categories.size && !state.salary){
   feedback.textContent='Enter a job title or location, or choose a filter to start your search.';
   feedback.hidden=false; $('keyword').focus(); return;
 }
 feedback.hidden=true; state.keyword=keyword; state.location=location;
 renderJobs(); announce(filteredJobs().length+' matching jobs found.');
 $('results').scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
});
$('keyword').addEventListener('input',e=>{$('searchFeedback').hidden=true;state.keyword=e.target.value;renderJobs();});
$('location').addEventListener('input',e=>{$('searchFeedback').hidden=true;state.location=e.target.value;renderJobs();});
$('salary').addEventListener('input',e=>{state.salary=Number(e.target.value);$('salaryValue').textContent=state.salary?money(state.salary):'Any salary';renderJobs();});
document.querySelectorAll('.filters input[type="checkbox"]').forEach(input=>input.addEventListener('change',e=>{const group=e.target.name==='type'?state.types:e.target.name==='mode'?state.modes:state.categories;e.target.checked?group.add(e.target.value):group.delete(e.target.value);renderJobs();}));
$('sort').addEventListener('change',e=>{state.sort=e.target.value;renderJobs();});
$('clearFilters').addEventListener('click',resetFilters);$('emptyReset').addEventListener('click',resetFilters);
document.addEventListener('click',e=>{
 const details=e.target.closest('[data-details]');if(details){showDetails(Number(details.dataset.details));return;}
 const save=e.target.closest('[data-save]');if(save){const id=Number(save.dataset.save);state.saved.has(id)?state.saved.delete(id):state.saved.add(id);renderJobs();restoreCardFocus('data-save',id);announce((state.saved.has(id)?'Saved ':'Removed saved ')+jobs.find(j=>j.id===id).title);return;}
 const compare=e.target.closest('[data-compare]');if(compare){const id=Number(compare.dataset.compare);if(state.compared.has(id))state.compared.delete(id);else if(state.compared.size<2)state.compared.add(id);else{const oldest=state.compared.values().next().value;state.compared.delete(oldest);state.compared.add(id);}renderJobs();restoreCardFocus('data-compare',id);announce(state.compared.size+' of 2 jobs selected for comparison.');}
});
$('clearCompare').addEventListener('click',()=>{state.compared.clear();renderJobs();});
$('openCompare').addEventListener('click',()=>{if(state.compared.size!==2)return;renderComparison();$('compareDialog').showModal();$('closeCompare').focus();});
$('closeCompare').addEventListener('click',()=>$('compareDialog').close());$('dialogDone').addEventListener('click',()=>$('compareDialog').close());
$('compareDialog').addEventListener('click',e=>{if(e.target===$('compareDialog'))$('compareDialog').close();});
$('filterToggle').addEventListener('click',()=>{const open=$('filters').classList.toggle('open');$('filterToggle').setAttribute('aria-expanded',String(open));});
$('menuToggle').addEventListener('click',()=>{const open=$('mainNav').classList.toggle('open');$('menuToggle').setAttribute('aria-expanded',String(open));});
$('mainNav').addEventListener('click',e=>{if(e.target.closest('a')){$('mainNav').classList.remove('open');$('menuToggle').setAttribute('aria-expanded','false');}});
renderJobs();



/** Open a semantic, keyboard-accessible role details dialog for one fictional listing. */
function showDetails(id) {
  const job = jobs.find(item => item.id === id);
  if (!job) return;
  $('detailsTitle').textContent = job.title;
  $('detailsContent').innerHTML = `
    <p class="details-company">${escapeHTML(job.company)} · ${escapeHTML(job.location)}</p>
    <div class="details-tags"><span>${money(job.salary)} / year</span><span>${escapeHTML(job.type)}</span><span>${escapeHTML(job.mode)}</span></div>
    <h3>About the opportunity</h3><p>${escapeHTML(job.description)}</p>
    <h3>What matters to you</h3><p>Compare the salary, employment type and work arrangement with other roles before making a decision.</p>
    <p class="demo-notice">Demonstration listing only. Applications are not accepted in this educational prototype.</p>`;
  $('detailsDialog').showModal();$('closeDetails').focus();
}

/** Close the details modal using either accessible close control. */
$('closeDetails').addEventListener('click', () => $('detailsDialog').close());
$('detailsDone').addEventListener('click', () => $('detailsDialog').close());
$('detailsDialog').addEventListener('click', event => {
  if (event.target === $('detailsDialog')) $('detailsDialog').close();
});

/** Apply a popular-search suggestion using native button controls. */
document.querySelectorAll('[data-suggestion]').forEach(button => {
  button.addEventListener('click', () => {
    const suggestion = button.dataset.suggestion;
    if (suggestion === 'Remote work') {
      state.keyword = '';
      $('keyword').value = '';
      state.modes.clear();
      state.modes.add('Remote');
      document.querySelectorAll('input[name="mode"]').forEach(input => {
        input.checked = input.value === 'Remote';
      });
    } else {
      state.keyword = suggestion;
      $('keyword').value = suggestion;
    }
    renderJobs();
    $('results').scrollIntoView({behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'});
  });
});

/** Keep the user's place when opening and closing native modal dialogs. */
let lastDialogTrigger = null;
document.addEventListener('click', event => {
  const trigger = event.target.closest('[data-details], #openCompare');
  if (trigger) lastDialogTrigger = trigger;
}, true);
['detailsDialog','compareDialog'].forEach(id => {
  $(id).addEventListener('close', () => {
    if (lastDialogTrigger && lastDialogTrigger.isConnected) lastDialogTrigger.focus();
    else { $('results').setAttribute('tabindex','-1'); $('results').focus(); }
  });
});
