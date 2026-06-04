import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { DefaultDataService, HttpUrlGenerator } from '@ngrx/data';
import { map, Observable } from 'rxjs';

import { APP_CONFIG } from '../../../config/app.config';
import { RecruitaEntityNames } from '../../../core/entity-data/recruita-entity-names';
import type { Profile } from '../models/profile.model';
import type { ProfileApiRecord } from '../models/profile-api-record.model';
import type { SaveProfileRequest } from '../models/save-profile-request.model';
import { profileFromApi } from './profile-api.mapper';

@Injectable({ providedIn: 'root' })
export class ProfileDataService extends DefaultDataService<Profile> {
  public constructor(http: HttpClient, httpUrlGenerator: HttpUrlGenerator) {
    super(RecruitaEntityNames.Profile, http, httpUrlGenerator);
  }

  public override getById(id: string | number): Observable<Profile> {
    return this.http
      .get<ProfileApiRecord>(
        `${APP_CONFIG.PROFILE.API.BASE_PATH}/${encodeURIComponent(String(id))}`
      )
      .pipe(map(profileFromApi));
  }

  public createProfile(request: SaveProfileRequest): Observable<Profile> {
    return this.http
      .post<ProfileApiRecord>(APP_CONFIG.PROFILE.API.BASE_PATH, request)
      .pipe(map(profileFromApi));
  }

  public updateProfile(
    id: string,
    request: SaveProfileRequest
  ): Observable<Profile> {
    return this.http
      .put<ProfileApiRecord>(
        `${APP_CONFIG.PROFILE.API.BASE_PATH}/${encodeURIComponent(id)}`,
        request
      )
      .pipe(map(profileFromApi));
  }
}
