import Database from 'better-sqlite3';
import db from './connection';

const totalTracks = () => {
  const tracksStmt = db.prepare('SELECT COUNT(*) FROM tracks');
  const albumsStmt = db.prepare('SELECT COUNT(*) FROM albums');
  const tracksInfo = tracksStmt.get();
  const albumsInfo = albumsStmt.get();
  return { albumsInfo, tracksInfo };
};

const topTenArtists = () => {
  const stmt = db.prepare(
    'SELECT artist , COUNT(*) FROM tracks GROUP BY artist ORDER BY COUNT(*) DESC LIMIT 11'
  );
  const result = stmt.all();

  return result.slice(1, -1);
};

const genresWithCount = () => {
  const stmt = db.prepare('SELECT genre, COUNT(genre) FROM tracks GROUP BY genre ORDER BY genre');
  const results = stmt.all();
  return results;
};

const nullMetadata = () => {
  const stmt = db.prepare(
    `SELECT audiofile FROM tracks WHERE artist IS NULL OR title IS NULL OR album IS NULL ORDER BY audiofile`
  );
  return stmt.all();
};

export { totalTracks, topTenArtists, genresWithCount, nullMetadata };

/*
SELECT COUNT(*) FROM tracks;

// RETURNS NON NULL , DEDUCT FROM ABOVE FOR NULL //
SELECT COUNT(artist) FROM tracks;


SELECT artist, COUNT(*) FROM tracks GROUP BY artist ORDER BY COUNT(*) DESC;
*/
