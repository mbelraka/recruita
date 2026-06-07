import { readCookieValue } from './cookie.util';

describe('readCookieValue', () => {
  it('returns null when the cookie is missing', () => {
    expect(readCookieValue('other=value', 'XSRF-TOKEN')).toBeNull();
  });

  it('reads a plain cookie value', () => {
    expect(
      readCookieValue('XSRF-TOKEN=abc123; other=value', 'XSRF-TOKEN')
    ).toBe('abc123');
  });

  it('decodes encoded cookie values', () => {
    expect(readCookieValue('XSRF-TOKEN=abc%2F123', 'XSRF-TOKEN')).toBe(
      'abc/123'
    );
  });
});
