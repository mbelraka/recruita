import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import {
  TranslateFakeLoader,
  TranslateLoader,
  TranslateModule,
} from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';

import { Languages } from 'src/app/enums/language.enum';
import { MainComponent } from 'src/app/modules/main/components/main.component';
import { MainLangRefreshHostDirective } from 'src/app/modules/main/directives/main-lang-refresh-host.directive';
import { MAIN_LANG_REFRESH_ZONE } from 'src/app/modules/main/constants/main-lang-refresh.constants';
import type { MainLangRefreshZone } from 'src/app/modules/main/models/main-lang-refresh-zone.model';

interface MainComponentPrivate {
  _restartTranslatedLangRefresh(): void;
  _prefersReducedMotion(): boolean;
  _isCopyLangRefreshAnimation(event: AnimationEvent): boolean;
  _zonesRefreshing: {
    (): Record<MainLangRefreshZone, boolean>;
    set(value: Record<MainLangRefreshZone, boolean>): void;
    update(
      updater: (
        current: Record<MainLangRefreshZone, boolean>
      ) => Record<MainLangRefreshZone, boolean>
    ): void;
  };
  _langRefreshHosts(): {
    elementRef: { nativeElement: HTMLElement };
  }[];
}

describe('MainComponent', () => {
  let fixture: ComponentFixture<MainComponent>;
  let component: MainComponent;
  let componentPrivate: MainComponentPrivate;
  let store: MockStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MainComponent, MainLangRefreshHostDirective],
      imports: [
        RouterModule.forRoot([]),
        MatButtonModule,
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
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MainComponent);
    component = fixture.componentInstance;
    componentPrivate = component as unknown as MainComponentPrivate;
    store = TestBed.inject(MockStore);
    spyOn(store, 'dispatch');
    fixture.detectChanges();
  });

  function createAnimationEvent(name: string): AnimationEvent {
    const target = document.createElement('div');
    const event = {
      animationName: name,
      target,
      currentTarget: target,
    };
    return event as unknown as AnimationEvent;
  }

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render headline and sub-headline placeholders', () => {
    const headline = fixture.debugElement.query(By.css('.headline'));
    const sub = fixture.debugElement.query(By.css('.sub-headline'));

    expect(headline).toBeTruthy();
    expect(sub).toBeTruthy();
    expect(headline.nativeElement.textContent).toContain('main.headline');
    expect(sub.nativeElement.textContent).toContain('main.subHeadline');
  });

  it('should link primary CTA to applicants route', () => {
    const primary = fixture.debugElement.query(By.css('.main-cta'));
    const routerLink = primary.injector.get(RouterLink);
    const router = TestBed.inject(Router);

    expect(routerLink.urlTree).not.toBeNull();
    expect(router.serializeUrl(routerLink.urlTree!)).toBe('/applicants');
  });

  it('should render hero image asset', () => {
    const img = fixture.debugElement.query(By.css('.main-image'));

    expect(img.nativeElement.getAttribute('src')).toBe('assets/main-image.png');
  });

  it('should render overlay copy keys', () => {
    const title = fixture.debugElement.query(By.css('.overlay-title'));
    const subtitle = fixture.debugElement.query(By.css('.overlay-subtitle'));

    expect(title.nativeElement.textContent).toContain('main.overlayTitle');
    expect(subtitle.nativeElement.textContent).toContain(
      'main.overlaySubtitle'
    );
  });

  it('should report refresh flags as inactive by default', () => {
    expect(
      component.isLangRefreshActive(MAIN_LANG_REFRESH_ZONE.HEADING)
    ).toBeFalse();
    expect(
      component.isLangRefreshActive(MAIN_LANG_REFRESH_ZONE.OVERLAY)
    ).toBeFalse();
  });

  it('should ignore unrelated copy animation end events', () => {
    const event = createAnimationEvent('different-animation');

    component.onCopyLangRefreshEnd(event, MAIN_LANG_REFRESH_ZONE.HEADING);

    expect(
      component.isLangRefreshActive(MAIN_LANG_REFRESH_ZONE.HEADING)
    ).toBeFalse();
  });

  it('should clear the targeted zone when the copy animation ends', () => {
    componentPrivate._zonesRefreshing.set({
      heading: true,
      overlay: true,
    });

    component.onCopyLangRefreshEnd(
      createAnimationEvent('main-copy-lang-refresh'),
      MAIN_LANG_REFRESH_ZONE.HEADING
    );

    expect(
      component.isLangRefreshActive(MAIN_LANG_REFRESH_ZONE.HEADING)
    ).toBeFalse();
    expect(
      component.isLangRefreshActive(MAIN_LANG_REFRESH_ZONE.OVERLAY)
    ).toBeTrue();
  });

  it('should return false when prefers reduced motion and matchMedia is unavailable', () => {
    const originalMatchMedia = globalThis.matchMedia;

    Object.defineProperty(globalThis, 'matchMedia', {
      configurable: true,
      value: undefined,
    });

    expect(componentPrivate._prefersReducedMotion()).toBeFalse();

    Object.defineProperty(globalThis, 'matchMedia', {
      configurable: true,
      value: originalMatchMedia,
    });
  });

  it('should detect prefers reduced motion from matchMedia', () => {
    spyOn(globalThis, 'matchMedia').and.returnValue({
      matches: true,
    } as MediaQueryList);

    expect(componentPrivate._prefersReducedMotion()).toBeTrue();
  });

  it('should reject animation events from child targets', () => {
    const target = document.createElement('div');
    const currentTarget = document.createElement('div');
    const event = {
      animationName: 'main-copy-lang-refresh',
      target,
      currentTarget,
    } as unknown as AnimationEvent;

    expect(componentPrivate._isCopyLangRefreshAnimation(event)).toBeFalse();
  });

  it('should detect an exact copy animation name', () => {
    expect(
      componentPrivate._isCopyLangRefreshAnimation(
        createAnimationEvent('main-copy-lang-refresh')
      )
    ).toBeTrue();
  });

  it('should detect copy animation names that include the keyframe name', () => {
    expect(
      componentPrivate._isCopyLangRefreshAnimation(
        createAnimationEvent('fade-main-copy-lang-refresh-enter')
      )
    ).toBeTrue();
  });

  it('should restart translated zones when motion is allowed', fakeAsync(() => {
    const hostElement = document.createElement('div');
    const offsetWidthSpy = spyOnProperty(
      hostElement,
      'offsetWidth',
      'get'
    ).and.returnValue(320);
    spyOn(globalThis, 'matchMedia').and.returnValue({
      matches: false,
    } as MediaQueryList);
    spyOn(globalThis, 'requestAnimationFrame').and.callFake(
      (callback: FrameRequestCallback): number => {
        callback(0);
        return 1;
      }
    );
    spyOn(componentPrivate, '_langRefreshHosts').and.returnValue([
      { elementRef: { nativeElement: hostElement } },
    ]);

    componentPrivate._restartTranslatedLangRefresh();
    tick();

    expect(offsetWidthSpy).toHaveBeenCalled();
    expect(
      component.isLangRefreshActive(MAIN_LANG_REFRESH_ZONE.HEADING)
    ).toBeTrue();
    expect(
      component.isLangRefreshActive(MAIN_LANG_REFRESH_ZONE.OVERLAY)
    ).toBeTrue();
  }));

  it('should skip the restart flow when reduced motion is preferred', () => {
    spyOn(globalThis, 'matchMedia').and.returnValue({
      matches: true,
    } as MediaQueryList);
    const requestAnimationFrameSpy = spyOn(globalThis, 'requestAnimationFrame');

    componentPrivate._restartTranslatedLangRefresh();

    expect(requestAnimationFrameSpy).not.toHaveBeenCalled();
    expect(
      component.isLangRefreshActive(MAIN_LANG_REFRESH_ZONE.HEADING)
    ).toBeFalse();
  });
});
