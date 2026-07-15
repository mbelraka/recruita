import { inject } from '@angular/core';

import { LocalizationService } from '../../services/localization.service';

/** Boots store-driven localization (ngx-translate, document.lang, date locale, title). */
export function startLocalization(): void {
  inject(LocalizationService);
}
