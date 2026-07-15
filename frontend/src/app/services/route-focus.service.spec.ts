import { TestBed, fakeAsync, flushMicrotasks } from '@angular/core/testing';

import { RouteFocusService } from './route-focus.service';

describe('RouteFocusService', () => {
  let service: RouteFocusService;
  let main: HTMLElement;

  beforeEach(() => {
    main = document.createElement('main');
    main.id = 'main-content';
    main.tabIndex = -1;
    document.body.append(main);

    TestBed.configureTestingModule({
      providers: [RouteFocusService],
    });

    service = TestBed.inject(RouteFocusService);
  });

  afterEach(() => {
    main.remove();
  });

  it('focuses main content when present', fakeAsync(() => {
    const focusSpy = spyOn(main, 'focus');

    service.focusMainContent();
    flushMicrotasks();

    expect(focusSpy).toHaveBeenCalledWith({ preventScroll: true });
  }));
});
