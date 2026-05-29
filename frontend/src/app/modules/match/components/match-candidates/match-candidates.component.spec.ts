import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  TranslateFakeLoader,
  TranslateLoader,
  TranslateModule,
} from '@ngx-translate/core';
import { of } from 'rxjs';
import { Store } from '@ngrx/store';

import { SharedModule } from 'src/app/shared/shared.module';
import { PrivacyConsentService } from '../../../../services/privacy-consent.service';
import { MatchCandidatesComponent } from './match-candidates.component';
import {
  evaluateCandidates,
  setJobDescription,
} from '../../state/match.actions';

describe('MatchCandidatesComponent', () => {
  let component: MatchCandidatesComponent;
  let fixture: ComponentFixture<MatchCandidatesComponent>;
  let mockStore: jasmine.SpyObj<Store>;

  beforeEach(async () => {
    mockStore = jasmine.createSpyObj('Store', ['select', 'dispatch']);
    mockStore.select.and.returnValue(of(null));

    await TestBed.configureTestingModule({
      declarations: [MatchCandidatesComponent],
      imports: [
        SharedModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: TranslateFakeLoader },
        }),
      ],
      providers: [
        { provide: Store, useValue: mockStore },
        {
          provide: PrivacyConsentService,
          useValue: {
            optionalAiMatching: () => true,
            optionalAiMatching$: () => of(true),
          } as PrivacyConsentService,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MatchCandidatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('dispatches trimmed description and evaluation when input is valid', () => {
    component.onJobDescriptionInput('  Senior Angular developer  ');
    component.evaluateCandidates();

    expect(mockStore.dispatch).toHaveBeenCalledWith(
      setJobDescription({ jobDescription: '  Senior Angular developer  ' })
    );
    expect(mockStore.dispatch).toHaveBeenCalledWith(
      setJobDescription({ jobDescription: 'Senior Angular developer' })
    );
    expect(mockStore.dispatch).toHaveBeenCalledWith(evaluateCandidates());
  });

  it('does not dispatch evaluation when description is empty after trim', () => {
    const dispatchCallsBefore = mockStore.dispatch.calls.count();

    component.onJobDescriptionInput('   ');
    component.evaluateCandidates();

    const dispatchCallsAfterInput = dispatchCallsBefore + 1;
    expect(mockStore.dispatch.calls.count()).toBe(dispatchCallsAfterInput);
    expect(mockStore.dispatch).toHaveBeenCalledWith(
      setJobDescription({ jobDescription: '   ' })
    );
    expect(mockStore.dispatch).not.toHaveBeenCalledWith(evaluateCandidates());
  });
});
