/** Applicant phone: digits, +, parens, dots, spaces, hyphens; min length 5. */
export const APPLICANT_PHONE_PATTERN = /^[\d+().\s-]{5,}$/;

/** Collapse runs of whitespace to a single space (e.g. notes cleanup). */
export const WHITESPACE_RUN = /\s+/g;

/** After NFD/NFKD normalization, strip combining diacritical marks (e.g. for i18n key segments). */
export const UNICODE_COMBINING_MARKS = /[\u0300-\u036F]/g;

/** Replace non-alphanumeric runs with a single space. */
export const NON_ALPHANUMERIC_TO_SPACE = /[^a-zA-Z0-9]+/g;

/** CSV cell needs quoting if it contains quote, comma, or line break. */
export const CSV_FIELD_NEEDS_QUOTING = /[",\n\r]/;

/** Escape double quotes inside a CSV quoted field. */
export const CSV_DOUBLE_QUOTE = /"/g;

/** Strip leading "Match score ..." sentence from recommendation text. */
export const MATCH_SCORE_PREFIX =
  /^match\s*score\s*[:\-]?\s*\d+(?:\.\d+)?(?:\s*\/\s*100|\s*%)?\.?\s*/i;
