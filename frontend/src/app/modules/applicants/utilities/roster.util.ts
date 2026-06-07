import { ApplicationStatus } from '../enums/application-status.enum';
import { Applicant } from '../models/applicant.model';
import { parseApplicationStatus } from './application-status.util';
import {
  cityFromLocation,
  countryFromLocation,
} from './applicant-location.util';

/** Unicode root locale for roster key comparison across UI languages. */
export const ROSTER_COMPARE_LOCALE = 'und' as const;

export function normalizeRosterKey(token: string): string {
  return token.trim().toLocaleLowerCase(ROSTER_COMPARE_LOCALE);
}

export function rosterLabelsEqual(left: string, right: string): boolean {
  return normalizeRosterKey(left) === normalizeRosterKey(right);
}

/** Case-insensitive match of LLM tokens to roster labels (no alias tables). */
export function matchRosterLabel(
  token: string,
  rosterLabels: readonly string[]
): string | null {
  const trimmed = token.trim();
  if (!trimmed) {
    return null;
  }

  return (
    rosterLabels.find((label) => rosterLabelsEqual(label, trimmed)) ?? null
  );
}

export function rosterCountries(
  applicants: readonly Applicant[]
): readonly string[] {
  const countries = new Set<string>();
  for (const applicant of applicants) {
    const country = countryFromLocation(applicant.location);
    if (country) {
      countries.add(country);
    }
  }
  return [...countries];
}

export function rosterSkills(
  applicants: readonly Applicant[]
): readonly string[] {
  const skills = new Set<string>();
  for (const applicant of applicants) {
    for (const skill of applicant.skills ?? []) {
      skills.add(skill);
    }
  }
  return [...skills];
}

function countryFromRosterCity(
  cityToken: string,
  applicants: readonly Applicant[]
): string | null {
  const normalizedCity = normalizeRosterKey(cityToken);
  if (!normalizedCity) {
    return null;
  }

  for (const applicant of applicants) {
    const city = cityFromLocation(applicant.location);
    if (city && normalizeRosterKey(city) === normalizedCity) {
      return countryFromLocation(applicant.location);
    }
  }

  return null;
}

/** Aligns validated LLM country tokens to roster labels (case or roster city only). */
export function canonicalizeRosterCountry(
  country: string,
  applicants: readonly Applicant[]
): string | null {
  const countries = rosterCountries(applicants);
  const matched = matchRosterLabel(country, countries);
  if (matched) {
    return matched;
  }

  return countryFromRosterCity(country, applicants);
}

/** Aligns validated LLM skill tokens to roster labels (case only). */
export function canonicalizeRosterSkill(
  skill: string,
  applicants: readonly Applicant[]
): string | null {
  return matchRosterLabel(skill, rosterSkills(applicants));
}

/** Accepts only application status wire values from the validated LLM payload. */
export function canonicalizeRosterStatus(
  status: string | ApplicationStatus | undefined
): ApplicationStatus | null {
  if (!status) {
    return null;
  }

  return parseApplicationStatus(String(status)) ?? null;
}
