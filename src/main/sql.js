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

const createCoversTable = () => {
  const ct = db.prepare('CREATE TABLE IF NOT EXISTS covers ( coverpath, coversearchname )');
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
    'INSERT INTO tracks (afid, root, audiofile, modified, extension, year, title, artist, album, genre, lossless, bitrate, sampleRate, like) VALUES (@afid, @root, @audiofile, @modified, @extension, @year, @title, @artist, @album, @genre, @lossless, @bitrate, @sampleRate, @like)'
  );

  const insertMany = db.transaction((files) => {
    for (const f of files) insert.run(f);
  });

  const info = insertMany(files);
};

const insertCovers = (covers) => {
  const insert = db.prepare(
    `INSERT INTO covers (coverpath, coversearchname) VALUES (@path, @folder)`
  );

  const insertMany = db.transaction((covers) => {
    for (const c of covers)
      try {
        insert.run(c);
      } catch (err) {
        return err;
      }
  });
  const info = insertMany(covers);
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

const getAllTracks = (rows) => {
  /* const tracks = db.prepare('SELECT * FROM tracks ORDER BY RANDOM() LIMIT 50000'); */
  const tracks = db.prepare('SELECT * FROM tracks WHERE rowid = ?');

  const shuffledTracks = rows.map((r) => tracks.get(r));
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
  const stmt = db.prepare(
    `SELECT * FROM tracks ORDER BY ${sort} DESC LIMIT 50 OFFSET ${offsetNum * 50}`
  );
  return stmt.all();
};

const allTracksBySearchTerm = (offsetNum, text, sort) => {
  const term = `%${text}%`;
  const stmt = db.prepare(
    `SELECT * FROM tracks WHERE audiofile LIKE ? LIMIT 50 OFFSET ${offsetNum * 50}`
  );
  return stmt.all(term);
};

const getPlaylist = (playlist) => {
  const plfile = db.prepare('SELECT * FROM tracks WHERE audiofile = ?');
  /* const assocFiles = files.all(`${albumPath}%`); */
  const albumFiles = [];
  playlist.forEach((pl) => {
    albumFiles.push(plfile.get(pl));
  });
  /* console.log(albumFiles); */
  return albumFiles;
};

const allAlbumsByScroll = (offsetNum, sort) => {
  const stmt = db.prepare(
    `SELECT * FROM albums ORDER BY ${sort} DESC LIMIT 50 OFFSET ${offsetNum * 50}`
  );
  return stmt.all();
};

/* const allAlbumsBySearchTerm = (offsetNum, text) => {
  const term = `%${text}%`;
  const stmt = db.prepare(
    `SELECT * FROM albums WHERE fullpath LIKE ? LIMIT 50 OFFSET ${offsetNum * 50}`
  );
  return stmt.all(term);
}; */

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

const allAlbumsBySearchTerm = (offsetNum, text, sort) => {
  const term = `%${text}%`;
  const stmt = db.prepare(
    `SELECT * FROM albums WHERE fullpath LIKE ? ORDER BY ${sort} LIMIT 50 OFFSET ${offsetNum * 50}`
  );
  return stmt.all(term);
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
  const assocFiles = files.all(`${albumPath}%`);
  const albumFiles = [];
  assocFiles.forEach((a) => {
    albumFiles.push(a);
  });
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
createCoversTable();

export {
  insertFiles,
  insertAlbums,
  deleteAlbums,
  deleteFiles,
  getAlbums,
  getAlbum,
  getFiles,
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
  insertCovers,
  getMissingCovers
};

/*
SELECT COUNT(*) FROM tracks;

// RETURNS NON NULL , DEDUCT FROM ABOVE FOR NULL //
SELECT COUNT(artist) FROM tracks;


SELECT artist, COUNT(*) FROM tracks GROUP BY artist ORDER BY COUNT(*) DESC;
*/
