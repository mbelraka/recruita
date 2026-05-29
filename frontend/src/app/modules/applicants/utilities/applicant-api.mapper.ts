import { Applicant } from '../models/applicant.model';
import { ApplicantApiRecord } from '../models/applicant-api-record.model';
import { ApplicantApiSummaryRecord } from '../models/applicant-api-summary-record.model';
import { ApplicantApiWriteRecord } from '../models/applicant-api-write-record.model';

type ApplicantInit = NonNullable<ConstructorParameters<typeof Applicant>[0]>;

function applicantInitFromApiSummary(
  record: ApplicantApiSummaryRecord
): ApplicantInit {
  return {
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
  };
}

export function applicantFromApiSummary(
  record: ApplicantApiSummaryRecord
): Applicant {
  return new Applicant(applicantInitFromApiSummary(record));
}

export function applicantFromApi(record: ApplicantApiRecord): Applicant {
  return new Applicant({
    ...applicantInitFromApiSummary(record),
    notes: record.notes,
  });
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
