import { resolveOnceByKey } from './resolve-once-by-key.helper.js';

describe('resolveOnceByKey', () => {
  it('resolves each unique key exactly once', async () => {
    const resolve = jest.fn((key: string) =>
      Promise.resolve(`resolved-${key}`),
    );

    const result = await resolveOnceByKey(['a', 'b', 'a', 'b', 'a'], resolve);

    expect(resolve).toHaveBeenCalledTimes(2);
    expect(resolve).toHaveBeenCalledWith('a');
    expect(resolve).toHaveBeenCalledWith('b');
    expect(result.get('a')).toBe('resolved-a');
    expect(result.get('b')).toBe('resolved-b');
  });

  it('ignores undefined and other falsy values', async () => {
    const resolve = jest.fn((key: string) =>
      Promise.resolve(`resolved-${key}`),
    );

    const result = await resolveOnceByKey(
      ['a', undefined, '', 'b', undefined],
      resolve,
    );

    expect(resolve).toHaveBeenCalledTimes(2);
    expect(result.size).toBe(2);
  });

  it('returns an empty map when there are no values', async () => {
    const resolve = jest.fn((key: string) => Promise.resolve(key));

    const result = await resolveOnceByKey([], resolve);

    expect(resolve).not.toHaveBeenCalled();
    expect(result.size).toBe(0);
  });

  it('preserves null resolution results (not-found case)', async () => {
    const resolve = jest.fn((key: string) =>
      Promise.resolve(key === 'known' ? { id: 'id-1' } : null),
    );

    const result = await resolveOnceByKey(['known', 'unknown'], resolve);

    expect(result.get('known')).toEqual({ id: 'id-1' });
    expect(result.get('unknown')).toBeNull();
  });
});
