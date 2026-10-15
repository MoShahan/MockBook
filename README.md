# MockBook

Social app built with the MERN stack: a Next.js frontend and an Express API backed by MongoDB. People can register, log in, write posts, like posts, and add or remove friends.

By Mohammed Shahan.

> This project is being modernized. See [`PROJECT_PLAN.md`](./PROJECT_PLAN.md) for the step-by-step completion plan.

## Stack

| Layer    | Technologies                                                                                                     |
| -------- | ---------------------------------------------------------------------------------------------------------------- |
| Frontend | Next.js 16 (App Router), React 19, TypeScript, Material UI 9, Emotion, Formik, Yup, Redux Toolkit, redux-persist, axios |
| Backend  | Node.js, Express 4.22, JWT, bcrypt 6, Multer 2                                                                   |
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

**Working or partially wired**

- Register and log in
- Create a post (with optional image)
- Home feed and profile pages
- Like / unlike a post
- Add / remove friends
- Light and dark mode

**Not finished yet** (see the plan)

- Comments, search, edit/delete posts, profile editing
- Messages, notifications, share
- Production deploy and hardened security

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

**Backend** (`backend/.env`) — see also `backend/.env.example`:

```text
PORT=5000
MONGODB_USERNAME=your_atlas_db_user
MONGODB_PASSWORD=your_atlas_db_password
MONGODB_URI=mongodb+srv://USER:PASSWORD@CLUSTER.mongodb.net/mockbook?retryWrites=true&w=majority
ACCESS_TOKEN_SECRET=a-long-random-string
FRONTEND_URL=http://localhost:3000
```

| Variable              | Required by app | Purpose                                                                 |
| --------------------- | --------------- | ----------------------------------------------------------------------- |
| `PORT`                | Yes             | API listen port (local default `5000`)                                  |
| `MONGODB_URI`         | Yes             | Full MongoDB connection string (Atlas or local)                         |
| `ACCESS_TOKEN_SECRET` | Yes             | Secret used to sign JWTs                                                |
| `FRONTEND_URL`        | No*             | Comma-separated browser origins allowed by CORS (default `http://localhost:3000`) |
| `MONGODB_USERNAME`    | No              | Optional reference; credentials must still be inside `MONGODB_URI`      |
| `MONGODB_PASSWORD`    | No              | Optional reference; credentials must still be inside `MONGODB_URI`      |

\*Defaults to `http://localhost:3000` if unset. Set explicitly when the Next.js app runs on another origin.

The backend currently connects with `process.env.MONGODB_URI` only. Username/password env vars are handy notes; they are not read by the code unless you wire them in later.

**Frontend** (`frontend/.env.local`) — see also `frontend/.env.example`:

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

| Method  | Path                   | Purpose                                                      |
| ------- | ---------------------- | ------------------------------------------------------------ |
| `POST`  | `/auth/register`       | Create an account (JSON: name, email, password)              |
| `POST`  | `/auth/login`          | Log in; returns a JWT                                        |
| `GET`   | `/users/:id`           | Get a user                                                   |
| `GET`   | `/users/:id/friends`   | Get that user's friends                                      |
| `PATCH` | `/users/:id/:friendId` | Add or remove a friend                                       |
| `POST`  | `/posts`               | Create a post (multipart optional field `picture` → ImageKit)|
| `GET`   | `/posts`               | Feed                                                         |
| `GET`   | `/posts/:userId/posts` | One user's posts                                             |
| `PATCH` | `/posts/:postId/like`  | Like or unlike                                               |

Routes other than register and login expect:

```http
Authorization: Bearer <token>
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
