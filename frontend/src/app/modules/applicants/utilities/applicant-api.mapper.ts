import { Applicant } from '../models/applicant.model';
import { ApplicantApiRecord } from '../models/applicant-api-record.model';
import { ApplicantApiSummaryRecord } from '../models/applicant-api-summary-record.model';
import { ApplicantApiWriteRecord } from '../models/applicant-api-write-record.model';
import { ApplicationStatus } from '../enums/application-status.enum';
import { createApplicant } from './applicant-domain.util';

function applicantFromApiRecord(
  record: ApplicantApiSummaryRecord | ApplicantApiRecord
): Applicant {
  return createApplicant({
    ...record,
    skills: [...(record.skills ?? [])],
  });
}

export function applicantFromApiSummary(
  record: ApplicantApiSummaryRecord
): Applicant {
  return applicantFromApiRecord(record);
}

export function applicantFromApi(record: ApplicantApiRecord): Applicant {
  return applicantFromApiRecord(record);
}

export function applicantsFromApiSummary(
  records: readonly ApplicantApiSummaryRecord[]
): Applicant[] {
  return records.map(applicantFromApiSummary);
}

export function applicantsFromApi(
  records: readonly ApplicantApiRecord[]
): Applicant[] {
  return records.map(applicantFromApi);
}

export function applicantToApiWrite(
  applicant: Pick<Applicant, 'id'> & Partial<Omit<Applicant, 'id'>>
): ApplicantApiWriteRecord {
  return {
    id: applicant.id,
    name: applicant.name ?? '',
    email: applicant.email ?? '',
    phone: applicant.phone ?? '',
    location: applicant.location ?? '',
    yearsOfExperience: applicant.yearsOfExperience ?? 0,
    applicationStatus:
      applicant.applicationStatus ?? ApplicationStatus.Received,
    currentJobTitle: applicant.currentJobTitle ?? '',
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
