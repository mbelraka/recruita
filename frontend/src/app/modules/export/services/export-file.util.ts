import { saveAs } from 'file-saver';

import { APP_CONFIG } from '../../../config/app.config';
import { ExportFormats } from '../enums/export-formats.enum';
import { ExportTranslationHelper } from './export-translation.helper';

export function localizedExportFileName(
  format: ExportFormats,
  translation: ExportTranslationHelper
): string {
  const stem = sanitizeFileNameStem(
    translation.translateText(
      'export.fileName',
      APP_CONFIG.EXPORT.FILE_NAME_FALLBACK
    )
  );
  return `${stem}.${APP_CONFIG.EXPORT.FILE_EXTENSIONS[format]}`;
}

export function saveExportBlob(
  parts: BlobPart[],
  format: ExportFormats,
  translation: ExportTranslationHelper
): void {
  const blob = new Blob(parts, {
    type: APP_CONFIG.EXPORT.MIME_TYPES[format],
  });
  saveAs(blob, localizedExportFileName(format, translation));
}

function sanitizeFileNameStem(value: string): string {
  const sanitized = value
    .trim()
    .replace(/[\\/:*?"<>|]+/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return sanitized || APP_CONFIG.EXPORT.FILE_NAME_FALLBACK;
}

export function wrapPdfText(text: string, maxLineChars: number): string[] {
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

export function estimatePdfMaxLineChars(
  contentWidth: number,
  fontSize: number,
  charWidthRatio: number,
  minChars: number
): number {
  const avgCharWidth = fontSize * charWidthRatio;
  return Math.max(minChars, Math.floor(contentWidth / avgCharWidth));
}
