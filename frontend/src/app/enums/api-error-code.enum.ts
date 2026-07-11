/** Stable API problem `code` values (`recruita.api.problem-detail.code-property-key`). */
export enum ApiErrorCode {
  RequestValidation = 'request-validation',
  InvalidJsonBody = 'invalid-json-body',
  MatchValidation = 'match-validation',
  ApplicantNotFound = 'applicant-not-found',
  ApplicantConflict = 'applicant-conflict',
  ProfileNotFound = 'profile-not-found',
  ProfileConflict = 'profile-conflict',
  RouteNotFound = 'route-not-found',
  MatchServiceUnavailable = 'match-service-unavailable',
  RateLimitExceeded = 'rate-limit-exceeded',
  InternalError = 'internal-error',
}
