import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { of } from 'rxjs';

import { APP_CONFIG } from '../../../config/app.config';
import { Languages } from '../../../enums/language.enum';
import { PrivacyConsentService } from '../../../services/privacy-consent.service';
import {
  buildProfileEntityCache,
  withEntityCache,
} from '../../../testing/entity-cache-test.util';

import { PrivacyConsentDialogService } from './privacy-consent-dialog.service';

describe('PrivacyConsentDialogService', () => {
  let service: PrivacyConsentDialogService;
  let dialog: jasmine.SpyObj<MatDialog>;
  let privacy: jasmine.SpyObj<PrivacyConsentService>;

  const acceptedProfile = {
    id: APP_CONFIG.PROFILE.DEFAULT_ID,
    privacyNoticeAccepted: true,
    lastLanguage: Languages.English,
    optionalRemoteTranslation: false,
    optionalGeocoding: false,
    optionalAiMatching: false,
  };

  beforeEach(() => {
    dialog = jasmine.createSpyObj<MatDialog>('MatDialog', ['open']);
    privacy = jasmine.createSpyObj<PrivacyConsentService>(
      'PrivacyConsentService',
      ['isConsentCompleteAndCurrent', 'formStateFromSnapshot']
    );
    privacy.formStateFromSnapshot.and.returnValue({
      optionalRemoteTranslation: false,
      optionalGeocoding: false,
      optionalAiMatching: false,
    });

    TestBed.configureTestingModule({
      providers: [
        PrivacyConsentDialogService,
        provideMockStore({
          initialState: withEntityCache(
            buildProfileEntityCache(acceptedProfile, { loaded: true })
          ),
        }),
        { provide: MatDialog, useValue: dialog },
        { provide: PrivacyConsentService, useValue: privacy },
      ],
    });

    service = TestBed.inject(PrivacyConsentDialogService);
    TestBed.inject(MockStore);
  });

  it('skips opening when the loaded profile already accepted the notice', () => {
    privacy.isConsentCompleteAndCurrent.and.returnValue(false);

    service.openConsentDialogIfRequired(acceptedProfile);

    expect(dialog.open).not.toHaveBeenCalled();
    expect(privacy.isConsentCompleteAndCurrent).not.toHaveBeenCalled();
  });

  it('opens when consent is incomplete and no accepted profile is provided', () => {
    privacy.isConsentCompleteAndCurrent.and.returnValue(false);
    dialog.open.and.returnValue({
      afterClosed: () => of(undefined),
    } as never);

    service.openConsentDialogIfRequired();

    expect(dialog.open).toHaveBeenCalled();
  });
});
