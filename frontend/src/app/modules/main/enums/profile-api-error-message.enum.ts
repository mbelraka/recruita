export enum ProfileApiErrorMessage {
  RequestTimeout = 'The profile request timed out. Please try again.',
  Unreachable = 'Unable to reach the profile service. Start the backend with the persistence profile and try again.',
  NotAvailable = 'Profile API is not available. Run npm run infra:up and start the backend with SPRING_PROFILES_ACTIVE=dev,persistence.',
}
