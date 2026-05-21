# Agent guide — Recruita monorepo

## Structure

- **`frontend/`** — Angular SPA (`@recruita/frontend`). Proxies `/api` → Spring on port **3001**.
- **`backend/`** — Spring Boot API (`pom.xml`, `src/main/java`). Secrets in **`backend/.env`** (gitignored).
- **Root** — npm orchestration only; workspaces: `["frontend"]`.

## Commands (prefer these)

```bash
npm run dev                 # full stack
npm run validate:ci         # CI parity
npm run quality             # fast: format + lint both stacks
npm run validate:ci:frontend
npm run validate:ci:backend
```

Backend Maven: `npm run verify:backend` (or `sh scripts/run-mvn.sh verify`)

Optional DB/Redis: `npm run dev` starts Docker (Compose project **recruita**) and the backend with `dev,persistence`. Demo applicants are **not** seeded automatically — run `npm run seed:applicants` when you want sample data. For backend only: `npm run infra:up` then `SPRING_PROFILES_ACTIVE=dev,persistence npm run start:backend` (see `backend/README.md`).

## Conventions

- No magic strings in Java — use `application.yml` + `@ConfigurationProperties`.
- No Node backend; do not reintroduce `backend/package.json` or Express.
- After `package.json` dependency changes: `npm install` and commit `package-lock.json`.
- Cursor injects `npm_config_devdir` for sandbox npm/node-gyp caches. `.cursor/sandbox.json` disables that injection; integrated terminals prepend `scripts/bin` to `PATH` (transparent npm shim); pre-commit/CI source `scripts/clean-npm-env.sh`.

## Pre-commit scope

- `frontend/**` staged → full frontend CI checks
- `backend/**` staged → Spotless, Checkstyle, tests, JaCoCo
- Both staged → both suites

## Do not commit

- `backend/.env`, API keys, `backend/target/`, `node_modules/`, `frontend/dist/`
