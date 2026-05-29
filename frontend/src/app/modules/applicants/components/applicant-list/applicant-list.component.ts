import {
  Component,
  computed,
  effect,
  EventEmitter,
  Output,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Sort } from '@angular/material/sort';
import { Store } from '@ngrx/store';

import { APP_CONFIG } from '../../../../config/app.config';
import { FullState } from '../../../../models/full-state.model';
import { Applicant } from '../../models/applicant.model';
import {
  SortDirection,
  sortDirectionFromMaterial,
  toMaterialSortDirection,
} from '../../enums/sort-direction.enum';
import { setSortBy } from '../../state/applicants.actions';
import {
  selectFilterByCountry,
  selectFilterBySkill,
  selectFilterByStatus,
  selectGlobalFilter,
  selectSortBy,
  selectSortDirection,
  selectSortedApplicants,
} from '../../state/applicants.selectors';
import { createPaginatedViewState } from '../../utilities/pagination.util';
import { toggleSkillFilter } from '../../utilities/toggle-skill-filter.util';

@Component({
  selector: 'app-applicant-list',
  templateUrl: './applicant-list.component.html',
  styleUrls: ['./applicant-list.component.scss'],
  standalone: false,
})
export class ApplicantListComponent {
  @Output() public readonly editApplicant = new EventEmitter<Applicant>();

  public readonly pageSize = APP_CONFIG.APPLICANTS.LIST_ROWS_PER_PAGE;

  public readonly applicants = toSignal(
    this._store.select(selectSortedApplicants),
    { initialValue: [] as Applicant[] }
  );

  public readonly globalFilter = toSignal(
    this._store.select(selectGlobalFilter),
    { initialValue: '' }
  );

  public readonly activeSkillFilter = toSignal(
    this._store.select(selectFilterBySkill),
    { initialValue: null as string | null }
  );

  public readonly filterByStatus = toSignal(
    this._store.select(selectFilterByStatus),
    { initialValue: null as string | null }
  );

  public readonly filterByCountry = toSignal(
    this._store.select(selectFilterByCountry),
    { initialValue: null as string | null }
  );

  public readonly sortBy = toSignal(this._store.select(selectSortBy), {
    initialValue: null as keyof Applicant | null,
  });

  public readonly sortDirection = toSignal(
    this._store.select(selectSortDirection),
    { initialValue: SortDirection.Asc }
  );

  public readonly matSortActiveColumn = computed(() => {
    const k = this.sortBy();
    if (!k) {
      return '';
    }
    return k === 'availableFrom' ? 'availability' : String(k);
  });

  public readonly matSortDirForUi = computed(() => {
    if (!this.sortBy()) {
      return toMaterialSortDirection(undefined);
    }
    return toMaterialSortDirection(this.sortDirection());
  });

  private readonly _pagination = createPaginatedViewState(
    this.applicants,
    computed(() => this.pageSize)
  );

  public readonly pageIndex = this._pagination.pageIndex;
  public readonly pageCount = this._pagination.pageCount;
  public readonly pageNumbers = this._pagination.pageNumbers;
  public readonly pagedApplicants = this._pagination.pagedItems;

  /** Columns to display in the list view. */
  public readonly displayedColumns: string[] = [
    'name',
    'currentJobTitle',
    'yearsOfExperience',
    'applicationStatus',
    'email',
    'phone',
    'availability',
    'location',
    'skills',
  ];

  public constructor(private readonly _store: Store<FullState>) {
    effect(() => {
      this.globalFilter();
      this.activeSkillFilter();
      this.filterByStatus();
      this.filterByCountry();
      this.pageIndex.set(0);
    });
  }

  public goToPage(index: number): void {
    this._pagination.goToPage(index);
  }

  public goToPreviousPage(): void {
    this.goToPage(this.pageIndex() - 1);
  }

  public goToNextPage(): void {
    this.goToPage(this.pageIndex() + 1);
  }

  /** Stagger row entrance (matches grid card pattern; capped so pages stay snappy). */
  public rowEnterDelayMs(index: number): number {
    const { LIST_ROW_ENTER_STAGGER_CAP_INDEX, LIST_ROW_ENTER_STAGGER_STEP_MS } =
      APP_CONFIG.APPLICANTS;
    return (
      Math.min(index, LIST_ROW_ENTER_STAGGER_CAP_INDEX) *
      LIST_ROW_ENTER_STAGGER_STEP_MS
    );
  }

  public onSortChange(sort: Sort): void {
    this.pageIndex.set(0);
    if (!sort.direction) {
      this._store.dispatch(setSortBy({ sortBy: null }));
      return;
    }
    const key: keyof Applicant =
      sort.active === 'availability'
        ? 'availableFrom'
        : (sort.active as keyof Applicant);
    if (!this.displayedColumns.includes(sort.active)) {
      return;
    }
    this._store.dispatch(
      setSortBy({
        sortBy: key,
        sortDirection:
          sortDirectionFromMaterial(sort.direction) ?? SortDirection.Asc,
      })
    );
  }

  public filterBySkill(skill: string): void {
    toggleSkillFilter(this._store, skill);
  }

  public onRowClick(event: MouseEvent, applicant: Applicant): void {
    void event;
    this.editApplicant.emit(applicant);
  }
}
