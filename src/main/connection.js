import Database from 'better-sqlite3';

function performDatabaseMaintenance() {
  const db = new Database(`${process.cwd()}/src/db/music.db`);

  try {
    // Set PRAGMA settings for maintenance
    db.pragma('journal_mode = WAL');
    db.pragma('synchronous = normal');
    db.pragma('temp_store = memory');

    // Perform an explicit checkpoint
    db.pragma('wal_checkpoint(FULL)');

    // Temporarily switch to DELETE mode and back to WAL
    db.pragma('journal_mode = DELETE');
    db.pragma('journal_mode = WAL');

    // Perform VACUUM to optimize database
    db.exec('VACUUM');
  } catch (error) {
    console.error('Error during database maintenance:', error);
  } finally {
    // Close the database connection
    db.close();
  }
}

function checkDatabaseInfo() {
  const db = new Database(`${process.cwd()}/src/db/music.db`);

  try {
    // Check the current encoding
    const encodingResult = db.pragma('encoding');
    const encoding = encodingResult[0].encoding;
    console.log(`Current database encoding: ${encoding}`);

    // Check the number of freelist pages
    const freelistCountResult = db.pragma('freelist_count');
    const freelistCount = freelistCountResult[0].freelist_count;
    console.log(`Number of freelist pages: ${freelistCount}`);
  } catch (error) {
    console.error('Error checking database info:', error);
  } finally {
    // Close the database connection
    db.close();
  }
}

// Perform maintenance at the application startup or scheduled maintenance time
performDatabaseMaintenance();
checkDatabaseInfo();
// Check database info (encoding and freelist count)

// Call this function at the application startup or scheduled maintenance time

const db = new Database(`${process.cwd()}/src/db/music.db` /* , { verbose: console.log } */);
/* const db = new Database(`${app.getPath('appData')}/musicplayer-electron/music.db`); */
db.pragma('journal_mode = WAL');
db.pragma('synchronous = normal');
/* db.pragma('page_size = 32768'); */
/* db.pragma('mmap_size = 30000000000'); */
db.pragma('temp_store = memory');

db.loadExtension(`${process.cwd()}/src/db/extensions/unicode`);

export default db;
