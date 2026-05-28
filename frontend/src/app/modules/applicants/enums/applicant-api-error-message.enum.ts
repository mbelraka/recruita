export enum ApplicantApiErrorMessage {
  RequestTimeout = 'The applicant request timed out. Please try again.',
  Unreachable = 'Unable to reach the applicant service. Start the backend with the persistence profile and try again.',
  NotAvailable = 'Applicant API is not available. Run docker compose and start the backend with SPRING_PROFILES_ACTIVE=dev,persistence.',
}
