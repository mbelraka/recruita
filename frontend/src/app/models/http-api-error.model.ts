/**
 * Error thrown by `HttpApiInterceptor` for Recruita API calls. Carries the HTTP
 * status so effects can branch on it (e.g. selective retry, 404 handling) instead
 * of sniffing message text.
 */
export class HttpApiError extends Error {
  /**
   * Status used when the request never produced an HTTP response (network failure,
   * client-side timeout). Mirrors Angular's `HttpErrorResponse.status === 0` convention.
   */
  public static readonly NO_RESPONSE_STATUS = 0;

  public constructor(
    message: string,
    public readonly status: number
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}
