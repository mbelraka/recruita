import { Component } from '@angular/core';
import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Router, RouterLink, RouterModule } from '@angular/router';
import {
  TranslateFakeLoader,
  TranslateLoader,
  TranslateModule,
} from '@ngx-translate/core';
import { provideMockStore, MockStore } from '@ngrx/store/testing';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';

import { APP_CONFIG } from '../../../config/app.config';
import { Languages } from '../../../enums/language.enum';
import { NavLink } from 'src/app/modules/main/models/nav-link.model';
import { LocalizationService } from '../../../services/localization.service';
import { loadProfile } from '../../../modules/main/state/profile.actions';
import { RootComponent } from './root.component';

@Component({ template: '', standalone: false })
class RouteStubComponent {}

describe('RootComponent', () => {
  let fixture: ComponentFixture<RootComponent>;
  let component: RootComponent;
  let localization: jasmine.SpyObj<LocalizationService>;
  let store: MockStore;

  beforeEach(async () => {
    localization = jasmine.createSpyObj<LocalizationService>(
      'LocalizationService',
      ['setLanguage']
    );

    await TestBed.configureTestingModule({
      declarations: [RootComponent, RouteStubComponent],
      imports: [
        RouterModule.forRoot([
          { path: 'main', component: RouteStubComponent },
          { path: 'applicants', component: RouteStubComponent },
          { path: 'match', component: RouteStubComponent },
          { path: 'export', component: RouteStubComponent },
        ]),
        MatFormFieldModule,
        MatIconModule,
        MatSelectModule,
        MatTabsModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: TranslateFakeLoader },
        }),
      ],
      providers: [
        provideMockStore({
          initialState: {
            app: { language: Languages.English },
          },
        }),
        { provide: LocalizationService, useValue: localization },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RootComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(MockStore);
    spyOn(store, 'dispatch');
    component.ngOnInit();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should expose landing route from app config', () => {
    expect(component.landingRoute).toBe(APP_CONFIG.NAV_LINKS[0].link);
  });

  it('should expose the same nav links as app config', () => {
    expect(component.navLinks).toEqual(APP_CONFIG.NAV_LINKS);
  });

  it('should render one tab link per nav item', () => {
    const links = fixture.debugElement.queryAll(By.css('a.tab-link'));
    expect(links.length).toBe(APP_CONFIG.NAV_LINKS.length);
  });

  it('should point logo to landing route', () => {
    const logo = fixture.debugElement.query(By.css('a.logo-link'));
    const routerLink = logo.injector.get(RouterLink);
    const router = TestBed.inject(Router);
    expect(routerLink.urlTree).not.toBeNull();
    expect(router.serializeUrl(routerLink.urlTree!)).toBe(
      component.landingRoute
    );
  });

  it('should dispatch loadProfile on init', () => {
    expect(store.dispatch).toHaveBeenCalledWith(loadProfile());
  });

  it('should sync selectedLanguage when the store language changes', () => {
    expect(component.selectedLanguage).toBe(Languages.English);

    store.setState({
      app: { language: Languages.German, notification: null },
    });

    expect(component.selectedLanguage).toBe(Languages.German);
  });

  it('should call localization when language is valid', () => {
    component.onLanguageChange(Languages.German);
    expect(localization.setLanguage).toHaveBeenCalledWith(Languages.German);
    expect(localization.setLanguage).toHaveBeenCalledTimes(1);
  });

  it('should ignore invalid language values', () => {
    component.onLanguageChange('xx');
    expect(localization.setLanguage).not.toHaveBeenCalled();
  });

  it('should emit current nav link after navigation', fakeAsync(() => {
    const router = TestBed.inject(Router);
    let last: NavLink | undefined;
    const sub = component.currentRoute$.subscribe((v) => {
      last = v;
    });

    router.navigateByUrl('/applicants');
    tick();
    fixture.detectChanges();

    expect(last?.link).toBe('/applicants');
    expect(last?.translationKey).toBe('nav.applicants');
    sub.unsubscribe();
  }));
});
