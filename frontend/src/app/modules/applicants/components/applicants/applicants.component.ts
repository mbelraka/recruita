import {
  Component,
  DestroyRef,
  ElementRef,
  inject,
  viewChild,
} from '@angular/core';
import { Store } from '@ngrx/store';

import {
  FADE_IN_OUT_BASE_CLASS,
  FADE_IN_OUT_ENTER_CLASS,
  FADE_IN_OUT_LEAVE_CLASS,
} from 'src/app/shared/animations/fade-in-out.animation';
import { APP_CONFIG } from '../../../../config/app.config';
import { FullState } from '../../../../models/full-state.model';
import { isViewType, ViewTypes } from '../../enums/view-types.enum';
import { SortDirection } from '../../enums/sort-direction.enum';
import { Applicant } from '../../models/applicant.model';
import { isApplicationStatus } from '../../utilities/application-status.util';
import {
  openApplicantForm,
  patchApplicantFilters,
  setNewApplicantFabExpanded,
  setSortBy,
  setViewType,
} from '../../state/applicants.actions';
import {
  selectFilterByCountry,
  selectFilterBySkill,
  selectFilterByStatus,
  selectGlobalFilter,
  selectNewApplicantFabExpanded,
  selectSortBy,
  selectSortDirection,
  selectSuppressNewApplicantFabPointerExpandUntil,
  selectUniqueApplicationStatuses,
  selectUniqueCountries,
  selectViewType,
} from '../../state/applicants.selectors';

@Component({
  selector: 'app-applicants',
  templateUrl: './applicants.component.html',
  styleUrls: ['./applicants.component.scss'],
  standalone: false,
})
export class ApplicantsComponent {
  private readonly _destroyRef = inject(DestroyRef);
  private readonly _store = inject(Store<FullState>);

  private readonly _newApplicantFabShellEl = viewChild<ElementRef<HTMLElement>>(
    'newApplicantFabShell'
  );
  private readonly _newApplicantButtonEl =
    viewChild<ElementRef<HTMLButtonElement>>('newApplicantButton');

  private readonly _searchInput =
    viewChild<ElementRef<HTMLInputElement>>('searchInput');

  private _newApplicantFabExpandTimer: ReturnType<typeof setTimeout> | null =
    null;

  private _searchUrlSyncTimer: ReturnType<typeof setTimeout> | null = null;

  public readonly newApplicantFabExpanded = this._store.selectSignal(
    selectNewApplicantFabExpanded
  );
  private readonly _suppressNewApplicantFabPointerExpandUntil =
    this._store.selectSignal(selectSuppressNewApplicantFabPointerExpandUntil);

  public readonly fade = {
    base: FADE_IN_OUT_BASE_CLASS,
    enter: FADE_IN_OUT_ENTER_CLASS,
    leave: FADE_IN_OUT_LEAVE_CLASS,
  } as const;

  public readonly viewTypes = ViewTypes;
  public readonly viewType$ = this._store.select(selectViewType);
  public readonly globalFilter$ = this._store.select(selectGlobalFilter);
  public readonly filterBySkill$ = this._store.select(selectFilterBySkill);
  public readonly filterByStatus$ = this._store.select(selectFilterByStatus);
  public readonly filterByCountry$ = this._store.select(selectFilterByCountry);
  public readonly uniqueStatuses$ = this._store.select(
    selectUniqueApplicationStatuses
  );
  public readonly uniqueCountries$ = this._store.select(selectUniqueCountries);
  public readonly sortBy$ = this._store.select(selectSortBy);
  public readonly sortDirection$ = this._store.select(selectSortDirection);

  public readonly gridSortFieldOptions =
    APP_CONFIG.APPLICANTS.GRID_SORT_FIELD_OPTIONS;

  protected readonly defaultSortDirection = SortDirection.Asc;

  public constructor() {
    this._destroyRef.onDestroy((): void => {
      this._clearNewApplicantFabExpandTimer();
      if (this._searchUrlSyncTimer !== null) {
        clearTimeout(this._searchUrlSyncTimer);
        this._searchUrlSyncTimer = null;
      }
    });
  }

  public onNewApplicantFabShellPointerEnter(): void {
    if (performance.now() < this._suppressNewApplicantFabPointerExpandUntil()) {
      return;
    }
    this._clearNewApplicantFabExpandTimer();
    this._store.dispatch(setNewApplicantFabExpanded({ expanded: true }));
  }

  public onNewApplicantFabShellPointerLeave(): void {
    this._clearNewApplicantFabExpandTimer();
    this._newApplicantFabExpandTimer = setTimeout((): void => {
      this._newApplicantFabExpandTimer = null;
      if (!this._isNewApplicantButtonFocused()) {
        this._store.dispatch(setNewApplicantFabExpanded({ expanded: false }));
      }
    }, APP_CONFIG.APPLICANTS.NEW_APPLICANT_FAB_POINTER_LEAVE_MS);
  }

  public onNewApplicantButtonFocusIn(): void {
    this._clearNewApplicantFabExpandTimer();
    this._store.dispatch(setNewApplicantFabExpanded({ expanded: true }));
  }

  public onNewApplicantButtonFocusOut(event: FocusEvent): void {
    this._clearNewApplicantFabExpandTimer();
    const host = this._newApplicantButtonEl()?.nativeElement;
    const next = event.relatedTarget;
    if (host && next instanceof Node && host.contains(next)) {
      return;
    }
    const shell = this._newApplicantFabShellEl()?.nativeElement;
    if (shell?.matches(':hover')) {
      this._store.dispatch(setNewApplicantFabExpanded({ expanded: true }));
      return;
    }
    this._store.dispatch(setNewApplicantFabExpanded({ expanded: false }));
  }

  private _isNewApplicantButtonFocused(): boolean {
    const el = this._newApplicantButtonEl()?.nativeElement;
    return Boolean(el && document.activeElement === el);
  }

  private _clearNewApplicantFabExpandTimer(): void {
    if (this._newApplicantFabExpandTimer !== null) {
      clearTimeout(this._newApplicantFabExpandTimer);
      this._newApplicantFabExpandTimer = null;
    }
  }

  public applyFilter(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input) {
      return;
    }
    if (this._searchUrlSyncTimer !== null) {
      clearTimeout(this._searchUrlSyncTimer);
    }
    this._searchUrlSyncTimer = setTimeout((): void => {
      this._searchUrlSyncTimer = null;
      this._store.dispatch(
        patchApplicantFilters({ partial: { globalFilter: input.value } })
      );
    }, APP_CONFIG.APPLICANTS.FILTER_SEARCH_URL_DEBOUNCE_MS);
  }

  public clearSearch(): void {
    this._store.dispatch(
      patchApplicantFilters({ partial: { globalFilter: '' } })
    );
    queueMicrotask((): void => {
      this._searchInput()?.nativeElement?.focus();
    });
  }

  public clearSkillFilter(): void {
    this._store.dispatch(patchApplicantFilters({ partial: { skill: null } }));
  }

  public onStatusFilterChange(value: string | null | undefined): void {
    const status =
      value === undefined || value === null || value === ''
        ? null
        : isApplicationStatus(value)
          ? value
          : null;
    this._store.dispatch(patchApplicantFilters({ partial: { status } }));
  }

  public onCountryFilterChange(value: string | null | undefined): void {
    this._store.dispatch(
      patchApplicantFilters({
        partial: { country: value === undefined ? null : value },
      })
    );
  }

  /** Mat-select value for grid sort: list column id, or empty when unsorted. */
  public gridSortMatSelectValue(
    sortBy: keyof Applicant | null | undefined
  ): string {
    if (!sortBy) {
      return '';
    }
    const match = this.gridSortFieldOptions.find((o) => o.sortKey === sortBy);
    return match?.value ?? '';
  }

  public onGridSortFieldChange(
    value: string | null | undefined,
    sortDirection: SortDirection
  ): void {
    if (value === null || value === undefined || value === '') {
      this._store.dispatch(setSortBy({ sortBy: null }));
      return;
    }
    const opt = this.gridSortFieldOptions.find((o) => o.value === value);
    if (!opt) {
      return;
    }
    this._store.dispatch(setSortBy({ sortBy: opt.sortKey, sortDirection }));
  }

  public toggleView(value: unknown): void {
    if (!isViewType(value)) {
      console.error(`Invalid viewType: ${String(value)}`);
      return;
    }
    this._store.dispatch(setViewType({ viewType: value }));
  }

  public openForm(applicant?: Applicant): void {
    this._store.dispatch(openApplicantForm({ applicant }));
  }
}
