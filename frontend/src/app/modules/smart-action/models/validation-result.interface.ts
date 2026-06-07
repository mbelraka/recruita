export interface ValidationResult<T> {
  readonly isValid: boolean;
  readonly value?: T;
  readonly errors?: readonly string[];
}
