import { Injectable } from '@angular/core';

import { APP_CONFIG } from '../../../config/app.config';
import { Languages } from '../../../enums/language.enum';
import { Applicant } from '../../applicants/models/applicant.model';
import {
  CSV_DOUBLE_QUOTE,
  CSV_FIELD_NEEDS_QUOTING,
} from '../../../utilities/reg-ex';
import { ExportTranslationHelper } from './export-translation.helper';

@Injectable({ providedIn: 'root' })
export class CsvApplicantExporter {
  private get _config() {
    return APP_CONFIG.EXPORT;
  }

  public constructor(private readonly _translation: ExportTranslationHelper) {}

  public generate(data: Applicant[], language: Languages): string {
    if (data.length === 0) {
      return this._config.DEFAULT_EMPTY_VALUE;
    }

    const headers = [
      '#',
      ...this._config.CSV.HEADERS.map((key) =>
        this._translation.translateText(
          this._config.CSV.HEADER_LABEL_KEYS[key],
          key
        )
      ),
    ];

    const escapeCell = (value: string): string => {
      if (CSV_FIELD_NEEDS_QUOTING.test(value)) {
        return `"${value.replace(CSV_DOUBLE_QUOTE, '""')}"`;
      }
      return value;
    };

    const row = (a: Applicant, index: number): string =>
      [
        index + 1,
        a.name ?? this._config.DEFAULT_EMPTY_VALUE,
        a.email ?? this._config.DEFAULT_EMPTY_VALUE,
        a.phone ?? this._config.DEFAULT_EMPTY_VALUE,
        a.location ?? this._config.DEFAULT_EMPTY_VALUE,
        this._translation.formatExperienceYears(a.yearsOfExperience),
        this._translation.translateApplicationStatus(a.applicationStatus) ??
          this._config.DEFAULT_EMPTY_VALUE,
        a.currentJobTitle ?? this._config.DEFAULT_EMPTY_VALUE,
        this._translation.formatDateForCsv(a.availableFrom, language),
        this._translation.formatSkills(
          a.skills,
          this._config.CSV.SKILLS_DELIMITER
        ),
        this._translation.normalizeText(a.notes),
      ]
        .map((cell) => escapeCell(String(cell)))
        .join(this._config.CSV.DELIMITER);

    return [headers.join(this._config.CSV.DELIMITER), ...data.map(row)].join(
      this._config.CSV.EOL
    );
  }
}
