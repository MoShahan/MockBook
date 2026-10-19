# Xivi

A social networking app built as an **npm workspaces** monorepo: Next.js frontend + Express API + MongoDB.

Post text and images, like and comment, send friend requests, follow people, browse profiles, and use light/dark mode — with Bearer JWT auth and ImageKit uploads.

**Author:** Mohammed Shahan

---

## Documentation

| Doc                                        | Contents                               |
| ------------------------------------------ | -------------------------------------- |
| [Features](./docs/FEATURES.md)             | What the app does today + coming soon  |
| [Design roadmap](./docs/DESIGN_ROADMAP.md) | UI journey Phases 0–3 with screenshots |
| [API overview](./docs/API.md)              | REST endpoints and auth header         |
| [Database schema](./docs/SCHEMA.md)        | Collections, fields, indexes           |
| [ER diagram](./docs/ERD.md)                | Visual entity relationships            |

---

## Stack

| Layer    | Technologies                                                                                           |
| -------- | ------------------------------------------------------------------------------------------------------ |
| Frontend | Next.js 16 (App Router), React 19, TypeScript, Material UI 9, Redux Toolkit, Formik, Yup, axios        |
| Backend  | Node.js, Express 4.22, JWT (access + refresh), bcrypt, Multer 2, Helmet, CORS, rate limiting, ImageKit |
| Database | MongoDB + Mongoose 8                                                                                   |

---

## Project structure

```text
Xivi/
├── frontend/          Next.js app (UI)
├── backend/           Express API
│   ├── models/        User, Post, FriendRequest, Notification
│   ├── routes/
│   ├── controllers/
│   └── middleware/
├── docs/              Features, API, schema, ERD
├── package.json       npm workspaces root
└── README.md
```

---

## Requirements

- **Node.js 20+** (CI uses 22)
- **npm 9+** (workspaces)
- **MongoDB** (local or [Atlas](https://www.mongodb.com/atlas))
- **ImageKit** account (for post/avatar image uploads)
- Optional: Google / GitHub / Discord OAuth apps

---

## Quick start

### 1. Install

From the **repo root**:

```bash
npm install
```

### 2. Environment files

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

Fill in at least these **backend** values in `backend/.env`:

| Variable                | Required | Purpose                                                  |
| ----------------------- | -------- | -------------------------------------------------------- |
| `MONGODB_URI`           | Yes      | Mongo connection string                                  |
| `ACCESS_TOKEN_SECRET`   | Yes      | Access JWT signing secret                                |
| `IMAGEKIT_PUBLIC_KEY`   | Yes*     | Image uploads                                            |
| `IMAGEKIT_PRIVATE_KEY`  | Yes*     | Image uploads (server only)                              |
| `IMAGEKIT_URL_ENDPOINT` | Yes*     | ImageKit CDN endpoint                                    |
| `PORT`                  | No       | API port (default `5000`)                                |
| `REFRESH_TOKEN_SECRET`  | No       | Prefer separate secret in production                     |
| `FRONTEND_URL`          | No       | CORS origins (default `http://localhost:3000`)           |
| `API_PUBLIC_URL`        | No       | OAuth callback base (default `http://localhost:5000`)    |
| `ADMIN_EMAILS`          | No       | Comma-separated admin emails (local only — never commit) |

\*Needed to create posts/avatars with images. Text-only flows can run without ImageKit, but image upload will fail.

**Frontend** (`frontend/.env.local`):

| Variable              | Required | Purpose                         |
| --------------------- | -------- | ------------------------------- |
| `NEXT_PUBLIC_API_URL` | No*      | API base URL, no trailing slash |

\*Defaults to `http://localhost:5000` if unset.

Full variable list and OAuth keys: see [`backend/.env.example`](./backend/.env.example) and [`frontend/.env.example`](./frontend/.env.example).

Optional admin seed (after setting `ADMIN_EMAILS` + `ADMIN_PASSWORD` in `backend/.env`):

```bash
npm run seed:admins -w backend
```

Details: [Features → Admin](./docs/FEATURES.md#admin).

### 3. Run

```bash
npm run dev
```

| App      | URL                                            |
| -------- | ---------------------------------------------- |
| Frontend | [http://localhost:3000](http://localhost:3000) |
| Backend  | [http://localhost:5000](http://localhost:5000) |

Run separately if you prefer:

```bash
npm run dev:backend
npm run dev:frontend
```

---

## Scripts

### Root

| Command                | Description                 |
| ---------------------- | --------------------------- |
| `npm install`          | Install all workspace deps  |
| `npm run dev`          | Backend + frontend together |
| `npm run build`        | Production build (frontend) |
| `npm run lint`         | Lint both packages          |
| `npm run lint:fix`     | Auto-fix ESLint issues      |
| `npm run format`       | Format with Prettier        |
| `npm run format:check` | Check Prettier formatting   |
| `npm run test`         | Frontend + backend tests    |
| `npm run typecheck`    | Frontend `tsc --noEmit`     |

### Workspace examples

```bash
npm run lint -w frontend
npm run lint -w backend
npm run test -w frontend
npm run test -w backend
npm run typecheck -w frontend
npm run start -w backend
```

Backend tests use **in-memory MongoDB** (`mongodb-memory-server`) — no Atlas URI required for `npm run test -w backend`.

---

## CI

GitHub Actions (Node 22, install from repo root):

| Workflow           | Command                         |
| ------------------ | ------------------------------- |
| Backend Lint       | `npm run lint -w backend`       |
| Backend Test       | `npm run test -w backend`       |
| Frontend Lint      | `npm run lint -w frontend`      |
| Frontend Test      | `npm run test -w frontend`      |
| Frontend Typecheck | `npm run typecheck -w frontend` |

---

## Auth note

The API uses **Bearer JWTs** (`Authorization: Bearer <accessToken>`), not cookie sessions. Access and refresh tokens are issued on login/register; refresh tokens are **rotated and stored hashed** server-side; `POST /auth/logout` revokes the session. The frontend refreshes silently on `401`. See [API overview](./docs/API.md).

**Residual risk:** access + refresh JWTs are kept in the browser (Redux Persist / localStorage). Any XSS that can read storage can steal the session. Mitigations in place include Helmet CSP on the API, CSP/security headers on Next.js, input escaping via React, and short-lived access tokens (default `1h`). Do **not** switch to HTTP-only cookies unless you deliberately redesign auth.

## Profile connections

Profiles expose **`friendCount` / `followerCount` / `followingCount`** on `GET /users/:id` (and auth user payloads). Lists are paginated:

| Endpoint                                  | Meaning                 |
| ----------------------------------------- | ----------------------- |
| `GET /users/:id/friends?cursor=&limit=`   | Mutual friends          |
| `GET /users/:id/followers?cursor=&limit=` | People who follow `:id` |
| `GET /users/:id/following?cursor=&limit=` | People `:id` follows    |

Response shape: `{ users, nextCursor, hasMore, total }` (default limit 20, max 30). Each row includes a `relationship` object for the viewer.

---

## License / private

Private project (`"private": true` in root `package.json`). Do not commit secrets (`.env`, admin passwords, ImageKit private key).
