import {
  Component,
  computed,
  effect,
  EventEmitter,
  inject,
  Output,
} from '@angular/core';
import { Sort } from '@angular/material/sort';
import { Store } from '@ngrx/store';

import { APP_CONFIG } from '../../../../config/app.config';
import { LayoutBreakpointService } from '../../../../services/layout-breakpoint.service';
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
import {
  applicantSortStoreKeyFromUiColumn,
  applicantSortUiColumnFromStoreKey,
} from '../../utilities/applicant-sort-column.util';
import { createPaginatedViewState } from '../../utilities/pagination.util';
import { patchApplicantFilters } from '../../state/applicants.actions';

@Component({
  selector: 'app-applicant-list',
  templateUrl: './applicant-list.component.html',
  styleUrls: ['./applicant-list.component.scss'],
  standalone: false,
})
export class ApplicantListComponent {
  @Output() public readonly editApplicant = new EventEmitter<Applicant>();

  private readonly _layout = inject(LayoutBreakpointService);

  public readonly pageSize = APP_CONFIG.APPLICANTS.LIST_ROWS_PER_PAGE;

  public readonly applicants = this._store.selectSignal(selectSortedApplicants);
  public readonly globalFilter = this._store.selectSignal(selectGlobalFilter);
  public readonly activeSkillFilter =
    this._store.selectSignal(selectFilterBySkill);
  public readonly filterByStatus =
    this._store.selectSignal(selectFilterByStatus);
  public readonly filterByCountry = this._store.selectSignal(
    selectFilterByCountry
  );
  public readonly sortBy = this._store.selectSignal(selectSortBy);
  public readonly sortDirection = this._store.selectSignal(selectSortDirection);

  public readonly matSortActiveColumn = computed(() =>
    applicantSortUiColumnFromStoreKey(this.sortBy())
  );

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

  /** Columns to display in the list view (reduced on narrower viewports). */
  public readonly displayedColumns = computed(() =>
    APP_CONFIG.getApplicantListDisplayedColumns(this._layout.widthTier())
  );

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
    const key = applicantSortStoreKeyFromUiColumn(sort.active);
    if (!this.displayedColumns().includes(sort.active)) {
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
    const current = this.activeSkillFilter();
    this._store.dispatch(
      patchApplicantFilters({
        partial: { skill: current === skill ? null : skill },
      })
    );
  }

  public onRowClick(event: MouseEvent, applicant: Applicant): void {
    void event;
    this.editApplicant.emit(applicant);
  }
}
