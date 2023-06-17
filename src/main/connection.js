import Database from 'better-sqlite3';
const db = new Database(`${process.cwd()}/src/db/music.db` /* , { verbose: console.log } */);
/* const db = new Database(`${app.getPath('appData')}/musicplayer-electron/music.db`); */
db.pragma('journal_mode = WAL');
db.pragma('synchronous = normal');
db.pragma('page_size = 32768');
db.pragma('mmap_size = 30000000000');
db.pragma('temp_store = memory');
db.loadExtension(`${process.cwd()}/src/db/extensions/unicode`);

export default db;
