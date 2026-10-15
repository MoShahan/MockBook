---
name: mockbook-feature
description: Implement a MockBook product feature end to end across the existing Next.js/React frontend, Express API, MongoDB/Mongoose models, and tests. Use for new features or completing incomplete social-network functionality.
---

# MockBook Feature Development

## Goal

Deliver the smallest complete, tested vertical slice that fits MockBook's existing architecture.

## Workflow

1. **Discover**
   - Inspect `git status`, relevant package files, the README, existing routes/controllers/models, frontend pages/components, API client, and tests.
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
   - Enforce authentication and resource-level authorization.
   - Avoid exposing password hashes or private fields.
   - Add tests for success, invalid input, unauthenticated requests, forbidden access, and missing resources.
5. **Implement frontend**
   - Reuse the current Next.js routing, Material UI theme, shared components, and API conventions.
   - Keep remote server state in the existing data-fetching pattern; prefer RTK Query if it is already set up or can be added consistently.
   - Implement loading, empty, error, success, and disabled states.
   - Ensure responsive behavior, semantic markup, keyboard accessibility, and form validation.
6. **Verify**
   - Run relevant backend and frontend test, lint, type-check, and build scripts after inspecting package.json.
   - Manually verify the main flow and important failure states when possible.
   - Review the diff for security issues, regressions, unused code, and unrelated edits.
7. **Document and report**
   - Update README/API docs when behavior or setup changes.
   - Report files/features changed, commands run and their actual outcomes, and remaining limitations.

## Acceptance checklist

- [ ] Acceptance criteria are met end to end.
- [ ] Authentication and authorization are enforced server-side.
- [ ] Inputs are validated on the server.
- [ ] Loading, empty, error, and success states exist where relevant.
- [ ] Regression and permission tests are added.
- [ ] Relevant checks were run or explicitly marked as blocked.
- [ ] No secrets or unrelated changes were introduced.
