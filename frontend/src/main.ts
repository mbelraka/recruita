import { platformBrowser } from '@angular/platform-browser';
import { enableProdMode } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import en from '@angular/common/locales/en';
import de from '@angular/common/locales/de';
import fr from '@angular/common/locales/fr';
import it from '@angular/common/locales/it';
import es from '@angular/common/locales/es';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

// Unregister service workers during development
if (!environment.production && 'serviceWorker' in navigator) {
  void navigator.serviceWorker
    .getRegistrations()
    .then((registrations): void => {
      for (const registration of registrations) {
        void registration.unregister();
      }
    });
}

// Enable production mode for production builds
if (environment.production) {
  enableProdMode();
}

// Bootstrap the application
platformBrowser()
  .bootstrapModule(AppModule)
  .catch((error: unknown): void => console.error(error));

registerLocaleData(en);
registerLocaleData(de);
registerLocaleData(fr);
registerLocaleData(it);
registerLocaleData(es);
