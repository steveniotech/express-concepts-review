# Express Concepts Review — Testing

## Actual automated verification

The project is original and independent. No existing Python Steps Lab or Reading Steps files were read, imported, edited, or used as assets for this implementation.

2026-10-13: the following checks passed locally with Node.js:

```sh
node --check lessons.js
node --check app.js
node --check teacher.js
node --check test-app.js
node test-app.js
```

- [x] Exactly 16 modules and 124 questions; per-module counts checked.
- [x] Four distinct options and a valid single correctIndex per question.
- [x] Unique stable IDs, non-empty English question/explanation/hint, and Chinese teacher notes.
- [x] Every module has a mapping, badge, two-to-four quick review bullets, summary and misconceptions.
- [x] Student HTML and all 124 rendered student questions, hints and results contain no Chinese.
- [x] Selection does not check an answer; checked answers cannot inflate attempts with another click.
- [x] Retry, final correctness, first-attempt retention, round reports and missed-question-only review.
- [x] Five-star module awards cannot be duplicated, including by missed review; total derives from modules.
- [x] Snapshot/normalization restore and actual page-handler refresh restoration via storage substitute.
- [x] Review rules at below 70%, exactly 70%, and two multi-attempt questions; untouched modules excluded.
- [x] JSON export parses; runtime only writes `express-concepts-review:v1` on reset.
- [x] Actual teacher preview handlers make no localStorage writes and leave original progress unchanged.
- [x] Actual teacher details, export handler, two-stage reset and cancellation via DOM/storage substitutes.
- [x] HTML assets are relative and exist; no external runtime requests or global localStorage clearing.
- [x] Reduced-motion rule exists in CSS.

The requested module counts sum to 122. Two original final-project synthesis questions bring this edition to 124; module 16 has 10 questions. README documents the adjustment.

## Verification limits

The computer-use tool reported no available browser. No real-browser, screenshot, physical mobile, keyboard, assistive-technology, real download, file-URL storage, or deployed GitHub Pages test is claimed. The DOM substitutes exercise shipped handlers; they are not browser engines. Structural and language tests do not replace a teacher’s editorial review of question quality.

## Manual student-flow checklist

- [ ] Open `index.html` directly; check the 16-card map and progress summary.
- [ ] Open with a local static server and verify the same behavior.
- [ ] Start any module, including module 16, without completing earlier modules.
- [ ] Confirm the Quick Review contains two-to-four clear points.
- [ ] Select an option: no answer or explanation is revealed until Check Answer.
- [ ] Check a wrong answer: see text/icon feedback, explanation, Read Hint and Try Again.
- [ ] Read the single hint, retry, and eventually check the correct answer.
- [ ] Confirm wrong answers and hints never remove stars; no Next Question before a correct check.
- [ ] Finish a module: inspect round first-try count, total attempts, badge and +5 stars.
- [ ] Review Missed Questions: only questions missed on their first attempt in that round replay.
- [ ] Finish a perfect round: missed review is disabled with a helpful English empty state.
- [ ] Repeat a module: no additional stars or badges.
- [ ] Confirm all student menus, explanations, empty states and completion text are English.

## Manual teacher-view checklist

- [ ] Open `index.html#teacher` and confirm Chinese navigation, statistics and help.
- [ ] Inspect lesson mappings and original course-group labels for all modules.
- [ ] Compare summary calculations with the actual checked questions.
- [ ] Inspect drill-down: concept summary, misconceptions, wrong answers, correct answer, attempts, hint and Chinese note.
- [ ] Open student preview, complete some questions, return: no saved progress/rewards changed.
- [ ] Export JSON; check a real downloaded file parses and contains all state fields.
- [ ] Verify first-rate denominator excludes untouched questions and final-rate denominator includes all module questions.
- [ ] Verify below-70% and two-or-more retry-question flags, including repeat practice that is correct on first try.

## Keyboard and mobile checklist

- [ ] Use Tab and Shift+Tab through navigation and choices with visible focus.
- [ ] Activate answer, Check, Retry, Hint and Next using Enter/Space.
- [ ] Confirm feedback is announced clearly once with a screen reader; correct/incorrect is not color-only.
- [ ] Test skip link, page-heading focus and reset modal focus/escape.
- [ ] Inspect at approximately 375px, tablet and desktop widths and at 200% zoom.
- [ ] Confirm pseudocode wraps, answer choices remain readable, and teacher table scrolls inside its container.
- [ ] Enable reduced motion: no completion bloom or hover motion.
- [ ] Confirm no autoplay audio or unexpected focus jumps.

## Browser storage and reset checklist

- [ ] Refresh after selection, a wrong check, a hint, a correct check, and completion; verify each saved state.
- [ ] Confirm the saved key is exactly `express-concepts-review:v1`.
- [ ] Block storage or simulate quota failure: see an English student warning, usable session and Chinese teacher warning.
- [ ] Reset: cancel the first dialog, then cancel the second; each retains records.
- [ ] Accept both reset confirmations in a disposable test session; see zero progress after refresh.
- [ ] Confirm unrelated localStorage keys remain unchanged. Do not reset real student data as a test.
- [ ] Compare other browsers, file URLs and different localhost ports; do not assume shared storage.
- [ ] Reload during teacher preview: verify no preview records were saved.

## GitHub Pages subpath check

- [ ] After publishing separately, open `/express-concepts-review/` and `/express-concepts-review/index.html#teacher`.
- [ ] Verify all CSS/JS paths load from the repository subpath; no domain-root asset path.
- [ ] Inspect Network: only this site’s local HTML/CSS/JS assets; no fonts, trackers or API calls.
- [ ] Refresh a saved practice and test English help and Chinese teacher view.
- [ ] Remember that local test origins and the published domain have separate records.

## Known limitations

- No account login, identity checks, class roster, cloud sync or teacher authentication.
- Progress is stored only in the current browser; shared-device records are shared.
- JSON export is supported; JSON import is not included in version 1.
- Saved records can be edited using browser tools; this is practice, not a secure grading system.
- Browser support is aimed at modern browsers with localStorage and HTML dialog support.
- Pseudocode is explanatory, not an executable programming environment.
- Version 1 keeps cumulative question results and the current round, not a full history of every round.
