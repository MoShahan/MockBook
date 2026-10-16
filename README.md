# MockBook

Social app built with the MERN stack: a Next.js frontend and an Express API backed by MongoDB. Register, post (text + images), like, comment, friend others, and browse profiles - with light/dark mode and a hardened auth API.

By Mohammed Shahan.

> This project is being modernized. See [`PROJECT_PLAN.md`](./PROJECT_PLAN.md) for the step-by-step completion plan (and what’s still TODO).

## Stack

| Layer    | Technologies                                                                                                     |
| -------- | ---------------------------------------------------------------------------------------------------------------- |
| Frontend | Next.js 16 (App Router), React 19, TypeScript, Material UI 9, Emotion, Formik, Yup, Redux Toolkit, redux-persist, axios |
| Backend  | Node.js, Express 4.22, JWT (access + refresh), bcrypt 6, Multer 2, Helmet, CORS allowlist, express-rate-limit, ImageKit |
| Database | MongoDB with Mongoose 8                                                                                          |

## Project structure

```text
MockBook/
├── frontend/                 Next.js app
├── backend/                  Express API
│   ├── models/               User, Post
│   ├── routes/               auth, users, posts
│   ├── controllers/
│   └── middleware/           JWT check
├── package.json              npm workspaces root
└── PROJECT_PLAN.md           upgrade / feature plan
```

## Features

### Auth & accounts

- Register (slim form: first name, last name, email, password + confirm)
- Auto-login after register (lands on home)
- Log in / log out
- Password show/hide on auth forms
- Client + server password policy on register (8-24 chars; upper, lower, number, symbol)
- Protected routes (`AuthProvider`); guests redirected to login
- Bearer **access JWT** (default expiry **1 day**) + **refresh JWT** (default **7 days**)
- Silent token refresh on API `401` (axios interceptor); logout if refresh fails
- Password hashes never returned to the client (`select: false` + strip on responses)
- Rate limiting on login / register / refresh
- Consistent “Invalid credentials” login errors (no email enumeration)

### Posts & feed

- Create text and/or image posts (emoji picker on the compose bar; image dropzone with preview)
- Home feed with author name, avatar, and relative time
- Infinite scroll on home feed and profile Posts tab (`?limit=&cursor=`)
- Home feed tabs: **Friends** (you + friends) and **Everyone** (`GET /posts?scope=friends|all`)
- Like / unlike posts (count updates in UI)
- View who liked a post (click like count → list with profiles)
- Save / unsave posts (bookmark on post cards; list via `GET /posts/saved`)
- Own profile tabs: Posts / Saved / Liked / Commented (`?tab=`); other profiles show Posts only
- Comment on posts (add + list with author)
- Edit / delete **own** comments (⋮ menu; confirm on delete)
- Like / unlike comments (heart + count on each comment)
- View who liked a comment (click comment like count → list with profiles)
- Edit **own** posts (⋮ → Edit; text + replace/remove image)
- Delete **own** posts (⋮ menu + confirm dialog)
- Single-post page at `/post/[postId]`; Share menu (copy link, X, Facebook, LinkedIn, WhatsApp)

### Friends & profiles

- Add / remove friends (both users’ lists update)
- Friends list on profile pages (empty state when none)
- **Add people** discovery widget on `/home` (sticky right rail on wide screens; collapsible “Find people” on mobile) with recent users + name search
- Own profile (`/profile`) and other profiles (`/profile/[userId]`)
- Edit own profile (name, location, occupation, avatar, social handles, **avatar color**, **cover color**) via manage-account control
- Solid color profile header (`coverColor`) and initials avatar color (`avatarColor`) when no photo - allowlisted swatches only
- Optional public social links (Facebook, X, LinkedIn, Instagram) - shown only when set
- Profile visit counter (`viewedProfile`) increments when another user loads your profile
- In-app notifications (likes, comments, friend adds) via navbar bell + `/notifications` page
- Optional OAuth sign-in: Google, GitHub, Discord (when configured in backend env)
- Click name/avatar to open the correct profile
- Add/remove friend on another user’s profile header and in friends lists (not on post cards)
- User details widget on profile only (not on home)

### Media & uploads

- Image uploads via **Multer (memory) → ImageKit**
- Image MIME whitelist (jpeg/png/gif/webp), **5MB** size limit
- Server-generated unique filenames
- Avatars fall back to initials (user-chosen solid color) when no photo

### UX & client architecture

- Light / dark mode (persisted)
- Stone-first theme + Fraunces / Source Sans 3; MockBook logo in the header
- Split **login/register** layout (`AuthLayout`): wave backdrop (`auth-wave-*.jpg`) + café/social panel on the left (`auth-panel-*.jpg`)
- **Help & FAQ** (`/help`) with Contact section; **Privacy** (`/privacy`) and **Terms** (`/terms`) - linked from navbar Help and auth footers
- Mobile nav uses a finished side drawer (account, profile, help, theme, log out)
- Toast / snackbar feedback for key actions
- Formik + Yup validation with visible field errors
- Shared **axios** client + Bearer request interceptor
- Redux Toolkit for auth, posts, theme (redux-persist)
- TypeScript frontend (no `any` in `frontend/src`)
- npm workspaces monorepo (`frontend` + `backend`)

### API security & hygiene

- CORS allowlist via `FRONTEND_URL`
- Helmet security headers
- Central error handler (no stack traces to clients)
- ObjectId validation on route params
- JWT identity for create post / like / comment / delete / friends (not body `userId` trust)
- Auth secrets and token lifetimes configurable via env

### Planned next (see `PROJECT_PLAN.md`)

- Further UI polish (Part 5); tests; production deploy
- Messaging / DMs - **out of scope**

## Requirements

- Node.js **20** (LTS)
- A MongoDB database (local or Atlas)
- npm 9+ (workspaces)

## Setup

### 1. Install dependencies (from repo root)

```bash
npm install
```

This installs root tooling plus `frontend` and `backend` via npm workspaces.

### 2. Backend environment

Copy the examples, then fill in real values (never commit the real files):

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

**Backend** (`backend/.env`) - see also `backend/.env.example`:

```text
PORT=5000
MONGODB_USERNAME=your_atlas_db_user
MONGODB_PASSWORD=your_atlas_db_password
MONGODB_URI=mongodb+srv://USER:PASSWORD@CLUSTER.mongodb.net/mockbook?retryWrites=true&w=majority
ACCESS_TOKEN_SECRET=a-long-random-string
REFRESH_TOKEN_SECRET=another-long-random-string
ACCESS_TOKEN_EXPIRES=1d
REFRESH_TOKEN_EXPIRES=7d
FRONTEND_URL=http://localhost:3000
```

| Variable               | Required by app | Purpose                                                                 |
| ---------------------- | --------------- | ----------------------------------------------------------------------- |
| `PORT`                 | Yes             | API listen port (local default `5000`)                                  |
| `MONGODB_URI`          | Yes             | Full MongoDB connection string (Atlas or local)                         |
| `ACCESS_TOKEN_SECRET`  | Yes             | Secret for access JWTs                                                  |
| `REFRESH_TOKEN_SECRET` | No*             | Secret for refresh JWTs; falls back to access secret if unset           |
| `ACCESS_TOKEN_EXPIRES` | No              | Access JWT lifetime (default `1d`; jsonwebtoken format e.g. `15m`, `1h`) |
| `REFRESH_TOKEN_EXPIRES`| No              | Refresh JWT lifetime (default `7d`)                                     |
| `FRONTEND_URL`         | No†             | Comma-separated browser origins allowed by CORS (default `http://localhost:3000`) |
| `MONGODB_USERNAME`     | No              | Optional reference; credentials must still be inside `MONGODB_URI`      |
| `MONGODB_PASSWORD`     | No              | Optional reference; credentials must still be inside `MONGODB_URI`      |

\*Set a distinct `REFRESH_TOKEN_SECRET` in production.  
†Defaults to `http://localhost:3000` if unset. Set explicitly when the Next.js app runs on another origin.

The backend currently connects with `process.env.MONGODB_URI` only. Username/password env vars are handy notes; they are not read by the code unless you wire them in later.

**Frontend** (`frontend/.env.local`) - see also `frontend/.env.example`:

| Variable              | Required | Purpose                                                                 |
| --------------------- | -------- | ----------------------------------------------------------------------- |
| `NEXT_PUBLIC_API_URL` | Yes*     | API base URL used by `frontend/src/lib/api.ts` (no trailing slash)      |

\*Falls back to `http://localhost:5000` if unset so local `npm run dev` still works. Set it explicitly for deploy and non-default ports.

### 3. Run locally

From the **repo root**, start API + Next.js together:

```bash
npm run dev
```

- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend: [http://localhost:5000](http://localhost:5000) (or your `PORT`)

Or run them separately:

```bash
npm run dev:backend
npm run dev:frontend
```

## Scripts

### Root

| Command                | What it does                                |
| ---------------------- | ------------------------------------------- |
| `npm install`          | Install all workspace dependencies          |
| `npm run dev`          | Run backend + frontend together             |
| `npm run dev:backend`  | Backend only (`node --watch`)               |
| `npm run dev:frontend` | Frontend only (`next dev`)                  |
| `npm run build`        | Production build of the frontend            |
| `npm run lint`         | Lint frontend and backend                   |
| `npm run lint:fix`     | Auto-fix ESLint issues (incl. import order) |
| `npm run format`       | Format with Prettier                        |
| `npm run format:check` | Check Prettier formatting                   |
| `npm run test`         | Test frontend and backend                   |

### Per package

```bash
npm run lint -w frontend
npm run lint -w backend
npm run test -w frontend
npm run test -w backend
npm run start -w backend
```

## API overview

| Method   | Path                         | Purpose                                                          |
| -------- | ---------------------------- | ---------------------------------------------------------------- |
| `POST`   | `/auth/register`             | Create account; returns user + access + refresh tokens           |
| `POST`   | `/auth/login`                | Log in; returns user + access + refresh tokens                   |
| `POST`   | `/auth/refresh`              | Exchange refresh token for a new access + refresh pair           |
| `GET`    | `/auth/me`                   | Current user (Bearer)                                            |
| `GET`    | `/auth/providers`            | Configured OAuth providers                                       |
| `GET`    | `/auth/:provider`            | Start OAuth (`google` \| `github` \| `discord`)                  |
| `GET`    | `/auth/:provider/callback`   | OAuth callback → redirect to FE with tokens in URL fragment      |
| `GET`    | `/notifications`             | Notifications page (`?limit=&cursor=` → `{ notifications, nextCursor, hasMore }`) |
| `GET`    | `/notifications/unread-count`| Unread notification count                                        |
| `PATCH`  | `/notifications/read-all`    | Mark all notifications read                                      |
| `PATCH`  | `/notifications/:id/read`    | Mark one notification read                                       |
| `GET`    | `/users/discover`            | Recent users or search (`?q=&limit=`; excludes self)             |
| `PATCH`  | `/users/me`                  | Update own profile (multipart optional `picture` → ImageKit; `avatarColor` / `coverColor` allowlisted hex) |
| `GET`    | `/users/:id`                 | Get a user (no password)                                         |
| `GET`    | `/users/:id/friends`         | Get that user’s friends (formatted)                              |
| `PATCH`  | `/users/friends/:friendId`   | Add or remove a friend (JWT user only)                           |
| `POST`   | `/posts`                     | Create a post (multipart optional `picture` → ImageKit); `{ post }` |
| `GET`    | `/posts`                     | Home feed (`?scope=all\|friends&limit=&cursor=` → `{ posts, nextCursor, hasMore, scope }`) |
| `GET`    | `/posts/saved`               | Logged-in user’s saved posts (newest save first)                 |
| `GET`    | `/posts/liked`               | Logged-in user’s liked posts (`createdAt` desc)                  |
| `GET`    | `/posts/commented`           | Posts the user commented on (`createdAt` desc; distinct)         |
| `GET`    | `/posts/:userId/posts`       | One user’s posts (same cursor pagination as feed)                |
| `GET`    | `/posts/:postId`             | Single post                                                      |
| `PUT`    | `/posts/:postId/save`        | Save/bookmark a post (idempotent)                                |
| `DELETE` | `/posts/:postId/save`        | Unsave a post                                                    |
| `PATCH`  | `/posts/:postId`             | Edit own post (multipart optional `picture`, `removeImage`)      |
| `GET`    | `/posts/:postId/likes`       | Users who liked the post (`?page=&limit=`, default 20, max 50)   |
| `PATCH`  | `/posts/:postId/like`        | Like or unlike                                                   |
| `POST`   | `/posts/:postId/comments`    | Add a comment                                                    |
| `PATCH`  | `/posts/:postId/comments/:commentId` | Edit own comment                                           |
| `DELETE` | `/posts/:postId/comments/:commentId` | Delete own comment                                       |
| `GET`    | `/posts/:postId/comments/:commentId/likes` | Users who liked a comment (`?page=&limit=`)           |
| `PATCH`  | `/posts/:postId/comments/:commentId/like` | Like or unlike a comment                                |
| `DELETE` | `/posts/:postId`             | Delete own post                                                  |

Routes other than register, login, and refresh expect:

```http
Authorization: Bearer <accessToken>
```

Post images are uploaded to **ImageKit** (Multer memory → ImageKit). MongoDB stores the returned HTTPS URL in `Post.url`. Configure `IMAGEKIT_*` in `backend/.env` (see `backend/.env.example`).

## CI

GitHub Actions workflows (Node 22, install from root workspace):

| Workflow             | Command                         |
| -------------------- | ------------------------------- |
| Backend Lint         | `npm run lint -w backend`       |
| Backend Test         | `npm run test -w backend`       |
| Frontend Lint        | `npm run lint -w frontend`      |
| Frontend Test        | `npm run test -w frontend`      |
| Frontend Typecheck   | `npm run typecheck -w frontend` |

Locally: `npm run typecheck` from the repo root.

## Roadmap

Full checklist lives in [`PROJECT_PLAN.md`](./PROJECT_PLAN.md): clean upgrades, fix broken flows, security, MVP features, UI polish, tests, and deploy.
