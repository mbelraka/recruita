# Recruita

**Talent without boundaries** — a full-stack recruitment workspace for managing applicant pipelines, ranking candidates with consent-gated AI matching, exporting hiring data in multiple formats, and giving users explicit control over privacy and third-party processing.

Recruita is built as a **production-minded monorepo**: lazy-loaded Angular feature modules, a Spring Boot API with strict validation and high test coverage, centralized configuration, and quality gates that mirror CI on every commit. The UI is **fully responsive** (phone through desktop) and ships in **six languages**.

> **Monorepo:** npm workspace **`frontend/`** (`@recruita/frontend`, Angular 20) + Maven **`backend/`** (Spring Boot 3, Java 21). The match API is **Spring only** — there is no Node/Express server. Root `package.json` orchestrates dev, CI, and Husky.

---

## Table of contents

1. [What is Recruita?](#what-is-recruita)
2. [Who is it for?](#who-is-it-for)
3. [Key capabilities](#key-capabilities)
4. [Application tour](#application-tour)
5. [Typical workflows](#typical-workflows)
6. [Applicant data model](#applicant-data-model)
7. [Security and data privacy](#security-and-data-privacy)
8. [Architecture](#architecture)
9. [Tech stack](#tech-stack)
10. [Project structure](#project-structure)
11. [Getting started](#getting-started)
12. [npm scripts](#npm-scripts)
13. [Testing and CI](#testing-and-ci)
14. [Configuration reference](#configuration-reference)
15. [Internationalization](#internationalization)
16. [Responsive design](#responsive-design)
17. [Related documentation](#related-documentation)

---

## What is Recruita?

Recruita is a **browser-based hiring operations tool** that helps recruiters and hiring teams:

- **Capture and organize** applicant profiles (contact details, skills, experience, pipeline status, notes).
- **Search and filter** large rosters with grid/list views, skill chips, status and country filters, and sortable columns.
- **Rank candidates** against a job description using an AI-assisted match score — with anonymized payloads and server-side credential handling.
- **Export** roster data as CSV, JSON, Excel, or PDF for reporting, backups, or handoff to other systems.
- **Stay in control of privacy** through a versioned consent model that gates optional third-party features (translation, geocoding, AI matching).

The product is intentionally **modular**: each major area (applicants, match, export, privacy) is a lazy-loaded Angular module with its own NgRx slice, while shared shell concerns (navigation, language, notifications, consent gate) live in the root container.

**Persistence:** With the `persistence` Spring profile (enabled by default in `npm run dev`), applicant rosters and session profiles are stored in **PostgreSQL** and accessed via REST. Match result caching uses **Redis**. Language preference and in-flight UI state remain session-oriented in the browser.

---

## Who is it for?

| Audience | How Recruita helps |
|----------|-------------------|
| **Recruiters / talent teams** | Maintain a searchable applicant roster, track pipeline status, and shortlist against open roles. |
| **Hiring managers** | Review ranked candidates with localized reasoning snippets tied to a job description. |
| **Engineering teams** | Reference implementation for privacy-by-default SPA + API design, NgRx Data entity caching, and OWASP-aligned match proxy patterns. |
| **Operators** | Deploy a static Angular bundle behind HTTPS with a separately configured Spring API (see [SECURITY.md](./SECURITY.md)). |

Recruita is **not** a full ATS replacement out of the box: it focuses on roster management, AI-assisted ranking, export, and transparent consent — without prescribing a particular identity provider or multi-tenant model. `AuthInterceptor` and XSRF configuration are ready for you to wire to your IdP.

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
| **i18n** | EN, DE, FR, IT, RM, ES — locale-aware dates, numbers, and locations. |
| **PWA** | Production builds enable the Angular service worker (`ngsw-config.json`). |
| **Quality gates** | Husky pre-commit runs scoped frontend/backend CI checks; GitHub Actions on push/PR. |

---

## Application tour

### Landing (`/main`)

The home hub introduces Recruita with a headline, primary CTA into applicants, and a hero visual. On narrow screens the layout **stacks vertically** with scaled typography. Entry route: first item in `APP_CONFIG.NAV_LINKS`.

### Applicants (`/applicants`)

The core workspace for roster management.

| UI area | Behavior |
|---------|----------|
| **Filter header** | Search (name, email, skills, role, etc.), status dropdown, country dropdown, optional grid sort field, skill filter chip, grid/list toggle. On tablet and below, filters expand to **full width**. |
| **Grid view** | Card grid with pagination; column count adapts to container width. |
| **List view** | Sortable Material table; **columns reduce automatically** on smaller viewports (down to name, status, and job title on phones). |
| **FAB** | Extended floating action button to add a new applicant. |
| **Edit flow** | Row/card click or FAB opens the new/edit dialog; detail fetch loads full notes before edit. |

**Application statuses** (persisted on each applicant): `received`, `screening`, `interview_scheduled`, `shortlisted`, `offer_extended`, `rejected`, `withdrawn` — rendered as localized chips.

**Search note:** Notes are included in global search only after an applicant’s detail has been loaded into the entity cache (e.g. after opening the edit dialog), because the summary roster API omits notes for performance.

### Match (`/match`)

Score applicants against a free-text **job description**.

1. User enters or pastes a job description (consent for AI matching must be granted).
2. The client builds an **anonymized** candidate payload (`match-candidate-privacy.util.ts`): one-time correlation UUIDs per applicant, plus skills, years of experience, and job title only.
3. Spring validates, strips again, and calls **Groq** (or a deterministic fallback path without external calls).
4. Results show ranked cards with scores and localized reasoning.

On viewports ≤960px the job panel and results **stack** in a single column.

### Export (`/export`)

Four export cards (JSON, CSV, PDF, Excel). Each triggers client-side file generation from applicants currently in the NgRx Data entity cache. The grid layout is **1 → 2 → 4 columns** across breakpoints (phone → tablet → desktop).

### Privacy (`/privacy`)

Standalone page inside the root shell:

- Explains what is stored and what optional features transmit externally.
- Lets users reopen consent choices.
- **Download my data** — JSON snapshot of loaded applicants.
- **Reset session** — reloads the app and clears in-memory consent/UI state (does not delete server-stored applicants).

On first visit (or when consent is incomplete/outdated), a **non-dismissible** dialog gates the app until choices are recorded.

---

## Typical workflows

### Onboard a new applicant

1. Open **Applicants** → tap the **New applicant** FAB.
2. Fill required fields (name, email, etc.), add skills (chip input), set status and availability.
3. Optionally use **location autocomplete** (requires geocoding consent).
4. Save — NgRx dispatches create; `ApplicantDataService` POSTs to `/api/applicants`; entity cache updates.

### Shortlist for a role

1. Open **Match**.
2. Paste the job description → **Evaluate**.
3. Review ranked cards; open top candidates from the applicants module if needed.
4. Filter applicants by skill from list/grid skill links.

### Hand off data to HRIS or reporting

1. Open **Export**.
2. Choose format (e.g. Excel).
3. File downloads with localized column headers where applicable.

### Review or change privacy choices

1. Footer link → **Privacy**, or wait for the consent dialog on outdated consent version.
2. Toggle optional features or accept necessary-only processing.
3. Profile entity cache syncs consent flags; match/geocoding/translation services respect them immediately.

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
| `availableFrom` | Date; localized in list/grid via `LocaleDatePipe`. |
| `currentJobTitle` | May use optional remote translation (MyMemory) when translation consent is on. |

---

## Security and data privacy

Recruita is designed around **privacy by default**, **consent-gated optional processing**, and **defense in depth** on the match API. Controls are mapped to [OWASP Top 10 (2021)](https://owasp.org/Top10/) themes and typical [OWASP ASVS](https://github.com/OWASP/ASVS) expectations. This is engineering documentation, not a certification or legal opinion.

**Full control matrix and deployment checklist:** [SECURITY.md](./SECURITY.md).

### Data privacy principles

| Principle | How Recruita applies it |
|-----------|-------------------------|
| **Session preferences** | Language and consent apply for the current browser tab. Applicant rosters use PostgreSQL when the persistence profile is active. |
| **Opt-in optional processing** | Translation, geocoding, and AI matching are **off until the user consents**. Services check `PrivacyConsentService` before calling external APIs. |
| **Data minimization (AI)** | Match requests send only ephemeral correlation ids, skills, years of experience, and job title — never name, email, phone, location, notes, or application status. The server strips again before scoring or Groq. |
| **Transparency** | `/privacy` explains what is stored locally and what each optional feature transmits. Consent can be reopened anytime. |
| **Portability** | Users can download a JSON snapshot of applicants loaded in the current session. |
| **Right to erasure (session)** | “Reset session” reloads the app and clears in-memory consent and UI state. Server-stored applicants are not deleted. |
| **Versioned consent** | Consent records include `PRIVACY_CONSENT_VERSION`; stale consent re-triggers the gate dialog. |

### Consent model

| Optional feature | When enabled | External dependency |
|------------------|--------------|---------------------|
| **Remote translation** | Dynamic text (e.g. job titles) may call MyMemory | `api.mymemory.translated.net` |
| **Geocoding** | Location field autocomplete | Open-Meteo geocoding API |
| **AI matching** | Job description + anonymized candidates sent to match API | Spring API → Groq |

Implementation: `PrivacyConsentService`, `PrivacyConsentDialogService`, profile entity cache via `ProfileEntityCollectionService.syncProfileInCache()`.

### Match API data flow

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
- **Never** commit `backend/.env` or put match-provider secrets in the Angular bundle.

### OWASP-aligned controls (summary)

| Theme | Highlights |
|-------|------------|
| **A01 Access control** | Match credentials server-side only; production `CORS_ORIGIN` must list real SPA origins (no `*`). |
| **A03 Injection** | Match body capped at 512 KB; allowlisted keys; JSON-only LLM output parsing. |
| **A04 Insecure design** | Rate limiting; consent gates; generic production errors. |
| **A05 Misconfiguration** | Spring Security deny-by-default; CSP, nosniff, COOP/CORP, optional HSTS. |
| **A06 Vulnerable components** | Lockfiles + `npm run security:audit`; OWASP Dependency-Check weekly on backend. |

Browser hardening in `frontend/src/index.html`: Trusted Types, CSP fragments, strict referrer policy, Permissions-Policy disabling camera/mic/geolocation by default.

### Production deployment checklist

1. Spring **prod** profile — generic error messages to clients.
2. `CORS_ORIGIN` — comma-separated **https://** SPA origin(s).
3. **TLS** at ingress; `ENABLE_HSTS=1` when always HTTPS.
4. `TRUST_PROXY=1` behind a load balancer for accurate rate limits.
5. Rotate `GROQ_API_KEY` if exposure is suspected (`backend/.env.example`).

---

## Architecture

### High-level system diagram

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
│         │                 │                       │              │
│         ▼                 ▼                       ▼              │
│     PostgreSQL        PostgreSQL              Redis (cache)    │
└─────────────────────────────────────────────────────────────────┘
```

### Frontend structure

| Layer | Location | Role |
|-------|----------|------|
| **Shell** | `containers/root/` | `RootComponent` — tab nav (desktop) / menu (mobile), language select, footer, privacy gate, `router-outlet`. |
| **Features** | `modules/{main,applicants,match,export}/` | Lazy-loaded routes, components, effects, selectors. |
| **Shared** | `shared/` | Grid cards, pipes (`LocaleDate`, `LocaleLocation`, …), Material barrel. |
| **Config** | `config/app.config.ts` | Single source for nav, dialogs, match, export, languages, notifications. |
| **Entity data** | `core/entity-data/` | `@ngrx/data` registration, `HttpUrlGenerator`, entity metadata. |
| **Styles** | `styles/` | Design tokens, breakpoints (600 / 960 / 1280 px), Material overrides, theme. |

**Design principles:** SOLID-oriented modules, atomic composition (chips, cards → feature containers), `APP_CONFIG` instead of scattered magic strings, `providedIn: 'root'` services, HTTP interceptors for auth/XSRF.

### State management

Recruita uses **NgRx** with a split between **entity cache** (server-backed domain data) and **feature UI slices** (filters, sort, view mode).

| Store area | Key / slice | Responsibility |
|------------|-------------|----------------|
| `entityCache` | `@ngrx/data` | **Applicants** and **Profile** entities via `ApplicantEntityCollectionService` / `ProfileEntityCollectionService` and `*DataService` HTTP adapters. |
| `app` | root | Language, notifications, global UI flags. |
| `applicants` | feature | Filters, sort, pagination, view type (grid/list) — not duplicate roster rows. |
| `match` | feature | Job description, scores, loading/error. |
| `export` | feature | Selected format and export job state. |

**Data flow (applicants):**

1. `loadApplicants` effect → `ApplicantEntityCollectionService.loadRoster()` → GET `/api/applicants` → `addAllToCache` + `setLoaded(true)`.
2. Create/update/delete → effects → data service → API → entity cache upsert/remove.
3. Selectors in `entity-cache.selectors.ts` project cached entities for grid, list, export, and match.

**Profile & privacy:** `loadProfile` loads the admin profile into the entity cache; consent outcomes call `syncProfileInCache()` so selectors and `PrivacyConsentDialogService` read consistent flags.

### Spring backend

| Concern | Detail |
|---------|--------|
| **Entry** | `com.recruita.api.RecruitaApiApplication` |
| **Profiles** | `dev`, `prod`, `test`, `persistence`, `seed` |
| **Config** | `application.yml` + `@ConfigurationProperties` (no magic strings in Java) |
| **Persistence** | Flyway migrations; JPA repositories; MapStruct DTO mappers |
| **Match** | Sealed evaluation results, request policy validation, Groq integration, Redis cache when persistence is on |
| **QA** | Spotless, Checkstyle, SpotBugs + FindSecBugs, ArchUnit, JaCoCo ≥ 80% branch coverage on `verify` |

### REST API (persistence profile)

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

Interactive API documentation is generated with **springdoc-openapi** 2.8.x (OpenAPI 3; requires 2.7+ on Spring Boot 3.4).

| URL (dev) | Purpose |
|-----------|---------|
| http://localhost:3001/swagger-ui.html | Swagger UI — browse and try endpoints |
| http://localhost:3001/v3/api-docs | Machine-readable OpenAPI JSON |

Configuration: `recruita.api.openapi` in `application.yml` (metadata + security permit paths), `OpenApiDocumentFactory` (builds the spec), and thin `OpenApiConfig`. Controllers use `@Tag` / `@Operation`; match DTOs include `@Schema` for anonymized payloads. `springdoc.*` paths must stay aligned with `recruita.api.openapi.permitted-paths`.

**Production:** `application-prod.yml` disables both Swagger UI and `/v3/api-docs`. **CI** runs `npm run validate:openapi:backend` to curl the spec against a live dev server after `validate:ci:backend`.

---

## Tech stack

| Layer | Technologies |
|-------|----------------|
| **Frontend** | Angular 20, Angular Material, Tailwind CSS, RxJS, NgRx (Store, Effects, Entity, **Data**) |
| **i18n** | `@ngx-translate` with HTTP-loaded JSON bundles |
| **Backend** | Spring Boot 3 (Java 21), JPA, Flyway, Groq match API |
| **Data stores** | PostgreSQL (applicants, profiles), Redis (match cache) |
| **Export** | ExcelJS, pdf-lib, file-saver (client-side) |
| **Backend QA** | Spotless, Checkstyle, SpotBugs, ArchUnit, JaCoCo |
| **Frontend QA** | ESLint, Prettier, Karma, Playwright, angular-doctor, ngx-security-audit, letify |
| **Tooling** | Husky, lint-staged, patch-package |
| **Runtime** | Node **22** (`.nvmrc`), npm **10.9.2**; Java **21** (`backend/.java-version`) |

---

## Project structure

```
recruita/                          # Monorepo root
├── frontend/                      # @recruita/frontend — Angular 20 SPA
│   ├── src/app/
│   │   ├── config/                # APP_CONFIG
│   │   ├── containers/root/       # Shell, routing, privacy page
│   │   ├── core/entity-data/      # @ngrx/data setup
│   │   ├── modules/               # main, applicants, match, export
│   │   ├── services/              # LayoutBreakpointService, localization, …
│   │   ├── shared/                # Pipes, cards, Material barrel
│   │   └── styles/                # Tokens, breakpoints, theme, overrides
│   ├── src/assets/i18n/           # en, de, fr, it, rm, es
│   ├── e2e/                       # Playwright specs
│   └── proxy.conf.json            # Dev: /api → http://localhost:3001
├── backend/                       # Spring Boot 3 (not an npm workspace)
│   ├── src/main/java|resources/
│   ├── src/test/java/
│   ├── config/                    # Checkstyle, SpotBugs
│   └── .env.example → .env        # Secrets (gitignored)
├── scripts/                       # run-dev.sh, seed-applicants.sh, pre-commit
├── docker-compose.yml             # recruita-postgres, recruita-redis
├── package.json                   # Orchestration scripts
├── CONTRIBUTING.md
├── AGENTS.md
├── SECURITY.md
└── .github/workflows/             # ci.yml, backend-security-audit.yml
```

---

## Getting started

See **[CONTRIBUTING.md](./CONTRIBUTING.md)** for monorepo conventions, pre-commit behavior, and PR expectations.

### Prerequisites

- Node.js **22** (see `.nvmrc`)
- npm **10.9.2** (`corepack enable && corepack prepare npm@10.9.2 --activate`)
- Java **21+** (see `backend/.java-version`)
- **Docker** (for `npm run dev` — PostgreSQL + Redis)

### Install

```bash
corepack enable
corepack prepare npm@10.9.2 --activate
npm ci
```

Use the pinned npm version; other versions can rewrite `package-lock.json` and fail CI `lockfile:check`.

### Configure the match API

```bash
cp backend/.env.example backend/.env
```

Set at least **`GROQ_API_KEY`** and **`PORT=3001`**. See `.env.example` for `CORS_ORIGIN`, `TRUST_PROXY`, rate limits, and HSTS.

### Run locally

```bash
npm run dev              # Docker + Angular :4200 + Spring :3001 (dev,persistence)
npm run seed:applicants  # Optional: demo applicants + admin profile in PostgreSQL
npm start                # Frontend only (proxies /api → :3001)
npm run start:backend    # Spring only (no DB unless you enable persistence)
```

| URL | Service |
|-----|---------|
| http://localhost:4200/ | Angular dev server |
| http://localhost:3001/ | Spring API |

**Docker:** Compose project **`recruita`** — containers `recruita-postgres`, `recruita-redis`. If you previously used a folder-named project, run `docker compose -p applicant-project down` once before `npm run infra:up`.

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
| `npm run dev` | Docker + Angular + Spring with persistence |
| `npm start` | Angular only |
| `npm run start:backend` | Spring only (default `dev` profile) |
| `npm run infra:up` / `infra:down` | PostgreSQL + Redis |
| `npm run seed:applicants` | Idempotent demo data seed |
| **Quality (fast)** | |
| `npm run quality` | Frontend + backend format check & lint |
| `npm run quality:backend` | Spotless + Checkstyle |
| **CI / pre-commit** | |
| `npm run validate` / `validate:ci` | Full pipeline (both stacks) |
| `npm run validate:ci:frontend` | Tests, doctor, security, prod build |
| `npm run validate:ci:backend` | Maven verify (JaCoCo ≥ 80%) |
| **Other** | |
| `npm run lockfile:check` | Lockfile matches `package.json` |
| `npm run security:audit` | Frontend ngx-security-audit |
| `npm run e2e` | Playwright (`npm run e2e:install` first) |
| `npm run validate:openapi:backend` | Verify `/v3/api-docs` on a running dev API |

Pre-commit: **lint-staged** → **lockfile:check** (when lockfile staged) → scoped **precommit:frontend** / **precommit:backend**. Do not use `git commit --no-verify`.

---

## Testing and CI

| Layer | Command | What runs |
|-------|---------|-----------|
| Frontend unit | `npm test` | Jasmine + Karma |
| Frontend CI | `npm run validate:ci:frontend` | Quality, tests, doctor, security, letify, prod build |
| Backend | `npm run verify:backend` | Tests, SpotBugs, JaCoCo, ArchUnit |
| Full stack | `npm run validate` | Frontend + backend CI gates |
| E2E | `npm run e2e` | Playwright — not in default CI yet |

**GitHub Actions** (`.github/workflows/ci.yml`): path-filtered jobs for frontend, backend, and lockfile; both stacks always run on push to `main` / `master`. Weekly OWASP Dependency-Check: `backend-security-audit.yml`.

---

## Configuration reference

**`frontend/src/app/config/app.config.ts`** — navigation, dialogs, applicant UI (pagination, sort options), match endpoint/model/timeouts, export formats and filenames, supported languages, snackbar timing, privacy consent version.

**`frontend/src/environments/`** — `environment.ts`, `environment.prod.ts` for build-time flags.

**`backend/src/main/resources/application.yml`** — API routes, persistence toggle, Groq settings, rate limits (overridden by `backend/.env` in dev/prod).

---

## Internationalization

Bundles: `frontend/src/assets/i18n/{en,de,fr,it,rm,es}.json`

Includes dedicated namespaces for `privacy.*`, `notifications.*`, `applicationStatus.*`, and per-feature copy. Language persists via `LocalizationService` / NgRx `app` slice. Shared pipes format dates, numbers, and location strings per active locale.

Optional **remote translation** (MyMemory) for dynamic strings such as job titles — only when translation consent is enabled.

---

## Responsive design

Recruita targets **phone, tablet, and desktop** with a shared breakpoint scale:

| Token | Width | Typical use |
|-------|-------|-------------|
| `sm` | 600px | Single-column export; tighter applicant padding |
| `md` | 960px | Stacked match layout; mobile nav menu; full-width filters; full-screen dialogs |
| `lg` | 1280px | Four-column export grid; full applicant list columns |

**Implementation:**

- SCSS mixins: `frontend/src/app/styles/shared/_breakpoints.scss`
- TypeScript: `LayoutBreakpointService` (`BreakpointObserver`) for dynamic column sets
- Root shell: hamburger `mat-menu` replaces tab bar below `md`
- `prefers-reduced-motion` respected on landing and list animations

Resize the browser or use DevTools device mode to verify layouts at http://localhost:4200/.

---

## Related documentation

| Document | Contents |
|----------|----------|
| [CONTRIBUTING.md](./CONTRIBUTING.md) | Install, dev commands, pre-commit, PR expectations |
| [AGENTS.md](./AGENTS.md) | Automation/agent guide for this monorepo |
| [SECURITY.md](./SECURITY.md) | Full security control matrix and deployment checklist |
| [backend/README.md](./backend/README.md) | Spring profiles, API tables, Maven commands |

---

*Recruita — manage applicants, match with care, export with confidence.*
