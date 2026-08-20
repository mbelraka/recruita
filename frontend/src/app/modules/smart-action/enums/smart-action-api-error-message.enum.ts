export enum SmartActionApiErrorMessage {
  RequestTimeout = 'The Smart Action request timed out. Please try again.',
  Unreachable = 'Unable to reach the Smart Action service. Start the backend with the persistence profile and try again.',
  NotAvailable = 'Smart Action is not available. Run npm run infra:up and start the backend with SPRING_PROFILES_ACTIVE=dev,persistence.',
}
