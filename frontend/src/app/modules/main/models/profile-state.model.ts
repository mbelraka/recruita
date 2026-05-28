import type { Profile } from './profile.model';

export interface ProfileState {
  profile: Profile | null;
  loading: boolean;
  loaded: boolean;
  error: string | null;
}
