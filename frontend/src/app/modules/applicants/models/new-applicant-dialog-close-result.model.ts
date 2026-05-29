import { NEW_APPLICANT_DIALOG_UPDATE_FLAG } from '../constants/new-applicant-dialog.constants';
import { Applicant } from './applicant.model';

export type NewApplicantDialogCloseResult =
  | Applicant
  | {
      applicant: Applicant;
      [NEW_APPLICANT_DIALOG_UPDATE_FLAG.KEY]: typeof NEW_APPLICANT_DIALOG_UPDATE_FLAG.VALUE;
    };
