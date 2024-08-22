import path from 'node:path';
import Database from 'better-sqlite3';
import { parentPort, workerData, isMainThread } from 'worker_threads';

const mode = import.meta.env.MODE;
const dbPath =
  mode === 'development'
    ? path.join(process.cwd(), import.meta.env.MAIN_VITE_DB_PATH_DEV)
    : path.join(workerData, 'music.db');

const db = new Database(dbPath);

export const insertAlbums = (data) => {
  const insert = db.prepare(
    'INSERT INTO albums(id, rootlocation, foldername, fullpath, img) VALUES (@id, @root, @name, @fullpath, @img)'
  );

  const insertMany = db.transaction((albums) => {
    for (const a of albums) {
      if (!a.img) {
        a.img = null; // or you could use an empty string ''
      }
      insert.run(a);
    }
  });

  insertMany(data);
};

export const deleteAlbums = async (data) => {
  const deleteA = db.prepare('DELETE FROM albums WHERE fullpath = ?');
  const deleteMany = db.transaction((data) => {
    for (const d of data) deleteA.run(d);
  });
  deleteMany(data);
};

export const getAlbums = () => {
  const getAllAlbums = db.prepare('SELECT fullpath FROM albums');
  const albums = getAllAlbums.all();
  return albums;
};

export const getAlbumsNullImg = () => {
  const getAllAlbums = db.prepare('SELECT fullpath, img FROM albums WHERE img IS NULL');
  const albums = getAllAlbums.all();
  return albums;
};

export const updateCoversInDatabase = (coversArray) => {
  /* coversArray.forEach((cover) => console.log(cover)); */
  const updateStmt = db.prepare(`
      UPDATE albums
      SET img = @img
      WHERE fullpath = @fullpath
    `);
  try {
    const transaction = db.transaction((coversArray) => {
      coversArray.forEach((cover) => {
        if (!cover.img) return;
        updateStmt.run(cover);
      });
    });
    transaction(coversArray);
    return `success with ${coversArray.length} covers`;
  } catch (e) {
    return e.message;
  }

  transaction(coversArray);
};

export const getFiles = () => {
  console.log('getFiles');
  const allFiles = db.prepare('SELECT audiotrack FROM "audio-tracks"');
  const files = allFiles.all();
  return files;
};

export const insertFiles = (files) => {
  const insert = db.prepare(`
    INSERT INTO "audio-tracks"
              (track_id,
               root,
               audiotrack,
               modified,
               like,
               error,
               albumArtists,
               album,
               audioBitrate,
               audioSamplerate,
               bpm,
               codecs,
               composers,
               conductor,
               copyright,
               comment,
               disc,
               discCount,
               description,
               duration,
               genres,
               isCompilation,
               isrc,
               lyrics,
               performers,
               performersRole,
               pictures,
               publisher,
               remixedBy,
               replayGainAlbumGain,
               replayGainAlbumPeak,
               replayGainTrackGain,
               replayGainTrackPeak,
               title,
               track,
               trackCount,
               year)
  VALUES      (@track_id,
               @root,
               @audiotrack,
               @modified,
               @like,
               @error,
               @albumArtists,
               @album,
               @audioBitrate,
               @audioSampleRate,
               @bpm,
               @codecs,
               @composers,
               @conductor,
               @copyright,
               @comment,
               @disc,
               @discCount,
               @description,
               @duration,
               @genres,
               @isCompilation,
               @isrc,
               @lyrics,
               @performers,
               @performersRole,
               @pictures,
               @publisher,
               @remixedBy,
               @replayGainAlbumGain,
               @replayGainAlbumPeak,
               @replayGainTrackGain,
               @replayGainTrackPeak,
               @title,
               @track,
               @trackCount,
               @year) `);

  try {
    const insertMany = db.transaction((files) => {
      for (const f of files) insert.run(f);
    });

    const info = insertMany(files);
    return { success: true, message: 'Files inserted successfully' };
  } catch (error) {
    console.error('Error inserting files:', error);
    return { success: false, message: `Error inserting files: ${error.message}` };
  }
};

export const deleteFiles = (files) => {
  console.log('deleteFiles');
  const deleteFile = db.prepare('DELETE FROM "audio-tracks" WHERE audiotrack = ?');

  const deleteMany = db.transaction((files) => {
    for (const f of files) deleteFile.run(f);
  });

  const info = deleteMany(files);
};
