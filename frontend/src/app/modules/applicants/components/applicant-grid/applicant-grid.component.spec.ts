import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { createApplicant } from '../../utilities/applicant-domain.util';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Store } from '@ngrx/store';
import { TranslateModule } from '@ngx-translate/core';

import { SharedModule } from 'src/app/shared/shared.module';
import { mockApplicantViewSelectSignals } from 'src/app/testing/mock-applicant-view-select-signals.util';
import { ApplicantGridComponent } from './applicant-grid.component';
import * as ApplicantsActions from '../../state/applicants.actions';

describe('ApplicantGridComponent', () => {
  let component: ApplicantGridComponent;
  let fixture: ComponentFixture<ApplicantGridComponent>;
  let mockStore: jasmine.SpyObj<Store>;
  const mockApplicant = createApplicant({
    id: '1',
    name: 'John Doe',
    skills: ['Angular'],
  });

  beforeEach(async () => {
    mockStore = jasmine.createSpyObj('Store', [
      'selectSignal',
      'select',
      'dispatch',
    ]);
    mockApplicantViewSelectSignals(mockStore);
    await TestBed.configureTestingModule({
      declarations: [ApplicantGridComponent],
      imports: [TranslateModule.forRoot(), SharedModule],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [{ provide: Store, useValue: mockStore }],
    }).compileComponents();

    fixture = TestBed.createComponent(ApplicantGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Pagination Logic', () => {
    it('should calculate page count correctly', () => {
      expect(component.pageCount()).toBe(1);
    });

    it('should go to specific page', () => {
      component.goToPage(-1); // should not work
      expect(component.pageIndex()).toBe(0);

      component.goToPage(0);
      expect(component.pageIndex()).toBe(0);
    });
  });

  describe('Card Click and Emit', () => {
    it('should emit editApplicant when card is clicked', () => {
      spyOn(component.editApplicant, 'emit');
      component.onCardClick(mockApplicant);
      expect(component.editApplicant.emit).toHaveBeenCalledWith(mockApplicant);
    });
  });

  describe('Utilities and Helper functions', () => {
    it('should calculate stagger delay', () => {
      const delay = component.cardEnterDelayMs(1);
      expect(delay).toBeGreaterThanOrEqual(0);
    });

    it('should toggle skill filter via NgRx', () => {
      component.filterBySkill('Angular');
      expect(mockStore.dispatch).toHaveBeenCalledWith(
        ApplicantsActions.patchApplicantFilters({
          partial: { skill: 'Angular' },
        })
      );
    });

    it('should dispatch openConfirmDeleteApplicant', () => {
      component.confirmRemoveApplicant(mockApplicant);
      expect(mockStore.dispatch).toHaveBeenCalledWith(
        ApplicantsActions.openConfirmDeleteApplicant({
          applicant: mockApplicant,
        })
      );
    });
  });

  describe('ResizeObserver and Columns logic', () => {
    it('should update columns from width', () => {
      (component as any)._updateColumnsFromWidth(1000);
      expect(component.columnsPerRow()).toBeGreaterThan(1);

      (component as any)._updateColumnsFromWidth(100);
      expect(component.columnsPerRow()).toBe(1);
    });
  });
});
