import { APPLICANT } from '../constants/applicant.constants';
import { ApplicationStatus } from '../enums/application-status.enum';
import { Applicant } from '../models/applicant.model';
import { parseApplicationStatus } from './application-status.util';

export type ApplicantInit = Partial<
  Omit<Applicant, 'applicationStatus' | 'yearsOfExperience' | 'availableFrom'>
> & {
  firstName?: string;
  lastName?: string;
  yearsOfExperience?: number | string | null;
  availableFrom?: Date | string | number | null;
  applicationStatus?: string | ApplicationStatus | null;
};

export function createApplicant(init?: ApplicantInit): Applicant {
  if (!init) {
    return { id: '' };
  }

  const {
    firstName,
    lastName,
    yearsOfExperience,
    availableFrom,
    applicationStatus,
    id,
    ...rest
  } = init;

  let name = rest.name;
  const fromLegacy =
    `${firstName ?? APPLICANT.EMPTY_TEXT}${APPLICANT.NAME_PART_SEPARATOR}${lastName ?? APPLICANT.EMPTY_TEXT}`.trim();
  if (fromLegacy && !name?.trim()) {
    name = fromLegacy;
  }

  let parsedYears: number | undefined;
  if (yearsOfExperience !== undefined && yearsOfExperience !== null) {
    const n = Number(yearsOfExperience);
    if (Number.isFinite(n)) {
      parsedYears = n;
    }
  }

  let parsedAvailableFrom: Date | undefined;
  if (availableFrom !== undefined && availableFrom !== null) {
    const d =
      availableFrom instanceof Date ? availableFrom : new Date(availableFrom);
    if (!Number.isNaN(d.getTime())) {
      parsedAvailableFrom = d;
    }
  }

  const parsedStatus = parseApplicationStatus(
    typeof applicationStatus === 'string'
      ? applicationStatus
      : (applicationStatus ?? undefined)
  );

  return {
    ...rest,
    id: id ?? '',
    ...(name === undefined ? {} : { name }),
    ...(parsedYears === undefined ? {} : { yearsOfExperience: parsedYears }),
    ...(parsedAvailableFrom === undefined
      ? {}
      : { availableFrom: parsedAvailableFrom }),
    ...(parsedStatus === undefined ? {} : { applicationStatus: parsedStatus }),
  };
}

export function isValidApplicant(applicant: Applicant): boolean {
  return (
    !!applicant.id &&
    !!applicant.name?.trim() &&
    !!applicant.email?.trim() &&
    !!applicant.phone?.trim() &&
    Array.isArray(applicant.skills) &&
    applicant.skills.length >= APPLICANT.MIN_SKILL_COUNT
  );
}

export function applicantHasSkill(
  applicant: Applicant,
  skill: string
): boolean {
  return applicant.skills?.includes(skill) ?? false;
}
