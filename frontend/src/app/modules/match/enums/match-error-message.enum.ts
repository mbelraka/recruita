export enum MatchErrorMessage {
  MissingJobDescription = 'Please provide a job description.',
  NoApplicantsAvailable = 'No applicants available for matching.',
  GroqRequestTimeout = 'The matching request timed out. Please try again.',
  GroqProxyUnreachable = 'Unable to reach the matching service. Please try again later.',
}
