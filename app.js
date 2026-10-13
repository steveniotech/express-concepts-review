'use strict';
(function(root){
 const modules=(typeof module!=='undefined'&&module.exports)?require('./lessons.js').modules:root.ReviewLessons.modules;
 const KEY='express-concepts-review:v1';
 const copy=value=>JSON.parse(JSON.stringify(value));
 const findModule=id=>modules.find(m=>m.id===id);
 function fresh(){return {version:1,currentModule:null,records:{},completedModules:[],stars:0,badges:[],latestActivityDate:null,run:null};}
 function rec(state,id){if(!state.records[id])state.records[id]={selectedIndex:null,firstAttemptCorrect:null,finalCorrect:false,attempts:0,attemptsToFirstCorrect:0,hintUsed:false,wrongAnswers:[]};return state.records[id];}
 function syncRewards(state){state.completedModules=modules.filter(m=>state.completedModules.includes(m.id)).map(m=>m.id);state.stars=state.completedModules.length*5;state.badges=modules.filter(m=>state.completedModules.includes(m.id)).map(m=>m.badge);}
 function normalize(raw){
  const state=fresh();if(!raw||raw.version!==1)return state;
  const validDate=v=>typeof v==='string'&&Number.isFinite(Date.parse(v));
  for(const m of modules)for(const q of m.questions){
   const r=raw.records?.[q.id];if(!r||typeof r!=='object')continue;
   const safe=rec(state,q.id);safe.attempts=Number.isSafeInteger(r.attempts)?Math.max(0,r.attempts):0;
   safe.selectedIndex=Number.isInteger(r.selectedIndex)&&r.selectedIndex>=0&&r.selectedIndex<4?r.selectedIndex:null;
   safe.firstAttemptCorrect=safe.attempts>0?(r.firstAttemptCorrect===true):null;
   safe.finalCorrect=safe.attempts>0&&r.finalCorrect===true;safe.attemptsToFirstCorrect=Number.isSafeInteger(r.attemptsToFirstCorrect)?Math.max(0,Math.min(safe.attempts,r.attemptsToFirstCorrect)):safe.attempts;safe.hintUsed=r.hintUsed===true;
   safe.wrongAnswers=Array.isArray(r.wrongAnswers)?[...new Set(r.wrongAnswers.filter(i=>Number.isInteger(i)&&i>=0&&i<4&&i!==q.correctIndex))]:[];
  }
  state.completedModules=modules.filter(m=>Array.isArray(raw.completedModules)&&raw.completedModules.includes(m.id)&&m.questions.every(q=>state.records[q.id]?.finalCorrect)).map(m=>m.id);
  state.currentModule=findModule(raw.currentModule)?raw.currentModule:null;
  state.latestActivityDate=validDate(raw.latestActivityDate)?raw.latestActivityDate:null;
  const run=raw.run,m=findModule(run?.moduleId);
  if(m&&Array.isArray(run.questionIds)&&run.questionIds.length&&new Set(run.questionIds).size===run.questionIds.length&&run.questionIds.every(id=>m.questions.some(q=>q.id===id))){
   const ids=run.questionIds;
   state.run={moduleId:m.id,questionIds:ids.slice(),index:Number.isInteger(run.index)?Math.max(0,Math.min(ids.length-1,run.index)):0,mode:run.mode==='missed'?'missed':'full',phase:['intro','question','complete'].includes(run.phase)?run.phase:'intro',responses:{},newBadge:run.newBadge===true};
   for(const id of ids){
    const r=run.responses?.[id];if(!r)continue;
    state.run.responses[id]={selected:Number.isInteger(r.selected)&&r.selected>=0&&r.selected<4?r.selected:null,status:['correct','wrong','ready'].includes(r.status)?r.status:'ready',attempts:Number.isSafeInteger(r.attempts)?Math.max(0,r.attempts):0,firstCorrect:typeof r.firstCorrect==='boolean'?r.firstCorrect:null,hintShown:r.hintShown===true};
    const q=m.questions.find(q=>q.id===id);const response=state.run.responses[id];
    if(response.status==='correct'&&(response.selected!==q.correctIndex||!state.records[id]?.finalCorrect))response.status='ready';
   }
   if(state.run.phase==='complete'&&!ids.every(id=>state.run.responses[id]?.status==='correct'))state.run.phase='question';
  }
  syncRewards(state);return state;
 }
 function activity(state){state.latestActivityDate=new Date().toISOString();}
 function begin(state,moduleId,mode='full',ids=null){
  const m=findModule(moduleId);if(!m)throw new Error('Unknown module');
  const questionIds=ids||m.questions.map(q=>q.id);
  if(!questionIds.length)return false;
  rec(state,questionIds[0]);state.currentModule=moduleId;state.run={moduleId,questionIds:questionIds.slice(),mode,phase:'intro',index:0,responses:{},newBadge:false};activity(state);return true;
 }
 function response(state){const run=state.run,id=run.questionIds[run.index];return run.responses[id]||(run.responses[id]={selected:null,status:'ready',attempts:0,firstCorrect:null,hintShown:false});}
 function select(state,index){const r=response(state);if(r.status!=='ready'||!Number.isInteger(index)||index<0||index>3)return false;r.selected=index;rec(state,state.run.questionIds[state.run.index]).selectedIndex=index;activity(state);return true;}
 function check(state){
  const run=state.run,r=response(state);if(r.status!=='ready'||r.selected===null)return null;
  const q=findModule(run.moduleId).questions.find(q=>q.id===run.questionIds[run.index]),record=rec(state,q.id),correct=r.selected===q.correctIndex;
  record.attempts++;if(!record.finalCorrect)record.attemptsToFirstCorrect++;if(record.firstAttemptCorrect===null)record.firstAttemptCorrect=correct;record.selectedIndex=r.selected;
  record.finalCorrect=record.finalCorrect||correct;if(!correct&&!record.wrongAnswers.includes(r.selected))record.wrongAnswers.push(r.selected);
  r.attempts++;if(r.firstCorrect===null)r.firstCorrect=correct;r.status=correct?'correct':'wrong';activity(state);return correct;
 }
 function retry(state){const r=response(state);if(r.status!=='wrong')return false;r.status='ready';r.selected=null;activity(state);return true;}
 function hint(state){const r=response(state);if(r.hintShown)return false;r.hintShown=true;rec(state,state.run.questionIds[state.run.index]).hintUsed=true;activity(state);return true;}
 function award(state,id){const m=findModule(id);if(!m||!m.questions.every(q=>state.records[q.id]?.finalCorrect))return false;if(state.completedModules.includes(id))return false;state.completedModules.push(id);syncRewards(state);return true;}
 function next(state){
  const run=state.run;if(response(state).status!=='correct')return false;
  if(run.index<run.questionIds.length-1)run.index++;else{run.phase='complete';run.newBadge=award(state,run.moduleId);}
  activity(state);return true;
 }
 function moduleStats(state,m){
  const records=m.questions.map(q=>state.records[q.id]).filter(Boolean),attempted=records.filter(r=>r.attempts>0),first=attempted.filter(r=>r.firstAttemptCorrect).length;
  const multi=attempted.filter(r=>r.attemptsToFirstCorrect>1).length;
  return {attempted:attempted.length,first,firstRate:attempted.length?first/attempted.length:null,final:records.filter(r=>r.finalCorrect).length,total:m.questions.length,attempts:records.reduce((n,r)=>n+r.attempts,0),hints:records.filter(r=>r.hintUsed).length,multi,needsReview:attempted.length>0&&(first/attempted.length<.7||multi>=2),status:state.completedModules.includes(m.id)?'complete':records.length>0?'progress':'new'};
 }
 function summary(state){const all=modules.map(m=>moduleStats(state,m)),attempted=all.reduce((n,s)=>n+s.attempted,0),first=all.reduce((n,s)=>n+s.first,0);return {completed:state.completedModules.length,stars:state.completedModules.length*5,badges:modules.filter(m=>state.completedModules.includes(m.id)).map(m=>m.badge),firstRate:attempted?first/attempted:null,attempts:all.reduce((n,s)=>n+s.attempts,0),hints:all.reduce((n,s)=>n+s.hints,0),latest:state.latestActivityDate};}
 function exportJSON(state){return JSON.stringify(state,null,2);}
 function resetStorage(storage){const state=fresh();storage.setItem(KEY,exportJSON(state));return state;}
 const Core={KEY,modules,fresh,normalize,rec,begin,response,select,check,retry,hint,award,next,moduleStats,summary,exportJSON,resetStorage,syncRewards};root.ReviewCore=Core;
 if(typeof module!=='undefined'&&module.exports){module.exports=Core;return;}
 const main=document.getElementById('main'),storageNotice=document.getElementById('storage-notice');
 let state=fresh(),storageOK=true,preview=false,previewState=null,teacher=false;
 try{const raw=localStorage.getItem(KEY);if(raw)state=normalize(JSON.parse(raw));}catch{storageOK=false;}
 const current=()=>preview?previewState:state;
 const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const button=(label,action,cls='primary',extra='')=>`<button class="${cls}" data-action="${action}" ${extra}>${label}</button>`;
 function notice(){storageNotice.hidden=storageOK||preview||teacher;storageNotice.textContent='Your progress could not be saved. Keep this page open, or use Teacher View to export your work.';}
 function save(){if(preview)return;try{syncRewards(state);localStorage.setItem(KEY,exportJSON(state));storageOK=true;}catch{storageOK=false;}notice();}
 function frame(html,focus=true){main.innerHTML=html;notice();if(focus){const heading=main.querySelector('h1');if(heading){heading.tabIndex=-1;heading.focus();}}}
 function setLanguage(zh){teacher=zh;document.documentElement.lang=zh?'zh-CN':'en';document.getElementById('home-button').textContent=zh?'返回学生首页':'All Lessons';document.getElementById('help-button').textContent=zh?'使用帮助':'About & Help';document.querySelector('.brand').setAttribute('aria-label',zh?'概念复习首页':'Express Concepts Review home');document.querySelector('.brand').innerHTML=zh?'<span class="brand-icon" aria-hidden="true">✳</span><span>概念复习<small>教师查看</small></span>':'<span class="brand-icon" aria-hidden="true">✳</span><span>Express Concepts<small>REVIEW CLUB</small></span>';document.querySelector('nav').setAttribute('aria-label',zh?'主要导航':'Main navigation');document.querySelector('.skip').textContent=zh?'跳到主要内容':'Skip to practice';document.getElementById('footer').hidden=zh;notice();}
 function home(){
  preview=false;previewState=null;setLanguage(false);if(location.hash)history.replaceState(null,'',location.pathname+location.search);const s=summary(state);
  frame(`<section class="hero"><div><p class="eyebrow">YOUR AFTER-CLASS ADVENTURE</p><h1>Express Concepts<br><span>Review</span></h1><p class="subtitle">Practice the coding ideas you learned. Choose a lesson, think carefully, and grow your skills!</p><p class="hero-note">${modules.length} topics · ${modules.reduce((n,m)=>n+m.questions.length,0)} little challenges · Your own pace</p></div><div class="hero-art" aria-hidden="true"><div class="orbit">✦</div><div class="art-block first">WHEN curious</div><div class="art-block second">THINK carefully</div><div class="art-block third">GROW your skills 🌱</div><span class="art-dot">+</span></div></section><section class="summary" aria-label="Your progress"><div><strong>★ ${s.stars}<small> / ${modules.length*5}</small></strong><span>Stars earned</span></div><div><strong>✦ ${s.badges.length}</strong><span>Badges earned</span></div><div><strong>${s.completed}<small> / ${modules.length}</small></strong><span>Modules completed</span></div></section>${state.run?`<div class="resume card"><p><strong>Pick up where you left off.</strong> ${esc(findModule(state.run.moduleId).title)}</p>${button('Continue Practice','resume')}</div>`:''}<div class="section-heading"><div><p class="eyebrow">CHOOSE YOUR NEXT IDEA</p><h2>Your lesson map</h2></div><p>Every lesson is ready to explore.</p></div><section class="module-grid" aria-label="Choose a review module">${modules.map((m,i)=>{const t=moduleStats(state,m),status={new:'Not started',progress:'In progress',complete:'Complete'}[t.status];return `<button class="module-card ${t.status}" data-action="module" data-module="${m.id}"><span class="card-top"><span class="module-icon" aria-hidden="true">${m.icon}</span><span class="module-number">${String(i+1).padStart(2,'0')}</span></span><span class="lesson-label">Lesson${m.lessons.includes('–')?'s':''} ${m.lessons}</span><strong>${esc(m.title)}</strong><span class="card-bottom"><span>${m.questions.length} questions</span><span class="status">${t.status==='complete'?'✓ ':''}${status}</span></span></button>`;}).join('')}</section><section class="badge-area"><h2>Your idea badges</h2>${s.badges.length?`<div class="badge-grid">${modules.filter(m=>state.completedModules.includes(m.id)).map(m=>`<span class="badge"><span aria-hidden="true">${m.icon}</span> ${esc(m.badge)}</span>`).join('')}</div>`:'<p>Finish a lesson to earn your first badge. You can start anywhere!</p>'}</section>`);
 }
 function previewBanner(){return preview?`<div class="preview-banner"><strong>Teacher preview</strong> · Practice without saving or earning stars. ${button('Return to Teacher View','teacher','quiet')}</div>`:'';}
 function renderRun(focus=true){
  setLanguage(false);const s=current(),run=s.run;if(!run)return home();const m=findModule(run.moduleId),r=response(s),q=m.questions.find(q=>q.id===run.questionIds[run.index]);
  const top=previewBanner()+`<div class="practice-top">${button('← All Lessons','home','quiet')}<span>Lesson${m.lessons.includes('–')?'s':''} ${m.lessons} · ${esc(m.title)}</span></div>`;
  if(run.phase==='intro'){
   frame(top+`<section class="practice-card intro"><span class="large-icon" aria-hidden="true">${m.icon}</span><p class="eyebrow">BEFORE YOU BEGIN</p><h1>Quick Review</h1><h2>${esc(m.title)}</h2><ul class="review-list">${m.quickReview.map(t=>`<li>${esc(t)}</li>`).join('')}</ul><p>${run.questionIds.length} questions. Take your time. Hints are here to help.</p>${button(run.mode==='missed'?'Start Review':'Let’s Practice','start')}</section>`,focus);return;
  }
  if(run.phase==='complete'){
   const responses=run.questionIds.map(id=>run.responses[id]),first=responses.filter(r=>r.firstCorrect===true).length,attempts=responses.reduce((n,r)=>n+r.attempts,0),missed=run.questionIds.filter(id=>run.responses[id]?.firstCorrect===false);
   frame(top+`<section class="practice-card completion"><span class="large-icon" aria-hidden="true">${m.icon}</span><p class="eyebrow">LOOK HOW YOUR IDEAS GREW</p><h1>Great thinking!</h1><p>You finished ${esc(m.title)}. Every question is correct now.</p><div class="result-stats"><div><strong>${first} / ${run.questionIds.length}</strong><span>First-try correct this round</span></div><div><strong>${attempts}</strong><span>Total attempts this round</span></div></div>${preview?'<p>Preview complete. No saved progress or rewards changed.</p>':run.newBadge?`<div class="earned-badge">★ +5 stars · New badge<br><strong>${m.icon} ${esc(m.badge)}</strong></div>`:'<p>Your practice counts. This lesson’s badge and stars are already earned.</p>'}<div class="actions">${button('Review Missed Questions','missed','primary',missed.length?'':'disabled')}${button('Back to Lessons','home','quiet')}${button('Try This Lesson Again','again','quiet')}</div>${missed.length?'':'<p class="small">No missed questions in this round. Nice careful thinking!</p>'}</section>`,focus);return;
  }
  const checked=r.status!=='ready';
  frame(top+`<section class="practice-card question-card"><div class="question-meta"><span>Question ${run.index+1} of ${run.questionIds.length}</span><span>${m.icon} ${esc(m.badge)}</span></div><progress max="${run.questionIds.length}" value="${run.index}" aria-label="Questions finished"></progress><h1>${esc(q.prompt)}</h1>${q.code?`<pre class="code-card" aria-label="Program instructions"><code>${esc(q.code)}</code></pre>`:''}<fieldset class="choices"><legend class="sr-only">Choose one answer</legend>${q.options.map((option,i)=>`<button class="choice ${r.selected===i?'selected':''} ${checked&&r.selected===i?r.status:''}" data-action="select" data-index="${i}" aria-pressed="${r.selected===i}" ${checked?'disabled':''}><span class="choice-letter" aria-hidden="true">${'ABCD'[i]}</span><span>${esc(option)}</span>${checked&&r.selected===i?`<span class="answer-mark">${r.status==='correct'?'✓ Correct':'↻ Try again'}</span>`:''}</button>`).join('')}</fieldset><div id="feedback" class="feedback ${checked?r.status:''}" role="status" aria-live="polite" aria-atomic="true">${r.status==='correct'?`<strong>✓ You’ve got it!</strong><p>${esc(q.explanation)}</p>`:r.status==='wrong'?`<strong>↻ Not quite yet. You can work it out!</strong><p>${esc(q.explanation)}</p>`:''}</div>${r.hintShown?`<aside class="hint"><strong>A little hint</strong><p>${esc(q.hint)}</p></aside>`:''}<div class="actions">${!checked?button('Check Answer','check','primary',r.selected===null?'disabled':''):r.status==='correct'?button(run.index===run.questionIds.length-1?'Finish Lesson':'Next Question','next'):button('Try Again','retry')}${r.status!=='correct'?button('Read Hint','hint','quiet',r.hintShown?'disabled':''):''}</div><p class="small">Hints and retries never take away stars.</p></section>`,focus);
  if(checked&&!focus){const feedback=document.getElementById('feedback');feedback.tabIndex=-1;feedback.focus();}
 }
 function help(){
  if(teacher){root.ReviewTeacher.help();return;}
  frame(`<section class="practice-card"><p class="eyebrow">A LITTLE HELP</p><h1>Practice at your pace</h1><p>Choose any lesson. Read the quick review, choose an answer, then press Check Answer. A wrong answer is a chance to learn. Read a hint and try again.</p><p>Finish every question in a lesson to earn 5 stars and a badge. Repeating a lesson does not add more stars.</p><h2>Your work stays in this browser on this device.</h2><p>Shared devices may keep progress until it is reset. Different browsers, devices, domains, and localhost ports may have separate saved progress.</p><p>No names, accounts, uploads, or tracking. Teacher View can export progress. Version 1 cannot import a saved file.</p><p>This is original, independent practice inspired by the Express Course (2025) progression. It is not made by or affiliated with Code.org.</p>${button('Back to Lessons','home')}</section>`);
 }
 function showTeacher(){preview=false;previewState=null;setLanguage(true);if(location.hash!=='#teacher')location.hash='teacher';root.ReviewTeacher.render();}
 function action(event){
  const target=event.target.closest('[data-action]');if(!target||target.disabled)return;const a=target.dataset.action;
  if(a==='home'){home();return;}if(a==='teacher'){showTeacher();return;}
  const s=current();
  if(a==='module'){begin(s,target.dataset.module);save();renderRun();}
  else if(a==='resume')renderRun();
  else if(a==='start'){s.run.phase='question';activity(s);save();renderRun();}
  else if(a==='select'){select(s,Number(target.dataset.index));save();renderRun(false);main.querySelector(`[data-action="select"][data-index="${target.dataset.index}"]`).focus();}
  else if(a==='check'){check(s);save();renderRun(false);}
  else if(a==='retry'){retry(s);save();renderRun();}
  else if(a==='hint'){hint(s);save();renderRun(false);const h=main.querySelector('.hint');h.tabIndex=-1;h.focus();}
  else if(a==='next'){next(s);save();renderRun();}
  else if(a==='again'){begin(s,s.run.moduleId);save();renderRun();}
  else if(a==='missed'){const ids=s.run.questionIds.filter(id=>s.run.responses[id]?.firstCorrect===false);begin(s,s.run.moduleId,'missed',ids);save();renderRun();}
 }
 main.addEventListener('click',action);
 document.querySelector('.brand').addEventListener('click',event=>{event.preventDefault();home();});
 document.getElementById('home-button').onclick=home;document.getElementById('help-button').onclick=help;
 window.addEventListener('hashchange',()=>location.hash==='#teacher'?showTeacher():home());
 root.ReviewApp={getState:()=>state,esc,button,frame,showTeacher,save,home,setLanguage,storageWorks:()=>storageOK,startPreview(id){previewState=copy(state);preview=true;begin(previewState,id);renderRun();},reset(){try{state=resetStorage(localStorage);storageOK=true;}catch{state=fresh();storageOK=false;}showTeacher();},init(){if(location.hash==='#teacher')showTeacher();else if(state.run)renderRun();else home();}};
})(typeof globalThis!=='undefined'?globalThis:this);
