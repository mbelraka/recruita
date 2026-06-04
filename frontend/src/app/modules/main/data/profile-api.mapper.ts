import type { Profile } from '../models/profile.model';
import type { ProfileApiRecord } from '../models/profile-api-record.model';
import type { SaveProfileRequest } from '../models/save-profile-request.model';
import { createProfile } from '../utilities/profile-domain.util';

export function profileFromApi(record: ProfileApiRecord): Profile {
  return createProfile(record);
}

export function profileFromSaveRequest(request: SaveProfileRequest): Profile {
  return createProfile(request);
}
