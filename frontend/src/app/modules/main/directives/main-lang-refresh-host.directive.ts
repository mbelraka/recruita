import {
  Directive,
  ElementRef,
  forwardRef,
  HostBinding,
  HostListener,
  inject,
  input,
} from '@angular/core';

import { MainComponent } from 'src/app/modules/main/components/main.component';
import type { MainLangRefreshZone } from 'src/app/modules/main/models/main-lang-refresh-zone.model';

/**
 * Marks an element as a language-refresh animation host: applies the refresh
 * class when active and reports `animationend` to {@link MainComponent}.
 */
@Directive({
  selector: '[appMainLangRefreshHost]',
  standalone: false,
})
export class MainLangRefreshHostDirective {
  private readonly _main = inject(
    forwardRef(() => MainComponent)
  ) as MainComponent;
  readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly appMainLangRefreshHost = input.required<MainLangRefreshZone>();

  @HostBinding('class.main-copy--lang-refresh')
  public get mainCopyLangRefreshActive(): boolean {
    return this._main.isLangRefreshActive(this.appMainLangRefreshHost());
  }

  @HostListener('animationend', ['$event'])
  public onAnimationEnd(event: AnimationEvent): void {
    this._main.onCopyLangRefreshEnd(event, this.appMainLangRefreshHost());
  }
}
