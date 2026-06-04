import { Applicant } from '../models/applicant.model';

export const APPLICANT_AVAILABILITY_SORT_UI_COLUMN = 'availability';
export const APPLICANT_AVAILABLE_FROM_SORT_KEY: keyof Applicant =
  'availableFrom';

export function applicantSortUiColumnFromStoreKey(
  key: keyof Applicant | null
): string {
  if (!key) {
    return '';
  }
  return key === APPLICANT_AVAILABLE_FROM_SORT_KEY
    ? APPLICANT_AVAILABILITY_SORT_UI_COLUMN
    : String(key);
}

export function applicantSortStoreKeyFromUiColumn(
  active: string
): keyof Applicant {
  return active === APPLICANT_AVAILABILITY_SORT_UI_COLUMN
    ? APPLICANT_AVAILABLE_FROM_SORT_KEY
    : (active as keyof Applicant);
}
