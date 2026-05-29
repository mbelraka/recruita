import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { Store } from '@ngrx/store';
import { saveAs } from 'file-saver';
import * as ExcelJS from 'exceljs';
import { PDFDocument, rgb } from 'pdf-lib';
import { firstValueFrom } from 'rxjs';

import { APP_CONFIG } from '../../../config/app.config';
import { Languages } from '../../../enums/language.enum';
import { FullState } from '../../../models/full-state.model';
import {
  CSV_DOUBLE_QUOTE,
  CSV_FIELD_NEEDS_QUOTING,
  WHITESPACE_RUN,
} from '../../../utilities/RegEx';
import { selectAllApplicants } from '../../applicants/state/applicants.selectors';
import { Applicant } from '../../applicants/models/applicant.model';
import { ExportFormats } from '../enums/export-formats.enum';
import { selectAppLanguage } from '../../../state/app.selectors';
import { ExportContext } from '../models/export-context.model';

@Injectable({ providedIn: 'root' })
export class ExportService {
  public constructor(
    private readonly _store: Store<FullState>,
    private readonly _translate: TranslateService
  ) {}

  /**
   * Exports applicants as a CSV file.
   */
  public async exportAsCSV(): Promise<void> {
    const { applicants, language } = await this._fetchExportContext();
    const csvContent = this._generateCSV(applicants, language);
    this._saveFile([csvContent], ExportFormats.CSV);
  }

  /**
   * Exports applicants as a JSON file.
   */
  public async exportAsJSON(): Promise<void> {
    const { applicants } = await this._fetchExportContext();
    const jsonPayload = applicants.map((applicant, index) =>
      this._toJsonRow(applicant, index)
    );
    this._saveFile(
      [JSON.stringify(jsonPayload, null, this._config.JSON_INDENT_SPACES)],
      ExportFormats.JSON
    );
  }

  /**
   * Exports applicants as an Excel file using ExcelJS.
   */
  public async exportAsExcel(): Promise<void> {
    const { applicants, language } = await this._fetchExportContext();

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(this._config.EXCEL.WORKSHEET_NAME);
    worksheet.columns = this._getExcelColumns();
    applicants.forEach((applicant, index) =>
      worksheet.addRow(this._toExcelRow(applicant, language, index))
    );

    const buffer = await workbook.xlsx.writeBuffer();
    this._saveFile([buffer], ExportFormats.EXCEL);
  }

  /**
   * Exports applicants as a PDF file.
   */
  public async exportAsPDF(): Promise<void> {
    const { applicants, language } = await this._fetchExportContext();
    const pdfDoc = await PDFDocument.create();
    const pageSize: [number, number] = [
      this._config.PDF.PAGE.WIDTH,
      this._config.PDF.PAGE.HEIGHT,
    ];
    let page = pdfDoc.addPage(pageSize);
    const { height } = page.getSize();
    const contentWidth = pageSize[0] - this._config.PDF.BODY_X * 2;
    const lineHeight = this._config.PDF.BODY_FONT_SIZE + 2;
    const itemSpacing = 4;
    const maxLineChars = this._estimateMaxLineChars(
      contentWidth,
      this._config.PDF.BODY_FONT_SIZE
    );

    const drawTitle = (targetPage: typeof page): void => {
      targetPage.drawText(
        this._translateText('export.title', this._config.PDF.TITLE),
        {
          x: this._config.PDF.TITLE_X,
          y: height - this._config.PDF.TITLE_TOP_OFFSET,
          size: this._config.PDF.TITLE_FONT_SIZE,
          color: rgb(
            this._config.PDF.TITLE_COLOR.r,
            this._config.PDF.TITLE_COLOR.g,
            this._config.PDF.TITLE_COLOR.b
          ),
        }
      );
    };

    drawTitle(page);

    let yPosition = height - this._config.PDF.BODY_TOP_OFFSET;

    applicants.forEach((applicant, index) => {
      const text = this._buildPdfRowText(applicant, index, language);
      const wrappedLines = this._wrapText(text, maxLineChars);
      const blockHeight = wrappedLines.length * lineHeight;

      if (yPosition - blockHeight < this._config.PDF.PAGE_BREAK_MIN_Y) {
        page = pdfDoc.addPage(pageSize);
        drawTitle(page);
        yPosition = height - this._config.PDF.BODY_TOP_OFFSET;
      }

      page.drawText(wrappedLines.join('\n'), {
        x: this._config.PDF.BODY_X,
        y: yPosition,
        size: this._config.PDF.BODY_FONT_SIZE,
        lineHeight,
        maxWidth: contentWidth,
        color: rgb(
          this._config.PDF.BODY_COLOR.r,
          this._config.PDF.BODY_COLOR.g,
          this._config.PDF.BODY_COLOR.b
        ),
      });
      yPosition -= blockHeight + itemSpacing;
    });

    const pages = pdfDoc.getPages();
    const totalPages = pages.length;
    const footerFontSize = 10;
    const footerBottomOffset = 20;
    const footerRightPadding = 16;
    pages.forEach((pdfPage, pageIndex) => {
      const pageLabel = `${pageIndex + 1} / ${totalPages}`;
      const { width } = pdfPage.getSize();
      const approxTextWidth = pageLabel.length * footerFontSize * 0.52;
      pdfPage.drawText(pageLabel, {
        x: width - approxTextWidth - footerRightPadding,
        y: footerBottomOffset,
        size: footerFontSize,
        color: rgb(
          this._config.PDF.BODY_COLOR.r,
          this._config.PDF.BODY_COLOR.g,
          this._config.PDF.BODY_COLOR.b
        ),
      });
    });

    const pdfBytes = await pdfDoc.save();
    this._saveFile([pdfBytes as BlobPart], ExportFormats.PDF);
  }

  private get _config() {
    return APP_CONFIG.EXPORT;
  }

  /**
   * Fetches the list of applicants from the store.
   *
   * @returns {Promise<Applicant[]>} A promise resolving to the list of applicants.
   */
  private async _fetchExportContext(): Promise<ExportContext> {
    const [applicants, language] = await Promise.all([
      firstValueFrom(this._store.select(selectAllApplicants)),
      firstValueFrom(this._store.select(selectAppLanguage)),
    ]);
    return { applicants, language };
  }

  /** Human-readable experience for spreadsheet/PDF (English; headers are English). */
  private _formatExperienceYears(years: number | undefined | null): string {
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
    const unit = this._translateText(unitKey, unitFallback);
    return years === 1 ? `${years} ${unit}` : `${years} ${unit}`;
  }

  private _formatDateForDisplay(
    date: Date | string | undefined | null,
    language: Languages
  ): string {
    return date
      ? new Date(date).toLocaleDateString(APP_CONFIG.getLocale(language))
      : this._config.DEFAULT_MISSING_VALUE;
  }

  private _formatDateForCSV(
    date: Date | string | undefined | null,
    language: Languages
  ): string {
    return date
      ? new Date(date).toLocaleDateString(APP_CONFIG.getLocale(language))
      : this._config.DEFAULT_EMPTY_VALUE;
  }

  private _normalizeText(text: string | undefined | null): string {
    return (text ?? this._config.DEFAULT_EMPTY_VALUE)
      .replace(WHITESPACE_RUN, ' ')
      .trim();
  }

  private _saveFile(parts: BlobPart[], format: ExportFormats): void {
    const blob = new Blob(parts, {
      type: this._config.MIME_TYPES[format],
    });
    saveAs(blob, this._localizedFileName(format));
  }

  private _localizedFileName(format: ExportFormats): string {
    const stem = this._sanitizeFileNameStem(
      this._translateText('export.fileName', this._config.FILE_NAME_FALLBACK)
    );
    return `${stem}.${this._config.FILE_EXTENSIONS[format]}`;
  }

  private _sanitizeFileNameStem(value: string): string {
    const sanitized = value
      .trim()
      .replace(/[\\/:*?"<>|]+/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    return sanitized || this._config.FILE_NAME_FALLBACK;
  }

  private _formatSkills(
    skills: string[] | undefined,
    delimiter: string,
    emptyValue = this._config.DEFAULT_EMPTY_VALUE
  ): string {
    const text = (skills ?? []).join(delimiter);
    return text || emptyValue;
  }

  private _toExcelRow(
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
      yearsOfExperience: this._formatExperienceYears(
        applicant.yearsOfExperience
      ),
      applicationStatus:
        this._translateApplicationStatus(applicant.applicationStatus) ??
        this._config.DEFAULT_EMPTY_VALUE,
      email: applicant.email ?? this._config.DEFAULT_EMPTY_VALUE,
      phone: applicant.phone ?? this._config.DEFAULT_EMPTY_VALUE,
      availableFrom: this._formatDateForDisplay(
        applicant.availableFrom,
        language
      ),
      skills: (applicant.skills ?? []).join(
        this._config.EXCEL.SKILLS_DELIMITER
      ),
      notes: applicant.notes ?? this._config.DEFAULT_EMPTY_VALUE,
    };
  }

  private _toJsonRow(
    applicant: Applicant,
    index: number
  ): Omit<Partial<Applicant>, 'id'> & { exportIndex: number } {
    return {
      exportIndex: index + 1,
      name: applicant.name,
      email: applicant.email,
      phone: applicant.phone,
      location: applicant.location,
      yearsOfExperience: applicant.yearsOfExperience,
      applicationStatus: applicant.applicationStatus,
      currentJobTitle: applicant.currentJobTitle,
      availableFrom: applicant.availableFrom,
      skills: applicant.skills,
      notes: applicant.notes,
    };
  }

  /**
   * Generates a CSV string from the list of applicants.
   *
   * @param {Applicant[]} data - The list of applicants.
   * @returns {string} CSV-formatted string.
   */
  private _generateCSV(data: Applicant[], language: Languages): string {
    if (data.length === 0) {
      return this._config.DEFAULT_EMPTY_VALUE;
    }
    const headers = [
      '#',
      this._translateText('applicantList.name', 'Name'),
      this._translateText('applicantList.email', 'Email'),
      this._translateText('applicantList.phone', 'Phone'),
      this._translateText('applicantList.location', 'Location'),
      this._translateText('applicantList.yearsOfExperience', 'Experience'),
      this._translateText('applicantList.applicationStatus', 'Status'),
      this._translateText('applicantList.currentJobTitle', 'Job title'),
      this._translateText('applicants.availableFrom', 'Available from'),
      this._translateText('applicantList.skills', 'Skills'),
      this._translateText('match.fields.notes', 'Notes'),
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
        this._formatExperienceYears(a.yearsOfExperience),
        this._translateApplicationStatus(a.applicationStatus) ??
          this._config.DEFAULT_EMPTY_VALUE,
        a.currentJobTitle ?? this._config.DEFAULT_EMPTY_VALUE,
        this._formatDateForCSV(a.availableFrom, language),
        this._formatSkills(a.skills, this._config.CSV.SKILLS_DELIMITER),
        this._normalizeText(a.notes),
      ]
        .map((cell) => escapeCell(String(cell)))
        .join(this._config.CSV.DELIMITER);
    return [headers.join(this._config.CSV.DELIMITER), ...data.map(row)].join(
      this._config.CSV.EOL
    );
  }

  private _getExcelColumns(): Array<{
    header: string;
    key: string;
    width: number;
  }> {
    const headerKeyByColumn: Record<string, string> = {
      index: '#',
      name: 'applicantList.name',
      currentJobTitle: 'applicantList.currentJobTitle',
      location: 'applicantList.location',
      yearsOfExperience: 'applicantList.yearsOfExperience',
      applicationStatus: 'applicantList.applicationStatus',
      email: 'applicantList.email',
      phone: 'applicantList.phone',
      availableFrom: 'applicants.availableFrom',
      skills: 'applicantList.skills',
      notes: 'match.fields.notes',
    };

    return this._config.EXCEL.COLUMNS.map((column) => ({
      header: this._translateText(
        headerKeyByColumn[column.key] ?? '',
        column.header
      ),
      key: column.key,
      width: column.width,
    }));
  }

  private _buildPdfRowText(
    applicant: Applicant,
    index: number,
    language: Languages
  ): string {
    const availableFromLabel = this._translateText(
      'applicants.availableFrom',
      this._config.PDF.AVAILABLE_FROM_LABEL
    );
    const skillsLabel = this._translateText(
      'applicantList.skills',
      this._config.PDF.SKILLS_LABEL
    );
    const notesPart = applicant.notes?.trim()
      ? `${this._config.PDF.NOTES_PREFIX}${this._normalizeText(applicant.notes)}`
      : this._config.DEFAULT_EMPTY_VALUE;
    const yearsPart =
      applicant.yearsOfExperience !== undefined &&
      applicant.yearsOfExperience !== null
        ? this._formatExperienceYears(applicant.yearsOfExperience)
        : this._config.DEFAULT_MISSING_VALUE;

    return `${this._config.PDF.LIST_ITEM_PREFIX}${index + 1} ${
      applicant.name ?? this._config.DEFAULT_EMPTY_VALUE
    }${this._config.PDF.FIELD_SEPARATOR}${
      applicant.currentJobTitle ?? this._config.DEFAULT_EMPTY_VALUE
    }${this._config.PDF.FIELD_SEPARATOR}${
      applicant.location ?? this._config.DEFAULT_EMPTY_VALUE
    }${this._config.PDF.FIELD_SEPARATOR}${yearsPart}${
      this._config.PDF.FIELD_SEPARATOR
    }${
      this._translateApplicationStatus(applicant.applicationStatus) ??
      this._config.DEFAULT_MISSING_VALUE
    }${
      this._config.PDF.FIELD_SEPARATOR
    }${applicant.email ?? this._config.DEFAULT_EMPTY_VALUE}${
      this._config.PDF.FIELD_SEPARATOR
    }${applicant.phone ?? this._config.DEFAULT_EMPTY_VALUE}${
      this._config.PDF.FIELD_SEPARATOR
    }${availableFromLabel}${this._config.PDF.LABEL_SEPARATOR}${this._formatDateForDisplay(
      applicant.availableFrom,
      language
    )}${this._config.PDF.FIELD_SEPARATOR}${skillsLabel}${
      this._config.PDF.LABEL_SEPARATOR
    }${this._formatSkills(
      applicant.skills,
      this._config.PDF.SKILLS_DELIMITER
    )}${notesPart}`;
  }

  private _translateText(key: string, fallback: string): string {
    if (!key) {
      return fallback;
    }
    const translated = this._translate.instant(key);
    return translated && translated !== key ? translated : fallback;
  }

  private _translateApplicationStatus(
    status: string | undefined
  ): string | null {
    const normalized = (status ?? '').trim();
    if (!normalized) {
      return null;
    }
    const statusKey = normalized.toLowerCase().replace(/\s+/g, '_');
    return this._translateText(`applicationStatus.${statusKey}`, normalized);
  }

  private _estimateMaxLineChars(
    contentWidth: number,
    fontSize: number
  ): number {
    const avgCharWidth = fontSize * 0.52;
    return Math.max(24, Math.floor(contentWidth / avgCharWidth));
  }

  private _wrapText(text: string, maxLineChars: number): string[] {
    const words = text.split(/\s+/).filter(Boolean);
    if (!words.length) {
      return [''];
    }

    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
      const nextLine = currentLine ? `${currentLine} ${word}` : word;
      if (nextLine.length <= maxLineChars) {
        currentLine = nextLine;
        continue;
      }
      if (currentLine) {
        lines.push(currentLine);
      }
      currentLine = word;
    }

    if (currentLine) {
      lines.push(currentLine);
    }

    return lines;
  }
}
