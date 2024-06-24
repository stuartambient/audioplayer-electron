import path from 'node:path';
import Database from 'better-sqlite3';

console.log('db path: ', path.join(__dirname));
console.log('cwd: ', process.cwd());
const db = new Database(`H:/db/music.db`);
db.pragma('journal_mode = WAL');
db.pragma('synchronous = normal');
db.pragma('temp_store = memory');

db.loadExtension(`H:/db/extensions/unicode`);

export default db;

/* const db = new Database(`${process.cwd()}/src/db/music.db`, { verbose: console.log });
db.loadExtension(`${process.cwd()}/src/db/extensions/unicode`); */
