import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import {
  TranslateFakeLoader,
  TranslateLoader,
  TranslateModule,
} from '@ngx-translate/core';

import { SharedModule } from 'src/app/shared/shared.module';
import { PrivacyConsentService } from '../../../../services/privacy-consent.service';
import { ApplicationStatus } from '../../enums/application-status.enum';
import { NewApplicantComponent } from './new-applicant.component';

describe('NewApplicantComponent', () => {
  let component: NewApplicantComponent;
  let fixture: ComponentFixture<NewApplicantComponent>;
  let mockStore: jasmine.SpyObj<any>;
  let mockDialogRef: jasmine.SpyObj<MatDialogRef<any>>;

  beforeEach(async () => {
    mockStore = jasmine.createSpyObj('Store', ['select', 'dispatch']);
    mockStore.select.and.returnValue(of([]));
    mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      animationsEnabled: false,
      declarations: [NewApplicantComponent],
      imports: [
        SharedModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: TranslateFakeLoader },
        }),
      ],
      providers: [
        { provide: Store, useValue: mockStore },
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: null },
        {
          provide: PrivacyConsentService,
          useValue: { optionalGeocoding: () => true } as PrivacyConsentService,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NewApplicantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create in add mode', () => {
    expect(component).toBeTruthy();
    expect(component.isEditMode).toBeFalse();
    expect(mockStore.dispatch).toHaveBeenCalled(); // clearLocationSuggestions
  });

  it('should add skill', () => {
    const mockEvent = {
      value: 'Angular',
      chipInput: { clear: jasmine.createSpy('clear') },
    } as any;
    component.addSkill(mockEvent);
    expect(component.skills.includes('Angular')).toBeTrue();
    expect(mockEvent.chipInput.clear).toHaveBeenCalled();
  });

  it('should ignore empty skill', () => {
    component.skills = [];
    const mockEvent = {
      value: '   ',
      chipInput: { clear: jasmine.createSpy('clear') },
    } as any;
    component.addSkill(mockEvent);
    expect(component.skills.length).toBe(0);
  });

  it('should remove skill', () => {
    component.skills = ['Angular', 'React'];
    component.removeSkill('Angular');
    expect(component.skills.length).toBe(1);
    expect(component.skills[0]).toBe('React');
  });

  it('should not remove skill if not exists', () => {
    component.skills = ['Angular'];
    component.removeSkill('Vue');
    expect(component.skills.length).toBe(1);
  });

  it('should track skill by name', () => {
    expect(component.trackSkill(0, 'Angular')).toBe('Angular');
  });

  it('should dismiss dialog', () => {
    component.dismiss();
    expect(mockStore.dispatch).toHaveBeenCalled(); // clearLocationSuggestions
    expect(mockDialogRef.close).toHaveBeenCalled();
  });

  it('should mark fields as touched if form is invalid on submit', () => {
    spyOn(component.fgNewApplicant, 'markAllAsTouched');
    component.submit();
    expect(component.fgNewApplicant.markAllAsTouched).toHaveBeenCalled();
    expect(mockDialogRef.close).not.toHaveBeenCalled();
  });

  it('should submit new applicant when form is valid', () => {
    component.fgNewApplicant.patchValue({
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+1234567890',
      location: 'NY',
      yearsOfExperience: 3,
      applicationStatus: ApplicationStatus.Received,
      currentJobTitle: 'Dev',
      availableFrom: new Date(),
      notes: 'Test',
    });
    component.skills = ['Angular'];

    component.submit();

    expect(mockStore.dispatch).toHaveBeenCalled();
    expect(mockDialogRef.close).toHaveBeenCalled();
    const args = mockDialogRef.close.calls.mostRecent().args[0];
    expect(args.name).toBe('John Doe');
    expect(args.skills).toEqual(['Angular']);
    expect(args.isUpdate).toBeUndefined();
  });

  describe('Edit Mode', () => {
    beforeEach(() => {
      TestBed.resetTestingModule(); // Reset for new providers
    });

    it('should initialize with edit mode data and submit update', async () => {
      const mockApplicant = {
        id: '123',
        name: 'Jane',
        email: 'jane@example.com',
        phone: '12345',
        location: 'UK',
        yearsOfExperience: 5,
        applicationStatus: ApplicationStatus.Screening,
        currentJobTitle: 'Designer',
        availableFrom: new Date(),
        skills: ['Figma'],
        notes: 'Good',
      };

      await TestBed.configureTestingModule({
        animationsEnabled: false,
        declarations: [NewApplicantComponent],
        imports: [
          SharedModule,
          TranslateModule.forRoot({
            loader: { provide: TranslateLoader, useClass: TranslateFakeLoader },
          }),
        ],
        providers: [
          { provide: Store, useValue: mockStore },
          { provide: MatDialogRef, useValue: mockDialogRef },
          { provide: MAT_DIALOG_DATA, useValue: { applicant: mockApplicant } },
          {
            provide: PrivacyConsentService,
            useValue: {
              optionalGeocoding: () => true,
            } as PrivacyConsentService,
          },
        ],
      }).compileComponents();

      fixture = TestBed.createComponent(NewApplicantComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(component.isEditMode).toBeTrue();
      expect(component.fgNewApplicant.value.name).toBe('Jane');
      expect(component.skills.length).toBe(1);

      // Make valid by satisfying phone pattern if needed (let's assume '12345' is invalid and breaks validation? Let's fix patch)
      component.fgNewApplicant.patchValue({ phone: '+1234567890' });

      component.submit();

      expect(mockDialogRef.close).toHaveBeenCalled();
      const args = mockDialogRef.close.calls.mostRecent().args[0];
      expect(args.isUpdate).toBeTrue();
      expect(args.applicant.name).toBe('Jane');
      expect(args.applicant.id).toBe('123');
    });
  });
});
