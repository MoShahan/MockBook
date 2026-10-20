---
name: xivi-security-review
description: Review Xivi for practical security weaknesses in Express routes, JWT authentication, user authorization, Mongoose queries, uploads, configuration, and frontend session handling.
---

# Xivi API and Application Security Review

## Goal

Find and prioritize actionable security issues. Do not change behavior silently or weaken controls to make tests pass.

## Review procedure

1. Inspect the relevant routes, middleware, controllers/services, Mongoose models, upload configuration, environment handling, and frontend authentication flow.
2. Trace the full request path from untrusted input to database operation and response.
3. Classify each finding by severity and impact, cite the exact file/function, explain a realistic abuse case, and propose a minimal fix.
4. If asked to fix issues, implement focused fixes and add regression tests. Do not perform broad rewrites without approval.

## Required checks

### Authentication

- JWT signature, expiry, algorithm/verification configuration, and required claims.
- Missing or invalid tokens return 401.
- Secrets are never hardcoded, logged, or committed.
- Passwords use a suitable password hash and are never returned in API responses.
- Login and registration have validation and appropriate abuse protection.
- Session strategy is **Bearer JWT** (not cookies unless the user explicitly requests a change). Review token storage (including current Redux Persist of `accessToken`), logout, expiry, and Authorization header handling. Do not recommend switching to HTTP-only cookies mid-review unless asked; note risks and hardening options instead.

### Authorization

- Verify identity from trusted authentication middleware.
- Do not trust body/query/URL `userId` to establish the caller's identity.
- Check ownership before editing/deleting posts, comments, or profile data.
- Check friendship and privacy rules before returning protected content.
- Prevent users from editing another user's friend list or impersonating another account.
- Test horizontal privilege escalation with two distinct test users.

### Input and database

- Validate IDs, request bodies, query strings, enum values, lengths, and pagination limits.
- Avoid unsafe dynamic MongoDB filters and operator injection.
- Handle duplicate email/username conflicts and missing records explicitly.
- Avoid mass assignment by allowing only intended fields to be updated.
- Add indexes for actual query patterns without over-indexing.

### File uploads

- Enforce file-size limits and allowlisted content types/extensions.
- Do not trust client MIME type alone; inspect actual file content when practical.
- Generate unique server-side names or use managed object storage.
- Prevent path traversal and executable content from being served.
- Consider authorization and privacy for uploaded files.

### HTTP and operations

- Restrict CORS to known frontend origins in production.
- Configure security headers, rate limits, request size limits, and safe error responses.
- Keep `.env` files, tokens, credentials, and user-uploaded content out of Git. Align with actual env names: `MONGODB_URI`, `ACCESS_TOKEN_SECRET`, `PORT`, optional `MONGODB_USERNAME` / `MONGODB_PASSWORD`, frontend `NEXT_PUBLIC_API_URL`.
- Ensure logs do not contain passwords, tokens, or unnecessary personal data.
- Review dependencies for known vulnerabilities using the project's package manager.

## Output format

For each finding:

- **Severity:** Critical / High / Medium / Low
- **Location:** file and function/route
- **Issue:** concise description
- **Impact:** realistic consequence
- **Fix:** actionable recommendation
- **Test:** regression test that would catch it

Finish with a prioritized summary. Distinguish confirmed vulnerabilities from questions requiring runtime verification. Never claim the application is secure solely because this checklist passed.
