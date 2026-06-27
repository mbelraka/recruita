import { ValidatorFn, Validators } from '@angular/forms';

import { APPLICANT_PHONE_PATTERN } from '../reg-ex';

export const applicantPhonePatternValidator: ValidatorFn = Validators.pattern(
  APPLICANT_PHONE_PATTERN
);
