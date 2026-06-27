/** HTTP status codes used by the Recruita API client (aligned with Spring responses). */
export enum HttpStatusCode {
  NotFound = 404,
  BadRequest = 400,
  Conflict = 409,
  InternalServerError = 500,
  BadGateway = 502,
  ServiceUnavailable = 503,
  GatewayTimeout = 504,
}
