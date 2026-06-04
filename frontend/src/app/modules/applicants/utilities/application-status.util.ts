import { ApplicationStatus } from '../enums/application-status.enum';

const APPLICATION_STATUS_VALUES = new Set<string>(
  Object.values(ApplicationStatus)
);

export function isApplicationStatus(
  value: string | null | undefined
): value is ApplicationStatus {
  return (
    typeof value === 'string' &&
    APPLICATION_STATUS_VALUES.has(value as ApplicationStatus)
  );
}

export function parseApplicationStatus(
  value: string | null | undefined
): ApplicationStatus | undefined {
  const normalized = (value ?? '').trim();
  return isApplicationStatus(normalized) ? normalized : undefined;
}
