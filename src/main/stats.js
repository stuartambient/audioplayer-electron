import Database from 'better-sqlite3';
import db from './connection';

const totalTracks = () => {
  const stmt = db.prepare('SELECT COUNT(*) FROM tracks');
  const info = stmt.get();
  return info;
};

const topTenArtists = () => {
  const stmt = db.prepare(
    'SELECT artist , COUNT(*) FROM tracks GROUP BY artist ORDER BY COUNT(*) DESC LIMIT 11'
  );
  const result = stmt.all();

  return result.slice(1, -1);
};

const last10Albums = () => {
  const stmt = db.prepare(
    'SELECT foldername, fullpath FROM albums ORDER BY datecreated DESC LIMIT 10'
  );
  const result = stmt.all();
  return result;
};

const last100Tracks = () => {
  const stmt = db.prepare('SELECT audiofile FROM tracks ORDER BY createdon DESC LIMIT 100');
  const result = stmt.all();
  return result;
};

export { totalTracks, topTenArtists, last10Albums, last100Tracks };

/*
SELECT COUNT(*) FROM tracks;

// RETURNS NON NULL , DEDUCT FROM ABOVE FOR NULL //
SELECT COUNT(artist) FROM tracks;


SELECT artist, COUNT(*) FROM tracks GROUP BY artist ORDER BY COUNT(*) DESC;
*/
