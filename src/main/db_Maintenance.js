function performDatabaseMaintenance() {
  const db = new Database(`H:/db/music.db`);

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

// Perform maintenance at the application startup or scheduled maintenance time
performDatabaseMaintenance();
// Check database info (encoding and freelist count)

// Call this function at the application startup or scheduled maintenance time
