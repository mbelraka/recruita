import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Store } from '@ngrx/store';
import { TranslateModule } from '@ngx-translate/core';
import { Sort } from '@angular/material/sort';
import { of } from 'rxjs';

import { SharedModule } from 'src/app/shared/shared.module';
import { ApplicantListComponent } from './applicant-list.component';
import { Applicant } from '../../models/applicant.model';
import * as ApplicantsActions from '../../state/applicants.actions';
import * as Selectors from '../../state/applicants.selectors';

describe('ApplicantListComponent', () => {
  let component: ApplicantListComponent;
  let fixture: ComponentFixture<ApplicantListComponent>;
  let mockStore: jasmine.SpyObj<Store>;

  const mockApplicant = new Applicant({
    id: '1',
    name: 'John Doe',
    skills: ['Angular'],
  });

  beforeEach(async () => {
    mockStore = jasmine.createSpyObj('Store', ['select', 'dispatch']);

    // Return correct typed observables per selector to avoid Angular Material
    // validation errors (e.g. sort direction must be 'asc' | 'desc' | '').
    mockStore.select.and.callFake((selector: any) => {
      if (selector === Selectors.selectSortedApplicants) return of([]);
      if (selector === Selectors.selectGlobalFilter) return of('');
      if (selector === Selectors.selectFilterBySkill) return of(null);
      if (selector === Selectors.selectFilterByStatus) return of(null);
      if (selector === Selectors.selectFilterByCountry) return of(null);
      if (selector === Selectors.selectSortBy) return of(null);
      if (selector === Selectors.selectSortDirection) return of('asc' as const);
      return of(null);
    });

    await TestBed.configureTestingModule({
      declarations: [ApplicantListComponent],
      imports: [TranslateModule.forRoot(), SharedModule],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [{ provide: Store, useValue: mockStore }],
    }).compileComponents();

    fixture = TestBed.createComponent(ApplicantListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Pagination Logic', () => {
    it('should default to page 0 and calculate basic math', () => {
      expect(component.pageIndex()).toBe(0);
      expect(component.pageCount()).toBeGreaterThanOrEqual(1);
    });

    it('should go to specific page within bounds', () => {
      component.goToPage(-1); // should not work
      expect(component.pageIndex()).toBe(0);

      component.goToPage(0);
      expect(component.pageIndex()).toBe(0);
    });

    it('should go to previous and next page bounds', () => {
      component.goToPreviousPage();
      expect(component.pageIndex()).toBe(0);

      component.goToNextPage();
      expect(component.pageIndex()).toBe(0); // max is 0, it won't go up.
    });
  });

  describe('Row Click and Emit', () => {
    it('should emit editApplicant when row is clicked', () => {
      spyOn(component.editApplicant, 'emit');
      const event = {
        target: document.createElement('div'),
      } as unknown as MouseEvent;

      component.onRowClick(event, mockApplicant);
      expect(component.editApplicant.emit).toHaveBeenCalledWith(mockApplicant);
    });
  });

  describe('Utilities and Events', () => {
    it('should filter by skill', () => {
      component.filterBySkill('Angular');
      expect(mockStore.dispatch).toHaveBeenCalled();
    });

    it('should calculate stagger delay correctly', () => {
      expect(component.rowEnterDelayMs(1)).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Sorting', () => {
    it('should dispatch sort action with mapped keys', () => {
      const sortEvt: Sort = { active: 'name', direction: 'asc' };
      component.onSortChange(sortEvt);
      expect(mockStore.dispatch).toHaveBeenCalledWith(
        ApplicantsActions.setSortBy({ sortBy: 'name', sortDirection: 'asc' })
      );
    });

    it('should dispatch sort action with availability mapping', () => {
      const sortEvt: Sort = { active: 'availability', direction: 'desc' };
      component.onSortChange(sortEvt);
      expect(mockStore.dispatch).toHaveBeenCalledWith(
        ApplicantsActions.setSortBy({
          sortBy: 'availableFrom',
          sortDirection: 'desc',
        })
      );
    });

    it('should dispatch null when direction is cleared', () => {
      const sortEvt: Sort = { active: 'name', direction: '' };
      component.onSortChange(sortEvt);
      expect(mockStore.dispatch).toHaveBeenCalledWith(
        ApplicantsActions.setSortBy({ sortBy: null })
      );
    });

    it('should ignore sort change if active column is not displayed', () => {
      mockStore.dispatch.calls.reset();
      const sortEvt: Sort = { active: 'unknownColumn', direction: 'asc' };
      component.onSortChange(sortEvt);
      expect(mockStore.dispatch).not.toHaveBeenCalled();
    });
  });
});
