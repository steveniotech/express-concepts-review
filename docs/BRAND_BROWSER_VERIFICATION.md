# Brand sample browser verification — local only

The user started `scripts/serve-brand-review.mjs`; the listener was identified as Node PID 36675 on `127.0.0.1:8772`. Chrome opened the actual HTTP sample at http://127.0.0.1:8772/express-concepts-review/ . No deployment, Git commit, push, Supabase operation or other-course modification was performed.

The user subsequently reviewed the sample and **approved its brand style for use as the reference for future first-party courses**. This records visual acceptance only; it does not expand the tests below or authorize rollout or publication.

## Automated checks

`node test-app.js`, JavaScript syntax checks and `git diff --check` pass. The original suite covers 16 modules and all 124 questions, scoring, hints, retries, review, rewards, normalization, refresh recovery, teacher preview and reset isolation with in-memory state and DOM/storage substitutes. It is not a real-browser run of all 124 questions.

A new regression check seeds the actual header markup and verifies the image survives home, lesson intro, question and teacher-language rendering. This catches the real issue found by browser testing: `setLanguage` unconditionally overwrote the new image with the old text mark. A single guard now preserves `.brand-logo`; the fallback for the old header remains unchanged. A local PNG favicon reference also removes the original optional favicon 404.

Comparisons confirm that original CSS, curriculum and teacher files are unchanged. The only application change is the logo-preservation condition: removing it reproduces the exact starting `app.js` hash. All HTML after the header is identical to the initial version. The logo matches the Hub PNG byte for byte.

## Actual Chrome observations

| Check | Result and limit |
| --- | --- |
| Desktop 1280 × 900 | Complete centered logo and tagline, compact header, Hub navigation, readable questions/options/buttons; no visible overlap or horizontal overflow. |
| Phone 375 × 812 | Header/navigation wrap, all four options and action buttons were usable in practice; feedback and hint panels remained readable. No visible overlap or horizontal overflow. |
| Additional 320 × 812 | Logo/navigation and a long third-question heading wrapped within the narrow viewport; no visible horizontal overflow in the inspected area. This was a supplementary visual check, not a full second flow run. |
| Phone answer flow | Opened Sounds & Drawing, started question 1, selected the deliberately wrong answer “Actions chosen at random,” checked it, saw retry feedback and explanation, opened the hint, retried with “Actions arranged in order,” and saw correct feedback. |
| Phone next / recovery | Next Question reached question 2. Selected “Clap,” reloaded, and confirmed question 2, progress 1/8 and the selected answer were restored. Returning with All Lessons showed Continue Practice; continuing restored the same question and selection. |
| Desktop answer flow | Checked the recovered “Clap” answer, saw correct feedback, and used Next Question to reach question 3. Returned to the lesson map while keeping the active run. |
| Hub return | Activated the Learning Hub link by keyboard; the local server redirected to http://127.0.0.1:8765/io-tech-learning-hub/ . Browser Back restored the course at question 3. Production sibling-path resolution was separately checked; no live production navigation or release was needed. |
| Keyboard | Answer selection, checking, hint, retry, next, return, continue and Hub navigation were exercised with Tab/Shift+Tab and Space/Enter. Native pointer actions were also used on desktop. This is not a screen-reader audit or a physical touch test. |
| Actual network / console | The final course load contained 10 requests; filtering for non-200 status returned 0/10. The real logo request was observed as 200 and PNG and visibly decoded in the page. The final Console showed zero visible messages at default levels and no application errors. An early optional `/favicon.ico` 404 was corrected by the local icon reference. |

Only anonymous local practice was used. No reset was used. Existing production records were not changed.

## Screenshot provenance

These are real Chrome viewport captures, stored as ignored local review artifacts under `.local/brand-review/screenshots/`:

| Artifact | Source |
| --- | --- |
| `desktop-before.png` | 1280 × 900 CSS viewport, old local header/CSS, captured before the practice run. |
| `desktop-after.png` | Same viewport and initial progress state, corrected branded header/CSS. |
| `mobile-before.png` | 375 × 812 CSS viewport, old local header/CSS, captured before the practice run. |
| `mobile-after.png` | Same phone viewport and initial progress state, branded header/CSS. |
| `desktop-practice.png` | Additional actual question-3 layout capture. |
| `mobile-feedback.png` | Additional full-page correct-feedback/hint capture. |

The before images are newly captured renders of the preserved pre-branding local HTML and CSS. They are **not historical screenshots of the production site**. Shared course scripts remain equivalent for the old header: the image-preservation guard takes the unchanged legacy branch.

## Still unverified

- Physical phones/tablets, real touch input, screen readers, browser zoom and a wider cross-browser matrix.
- Browser completion of every question/module, badge award and teacher details across all lessons.
- Cloud synchronization, real login or cross-account features (which are not included in this release).
- Production hosting and deployment of this design. No other course has been restyled.
