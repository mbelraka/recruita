import { HttpClient } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';

import { AppRoutingModule } from 'src/app/app-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';

import { environment } from '../environments/environment';
import { AppComponent } from './app.component';
import { appProviders } from './app.providers';
import { NotificationSnackBarComponent } from './components/notification-snack-bar/notification-snack-bar.component';
import { APP_CONFIG } from './config/app.config';
import { Languages } from './enums/language.enum';
import { AppStateModule } from './modules/core/app-state.module';
import { AppEffects } from './state/app.effects';
import { appReducer } from './state/app.reducer';
import { translateHttpLoaderFactory } from './utilities/factories/translate-http-loader.factory';

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
    StoreModule.forRoot(
      { app: appReducer },
      {
        runtimeChecks: {
          strictStateImmutability: true,
          strictActionImmutability: true,
        },
      }
    ),
    EffectsModule.forRoot([AppEffects]),
    AppStateModule,
    StoreDevtoolsModule.instrument({
      maxAge: APP_CONFIG.NGRX_DEVTOOLS.MAX_STATE_HISTORY,
      logOnly: environment.production,
      autoPause: true,
    }),
  ],
  providers: appProviders,
  bootstrap: [AppComponent],
})
export class AppModule {}
