import { app } from 'electron';
import Database from 'better-sqlite3';
import { roots } from '../constant/constants.js';
import db from './connection';
/* const db = new Database(`${process.cwd()}/src/db/music.db`, { verbose: console.log }); */
/* const db = new Database(`${app.getPath('appData')}/musicplayer-electron/music.db`); */
/* db.pragma('journal_mode = WAL');
db.pragma('synchronous = normal');
db.pragma('page_size = 32768');
db.pragma('mmap_size = 30000000000');
db.pragma('temp_store = memory'); */

/* SELECT foldername, fullpath FROM albums where unaccent(foldername) LIKE '%Koner%' ORDER BY lower(unaccent(foldername)) */

const createFoldersTable = () => {
  const ct = db.prepare(
    'CREATE TABLE IF NOT EXISTS albums ( id PRIMARY KEY, rootlocation, foldername,fullpath, datecreated, datemodified )'
  );
  const createtable = ct.run();
  /* db.close(); */
};

const createFilesTable = () => {
  const ct = db.prepare(
    'CREATE TABLE IF NOT EXISTS tracks ( afid PRIMARY KEY, root, audiofile, modified, extension, year, title, artist, album, genre, lossless, bitrate, samplerate, like, createdon, modifiedon )'
  );
  const createtable = ct.run();
  /* db.close(); */
};

/* const createIndex = () => {
  const createIdx = db.prepare('CREATE INDEX audiofile_idx ON tracks(audiofile)');
  const idx = createIdx.run();
  db.close();
}; */

const insertFiles = (files) => {
  const insert = db.prepare(
    'INSERT INTO tracks (afid, root, audiofile, modified, extension, year, title, artist, album, genre, lossless, bitrate, sampleRate, like, picture) VALUES (@afid, @root, @audiofile, @modified, @extension, @year, @title, @artist, @album, @genre, @lossless, @bitrate, @sampleRate, @like, @picture)'
  );

  const insertMany = db.transaction((files) => {
    for (const f of files) insert.run(f);
  });

  const info = insertMany(files);
};

const getMissingCovers = () => {
  const missingCovers = db.prepare('SELECT * FROM covers');
  const covers = missingCovers.all();
  return covers;
};

const deleteFiles = (files) => {
  const deleteFile = db.prepare('DELETE FROM tracks WHERE audiofile = ?');

  const deleteMany = db.transaction((files) => {
    for (const f of files) deleteFile.run(f);
  });

  const info = deleteMany(files);
};

const insertAlbums = (data) => {
  const insert = db.prepare(
    'INSERT INTO albums(id, rootlocation, foldername, fullpath) VALUES (@id, @root, @name, @fullpath)'
  );

  const insertMany = db.transaction((albums) => {
    for (const a of albums) insert.run(a);
  });

  insertMany(data);
};

const deleteAlbums = async (data) => {
  const deleteA = db.prepare('DELETE FROM albums WHERE fullpath = ?');
  const deleteMany = db.transaction((data) => {
    for (const d of data) deleteA.run(d);
  });
  deleteMany(data);
};

const deleteAlbum = async (data) => {
  console.log(data);
  const deleteSingleAlbum = db.prepare('DELETE FROM albums WHERE fullpath = ?');
  deleteSingleAlbum.run();
};

const getAlbums = () => {
  const getAllAlbums = db.prepare('SELECT fullpath FROM albums');
  const albums = getAllAlbums.all();
  return albums;
};

const getAlbum = (id) => {
  const getAnAlbum = db.prepare('SELECT fullpath FROM albums WHERE id = ?');
  const album = getAnAlbum.get(id);
  const files = db.prepare('SELECT * FROM tracks WHERE audiofile LIKE ?');
  const assocFiles = files.all(`${album.fullpath}%`);
  const albumFiles = [];
  assocFiles.forEach((a) => {
    albumFiles.push(a);
  });
  return albumFiles;
};

const getFiles = () => {
  const allFiles = db.prepare('SELECT audiofile FROM tracks');
  const files = allFiles.all();
  return files;
};

const refreshMetadata = (tracks) => {
  const transaction = db.transaction(() => {
    const updateStmt = db.prepare(`
      UPDATE tracks SET modified = ?, year = ?, title = ?, artist = ?, album = ?, genre = ? WHERE afid = ? AND audiofile = ?`);

    for (const track of tracks) {
      const { modified, year, title, artist, album, genre, afid, audiofile } = track;
      updateStmt.run(modified, year, title, artist, album, genre, afid, audiofile);
    }
  });
  try {
    // Run the transaction
    transaction();

    return 'Records updated successfully!';
  } catch (error) {
    console.error('Error updating records:', error);
  } /* finally {
    
    db.close();
  } */
};

const allTracks = () => {
  const alltracks = db.prepare('SELECT afid, audiofile, modified FROM tracks');
  const tracks = alltracks.all();
  return tracks;
};

const getAllPkeys = () => {
  const alltracks = db.prepare('SELECT afid FROM tracks');
  /* console.log(alltracks.length); */
  return alltracks.all();
};
const getAllTracks = (rows) => {
  /* const tracks = db.prepare('SELECT * FROM tracks ORDER BY RANDOM() LIMIT 50000'); */
  const tracks = db.prepare('SELECT * FROM tracks WHERE afid = ?');

  /*   const shuffledTracks = rows.map((r) => tracks.get(r));
  console.log('shuffled length from sql.js ', shuffledTracks.length); */
  const shuffledTracks = [];
  for (const r of rows) {
    try {
      const track = tracks.get(r.afid);
      if (track) {
        shuffledTracks.push(track);
      } else if (!track) {
        console.log(r.afid);
      }
    } catch (error) {
      console.error(`Error retrieving rowid ${r}:`, error);
    }
  }
  console.log('shuffled length from sql.js ', shuffledTracks.length);
  return shuffledTracks;
};

const searchAlbums = async () => {
  const stmt = db.prepare(
    "SELECT rootloc, foldername FROM albums WHERE foldername LIKE '%braxton%'"
  );
  const info = await stmt.all();
  /*  db.close(); */
};

/* sort by artist, createdon, title genre */

const allTracksByScroll = (offsetNum, sort) => {
  let query;
  switch (sort) {
    case 'createdon':
      query = `SELECT * FROM tracks ORDER BY createdon DESC LIMIT 50 OFFSET $offset`;
      break;
    case 'artist':
      query = `SELECT * FROM tracks ORDER BY unaccent(lower(artist)) ASC LIMIT 50 OFFSET $offset`;
      break;
    case 'title':
      query = `SELECT * FROM tracks ORDER BY unaccent(lower(title)) DESC LIMIT 50 OFFSET $offset`;
      break;
    case 'genre':
      query = `SELECT * FROM tracks ORDER BY unaccent(lower(genre)) DESC LIMIT 50 OFFSET $offset`;
      break;
    default:
      return;
  }
  const stmt = db.prepare(query);
  return stmt.all({ offset: offsetNum * 50 });
};

const allTracksBySearchTerm = (offsetNum, text, sort) => {
  const term = `%${text}%`;
  let query;
  let params;
  switch (sort) {
    case 'createdon':
      query = `SELECT * FROM tracks WHERE audiofile LIKE ? ORDER BY createdon DESC LIMIT 50 OFFSET ?`;
      params = [term, offsetNum * 50];
      break;
    case 'artist':
      query = `SELECT * FROM tracks WHERE artist LIKE ? ORDER BY unaccent(lower(artist)) ASC LIMIT 50 OFFSET ?`;
      params = [term, offsetNum * 50];
      break;
    case 'title':
      query = `SELECT * FROM tracks WHERE title LIKE ? ORDER BY unaccent(lower(title)) DESC LIMIT 50 OFFSET ?`;
      params = [term, offsetNum * 50];
      break;
    case 'genre':
      query = `SELECT * FROM tracks WHERE genre LIKE ? ORDER BY unaccent(lower(genre)) DESC LIMIT 50 OFFSET ?`;
      params = [term, offsetNum * 50];
      break;
    default:
      return;
  }
  const stmt = db.prepare(query);
  return stmt.all(...params);
};

const getPlaylist = (playlist) => {
  const plfile = db.prepare('SELECT * FROM tracks WHERE audiofile = ?');
  /* const assocFiles = files.all(`${albumPath}%`); */
  const albumFiles = [];
  playlist.forEach((pl) => {
    const file = plfile.get(pl);
    if (!file) return;
    albumFiles.push(file);
  });
  /* albumFiles.forEach((a) => console.log(a.afid)); */
  return albumFiles;
};

/* SELECT foldername, fullpath FROM albums where unaccent(foldername) 
LIKE '%Koner%' ORDER BY lower(unaccent(foldername)) */

/* const allAlbumsByScroll = (offsetNum, sort) => {
  console.log('sort : ', sort);
  const stmt = db.prepare(
    `SELECT * FROM albums ORDER BY ${sort} ASC LIMIT 50 OFFSET ${offsetNum * 50} `
  );
  return stmt.all();
}; */

const allAlbumsByScroll = (offsetNum, sort) => {
  let query;
  switch (sort) {
    case 'foldername':
      query = `SELECT * FROM albums ORDER BY unaccent(lower(foldername)) ASC LIMIT 50 OFFSET $offset`;
      break;
    case 'datecreated':
      query = `SELECT * FROM albums ORDER BY datecreated DESC LIMIT 50 OFFSET $offset`;
      break;
    default:
      return;
  }
  try {
    const stmt = db.prepare(query);
    return stmt.all({ offset: offsetNum * 50 });
  } catch (e) {
    return e.message;
  }
};

const allAlbumsBySearchTerm = (offsetNum, text, sort) => {
  console.log('sort: ', sort);
  const term = `%${text}%`;

  let query;
  let params;
  switch (sort) {
    case 'foldername':
      query = `SELECT * FROM albums WHERE fullpath LIKE ? ORDER BY unaccent(lower(foldername)) ASC LIMIT 50 OFFSET ?`;
      params = [term, offsetNum * 50];
      break;
    case 'datecreated':
      query = `SELECT * FROM albums WHERE fullpath LIKE ? ORDER BY datecreated DESC LIMIT 50 OFFSET ?`;
      params = [term, offsetNum * 50];
      break;
    default:
      return;
  }

  try {
    const stmt = db.prepare(query);
    return stmt.all(...params);
  } catch (e) {
    return e.message;
  }
};

const allCoversByScroll = (offsetNum, term = null) => {
  if (term === '') {
    const stmt = db.prepare(
      `SELECT id, foldername, fullpath FROM albums ORDER BY datecreated DESC LIMIT 50 OFFSET ${
        offsetNum * 50
      }`
    );
    return stmt.all();
  } else {
    const searchTerm = `%${term}%`;
    const stmt = db.prepare(
      `SELECT foldername, fullpath FROM albums WHERE fullpath LIKE ? ORDER BY datecreated ASC LIMIT 50 OFFSET ${
        offsetNum * 50
      }`
    );
    return stmt.all(searchTerm);
  }
};

const requestedFile = (trackId) => {
  const reqTrack = db.prepare(`Select * from tracks where afid = ? `);
  return reqTrack.get(trackId);
};

const filesByAlbum = (albumPath) => {
  /*   const album = db.prepare('SELECT fullpath FROM albums WHERE fullpath = ?');
  const getAlbum = album.get(albumPath); */
  /* const stmt = db.prepare("SELECT audioFile FROM files WHERE "); */
  /* const albumpath = getAlbum.fullpath; */
  const files = db.prepare('SELECT * FROM tracks WHERE audiofile LIKE ?');
  const albumFiles = files.all(`${albumPath}%`);
  console.log('albumFiles: ', albumFiles.length);
  return albumFiles;
};

const likeTrack = (fileId) => {
  let status;
  const isLiked = db.prepare('SELECT like FROM tracks WHERE afid = ?');
  const currentLike = isLiked.get(fileId);
  currentLike.like === 1 ? (status = 0) : (status = 1);
  const updateLike = db.prepare('UPDATE tracks SET like = ? WHERE afid = ? ');
  const info = updateLike.run(status, fileId);
  return info;
};

const isLiked = (id) => {
  const isLiked = db.prepare('SELECT like FROM tracks WHERE afid = ?');
  const currentLike = isLiked.get(id);
  return isLiked.like;
};

createFoldersTable();
createFilesTable();

export {
  insertFiles,
  insertAlbums,
  deleteAlbums,
  deleteAlbum,
  deleteFiles,
  getAlbums,
  getAlbum,
  getFiles,
  getAllPkeys,
  allTracksByScroll,
  allTracksBySearchTerm,
  allAlbumsByScroll,
  allAlbumsBySearchTerm,
  requestedFile,
  filesByAlbum,
  likeTrack,
  isLiked,
  createFoldersTable,
  createFilesTable,
  getPlaylist,
  allCoversByScroll,
  getAllTracks,
  getMissingCovers,
  allTracks,
  refreshMetadata
};

/*
SELECT COUNT(*) FROM tracks;

// RETURNS NON NULL , DEDUCT FROM ABOVE FOR NULL //
SELECT COUNT(artist) FROM tracks;


SELECT artist, COUNT(*) FROM tracks GROUP BY artist ORDER BY COUNT(*) DESC;
*/
