export interface ActionLogEntry {
  readonly timestamp: Date;
  readonly actionType: string;
  readonly success: boolean;
  readonly durationMs: number;
  readonly sessionId: string;
}
