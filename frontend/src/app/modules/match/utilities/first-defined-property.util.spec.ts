import {
  firstDefinedTrimmedString,
  firstDefinedValue,
} from './first-defined-property.util';

describe('firstDefinedProperty.util', () => {
  describe('firstDefinedValue', () => {
    it('returns the first non-nullish value in key order', () => {
      const source = { a: null, b: undefined, c: 0, d: 'later' };

      expect(firstDefinedValue(source, ['a', 'b', 'c', 'd'])).toBe(0);
      expect(firstDefinedValue(source, ['a', 'b', 'd', 'c'])).toBe('later');
    });

    it('returns undefined when every key is nullish', () => {
      const source = { a: null, b: undefined };

      expect(firstDefinedValue(source, ['a', 'b'])).toBeUndefined();
      expect(firstDefinedValue(source, [])).toBeUndefined();
    });
  });

  describe('firstDefinedTrimmedString', () => {
    it('returns a trimmed string for the first non-nullish value', () => {
      const source = { id: '  temp-1  ', candidateId: 'fallback' };

      expect(
        firstDefinedTrimmedString(source, ['id', 'candidateId'] as const)
      ).toBe('temp-1');
    });

    it('returns undefined for missing, empty, or whitespace-only values', () => {
      const source = { a: null, b: '   ', c: 'valid' };

      expect(firstDefinedTrimmedString(source, ['a', 'b'])).toBeUndefined();
      expect(firstDefinedTrimmedString(source, ['b'])).toBeUndefined();
      expect(firstDefinedTrimmedString(source, ['c'])).toBe('valid');
      expect(firstDefinedTrimmedString(source, ['a', 'c'])).toBe('valid');
    });
  });
});
