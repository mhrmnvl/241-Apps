import { toSlug, toUniqueSlug } from './slug.helper.js';

describe('toSlug', () => {
  it('lowercases and hyphenates', () => {
    expect(toSlug('Peringatan Maulid Nabi')).toBe('peringatan-maulid-nabi');
  });

  it('collapses runs of non-alphanumerics into a single hyphen', () => {
    expect(toSlug('Juara 1 -- Olimpiade  Matematika!!')).toBe(
      'juara-1-olimpiade-matematika',
    );
  });

  it('strips leading and trailing hyphens', () => {
    expect(toSlug('  ...Rapat Wali Santri...  ')).toBe('rapat-wali-santri');
  });

  it('strips combining marks rather than dropping the letter', () => {
    expect(toSlug('Peringatan Isrā Miʿrāj')).toBe('peringatan-isra-mi-raj');
  });

  it('never ends on a hyphen after truncation', () => {
    const title = `${'a'.repeat(219)} tail`;
    const slug = toSlug(title);
    expect(slug.length).toBeLessThanOrEqual(220);
    expect(slug.endsWith('-')).toBe(false);
  });
});

describe('toUniqueSlug', () => {
  it('returns the base slug when nothing is taken', () => {
    expect(toUniqueSlug('Peringatan Maulid Nabi', [])).toBe(
      'peringatan-maulid-nabi',
    );
  });

  it('suffixes when the base is taken — the same title in two years', () => {
    expect(
      toUniqueSlug('Peringatan Maulid Nabi', ['peringatan-maulid-nabi']),
    ).toBe('peringatan-maulid-nabi-2');
  });

  it('finds the next free suffix, not the next number', () => {
    expect(
      toUniqueSlug('Peringatan Maulid Nabi', [
        'peringatan-maulid-nabi',
        'peringatan-maulid-nabi-2',
        'peringatan-maulid-nabi-4',
      ]),
    ).toBe('peringatan-maulid-nabi-3');
  });

  it('keeps a suffixed slug within the length limit', () => {
    const title = 'a'.repeat(300);
    const slug = toUniqueSlug(title, ['a'.repeat(220)]);
    expect(slug.length).toBeLessThanOrEqual(220);
    expect(slug.endsWith('-2')).toBe(true);
  });

  it('throws when the title contains nothing sluggable', () => {
    expect(() => toUniqueSlug('!!!', [])).toThrow();
  });
});
