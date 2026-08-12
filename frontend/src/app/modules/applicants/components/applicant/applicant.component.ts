import { Component, Input } from '@angular/core';
import { Store } from '@ngrx/store';

import { FullState } from 'src/app/models/full-state.model';
import { Applicant } from 'src/app/modules/applicants/models/applicant.model';
import { MATERIAL_SYMBOLS_OUTLINED_FONT_SET } from 'src/app/utilities/initializers/material-symbols-outlined-font.initializer';
import { openConfirmDeleteApplicant } from '../../state/applicants.actions';

@Component({
  selector: 'app-applicant',
  templateUrl: './applicant.component.html',
  styleUrls: ['./applicant.component.scss'],
  standalone: false,
})
export class ApplicantComponent {
  @Input({ required: true }) public applicant!: Applicant;

  public readonly outlinedIconFontSet = MATERIAL_SYMBOLS_OUTLINED_FONT_SET;

  public constructor(private readonly _store: Store<FullState>) {}

  public confirmDelete(): void {
    this._store.dispatch(
      openConfirmDeleteApplicant({ applicant: this.applicant })
    );
  }
}
