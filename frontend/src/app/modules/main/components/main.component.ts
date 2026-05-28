import {
  Component,
  DestroyRef,
  inject,
  signal,
  viewChildren,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';
import { distinctUntilChanged, pairwise } from 'rxjs';

import { FullState } from 'src/app/models/full-state.model';
import {
  MAIN_COPY_LANG_REFRESH_KEYFRAME_NAME,
  MAIN_LANG_REFRESH_ZONE,
} from 'src/app/modules/main/constants/main-lang-refresh.constants';
import { MainLangRefreshHostDirective } from 'src/app/modules/main/directives/main-lang-refresh-host.directive';
import type { MainLangRefreshZone } from 'src/app/modules/main/models/main-lang-refresh-zone.model';
import { createMainLangRefreshZoneFlags } from 'src/app/modules/main/utilities/main-lang-refresh-zone.util';
import { selectAppLanguage } from 'src/app/state/app.selectors';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
  standalone: false,
})
export class MainComponent {
  public readonly langRefreshZone = MAIN_LANG_REFRESH_ZONE;

  private readonly _store = inject(Store<FullState>);
  private readonly _destroyRef = inject(DestroyRef);

  private readonly _langRefreshHosts = viewChildren(
    MainLangRefreshHostDirective
  );

  private readonly _zonesRefreshing = signal(
    createMainLangRefreshZoneFlags(false)
  );

  public constructor() {
    this._store
      .select(selectAppLanguage)
      .pipe(
        distinctUntilChanged(),
        pairwise(),
        takeUntilDestroyed(this._destroyRef)
      )
      .subscribe((): void => this._restartTranslatedLangRefresh());
  }

  public isLangRefreshActive(zone: MainLangRefreshZone): boolean {
    return this._zonesRefreshing()[zone];
  }

  public onCopyLangRefreshEnd(
    event: AnimationEvent,
    zone: MainLangRefreshZone
  ): void {
    if (!this._isCopyLangRefreshAnimation(event)) {
      return;
    }
    this._zonesRefreshing.update((state) => ({ ...state, [zone]: false }));
  }

  private _restartTranslatedLangRefresh(): void {
    if (this._prefersReducedMotion()) {
      return;
    }

    this._zonesRefreshing.set(createMainLangRefreshZoneFlags(false));
    requestAnimationFrame((): void => {
      for (const host of this._langRefreshHosts()) {
        void host.elementRef.nativeElement.offsetWidth;
      }
      requestAnimationFrame((): void => {
        this._zonesRefreshing.set(createMainLangRefreshZoneFlags(true));
      });
    });
  }

  private _prefersReducedMotion(): boolean {
    return (
      typeof matchMedia !== 'undefined' &&
      matchMedia('(prefers-reduced-motion: reduce)').matches
    );
  }

  private _isCopyLangRefreshAnimation(event: AnimationEvent): boolean {
    if (event.target !== event.currentTarget) {
      return false;
    }
    const keyframe = MAIN_COPY_LANG_REFRESH_KEYFRAME_NAME;
    const name = event.animationName;
    return name === keyframe || name.includes(keyframe);
  }
}
