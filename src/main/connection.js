import path from 'node:path';
import Database from 'better-sqlite3';

const db = new Database(`${process.cwd()}/src/db/music.db` /* { verbose: console.log } */);
db.pragma('journal_mode = WAL');
db.pragma('synchronous = normal');
db.pragma('temp_store = memory');

db.loadExtension(`${process.cwd()}/src/db/extensions/unicode`);

export default db;

/* const db = new Database(`${process.cwd()}/src/db/music.db`, { verbose: console.log });
db.loadExtension(`${process.cwd()}/src/db/extensions/unicode`); */
