# Agent guide — Recruita monorepo

## Structure

- **`frontend/`** — Angular SPA (`@recruita/frontend`). Proxies `/api` → Spring on port **3001**.
- **`backend/`** — Spring Boot API (`pom.xml`, `src/main/java`). Secrets in **`backend/.env`** (gitignored).
- **Root** — npm orchestration only; workspaces: `["frontend"]`.

## Commands (prefer these)

```bash
sh scripts/npm-run.sh run dev          # full stack (no npm devdir warnings)
sh scripts/npm-run.sh run validate:ci  # CI parity
sh scripts/npm-run.sh run quality      # fast: format + lint both stacks
sh scripts/npm-run.sh run validate:ci:frontend
sh scripts/npm-run.sh run validate:ci:backend
```

Plain `npm run …` also works; nested script steps use `scripts/bin/npm` via `.npmrc` `script-shell`. For zero `devdir` warnings in Cursor/agent shells, prefer `sh scripts/npm-run.sh run …`.

Backend Maven: `npm run verify:backend` (or `sh scripts/run-mvn.sh verify`)

Optional DB/Redis: `npm run dev` starts Docker (Compose project **recruita**) and the backend with `dev,persistence`. Demo applicants are **not** seeded automatically — run `npm run seed:applicants` when you want sample data. For backend only: `npm run infra:up` then `SPRING_PROFILES_ACTIVE=dev,persistence npm run start:backend` (see `backend/README.md`).

## Conventions

- No magic strings in Java — use `application.yml` + `@ConfigurationProperties`.
- No Node backend; do not reintroduce `backend/package.json` or Express.
- After `package.json` dependency changes: `npm install` and commit `package-lock.json`.
- Cursor injects `npm_config_devdir` for sandbox npm/node-gyp caches. Use `sh scripts/npm-run.sh run …` in agent shells, or `./scripts/bin/npm` / integrated terminals with `scripts/bin` on `PATH` (see `.vscode/settings.json`). Pre-commit and CI use the shim; npm lifecycle scripts run via `.npmrc` `script-shell` (`scripts/npm-script-shell.sh`).

## Pre-commit scope

- `frontend/**` staged → full frontend CI checks
- `backend/**` staged → Spotless, Checkstyle, tests, JaCoCo
- Both staged → both suites

## Git commits

- Do **not** add `Co-authored-by: Cursor`, `cursoragent@cursor.com`, or any other Cursor attribution to commit messages.
- Husky `prepare-commit-msg` / `commit-msg` hooks strip Cursor co-author trailers if the IDE injects them.

## Do not commit

- `backend/.env`, API keys, `backend/target/`, `node_modules/`, `frontend/dist/`
