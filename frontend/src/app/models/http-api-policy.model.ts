import type { HttpApiErrorMessages } from './http-api-error-messages.model';

export interface HttpApiPolicy {
  readonly timeoutMs: number;
  readonly messages: HttpApiErrorMessages;
}
