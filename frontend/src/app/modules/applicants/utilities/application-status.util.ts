import { createEnumGuard } from '../../../utilities/enum.util';
import { ApplicationStatus } from '../enums/application-status.enum';

const isApplicationStatusValue = createEnumGuard(ApplicationStatus);

export function isApplicationStatus(
  value: string | null | undefined
): value is ApplicationStatus {
  return isApplicationStatusValue(value);
}

export function parseApplicationStatus(
  value: string | null | undefined
): ApplicationStatus | undefined {
  const normalized = (value ?? '').trim();
  return isApplicationStatus(normalized) ? normalized : undefined;
}
