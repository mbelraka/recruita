import { Applicant } from '../models/applicant.model';
import {
  ApplicantApiRecord,
  ApplicantApiWriteRecord,
} from '../models/applicant-api.model';

export function applicantFromApi(record: ApplicantApiRecord): Applicant {
  return new Applicant({
    id: record.id,
    name: record.name,
    email: record.email,
    phone: record.phone,
    location: record.location,
    yearsOfExperience: record.yearsOfExperience,
    applicationStatus: record.applicationStatus,
    currentJobTitle: record.currentJobTitle,
    availableFrom: record.availableFrom
      ? new Date(record.availableFrom)
      : undefined,
    skills: record.skills ? [...record.skills] : [],
    notes: record.notes,
  });
}

export function applicantsFromApi(
  records: readonly ApplicantApiRecord[]
): Applicant[] {
  return records.map(applicantFromApi);
}

export function applicantToApiWrite(
  applicant: Applicant
): ApplicantApiWriteRecord {
  return {
    id: applicant.id,
    name: applicant.name,
    email: applicant.email,
    phone: applicant.phone,
    location: applicant.location,
    yearsOfExperience: applicant.yearsOfExperience,
    applicationStatus: applicant.applicationStatus,
    currentJobTitle: applicant.currentJobTitle,
    availableFrom: formatAvailableFrom(applicant.availableFrom),
    skills: applicant.skills ? [...applicant.skills] : [],
    notes: applicant.notes,
  };
}

function formatAvailableFrom(value: Date | undefined): string | undefined {
  if (!value || Number.isNaN(value.getTime())) {
    return undefined;
  }
  return value.toISOString().slice(0, 10);
}
