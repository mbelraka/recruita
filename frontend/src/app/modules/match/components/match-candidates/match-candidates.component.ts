import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';

import { FullState } from '../../../../models/full-state.model';
import { PrivacyConsentService } from '../../../../services/privacy-consent.service';
import { MATCH_ERROR_PRIVACY_AI_DISABLED } from '../../constants/match-error-codes';
import {
  evaluateCandidates,
  resetMatchState,
  setJobDescription,
} from '../../state/match.actions';
import {
  selectMatchError,
  selectMatchLoading,
  selectMatchResults,
  selectTopMatchResults,
} from '../../state/match.selectors';

@Component({
  selector: 'app-match-candidates',
  templateUrl: './match-candidates.component.html',
  styleUrls: ['./match-candidates.component.scss'],
  standalone: false,
})
export class MatchCandidatesComponent implements OnInit {
  /** Error code stored in NgRx when optional AI matching is off (see {@link MATCH_ERROR_PRIVACY_AI_DISABLED}). */
  protected readonly privacyAiDisabledCode = MATCH_ERROR_PRIVACY_AI_DISABLED;

  public jobDescriptionInput = '';
  public readonly loading$ = this._store.select(selectMatchLoading);
  public readonly error$ = this._store.select(selectMatchError);
  public readonly results$ = this._store.select(selectMatchResults);
  public readonly topResults$ = this._store.select(selectTopMatchResults);
  public readonly allowsAiMatching$ = this._privacy.allowsAiMatching$();

  public constructor(
    private readonly _store: Store<FullState>,
    private readonly _privacy: PrivacyConsentService
  ) {}

  public ngOnInit(): void {
    this.jobDescriptionInput = '';
    this._store.dispatch(resetMatchState());
  }

  public onJobDescriptionInput(value: string): void {
    this.jobDescriptionInput = value;
    this._store.dispatch(setJobDescription({ jobDescription: value }));
  }

  public evaluateCandidates(): void {
    const description = this.jobDescriptionInput.trim();
    if (!description) {
      return;
    }
    this._store.dispatch(setJobDescription({ jobDescription: description }));
    this._store.dispatch(evaluateCandidates());
  }
}
