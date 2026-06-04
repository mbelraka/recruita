import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { createApplicant } from '../../utilities/applicant-domain.util';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { TranslateModule } from '@ngx-translate/core';
import { EMPTY } from 'rxjs';

import { SharedModule } from 'src/app/shared/shared.module';
import { ApplicantComponent } from './applicant.component';

describe('ApplicantComponent', () => {
  let component: ApplicantComponent;
  let fixture: ComponentFixture<ApplicantComponent>;
  let mockStore: jasmine.SpyObj<Store>;
  let mockDialog: jasmine.SpyObj<MatDialog>;

  beforeEach(async () => {
    mockStore = jasmine.createSpyObj('Store', ['dispatch']);
    mockDialog = jasmine.createSpyObj('MatDialog', ['open']);
    // confirmDeleteApplicant calls .open(...).afterClosed() — stub the dialog ref
    mockDialog.open.and.returnValue({ afterClosed: () => EMPTY } as any);

    await TestBed.configureTestingModule({
      declarations: [ApplicantComponent],
      imports: [TranslateModule.forRoot(), SharedModule],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        { provide: Store, useValue: mockStore },
        { provide: MatDialog, useValue: mockDialog },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ApplicantComponent);
    component = fixture.componentInstance;
    component.applicant = createApplicant({ id: '1', name: 'John Doe' });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call confirmDeleteApplicant utility', () => {
    component.confirmDelete();
    expect(mockDialog.open).toHaveBeenCalled();
  });
});
