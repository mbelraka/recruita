import { COMMA, ENTER } from '@angular/cdk/keycodes';

import { Languages } from '../enums/language.enum';
import { ApiProblemDetailPropertyKey } from '../enums/api-problem-detail-property-key.enum';
import { Applicant } from '../modules/applicants/models/applicant.model';
import { ExportFormats } from '../modules/export/enums/export-formats.enum';
import { NavLink } from '../modules/main/models/nav-link.model';
import { LayoutWidthTier } from '../services/layout-breakpoint.service';

/** Canonical in-app route paths (shared by nav links and smart-action execution). */
export const APP_ROUTES = {
  MAIN: '/main',
  APPLICANTS: '/applicants',
  MATCH: '/match',
  EXPORT: '/export',
  SMART_ACTION: '/smart-action',
} as const;

export const APP_CONFIG = {
  ROUTES: APP_ROUTES,
  /** Browser tab title (`index.html` fallback until i18n loads). */
  APP: {
    SITE_TITLE_I18N_KEY: 'app.siteTitle',
    SITE_TITLE_FALLBACK: 'Recruita - Talent without Boundaries',
  } as const,

  /** `CsrfInterceptor` + Spring `CookieCsrfTokenRepository` (names must stay aligned with `recruita.security.csrf`). */
  HTTP: {
    XSRF_COOKIE_NAME: 'XSRF-TOKEN',
    XSRF_HEADER_NAME: 'X-XSRF-TOKEN',
    CSRF_SAFE_METHODS: ['GET', 'HEAD', 'OPTIONS'] as const,
    /** Must match backend `recruita.api.problem-detail.error-property-key`. */
    PROBLEM_DETAIL_ERROR_PROPERTY: ApiProblemDetailPropertyKey.Error,
  } as const,

  /** NgRx Store DevTools (`StoreDevtoolsModule.instrument`). */
  NGRX_DEVTOOLS: {
    /** Retain the last N states in the extension time-travel history. */
    MAX_STATE_HISTORY: 25,
  } as const,

  /** Client ↔ server resync when the tab becomes visible again. */
  SYNC: {
    REFRESH_ON_TAB_VISIBLE: true,
  } as const,

  /**
   * In-app transactional feedback (NgRx `showNotification` + Material snackbar).
   * Copy lives in `assets/i18n` under `notifications.*` — see `notification-message-keys.ts`.
   * Panel base class must stay aligned with `styles/overrides/_snack-bar.scss`.
   */
  NOTIFICATION: {
    SNACKBAR: {
      /** Default auto-dismiss for success / info (ms). */
      DEFAULT_DURATION_MS: 4000,
      /** Longer auto-dismiss for error toasts (ms). */
      ERROR_DURATION_MS: 7000,
      HORIZONTAL_POSITION: 'right' as const,
      VERTICAL_POSITION: 'top' as const,
      PANEL_CLASS_BASE: 'app-notification-snackbar',
    } as const,
  } as const,

  EXPORT: {
    FILE_EXTENSIONS: {
      [ExportFormats.CSV]: 'csv',
      [ExportFormats.JSON]: 'json',
      [ExportFormats.EXCEL]: 'xlsx',
      [ExportFormats.PDF]: 'pdf',
    } as const,
    /** Fallback download stem when `export.fileName` is unavailable. */
    FILE_NAME_FALLBACK: 'applicants',
    MIME_TYPES: {
      [ExportFormats.CSV]: 'text/csv;charset=utf-8;',
      [ExportFormats.JSON]: 'application/json',
      [ExportFormats.EXCEL]:
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      [ExportFormats.PDF]: 'application/pdf',
    } as const,
    /** Also used by privacy “download my data” JSON (`PrivacyConsentService`). */
    JSON_INDENT_SPACES: 2,
    DEFAULT_EMPTY_VALUE: '',
    DEFAULT_MISSING_VALUE: '-',
    EXPERIENCE_SINGLE_LABEL: 'Year',
    EXPERIENCE_PLURAL_LABEL: 'Years',
    CSV: {
      DELIMITER: ',',
      EOL: '\n',
      SKILLS_DELIMITER: '; ',
      DATE_SLICE_END_INDEX: 10,
      HEADERS: [
        'name',
        'email',
        'phone',
        'location',
        'yearsOfExperience',
        'applicationStatus',
        'currentJobTitle',
        'availableFrom',
        'skills',
        'notes',
      ] as const,
      HEADER_LABEL_KEYS: {
        name: 'applicantList.name',
        email: 'applicantList.email',
        phone: 'applicantList.phone',
        location: 'applicantList.location',
        yearsOfExperience: 'applicantList.yearsOfExperience',
        applicationStatus: 'applicantList.applicationStatus',
        currentJobTitle: 'applicantList.currentJobTitle',
        availableFrom: 'applicants.availableFrom',
        skills: 'applicantList.skills',
        notes: 'match.fields.notes',
      } as const,
    } as const,
    EXCEL: {
      WORKSHEET_NAME: 'Applicants',
      COLUMNS: [
        { header: '#', key: 'index', width: 8 },
        { header: 'Name', key: 'name', width: 28 },
        { header: 'Job title', key: 'currentJobTitle', width: 26 },
        { header: 'Location', key: 'location', width: 22 },
        { header: 'Experience', key: 'yearsOfExperience', width: 16 },
        { header: 'Status', key: 'applicationStatus', width: 18 },
        { header: 'Email', key: 'email', width: 28 },
        { header: 'Phone', key: 'phone', width: 18 },
        { header: 'Available From', key: 'availableFrom', width: 20 },
        { header: 'Skills', key: 'skills', width: 30 },
        { header: 'Notes', key: 'notes', width: 40 },
      ] as const,
      SKILLS_DELIMITER: ', ',
    } as const,
    PDF: {
      PAGE: {
        WIDTH: 600,
        HEIGHT: 400,
      } as const,
      TITLE: 'Applicants List',
      TITLE_X: 50,
      TITLE_TOP_OFFSET: 50,
      TITLE_FONT_SIZE: 20,
      TITLE_COLOR: {
        r: 0,
        g: 0.53,
        b: 0.71,
      } as const,
      BODY_X: 50,
      BODY_TOP_OFFSET: 100,
      BODY_FONT_SIZE: 12,
      BODY_COLOR: {
        r: 0,
        g: 0,
        b: 0,
      } as const,
      ROW_STEP: 20,
      PAGE_BREAK_MIN_Y: 50,
      BODY: {
        LINE_HEIGHT_EXTRA: 2,
        ITEM_SPACING: 4,
        MIN_WRAP_CHARS: 24,
        CHAR_WIDTH_RATIO: 0.52,
      } as const,
      FOOTER: {
        FONT_SIZE: 10,
        BOTTOM_OFFSET: 20,
        RIGHT_PADDING: 16,
      } as const,
      NOTES_PREFIX: ' | Notes: ',
      AVAILABLE_FROM_LABEL: 'Available From',
      SKILLS_LABEL: 'Skills',
      LIST_ITEM_PREFIX: '#',
      FIELD_SEPARATOR: ', ',
      LABEL_SEPARATOR: ': ',
      SKILLS_DELIMITER: ', ',
    } as const,
  } as const,

  // Navigation links for the app
  NAV_LINKS: [
    { translationKey: 'nav.main', link: APP_ROUTES.MAIN, showHeader: false },
    {
      translationKey: 'nav.applicants',
      link: APP_ROUTES.APPLICANTS,
      showHeader: true,
    },
    {
      translationKey: 'nav.matchCandidates',
      link: APP_ROUTES.MATCH,
      showHeader: true,
    },
    {
      translationKey: 'nav.export',
      link: APP_ROUTES.EXPORT,
      showHeader: true,
    },
    {
      translationKey: 'nav.smartAction',
      link: APP_ROUTES.SMART_ACTION,
      showHeader: true,
    },
  ] as const satisfies readonly NavLink[],

  // Dialog configuration for modals
  DIALOG_CONFIG: {
    autoFocus: false,
    disableClose: true,
    width: '880px',
    maxWidth: '100vw',
    maxHeight: '80vh',
    restoreFocus: false,
    panelClass: 'new-applicant-dialog-panel',
  } as const,

  /** Confirm delete applicant (grid / list card). */
  CONFIRM_DELETE_APPLICANT_DIALOG: {
    width: '420px',
    maxWidth: '92vw',
    autoFocus: 'dialog',
    restoreFocus: true,
    panelClass: 'confirm-delete-applicant-dialog-panel',
  } as const,

  PROFILE: {
    /** Shared profile until a full profile UI exists. Must match `recruita.profile-api.admin-id`. */
    DEFAULT_ID: 'admin',
    API: {
      BASE_PATH: '/api/profiles',
      REQUEST_TIMEOUT_MS: 15000,
      /** User-facing copy: `ProfileApiErrorMessage`. */
    } as const,
  } as const,

  // Applicants module UI (see ApplicantsComponent)
  APPLICANTS: {
    API: {
      BASE_PATH: '/api/applicants',
      FULL_LIST_PATH: '/api/applicants/full',
      REQUEST_TIMEOUT_MS: 15000,
      /** User-facing copy: `ApplicantApiErrorMessage`. */
    } as const,
    /** Collapse debounce after pointer leaves the new-applicant FAB shell (ms); avoids edge flicker during resize. */
    NEW_APPLICANT_FAB_POINTER_LEAVE_MS: 120,
    /**
     * After the new-applicant dialog closes, ignore shell `mouseenter` this long (ms).
     * The overlay going away can deliver a spurious enter while the cursor never moved.
     */
    NEW_APPLICANT_FAB_SUPPRESS_POINTER_EXPAND_AFTER_DIALOG_MS: 400,
    /** `mat-chip-input` separators (comma, Enter). */
    NEW_APPLICANT_CHIP_SEPARATOR_KEYS: [ENTER, COMMA] as const,
    /** NgRx location geocode: debounce after `searchLocationSuggestions` before calling the API (ms). */
    LOCATION_SUGGESTIONS_DEBOUNCE_MS: 350,
    /** Debounce writing the applicants search box value into the URL query string (ms). */
    FILTER_SEARCH_URL_DEBOUNCE_MS: 350,
    /** Open-Meteo geocoding API base URL (location autocomplete). */
    LOCATION_GEOCODE_SEARCH_URL:
      'https://geocoding-api.open-meteo.com/v1/search',
    /** Open-Meteo geocode query: `count` (max results). */
    LOCATION_GEOCODE_RESULT_COUNT: '10',
    /** Open-Meteo geocode query: `format` (response shape). */
    LOCATION_GEOCODE_FORMAT: 'json',
    /** Minimum trimmed query length before geocoding runs. */
    LOCATION_GEOCODE_MIN_QUERY_LENGTH: 2,
    /** Max cached geocode queries per session (query + language key). */
    LOCATION_GEOCODE_CACHE_MAX_ENTRIES: 64,
    /**
     * Applicant grid card enter animation: `delay = min(index, cap) * stepMs` so long lists don’t
     * stagger for many seconds.
     */
    GRID_CARD_ENTER_STAGGER_CAP_INDEX: 14,
    GRID_CARD_ENTER_STAGGER_STEP_MS: 44,
    /**
     * List table row enter animation: `delay = min(index, cap) * stepMs` (same idea as grid cards).
     */
    LIST_ROW_ENTER_STAGGER_CAP_INDEX: 9,
    LIST_ROW_ENTER_STAGGER_STEP_MS: 40,
    /** Rows per page in list view (grid uses dynamic columns per row). */
    LIST_ROWS_PER_PAGE: 10,
    /**
     * List table mat-column ids per viewport tier (`lg` uses `FULL`).
     * `availability` is the UI column for store key `availableFrom`.
     */
    LIST_DISPLAYED_COLUMNS: {
      FULL: [
        'name',
        'currentJobTitle',
        'yearsOfExperience',
        'applicationStatus',
        'email',
        'phone',
        'availability',
        'location',
        'skills',
      ] as const,
      BY_WIDTH_TIER: {
        xs: ['name', 'applicationStatus', 'currentJobTitle'] as const,
        sm: [
          'name',
          'currentJobTitle',
          'yearsOfExperience',
          'applicationStatus',
          'email',
        ] as const,
        md: [
          'name',
          'currentJobTitle',
          'yearsOfExperience',
          'applicationStatus',
          'email',
          'location',
        ] as const,
      } as const satisfies Record<
        Exclude<LayoutWidthTier, 'lg'>,
        readonly string[]
      >,
    } as const,
    /** New-applicant years-of-experience numeric input constraints. */
    YEARS_OF_EXPERIENCE_MIN: 0,
    YEARS_OF_EXPERIENCE_MAX: 80,
    YEARS_OF_EXPERIENCE_STEP: 0.5,
    /**
     * Grid header sort field options: `value` matches list mat-column ids
     * (`availability` maps to store `availableFrom`).
     */
    GRID_SORT_FIELD_OPTIONS: [
      { value: 'name', sortKey: 'name', labelKey: 'applicantList.name' },
      {
        value: 'currentJobTitle',
        sortKey: 'currentJobTitle',
        labelKey: 'applicantList.currentJobTitle',
      },
      {
        value: 'yearsOfExperience',
        sortKey: 'yearsOfExperience',
        labelKey: 'applicantList.yearsOfExperience',
      },
      {
        value: 'applicationStatus',
        sortKey: 'applicationStatus',
        labelKey: 'applicantList.applicationStatus',
      },
      { value: 'email', sortKey: 'email', labelKey: 'applicantList.email' },
      { value: 'phone', sortKey: 'phone', labelKey: 'applicantList.phone' },
      {
        value: 'availability',
        sortKey: 'availableFrom',
        labelKey: 'applicantList.availability',
      },
      {
        value: 'location',
        sortKey: 'location',
        labelKey: 'applicantList.location',
      },
      { value: 'skills', sortKey: 'skills', labelKey: 'applicantList.skills' },
    ] as const satisfies ReadonlyArray<{
      readonly value: string;
      readonly sortKey: keyof Applicant;
      readonly labelKey: string;
    }>,
  } as const,

  SMART_ACTION: {
    API: {
      PARSE_PATH: '/api/action/parse',
      REQUEST_TIMEOUT_MS: 10000,
    },
    INPUT: {
      MAX_COMMAND_LENGTH: 500,
      MAX_RETRIES: 2,
    },
    VALIDATION: {
      MAX_SKILLS: 20,
      MIN_EXPERIENCE: 0,
      MAX_EXPERIENCE: 50,
      MAX_SEARCH_TERM_LENGTH: 100,
      MATCH_LIMIT_DEFAULT: 10,
      MATCH_LIMIT_MAX: 100,
      MAX_LOG_ENTRIES: 100,
    },
    LOGGING: {
      RECENT_LOGS_DEFAULT_LIMIT: 10,
      SESSION_ID_STORAGE_KEY: 'recruita_session_id',
    },
    REPORT: {
      UNKNOWN_STATUS_KEY: 'unknown',
      TYPE_LABEL_REPLACE_FROM: '_',
      TYPE_LABEL_REPLACE_TO: ' ',
    },
  } as const,

  MATCH: {
    TOP_CANDIDATES_COUNT: 3,
    REQUEST_TIMEOUT_MS: 30000,
    /** Extra headroom for NgRx effect `timeout` above the HTTP client deadline (ms). */
    EFFECT_TIMEOUT_GRACE_MS: 1000,
    /** User-facing copy: `MatchErrorMessage`. */
    SCORE: {
      MIN: 0,
      MAX: 100,
      /** Model outputs strictly between MIN and this (inclusive) are treated as fractional 0–1 scores. */
      NORMALIZE_TO_PERCENT_MAX_INCLUSIVE: 1,
    } as const,
    GROQ: {
      MATCH_ENDPOINT: '/api/match',
      MODEL: 'llama-3.3-70b-versatile',
      TEMPERATURE: 0,
      DETERMINISTIC_SCORING: true,
    } as const,
  } as const,

  // Localization and language settings
  LOCALIZATION: {
    DEFAULT_LANGUAGE: Languages.English,
    SUPPORTED_LANGUAGES: [
      Languages.English,
      Languages.German,
      Languages.French,
      Languages.Italian,
      Languages.Romansh,
      Languages.Spanish,
    ] as const,
    DATE_FORMATS: {
      [Languages.English]: 'MM/dd/yyyy',
      [Languages.German]: 'dd.MM.yyyy',
      [Languages.French]: 'dd/MM/yyyy',
      [Languages.Italian]: 'dd/MM/yyyy',
      [Languages.Romansh]: 'dd.MM.yyyy',
      [Languages.Spanish]: 'dd/MM/yyyy',
    },
    LOCALES: {
      [Languages.English]: 'en-US',
      [Languages.German]: 'de-DE',
      [Languages.French]: 'fr-FR',
      [Languages.Italian]: 'it-IT',
      [Languages.Romansh]: 'de-CH',
      [Languages.Spanish]: 'es-ES',
    },
  },

  /**
   * Free, public translation endpoint.
   * Used for dynamic (user-entered) values like job titles.
   *
   * Notes:
   * - Public instances are rate-limited; we cache results client-side.
   * - Response quality varies; we always fall back to the original text.
   */
  TRANSLATION: {
    MYMEMORY_URL: 'https://api.mymemory.translated.net/get',
    REQUEST_TIMEOUT_MS: 8000,
    QUERY_PARAM_TEXT: 'q',
    QUERY_PARAM_LANGPAIR: 'langpair',
    LANGPAIR_SEPARATOR: '|',
    CACHE_KEY_SEGMENT_SEPARATOR: '|',
    IN_FLIGHT_SHARE_REPLAY_BUFFER_SIZE: 1,
  } as const,

  getLocale: (language: Languages): string => {
    return (
      APP_CONFIG.LOCALIZATION.LOCALES[language] ||
      APP_CONFIG.LOCALIZATION.LOCALES[APP_CONFIG.LOCALIZATION.DEFAULT_LANGUAGE]
    );
  },

  getDateFormat: (language: Languages): string => {
    return (
      APP_CONFIG.LOCALIZATION.DATE_FORMATS[language] ||
      APP_CONFIG.LOCALIZATION.DATE_FORMATS[
        APP_CONFIG.LOCALIZATION.DEFAULT_LANGUAGE
      ]
    );
  },

  getApplicantListDisplayedColumns: (widthTier: LayoutWidthTier): string[] => {
    if (widthTier === 'lg') {
      return [...APP_CONFIG.APPLICANTS.LIST_DISPLAYED_COLUMNS.FULL];
    }
    return [
      ...APP_CONFIG.APPLICANTS.LIST_DISPLAYED_COLUMNS.BY_WIDTH_TIER[widthTier],
    ];
  },
};
