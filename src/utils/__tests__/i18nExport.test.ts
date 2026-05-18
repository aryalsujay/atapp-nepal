import { flatten, unflatten, buildWorkbookRows, SHEET_HEADERS } from '../i18nExport';

describe('flatten / unflatten', () => {
  it('flattens nested objects into dotted keys', () => {
    const input = { a: { b: { c: 'hello' } }, x: 'y' };
    expect(flatten(input)).toEqual({ 'a.b.c': 'hello', x: 'y' });
  });

  it('round-trips through unflatten', () => {
    const input = { admin: { translations: { title: 'T' } }, foo: 'bar' };
    const flat = flatten(input);
    const back = unflatten(flat);
    expect(back).toEqual(input);
  });

  it('skips arrays and non-string leaves', () => {
    const input = { keep: 'me', arr: [1, 2], n: 5 } as unknown as Record<string, unknown>;
    expect(flatten(input)).toEqual({ keep: 'me' });
  });
});

describe('buildWorkbookRows', () => {
  const live = {
    en: { 'foo.a': 'A-en', 'foo.b': 'B-en' },
    ne: { 'foo.a': 'A-ne', 'foo.b': 'B-ne' },
    hi: { 'foo.a': 'A-hi', 'foo.b': '' },
  };

  it('emits one row per key in sorted order', () => {
    const rows = buildWorkbookRows(live, []);
    expect(rows).toHaveLength(2);
    expect(rows[0][0]).toBe('foo.a');
    expect(rows[1][0]).toBe('foo.b');
  });

  it('fills live values across EN/NE/HI columns', () => {
    const rows = buildWorkbookRows(live, []);
    const row = rows[0];
    expect(row).toEqual(['foo.a', 'A-en', 'A-ne', 'A-hi', '', '', '', '']);
  });

  it('attaches per-language suggestions to the matching key', () => {
    const rows = buildWorkbookRows(live, [
      { key: 'foo.a', lang: 'ne', value: 'A-ne-suggested', note: 'simpler verb' },
      { key: 'foo.b', lang: 'hi', value: 'B-hi-new', note: null },
    ]);
    const a = rows[0];
    const b = rows[1];
    // EN-sug · NE-sug · HI-sug · notes are columns 4..7
    expect(a[5]).toBe('A-ne-suggested');
    expect(a[7]).toBe('simpler verb');
    expect(b[6]).toBe('B-hi-new');
    expect(b[7]).toBe('');
  });

  it('headers match the spec column order', () => {
    expect(SHEET_HEADERS).toEqual([
      'key',
      'EN (live)',
      'NE (live)',
      'HI (live)',
      'EN suggestion',
      'NE suggestion',
      'HI suggestion',
      'notes',
    ]);
  });
});
