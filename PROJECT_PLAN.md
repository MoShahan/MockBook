# MockBook — Project Completion Plan

A step-by-step plan to turn this tutorial MERN social app into a finished, hosted product. Keep the existing stack (Next.js, React, Material UI, Redux, Formik/Yup, Express, Mongoose, MongoDB, JWT, Multer). Do not switch databases or UI libraries.

Work through the parts in order. Finish a part before starting the next unless a note says otherwise. Tick items as you go.

**Tracking rule:** Whenever a task in this plan is completed in the repo, mark its checkbox `[x]` in this file in the same change (or immediately after). Do not leave finished work unchecked.

---

## Goals

1. App works end-to-end (auth, posts, likes, friends, profiles, comments, saved posts, comment likes).
2. Same stack, upgraded to current supported versions.
3. Secure enough to put on a public URL.
4. Modern, polished UI with working light and dark themes.
5. Deployed frontend + backend + MongoDB Atlas.
6. CI (lint + test) stays green.

---

## Current baseline (what we are starting from)

- Tutorial-level MERN social app (Next.js App Router + Express + Mongoose).
- UI shells exist: login, register, home, profile, navbar, widgets.
- Many flows are broken (wrong URLs, wrong Redux shapes, auth redirect blocks register, etc.).
- Placeholders: search, messages, notifications, share, clip/audio, writing comments.
- Hardcoded `http://localhost:5000` everywhere.
- Frontend upgraded (Step 1.4): Next 16 + React 19 + MUI 9; backend upgraded (Step 1.3): Express 4.22, Multer 2, Mongoose 8.
- Unused packages removed (Step 1.1 done).
- Almost no tests; four CI workflows under `.github/workflows/` (`backend-lint`, `backend-test`, `frontend-lint`, `frontend-test`).
- Root npm workspaces + `concurrently` so `npm install` / `npm run dev` work from the repo root.

---

# Part 0 — Prep (do this once before coding)

### Step 0.1 — Safety and secrets

- [x] Confirm `backend/.env` is in `.gitignore` (add it if missing).
- [x] Rotate MongoDB password and `ACCESS_TOKEN_SECRET` if the repo was ever pushed with secrets. _(new Atlas cluster/user + new local `ACCESS_TOKEN_SECRET`; old `backend/.env` was in git history from 2023 — removed from git index / kept local only)_
- [x] Remove real tokens/passwords from `backend/testing.rest` (replace with placeholders). _(file deleted; no longer needed)_
- [x] Create a short local checklist of env vars you will need later: `PORT`, `MONGODB_URI`, `ACCESS_TOKEN_SECRET`, optional `MONGODB_USERNAME` / `MONGODB_PASSWORD`, frontend `NEXT_PUBLIC_API_URL`. _(see `backend/.env.example`, `frontend/.env.example`, and README)_

### Step 0.2 — Branching and documentation

- [x] Create a working branch (e.g. `upgrade/modernize`).
- [x] Keep this file (`PROJECT_PLAN.md`) as the source of truth; update checkboxes as you finish steps.
- [x] Replace the short README with a real project README when Part 1 scripts exist (or after Part 1).

### Step 0.3 — Local run baseline

- [x] Note current Node version; standardize on **Node 20 LTS** for local and CI.
- [x] Confirm MongoDB (local or Atlas) connects with the current app once.
- [ ] Snapshot what currently fails (register redirect, create post, friends list, likes, profile) so you can verify Part 2 fixes later.

---

# Part 1 — Clean stack, remove dead code, upgrade versions

**Goal:** Same stack, modern versions, no unused packages, project still installs and builds. Prefer fixing breakages from upgrades here; full feature fixes come in Part 2+.

### Step 1.1 — Remove unused modules and dead dependencies

Remove from **backend** (not used by any import / replaced by Express built-ins):

- [x] `gridfs-stream` (abandoned; incompatible with modern Mongo driver)
- [x] `multer-gridfs-storage` (unused; uploads use disk storage)
- [x] `body-parser` (Express `express.json()` / `urlencoded` already cover this)
- [x] `mongodb` standalone package if only Mongoose is used for DB access

Remove from **frontend**:

- [x] `react-router-dom` (routing is Next.js App Router)
- [x] `dotenv` (Next.js reads env natively; not used in app code)
- [x] Any other unused dependency discovered by grepping imports (`redux` direct dep — covered by Redux Toolkit)

Also:

- [x] Delete commented-out dead code that confuses upgrades (optional but recommended).
- [x] Do **not** remove Material UI, Emotion, Redux, Formik, Yup, Multer, Mongoose, JWT, bcrypt, helmet, cors, morgan.

### Step 1.2 — Add missing npm scripts (needed for CI and later work)

**Root monorepo (npm workspaces)**

- [x] Root `package.json` with `workspaces: ["frontend", "backend"]`.
- [x] Root `npm install` installs both packages; `npm run dev` runs backend + frontend via `concurrently`.
- [x] Root scripts: `lint`, `test`, `build`, `dev:backend`, `dev:frontend`.

**Backend**

- [x] `start` → run the API (`node index.js` or nodemon for dev).
- [x] `dev` → watch mode (nodemon or `node --watch`).
- [x] `lint` → real ESLint once configured (temporary no-op only until ESLint is added in this part).
- [x] `test` → real test runner once configured (temporary no-op only until tests exist in Part 6).

**Frontend**

- [x] Keep `dev`, `build`, `start`, `lint`.
- [x] Add `test` script (placeholder until Part 6, then replace with real runner).

### Step 1.3 — Upgrade backend packages (same stack)

Upgrade in this order, fixing install/runtime breaks after each group:

- [x] **1.** Express → latest **4.x** security release first (simpler). Optionally plan Express 5 later; not required in Part 1 if 4.x is enough. _(now `express@^4.22.3`)_
- [x] **2.** Multer → **2.x** (1.4.x has known issues; required before public uploads). _(now `multer@^2.4.0`)_
- [x] **3.** Mongoose → **8.x** first (stable path), then **9.x** only if 8 is clean. _(on `mongoose@^8.24.5`; defer 9.x until Mongo connection is verified locally)_
- [x] **4.** Remove deprecated Mongoose connect options: `useNewUrlParser`, `useUnifiedTopology`.
- [x] **5.** Update `bcrypt`, `jsonwebtoken`, `helmet`, `cors`, `morgan`, `dotenv` to current compatible versions. _(bcrypt 6, jwt 9.0.3, helmet 8, cors 2.8.6, morgan 1.10.1, dotenv 16.x)_
- [x] **6.** Re-run `npm install` / `npm ci` and start the server against MongoDB. _(install OK, 0 vulnerabilities; start runs but Atlas DNS failed: `ENOTFOUND` for cluster host — fix `MONGODB_URI` / network in Part 0.3)_

### Step 1.4 — Upgrade frontend packages (same stack)

Upgrade carefully; expect API/theme churn with MUI and Next:

- [x] **1.** Next.js → target **16.x** (13 is EOL; 15 security window is ending). Bring React to the version Next 16 requires (**React 19**). _(now `next@16.4.1`, `react@19.3.1`)_
- [x] **2.** Upgrade TypeScript, ESLint, `eslint-config-next` to match Next 16. _(TS 5.9.3, ESLint 9 flat config via `eslint.config.mjs`; `next lint` removed in Next 16 → `eslint .`)_
- [x] **3.** Material UI + icons + Emotion → move toward current stable MUI (stay on MUI; do **not** jump to alpha MUI 10). Prefer staged path if needed: MUI 5 → 6 → … → current stable. _(on MUI **9.5.0** + `@mui/material-nextjs`; system props migrated to `sx`)_
- [x] **4.** Redux Toolkit, react-redux, redux-persist → current compatible versions. _(RTK 2.13, react-redux 9.3, redux-persist 6; PersistGate typed for React 19)_
- [x] **5.** Formik, Yup, react-dropzone → current compatible versions. _(formik 2.4.9, yup 1.7.1, react-dropzone 14.4.1)_
- [x] **6.** Fix Next 15+/16 breaking changes that appear immediately:
  - [x] `params` may be async in dynamic routes (`profile/[userId]`).
  - [x] Any App Router / font / image API changes. _(AppRouterCacheProvider; metadata title MockBook)_
  - [x] Ensure client components still work with Redux + MUI ThemeProvider.

### Step 1.5 — Environment and config modernization (still Part 1)

- [ ] Introduce `NEXT_PUBLIC_API_URL` (or equivalent) and stop hardcoding `localhost:5000` in a shared API helper (create the helper; wire call sites in Part 2 if needed, but define the pattern now).
- [x] Document required env vars in README.
- [x] Ensure `backend/public/assets` exists (or document that Multer destination must exist).
- [x] Align CI Node version with local (Node 20) in lint/test workflows if needed.
- [x] Split CI into four workflows: `backend-lint.yml`, `backend-test.yml`, `frontend-lint.yml`, `frontend-test.yml` (each installs from root workspace).

### Step 1.6 — Part 1 exit criteria

- [x] Unused packages removed.
- [x] `npm ci` works from the **repo root** (workspaces; single root `package-lock.json`).
- [ ] Backend starts and connects to MongoDB.
- [x] Frontend `npm run build` succeeds (even if some features still broken).
- [x] GitHub lint/test workflows can run without missing-script failures (or scripts intentionally temporary).
- [x] No stack swaps (still MUI + Mongoose + Express + Next).

---

# Part 2 — Make the existing product actually work

**Goal:** Every feature that the UI already promises for core social use works correctly. No new major features yet—fix the broken tutorial wiring.

### Step 2.1 — Auth and routing

- [ ] Fix `AuthProvider` so `/login` and `/register` are public; protect only authenticated app routes (`/home`, `/profile`, etc.).
- [ ] After successful login → go to `/home`.
- [ ] After successful register → go to `/login` (or auto-login if you prefer; pick one and stick to it).
- [ ] Logout clears state **and** navigates to `/login`.
- [ ] Root `/` redirects to `/home` if logged in, else `/login`.
- [ ] Login/register must check `response.ok` (or status); do not treat error JSON as success.
- [ ] Never persist or return password hashes to the client (strip on every auth/user response).

### Step 2.2 — Register + profile photo

- [ ] Map uploaded file to `picturePath` on the User model (schema field vs form field mismatch).
- [ ] Fix double-append of `picture` in FormData.
- [ ] Ensure Multer destination folder exists; unique filenames (no overwrite by original name).
- [ ] Serve images from `/assets/...` and load them in `UserImage` via env-based API URL.
- [ ] Validate email uniqueness with a clear UI error.

### Step 2.3 — Create post

- [ ] Align frontend URL with backend route (`/post` vs `/posts`)—pick one canonical route and use it everywhere.
- [ ] Await `response.json()` correctly.
- [ ] Dispatch posts into Redux with the shape the reducer expects (`posts` array).
- [ ] Support text-only and image posts.
- [ ] Clear composer after success; show error on failure.
- [ ] Fix theme token typo (`mediumMan` → `mediumMain`) so composer icons render correctly.

### Step 2.4 — Feed and post author data

- [ ] Populate or attach author info (`firstName`, `lastName`, `location`, `picturePath`) on feed posts so cards do not show `undefined`.
- [ ] Ensure likes Map serializes correctly to the client (object keys).
- [ ] Fix Redux `setPost` to match Mongo `_id` (not `id` / missing `postId`).
- [ ] Like/unlike updates the correct post in the list immediately.

### Step 2.5 — Friends

- [ ] Fix friends list fetch URL (`/users/:id/friends`).
- [ ] Normalize friend shape everywhere (either always ids in DB + formatted objects in UI, or one consistent client type).
- [ ] Add/remove friend updates list and button state (PersonAdd / PersonRemove).
- [ ] Prevent adding yourself.
- [ ] Empty state when a user has no friends.

### Step 2.6 — Profiles

- [ ] Own profile (`/profile`) loads the logged-in user (not empty `id`).
- [ ] Other profile (`/profile/[userId]`) loads that user.
- [ ] Profile page uses `isProfile={true}` so it shows that user’s posts, not the global feed.
- [ ] Fix unused/wrong `getUserPosts` fetch on profile.
- [ ] Clicking a name/avatar navigates to the correct profile and refreshes data.

### Step 2.7 — Schema and API correctness (blocking bugs)

- [ ] User string length validators: use `minlength` / `maxlength` (not `min` / `max`).
- [ ] Consider `friends: [{ type: ObjectId, ref: 'User' }]` for safer queries (still Mongoose).
- [ ] Invalid/missing JWT → **401/403**, not 500.
- [ ] Prefer `req.user.id` from JWT for like / friend / create-post ownership instead of trusting body/URL ids alone.
- [ ] CORS: allow frontend origin(s) only (tighten further in Part 7).

### Step 2.8 — Part 2 exit criteria

Manual smoke test:

- [ ] Register → login → see home.
- [ ] Create text post and image post; both appear in feed with author name/avatar.
- [ ] Like/unlike persists and updates count.
- [ ] Add/remove friend updates both sides’ friend lists.
- [ ] Own profile and other user’s profile show correct user + their posts.
- [ ] Logout returns to login; protected routes redirect when logged out.
- [ ] Light/dark toggle still works (refine visuals in Part 5).

---

# Part 3 — Security hardening (before public URL)

**Goal:** Safe enough for a real deployment. Still same stack.

### Step 3.1 — Auth hardening

- [ ] JWT expiration (e.g. access token hours/days).
- [ ] Optional later: refresh tokens (can defer to post-MVP if access expiry + re-login is acceptable).
- [ ] Password rules (min length, basic strength) on register schema + Yup.
- [ ] Consistent error messages for invalid login (no user enumeration if possible).
- [ ] Rate-limit login/register (express-rate-limit or host-level).

### Step 3.2 — Data exposure

- [ ] `password` never selected by default (`select: false`) or always stripped via toJSON transform.
- [ ] Audit every controller response for sensitive fields.
- [ ] Do not store password in redux-persist.

### Step 3.3 — Uploads

- [ ] File type whitelist (images only for MVP).
- [ ] File size limit.
- [ ] Generated unique filenames.
- [ ] Reject non-image MIME types server-side.

### Step 3.4 — API hygiene

- [ ] Central error handler middleware.
- [ ] Validate ObjectIds before `findById`.
- [ ] Helmet kept; review CSP if serving pages from API later (usually not).
- [ ] No secrets in client bundles.

### Step 3.5 — Part 3 exit criteria

- [ ] Cannot act as another user with a stolen-but-valid pattern of body ids alone.
- [ ] Tokens expire.
- [ ] Password hashes never leave the API.
- [ ] Upload abuse is limited.

---

# Part 4 — Complete MVP features

**Goal:** Ship a complete social MVP. Build the features the product needs—not every navbar icon from the tutorial.

### Step 4.1 — Comments (required)

- [ ] Backend: add comment to a post (store author id + text + timestamp; improve beyond bare strings if possible).
- [ ] Backend: delete own comment (optional but recommended).
- [ ] Frontend: comment input under a post; list comments with author name.
- [ ] Update Redux/post state after add/delete.

### Step 4.2 — Like comments (required)

- [ ] Model comment likes (e.g. likes map/set on each comment, or equivalent).
- [ ] Backend: toggle like on a comment; return updated like count / liked-by-me state.
- [ ] Frontend: like/unlike control on each comment; update UI immediately.
- [ ] Only authenticated users; derive identity from JWT.

### Step 4.3 — Save / bookmark posts (required)

- [ ] Store saved posts per user (e.g. `savedPosts: [ObjectId]` on User, or a SavedPost collection).
- [ ] Backend: save / unsave a post; list saved posts for the logged-in user.
- [ ] Frontend: save/unsave control on post cards; “Saved” view or filter (own list).
- [ ] Empty state when the user has no saved posts.

### Step 4.4 — Post management (required)

- [ ] Edit own post (description; optionally replace image).
- [ ] Delete own post.
- [ ] Only owner can edit/delete (enforce on server via JWT).

### Step 4.5 — Profile editing (required)

- [ ] Edit first/last name, location, occupation.
- [ ] Change profile picture.
- [ ] Persist to MongoDB; update Redux user.

### Step 4.6 — Search users (required for navbar usefulness)

- [ ] Backend search by name/email (simple query).
- [ ] Frontend search box in navbar → results → profile navigation.
- [ ] Empty and loading states.

### Step 4.7 — Feed quality (required for scale)

- [ ] **Home feed uses infinite scrolling** (cursor/offset + limit API; load more as the user nears the bottom—no page numbers / “Next page” UI).
- [ ] Profile posts use the same infinite-scroll pattern (or a small shared hook).
- [ ] Newest-first sorting.
- [ ] Loading skeletons / spinners for initial load and “loading more.”
- [ ] Empty feed state (“No posts yet”).
- [ ] End-of-feed state when there are no more posts.

### Step 4.8 — Profile stats (light)

- [ ] Increment `viewedProfile` when visiting another user’s profile.
- [ ] Optionally increment `impressions` when posts appear in feed (keep simple; avoid heavy analytics).

### Step 4.9 — Explicitly defer (post-MVP / Part 8+)

Do **not** block launch on these unless you want them in v1:

- Real-time messaging
- Notifications system
- Share to external networks
- GIF / audio / attachment composer actions
- Sponsored ads / “Create Ad”
- Editable Twitter/LinkedIn social links

If you keep the icons for visual polish, either hide them or show “Coming soon”—do not leave dead clickable chrome without feedback.

### Step 4.10 — Part 4 exit criteria

- [ ] Users can comment, like comments, save/unsave posts, edit/delete their posts, edit profile, search users, and browse an infinite-scrolling home feed.
- [ ] Server enforces ownership on mutating routes.

---

# Part 5 — UI/UX overhaul (modern, beautiful, light + dark)

**Goal:** Keep Material UI. Make the product look intentional and modern—not a default tutorial skin. Light and dark must both look excellent.

### Step 5.1 — Design system on top of MUI

- [ ] Define a clear visual direction (colors, radius, spacing, elevation, typography) via MUI theme tokens.
- [ ] Keep and refine **light and dark** palettes (you already have mode toggle + redux-persist).
- [ ] Choose distinctive typography (via `next/font`)—avoid looking like an untouched Inter + cyan tutorial default unless you deliberately redesign that cyan system into something stronger.
- [ ] Consistent spacing scale, card/widget surfaces, and focus states for accessibility.
- [ ] Shared layout shell (navbar + page gutters) so home/profile feel like one product.

### Step 5.2 — Core screens polish

Polish each screen with one job, clear hierarchy, and responsive layout:

- [ ] Login / Register (brand presence, calm form layout, clear errors).
- [ ] Home feed (composer + feed rhythm; side widgets that do not clutter mobile).
- [ ] Profile (cover/header treatment optional; clear identity + posts).
- [ ] Navbar (search usable; account menu; theme toggle obvious).
- [ ] Empty / loading / error states that look designed, not blank.

### Step 5.3 — Component quality

- [ ] Post cards: readable type, image ratios, like/comment/save actions clear; comment likes visible.
- [ ] Friend rows and lists: consistent avatar, name, meta, action.
- [ ] Buttons, inputs, menus: hover/focus/active states in both themes.
- [ ] Mobile: drawer/menu already exists—make it feel finished.
- [ ] Prefer subtle motion (theme toggle, feed enter, button press)—2–3 intentional motions, not noise.

### Step 5.4 — Theme correctness

- [ ] Every custom color comes from theme palette (no hardcoded hex scattered for surfaces/text).
- [ ] Images and icons remain legible in both modes.
- [ ] Persist theme preference (already via redux-persist)—verify after upgrades.
- [ ] Optional: follow system preference on first visit, then user override.

### Step 5.5 — Content and branding

- [ ] Rename “MERN - Social Media” to **MockBook** (or final product name) everywhere: title, navbar, metadata, README.
- [ ] App icons / favicon.
- [ ] Fix copy typos (e.g. “Likedin”).
- [ ] Remove or restyle placeholder ad widget; if kept, make it look intentional or replace with a useful widget (trending users, tips).

### Step 5.6 — Part 5 exit criteria

- [ ] Side-by-side light/dark review on desktop and mobile widths.
- [ ] No broken image links for avatars/posts.
- [ ] Product feels cohesive enough to show publicly.

---

# Part 6 — Quality: lint, tests, DX

**Goal:** CI means something. Catch regressions before deploy.

### Step 6.1 — Linting

- [ ] Frontend: `eslint .` clean (fix or intentionally ignore with reasons). _(import sort + Prettier already configured)_
- [x] Backend: add ESLint (and Prettier if you want) with a real `npm run lint`. _(ESLint flat config + `simple-import-sort` + Prettier)_
- [ ] TypeScript: tighten obvious `any`s over time; fix theme typing (`palette.neutral`, etc.).
- [ ] Confirm `backend-lint.yml` and `frontend-lint.yml` pass on main.

### Step 6.2 — Testing strategy

Start practical, not exhaustive:

**Backend (recommended: Jest or Vitest + Supertest)**

- [ ] Auth: register, login, reject bad password.
- [ ] Posts: create, feed (cursor/limit for infinite scroll), like toggle.
- [ ] Comments: add, like toggle; save/unsave post.
- [ ] Friends: add/remove.
- [ ] Auth middleware rejects missing/invalid token.
- [ ] Use a test MongoDB (memory server or separate Atlas DB).

**Frontend (recommended: Vitest + React Testing Library; optional Playwright later)**

- [ ] Form validation (login/register schemas).
- [ ] Redux reducers (`setLogin`, `setPost`, `setFriends`).
- [ ] Critical component smoke tests.
- [ ] Optional e2e: login → create post → like.

### Step 6.3 — Wire CI

- [ ] Replace placeholder `test` scripts with real runners.
- [ ] Ensure `backend-test.yml` and `frontend-test.yml` pass.
- [x] Keep lint and test workflows separate (four workflows: backend/frontend × lint/test).

### Step 6.4 — Developer experience

- [ ] README: setup, env vars, scripts, API overview.
- [x] Optional: example `.env.example` files (no secrets). _(backend + frontend examples added)_
- [ ] Optional: seed script for demo users/posts.

### Step 6.5 — Part 6 exit criteria

- [ ] Lint workflow green.
- [ ] Test workflow green with at least a meaningful backend suite.
- [ ] New contributors can run the app from README alone.

---

# Part 7 — Deployment and live URL

**Goal:** Public production app. Keep MongoDB/Mongoose; no Postgres migration.

### Step 7.1 — Hosting topology (recommended)

- [ ] **Frontend:** Vercel (Next.js).
- [ ] **Backend:** Render / Railway / Fly / VPS.
- [ ] **Database:** MongoDB Atlas.
- [ ] Set production env vars on each host.

### Step 7.2 — Uploads in production

Local disk (`public/assets`) is unreliable on most PaaS (ephemeral filesystem).

Choose one approach (still Mongo-friendly / no stack betrayal):

- [ ] **Option A:** Cloud object storage (S3-compatible / Cloudinary) for images; store URLs in MongoDB. (Still Mongoose for app data.)
- [ ] **Option B:** GridFS via official MongoDB driver patterns (not the abandoned `gridfs-stream` package).
- [ ] **Option C:** Host API on a VPS with persistent disk.

Pick A or B for a real live URL.

### Step 7.3 — Production config

- [ ] `NEXT_PUBLIC_API_URL` points to production API.
- [ ] CORS allowlist = production frontend origin.
- [ ] Secure cookies only if you later move tokens to httpOnly cookies (optional improvement).
- [ ] HTTPS everywhere.
- [ ] Remove debug `console.log` of request bodies.

### Step 7.4 — Launch checklist

- [ ] Smoke test production: register, login, post, like, friend, comment, like comment, save post, infinite-scroll feed, profile, theme.
- [ ] Confirm images load on production URLs.
- [ ] Confirm CI on main is green.
- [ ] Custom domain (optional) for frontend (and API subdomain if desired).

### Step 7.5 — Part 7 exit criteria

- [ ] Shareable live URL.
- [ ] Data persists in Atlas across deploys.
- [ ] Uploads persist (not wiped on restart).

---

# Part 8 — Post-MVP enhancements (optional)

Do these only after Parts 1–7. Still same core stack.

### Step 8.1 — Social depth

- [ ] Notifications (likes, comments, friend adds)—in-app list first; realtime later.
- [ ] Real-time messaging (Socket.IO or similar) if you want chat.
- [ ] Friend requests (pending/accept) instead of instant add.
- [ ] Report/block user (moderation basics).

### Step 8.2 — Media and composer

- [ ] Multiple images per post.
- [ ] Image compression/resizing.
- [ ] Optional GIF support via a provider.
- [ ] Soft-delete posts.

### Step 8.3 — Performance and polish

- [ ] Virtualized long feeds if needed.
- [ ] Optimistic UI for likes/comments.
- [ ] Image CDN caching.
- [ ] Accessibility audit (keyboard, contrast, labels).
- [ ] SEO/metadata for public profiles if profiles become public.

### Step 8.4 — Ops

- [ ] Structured logging.
- [ ] Error monitoring (e.g. Sentry).
- [ ] Uptime check on API health route (`GET /health`).
- [ ] Backup strategy for Atlas.

---

# Suggested order of work (summary)

| Part | Name            | Outcome                                                      |
| ---- | --------------- | ------------------------------------------------------------ |
| 0    | Prep            | Secrets safe, branch ready                                   |
| 1    | Clean + upgrade | Unused modules gone; modern Next/MUI/Mongoose/Multer; builds |
| 2    | Fix core flows  | Auth, posts, likes, friends, profiles actually work          |
| 3    | Security        | Tokens, passwords, uploads, authorization                    |
| 4    | MVP features    | Comments, comment likes, saved posts, edit/delete, search, infinite scroll |
| 5    | UI overhaul     | Beautiful modern MUI UI; strong light + dark                 |
| 6    | Lint & tests    | CI meaningful and green                                      |
| 7    | Deploy          | Live URL                                                     |
| 8    | Post-MVP        | Chat, notifications, extras                                  |

**Recommended focus rule:**  
Part 1 → Part 2 → Part 5 (partial theme fixes as you go) → Part 3 → Part 4 → finish Part 5 → Part 6 → Part 7.  
You may do light UI fixes during Part 2 so debugging is pleasant, but save the full visual redesign for Part 5 so you are not restyling broken screens twice.

---

# Feature backlog (checklist)

### Must have for “finished MVP”

- [ ] Register / Login / Logout
- [ ] Protected routes
- [ ] Create post (text + image)
- [ ] Home feed (infinite scroll)
- [ ] Like / unlike posts
- [ ] Comments (add + list; delete own)
- [ ] Like / unlike comments
- [ ] Save / unsave posts (+ saved list)
- [ ] Edit / delete own posts
- [ ] Friends add/remove + friends list
- [ ] Own profile + other user profile
- [ ] Edit profile + avatar
- [ ] User search
- [ ] Light + dark theme (polished)
- [ ] Modern UI across all main screens
- [ ] Env-based API URL
- [ ] Production deploy

### Nice to have (after MVP)

- [ ] Notifications
- [ ] Messaging
- [ ] Friend requests
- [ ] Share
- [ ] Ads / sponsored content
- [ ] Social links editing
- [ ] GIF/audio attachments
- [ ] Admin moderation

### Explicitly out of scope for stack integrity

- [ ] Do **not** replace MUI with another UI kit
- [ ] Do **not** replace Mongoose/MongoDB with PostgreSQL/Prisma/etc.
- [ ] Do **not** replace Next.js with CRA/Vite-only SPA unless you later choose a full rewrite (not this plan)

---

# Known bugs to fix (map to parts)

| Issue                                  | Fix in         |
| -------------------------------------- | -------------- |
| Unused packages installed              | Part 1         |
| Outdated Next/MUI/Multer/Mongoose      | Part 1         |
| AuthProvider blocks register           | Part 2         |
| Create post wrong URL / Redux dispatch | Part 2         |
| Like reducer `_id` mismatch            | Part 2         |
| Friends list wrong URL / shape         | Part 2         |
| Profile empty id / wrong posts query   | Part 2         |
| Post author undefined                  | Part 2         |
| `picture` vs `picturePath`             | Part 2         |
| `mediumMan` typo                       | Part 2         |
| Login treats errors as success         | Part 2         |
| Password hash leaked to client         | Part 2 + 3     |
| JWT never expires / body trust         | Part 3         |
| Upload overwrite / no limits           | Part 3         |
| String `min`/`max` on User schema      | Part 2         |
| Hardcoded localhost                    | Part 1–2       |
| Comments UI without API                | Part 4         |
| No comment likes                       | Part 4         |
| No save/bookmark posts                 | Part 4         |
| Feed paging UX (use infinite scroll)   | Part 4         |
| Search/messages/etc. placeholders      | Part 4 / defer |
| Tutorial look                          | Part 5         |
| No real tests                          | Part 6         |
| Ephemeral uploads on PaaS              | Part 7         |

---

# Definition of Done (whole project)

The project is done for v1 when:

1. Parts 1–7 checkboxes for MVP items are complete.
2. A stranger can open the live URL, create an account, post, interact, and use light/dark mode without hitting tutorial breakage.
3. Lint and test workflows pass on the default branch.
4. README explains setup and deployment.
5. Stack is still Next + MUI + Express + Mongoose/MongoDB.

---

# How to use this plan day to day

1. Pick the lowest unfinished Part.
2. Complete one Step fully (**check boxes `[x]` in this file when done**).
3. Manually smoke-test related flows before moving on.
4. Commit in small chunks (e.g. “Part 2.3 — fix create post”) and include plan checkbox updates in the same work.
5. Do not start Part 7 until Parts 2–4 MVP paths work on production-like env vars.
6. When unsure whether something is MVP: if it is in **Must have** above, build it; if it is in **Nice to have**, park it in Part 8.
7. Agents/humans: after finishing any listed task, update `PROJECT_PLAN.md` before moving on.

---

_This file is a process document only. Implement features and fixes in the codebase following each step; do not treat this plan as application code._
