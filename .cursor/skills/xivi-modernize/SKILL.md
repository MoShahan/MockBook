---
name: xivi-modernize
description: Safely upgrade Xivi dependencies, migrate legacy APIs, or refactor older code without unnecessary rewrites. Use for Next.js, React, Express, Mongoose, Material UI, Node.js, or tooling upgrades.
---

# Xivi Safe Modernization

## Goal

Modernize in small, reversible steps while preserving existing behavior and the project's core stack.

## Workflow

1. Inspect repository status, the **root** lockfile (`package-lock.json`), npm workspaces, Node engine requirements, root/frontend/backend `package.json` files, scripts, and current dependency versions.
2. Establish a baseline from the repo root: `npm ci` / `npm install`, then `npm run lint`, `npm run typecheck`, `npm run test`, `npm run build`, `npm run format:check`; record existing failures before making changes.
3. Identify the exact target versions and verify official release notes, supported Node versions, peer dependencies, and migration guides. Do not guess version numbers or use `latest` blindly.
4. Group changes by compatibility boundary. Avoid upgrading the entire dependency tree in one step.
5. For every major upgrade:
   - Read the official migration guide.
   - Upgrade the smallest coherent package group.
   - Update code for documented breaking changes.
   - Regenerate the existing lockfile with the project's package manager.
   - Run the relevant checks and inspect runtime behavior.
   - Commit only if the user explicitly asks; otherwise leave changes uncommitted.
6. Avoid unrelated dependency updates. Explain any added, removed, or replaced dependency and why it is needed.
7. Keep the existing architecture unless a rewrite is explicitly approved. Do not move the Express API into Next.js, replace MongoDB, or change UI libraries as a side effect.
8. If a migration fails, isolate the failing package/API and report the error. Do not hide failures with broad casts, disabled lint rules, or downgrades without explaining the trade-off.
9. Update Node engine documentation, environment examples (`MONGODB_URI`, `NEXT_PUBLIC_API_URL`, etc.), README, and `PROJECT_PLAN.md` when needed. Do not invent env names that disagree with the code.

## Migration safeguards

- Inspect `git diff` and `git status` before and after work.
- Never delete a lockfile merely to resolve an install problem.
- Never run destructive database migrations or remove collections.
- Do not claim a package is deprecated or unsupported without checking authoritative current documentation.
- Keep a rollback path for risky changes.
- Do not combine a major framework migration with unrelated feature work.

## Completion report

Include:

- Versions before and after.
- Official migration references consulted.
- Breaking changes addressed.
- Commands run and their actual results.
- Known issues, skipped checks, and rollback considerations.
