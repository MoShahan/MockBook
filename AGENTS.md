# MockBook — Agent Instructions

## Project mission

MockBook is a full-stack social networking application being revived from an older learning project. Improve it incrementally into a secure, maintainable, tested, and deployable application while preserving its existing product identity and core stack.

## Source-of-truth rules

- Inspect the repository before making assumptions. Read the root and app-level `package.json` files, scripts, existing routes, controllers, models, middleware, and README.
- Treat the current code as the source of truth. Do not claim a feature exists until you find its implementation or verify it running.
- Do not replace working architecture just because another approach is fashionable.
- Keep a short implementation plan for non-trivial tasks. Identify affected frontend, backend, database, tests, and documentation.
- If a requested change depends on unknown product behavior, ask one focused question or choose the smallest reversible default and state it.
- Never silently discard user changes, reset branches, rewrite Git history, or run destructive commands.

## Technology decisions

- Preserve the existing architecture unless the user explicitly approves a redesign: Next.js/React/TypeScript frontend, Node.js/Express REST API, MongoDB with Mongoose, Material UI, Redux Toolkit, and the existing form libraries where appropriate.
- Prefer TypeScript for new frontend code and for backend code only if the existing backend setup supports it cleanly. Do not convert the entire backend to TypeScript as part of an unrelated feature.
- Upgrade dependencies deliberately, one compatibility group at a time. Read official migration notes for major-version upgrades and run relevant checks after each step.
- Do not invent exact package versions. Inspect current package files and official compatibility information before recommending or installing versions.
- Keep frontend and backend as separate applications if that is how the repository is currently organized. Do not move the REST API into Next.js without explicit approval.
- Use the package manager and lockfile already in the repository. Do not mix npm, pnpm, and Yarn lockfiles.

## Working process

1. Inspect relevant files and available scripts before editing.
2. Summarize the intended change briefly and identify important assumptions.
3. Implement the smallest complete vertical slice; avoid unrelated cleanup.
4. Add or update tests for changed behavior.
5. Run available lint, type-check, test, and build commands relevant to the change.
6. Review the diff for security, regressions, unused code, and accidental scope creep.
7. Report what changed, checks run, results, and anything not verified.

If a check cannot run, say why. Never claim tests passed unless they were actually executed and passed.

## Architecture conventions

### Frontend

- Use functional React components and hooks. Avoid class components for new code.
- Keep components focused. Separate reusable UI, feature-level components, API access, hooks, and types where doing so improves clarity.
- Reuse the project's Material UI theme, design tokens, and existing component patterns. Avoid one-off styling values when a shared theme token is appropriate.
- Keep API calls out of presentational components when a shared API layer or RTK Query endpoint is appropriate.
- Use Redux Toolkit for genuinely shared client state. Prefer RTK Query for remote server state if compatible with the current setup.
- Do not persist the entire Redux store by default. Never persist passwords, access tokens, refresh tokens, or other secrets in localStorage or Redux Persist.
- Handle loading, empty, success, and error states for asynchronous screens.
- Use semantic HTML, accessible labels, keyboard interaction, and visible focus states.
- Keep forms validated on both client and server. Client validation is for UX, not a security boundary.
- Do not introduce a new state-management, form, styling, or data-fetching library without explaining the benefit.

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
- Prefer secure, HTTP-only, SameSite cookies for browser sessions when compatible with the app's architecture; configure Secure in production and add CSRF protections where needed. If retaining bearer tokens, document and enforce a deliberate storage and expiry strategy.
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
- Keep secrets in environment variables; maintain a sanitized `.env.example` with placeholders only.

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
- Run the actual available scripts from the correct frontend/backend directory. Report skipped checks honestly.

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
