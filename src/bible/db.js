import initSqlJs from 'sql.js';

export async function loadBibleDb() {
  const SQL = await initSqlJs({ locateFile: file => `./${file}` });
  const response = await fetch('./bible.db');
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  const buffer = await response.arrayBuffer();
  return new SQL.Database(new Uint8Array(buffer));
}

export function fetchVerses(db, ref, version) {
  let sql = 'SELECT text, verse, chapter FROM verses WHERE book = :book AND version = :version';
  const params = { ':book': ref.book, ':version': version };
  if (ref.chapter) {
    sql += ' AND chapter = :chapter';
    params[':chapter'] = ref.chapter;
  }
  if (ref.startVerse) {
    sql += ' AND verse >= :start AND verse <= :end';
    params[':start'] = ref.startVerse;
    params[':end'] = ref.endVerse;
  }
  sql += ' ORDER BY chapter ASC, verse ASC';

  const stmt = db.prepare(sql);
  stmt.bind(params);
  const verses = [];
  while (stmt.step()) {
    verses.push(stmt.getAsObject());
  }
  stmt.free();
  return verses;
}
