import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { APP_CONFIG } from '../../../config/app.config';
import { Languages } from '../../../enums/language.enum';
import { ApplicationStatus } from '../../applicants/enums/application-status.enum';
import { WHITESPACE_RUN } from '../../../utilities/RegEx';

@Injectable({ providedIn: 'root' })
export class ExportTranslationHelper {
  private get _config() {
    return APP_CONFIG.EXPORT;
  }

  public constructor(private readonly _translate: TranslateService) {}

  public translateText(key: string, fallback: string): string {
    if (!key) {
      return fallback;
    }
    const translated = this._translate.instant(key);
    return translated && translated !== key ? translated : fallback;
  }

  public translateApplicationStatus(
    status: ApplicationStatus | undefined
  ): string | null {
    if (!status) {
      return null;
    }
    return this.translateText(`applicationStatus.${status}`, status);
  }

  public formatExperienceYears(years: number | undefined | null): string {
    if (years === undefined || years === null) {
      return this._config.DEFAULT_EMPTY_VALUE;
    }
    const unitKey =
      years === 1
        ? 'experienceDisplay.unitYear'
        : 'experienceDisplay.unitYears';
    const unitFallback =
      years === 1
        ? this._config.EXPERIENCE_SINGLE_LABEL
        : this._config.EXPERIENCE_PLURAL_LABEL;
    const unit = this.translateText(unitKey, unitFallback);
    return years === 1 ? `${years} ${unit}` : `${years} ${unit}`;
  }

  public formatDateForDisplay(
    date: Date | string | undefined | null,
    language: Languages
  ): string {
    return date
      ? new Date(date).toLocaleDateString(APP_CONFIG.getLocale(language))
      : this._config.DEFAULT_MISSING_VALUE;
  }

  public formatDateForCsv(
    date: Date | string | undefined | null,
    language: Languages
  ): string {
    return date
      ? new Date(date).toLocaleDateString(APP_CONFIG.getLocale(language))
      : this._config.DEFAULT_EMPTY_VALUE;
  }

  public normalizeText(text: string | undefined | null): string {
    return (text ?? this._config.DEFAULT_EMPTY_VALUE)
      .replace(WHITESPACE_RUN, ' ')
      .trim();
  }

  public formatSkills(
    skills: string[] | undefined,
    delimiter: string,
    emptyValue = this._config.DEFAULT_EMPTY_VALUE
  ): string {
    const text = (skills ?? []).join(delimiter);
    return text || emptyValue;
  }
}
