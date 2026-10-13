'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {modules}=require('./lessons.js'),C=require('./app.js');
const chinese=/[\u3400-\u9fff]/;
assert.equal(modules.length,16);
const expected=[6,6,8,8,6,8,8,8,6,8,10,8,6,10,8,10];
const all=modules.flatMap(m=>m.questions);assert.equal(all.length,124);assert.equal(new Set(all.map(q=>q.id)).size,124);
const prompts=new Set(),answerPositions=[0,0,0,0];
for(const [i,m] of modules.entries()){
 assert.equal(m.questions.length,expected[i]);assert.ok(m.lessons&&m.badge&&m.teacherTitle&&m.summaryZh&&m.misconceptionsZh.length);
 assert.ok(chinese.test(m.summaryZh));assert.ok(m.quickReview.length>=2&&m.quickReview.length<=4);
 for(const field of [m.title,m.badge,m.lessons,...m.quickReview])assert.ok(field.trim()&&!chinese.test(field),'English module fields');
 for(const q of m.questions){
  assert.equal(q.options.length,4);assert.equal(new Set(q.options).size,4);assert.ok(Number.isInteger(q.correctIndex)&&q.correctIndex>=0&&q.correctIndex<4);answerPositions[q.correctIndex]++;
  for(const value of [q.prompt,q.explanation,q.hint,...q.options])assert.ok(value.trim()&&!chinese.test(value),'English question fields: '+q.id);
  assert.ok(!chinese.test(q.code));assert.ok(q.teacherNoteZh.trim()&&chinese.test(q.teacherNoteZh));
  assert.ok(!prompts.has(m.id+'|'+q.prompt+'|'+q.code),'No repeated prompts in a module');prompts.add(m.id+'|'+q.prompt+'|'+q.code);
  assert.ok(!/lorem ipsum|\bTODO\b|placeholder/i.test(q.prompt));
 }
}
assert.ok(answerPositions.every(n=>n>=25),'Answers not always in same position');
console.log('Curriculum passed: 16 modules, 124 original entries, exact per-module counts, four choices, unique IDs, English student fields and Chinese teacher notes.');
function complete(state,m){
 C.begin(state,m.id);state.run.phase='question';
 for(const q of m.questions){C.select(state,q.correctIndex);assert.equal(C.check(state),true);assert.equal(C.check(state),null,'Cannot count a checked answer twice');C.next(state);}
 assert.equal(state.run.phase,'complete');
}
let state=C.fresh();for(const m of modules)complete(state,m);
assert.equal(state.stars,modules.length*5);assert.equal(state.badges.length,modules.length);assert.equal(C.summary(state).firstRate,1);
const before=state.stars;complete(state,modules[0]);assert.equal(state.stars,before);assert.equal(state.run.newBadge,false);assert.equal(C.moduleStats(state,modules[0]).needsReview,false,'Correct replay does not create retry mistakes');
assert.equal(C.award(C.fresh(),modules[0].id),false,'Cannot award incomplete module');
assert.deepEqual(C.normalize(JSON.parse(C.exportJSON(state))),state,'Export and restore preserve validated state');
assert.doesNotThrow(()=>JSON.parse(C.exportJSON(state)));
state=C.fresh();const m=modules[0],q=m.questions[0];C.begin(state,m.id);state.run.phase='question';
assert.equal(C.check(state),null);assert.equal(C.rec(state,q.id).attempts,0);
C.select(state,(q.correctIndex+1)%4);assert.equal(C.rec(state,q.id).attempts,0,'Selection alone does not check');
let restored=C.normalize(JSON.parse(C.exportJSON(state)));assert.equal(C.response(restored).selected,(q.correctIndex+1)%4,'Selection persists');
assert.equal(C.check(state),false);assert.equal(C.rec(state,q.id).firstAttemptCorrect,false);assert.equal(C.next(state),false,'Wrong answer cannot advance');
assert.equal(state.stars,0);assert.equal(C.hint(state),true);assert.equal(C.hint(state),false,'One hint per question per round');assert.equal(C.summary(state).hints,1);
C.retry(state);C.select(state,q.correctIndex);assert.equal(C.check(state),true);C.next(state);
assert.equal(C.rec(state,q.id).attempts,2);assert.equal(C.rec(state,q.id).firstAttemptCorrect,false);assert.equal(C.rec(state,q.id).finalCorrect,true);assert.deepEqual(C.rec(state,q.id).wrongAnswers,[(q.correctIndex+1)%4]);
assert.equal(state.run.responses[q.id].firstCorrect,false);assert.equal(C.moduleStats(state,m).needsReview,true,'Below 70% of attempted questions');
for(let i=1;i<m.questions.length;i++){C.select(state,m.questions[i].correctIndex);C.check(state);C.next(state);}
assert.equal(state.stars,5);const missed=state.run.questionIds.filter(id=>state.run.responses[id].firstCorrect===false);assert.deepEqual(missed,[q.id]);
C.begin(state,m.id,'missed',missed);state.run.phase='question';C.select(state,q.correctIndex);C.check(state);C.next(state);assert.equal(state.stars,5,'Missed review cannot double award');
assert.equal(C.moduleStats(state,m).needsReview,false,'One retry question and 5/6 first correct is above threshold');
// Boundary: exactly 70% alone does not require review, but two retry questions do.
const big=modules.find(m=>m.questions.length===10);let boundary=C.fresh();
for(const [i,q] of big.questions.entries())Object.assign(C.rec(boundary,q.id),{attempts:1,attemptsToFirstCorrect:1,firstAttemptCorrect:i<7,finalCorrect:i<7});
assert.equal(C.moduleStats(boundary,big).firstRate,.7);assert.equal(C.moduleStats(boundary,big).needsReview,false);
boundary.records[big.questions[6].id].firstAttemptCorrect=false;assert.equal(C.moduleStats(boundary,big).needsReview,true,'60% requires review');
boundary.records[big.questions[6].id].firstAttemptCorrect=true;
for(const q of big.questions.slice(0,2))Object.assign(C.rec(boundary,q.id),{attempts:2,attemptsToFirstCorrect:2});
assert.equal(C.moduleStats(boundary,big).needsReview,true,'Two multi-attempt questions require review even at 70%');assert.equal(C.moduleStats(C.fresh(),big).needsReview,false,'Untouched modules are not flagged');
// Derived rewards cannot be forged by supplying stars or badges in storage.
const forged=C.normalize({version:1,stars:999,badges:['fake'],completedModules:[m.id],records:{}});assert.equal(forged.stars,0);assert.deepEqual(forged.badges,[]);
assert.deepEqual(C.normalize(null),C.fresh());assert.deepEqual(C.normalize({version:99}),C.fresh());
let storage=new Map([['python-steps-lab:v1','untouched'],['other','untouched'],[C.KEY,'old']]);let writes=[];
const reset=C.resetStorage({setItem:(key,value)=>{writes.push(key);storage.set(key,value);}});
assert.equal(C.KEY,'express-concepts-review:v1');assert.deepEqual(writes,[C.KEY]);assert.equal(storage.get('python-steps-lab:v1'),'untouched');assert.equal(storage.get('other'),'untouched');assert.deepEqual(JSON.parse(storage.get(C.KEY)),C.fresh());assert.deepEqual(reset,C.fresh());
// Preview uses an isolated state snapshot and cannot mutate original progress.
const original=C.fresh(),snapshot=C.exportJSON(original),preview=JSON.parse(snapshot);complete(preview,m);assert.equal(C.exportJSON(original),snapshot);
console.log('State passed: answer/check separation, persistence, hints, retries, missed review, no duplicate rewards, 70% / two-retry rules, JSON export, reset key isolation and preview-state isolation.');
const html=fs.readFileSync(path.join(__dirname,'index.html'),'utf8');
for(const [,ref] of html.matchAll(/(?:href|src)="([^"#]+)"/g)){assert.ok(!ref.startsWith('/'),'Relative HTML paths');assert.ok(fs.existsSync(path.join(__dirname,ref)),ref);}
for(const file of ['index.html','styles.css','app.js','teacher.js','lessons.js']){
 const text=fs.readFileSync(path.join(__dirname,file),'utf8');assert.ok(!/https?:\/\/|\bfetch\s*\(|XMLHttpRequest|navigator\.sendBeacon|@import|document\.cookie|localStorage\.clear\s*\(/.test(text),file+' no remote requests or global storage clear');
}
assert.ok(!chinese.test(html.replace(/<dialog[\s\S]*?<\/dialog>/g,'')),'Student HTML is English');
assert.ok(fs.readFileSync(path.join(__dirname,'styles.css'),'utf8').includes('prefers-reduced-motion'));
console.log('Static checks passed: relative local assets, no external runtime requests, English student HTML and reduced-motion support.');

// Execute the shipped browser handlers with a small DOM and storage substitute.
// This checks rendered strings and event wiring, not browser layout or accessibility.
const vm=require('node:vm');
function browser(saved=null){
 const elements=new Map(),stored=new Map(saved?[[C.KEY,saved]]:[]),writes=[];let confirms=0,download=null;
 class Element{
  constructor(id=''){this.id=id;this.innerHTML='';this.textContent='';this.hidden=false;this.dataset={};this.listeners={};this.disabled=false;this.open=false;}
  addEventListener(type,cb){(this.listeners[type]||(this.listeners[type]=[])).push(cb);}
  setAttribute(){} focus(){} querySelector(){return new Element();} showModal(){this.open=true;} close(){this.open=false;}
  click(){if(this.download)download=this.download;}
 }
 const get=id=>{if(!elements.has(id))elements.set(id,new Element(id));return elements.get(id);};
 const document={getElementById:get,querySelector:get,createElement:()=>new Element(),documentElement:{lang:'en'}};
 const location={hash:'',pathname:'/index.html',search:''};
 const context=vm.createContext({document,location,history:{replaceState:()=>{location.hash='';}},window:{addEventListener(){},confirm:()=>{confirms++;return true;}},localStorage:{getItem:key=>stored.get(key)||null,setItem:(key,value)=>{writes.push(key);stored.set(key,value);}},setTimeout:()=>1,URL:{createObjectURL:()=> 'blob:local-export',revokeObjectURL(){}},Blob:class{},console});
 for(const name of ['lessons.js','app.js','teacher.js'])vm.runInContext(fs.readFileSync(path.join(__dirname,name),'utf8'),context,{filename:name});
 function click(action,data={},teacher=false){
  const element=new Element();element.dataset={...data,[teacher?'teacher':'action']:action};
  const event={target:{closest:selector=>selector===(teacher?'[data-teacher]':'[data-action]')?element:null}};
  for(const cb of get('main').listeners.click)cb(event);
 }
 return {context,get,stored,writes,click,confirmCount:()=>confirms,download:()=>download};
}
const b=browser(),A=b.context.ReviewApp,BC=b.context.ReviewCore;
assert.equal((b.get('main').innerHTML.match(/class="module-card /g)||[]).length,16,'All modules available');
assert.ok(!chinese.test(b.get('main').innerHTML));
b.click('module',{module:'paths'});assert.match(b.get('main').innerHTML,/Quick Review/);assert.equal(BC.moduleStats(A.getState(),BC.modules[0]).status,'progress');
b.click('start');const firstQ=BC.modules[0].questions[0];
b.click('select',{index:String((firstQ.correctIndex+1)%4)});assert.equal(A.getState().records[firstQ.id].attempts,0);assert.ok(!b.get('main').innerHTML.includes('Not quite yet'));
b.click('check');assert.match(b.get('main').innerHTML,/Not quite yet/);b.click('hint');assert.equal(A.getState().records[firstQ.id].hintUsed,true);assert.ok(!chinese.test(b.get('main').innerHTML));
b.click('retry');b.click('select',{index:String(firstQ.correctIndex)});b.click('check');b.click('next');
// Refresh from the actual app's saved value restores the next question.
const refresh=browser(b.stored.get(C.KEY));assert.equal(refresh.context.ReviewApp.getState().run.index,1);assert.match(refresh.get('main').innerHTML,/Question 2 of 6/);
for(const q of BC.modules[0].questions.slice(1)){b.click('select',{index:String(q.correctIndex)});b.click('check');b.click('next');}
assert.match(b.get('main').innerHTML,/Great thinking/);assert.equal(A.getState().stars,5);
b.click('missed');assert.equal(A.getState().run.questionIds.length,1);b.click('start');b.click('select',{index:String(firstQ.correctIndex)});b.click('check');b.click('next');assert.equal(A.getState().stars,5);
A.showTeacher();assert.match(b.get('main').innerHTML,/教师查看/);assert.equal(b.context.document.documentElement.lang,'zh-CN');
b.click('detail',{module:'paths'},true);assert.match(b.get('main').innerHTML,/教师说明/);assert.match(b.get('main').innerHTML,/曾选错误答案/);
const previewBefore=BC.exportJSON(A.getState()),writeCount=b.writes.length;
b.click('preview',{module:'paths'},true);b.click('start');
for(const q of BC.modules[0].questions){b.click('select',{index:String(q.correctIndex)});b.click('check');b.click('next');}
assert.match(b.get('main').innerHTML,/No saved progress or rewards changed/);assert.equal(BC.exportJSON(A.getState()),previewBefore);assert.equal(b.writes.length,writeCount,'No localStorage writes during actual preview handlers');
b.click('teacher');b.click('export',{},true);assert.equal(b.download(),'express-concepts-review-progress.json');
// Both reset confirmations, cancellation, and the exact key are exercised.
b.stored.set('unrelated-site','keep');const beforeReset=b.stored.get(C.KEY);
b.click('reset',{},true);assert.equal(b.confirmCount(),1);assert.equal(b.get('reset-dialog').open,true);assert.equal(b.stored.get(C.KEY),beforeReset);
b.get('cancel-reset').onclick();assert.equal(b.stored.get(C.KEY),beforeReset);
b.click('reset',{},true);assert.equal(b.confirmCount(),2);assert.match(b.get('confirm-reset').textContent,/确认清除/);b.get('confirm-reset').onclick();
assert.equal(A.getState().stars,0);assert.equal(b.stored.get('unrelated-site'),'keep');assert.ok(b.writes.every(key=>key===C.KEY));
// Render every shipped question, hint, and result in student mode.
for(const m of BC.modules){A.startPreview(m.id);b.click('start');for(const q of m.questions){assert.ok(!chinese.test(b.get('main').innerHTML),q.id);b.click('hint');assert.ok(!chinese.test(b.get('main').innerHTML),q.id+' hint');b.click('select',{index:String(q.correctIndex)});b.click('check');assert.ok(!chinese.test(b.get('main').innerHTML),q.id+' result');b.click('next');}}
console.log('Browser-handler substitutes passed: all 124 English question/hint/result renders, actual retry/review/refresh handlers, preview writes blocked, teacher details, export, and two-confirmation reset with cancellation.');

console.log('All automated checks passed. Browser, assistive technology, and deployed Pages checks require separate verification.');
