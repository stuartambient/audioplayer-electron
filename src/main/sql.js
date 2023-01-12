import Database from 'better-sqlite3';
import { roots } from '../constant/constants.js';
const db = new Database(`${process.cwd()}/src/db/music.db`, { verbose: console.log });
db.pragma('journal_mode = WAL');
db.pragma('synchronous = normal');
db.pragma('page_size = 32768');
db.pragma('mmap_size = 30000000000');
db.pragma('temp_store = memory');

const createTable = () => {
  const ct = db.prepare(
    'CREATE TABLE IF NOT EXISTS albums ( id PRIMARY KEY, rootlocation, foldername,fullpath, datecreated, datemodified )'
  );
  const createtable = ct.run();
  db.close();
};

/* const createTable = () => {
  const ct = db.prepare(
    'CREATE TABLE IF NOT EXISTS tracks ( afid PRIMARY KEY, root, audiofile, modified, extension, year, title, artist, album, genre, lossless, bitrate, samplerate, like, createdon, modifiedon )'
  );
  const createtable = ct.run();
  db.close();
}; */

/* const createIndex = () => {
  const createIdx = db.prepare('CREATE INDEX audiofile_idx ON tracks(audiofile)');
  const idx = createIdx.run();
  db.close();
}; */

const insertFiles = (files) => {
  const insert = db.prepare(
    'INSERT INTO tracks VALUES (@afid, @root, @audiofile, @modified, @extension, @year, @title, @artist, @album, @genre, @lossless, @bitrate, @sampleRate, @like, @createdon, @modifiedon)'
  );

  const insertMany = db.transaction((files) => {
    for (const f of files) insert.run(f);
  });

  const info = insertMany(files);
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
    'INSERT INTO albums(id, rootlocation, foldername, fullpath, datecreated, datemodified) VALUES (@id, @root, @name, @fullpath, @datecreated, @datemodified)'
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

const getFiles = () => {
  const allFiles = db.prepare('SELECT audiofile FROM tracks');
  const files = allFiles.all();
  return files;
};

const searchAlbums = async () => {
  const stmt = db.prepare(
    "SELECT rootloc, foldername FROM albums WHERE foldername LIKE '%braxton%'"
  );
  const info = await stmt.all();
  /*  db.close(); */
};

/* sort by artist, createdon, title genre */

const allTracksByScroll = (offsetNum) => {
  const stmt = db.prepare(
    `SELECT * FROM tracks ORDER BY createdon LIMIT 50 OFFSET ${offsetNum * 50}`
  );
  return stmt.all();
};

const allTracksBySearchTerm = (offsetNum, text) => {
  const term = `%${text}%`;
  const stmt = db.prepare(
    `SELECT * FROM tracks WHERE audiofile LIKE ? LIMIT 50 OFFSET ${offsetNum * 50}`
  );
  return stmt.all(term);
};

const allAlbumsByScroll = (offsetNum) => {
  const stmt = db.prepare(`SELECT * FROM albums LIMIT 50 OFFSET ${offsetNum * 50}`);
  return stmt.all();
};

const allAlbumsBySearchTerm = (offsetNum, text) => {
  const term = `%${text}%`;
  const stmt = db.prepare(
    `SELECT * FROM albums WHERE fullpath LIKE ? LIMIT 50 OFFSET ${offsetNum * 50}`
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

export {
  createTable,
  insertFiles,
  insertAlbums,
  deleteAlbums,
  deleteFiles,
  getAlbums,
  getFiles,
  allTracksByScroll,
  allTracksBySearchTerm,
  allAlbumsByScroll,
  allAlbumsBySearchTerm,
  requestedFile,
  filesByAlbum
};
