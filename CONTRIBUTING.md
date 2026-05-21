# Contributing to Recruita

## Monorepo layout

| Package | Path | Tooling |
|---------|------|---------|
| Frontend | `frontend/` | npm workspace `@recruita/frontend`, Angular 20 |
| Backend | `backend/` | Maven / Spring Boot 3, Java 21 |
| Orchestration | repo root | npm scripts, Husky, shared Prettier |

The backend is **not** an npm workspace; root `package.json` runs Maven via `scripts/run-mvn.sh` (wraps `backend/mvnw`).

## Prerequisites

- **Node.js 22** (see `.nvmrc`)
- **npm 10.9.2** (`corepack enable && corepack prepare npm@10.9.2 --activate`)
- **Java 21 or higher** (see `backend/.java-version` for the recommended LTS)
- Copy `backend/.env.example` → `backend/.env` (never commit `.env`)

## Install

Use the npm version pinned in root `package.json` (`packageManager`: **npm@10.9.2**). Other npm versions can rewrite `package-lock.json` and fail `lockfile:check` in CI. Activate it with Corepack (`corepack enable && corepack prepare npm@10.9.2 --activate`).

GitHub Actions workflows set `FORCE_JAVASCRIPT_ACTIONS_TO_NODE24=true` and install Node/npm via `.github/actions/setup-node-toolchain` so CI uses Node **22** and npm **10.9.2**.

**Cursor `devdir` warning:** Cursor injects `npm_config_devdir` for its sandbox node-gyp cache; npm 10.9+ warns on it. This repo fixes that in three layers:

1. **`.cursor/sandbox.json`** — disables shared sandbox npm cache injection (root cause for Agent/sandbox shells).
2. **`.vscode/settings.json`** — prepends `scripts/bin` to integrated-terminal `PATH` so bare `npm` uses a transparent shim that unsets `devdir` (open a **new** terminal after clone).
3. **External terminals** — optional [direnv](https://direnv.net) loads `.envrc` to unset the vars when you `cd` into the repo.

Pre-commit and CI source `scripts/clean-npm-env.sh` before npm runs.

```bash
corepack enable
corepack prepare npm@10.9.2 --activate
npm ci
```

After changing root or `frontend/package.json` dependencies:

```bash
npm install   # with corepack active, uses npm 10.9.2
npm run lockfile:check
```

Commit `package-lock.json` in the same change as `package.json`.

## Development

```bash
npm run dev          # Angular :4200 + Spring :3001
npm run start:backend   # Spring only
npm start            # Angular only
```

## Quality commands

| Scope | Fast (format + lint) | Full CI gate |
|-------|----------------------|--------------|
| Frontend | `npm run quality -w @recruita/frontend` | `npm run validate:ci:frontend` |
| Backend | `npm run quality:backend` | `npm run validate:ci:backend` |
| Both | `npm run quality` | `npm run validate:ci` |

Run `npm run validate` before opening a PR (same as CI).

## Pre-commit

Husky runs `scripts/pre-commit.sh`:

1. **lint-staged** — auto-fix staged files
2. **lockfile:check** — if `package.json` / lockfile staged
3. **precommit:frontend** — if anything under `frontend/` is staged
4. **precommit:backend** — if anything under `backend/` is staged

Do not use `git commit --no-verify` unless you have a documented exception.

## Pull requests

- CI runs scoped jobs (frontend / backend) based on changed paths; pushes to `main`/`master` run both.
- Keep `package-lock.json` in sync: `npm install` after `package.json` changes.
- See [SECURITY.md](./SECURITY.md) for deployment and secrets handling.
