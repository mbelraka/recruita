import { APPLICANT } from '../constants/applicant.constants';

function locationParts(location: string | undefined): readonly string[] {
  const raw = location?.trim();
  if (!raw) {
    return [];
  }
  return raw
    .split(APPLICANT.LOCATION_PART_SEPARATOR)
    .map((part) => part.trim())
    .filter(Boolean);
}

/** City segment from `location` (first comma-separated part, or whole string). */
export function cityFromLocation(location: string | undefined): string | null {
  const parts = locationParts(location);
  return parts[0] ?? null;
}

/** Country segment from `location` (last comma-separated part, or whole string). */
export function countryFromLocation(
  location: string | undefined
): string | null {
  const parts = locationParts(location);
  if (parts.length === 0) {
    return null;
  }
  return parts[parts.length - 1] ?? null;
}
