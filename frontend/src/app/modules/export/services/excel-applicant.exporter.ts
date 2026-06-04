import { Injectable } from '@angular/core';

import * as ExcelJS from 'exceljs';

import { APP_CONFIG } from '../../../config/app.config';
import { Languages } from '../../../enums/language.enum';
import { Applicant } from '../../applicants/models/applicant.model';
import { ExportTranslationHelper } from './export-translation.helper';

@Injectable({ providedIn: 'root' })
export class ExcelApplicantExporter {
  private get _config() {
    return APP_CONFIG.EXPORT;
  }

  public constructor(private readonly _translation: ExportTranslationHelper) {}

  public async generate(
    applicants: Applicant[],
    language: Languages
  ): Promise<ArrayBuffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(this._config.EXCEL.WORKSHEET_NAME);
    worksheet.columns = this._getColumns();
    applicants.forEach((applicant, index) =>
      worksheet.addRow(this._toRow(applicant, language, index))
    );
    return workbook.xlsx.writeBuffer();
  }

  private _getColumns(): Array<{
    header: string;
    key: string;
    width: number;
  }> {
    const headerKeyByColumn: Record<string, string> = {
      index: '#',
      ...this._config.CSV.HEADER_LABEL_KEYS,
    };

    return this._config.EXCEL.COLUMNS.map((column) => ({
      header: this._translation.translateText(
        headerKeyByColumn[column.key] ?? '',
        column.header
      ),
      key: column.key,
      width: column.width,
    }));
  }

  private _toRow(
    applicant: Applicant,
    language: Languages,
    index: number
  ): Record<string, string> {
    return {
      index: String(index + 1),
      name: applicant.name ?? this._config.DEFAULT_EMPTY_VALUE,
      currentJobTitle:
        applicant.currentJobTitle ?? this._config.DEFAULT_EMPTY_VALUE,
      location: applicant.location ?? this._config.DEFAULT_EMPTY_VALUE,
      yearsOfExperience: this._translation.formatExperienceYears(
        applicant.yearsOfExperience
      ),
      applicationStatus:
        this._translation.translateApplicationStatus(
          applicant.applicationStatus
        ) ?? this._config.DEFAULT_EMPTY_VALUE,
      email: applicant.email ?? this._config.DEFAULT_EMPTY_VALUE,
      phone: applicant.phone ?? this._config.DEFAULT_EMPTY_VALUE,
      availableFrom: this._translation.formatDateForDisplay(
        applicant.availableFrom,
        language
      ),
      skills: (applicant.skills ?? []).join(
        this._config.EXCEL.SKILLS_DELIMITER
      ),
      notes: applicant.notes ?? this._config.DEFAULT_EMPTY_VALUE,
    };
  }
}
