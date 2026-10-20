---
name: xivi-feature
description: Implement an Xivi product feature end to end across the existing Next.js/React frontend, Express API, MongoDB/Mongoose models, and tests. Use for new features or completing incomplete social-network functionality.
---

# Xivi Feature Development

## Goal

Deliver the smallest complete, tested vertical slice that fits Xivi's existing architecture.

## Workflow

1. **Discover**
   - Inspect `git status`, the **root** and app `package.json` files (npm workspaces), the README, existing routes/controllers/models, frontend pages/components, and tests.
   - Trace a similar existing feature end to end before proposing a new pattern.
   - Identify whether the feature requires frontend, backend, database, authorization, upload, or documentation changes.
2. **Define**
   - State expected user behavior and acceptance criteria.
   - Identify permissions and invalid/error cases.
   - Make a brief file-by-file plan. Ask a focused question if a product decision is essential.
3. **Design the data/API**
   - Reuse existing Mongoose conventions and response patterns.
   - Define validation, authorization, status codes, and response types before wiring the UI.
   - Use pagination for collections and indexes for query patterns where appropriate.
   - Never trust a client-provided user ID for the authenticated principal.
4. **Implement backend first when applicable**
   - Add/adjust schema, validation, route, controller/service, and error handling.
   - Enforce authentication and resource-level authorization (Bearer JWT middleware).
   - Avoid exposing password hashes or private fields.
   - Add tests for success, invalid input, unauthenticated requests, forbidden access, and missing resources.
5. **Implement frontend**
   - Reuse the current Next.js routing, Material UI theme, shared components, and API conventions.
   - Use the shared **axios** client (`frontend/src/lib/api.ts` + `NEXT_PUBLIC_API_URL`) for all Express API calls. Do **not** use raw `fetch` for the API or introduce RTK Query unless the user explicitly approves it.
   - Keep **Formik + Yup** for forms unless the user approves a change.
   - Auth uses Bearer tokens in Redux (currently persisted). Do not casually change session storage or switch to cookies during an unrelated feature.
   - Use `NEXT_PUBLIC_API_URL` when wiring API base URLs; align with `backend` env (`MONGODB_URI`, etc.).
   - Implement loading, empty, error, success, and disabled states.
   - Ensure responsive behavior, semantic markup, keyboard accessibility, and form validation.
6. **Verify**
   - From the repo root, run relevant checks: `npm run lint`, `npm run typecheck`, `npm run test`, `npm run build`, `npm run format:check` (or `-w` equivalents).
   - Manually verify the main flow and important failure states when possible.
   - Review the diff for security issues, regressions, unused code, and unrelated edits.
7. **Document and report**
   - Update README/API docs / `.env.example` when behavior or setup changes.
   - Report files/features changed, commands run and their actual outcomes, and remaining limitations.

## Acceptance checklist

- [ ] Acceptance criteria are met end to end.
- [ ] Authentication and authorization are enforced server-side (Bearer JWT).
- [ ] Inputs are validated on the server.
- [ ] Loading, empty, error, and success states exist where relevant.
- [ ] Regression and permission tests are added.
- [ ] Relevant checks were run or explicitly marked as blocked.
- [ ] No secrets or unrelated changes were introduced.
