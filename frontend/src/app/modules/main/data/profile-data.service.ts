import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { DefaultDataService, HttpUrlGenerator } from '@ngrx/data';
import { map, Observable } from 'rxjs';

import { ProfilesService } from '../../../generated/api-client/services/profiles.service';
import { RecruitaEntityNames } from '../../../core/entity-data/recruita-entity-names';
import type { Profile } from '../models/profile.model';
import type { SaveProfileRequest } from '../models/save-profile-request.model';
import { profileFromApi } from './profile-api.mapper';

@Injectable({ providedIn: 'root' })
export class ProfileDataService extends DefaultDataService<Profile> {
  public constructor(
    http: HttpClient,
    httpUrlGenerator: HttpUrlGenerator,
    private readonly _profilesApi: ProfilesService
  ) {
    super(RecruitaEntityNames.Profile, http, httpUrlGenerator);
  }

  public override getById(id: string | number): Observable<Profile> {
    return this._profilesApi
      .getProfile({ id: String(id) })
      .pipe(map(profileFromApi));
  }

  public createProfile(request: SaveProfileRequest): Observable<Profile> {
    return this._profilesApi
      .createProfile({ body: request })
      .pipe(map(profileFromApi));
  }

  public updateProfile(
    id: string,
    request: SaveProfileRequest
  ): Observable<Profile> {
    return this._profilesApi
      .updateProfile({ id, body: request })
      .pipe(map(profileFromApi));
  }
}
