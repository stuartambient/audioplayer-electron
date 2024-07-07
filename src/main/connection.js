import { app } from 'electron'; // Ensure app is imported here */
import path from 'node:path';
import Database from 'better-sqlite3';

const prod = import.meta.env.PROD;
const dev = import.meta.env.MODE;

/* console.log('isPackaged: ', app.isPackaged, '----', process.cwd()); */
const resourcesPath = process.resourcesPath;

const dbPath = prod
  ? path.join(resourcesPath, import.meta.env.MAIN_VITE_DB_PATH_PROD)
  : path.join(process.cwd(), import.meta.env.MAIN_VITE_DB_PATH_DEV);

const db = new Database(dbPath /* , { verbose: console.log } */);
db.pragma('journal_mode = WAL');
db.pragma('synchronous = normal');
db.pragma('temp_store = memory');

const extensionsPath = prod
  ? path.join(resourcesPath, 'extensions')
  : path.join(process.cwd(), 'src/db/extensions');

db.loadExtension(path.join(extensionsPath, 'unicode'));
/* 
db.loadExtension(`${process.cwd()}/src/db/extensions/unicode`); */

export default db;
