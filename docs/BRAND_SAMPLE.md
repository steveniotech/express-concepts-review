# io TECH course brand sample — accepted locally

The user has reviewed and approved this local Express Concepts Review design as the brand reference for future first-party course work. Shared elements are the actual logo, base palette, system typography, buttons, cards and Learning Hub return navigation. Each course must keep its own teaching layout, interaction tools and necessary theme. This approval does not authorize a batch rollout, commit, push or deployment. The remaining-course plan is recorded in the Hub's `docs/COURSE_BRAND_ADAPTATION_PLAN.md`.

Existing baseline work in this repository is preserved.

## Course scope

All seven original Hub URLs remain unchanged. The three local Git remotes confirm Express Concepts Review, Python Steps Lab and Reading Steps belong to `steveniotech`. Builder Island and Terminal Steps Lab are hosted in the same GitHub Pages namespace; their local repositories were not found in the scoped Projects directory. These five are candidates for a future first-party rollout, after review.

| Hub course | Exact URL | Maintenance evidence / this round |
| --- | --- | --- |
| Express Concepts Review | https://steveniotech.github.io/express-concepts-review/ | Matching local Git remote; chosen local sample only. |
| Python Steps Lab | https://steveniotech.github.io/python-steps-lab/index.html | Matching local Git remote; read-only. |
| Reading Steps | https://steveniotech.github.io/reading-steps/ | Matching local Git remote; read-only. |
| Builder Island | https://steveniotech.github.io/builder-island/ | Same account's Pages namespace; not modified. |
| mBot Robotics | https://iotechcentermbotpractice.netlify.app/#level-3 | External host; account/repository ownership not verified. Excluded from changes. |
| Snap Circuits | https://iocentersnapcircuitspractice.netlify.app/#learn | External host; account/repository ownership not verified. Excluded from changes. |
| Terminal Steps Lab | https://steveniotech.github.io/terminal-steps-lab/ | Same account's Pages namespace; not modified. |

External hosting alone does not establish third-party course ownership. The two Netlify destinations must remain out of any automatic rollout until their maintenance ownership is confirmed. No external course has been embedded, copied or restyled.

The web-fetch tool could not retrieve these URLs. Chrome independently rendered all seven destinations: Express Concepts Review, Python Steps Lab, Reading Steps, Builder Island, Robot Kingdom (mBot Robotics), Circuit Discovery Lab (Snap Circuits), and Terminal Steps Lab. The robotics page changed the initial fragment from level-3 to level-1; the catalog link remains unchanged. These observations establish page access, not full course acceptance or hosting ownership.

The courses have distinct teaching surfaces: Express uses lesson cards and a focused question panel; Python has a learning map and coding workspace; Reading has passage and practice sections; Builder Island uses a workplane; robotics has a block-programming workspace; circuits has a learning model and step panel; terminal practice uses a terminal, roadmap and folder tree. These structures should remain course-specific. Express's existing cream/green visual treatment visibly differs from the Hub's blue/white palette and is the focus of this sample.

## Shared visual rules

Use the current Hub, including its locally revised centered-logo header, as the reference. Course pages use a smaller header; they retain their teaching layouts.

| Element | Rule |
| --- | --- |
| Logo | Exact Hub PNG, full artwork/tagline, opaque white background, intrinsic ratio, responsive width and height:auto. Course sample uses 150px desktop / 132px small screen width. |
| Primary action | Blue `#0066da`, white label, hover `#0056bb`; branding blue `#0072ef` for decorative accents. |
| Headings / body | Dark blue `#013a91` headings, `#12345d` body, `#48617d` secondary text. |
| Background / surfaces | Very light blue `#f1f7ff`, white cards, border `#d9e6f6`, restrained shadow. |
| Supporting accents | Orange `#ff7d01`, green `#00bd6a`, predominantly on pale tints. Success, retry and error meanings remain distinct. |
| Font | Local system sans stack matching the Hub. Code stays monospace. Retain course reading sizes and question hierarchy. |
| Shape | Cards 22px corners, controls 13px, visible dark blue focus outline; no animation added. |
| Spacing | Reusable 8 / 16 / 24 / 32 / 48px scale; compact course header; preserve course grid, quiz and teacher layout breakpoints. |
| Navigation | Centered logo above compact course navigation. Explicit Learning Hub link, no contact block. Relative sibling path resolves to the published Hub. |

The sample changes `index.html`'s stylesheet/icon references and header, adds `brand.css` and copies the exact logo into `assets/`. Browser verification also required one presentation-only guard in `app.js`: `setLanguage` must not replace an existing `.brand-logo` with the legacy text mark. The original CSS, curriculum, teacher and course logic remain identical to the release baseline. All scoring, state and persistence code remains unchanged. The original course logo click handler, All Lessons and About & Help controls are retained. No additional runtime script was added.

Express was chosen because its lesson cards, multiple-choice questions, hints, feedback and teacher preview provide useful representative surfaces, while the existing tests cover its teaching behavior. This candidate contains strictly brand styling, logo preservation, and Learning Hub navigation.

## Local review

From this repository:

```sh
node scripts/serve-brand-review.mjs
```

- Sample: http://127.0.0.1:8772/express-concepts-review/
- Before: http://127.0.0.1:8772/before/express-concepts-review/

The before snapshot and evidence are ignored local files. The server binds only to loopback and serves an explicit public file allowlist. It does not serve Git files, local reports or private data. This is a temporary local preview, not a new production hosting flow. The Hub return route sends local review to the existing Hub preview; production uses the sibling Pages path.

## Verification

- Existing `node test-app.js` passed before and after the change: 16 modules, 124 questions, scoring, hints, retries, missed-question review, rewards, recovery, teacher preview and reset isolation, using in-memory test state and DOM/storage substitutes.
- Script syntax and `git diff --check` passed.
- Baseline comparisons confirm unchanged original CSS, curriculum and teacher files. Removing only the logo-preservation guard from the current `app.js` reproduces the exact starting hash. Everything after the header in `index.html` remains identical. The copied logo is byte-identical to the Hub logo.
- In-process HTTP routing passed for current and before HTML, every relative runtime asset, PNG content type/signature/exact bytes, private-path rejection and the published Hub return destination. These checks do not prove a running HTTP listener or browser layout.
- Calculated contrast passes 4.5:1 for primary button labels (5.37:1), body text on the page (11.64:1), secondary text (6.40:1), headings (10.42:1), and the selected success/retry text and tinted background pairs (5.27:1 and 8.02:1). Focus rules and existing reduced-motion handling remain present.
- Chrome completed the desktop/mobile checks and practice flow. See `BRAND_BROWSER_VERIFICATION.md` for the actual results and screenshot provenance. Approval of the style does not complete the remaining functional or production checks.

Assistive technology and physical touchscreen devices are not accepted by this style-only test. No existing progress is reset or deleted.

## Review and rollback

The local visual sample is approved; future course adaptations remain planned work and must be reviewed separately. To undo only the visual sample, remove the new stylesheet/icon references, restore the original header, remove the logo-preservation guard and its regression check, and remove the new visual assets when no longer needed.
