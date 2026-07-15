import { LOCALE_ID } from '@angular/core';
import { MAT_DATE_LOCALE } from '@angular/material/core';

import { localeIdFactory } from '../utilities/factories/locale-id.factory';
import { matDateLocaleFactory } from '../utilities/factories/mat-date-locale.factory';

export const localeProviders = [
  {
    provide: LOCALE_ID,
    useFactory: localeIdFactory,
  },
  {
    provide: MAT_DATE_LOCALE,
    useFactory: matDateLocaleFactory,
  },
];
