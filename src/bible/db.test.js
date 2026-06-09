import { describe, it, expect, vi } from 'vitest';
import { fetchVerses } from './db.js';

function makeFakeDb(rows) {
  let i = 0;
  const stmt = {
    bind: vi.fn(),
    step: vi.fn(() => i < rows.length),
    getAsObject: vi.fn(() => rows[i++]),
    free: vi.fn()
  };
  const prepare = vi.fn(() => stmt);
  return { db: { prepare }, prepare, stmt };
}

describe('fetchVerses', () => {
  it('builds chapter+verse-range SQL with the right params and returns rows', () => {
    const rows = [{ text: 'a', verse: 1, chapter: 3 }, { text: 'b', verse: 2, chapter: 3 }];
    const { db, prepare, stmt } = makeFakeDb(rows);
    const out = fetchVerses(db, { book: 'JHN', chapter: 3, startVerse: 1, endVerse: 2 }, 'NIV');

    expect(out).toEqual(rows);
    const sql = prepare.mock.calls[0][0];
    expect(sql).toContain('WHERE book = :book AND version = :version');
    expect(sql).toContain('AND chapter = :chapter');
    expect(sql).toContain('AND verse >= :start AND verse <= :end');
    expect(sql).toContain('ORDER BY chapter ASC, verse ASC');
    expect(stmt.bind).toHaveBeenCalledWith({
      ':book': 'JHN', ':version': 'NIV', ':chapter': 3, ':start': 1, ':end': 2
    });
    expect(stmt.free).toHaveBeenCalled();
  });

  it('omits chapter/verse clauses when only the book is given', () => {
    const { db, prepare, stmt } = makeFakeDb([]);
    fetchVerses(db, { book: 'GEN' }, 'NIV');
    const sql = prepare.mock.calls[0][0];
    expect(sql).not.toContain(':chapter');
    expect(sql).not.toContain(':start');
    expect(stmt.bind).toHaveBeenCalledWith({ ':book': 'GEN', ':version': 'NIV' });
  });
});
