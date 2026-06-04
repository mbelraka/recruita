import { Injectable } from '@angular/core';

import {
  EntityCollectionServiceBase,
  EntityCollectionServiceElementsFactory,
} from '@ngrx/data';
import { Observable, tap } from 'rxjs';

import { APP_CONFIG } from '../../../config/app.config';
import { RecruitaEntityNames } from '../../../core/entity-data/recruita-entity-names';
import type { Profile } from '../models/profile.model';
import type { SaveProfileRequest } from '../models/save-profile-request.model';
import { profileFromSaveRequest } from './profile-api.mapper';
import { ProfileDataService } from './profile-data.service';

@Injectable({ providedIn: 'root' })
export class ProfileEntityCollectionService extends EntityCollectionServiceBase<Profile> {
  public constructor(
    serviceFactory: EntityCollectionServiceElementsFactory,
    private readonly _profileData: ProfileDataService
  ) {
    super(RecruitaEntityNames.Profile, serviceFactory);
  }

  /** Creates or updates the shared admin profile row. */
  public save(
    request: SaveProfileRequest,
    existing: Profile | null
  ): Observable<Profile> {
    const id = APP_CONFIG.PROFILE.DEFAULT_ID;
    const save$ =
      existing?.id === id
        ? this._profileData.updateProfile(id, request)
        : this._profileData.createProfile(request);

    return save$.pipe(tap((profile) => this.upsertOneInCache(profile)));
  }

  public upsertOptimisticFromRequest(request: SaveProfileRequest): void {
    this.upsertOneInCache(profileFromSaveRequest(request));
  }
}
