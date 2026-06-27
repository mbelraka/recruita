import { AbstractControl, ValidationErrors } from '@angular/forms';

export const APPLICANT_YEARS_OF_EXPERIENCE_MIN = 0;
export const APPLICANT_YEARS_OF_EXPERIENCE_MAX = 80;

export function applicantYearsOfExperienceValidator(
  control: AbstractControl
): ValidationErrors | null {
  const raw: unknown = control.value;
  if (raw === null || raw === undefined || raw === '') {
    return null;
  }

  const n = typeof raw === 'number' ? raw : Number(raw);
  if (Number.isNaN(n)) {
    return {
      yearsOfExperienceRange: {
        min: APPLICANT_YEARS_OF_EXPERIENCE_MIN,
        max: APPLICANT_YEARS_OF_EXPERIENCE_MAX,
      },
    };
  }

  if (
    n < APPLICANT_YEARS_OF_EXPERIENCE_MIN ||
    n > APPLICANT_YEARS_OF_EXPERIENCE_MAX
  ) {
    return {
      yearsOfExperienceRange: {
        min: APPLICANT_YEARS_OF_EXPERIENCE_MIN,
        max: APPLICANT_YEARS_OF_EXPERIENCE_MAX,
        actual: n,
      },
    };
  }

  return null;
}
