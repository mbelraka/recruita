import {
  AbstractControl,
  FormControl,
  ValidationErrors,
  Validators,
} from '@angular/forms';

/** Trims whitespace, then applies required + Angular email format validation. */
export function emailFieldValidator(
  control: AbstractControl
): ValidationErrors | null {
  const raw: unknown = control.value;
  const trimmed =
    typeof raw === 'string'
      ? raw.trim()
      : typeof raw === 'number' || typeof raw === 'boolean'
        ? String(raw).trim()
        : '';
  if (!trimmed) {
    return { required: true };
  }
  return Validators.email(new FormControl(trimmed));
}
