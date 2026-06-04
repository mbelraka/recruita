import { Injectable } from '@angular/core';

import { APP_CONFIG } from '../../../config/app.config';
import { Applicant } from '../../applicants/models/applicant.model';

@Injectable({ providedIn: 'root' })
export class JsonApplicantExporter {
  public generate(applicants: Applicant[]): string {
    const jsonPayload = applicants.map((applicant, index) =>
      this._toJsonRow(applicant, index)
    );
    return JSON.stringify(
      jsonPayload,
      null,
      APP_CONFIG.EXPORT.JSON_INDENT_SPACES
    );
  }

  private _toJsonRow(
    applicant: Applicant,
    index: number
  ): Omit<Partial<Applicant>, 'id'> & { exportIndex: number } {
    return {
      exportIndex: index + 1,
      name: applicant.name,
      email: applicant.email,
      phone: applicant.phone,
      location: applicant.location,
      yearsOfExperience: applicant.yearsOfExperience,
      applicationStatus: applicant.applicationStatus,
      currentJobTitle: applicant.currentJobTitle,
      availableFrom: applicant.availableFrom,
      skills: applicant.skills,
      notes: applicant.notes,
    };
  }
}
