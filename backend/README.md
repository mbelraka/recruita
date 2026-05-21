# Recruita backend

**Spring Boot 3** API (Java 21) — match scoring, Groq integration, security.

Part of the Recruita monorepo; npm scripts are defined at the **repository root** (`package.json`).

## Layout

| Path | Role |
|------|------|
| `src/main/java/` | Application code |
| `src/main/resources/` | `application.yml`, profiles |
| `src/test/java/` | JUnit 5 tests |
| `config/` | Checkstyle, SpotBugs |
| `pom.xml` | Maven build |
| `.env.example` | Secrets template → copy to `.env` |

## Run locally

From the **repository root**:

```bash
npm run start:backend
# or: sh scripts/start-backend.sh
```

With Angular:

```bash
npm run dev
```

- API: http://localhost:3001  
- Frontend proxies `/api` from :4200

Secrets: `backend/.env` (from `.env.example`).

### Optional PostgreSQL + Redis

Applicant rosters are stored in PostgreSQL when the persistence profile is active. The Angular SPA reads and writes them through `/api/applicants`.

```bash
npm run infra:up
SPRING_PROFILES_ACTIVE=dev,persistence npm run start:backend
```

Docker Compose project name is **`recruita`** (`recruita-postgres`, `recruita-redis`). Use `npm run infra:up` / `infra:down` so scripts pick up the pinned project name.

| Profile | Behavior |
|---------|----------|
| default (`dev`) | In-memory match cache; no database |
| `persistence` | Flyway migrations on PostgreSQL; match cache in Redis |

Flyway schema: `src/main/resources/db/migration/` (`applicants` table mirrors the Angular model).

When the `persistence` profile is active, CRUD endpoints are available at `/api/applicants`:

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/applicants` | List all applicants |
| `POST` | `/api/applicants` | Create applicant (201) |
| `PUT` | `/api/applicants/{id}` | Update applicant |
| `DELETE` | `/api/applicants/{id}` | Delete applicant (204) |

Without the profile, these routes return **404** (persistence disabled).

The Angular app loads and mutates applicants via `/api/applicants` (see `ApplicantApiService` and `ApplicantsEffects`). A fresh database starts empty; load demo rows separately when needed:

```bash
npm run seed:applicants
```

This runs a one-shot Spring job (`persistence,seed` profiles) that upserts rows from `src/main/resources/seed/applicants-demo.json` and exits. Safe to re-run — existing ids are skipped.

## Quality

| Command | Purpose |
|---------|---------|
| `npm run quality:backend` | Spotless + Checkstyle |
| `npm run test:backend` | Tests only |
| `npm run verify:backend` | Full verify (CI gate) |
| `npm run validate:ci:backend` | `quality:backend` + `verify:backend` |

From this directory: `./mvnw verify`

Pre-commit runs `precommit:backend` when any path under `backend/` is staged.

**JDK:** Java **21 or higher** (see `.java-version` for the recommended LTS).
