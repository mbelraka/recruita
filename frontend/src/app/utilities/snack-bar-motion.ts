/**
 * Snackbar enter/exit uses CSS keyframes named `_mat-snack-bar-enter` / `_mat-snack-bar-exit`
 * — the same names `MatSnackBarContainer` listens for on `animationend` (see Angular Material
 * snack-bar sources). Material ships those keyframes inside the JS bundle, which loads after
 * global SCSS, so we append this stylesheet after bootstrap so our motion wins in the cascade.
 */
const SNACK_BAR_MOTION_STYLE_TEXT = `
@media (prefers-reduced-motion: no-preference) {
  @keyframes _mat-snack-bar-enter {
    from {
      opacity: 0;
      transform: translate3d(14px, -10px, 0) scale(0.96);
    }
    to {
      opacity: 1;
      transform: translate3d(0, 0, 0) scale(1);
    }
  }

  @keyframes _mat-snack-bar-exit {
    from {
      opacity: 1;
      transform: translate3d(0, 0, 0);
    }
    to {
      opacity: 0;
      transform: translate3d(14px, -10px, 0);
    }
  }

  .app-notification-snackbar.mat-mdc-snack-bar-container.mat-snack-bar-container-animations-enabled.mat-snack-bar-container-enter {
    animation-duration: var(--app-snackbar-enter-duration);
    animation-timing-function: var(--app-snackbar-enter-easing);
  }

  .app-notification-snackbar.mat-mdc-snack-bar-container.mat-snack-bar-container-animations-enabled.mat-snack-bar-container-exit {
    animation-duration: var(--app-snackbar-exit-duration);
    animation-timing-function: var(--app-snackbar-exit-easing);
  }
}
`;

export function appendSnackBarMotionStyleElement(): void {
  if (typeof document === 'undefined') {
    return;
  }
  if (document.querySelector('#app-snackbar-motion-overrides')) {
    return;
  }
  const style = document.createElement('style');
  style.id = 'app-snackbar-motion-overrides';
  style.textContent = SNACK_BAR_MOTION_STYLE_TEXT;
  document.head.append(style);
}
