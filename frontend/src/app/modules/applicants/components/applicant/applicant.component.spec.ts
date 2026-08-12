import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { createApplicant } from '../../utilities/applicant-domain.util';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Store } from '@ngrx/store';
import { TranslateModule } from '@ngx-translate/core';

import { SharedModule } from 'src/app/shared/shared.module';
import { openConfirmDeleteApplicant } from '../../state/applicants.actions';
import { ApplicantComponent } from './applicant.component';

describe('ApplicantComponent', () => {
  let component: ApplicantComponent;
  let fixture: ComponentFixture<ApplicantComponent>;
  let mockStore: jasmine.SpyObj<Store>;

  beforeEach(async () => {
    mockStore = jasmine.createSpyObj('Store', ['dispatch']);

    await TestBed.configureTestingModule({
      declarations: [ApplicantComponent],
      imports: [TranslateModule.forRoot(), SharedModule],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [{ provide: Store, useValue: mockStore }],
    }).compileComponents();

    fixture = TestBed.createComponent(ApplicantComponent);
    component = fixture.componentInstance;
    component.applicant = createApplicant({ id: '1', name: 'John Doe' });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should dispatch openConfirmDeleteApplicant', () => {
    component.confirmDelete();
    expect(mockStore.dispatch).toHaveBeenCalledWith(
      openConfirmDeleteApplicant({ applicant: component.applicant })
    );
  });
});
