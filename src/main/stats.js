import Database from 'better-sqlite3';
import db from './connection';

const totalTracks = () => {
  const tracksStmt = db.prepare('SELECT COUNT(*) FROM "audio-tracks"');
  const albumsStmt = db.prepare('SELECT COUNT(*) FROM albums');
  const tracksInfo = tracksStmt.get();
  const albumsInfo = albumsStmt.get();
  return { albumsInfo, tracksInfo };
};

const topHundredArtists = () => {
  const stmt = db.prepare(
    'SELECT performers, COUNT(*) as count FROM "audio-tracks" GROUP BY performers ORDER BY count DESC'
  );
  const result = stmt.all();

  return result;
};

const allTracksByArtist = (artist) => {
  try {
    let query, params;
    if (Array.isArray(artist)) {
      // Query for artist array
      const placeholders = artist.map(() => '?').join(', ');
      query = `SELECT * FROM "audio-tracks" WHERE performers IN (${placeholders})`;
      params = artist;
    } else {
      // Standard query for a single artist
      query = `SELECT * FROM "audio-tracks" WHERE performers = ?`;
      params = [artist];
    }
    const stmt = db.prepare(query);
    const result = stmt.all(...params);
    return result;
  } catch (error) {
    console.error('allTracksByArtist: sqlError: ', error.message);
  }
};

const allTracksByGenres = (genres) => {
  console.log('genres: ', genres);
  try {
    let query, params;
    if (genres === 'No Genres Specified') {
      // Query to handle special category
      query = `SELECT * FROM "audio-tracks" WHERE genres IS NULL OR genres = '' OR genres = ' '`;
      params = [];
    } else if (Array.isArray(genres)) {
      // Query for genres array
      const placeholders = genres.map(() => '?').join(', ');
      query = `SELECT * FROM "audio-tracks" WHERE genres IN (${placeholders})`;
      params = genres;
    } else {
      // Standard query for a single genre
      query = `SELECT * FROM "audio-tracks" WHERE genres = ?`;
      params = [genres];
    }
    const stmt = db.prepare(query);
    const result = stmt.all(...params);
    return result;
  } catch (error) {
    console.error('allTracksByGenres: sqlError: ', error.message);
  }
};

const allTracksByRoot = (root) => {
  // Corrected SQL query string and removed the extra `}`
  const stmt = db.prepare(`SELECT * FROM "audio-tracks" WHERE root = ?`);
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
        WHEN genres IS NULL OR genres = '' OR genres = ' ' THEN 'No Genres Specified' 
        ELSE genres 
      END as genre_display,
      COUNT(*) as count 
    FROM "audio-tracks" 
    GROUP BY genre_display 
    ORDER BY 
      CASE 
        WHEN genre_display = 'No Genres Specified' THEN 1 
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
    FROM "audio-tracks" 
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
    `SELECT audiotrack FROM "audio-tracks" WHERE performers IS NULL OR title IS NULL OR album IS NULL ORDER BY audiotrack`
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
  allTracksByGenres,
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
