import { getErrorMessage } from './error.utils';

describe('getErrorMessage', () => {
  it('returns Error.message for Error instances', () => {
    expect(getErrorMessage(new Error('boom'))).toBe('boom');
  });

  it('returns string errors unchanged', () => {
    expect(getErrorMessage('offline')).toBe('offline');
  });

  it('stringifies other values', () => {
    expect(getErrorMessage({ code: 503 })).toBe('{"code":503}');
  });

  it('falls back when JSON.stringify throws', () => {
    const circular: { self?: unknown } = {};
    circular.self = circular;

    expect(getErrorMessage(circular)).toBe('Unknown error');
  });
});
