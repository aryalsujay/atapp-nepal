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
  };

  it('emits one row per key in sorted order', () => {
    const rows = buildWorkbookRows(live, []);
    expect(rows).toHaveLength(2);
    expect(rows[0][0]).toBe('foo.a');
    expect(rows[1][0]).toBe('foo.b');
  });

  it('fills live values across EN/NE columns', () => {
    const rows = buildWorkbookRows(live, []);
    const row = rows[0];
    expect(row).toEqual(['foo.a', 'A-en', 'A-ne', '', '', '']);
  });

  it('attaches per-language suggestions to the matching key', () => {
    const rows = buildWorkbookRows(live, [
      { key: 'foo.a', lang: 'ne', value: 'A-ne-suggested', note: 'simpler verb' },
      { key: 'foo.b', lang: 'en', value: 'B-en-new', note: null },
    ]);
    const a = rows[0];
    const b = rows[1];
    // EN-sug · NE-sug · notes are columns 3..5
    expect(a[4]).toBe('A-ne-suggested');
    expect(a[5]).toBe('simpler verb');
    expect(b[3]).toBe('B-en-new');
    expect(b[5]).toBe('');
  });

  it('headers match the spec column order', () => {
    expect(SHEET_HEADERS).toEqual([
      'key',
      'EN (live)',
      'NE (live)',
      'EN suggestion',
      'NE suggestion',
      'notes',
    ]);
  });
});
