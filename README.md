# Recruita

**Talent without boundaries** — a full-stack recruitment workspace for managing applicant pipelines, ranking candidates with consent-gated AI matching, exporting hiring data in multiple formats, and giving users explicit control over privacy and third-party processing.

Recruita is a **production-minded monorepo**: lazy-loaded Angular feature modules, a Spring Boot API with strict validation and high test coverage, centralized configuration, WCAG-oriented accessibility foundations, and quality gates that mirror CI on every commit. The UI is **fully responsive** (phone through desktop) and ships in **six languages**.

> **Monorepo:** npm workspace **`frontend/`** (`@recruita/frontend`, Angular 20) + Maven **`backend/`** (Spring Boot 3, Java 21). The match API is **Spring only** — there is no Node/Express server. Root `package.json` orchestrates dev, CI, and Husky. **This README is the canonical documentation** for the project.

---

## Table of contents

1. [What is Recruita?](#what-is-recruita)
2. [Who is it for?](#who-is-it-for)
3. [Key capabilities](#key-capabilities)
4. [Application tour](#application-tour)
5. [Typical workflows](#typical-workflows)
6. [Applicant data model](#applicant-data-model)
7. [Architecture](#architecture)
8. [Security & privacy](#security--privacy)
9. [Tech stack](#tech-stack)
10. [Project structure](#project-structure)
11. [Getting started](#getting-started)
12. [npm scripts](#npm-scripts)
13. [Testing & CI](#testing--ci)
14. [Contributing](#contributing)
15. [Automation & agents](#automation--agents)
16. [Configuration reference](#configuration-reference)
17. [Internationalization](#internationalization)
18. [Responsive design](#responsive-design)
19. [Accessibility (WCAG foundation)](#accessibility-wcag-foundation)

---

## What is Recruita?

Recruita is a **browser-based hiring operations tool** that helps recruiters and hiring teams:

- **Capture and organize** applicant profiles (contact details, skills, experience, pipeline status, notes).
- **Search and filter** large rosters with grid/list views, skill chips, status and country filters, and sortable columns.
- **Rank candidates** against a job description using an AI-assisted match score — with anonymized payloads and server-side credential handling.
- **Export** roster data as CSV, JSON, Excel, or PDF for reporting, backups, or handoff to other systems.
- **Stay in control of privacy** through a versioned consent model that gates optional third-party features (translation, geocoding, AI matching).

Each major area (applicants, match, export, privacy) is a lazy-loaded Angular module with its own NgRx slice; shared shell concerns (navigation, language, notifications, consent gate) live in the root container.

**Persistence:** With the `persistence` Spring profile (enabled by default in `npm run dev`), applicant rosters and session profiles are stored in **PostgreSQL** via REST. Match result caching uses **Redis**. Language preference and in-flight UI state remain session-oriented in the browser.

---

## Who is it for?

| Audience | How Recruita helps |
|----------|-------------------|
| **Recruiters / talent teams** | Maintain a searchable applicant roster, track pipeline status, and shortlist against open roles. |
| **Hiring managers** | Review ranked candidates with localized reasoning snippets tied to a job description. |
| **Engineering teams** | Reference implementation for privacy-by-default SPA + API design, NgRx Data entity caching, and OWASP-aligned match proxy patterns. |
| **Operators** | Deploy a static Angular bundle behind HTTPS with a separately configured Spring API (see [Security & privacy](#security--privacy)). |

Recruita is **not** a full ATS replacement: it focuses on roster management, AI-assisted ranking, export, and transparent consent — without prescribing a particular identity provider or multi-tenant model. `AuthInterceptor` and XSRF configuration are ready for you to wire to your IdP.

---

## Key capabilities

| Capability | Summary |
|------------|---------|
| **Applicant CRUD** | Create, edit, and delete applicants via Material dialogs; roster synced to PostgreSQL when persistence is on. |
| **Dual views** | Responsive **grid** (card layout with `ResizeObserver` column math) and **list** (Material table with viewport-aware columns). |
| **Rich filtering** | Global text search, status/country filters, skill chip filters from inline skill links. |
| **Location assist** | Open-Meteo geocoding autocomplete on the location field (consent-gated). |
| **AI matching** | Groq-backed scoring through Spring; client sends anonymized correlation ids only. |
| **Multi-format export** | Client-side CSV/JSON/Excel/PDF generation from the cached roster. |
| **Privacy center** | `/privacy` policy, consent toggles, session JSON download, session reset. |
| **i18n** | EN, DE, FR, IT, RM, ES — locale-aware dates, numbers, and locations (incl. AT/CH). |
| **Accessibility** | Skip link, landmarks, route focus, ESLint template a11y rules, axe Playwright suite (`a11y:e2e`). |
| **PWA** | Production builds enable the Angular service worker (`ngsw-config.json`). |
| **Quality gates** | Husky pre-commit runs scoped frontend/backend CI checks; GitHub Actions on push/PR. |

---

## Application tour

### Landing (`/main`)

Home hub with headline, primary CTA into applicants, and hero visual. On narrow screens the layout **stacks vertically** with scaled typography.

### Applicants (`/applicants`)

| UI area | Behavior |
|---------|----------|
| **Filter header** | Search, status/country dropdowns, optional grid sort, skill filter chip, grid/list toggle. Full width on tablet and below. |
| **Grid view** | Card grid with pagination; column count adapts to container width. |
| **List view** | Sortable Material table; columns reduce on smaller viewports (down to name, status, job title on phones). |
| **FAB** | Extended floating action button to add a new applicant. |
| **Edit flow** | Row/card click or FAB opens new/edit dialog; detail fetch loads full notes before edit. |

**Application statuses:** `received`, `screening`, `interview_scheduled`, `shortlisted`, `offer_extended`, `rejected`, `withdrawn` — localized chips.

**Search note:** Notes appear in global search only after an applicant’s detail has been loaded into the entity cache (summary roster API omits notes for performance).

### Match (`/match`)

1. User enters a job description (AI matching consent required).
2. Client builds an **anonymized** payload (`match-candidate-privacy.util.ts`): one-time correlation UUIDs per applicant, plus skills, years of experience, and job title only.
3. Spring validates, strips again, and calls **Groq** (or a deterministic fallback without external calls).
4. Results show ranked cards with scores and localized reasoning. Job panel and results **stack** at ≤960px.

### Export (`/export`)

Four export cards (JSON, CSV, PDF, Excel) — client-side generation from the NgRx Data entity cache. Grid: **1 → 2 → 4 columns** across breakpoints.

### Privacy (`/privacy`)

Policy, consent toggles, session JSON download, and session reset (clears in-memory consent/UI state; does not delete server-stored applicants). A **non-dismissible** dialog gates the app until consent is recorded or updated.

---

## Typical workflows

**Onboard a new applicant:** Applicants → FAB → fill fields → optional location autocomplete (geocoding consent) → save → `ApplicantDataService` POSTs to `/api/applicants`.

**Shortlist for a role:** Match → paste job description → Evaluate → review ranked cards → filter by skill from list/grid links.

**Export for HRIS:** Export → choose format → localized file downloads.

**Change privacy choices:** Footer → Privacy (or consent dialog on outdated version) → toggle features → profile entity cache syncs flags immediately.

---

## Applicant data model

```typescript
interface Applicant {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  yearsOfExperience?: number;
  applicationStatus?: ApplicationStatus;
  currentJobTitle?: string;
  availableFrom?: Date;
  skills?: string[];
  notes?: string;
}
```

| Field | Notes |
|-------|-------|
| `id` | Server-generated or client UUID on create; stable primary key in PostgreSQL. |
| `skills` | String array; filterable via chip UI; exported with `; ` delimiter in CSV. |
| `notes` | Full text on detail fetch; not on summary list API. |
| `availableFrom` | Date; localized via `LocaleDatePipe`. |
| `currentJobTitle` | May use optional remote translation (MyMemory) when translation consent is on. |

---

## Architecture

### System diagram

```
┌─────────────────────────────────────────────────────────────────┐
│  Angular SPA (frontend/)                                        │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────────────┐ │
│  │ Root shell  │  │ Feature mods │  │ NgRx Store + @ngrx/data│ │
│  │ nav, i18n,  │  │ applicants,  │  │ entityCache (Applicant,│ │
│  │ consent     │  │ match, export│  │ Profile) + UI slices   │ │
│  └─────────────┘  └──────────────┘  └────────────────────────┘ │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTP /api (dev proxy → :3001)
┌────────────────────────────▼────────────────────────────────────┐
│  Spring Boot API (backend/)                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────────┐ │
│  │ Applicants   │  │ Profiles     │  │ Match + Groq client    │ │
│  │ REST + JPA   │  │ REST + JPA   │  │ validation, rate limit   │ │
│  └──────┬───────┘  └──────┬───────┘  └───────────┬────────────┘ │
│         ▼                 ▼                       ▼              │
│     PostgreSQL        PostgreSQL              Redis (cache)    │
└─────────────────────────────────────────────────────────────────┘
```

### Frontend

| Layer | Location | Role |
|-------|----------|------|
| **Shell** | `containers/root/` | Tab nav (desktop) / menu (mobile), language select, footer, privacy gate. |
| **Features** | `modules/{main,applicants,match,export,smart-action}/` | Lazy-loaded routes, components, effects, selectors. |
| **Shared** | `shared/` | Grid cards, pipes, Material barrel. |
| **Config** | `config/app.config.ts` | Nav, dialogs, match, export, languages, notifications. |
| **Entity data** | `core/entity-data/` | `@ngrx/data` registration, `HttpUrlGenerator`, metadata. |
| **Styles** | `styles/`, `src/manrope-fonts.scss` | Design tokens, label/focus mixins, breakpoints, Material overrides. |
| **Bootstrap** | `app.module.ts`, `app.providers.ts` | HTTP interceptors, locale factories, `provideAppInitializer` (i18n, icons, NgRx Data). |

**Design principles:** `APP_CONFIG` over magic strings; **store-first NgRx** (components dispatch actions and select state; effects and `@ngrx/data` own HTTP and side effects); HTTP interceptors for auth/XSRF.

### State management

| Store area | Slice | Responsibility |
|------------|-------|----------------|
| `entityCache` | `@ngrx/data` | Applicants and Profile via entity collection services and `*DataService` adapters. |
| `app` | root | Language, notifications, global UI flags. |
| `applicants` | feature | Filters, sort, pagination, view type — not duplicate roster rows. |
| `match` | feature | Job description, scores, loading/error. |
| `export` | feature | Selected format and export job state. |

**Applicants flow:** `loadApplicants` → GET `/api/applicants` → entity cache → selectors for grid, list, export, match.

**Profile & privacy:** Consent and privacy actions dispatch through the store; `MainEffects` syncs via `ProfileEntityCollectionService`.

### Spring backend

| Concern | Detail |
|---------|--------|
| **Entry** | `com.recruita.api.RecruitaApiApplication` |
| **Profiles** | `dev`, `prod`, `test`, `persistence`, `seed` |
| **Config** | `application.yml` + `@ConfigurationProperties` (no magic strings in Java) |
| **Persistence** | Flyway (`db/migration/`); JPA; MapStruct DTO mappers |
| **Match** | Request policy validation, Groq integration, Redis cache with persistence |
| **QA** | Spotless, Checkstyle, SpotBugs + FindSecBugs, ArchUnit, JaCoCo ≥ 80% on `verify` |

| Profile | Behavior |
|---------|----------|
| `dev` (default) | In-memory match cache; no database |
| `persistence` | Flyway on PostgreSQL; match cache in Redis |

### REST API

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/health` | Health check |
| `POST` | `/api/match` | AI match scoring |
| `GET` | `/api/applicants` | List applicant summaries |
| `GET` | `/api/applicants/full` | List applicants with all fields |
| `GET` | `/api/applicants/{id}` | Applicant detail |
| `POST` | `/api/applicants` | Create (201) |
| `PUT` | `/api/applicants/{id}` | Update |
| `DELETE` | `/api/applicants/{id}` | Delete (204) |
| `GET` | `/api/profiles/{id}` | Session profile (consent flags) |
| `POST` | `/api/profiles` | Create profile (201) |
| `PUT` | `/api/profiles/{id}` | Update profile |

Without `persistence`, applicant/profile routes return **404**; match and health still work.

### OpenAPI / Swagger

| URL (dev) | Purpose |
|-----------|---------|
| http://localhost:3001/swagger-ui.html | Swagger UI |
| http://localhost:3001/v3/api-docs | OpenAPI JSON |

**Production:** Swagger UI and `/v3/api-docs` disabled. **CI:** `npm run validate:openapi:backend` after `validate:ci:backend`.

---

## Security & privacy

Engineering documentation mapped to [OWASP Top 10 (2021)](https://owasp.org/Top10/) and typical [ASVS](https://github.com/OWASP/ASVS) expectations — not a certification or legal opinion.

### Privacy principles

| Principle | Implementation |
|-----------|----------------|
| **Session preferences** | Language and consent per browser tab; rosters in PostgreSQL with persistence. |
| **Opt-in optional processing** | Translation, geocoding, and AI matching off until consented; store selectors/effects gate external calls. |
| **Data minimization (AI)** | Match sends only correlation ids, skills, years of experience, job title — server strips again before Groq. |
| **Transparency** | `/privacy` explains storage and external transmissions; consent reopenable anytime. |
| **Portability** | JSON snapshot of loaded applicants. |
| **Session erasure** | Reset session clears in-memory consent/UI state (not server applicants). |
| **Versioned consent** | `PRIVACY_CONSENT_VERSION`; stale consent re-triggers gate dialog. |

### Consent model

| Feature | External dependency |
|---------|---------------------|
| Remote translation | `api.mymemory.translated.net` |
| Geocoding | Open-Meteo geocoding API |
| AI matching | Spring API → Groq |

### Match API data flow

```
Browser → Spring (validate + strip) → Groq
         (no credentials)           (server-only API key)
```

Client: `match-candidate-privacy.util.ts` uses **one-time correlation UUIDs**. **Never** commit `backend/.env` or put secrets in the Angular bundle.

### OWASP-aligned controls

| Area | What we do |
|------|------------|
| **A01 Broken access** | `GROQ_API_KEY` server-side only; `CORS_ORIGIN` must list real SPA origins in production (no `*`). |
| **A02 Cryptographic failures** | TLS at ingress; `ENABLE_HSTS=1` when always HTTPS. |
| **A03 Injection** | JSON body capped at **512 KB**; `/api/match` allowlisted keys; candidates reduced to `id`, `skills`, `yearsOfExperience`, `currentJobTitle`; LLM output parsed as JSON only. |
| **A04 Insecure design** | Rate limiting; consent gates; deterministic scoring fallback; generic production errors. |
| **A05 Misconfiguration** | Security headers (CSP, nosniff, COOP/CORP, referrer, Permissions-Policy, optional HSTS); production refuses `CORS_ORIGIN=*`; `TRUST_PROXY=1` for real client IPs. |
| **A06 Vulnerable components** | Lockfiles; `npm run security:audit`; weekly OWASP Dependency-Check (CVSS ≥ 8 fails); SpotBugs on every `verify`. |
| **A07 Identification / auth** | Angular auth patterns + your IdP; tokens per your security policy. |
| **A08 Integrity** | Lockfile present; bundled assets via Angular build. |
| **A09 Logging** | Production masks internal errors; stable JSON for malformed requests. |
| **A10 SSRF** | Outbound calls limited to configured Groq client; no user-controlled server fetch URLs in match API. |

### Browser hardening

`frontend/src/index.html`: Trusted Types, CSP fragments (`base-uri`, `frame-ancestors`, `object-src`), strict referrer, Permissions-Policy. For stricter CSP (`script-src` nonces), set headers on the hosting reverse proxy.

### Production deployment checklist

1. Spring **prod** profile — generic client error messages.
2. `CORS_ORIGIN` — comma-separated **https://** SPA origin(s).
3. **TLS** at ingress; `ENABLE_HSTS=1` when always HTTPS.
4. `TRUST_PROXY=1` behind a load balancer.
5. Rotate `GROQ_API_KEY` if exposed (`backend/.env.example`).

Report suspected vulnerabilities through your organization’s usual channel.

---

## Tech stack

| Layer | Technologies |
|-------|----------------|
| **Frontend** | Angular 20, Angular Material, Tailwind CSS, RxJS, NgRx (Store, Effects, Entity, Data) |
| **i18n** | `@ngx-translate` with HTTP-loaded JSON bundles |
| **Backend** | Spring Boot 3 (Java 21), JPA, Flyway, Groq match API |
| **Data stores** | PostgreSQL (applicants, profiles), Redis (match cache) |
| **Export** | ExcelJS, pdf-lib, file-saver (client-side) |
| **Backend QA** | Spotless, Checkstyle, SpotBugs, ArchUnit, JaCoCo |
| **Frontend QA** | ESLint (incl. template accessibility), Prettier, Karma, Playwright, axe, angular-doctor, ngx-security-audit, letify |
| **Tooling** | Husky, lint-staged, patch-package |
| **Runtime** | Node **22** (`.nvmrc`), npm **10.9.2**; Java **21** (`backend/.java-version`) |

---

## Project structure

```
recruita/
├── frontend/                      # @recruita/frontend — Angular 20 SPA
│   ├── src/app/                   # app.module, app.providers, modules, styles, …
│   ├── src/manrope-fonts.scss     # Self-hosted Manrope @font-face
│   ├── src/assets/i18n/           # en, de, fr, it, rm, es
│   ├── e2e/                       # Playwright (incl. accessibility.spec.ts)
│   └── proxy.conf.json            # Dev: /api → :3001
├── backend/                       # Spring Boot 3 (not an npm workspace)
│   ├── src/main/java|resources/   # application.yml, db/migration/, seed/
│   ├── src/test/java/
│   ├── config/                    # Checkstyle, SpotBugs
│   └── .env.example → .env        # Secrets (gitignored)
├── scripts/                       # run-dev.sh, seed-applicants.sh, pre-commit
├── docker-compose.yml             # recruita-postgres, recruita-redis
├── package.json                   # Orchestration scripts
└── .github/workflows/             # ci.yml, backend-security-audit.yml
```

---

## Getting started

### Prerequisites

- Node.js **22** (`.nvmrc`), npm **10.9.2** (`corepack enable && corepack prepare npm@10.9.2 --activate`)
- Java **21+** (`backend/.java-version`)
- **Docker** (for `npm run dev` — PostgreSQL + Redis)
- Copy `backend/.env.example` → `backend/.env` (never commit `.env`)

### Install

```bash
corepack enable
corepack prepare npm@10.9.2 --activate
npm ci
```

After changing `package.json` dependencies: `npm install` then `npm run lockfile:check`. Commit `package-lock.json` in the same change.

**Cursor `devdir` warning:** npm 10.9+ warns on `npm_config_devdir` injected by Cursor. Mitigations: `.cursor/sandbox.json`, `scripts/bin` on `PATH` (`.vscode/settings.json`), optional `.envrc` with direnv. Pre-commit and CI source `scripts/clean-npm-env.sh`.

### Configure the match API

```bash
cp backend/.env.example backend/.env
```

Set **`GROQ_API_KEY`** and **`PORT=3001`**. See `.env.example` for `CORS_ORIGIN`, `TRUST_PROXY`, rate limits, and HSTS.

### Run locally

```bash
npm run dev              # Docker + Angular :4200 + Spring :3001 (dev,persistence)
npm run seed:applicants  # Optional: 39 demo applicants (13 countries) + admin profile
npm start                # Frontend only (proxies /api → :3001)
npm run start:backend    # Spring only
```

| URL | Service |
|-----|---------|
| http://localhost:4200/ | Angular dev server |
| http://localhost:3001/ | Spring API (+ Swagger UI in dev) |

**Docker:** Compose project **`recruita`** (`recruita-postgres`, `recruita-redis`). Use `npm run infra:up` / `infra:down`.

**Backend only with DB:** `npm run infra:up` then `SPRING_PROFILES_ACTIVE=dev,persistence npm run start:backend`.

**Demo seed:** `npm run seed:applicants` runs a one-shot Spring job (`persistence,seed`) upserting from `backend/src/main/resources/seed/applicants-demo.json` and `seed/profile-admin.json`. Idempotent — existing ids are skipped. The SPA uses profile id **`admin`** (`APP_CONFIG.PROFILE.DEFAULT_ID`); keep aligned with `recruita.profile-api.admin-id` in `application.yml`.

### Production build

```bash
npm run build:prod   # → frontend/dist/recruita/
```

Serve the static bundle behind HTTPS with the Spring API configured per [Security & privacy](#security--privacy).

---

## npm scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Docker + Angular + Spring with persistence |
| `npm start` | Angular only |
| `npm run start:backend` | Spring only |
| `npm run infra:up` / `infra:down` | PostgreSQL + Redis |
| `npm run seed:applicants` | Demo seed (39 applicants, 13 countries, admin profile) |
| `npm run quality` | Frontend + backend format check & lint |
| `npm run quality:backend` | Spotless + Checkstyle |
| `npm run validate` / `validate:ci` | Full CI pipeline (both stacks) |
| `npm run validate:ci:frontend` | Tests, doctor, security, letify, prod build |
| `npm run validate:ci:backend` | Maven verify (JaCoCo ≥ 80%) |
| `npm run verify:backend` | `./mvnw verify` from repo root |
| `npm run lockfile:check` | Lockfile matches `package.json` |
| `npm run security:audit` | Frontend ngx-security-audit |
| `npm run e2e` | Playwright (`npm run e2e:install` first) |
| `npm run a11y:e2e -w @recruita/frontend` | axe-core WCAG checks on main routes |
| `npm run validate:openapi:backend` | Verify `/v3/api-docs` on running dev API |

---

## Testing & CI

| Layer | Command | What runs |
|-------|---------|-----------|
| Frontend unit | `npm test` | Jasmine + Karma |
| Frontend CI | `npm run validate:ci:frontend` | Quality, tests, doctor, security, letify, prod build |
| Backend | `npm run verify:backend` | Tests, SpotBugs, JaCoCo, ArchUnit |
| Full stack | `npm run validate` | Both CI gates |
| E2E | `npm run e2e` | Playwright — not in default CI yet |
| A11y E2E | `npm run a11y:e2e -w @recruita/frontend` | axe on `/main`, `/applicants`, `/match`, `/export`, `/smart-action`, `/privacy` |

**GitHub Actions:** path-filtered jobs on PR; both stacks on push to `main`/`master`. Node **22** + npm **10.9.2** via `.github/actions/setup-node-toolchain`. Weekly OWASP Dependency-Check: `backend-security-audit.yml`.

---

## Contributing

| Scope | Fast (format + lint) | Full CI gate |
|-------|----------------------|--------------|
| Frontend | `npm run quality -w @recruita/frontend` | `npm run validate:ci:frontend` |
| Backend | `npm run quality:backend` | `npm run validate:ci:backend` |
| Both | `npm run quality` | `npm run validate:ci` |

Run `npm run validate` before opening a PR.

### Pre-commit

Husky runs `scripts/pre-commit.sh`:

1. **lint-staged** — auto-fix staged files
2. **lockfile:check** — when `package.json` / lockfile staged
3. **precommit:frontend** — when `frontend/**` staged
4. **precommit:backend** — when `backend/**` staged

Do not use `git commit --no-verify` unless documented.

### Pull requests

- CI runs scoped jobs by changed paths; pushes to `main`/`master` run both stacks.
- Keep `package-lock.json` in sync after dependency changes.
- Follow [Security & privacy](#security--privacy) for deployment and secrets.

---

## Automation & agents

Prefer in Cursor/agent shells (avoids `devdir` warnings):

```bash
sh scripts/npm-run.sh run dev
sh scripts/npm-run.sh run validate:ci
sh scripts/npm-run.sh run quality
```

Plain `npm run …` also works; lifecycle scripts use `scripts/bin/npm` via `.npmrc` `script-shell`.

### Conventions

- No magic strings in Java — `application.yml` + `@ConfigurationProperties`.
- No Node backend — do not reintroduce `backend/package.json` or Express.
- **Store-first NgRx:** UI dispatches actions and selects state; effects and `@ngrx/data` own HTTP and side effects.
- After `package.json` dependency changes: `npm install` and commit `package-lock.json`.

### Do not commit

`backend/.env`, API keys, `backend/target/`, `node_modules/`, `frontend/dist/`

### Commit messages

Do not add `Co-authored-by: Cursor` or other IDE attribution trailers (Husky strips them if injected).

---

## Configuration reference

| Location | Contents |
|----------|----------|
| `frontend/src/app/config/app.config.ts` | Nav, dialogs, match, export, languages, snackbar, privacy version |
| `frontend/src/environments/` | Build-time flags |
| `backend/src/main/resources/application.yml` | API routes, persistence, Groq, rate limits (overridden by `backend/.env`) |

---

## Internationalization

Bundles: `frontend/src/assets/i18n/{en,de,fr,it,rm,es}.json`

Language stored in NgRx `app` slice; `LocalizationService` (via `provideAppInitializer`) applies ngx-translate, `document.documentElement.lang`, Material date locale, and page title. Optional MyMemory translation for dynamic strings when translation consent is on.

---

## Responsive design

| Token | Width | Typical use |
|-------|-------|-------------|
| `sm` | 600px | Single-column export; tighter applicant padding |
| `md` | 960px | Stacked match; mobile nav; full-width filters |
| `lg` | 1280px | Four-column export; full list columns |

SCSS: `_breakpoints.scss`. TypeScript: `LayoutBreakpointService`. `prefers-reduced-motion` on landing and list animations.

---

## Accessibility (WCAG foundation)

| Area | Implementation |
|------|----------------|
| **Landmarks & skip link** | `#main-content`; skip link; `RouteFocusService` in `AppEffects` on navigation |
| **Headings** | Semantic `h1`/`h2` with `_labels.scss` mixins |
| **Lint** | `@angular-eslint/template` accessibility rules |
| **E2E** | `e2e/accessibility.spec.ts` — axe-core on primary routes |
| **Typography** | Manrope via `src/manrope-fonts.scss`; Material Symbols Outlined for icons |

```bash
npm run a11y:e2e -w @recruita/frontend
```

---

*Recruita — manage applicants, match with care, export with confidence.*
