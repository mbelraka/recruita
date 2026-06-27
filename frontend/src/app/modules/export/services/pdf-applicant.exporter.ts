import { Injectable } from '@angular/core';

import { PDFDocument, rgb } from 'pdf-lib';

import { APP_CONFIG } from '../../../config/app.config';
import { Languages } from '../../../enums/language.enum';
import { Applicant } from '../../applicants/models/applicant.model';
import { estimatePdfMaxLineChars, wrapPdfText } from './export-file.util';
import { ExportTranslationHelper } from './export-translation.helper';

@Injectable({ providedIn: 'root' })
export class PdfApplicantExporter {
  private get _config() {
    return APP_CONFIG.EXPORT;
  }

  public constructor(private readonly _translation: ExportTranslationHelper) {}

  public async generate(
    applicants: Applicant[],
    language: Languages
  ): Promise<Uint8Array> {
    const pdfDoc = await PDFDocument.create();
    const pageSize: [number, number] = [
      this._config.PDF.PAGE.WIDTH,
      this._config.PDF.PAGE.HEIGHT,
    ];
    let page = pdfDoc.addPage(pageSize);
    const { height } = page.getSize();
    const contentWidth = pageSize[0] - this._config.PDF.BODY_X * 2;
    const lineHeight =
      this._config.PDF.BODY_FONT_SIZE + this._config.PDF.BODY.LINE_HEIGHT_EXTRA;
    const maxLineChars = estimatePdfMaxLineChars(
      contentWidth,
      this._config.PDF.BODY_FONT_SIZE,
      this._config.PDF.BODY.CHAR_WIDTH_RATIO,
      this._config.PDF.BODY.MIN_WRAP_CHARS
    );

    const drawTitle = (targetPage: typeof page): void => {
      targetPage.drawText(
        this._translation.translateText('export.title', this._config.PDF.TITLE),
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

    for (const [index, applicant] of applicants.entries()) {
      const text = this._buildRowText(applicant, index, language);
      const wrappedLines = wrapPdfText(text, maxLineChars);
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
      yPosition -= blockHeight + this._config.PDF.BODY.ITEM_SPACING;
    }

    this._drawFooters(pdfDoc);
    return pdfDoc.save();
  }

  private _drawFooters(pdfDoc: PDFDocument): void {
    const pages = pdfDoc.getPages();
    const totalPages = pages.length;
    const { FONT_SIZE, BOTTOM_OFFSET, RIGHT_PADDING } = this._config.PDF.FOOTER;

    for (const [pageIndex, pdfPage] of pages.entries()) {
      const pageLabel = `${pageIndex + 1} / ${totalPages}`;
      const { width } = pdfPage.getSize();
      const approxTextWidth =
        pageLabel.length * FONT_SIZE * this._config.PDF.BODY.CHAR_WIDTH_RATIO;
      pdfPage.drawText(pageLabel, {
        x: width - approxTextWidth - RIGHT_PADDING,
        y: BOTTOM_OFFSET,
        size: FONT_SIZE,
        color: rgb(
          this._config.PDF.BODY_COLOR.r,
          this._config.PDF.BODY_COLOR.g,
          this._config.PDF.BODY_COLOR.b
        ),
      });
    }
  }

  private _buildRowText(
    applicant: Applicant,
    index: number,
    language: Languages
  ): string {
    const availableFromLabel = this._translation.translateText(
      'applicants.availableFrom',
      this._config.PDF.AVAILABLE_FROM_LABEL
    );
    const skillsLabel = this._translation.translateText(
      'applicantList.skills',
      this._config.PDF.SKILLS_LABEL
    );
    const notesPart = applicant.notes?.trim()
      ? `${this._config.PDF.NOTES_PREFIX}${this._translation.normalizeText(applicant.notes)}`
      : this._config.DEFAULT_EMPTY_VALUE;
    const yearsPart =
      applicant.yearsOfExperience !== undefined &&
      applicant.yearsOfExperience !== null
        ? this._translation.formatExperienceYears(applicant.yearsOfExperience)
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
      this._translation.translateApplicationStatus(
        applicant.applicationStatus
      ) ?? this._config.DEFAULT_MISSING_VALUE
    }${
      this._config.PDF.FIELD_SEPARATOR
    }${applicant.email ?? this._config.DEFAULT_EMPTY_VALUE}${
      this._config.PDF.FIELD_SEPARATOR
    }${applicant.phone ?? this._config.DEFAULT_EMPTY_VALUE}${
      this._config.PDF.FIELD_SEPARATOR
    }${availableFromLabel}${this._config.PDF.LABEL_SEPARATOR}${this._translation.formatDateForDisplay(
      applicant.availableFrom,
      language
    )}${this._config.PDF.FIELD_SEPARATOR}${skillsLabel}${
      this._config.PDF.LABEL_SEPARATOR
    }${this._translation.formatSkills(
      applicant.skills,
      this._config.PDF.SKILLS_DELIMITER
    )}${notesPart}`;
  }
}
