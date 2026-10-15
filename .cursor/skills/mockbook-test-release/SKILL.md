---
name: mockbook-test-release
description: Validate MockBook changes, create or improve regression tests, run project checks, and prepare a release-readiness report before deployment.
---

# MockBook Testing and Release Readiness

## Goal

Provide evidence that a change works and identify what remains unverified.

## Workflow

1. Inspect package.json scripts in the root, frontend, and backend. Use the repository's actual package manager and commands; do not invent scripts.
2. Inspect existing test configuration and follow established conventions. If tests are absent, propose a minimal setup compatible with the installed stack before adding large testing dependencies.
3. Define tests around user-visible behavior and risk:
   - Unit tests for validation and business rules.
   - API integration tests for status codes, response shape, persistence, and error handling.
   - Frontend component tests for important interactions and states.
   - End-to-end tests for critical journeys where a working environment is available.
4. For protected APIs, test at least:
   - No token -> 401.
   - Invalid/expired token -> 401.
   - Authenticated but unauthorized user -> 403 or deliberate non-disclosing 404.
   - Owner/authorized user -> expected success.
   - Invalid input -> 400 or the established validation status.
   - Missing resource -> 404.
5. For social features, test duplicate likes, friendship state transitions, comment ownership, deleted/missing users, pagination boundaries, and concurrent updates where relevant.
6. Run checks from the correct application directory:
   - Tests.
   - Lint.
   - Type-check, if configured.
   - Production build.
   - Any targeted smoke test that can be performed safely.
7. Never use production credentials or production data in tests. Do not run destructive database operations against an unknown URI.
8. Inspect the final diff for accidental changes, leaked secrets, generated files, skipped tests, and unsafe error output.
9. If deployment is requested, verify environment configuration, build/start commands, CORS, database connectivity, upload storage, health checks, and rollback plan before deploying. Do not deploy unless explicitly authorized.

## Release report

Use this structure:

- **Change under test**
- **Checks executed** — exact commands and pass/fail results
- **Manual scenarios verified**
- **Not run / blocked** — explain why
- **Known risks**
- **Release recommendation** — Ready / Ready with caveats / Not ready

Never state that a check passed unless it actually completed successfully. A successful build is not proof that runtime behavior is correct.
