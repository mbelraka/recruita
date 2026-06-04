import { BreakpointObserver } from '@angular/cdk/layout';
import { TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';

import { LayoutBreakpointService } from './layout-breakpoint.service';

type BreakpointState = {
  breakpoints: Record<string, boolean>;
  matches: boolean;
};

describe('LayoutBreakpointService', () => {
  let observe$: BehaviorSubject<BreakpointState>;

  beforeEach(() => {
    observe$ = new BehaviorSubject<BreakpointState>({
      breakpoints: {},
      matches: false,
    });

    TestBed.configureTestingModule({
      providers: [
        LayoutBreakpointService,
        {
          provide: BreakpointObserver,
          useValue: {
            observe: () => observe$.asObservable(),
          },
        },
      ],
    });
  });

  it('maps max-width 599.98px to xs tier', () => {
    const service = TestBed.inject(LayoutBreakpointService);
    observe$.next({
      breakpoints: { '(max-width: 599.98px)': true },
      matches: true,
    });
    expect(service.widthTier()).toBe('xs');
  });

  it('maps wide viewport to lg tier', () => {
    const service = TestBed.inject(LayoutBreakpointService);
    observe$.next({ breakpoints: {}, matches: false });
    expect(service.widthTier()).toBe('lg');
  });
});
