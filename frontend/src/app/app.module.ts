import {
  HTTP_INTERCEPTORS,
  HttpClient,
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import {
  inject,
  LOCALE_ID,
  NgModule,
  provideAppInitializer,
} from '@angular/core';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { MatIconRegistry } from '@angular/material/icon';
import { BrowserModule } from '@angular/platform-browser';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { EntityDataService } from '@ngrx/data';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';

import { AppRoutingModule } from 'src/app/app-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';

import { AppComponent } from './app.component';
import { APP_CONFIG } from './config/app.config';
import { Languages } from './enums/language.enum';
import { AppStateModule } from './modules/core/app-state.module';
import { appReducer } from './state/app.reducer';
import { AppEffects } from './state/app.effects';
import { NotificationSnackBarComponent } from './components/notification-snack-bar/notification-snack-bar.component';
import { localeIdFactory } from './utilities/factories/locale-id.factory';
import { matDateLocaleFactory } from './utilities/factories/mat-date-locale.factory';
import { registerRecruitaEntityDataServices } from './core/entity-data/register-recruita-entity-data-services.initializer';
import { ApplicantDataService } from './modules/applicants/data/applicant-data.service';
import { ProfileDataService } from './modules/main/data/profile-data.service';
import { AuthInterceptor } from './core/http/auth.interceptor';
import { CsrfInterceptor } from './core/http/csrf.interceptor';
import { HttpApiInterceptor } from './core/http/http-api.interceptor';
import { environment } from '../environments/environment';
import { registerMaterialSymbolsOutlinedFont } from './utilities/initializers/material-symbols-outlined-font.initializer';

function translateHttpLoaderFactory(http: HttpClient): TranslateHttpLoader {
  return new TranslateHttpLoader(http, 'assets/i18n/', '.json');
}

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    TranslateModule.forRoot({
      defaultLanguage: Languages.English,
      loader: {
        provide: TranslateLoader,
        useFactory: translateHttpLoaderFactory,
        deps: [HttpClient],
      },
    }),
    NotificationSnackBarComponent,
    SharedModule,
    AppRoutingModule,
    // Configure the NgRx Store before feature modules that register slices
    StoreModule.forRoot(
      { app: appReducer },
      {
        runtimeChecks: {
          strictStateImmutability: true,
          strictActionImmutability: true,
        },
      }
    ),
    // Register NgRx Effects
    EffectsModule.forRoot([AppEffects]),
    AppStateModule,
    // Register Redux DevTools in development
    StoreDevtoolsModule.instrument({
      maxAge: APP_CONFIG.NGRX_DEVTOOLS.MAX_STATE_HISTORY,
      logOnly: environment.production, // Restrict extension to log-only mode in production
      autoPause: true, // Pause when DevTools are not open
    }),
  ],
  providers: [
    provideHttpClient(withInterceptorsFromDi()),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: CsrfInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpApiInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
    {
      provide: LOCALE_ID,
      useFactory: localeIdFactory,
    },
    {
      provide: MAT_DATE_LOCALE,
      useFactory: matDateLocaleFactory,
    },
    provideAppInitializer(() => {
      registerRecruitaEntityDataServices(
        inject(EntityDataService),
        inject(ApplicantDataService),
        inject(ProfileDataService)
      )();
    }),
    provideAppInitializer(() => {
      registerMaterialSymbolsOutlinedFont(inject(MatIconRegistry))();
    }),
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
