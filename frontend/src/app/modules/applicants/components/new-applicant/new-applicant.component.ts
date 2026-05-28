import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Component, Inject, Optional } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatChipInputEvent } from '@angular/material/chips';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { debounceTime, distinctUntilChanged, startWith } from 'rxjs';

import { APP_CONFIG } from '../../../../config/app.config';
import { Languages } from '../../../../enums/language.enum';
import { selectAppLanguage } from '../../../../state/app.selectors';
import { PrivacyConsentService } from '../../../../services/privacy-consent.service';
import { ApplicationStatus } from '../../enums/application-status.enum';
import { Applicant } from '../../models/applicant.model';
import { NewApplicantDialogData } from '../../models/new-applicant-dialog-data.model';
import type { NewApplicantDialogCloseResult } from '../../models/new-applicant-dialog-close-result.model';
import {
  clearLocationSuggestions,
  searchLocationSuggestions,
} from '../../state/applicants.actions';
import { selectLocationSuggestions } from '../../state/applicants.selectors';
import { applicantPhonePatternValidator } from '../../../../utilities/validators/applicant-phone-pattern.validator';
import { applicantYearsOfExperienceValidator } from '../../../../utilities/validators/applicant-years-of-experience.validators';
import { emailFieldValidator } from '../../../../utilities/validators/email-field.validator';

@Component({
  selector: 'app-new-applicant',
  templateUrl: './new-applicant.component.html',
  styleUrls: ['./new-applicant.component.scss'],
  standalone: false,
})
export class NewApplicantComponent {
  public readonly isEditMode: boolean;
  private _currentLanguage: Languages =
    APP_CONFIG.LOCALIZATION.DEFAULT_LANGUAGE;

  private _editingId: string | null = null;

  public readonly separatorKeysCodes =
    APP_CONFIG.APPLICANTS.NEW_APPLICANT_CHIP_SEPARATOR_KEYS;
  public readonly yearsOfExperienceInput = {
    min: APP_CONFIG.APPLICANTS.YEARS_OF_EXPERIENCE_MIN,
    max: APP_CONFIG.APPLICANTS.YEARS_OF_EXPERIENCE_MAX,
    step: APP_CONFIG.APPLICANTS.YEARS_OF_EXPERIENCE_STEP,
  } as const;

  public readonly applicationStatuses = Object.values(ApplicationStatus);

  public readonly fgNewApplicant = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: Validators.required,
    }),
    email: new FormControl('', {
      nonNullable: true,
      validators: [emailFieldValidator],
    }),
    phone: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, applicantPhonePatternValidator],
    }),
    location: new FormControl('', {
      nonNullable: true,
      validators: Validators.required,
    }),
    yearsOfExperience: new FormControl<number | null>(null, {
      validators: [Validators.required, applicantYearsOfExperienceValidator],
    }),
    applicationStatus: new FormControl('', {
      nonNullable: true,
      validators: Validators.required,
    }),
    currentJobTitle: new FormControl('', {
      nonNullable: true,
      validators: Validators.required,
    }),
    availableFrom: new FormControl<Date | null>(null),
    notes: new FormControl('', { nonNullable: true }),
  });

  skills: string[] = [];

  public readonly locationSuggestions$ = this._store.select(
    selectLocationSuggestions
  );

  public constructor(
    private readonly _dialogRef: MatDialogRef<
      NewApplicantComponent,
      NewApplicantDialogCloseResult | undefined
    >,
    private readonly _store: Store,
    private readonly _privacy: PrivacyConsentService,
    @Optional()
    @Inject(MAT_DIALOG_DATA)
    dialogData: NewApplicantDialogData | null
  ) {
    const initial = dialogData?.applicant ?? null;
    this._editingId = initial?.id ?? null;
    this.isEditMode = this._editingId !== null;

    this._store.dispatch(clearLocationSuggestions());
    if (initial) {
      this.skills = initial.skills?.length ? [...initial.skills] : [];
      this.fgNewApplicant.patchValue({
        name: initial.name ?? '',
        email: initial.email ?? '',
        phone: initial.phone ?? '',
        location: initial.location ?? '',
        yearsOfExperience: initial.yearsOfExperience ?? null,
        applicationStatus: initial.applicationStatus ?? '',
        currentJobTitle: initial.currentJobTitle ?? '',
        availableFrom: initial.availableFrom ?? null,
        notes: initial.notes ?? '',
      });
    }
    this.fgNewApplicant.controls.location.valueChanges
      .pipe(
        startWith(this.fgNewApplicant.controls.location.value),
        debounceTime(APP_CONFIG.APPLICANTS.LOCATION_SUGGESTIONS_DEBOUNCE_MS),
        distinctUntilChanged(),
        takeUntilDestroyed()
      )
      .subscribe((raw) =>
        this._store.dispatch(
          searchLocationSuggestions({
            query: raw,
            language: this._currentLanguage,
          })
        )
      );

    this._store
      .select(selectAppLanguage)
      .pipe(takeUntilDestroyed())
      .subscribe((language) => {
        this._currentLanguage = language;
      });
  }

  public submit(): void {
    if (!this.fgNewApplicant.valid) {
      this.fgNewApplicant.markAllAsTouched();
      return;
    }
    const {
      name,
      email,
      phone,
      location,
      yearsOfExperience,
      applicationStatus,
      currentJobTitle,
      availableFrom,
      notes,
    } = this.fgNewApplicant.getRawValue();
    const trimmedNotes = notes.trim();
    const id = this._editingId ?? crypto.randomUUID();
    const applicant = new Applicant({
      id,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      location: location.trim(),
      yearsOfExperience: yearsOfExperience ?? undefined,
      applicationStatus,
      currentJobTitle: currentJobTitle.trim(),
      availableFrom: availableFrom ?? undefined,
      skills: [...this.skills],
      ...(trimmedNotes ? { notes: trimmedNotes } : {}),
    });
    this._store.dispatch(clearLocationSuggestions());
    if (this.isEditMode) {
      this._dialogRef.close({ applicant, isUpdate: true });
    } else {
      this._dialogRef.close(applicant);
    }
  }

  public dismiss(): void {
    this._store.dispatch(clearLocationSuggestions());
    this._dialogRef.close();
  }

  public addSkill(event: MatChipInputEvent): void {
    const value = (event.value ?? '').toString().trim();
    if (value) {
      this.skills.push(value);
    }
    event.chipInput?.clear();
  }

  public removeSkill(skill: string): void {
    const index = this.skills.indexOf(skill);
    if (index >= 0) {
      this.skills.splice(index, 1);
    }
  }

  public trackSkill(_index: number, skill: string): string {
    return skill;
  }

  protected allowsLocationGeocode(): boolean {
    return this._privacy.optionalGeocoding();
  }
}
