# Express Concepts Review

A calm, playful coding concept review for ages 8–11. Choose any of 16 modules, answer original multiple-choice questions, read explanations, and retry at your own pace. No typing code, sign-in, installation, build step, or network access is needed to use the site.

This is an independent project inspired by the learning progression of the [Code.org Express Course (2025)](https://studio.code.org/courses/express-2025). It is not made by, endorsed by, or affiliated with Code.org. All questions, pseudocode cards, styling, and badge designs are original. No Code.org assets or exact level questions are included. The teacher lesson grouping follows the supplied review plan rather than claiming to reproduce official lesson titles.

## Question count / 题目数量

The supplied per-module counts add up to **122**, while the requested total is **124**. This edition adds **two synthesis questions to Final Project Review** (10 questions instead of 8), leaving all other counts unchanged. The total is 124. The two extra IDs are `project-q09` and `project-q10`.

| Module | Lesson mapping | Questions |
| --- | --- | ---: |
| Commands & Paths | 1 | 6 |
| Find & Fix Bugs | 2 | 6 |
| Sounds & Drawing | 3–4 | 8 |
| Sprites & Scenes | 5–6 | 8 |
| Stories & Pets | 7–9 | 6 |
| Events & Beats | 10–11 | 8 |
| Repeat & Sticker Art | 12–13 | 8 |
| Patterns & Snowflakes | 14–15 | 8 |
| Think Before Coding | 16 | 6 |
| If & Otherwise | 17 | 8 |
| Keep Going & Stop | 18–21 | 10 |
| Name & Reuse Actions | 22–24 | 8 |
| Ask & Respond | 25 | 6 |
| Store & Change Values | 26–28 | 10 |
| Counting Patterns | 29–30 | 8 |
| Choose Your Coding Tools | 31 | 10 |

## Local use

Open `index.html` directly in a modern browser. All assets use relative paths and deferred classic scripts, so there are no module-fetch or build requirements. Browser policies for file-URL storage can vary; a local server provides a more predictable origin:

```sh
cd /path/to/express-concepts-review
python3 -m http.server 8000 --bind 127.0.0.1
```

Open http://127.0.0.1:8000/ . Stop the server with Control+C. Python is used only for this optional development server; the published site has no server code.

## 教师设置与使用

打开 `index.html#teacher`，或点击页脚的 Teacher View。教师界面为简体中文；学生内容为英文。所有模块从一开始即可选择。

- 选择「查看详情」查看概念、常见误解、逐题答案、曾选错误答案、次数和中文教师说明。
- 「预览学生模式」使用内存副本，不写入学生记录、不发放星星；退出后回到教师查看。刷新页面会退出预览。
- 「导出 JSON」下载本地记录；第一版不支持 JSON 导入。
- 「重置进度」先显示一次说明对话框，再显示含明确清除按钮的第二次确认。取消任意一次均不清除数据。只覆盖 `express-concepts-review:v1`，不影响其他项目或网站。
- 此入口不是身份认证。共享设备上的其他使用者可以查看同一浏览器的记录。

首次答对率以已检查过的不同题目为分母；未作答不计入首次率。最终正确率以模块全部题目为分母。需要复习：已有作答且首次率低于 70%，或至少两道题在首次答对前需要两次以上尝试。刚开始且尚无作答的模块不标记复习。重复练习保留原始首次结果和累计尝试次数，不把一次答对的复练自动当成错误。每题只有一条提示，使用提示的不同题数作为统计。

## Rewards and privacy

Completing all questions eventually correctly awards five stars and one badge per module, once only. The star limit is derived from the module count (currently 16 × 5 = 80). Misses, hints, and retries never remove rewards. Round completion reports that round’s first-try count and attempts; Teacher View keeps lifetime totals.

**Your work stays in this browser on this device.** No answers, names, device information, or analytics are sent anywhere. No remote fonts, images, JavaScript, APIs, trackers, or libraries load. Shared devices may retain progress until reset. Different browsers, devices, domains, and localhost ports may have separate saved progress. A move to a different origin does not migrate saved data. If storage is blocked or full, the app shows a warning and keeps the session usable; use Teacher View to export it.

## State schema

`localStorage` key: **`express-concepts-review:v1`**. No other storage key is read or written by the runtime.

```text
version: 1
currentModule: stable module ID or null
records: question ID → {
  selectedIndex: 0..3 or null,
  firstAttemptCorrect: boolean or null (immutable after first check),
  finalCorrect: boolean (ever eventually correct),
  attempts: cumulative checks,
  attemptsToFirstCorrect: checks up to first success,
  hintUsed: boolean,
  wrongAnswers: distinct previously checked wrong option indexes
}
completedModules: stable module IDs (one reward per module)
stars: derived completed count × 5
badges: derived from completed module IDs
latestActivityDate: ISO timestamp or null
run: {moduleId, questionIds, index, mode, phase, responses, newBadge} or null
responses: question ID → {selected, status, attempts, firstCorrect, hintShown}
```

A run is a full practice or missed-question review. It has an intro, question, or completion phase. Selections do not count as attempts until Check Answer. A completed answer cannot be checked twice without starting another practice. Saved rewards are recalculated from valid completed modules on restore. Question IDs must remain stable when editing content; do not silently change which concept an existing ID tests.

Pseudocode conventions: a turn does not move a character; directional moves are one square where stated. Repeat-until checks its stopping condition before the body. Counting cards explicitly include a reachable stop value. These are educational conventions, not claims about every programming language.

## Tests

Node.js is required only for the tests; no packages need to be installed. Run in the project root:

```sh
node --check lessons.js
node --check app.js
node --check teacher.js
node --check test-app.js
node test-app.js
```

Tests cover curriculum structure and language, state transitions, rewards, reset isolation, review rules, local assets, and shipped page handlers with DOM/storage substitutes. They do not prove visual layout, screen-reader behavior, real downloads, or real browser persistence. See `TESTING.md`.

## Files

- `index.html`: semantic page shell, local asset links and reset dialog.
- `styles.css`: responsive layout, original local visuals and accessible focus styles.
- `lessons.js`: modules, original questions, quick reviews and Chinese teaching notes.
- `app.js`: student rendering, state, scoring and local storage.
- `teacher.js`: Chinese statistics, drill-down, preview, export and reset.
- `test-app.js`: package-free Node tests and DOM substitutes.
- `TESTING.md`: actual check results and manual verification checklists.
- `.gitignore`: excludes caches, secrets, temporary and private/student files.

## GitHub Pages publishing

After creating the separate repository and pushing these files to `main`:

**Settings → Pages → Deploy from a branch → main → /(root) → Save**

Expected URL after successful publishing: https://steveniotech.github.io/express-concepts-review/

GitHub Pages publishing is separate from creating the repository and pushing files. This local delivery does not itself publish a site. The relative asset paths support the repository subpath. Test the published URL after the deployment finishes.
