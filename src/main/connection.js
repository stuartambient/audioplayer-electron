import Database from 'better-sqlite3';

const db = new Database(`H:/db/music.db`);
db.pragma('journal_mode = WAL');
db.pragma('synchronous = normal');
db.pragma('temp_store = memory');

db.loadExtension(`H:/db/extensions/unicode`);

export default db;
