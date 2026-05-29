import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { TranslateModule } from '@ngx-translate/core';
import { EMPTY, of } from 'rxjs';

import { SharedModule } from 'src/app/shared/shared.module';
import { ApplicantGridComponent } from './applicant-grid.component';
import { Applicant } from '../../models/applicant.model';
import { SortDirection } from '../../enums/sort-direction.enum';
import * as Selectors from '../../state/applicants.selectors';

describe('ApplicantGridComponent', () => {
  let component: ApplicantGridComponent;
  let fixture: ComponentFixture<ApplicantGridComponent>;
  let mockStore: jasmine.SpyObj<Store>;
  let mockDialog: jasmine.SpyObj<MatDialog>;

  const mockApplicant = new Applicant({
    id: '1',
    name: 'John Doe',
    skills: ['Angular'],
  });

  beforeEach(async () => {
    mockStore = jasmine.createSpyObj('Store', ['select', 'dispatch']);
    mockStore.select.and.callFake((selector: any) => {
      if (selector === Selectors.selectSortedApplicants) return of([]);
      if (selector === Selectors.selectGlobalFilter) return of('');
      if (selector === Selectors.selectFilterBySkill) return of(null);
      if (selector === Selectors.selectFilterByStatus) return of(null);
      if (selector === Selectors.selectFilterByCountry) return of(null);
      if (selector === Selectors.selectSortBy) return of(null);
      if (selector === Selectors.selectSortDirection)
        return of(SortDirection.Asc);
      return of(null);
    });
    mockDialog = jasmine.createSpyObj('MatDialog', ['open']);
    mockDialog.open.and.returnValue({ afterClosed: () => EMPTY } as any);

    await TestBed.configureTestingModule({
      declarations: [ApplicantGridComponent],
      imports: [TranslateModule.forRoot(), SharedModule],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        { provide: MatDialog, useValue: mockDialog },
        { provide: Store, useValue: mockStore },
      ],
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

    it('should filter by skill', () => {
      component.filterBySkill('Angular');
      expect(mockStore.dispatch).toHaveBeenCalled();
    });

    it('should confirm remove applicant', () => {
      component.confirmRemoveApplicant(mockApplicant);
      expect(mockDialog.open).toHaveBeenCalled();
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
