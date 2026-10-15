# MockBook — Agent Instructions

## Project mission

MockBook is a full-stack social networking application being revived from an older learning project. Improve it incrementally into a secure, maintainable, tested, and deployable application while preserving its existing product identity and core stack.

## Source-of-truth rules

- Inspect the repository before making assumptions. Read the **root** and app-level `package.json` files, scripts, existing routes, controllers, models, middleware, and README.
- This repo is an **npm workspaces monorepo** (`frontend`, `backend`). Install and run from the root (`npm install`, `npm run dev`, `npm ci`). Target a workspace with `-w frontend` / `-w backend` when needed.
- Treat the current code as the source of truth. Do not claim a feature exists until you find its implementation or verify it running.
- Do not replace working architecture just because another approach is fashionable.
- Keep a short implementation plan for non-trivial tasks. Identify affected frontend, backend, database, tests, and documentation.
- For multi-step revamp work, follow and update checkboxes in `PROJECT_PLAN.md` as tasks complete.
- If a requested change depends on unknown product behavior, ask one focused question or choose the smallest reversible default and state it.
- Never silently discard user changes, reset branches, rewrite Git history, or run destructive commands.

## Technology decisions

- Preserve the existing architecture unless the user explicitly approves a redesign: Next.js/React/TypeScript frontend, Node.js/Express REST API, MongoDB with Mongoose, Material UI, Redux Toolkit, Formik, Yup, **axios** for frontend HTTP, and the existing libraries where appropriate.
- Prefer TypeScript for new frontend code and for backend code only if the existing backend setup supports it cleanly. Do not convert the entire backend to TypeScript as part of an unrelated feature.
- Upgrade dependencies deliberately, one compatibility group at a time. Read official migration notes for major-version upgrades and run relevant checks after each step.
- Do not invent exact package versions. Inspect current package files and official compatibility information before recommending or installing versions.
- Keep frontend and backend as separate applications if that is how the repository is currently organized. Do not move the REST API into Next.js without explicit approval.
- Use the package manager and lockfile already in the repository (**npm** + root `package-lock.json` workspaces). Do not mix npm, pnpm, and Yarn lockfiles.

## Working process

1. Inspect relevant files and available scripts before editing.
2. Summarize the intended change briefly and identify important assumptions.
3. Implement the smallest complete vertical slice; avoid unrelated cleanup.
4. Add or update tests for changed behavior.
5. Run available checks from the **repo root** when possible: `npm run lint`, `npm run typecheck`, `npm run test`, `npm run build`, `npm run format:check` (or the matching `-w` scripts).
6. Review the diff for security, regressions, unused code, and accidental scope creep.
7. Report what changed, checks run, results, and anything not verified.

If a check cannot run, say why. Never claim tests passed unless they were actually executed and passed.

## Architecture conventions

### Frontend

- Use functional React components and hooks. Avoid class components for new code.
- Keep components focused. Separate reusable UI, feature-level components, API access, hooks, and types where doing so improves clarity.
- Reuse the project's Material UI theme, design tokens, and existing component patterns. Avoid one-off styling values when a shared theme token is appropriate.
- Keep API calls out of presentational components when a shared API helper is appropriate. Use the shared **axios** client in `frontend/src/lib/api.ts` (base URL from `NEXT_PUBLIC_API_URL`) for all Express API calls — do not use raw `fetch` for the API once Step 2.0 is done. Prefer an axios **request interceptor** to attach `Authorization: Bearer <token>` from Redux (Step 2.0b) instead of repeating auth headers at every call site. Do not introduce RTK Query mid-feature without explicit approval.
- Use Redux Toolkit for genuinely shared client state (auth user, token, posts, theme).
- Keep **Formik + Yup** for forms unless the user explicitly approves a different form/validation library.
- Auth today uses a **Bearer JWT** stored in Redux (and currently persisted via redux-persist). Do not casually change token storage or break login during unrelated features. Improving persistence/expiry belongs in a dedicated auth-hardening task (see `PROJECT_PLAN.md` Part 3). Never persist password hashes. Prefer not to widen what is persisted.
- Use `NEXT_PUBLIC_API_URL` for the API base URL once wired; until then, do not invent alternate env names. Align docs with code.
- Handle loading, empty, success, and error states for asynchronous screens.
- Use semantic HTML, accessible labels, keyboard interaction, and visible focus states.
- Keep forms validated on both client and server. Client validation is for UX, not a security boundary.
- Do not introduce a new state-management, form, styling, or data-fetching library (beyond axios, which is the planned FE HTTP client) without explaining the benefit and getting approval.

### Backend

- Preserve the existing Express routing/controller/model conventions unless a task specifically improves them.
- Keep route handlers readable. Extract business logic into services only when it improves reuse, testability, or separation of concerns.
- Validate request bodies, params, and query strings at the API boundary using the project's existing validation approach or a consistent schema validator.
- Use centralized error handling and consistent HTTP status codes. Do not expose stack traces, secrets, database internals, or sensitive information to clients.
- Use async/await and handle rejected promises explicitly according to the installed Express version.
- Use Mongoose schemas with appropriate required fields, enums, indexes, and timestamps where justified.
- Add pagination and bounded limits to list endpoints. Do not return unbounded collections in production-facing endpoints.
- Use explicit projections/DTOs so password hashes and internal fields are never returned to clients.
- Never trust `userId`, role, ownership, or permissions supplied by the request body or URL without checking them against the authenticated principal and resource.
- Keep controllers thin enough to understand; avoid premature abstraction and unnecessary layers.

### Authentication and authorization

- Authentication proves who the caller is; authorization decides what they may do. Implement both.
- Verify JWT signature, expiry, and expected claims. Keep signing secrets in environment variables and fail safely if required configuration is missing.
- Derive the current user's identity from verified authentication middleware, not a client-submitted identity field.
- Check resource ownership and relationship permissions for editing/deleting posts, profile changes, friendships, comments, and private content.
- Use secure password hashing with the project's supported password-hashing library. Never log passwords or tokens.
- **Session strategy is Bearer JWT** (`Authorization: Bearer <token>`), not HTTP-only cookies. Do not switch to cookie sessions unless the user explicitly asks. Document and enforce token storage, expiry, and logout deliberately; harden expiry/authorization in dedicated security work.
- Add rate limiting to login and other abuse-prone endpoints. Avoid revealing whether a specific email address is registered where that creates account-enumeration risk.
- Do not weaken authentication or authorization to make a test pass.

### Uploads

- Validate file size, actual content/type, and allowed extensions. Do not trust the client-supplied MIME type alone.
- Generate server-controlled unique filenames or use a managed object-storage provider. Do not use raw original filenames as storage paths.
- Prevent path traversal, executable uploads, and accidental public exposure of private files.
- Store upload metadata safely. Do not commit uploaded user content or credentials.
- Make upload errors clear and return a safe response.

### Database and data integrity

- Use Mongoose models and the existing MongoDB database unless a migration is explicitly requested.
- Add indexes based on real query patterns; explain trade-offs for compound indexes.
- Ensure multi-document updates preserve invariants. Consider transactions only when the deployment supports them and the consistency requirement justifies them.
- Validate MongoDB ObjectIds and handle missing records explicitly.
- Never run destructive migrations or drop collections without explicit user approval and a backup/rollback plan.
- Keep secrets in environment variables; maintain sanitized `.env.example` files with placeholders only.
- Backend env (actual names in code/examples): `PORT`, `MONGODB_URI` (required), `ACCESS_TOKEN_SECRET`; optional reference-only `MONGODB_USERNAME` / `MONGODB_PASSWORD`. Do not invent `MONGODB_URL` — the code uses `MONGODB_URI`.
- Frontend env: `NEXT_PUBLIC_API_URL` (for browser-visible API base URL when wired).

## Code quality

- Follow the existing formatting and naming conventions unless they are inconsistent enough to warrant a focused change.
- Prefer explicit, readable code over clever abstractions.
- Avoid `any` in TypeScript unless justified and isolated. Model API request/response types where practical.
- Avoid duplicate API logic and duplicate validation rules when a shared implementation is reasonable.
- Remove dead code only when it is clearly in scope. Do not perform broad drive-by refactors.
- Do not add dependencies for trivial functionality that can be handled by the existing stack.
- Do not silence lint/type errors with blanket disables, `@ts-ignore`, or broad casts as a shortcut.

## Testing expectations

- Add regression tests for bug fixes.
- Test success and failure paths, including invalid input, unauthenticated access, forbidden access, missing resources, and relevant boundary cases.
- For authorization-sensitive endpoints, test that one user cannot modify another user's data.
- Use the repository's existing test runner if configured. If no test setup exists, propose a small, compatible setup and introduce it in a focused change.
- Prefer deterministic tests with isolated test data. Never point tests at production data.
- Run the actual available scripts from the **repo root** (workspaces) or with `-w frontend` / `-w backend`. Report skipped checks honestly.

## API and UX conventions

- Keep endpoint naming and response shapes consistent with the existing API unless a deliberate versioned change is planned.
- Use appropriate status codes: 400 for invalid input, 401 for unauthenticated requests, 403 for forbidden actions, 404 for missing resources, 409 for conflicts, and 500 for unexpected server errors.
- Never return passwords, password hashes, JWT secrets, or private configuration.
- Show users useful, non-sensitive error messages. Do not display raw server stack traces.
- Ensure destructive UI actions have confirmation or a clear undo path when appropriate.
- Make layouts usable on mobile, tablet, and desktop.

## Documentation and environment

- Update README/API documentation when commands, environment variables, endpoints, or setup steps change.
- Keep `.env.example` current without real credentials.
- Document prerequisites, installation, development commands, test commands, and deployment notes.
- Do not invent environment variable names without checking the code; align documentation with actual usage.

## Git and scope safety

- Never commit, push, publish, deploy, or open a PR unless explicitly asked.
- Never run destructive shell commands without explicit approval.
- Do not overwrite user work. Inspect `git status` before broad edits.
- Keep changes scoped and explain any necessary dependency or lockfile changes.
- Do not update unrelated packages merely because updates are available.

## Definition of done

A task is done only when:

- The requested behavior is implemented.
- Relevant tests are added/updated and run where possible.
- Relevant lint/type-check/build checks are run or clearly marked as not run.
- Security and authorization implications have been considered.
- Documentation and environment examples are updated when needed.
- The final response lists changed areas, validation results, and remaining risks.
