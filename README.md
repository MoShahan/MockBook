# Xivi

Social app built with the MERN stack: a Next.js frontend and an Express API backed by MongoDB. Register, post (text + images), like, comment, friend others, and browse profiles - with light/dark mode and a hardened auth API.

By Mohammed Shahan.

**Docs:** [Features](./docs/FEATURES.md) · [API overview](./docs/API.md) · [Database schema](./docs/SCHEMA.md) · [ER diagram](./docs/ERD.md)

## Stack

| Layer    | Technologies                                                                                                     |
| -------- | ---------------------------------------------------------------------------------------------------------------- |
| Frontend | Next.js 16 (App Router), React 19, TypeScript, Material UI 9, Emotion, Formik, Yup, Redux Toolkit, redux-persist, axios |
| Backend  | Node.js, Express 4.22, JWT (access + refresh), bcrypt 6, Multer 2, Helmet, CORS allowlist, express-rate-limit, ImageKit |
| Database | MongoDB with Mongoose 8                                                                                          |

## Project structure

```text
Xivi/
├── frontend/                 Next.js app
├── backend/                  Express API
│   ├── models/               User, Post
│   ├── routes/               auth, users, posts
│   ├── controllers/
│   └── middleware/           JWT check
├── docs/                     Product docs (features, API, schema, ERD)
├── package.json              npm workspaces root
└── README.md
```

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
MONGODB_URI=mongodb+srv://USER:PASSWORD@CLUSTER.mongodb.net/xivi?retryWrites=true&w=majority
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

Admin allowlist / seed password: `ADMIN_EMAILS` and `ADMIN_PASSWORD` in `backend/.env` only — see [Features → Admin](./docs/FEATURES.md#admin) and `backend/.env.example`.

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
| `npm run test`         | Test frontend (Vitest) and backend (node:test + MongoMemoryServer) |
| `npm run typecheck`    | Frontend `tsc --noEmit`                     |

### Per package

```bash
npm run lint -w frontend
npm run lint -w backend
npm run test -w frontend
npm run test -w backend
npm run typecheck -w frontend
npm run start -w backend
```

**Backend tests** use an in-memory MongoDB (`mongodb-memory-server`); no Atlas URI is required for `npm run test -w backend`.

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
