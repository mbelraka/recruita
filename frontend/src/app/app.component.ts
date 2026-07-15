import { afterNextRender, Component, inject, Injector } from '@angular/core';

import { appendSnackBarMotionStyleElement } from './utilities/snack-bar-motion';

@Component({
  selector: 'app-root',
  template: '<router-outlet></router-outlet>',
  standalone: false,
})
export class AppComponent {
  private readonly _injector = inject(Injector);

  public constructor() {
    afterNextRender(
      () => {
        appendSnackBarMotionStyleElement();
      },
      { injector: this._injector }
    );
  }
}
