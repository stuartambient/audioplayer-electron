import { parentPort, workerData, isMainThread } from 'worker_threads';
import path from 'node:path';
import process from 'node:process';
import fg from 'fast-glob';
import Database from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';
import { roots, playlistExtensions, fileExtensions } from '../constant/constants.js';
/* import db from './connection.js'; */
import { parseMeta } from './utility/index.js';
/* import { getFiles, insertFiles, deleteFiles } from './sql.js'; */
console.log('workerData: ', workerData);
const mode = import.meta.env.MODE;
const dbPath =
  mode === 'development'
    ? path.join(process.cwd(), import.meta.env.MAIN_VITE_DB_PATH_DEV)
    : path.join(workerData, 'music.db');

const db = new Database(dbPath);

const getFiles = () => {
  console.log('getFiles');
  const allFiles = db.prepare('SELECT audiotrack FROM "audio-tracks"');
  const files = allFiles.all();
  return files;
};

const insertFiles = (files) => {
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

const deleteFiles = (files) => {
  console.log('deleteFiles');
  const deleteFile = db.prepare('DELETE FROM "audio-tracks" WHERE audiotrack = ?');

  const deleteMany = db.transaction((files) => {
    for (const f of files) deleteFile.run(f);
  });

  const info = deleteMany(files);
};

const difference = (setA, setB) => {
  const _difference = new Set(setA);
  for (const elem of setB) {
    _difference.delete(elem);
  }
  return _difference;
};

const compareDbRecords = async (files) => {
  const status = { new: '', deleted: '', nochange: false };
  const dbFiles = getFiles();
  const dbAll = dbFiles.map((d) => d.audiotrack);

  const allfiles = new Set(files);
  const dbentries = new Set(dbAll);

  const newEntries = Array.from(difference(allfiles, dbentries));
  const missingEntries = Array.from(difference(dbentries, allfiles));

  if (newEntries.length > 0) {
    await parseMeta(newEntries, 'new')
      .then((parsed) => insertFiles(parsed))
      .then((message) => {
        if (message) {
          status.new = newEntries; // Update status only if the insertion was successful
          console.log('Insertion successful!');
        } else {
          console.error('Insertion failed with message:', message);
        }
      })
      .catch((error) => {
        console.error('Error in processing:', error);
      });
  }

  if (missingEntries.length > 0) {
    deleteFiles(missingEntries);
    status.deleted = missingEntries;
  }
  if (!newEntries.length && !missingEntries.length) {
    status.nochange = true;
  }
  return status;
};

function escapeSpecialChars(path) {
  return path.replace(/[\[\]\(\)]/g, '\\$&');
}

const glob = async (patterns) => {
  const escapedPatterns = patterns.map(escapeSpecialChars);
  const entries = await fg(escapedPatterns, {
    caseSensitiveMatch: false,
    suppressErrors: true,
    dot: true
  })
    .then((e) => e)
    .catch((e) => console.error('fg error: ', e.message));

  return entries;
};

const runFiles = async (roots, cb) => {
  console.log('roots: ', roots);
  const patterns = roots.map((root) => `${root}/**/*.${fileExtensions}`);
  await glob(patterns)
    .catch((e) => console.log('error reading: ', e.message))
    .then((allfiles) => compareDbRecords(allfiles))
    .then((prepared) => cb(prepared));
};

// Function to run the task
const processFiles = async (message) => {
  return new Promise((resolve, reject) => {
    runFiles(roots, (result) => resolve(result));
  });
};

const addTwoNums = (a, b) => {
  return a + b;
};

// Listen for messages from the main thread
if (!parentPort) throw Error('IllegalState');
parentPort.on('message', async (message) => {
  console.log('message: ', message);
  try {
    const result = await processFiles(message);
    /* const result = addTwoNums(2, 3); */
    parentPort.postMessage({ result });
  } catch (error) {
    parentPort.postMessage({ error: error.message });
  }
});
