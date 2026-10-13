'use strict';
(function(root){
 if(typeof document==='undefined')return;
 const C=root.ReviewCore,A=root.ReviewApp,esc=A.esc;
 const rate=value=>value===null?'尚无作答':Math.round(value*100)+'%';
 const status=s=>({new:'未开始',progress:'进行中',complete:'已完成'}[s.status]);
 const titles=['指令与路径','发现并修复错误','声音与绘画顺序','精灵与场景','故事与宠物项目','事件与节拍','重复与贴纸图案','嵌套循环与雪花','编码前的规划','条件与分支','持续与停止条件','函数定义与调用','文本与提示输入','变量与更新','计数规律','最终项目概念选择'];
 function display(m){return titles[C.modules.indexOf(m)];}
 function render(){
  A.setLanguage(true);const state=A.getState(),s=C.summary(state);
  A.frame(`<section class="teacher-header"><p class="eyebrow">本地学习记录</p><h1>教师查看</h1><p class="teacher-warning">这里只显示当前浏览器保存的数据，不代表其他设备或学生账号的数据。此入口没有身份验证，请留意共享设备。</p>${A.storageWorks()?'':'<p class="teacher-warning">浏览器保存不可用。当前记录只在本次页面中，请导出后保留。</p>'}<div class="teacher-summary"><div><strong>${s.completed} / ${C.modules.length}</strong><span>已完成模块数</span></div><div><strong>${s.stars} / ${C.modules.length*5}</strong><span>总星星</span></div><div><strong>${s.badges.length}</strong><span>已获得徽章</span></div><div><strong>${rate(s.firstRate)}</strong><span>首次答对率</span></div><div><strong>${s.attempts}</strong><span>总尝试次数</span></div><div><strong>${s.hints}</strong><span>使用提示次数</span></div><div><strong class="date-value">${s.latest?esc(new Date(s.latest).toLocaleString('zh-CN')):'尚无学习记录'}</strong><span>最近学习时间</span></div></div><div class="actions"><button data-teacher="export" class="primary">导出 JSON</button><button data-teacher="reset" class="danger">重置进度</button><button data-teacher="student" class="quiet">返回学生首页</button></div><p class="small">首次答对率：首次检查就答对的题数 ÷ 已作答题数。最终正确率：已最终答对题数 ÷ 模块题数。重复练习不会改写原始首次作答结果，累计尝试次数会保留。</p></section><section class="card teacher-table"><h2>模块学习记录</h2><p>需要复习：有作答记录且首次答对率低于 70%，或至少 2 道题在首次答对前需要超过 1 次尝试。未作答模块不标记复习。提示次数按使用过提示的不同题目计数。</p><div class="table-scroll"><table><caption class="sr-only">模块结果与复习建议</caption><thead><tr><th scope="col">模块</th><th scope="col">对应 Code.org 课号</th><th scope="col">模块状态</th><th scope="col">首次答对率</th><th scope="col">最终正确率</th><th scope="col">总尝试次数</th><th scope="col">需要复习</th><th scope="col">操作</th></tr></thead><tbody>${C.modules.map((m,i)=>{const t=C.moduleStats(state,m);return `<tr><th scope="row">${i+1}. ${display(m)}<small>${esc(m.teacherTitle)}</small></th><td>第 ${m.lessons} 课</td><td>${status(t)}</td><td>${rate(t.firstRate)}</td><td>${Math.round(t.final/t.total*100)}%</td><td>${t.attempts}</td><td>${t.needsReview?'建议复习':'—'}</td><td><button class="quiet" data-teacher="detail" data-module="${m.id}">查看详情</button><button class="quiet" data-teacher="preview" data-module="${m.id}">预览学生模式</button></td></tr>`;}).join('')}</tbody></table></div></section><p class="small">课程映射按本项目的 2025 年复习分组整理。本项目独立制作，与 Code.org 无隶属或官方合作关系。</p>`);
 }
 function detail(id){
  const m=C.modules.find(m=>m.id===id);if(!m)return;const state=A.getState();
  A.frame(`<section class="card"><button class="quiet" data-teacher="back">← 返回模块记录</button><h1>${display(m)}</h1><p>对应第 ${m.lessons} 课：${esc(m.teacherTitle)}</p><h2>概念摘要</h2><p>${esc(m.summaryZh)}</p><h2>常见误解</h2><ul>${m.misconceptionsZh.map(t=>`<li>${esc(t)}</li>`).join('')}</ul><button class="primary" data-teacher="preview" data-module="${m.id}">预览学生模式</button><h2>逐题结果</h2>${m.questions.map((q,i)=>{const r=state.records[q.id];return `<article class="teacher-question"><h3>第 ${i+1} 题</h3><p lang="en">${esc(q.prompt)}</p>${q.code?`<pre class="code-card" lang="en"><code>${esc(q.code)}</code></pre>`:''}<dl><dt>曾选错误答案</dt><dd>${r?.wrongAnswers.length?r.wrongAnswers.map(j=>`<span lang="en">${esc(q.options[j])}</span>`).join('；'):'无'}</dd><dt>最近选择</dt><dd>${r?.selectedIndex!==null&&r?.selectedIndex!==undefined?`<span lang="en">${esc(q.options[r.selectedIndex])}</span>`:'尚未选择'}</dd><dt>正确答案</dt><dd lang="en">${esc(q.options[q.correctIndex])}</dd><dt>首次作答</dt><dd>${!r?.attempts?'尚未作答':r.firstAttemptCorrect?'首次答对':'首次未答对'}</dd><dt>最终结果</dt><dd>${r?.finalCorrect?'已答对':'尚未答对'}</dd><dt>累计尝试次数</dt><dd>${r?.attempts||0}</dd><dt>首次答对前尝试次数</dt><dd>${r?.attemptsToFirstCorrect||0}</dd><dt>提示使用</dt><dd>${r?.hintUsed?'已使用':'未使用'}</dd><dt>教师说明</dt><dd>${esc(q.teacherNoteZh)}</dd></dl></article>`;}).join('')}</section>`);
 }
 function help(){A.frame('<section class="practice-card"><h1>教师使用帮助</h1><p>选择查看详情可检查逐题记录。预览学生模式只操作内存副本，不保存进度或发放星星；返回教师查看即可退出。</p><p>导出 JSON 包含当前记录、每题选择、累计次数、提示和当前练习轮次。请妥善保管。第一版不支持 JSON 导入。</p><p>数据仅保存在此浏览器。不同浏览器、设备、域名和本地端口可能使用不同存储。共享设备会保留记录直到重置。</p><p>重置需要两次独立确认，只覆盖 express-concepts-review:v1 这一项；不会清除其他项目或网站的数据。</p><button class="primary" data-teacher="back">返回教师查看</button></section>');}
 function exportData(){
  try{const url=URL.createObjectURL(new Blob([C.exportJSON(A.getState())],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='express-concepts-review-progress.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}catch{A.frame('<section class="card"><h1>导出未完成</h1><p>此浏览器无法下载文件。请保持页面打开，并尝试其他支持下载的浏览器。</p><button data-teacher="back" class="primary">返回教师查看</button></section>');}
 }
 function reset(){
  if(!window.confirm('第一次确认：这将只清除当前浏览器中的 Express Concepts Review 本地学习进度。不会影响 Python Steps Lab、Reading Steps、Code.org 或其他网站。是否继续？'))return;
  const dialog=document.getElementById('reset-dialog');document.getElementById('reset-message').textContent='第二次确认：本地选择、尝试次数、星星和徽章将全部重置。此操作无法撤销；如需保留，请先取消并导出 JSON。';document.getElementById('confirm-reset').textContent='确认清除本地进度';
  document.getElementById('cancel-reset').onclick=()=>dialog.close();
  document.getElementById('confirm-reset').onclick=()=>{dialog.close();A.reset();};dialog.showModal();document.getElementById('cancel-reset').focus();
 }
 document.getElementById('main').addEventListener('click',event=>{
  const b=event.target.closest('[data-teacher]');if(!b)return;
  const action=b.dataset.teacher;
  if(action==='back')render();else if(action==='detail')detail(b.dataset.module);else if(action==='preview')A.startPreview(b.dataset.module);else if(action==='student')A.home();else if(action==='export')exportData();else if(action==='reset')reset();
 });
 root.ReviewTeacher={render,detail,help};A.init();
})(typeof globalThis!=='undefined'?globalThis:this);
