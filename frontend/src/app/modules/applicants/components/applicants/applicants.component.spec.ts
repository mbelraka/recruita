import { CUSTOM_ELEMENTS_SCHEMA, ElementRef } from '@angular/core';
import { createApplicant } from '../../utilities/applicant-domain.util';
import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  flush,
  tick,
} from '@angular/core/testing';
import { Store } from '@ngrx/store';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';

import { SharedModule } from 'src/app/shared/shared.module';
import { ApplicantsComponent } from './applicants.component';
import { ViewTypes } from '../../enums/view-types.enum';
import { ApplicationStatus } from '../../enums/application-status.enum';
import { SortDirection } from '../../enums/sort-direction.enum';
import { ApplicantEditDialogService } from '../../services/applicant-edit-dialog.service';
import * as ApplicantsActions from '../../state/applicants.actions';

type ApplicantsComponentPrivate = {
  _suppressNewApplicantFabPointerExpandUntil: number;
  _newApplicantButtonEl(): ElementRef<HTMLButtonElement> | undefined;
  _newApplicantFabShellEl(): ElementRef<HTMLElement> | undefined;
};

describe('ApplicantsComponent', () => {
  let component: ApplicantsComponent;
  let fixture: ComponentFixture<ApplicantsComponent>;
  let mockStore: jasmine.SpyObj<Store>;
  let mockEditDialog: jasmine.SpyObj<ApplicantEditDialogService>;
  let componentPrivate: ApplicantsComponentPrivate;

  beforeEach(async () => {
    mockStore = jasmine.createSpyObj('Store', ['select', 'dispatch']);
    mockStore.select.and.returnValue(of(null));
    mockEditDialog = jasmine.createSpyObj<ApplicantEditDialogService>(
      'ApplicantEditDialogService',
      ['openCreateOrEdit']
    );

    await TestBed.configureTestingModule({
      declarations: [ApplicantsComponent],
      imports: [TranslateModule.forRoot(), SharedModule],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        { provide: Store, useValue: mockStore },
        { provide: ApplicantEditDialogService, useValue: mockEditDialog },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ApplicantsComponent);
    component = fixture.componentInstance;
    componentPrivate = component as unknown as ApplicantsComponentPrivate;
    fixture.detectChanges();
  });

  it('should create and dispatch initial actions', () => {
    expect(component).toBeTruthy();
    expect(mockStore.dispatch).toHaveBeenCalledWith(
      ApplicantsActions.setFilterBySkill({ skill: null })
    );
  });

  describe('FAB button interactions', () => {
    it('should ignore pointer enter while expansion is suppressed', () => {
      spyOn(performance, 'now').and.returnValue(100);
      componentPrivate._suppressNewApplicantFabPointerExpandUntil = 200;

      component.onNewApplicantFabShellPointerEnter();

      expect(component.newApplicantFabExpanded()).toBeFalse();
    });

    it('should expand FAB on pointer enter if not suppressed', () => {
      component.onNewApplicantFabShellPointerEnter();
      expect(component.newApplicantFabExpanded()).toBeTrue();
    });

    it('should expand FAB on focus in', () => {
      component.onNewApplicantButtonFocusIn();
      expect(component.newApplicantFabExpanded()).toBeTrue();
    });

    it('should collapse FAB on focus out if not hovering shell', () => {
      const evt = new FocusEvent('focusout', { relatedTarget: document.body });
      component.onNewApplicantButtonFocusOut(evt);
      expect(component.newApplicantFabExpanded()).toBeFalse();
    });

    it('should keep FAB expanded when focus moves inside the button host', () => {
      const relatedTarget = document.createElement('span');
      const button = document.createElement('button');
      button.appendChild(relatedTarget);

      spyOn(componentPrivate, '_newApplicantButtonEl').and.returnValue(
        new ElementRef(button)
      );

      component.newApplicantFabExpanded.set(true);
      component.onNewApplicantButtonFocusOut(
        new FocusEvent('focusout', { relatedTarget })
      );

      expect(component.newApplicantFabExpanded()).toBeTrue();
    });

    it('should keep FAB expanded when the shell is hovered', () => {
      const shell = document.createElement('div');
      spyOn(shell, 'matches').and.returnValue(true);

      spyOn(componentPrivate, '_newApplicantFabShellEl').and.returnValue(
        new ElementRef(shell)
      );

      component.onNewApplicantButtonFocusOut(
        new FocusEvent('focusout', { relatedTarget: document.body })
      );

      expect(component.newApplicantFabExpanded()).toBeTrue();
    });

    it('should collapse FAB on pointer leave after delay', fakeAsync(() => {
      component.onNewApplicantFabShellPointerEnter();
      expect(component.newApplicantFabExpanded()).toBeTrue();

      component.onNewApplicantFabShellPointerLeave();
      tick(500); // Wait for the timeout delay

      expect(component.newApplicantFabExpanded()).toBeFalse();
    }));

    it('should keep FAB expanded on pointer leave while the button remains focused', fakeAsync(() => {
      const button = document.createElement('button');
      spyOn(componentPrivate, '_newApplicantButtonEl').and.returnValue(
        new ElementRef(button)
      );
      spyOnProperty(document, 'activeElement', 'get').and.returnValue(button);

      component.newApplicantFabExpanded.set(true);
      component.onNewApplicantFabShellPointerLeave();
      tick(500);

      expect(component.newApplicantFabExpanded()).toBeTrue();
      flush();
    }));
  });

  describe('Filters and Sorting', () => {
    it('should dispatch global filter', () => {
      const evt = { target: { value: 'john' } } as unknown as Event;
      component.applyFilter(evt);
      expect(mockStore.dispatch).toHaveBeenCalledWith(
        ApplicantsActions.setGlobalFilter({ filter: 'john' })
      );
    });

    it('should not dispatch if target is missing', () => {
      const evt = { target: null } as unknown as Event;
      mockStore.dispatch.calls.reset();
      component.applyFilter(evt);
      expect(mockStore.dispatch).not.toHaveBeenCalled();
    });

    it('should clear search and set focus', fakeAsync(() => {
      component.clearSearch();
      expect(mockStore.dispatch).toHaveBeenCalledWith(
        ApplicantsActions.setGlobalFilter({ filter: '' })
      );
      tick(); // Let queueMicrotask run
    }));

    it('should clear skill filter', () => {
      component.clearSkillFilter();
      expect(mockStore.dispatch).toHaveBeenCalledWith(
        ApplicantsActions.setFilterBySkill({ skill: null })
      );
    });

    it('should filter by status', () => {
      component.onStatusFilterChange(ApplicationStatus.Received);
      expect(mockStore.dispatch).toHaveBeenCalledWith(
        ApplicantsActions.setFilterByStatus({
          status: ApplicationStatus.Received,
        })
      );
    });

    it('should ignore unknown status values', () => {
      component.onStatusFilterChange('new');
      expect(mockStore.dispatch).toHaveBeenCalledWith(
        ApplicantsActions.setFilterByStatus({ status: null })
      );
    });

    it('should normalize undefined status to null', () => {
      component.onStatusFilterChange(undefined);
      expect(mockStore.dispatch).toHaveBeenCalledWith(
        ApplicantsActions.setFilterByStatus({ status: null })
      );
    });

    it('should filter by country', () => {
      component.onCountryFilterChange('USA');
      expect(mockStore.dispatch).toHaveBeenCalledWith(
        ApplicantsActions.setFilterByCountry({ country: 'USA' })
      );
    });

    it('should normalize undefined country to null', () => {
      component.onCountryFilterChange(undefined);
      expect(mockStore.dispatch).toHaveBeenCalledWith(
        ApplicantsActions.setFilterByCountry({ country: null })
      );
    });

    it('should handle grid sort field mapping', () => {
      expect(component.gridSortMatSelectValue('name')).toBe('name');
      expect(component.gridSortMatSelectValue('availableFrom')).toBe(
        'availability'
      );
      expect(component.gridSortMatSelectValue(null)).toBe('');
      expect(component.gridSortMatSelectValue('id')).toBe('');
    });

    it('should handle grid sort change', () => {
      component.onGridSortFieldChange('name', SortDirection.Asc);
      expect(mockStore.dispatch).toHaveBeenCalledWith(
        ApplicantsActions.setSortBy({
          sortBy: 'name',
          sortDirection: SortDirection.Asc,
        })
      );
    });

    it('should handle grid sort clear', () => {
      component.onGridSortFieldChange(null, SortDirection.Asc);
      expect(mockStore.dispatch).toHaveBeenCalledWith(
        ApplicantsActions.setSortBy({ sortBy: null })
      );
    });

    it('should ignore unknown grid sort options', () => {
      mockStore.dispatch.calls.reset();
      component.onGridSortFieldChange('unknown', SortDirection.Asc);
      expect(mockStore.dispatch).not.toHaveBeenCalled();
    });
  });

  describe('View Toggle', () => {
    it('should toggle view type', () => {
      component.toggleView(ViewTypes.LIST);
      expect(mockStore.dispatch).toHaveBeenCalledWith(
        ApplicantsActions.setViewType({ viewType: ViewTypes.LIST })
      );
    });

    it('should log error for invalid view type', () => {
      const consoleSpy = spyOn(console, 'error');
      component.toggleView('invalid_type');
      expect(consoleSpy).toHaveBeenCalled();
    });
  });

  describe('Dialog interactions', () => {
    it('delegates create flow to ApplicantEditDialogService', () => {
      component.openForm();

      expect(mockEditDialog.openCreateOrEdit).toHaveBeenCalledWith(
        jasmine.any(Object),
        undefined,
        jasmine.any(Function)
      );
    });

    it('delegates edit flow to ApplicantEditDialogService', () => {
      const existingApplicant = createApplicant({ id: '1', name: 'John' });

      component.openForm(existingApplicant);

      expect(mockEditDialog.openCreateOrEdit).toHaveBeenCalledWith(
        jasmine.any(Object),
        existingApplicant,
        jasmine.any(Function)
      );
    });
  });
});
