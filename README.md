# Recruita

**Talent without boundaries** — a full-stack recruitment workspace for managing applicants, ranking candidates with AI-assisted matching, exporting hiring data, and giving users explicit control over privacy and third-party processing.

The codebase is structured for long-term growth: lazy-loaded feature modules, centralized configuration, NgRx state per domain, a Spring match API with strict validation and test coverage, and quality gates that mirror CI on every commit.

> **Monorepo:** npm workspace **`frontend/`** (`@recruita/frontend`, Angular 20) + Maven **`backend/`** (Spring Boot 3, Java 21). The match API is **Spring only** — there is no Node/Express server. Root `package.json` orchestrates dev, CI, and Husky; see [CONTRIBUTING.md](./CONTRIBUTING.md) and [AGENTS.md](./AGENTS.md).

---

## Application scope

| Area | Route | What it does |
|------|-------|----------------|
| **Landing** | `/main` | Home hub with navigation into the product |
| **Applicants** | `/applicants` | Create, view, edit, and delete applicants; grid and list views; pagination; skill filters; location autocomplete (Open-Meteo geocoding, consent-gated); application status chips |
| **Match** | `/match` | Score applicants against a job description via a **Groq**-backed proxy (consent-gated); top candidates with localized reasoning |
| **Export** | `/export` | Download applicant data as **CSV**, **JSON**, **Excel**, or **PDF** |
| **Privacy** | `/privacy` | Policy overview, consent preferences, session JSON export, and session reset |

**Cross-cutting behavior**

- **i18n** — UI copy in `frontend/src/assets/i18n` (English, German, French, Italian, Romansh, Spanish); locale-aware dates and numbers via shared pipes
- **Notifications** — Transactional Material snackbars driven by NgRx (`showNotification`) with themed success / info / error panels
- **Persistence** — With the `persistence` profile (`npm run dev`), applicant rosters live in **PostgreSQL** and sync through `/api/applicants`. Language and consent choices stay in memory for the current browser session.
- **PWA** — Production builds enable the Angular service worker (`ngsw-config.json`)

Applicant data is stored in **PostgreSQL** when the persistence profile is active (`npm run dev`). Without it, the roster is empty until you add applicants through the UI. AI matching requires the **Spring match API** so match-provider credentials never reach the client.

---

## Security and data privacy

Recruita is designed around **privacy by default**, **consent-gated optional processing**, and **defense in depth** on the match API. Controls are mapped to [OWASP Top 10 (2021)](https://owasp.org/Top10/) themes and typical [OWASP ASVS](https://github.com/OWASP/ASVS) expectations. This is engineering documentation, not a certification or legal opinion.

Full control matrix and deployment checklist: **[SECURITY.md](./SECURITY.md)**.

### Data privacy principles

| Principle | How Recruita applies it |
|-----------|-------------------------|
| **Session preferences** | Language and consent apply for the current browser tab. Applicant rosters use PostgreSQL when the persistence profile is active. |
| **Opt-in optional processing** | Translation, geocoding, and AI matching are **off until the user consents**. Services check `PrivacyConsentService` before calling external APIs. |
| **Data minimization (AI)** | Match requests send only ephemeral correlation ids, skills, years of experience, and job title — never name, email, phone, location, notes, or application status. The server strips again before scoring or Groq. |
| **Transparency** | `/privacy` explains what is stored locally and what each optional feature transmits. Consent can be reopened anytime. |
| **Portability** | Users can download a JSON snapshot of applicants loaded in the current session (`PrivacyConsentService.buildDataExportJson$`). |
| **Right to erasure (session)** | “Reset session” reloads the app and clears in-memory consent and UI state. Server-stored applicants are not deleted. |
| **Versioned consent** | Consent records include `PRIVACY_CONSENT_VERSION`; stale consent re-triggers the gate dialog. |

### Consent model

On first visit (or when consent is incomplete / outdated), a **non-dismissible** dialog collects choices:

| Optional feature | When enabled | External dependency |
|------------------|--------------|---------------------|
| **Remote translation** | Dynamic text (e.g. job titles) may call MyMemory | `api.mymemory.translated.net` |
| **Geocoding** | Location field autocomplete | Open-Meteo geocoding API |
| **AI matching** | Job description + anonymized candidates sent to match API | Spring API → Groq |

Users can choose **necessary only**, **enable all optional**, or **custom** toggles. Implementation: `PrivacyConsentService`, `PrivacyConsentDialogService`, `/privacy` page.

### OWASP-aligned application security

| OWASP theme | Recruita controls |
|-------------|-------------------|
| **A01 Broken access control** | Match-provider credentials stay server-side only; the browser never receives them. Production `CORS_ORIGIN` must list real front-end origins (wildcard `*` refused at Spring startup in production). |
| **A02 Cryptographic failures** | Prefer TLS at the reverse proxy or ingress. HSTS when served over HTTPS (`ENABLE_HSTS=1`). |
| **A03 Injection** | Match `POST` body capped at **512 KB**; allowlisted top-level keys only; per-candidate fields reduced to `id`, `skills`, `yearsOfExperience`, `currentJobTitle`; `model` name pattern whitelist; LLM output parsed as JSON only (no `eval`). |
| **A04 Insecure design** | Rate limiting on match routes; deterministic scoring path without external calls; privacy consent gates before third-party calls; generic client errors in production. |
| **A05 Security misconfiguration** | Spring Security deny-by-default; CSP, nosniff, COOP/CORP, Permissions-Policy, optional HSTS; production refuses wildcard CORS; `TRUST_PROXY=1` for accurate rate limits. |
| **A06 Vulnerable components** | `package-lock.json` + Maven lock via CI; `npm run security:audit` (frontend); OWASP Dependency-Check on backend weekly (`backend-security-audit.yml`, CVSS ≥ 8 fails); SpotBugs + FindSecBugs on every `verify`. |
| **A07 Identification & auth** | `AuthInterceptor` and XSRF configuration ready for your IdP; session handling per your policy (no credentials documented here). |
| **A08 Software & data integrity** | `package-lock.json` verified in CI and pre-commit; Angular bundles third-party scripts (no ad-hoc script tags). |
| **A09 Logging & monitoring** | API logs Groq failures; production masks internal error strings; malformed JSON returns stable JSON without stack traces. |
| **A10 SSRF** | Server outbound calls limited to the configured Groq client; match API does not fetch user-supplied URLs. |

### Browser hardening

Defined in `frontend/src/index.html`:

- **Trusted Types** with Angular bundler policy — reduces DOM XSS risk for script injection
- **CSP** fragments: `base-uri 'self'`, `frame-ancestors 'none'`, `object-src 'none'`
- **`referrer: strict-origin-when-cross-origin`** — limits accidental URL leakage
- **`Permissions-Policy`** — disables camera, microphone, geolocation, and payment APIs by default

Stricter CSP (`default-src`, `script-src` with nonces) should be set on your **hosting reverse proxy or CDN** so production hashes are not fighting `ng serve`.

### Match API and LLM privacy

```
Browser (Recruita)          Spring API (backend/)           Groq API
     │                              │                            │
     │  anonymized candidates       │  validate + strip again      │
     │  + job description           │  deterministic score path    │
     ├─────────────────────────────►│───────────────────────────►│
     │  (no credentials)            │  (credentials server-only)   │
```

- Client: `match-candidate-privacy.util.ts` replaces applicant ids with **one-time correlation UUIDs** per request.
- Server: Spring match layer enforces allowlists, size limits, and field stripping before any model call.
- **Never** commit `backend/.env` or put match-provider secrets in the Angular bundle or this README.

### Production deployment checklist

1. Spring **prod** profile (or production runtime mode) — generic error messages to clients.
2. `CORS_ORIGIN` — comma-separated **https://** SPA origin(s); no `*` in production.
3. **TLS** — terminate at ingress; enable HSTS when responses are always HTTPS (`ENABLE_HSTS=1` in `backend/.env` when appropriate).
4. `TRUST_PROXY=1` when behind a load balancer so rate limits use real client IPs.
5. Rotate `GROQ_API_KEY` if exposure is suspected (see `backend/.env.example`).

---

## Tech stack

| Layer | Technologies |
|-------|----------------|
| **Frontend** | Angular 20, Angular Material, Tailwind CSS, RxJS, NgRx (Store, Effects, Entity patterns per module) |
| **i18n** | `@ngx-translate` with HTTP-loaded JSON bundles |
| **Backend** | `backend/` — Spring Boot 3 (Java 21), Groq match API |
| **Export** | ExcelJS, pdf-lib, file-saver (client-side generation) |
| **Backend QA** | Spotless, Checkstyle, SpotBugs, ArchUnit, JaCoCo (≥ 80% branch coverage on verify) |
| **Tooling** | ESLint, Prettier, Husky, lint-staged, Karma, Playwright, angular-doctor, ngx-security-audit, letify, patch-package, FindSecBugs |
| **Runtime** | Node **22** (`.nvmrc`), npm **10.9.2** (`packageManager`); Java **21** (`backend/.java-version`) |

---

## Architecture and design principles

### SOLID-oriented Angular structure

- **Single responsibility** — Templates, styles, and TypeScript live in separate files. Business logic stays out of templates; shared behavior uses pipes, utilities, and services.
- **Open / closed** — Behavior is driven by **`APP_CONFIG`** (`frontend/src/app/config/app.config.ts`): navigation, dialog sizes, match timeouts, export filenames, notification durations, and localization defaults.
- **Liskov substitution** — Domain models (e.g. `Applicant`) expose consistent validation and helpers.
- **Interface segregation** — Small models and enums per concern.
- **Dependency injection** — Services use `providedIn: 'root'`; HTTP cross-cutting via interceptors (`AuthInterceptor`, XSRF).

### Atomic design (component layering)

Reusable atoms (chips, pipes, grid cards) compose feature containers (`ApplicantsComponent`, `MatchCandidatesComponent`). Shared UI: `frontend/src/app/shared/`; shell: `frontend/src/app/containers/root/`.

### Material Design

Angular Material for forms, tables, dialogs, snackbars, and navigation. Theme and overrides: `frontend/src/app/styles/theme/`, `frontend/src/app/styles/overrides/`.

### Feature modules and lazy loading

```
main          → landing / hub
applicants    → CRUD + views + geocoding effects
match         → proxy client + match state
export        → format selection + download effects
```

Routes: `frontend/src/app/containers/root/root-routing.module.ts`. `RootComponent` owns nav, language, applicant load, and the privacy consent gate.

### State management

| Store slice | Feature key | Responsibility |
|-------------|-------------|----------------|
| `app` | (root) | Language, notifications, global UI flags |
| `applicants` | `applicants` | List, filters, pagination, CRUD, location search |
| `match` | `match` | Job description, scores, loading / error |
| `export` | `export` | Selected format and export job state |

Effects for side effects; NgRx holds in-memory UI state for the session. Applicant CRUD goes through NgRx effects and the Spring API when persistence is enabled.

### Spring backend (`backend/`)

- **Entry:** `com.recruita.api.RecruitaApiApplication` — REST match API, health, validation, Groq client.
- **Config:** `application.yml` + profiles (`dev`, `prod`, `test`); secrets via `backend/.env` (imported in dev/prod).
- **Design:** Configuration properties (no magic strings in Java), sealed match evaluation results, request policy validation, rate limiting, structured error handling.
- **Build:** `./mvnw verify` from `backend/` or `npm run verify:backend` from the repo root.

### Responsiveness and accessibility

Responsive layouts; `prefers-reduced-motion` respected on the main landing language refresh animation.

---

## Project structure

```
recruita/                          # Monorepo root
├── frontend/                      # @recruita/frontend — Angular 20 SPA
│   ├── src/app/                   # Feature modules, NgRx, shared UI
│   ├── e2e/                       # Playwright specs
│   ├── angular.json
│   └── proxy.conf.json            # Dev: /api → http://localhost:3001
├── backend/                       # Spring Boot 3 (Java 21), not an npm workspace
│   ├── src/main/java|resources/
│   ├── src/test/java/
│   ├── config/                    # Checkstyle, SpotBugs
│   ├── pom.xml, mvnw
│   ├── .env.example → .env        # GROQ_API_KEY, CORS, PORT (gitignored)
│   └── README.md
├── scripts/                       # run-dev.sh, start-backend.sh, pre-commit helpers
├── patches/                       # patch-package (e.g. http-proxy)
├── package.json                   # Orchestration: dev, validate:ci, lint-staged
├── CONTRIBUTING.md                # Monorepo conventions, Corepack, pre-commit
├── AGENTS.md                      # Agent / automation guide
├── SECURITY.md
└── .github/workflows/
    ├── ci.yml                     # Path-scoped frontend / backend / lockfile jobs
    └── backend-security-audit.yml # Weekly OWASP Dependency-Check
```

---

## Getting started

See **[CONTRIBUTING.md](./CONTRIBUTING.md)** for monorepo conventions, pre-commit behavior, and PR expectations.

### Prerequisites

- Node.js **22** (see `.nvmrc`)
- npm **10.9.2** (`corepack enable && corepack prepare npm@10.9.2 --activate`)
- Java **21** (see `backend/.java-version`)

### Install

Use **npm 10.9.2** (pinned in `package.json` via `packageManager`). Other npm versions can rewrite `package-lock.json` and fail CI `lockfile:check`.

```bash
corepack enable
corepack prepare npm@10.9.2 --activate
npm ci
```

### Configure the match API

```bash
cp backend/.env.example backend/.env
```

Set at least **`GROQ_API_KEY`** and **`PORT=3001`** in `backend/.env` (never commit that file). See `backend/.env.example` for `CORS_ORIGIN`, `TRUST_PROXY`, rate limits, and HSTS.

### Run locally

```bash
npm run dev              # Docker (Postgres + Redis), Angular :4200, Spring :3001 with persistence
npm run seed:applicants  # Optional: load demo applicants into PostgreSQL
npm start                # Frontend only (proxies /api → :3001)
npm run start:backend    # Spring API only (in-memory match cache; no DB)
```

| URL | Service |
|-----|---------|
| http://localhost:4200/ | Angular dev server |
| http://localhost:3001/ | Spring API (`/api/health`, `/api/match`, …) |

If `ng serve` fails with missing modules, run `npm ci` again.

**Docker (PostgreSQL + Redis):** Compose project name is **`recruita`** (see `docker-compose.yml` and root `.env`). Containers: `recruita-postgres`, `recruita-redis`; network: `recruita`; volume: `recruita_pg-data`. If you previously ran Compose from a checkout folder named `applicant-project`, stop the old stack once (`docker compose -p applicant-project down`) before `npm run infra:up`.

### Production build

```bash
npm run build:prod
# Output: frontend/dist/recruita/
```

Serve the static bundle behind HTTPS with the Spring API configured per [SECURITY.md](./SECURITY.md).

---

## npm scripts

| Script | Purpose |
|--------|---------|
| **Dev** | |
| `npm run dev` | Docker + Angular + Spring with persistence (4200 + 3001) |
| `npm start` | Angular only |
| `npm run start:backend` | Spring only (default `dev` profile, no DB) |
| `npm run infra:up` / `infra:down` | PostgreSQL + Redis (Docker Compose project **recruita**) |
| `npm run seed:applicants` | Load demo applicants into PostgreSQL (idempotent) |
| **Quality (fast)** | |
| `npm run quality` | Frontend + backend format check & lint |
| `npm run quality:backend` | Spotless + Checkstyle |
| **CI / pre-commit** | |
| `npm run validate` / `validate:ci` | Full pipeline (both packages) |
| `npm run validate:ci:frontend` | Frontend tests, doctor, security, prod build |
| `npm run validate:ci:backend` | Maven verify (tests, SpotBugs, JaCoCo ≥ 80%) |
| `npm run precommit:frontend` / `precommit:backend` | Husky scoped gates |
| **Backend** | |
| `npm run test:backend` | Unit/integration tests |
| `npm run verify:backend` | Full Maven verify |
| **Other** | |
| `npm run lockfile:check` | Lockfile matches `package.json` (npm 10.9.2) |
| `npm run security:audit` | Frontend `ngx-security-audit` |
| `npm run security:audit:backend` | OWASP Dependency-Check (Maven) |
| `npm run e2e` | Playwright (install browsers: `npm run e2e:install`) |

Pre-commit (`scripts/pre-commit.sh`): **lint-staged** (ESLint/Prettier on frontend, Spotless on staged `.java`) → **lockfile:check** when `package.json` / lockfile staged → **precommit:frontend** / **precommit:backend** when paths under `frontend/` or `backend/` are staged. Do not use `git commit --no-verify`.

---

## Testing and CI

| Layer | Command | What runs |
|-------|---------|-----------|
| Frontend unit | `npm test` | Jasmine + Karma |
| Frontend CI gate | `npm run validate:ci:frontend` | Quality, tests, doctor, security audit, letify, prod build |
| Backend | `npm run verify:backend` | Tests, SpotBugs, JaCoCo (≥ 80% branch), ArchUnit |
| Full stack | `npm run validate` | `validate:ci` (frontend + backend) |
| E2E | `npm run e2e` | Playwright (`frontend/e2e/`) — not in default CI yet |

**GitHub Actions** (`.github/workflows/ci.yml`):

- **changes** — path filter for `frontend/`, `backend/`, lockfile
- **lockfile** — when `package.json` / `package-lock.json` change
- **frontend** — `validate:ci:frontend` when frontend (or lockfile) changes; always on push to `main` / `master`
- **backend** — `validate:ci:backend` when `backend/` changes; always on push to `main` / `master`

Backend CI runs SpotBugs + FindSecBugs on every push/PR. OWASP Dependency-Check runs in the scheduled **backend-security-audit** workflow (weekly + manual); locally: `npm run security:audit:backend` (set `NVD_API_KEY` for faster NVD sync).

---

## Configuration reference

**`frontend/src/app/config/app.config.ts`** — navigation, dialogs, applicant UI, match endpoint/model/timeouts, export formats, languages, snackbar timing.

**Environments:** `frontend/src/environments/environment.ts`, `environment.prod.ts`.

---

## Internationalization

`frontend/src/assets/i18n/{en,de,fr,it,rm,es}.json` — includes `privacy.*` and `notifications.*` keys aligned with consent and snackbar behavior.

Language persists via `LocalizationService` / NgRx. Optional `RemoteTranslateService` (MyMemory) respects the translation consent flag.
