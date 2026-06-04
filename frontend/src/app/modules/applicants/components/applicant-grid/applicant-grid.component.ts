import {
  AfterViewInit,
  Component,
  DestroyRef,
  effect,
  ElementRef,
  EventEmitter,
  inject,
  Output,
  signal,
  viewChild,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';

import { APP_CONFIG } from '../../../../config/app.config';
import { FullState } from '../../../../models/full-state.model';
import { Applicant } from '../../models/applicant.model';
import {
  selectFilterByCountry,
  selectFilterBySkill,
  selectFilterByStatus,
  selectGlobalFilter,
  selectSortBy,
  selectSortDirection,
  selectSortedApplicants,
} from '../../state/applicants.selectors';
import { confirmDeleteApplicant } from '../../utilities/confirm-delete.util';
import { createPaginatedViewState } from '../../utilities/pagination.util';
import { toggleSkillFilter } from '../../utilities/toggle-skill-filter.util';

@Component({
  selector: 'app-applicant-grid',
  templateUrl: './applicant-grid.component.html',
  styleUrls: ['./applicant-grid.component.scss'],
  standalone: false,
})
export class ApplicantGridComponent implements AfterViewInit {
  private static readonly GRID_CARD_MIN_PX = 264;
  private static readonly GRID_GAP_PX = 16;

  @Output() public readonly editApplicant = new EventEmitter<Applicant>();

  private readonly _dialog = inject(MatDialog);
  private readonly _destroyRef = inject(DestroyRef);
  private readonly _cardsMeasure =
    viewChild<ElementRef<HTMLElement>>('cardsMeasure');

  private readonly _store = inject(Store<FullState>);

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

  /** Matches `repeat(auto-fill, minmax(264px, 1fr))` + 16px gap in SCSS. */
  public readonly columnsPerRow = signal(1);

  private readonly _pagination = createPaginatedViewState(
    this.applicants,
    this.columnsPerRow
  );

  public readonly pageIndex = this._pagination.pageIndex;
  public readonly pageCount = this._pagination.pageCount;
  public readonly pageNumbers = this._pagination.pageNumbers;
  public readonly pagedApplicants = this._pagination.pagedItems;

  public constructor() {
    effect(() => {
      this.globalFilter();
      this.activeSkillFilter();
      this.filterByStatus();
      this.filterByCountry();
      this.sortBy();
      this.sortDirection();
      this.pageIndex.set(0);
    });
  }

  public ngAfterViewInit(): void {
    const host = this._cardsMeasure()?.nativeElement;
    if (!host) {
      return;
    }

    const apply = (): void => {
      this._updateColumnsFromWidth(host.clientWidth);
    };
    apply();

    const ro = new ResizeObserver(() => apply());
    ro.observe(host);
    this._destroyRef.onDestroy(() => ro.disconnect());
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

  public onCardClick(applicant: Applicant): void {
    this.editApplicant.emit(applicant);
  }

  /** Stagger card entrance so long lists don’t animate for multiple seconds. */
  public cardEnterDelayMs(index: number): number {
    const {
      GRID_CARD_ENTER_STAGGER_CAP_INDEX,
      GRID_CARD_ENTER_STAGGER_STEP_MS,
    } = APP_CONFIG.APPLICANTS;
    return (
      Math.min(index, GRID_CARD_ENTER_STAGGER_CAP_INDEX) *
      GRID_CARD_ENTER_STAGGER_STEP_MS
    );
  }

  /**
   * Dispatches an action to filter applicants by the given skill.
   *
   * @param skill - The skill name clicked by the user.
   */
  public filterBySkill(skill: string): void {
    toggleSkillFilter(this._store, skill);
  }

  public confirmRemoveApplicant(applicant: Applicant): void {
    confirmDeleteApplicant(this._dialog, this._store, applicant);
  }

  private _updateColumnsFromWidth(widthPx: number): void {
    const minW = ApplicantGridComponent.GRID_CARD_MIN_PX;
    const gap = ApplicantGridComponent.GRID_GAP_PX;
    const cols = Math.max(
      1,
      Math.floor((Math.max(0, widthPx) + gap) / (minW + gap))
    );
    this.columnsPerRow.set(cols);
  }
}
