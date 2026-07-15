import { Injectable } from '@angular/core';

/** Moves keyboard focus to routed page content after in-app navigation (WCAG 2.4.3). */
@Injectable({ providedIn: 'root' })
export class RouteFocusService {
  public focusMainContent(): void {
    queueMicrotask(() => {
      const main = document.querySelector('#main-content');
      if (!(main instanceof HTMLElement)) {
        return;
      }
      main.focus({ preventScroll: true });
    });
  }
}
