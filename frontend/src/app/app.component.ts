import { afterNextRender, Component, inject, Injector } from '@angular/core';

import { LocalizationService } from './services/localization.service';
import { appendSnackBarMotionStyleElement } from './utilities/snack-bar-motion';

@Component({
  selector: 'app-root',
  template: '<router-outlet></router-outlet>',
  standalone: false,
})
export class AppComponent {
  private readonly _injector = inject(Injector);

  public constructor() {
    inject(LocalizationService);
    afterNextRender(
      () => {
        appendSnackBarMotionStyleElement();
      },
      { injector: this._injector }
    );
  }
}
