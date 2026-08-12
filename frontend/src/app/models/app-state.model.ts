import { Languages } from '../enums/language.enum';
import { AppNotification } from './app-notification.model';

export interface AppState {
  language: Languages;
  notification: AppNotification | null;
  remoteTranslations: Record<string, string>;
  remoteTranslationInFlight: Record<string, true>;
}
