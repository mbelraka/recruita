export interface ParseActionResponse {
  readonly valid: boolean;
  readonly action: Record<string, unknown>;
  readonly errors: readonly string[];
}
