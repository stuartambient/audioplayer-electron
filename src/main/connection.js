import { app } from 'electron'; // Ensure app is imported here */
import path from 'node:path';
import Database from 'better-sqlite3';

console.log('isPackaged: ', app.isPackaged, '----', process.cwd());

const dbPath = app.isPackaged
  ? path.join(app.getPath('userData'), import.meta.env.MAIN_VITE_DB_PATH_PROD)
  : path.join(process.cwd(), import.meta.env.MAIN_VITE_DB_PATH_DEV);

const db = new Database(dbPath /* { verbose: console.log } */);
db.pragma('journal_mode = WAL');
db.pragma('synchronous = normal');
db.pragma('temp_store = memory');

const extensionsPath = app.isPackaged
  ? path.join(app.getPath('userData'), 'extensions')
  : path.join(process.cwd(), 'src/db/extensions');

db.loadExtension(path.join(extensionsPath, 'unicode'));
/* 
db.loadExtension(`${process.cwd()}/src/db/extensions/unicode`); */

export default db;
