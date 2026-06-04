import { Injectable } from '@angular/core';

import { Store } from '@ngrx/store';
import { firstValueFrom } from 'rxjs';

import { FullState } from '../../../models/full-state.model';
import { selectAllApplicants } from '../../applicants/state/applicants.selectors';
import { ExportFormats } from '../enums/export-formats.enum';
import { ExportContext } from '../models/export-context.model';
import { selectAppLanguage } from '../../../state/app.selectors';
import { CsvApplicantExporter } from './csv-applicant.exporter';
import { ExcelApplicantExporter } from './excel-applicant.exporter';
import { saveExportBlob } from './export-file.util';
import { ExportTranslationHelper } from './export-translation.helper';
import { JsonApplicantExporter } from './json-applicant.exporter';
import { PdfApplicantExporter } from './pdf-applicant.exporter';

@Injectable({ providedIn: 'root' })
export class ExportService {
  public constructor(
    private readonly _store: Store<FullState>,
    private readonly _csv: CsvApplicantExporter,
    private readonly _json: JsonApplicantExporter,
    private readonly _excel: ExcelApplicantExporter,
    private readonly _pdf: PdfApplicantExporter,
    private readonly _translation: ExportTranslationHelper
  ) {}

  public async exportAsCSV(): Promise<void> {
    const { applicants, language } = await this._fetchExportContext();
    const csvContent = this._csv.generate(applicants, language);
    saveExportBlob([csvContent], ExportFormats.CSV, this._translation);
  }

  public async exportAsJSON(): Promise<void> {
    const { applicants } = await this._fetchExportContext();
    saveExportBlob(
      [this._json.generate(applicants)],
      ExportFormats.JSON,
      this._translation
    );
  }

  public async exportAsExcel(): Promise<void> {
    const { applicants, language } = await this._fetchExportContext();
    const buffer = await this._excel.generate(applicants, language);
    saveExportBlob([buffer], ExportFormats.EXCEL, this._translation);
  }

  public async exportAsPDF(): Promise<void> {
    const { applicants, language } = await this._fetchExportContext();
    const pdfBytes = await this._pdf.generate(applicants, language);
    saveExportBlob(
      [pdfBytes as BlobPart],
      ExportFormats.PDF,
      this._translation
    );
  }

  private async _fetchExportContext(): Promise<ExportContext> {
    const [applicants, language] = await Promise.all([
      firstValueFrom(this._store.select(selectAllApplicants)),
      firstValueFrom(this._store.select(selectAppLanguage)),
    ]);
    return { applicants, language };
  }
}
