import Database from 'better-sqlite3';
import db from './connection';

const totalTracks = () => {
  const tracksStmt = db.prepare('SELECT COUNT(*) FROM tracks');
  const albumsStmt = db.prepare('SELECT COUNT(*) FROM albums');
  const tracksInfo = tracksStmt.get();
  const albumsInfo = albumsStmt.get();
  return { albumsInfo, tracksInfo };
};

const topHundredArtists = () => {
  const stmt = db.prepare(
    'SELECT artist, COUNT(*) as count FROM tracks GROUP BY artist ORDER BY count DESC'
  );
  const result = stmt.all();

  return result;
};

const allTracksByArtist = (artist) => {
  const stmt = db.prepare(
    `SELECT afid, audiofile, year, title, artist, album, genre FROM tracks WHERE artist = ?`
  );
  const result = stmt.all(artist);
  return result;
};

const allTracksByGenre = (genre) => {
  console.log('genre: ', genre);
  let query, params;
  if (genre === 'No Genre Specified') {
    // Query to handle special category
    query = `SELECT afid, audiofile, year, title, artist, album, genre FROM tracks WHERE genre IS NULL OR genre = '' OR genre = ' '`;
    params = [];
  } else {
    // Standard query for specific genres
    query = `SELECT afid, audiofile, year, title, artist, album, genre FROM tracks WHERE genre = ?`;
    params = [genre];
  }
  const stmt = db.prepare(query);
  const result = stmt.all(...params);
  return result;
};

const allTracksByRoot = (root) => {
  // Corrected SQL query string and removed the extra `}`
  const stmt = db.prepare(
    `SELECT afid, audiofile, year, title, artist, album, genre FROM tracks WHERE root = ?`
  );
  // Execute the prepared statement with `root` as the parameter
  const result = stmt.all(root);
  return result;
};

const distinctDirectories = () => {
  // Define the SQL query to get unique color values
  const sql = 'SELECT DISTINCT rootlocation FROM albums';

  // Execute the query
  const rows = db.prepare(sql).all();

  // Extract just the color values
  const uniqueDirectories = rows.map((row) => row.rootlocation);
  return uniqueDirectories;
};

const genresWithCount = () => {
  const stmt = db.prepare(
    `
    SELECT 
      CASE 
        WHEN genre IS NULL OR genre = '' OR genre = ' ' THEN 'No Genre Specified' 
        ELSE genre 
      END as genre_display,
      COUNT(*) as count 
    FROM tracks 
    GROUP BY genre_display 
    ORDER BY 
      CASE 
        WHEN genre_display = 'No Genre Specified' THEN 1 
        ELSE 2 
      END, lower(genre_display)
  `
  );
  const results = stmt.all();
  return results;
};

const foldersWithCount = (dirs) => {
  // Assuming dirs is an array of folder paths, e.g., ['path1', 'path2']
  // Prepare a query string with placeholders for 'dirs' values
  let placeholders = dirs.map(() => '?').join(', ');
  let sql = `
    SELECT root, COUNT(*) as count 
    FROM tracks 
    WHERE root IN (${placeholders})
    GROUP BY root 
    ORDER BY lower(root)
  `;

  // Prepare the statement with the sql query
  const stmt = db.prepare(sql);

  // Execute the query with 'dirs' as the parameters for placeholders
  const results = stmt.all(...dirs);
  return results;
};

const albumsByTopFolder = (folder) => {
  const stmt = db.prepare('SELECT * FROM albums WHERE rootlocation = ?');

  const results = stmt.all(folder);
  return results;
};

const nullMetadata = () => {
  const stmt = db.prepare(
    `SELECT audiofile FROM tracks WHERE artist IS NULL OR title IS NULL OR album IS NULL ORDER BY audiofile`
  );
  return stmt.all();
};

export {
  totalTracks,
  topHundredArtists,
  genresWithCount,
  foldersWithCount,
  nullMetadata,
  allTracksByArtist,
  allTracksByGenre,
  allTracksByRoot,
  distinctDirectories,
  albumsByTopFolder
};

/*
SELECT COUNT(*) FROM tracks;

// RETURNS NON NULL , DEDUCT FROM ABOVE FOR NULL //
SELECT COUNT(artist) FROM tracks;


SELECT artist, COUNT(*) FROM tracks GROUP BY artist ORDER BY COUNT(*) DESC;
*/
