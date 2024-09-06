import { parentPort, workerData, isMainThread } from 'worker_threads';
import path from 'node:path';
import fs from 'node:fs';
import process from 'node:process';
import fg from 'fast-glob';
import Database from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';
import { File } from 'node-taglib-sharp';
import { playlistExtensions, fileExtensions } from '../constant/constants.js';
/* import db from './connection.js'; */
/* import { parseMeta } from './utility/index.js'; */
/* import { newestRoots, getFiles, insertFiles, deleteFiles } from './workerSql.js'; */

const mode = import.meta.env.MODE;
const dbPath =
  mode === 'development'
    ? path.join(process.cwd(), import.meta.env.MAIN_VITE_DB_PATH_DEV)
    : path.join(workerData, 'music.db');

const db = new Database(dbPath);
const createRootsTable = `CREATE TABLE IF NOT EXISTS roots ( id INTEGER PRIMARY KEY AUTOINCREMENT, root TEXT UNIQUE)`;
db.exec(createRootsTable);

let newestRoots;
const getRoots = () => {
  const roots = db.prepare('SELECT root FROM roots');

  newestRoots = roots.all().map((row) => row.root);
};

getRoots();

const findRoot = (file) => {
  for (const root of newestRoots) {
    if (file.startsWith(root)) {
      return root;
    }
  }
  return 'No root found';
};

const checkDataType = (entry) => {
  if (entry === undefined || entry === null) {
    return null;
  } else if (Array.isArray(entry)) {
    return entry.join(', ');
  } else if (typeof entry === 'object' && !Array.isArray(entry)) {
    return Object.values(entry).join(', ');
  } else if (typeof entry === 'string') {
    return entry;
  } else if (typeof entry === 'number') {
    return Number(entry);
  } else if (typeof entry === 'boolean') {
    if (entry === true) return 1;
    return 0;
  }
};

const parseMeta = async (files, op) => {
  console.log('parseMeta: ', files, op);
  const filesMetadata = [];

  for (const file of files) {
    try {
      const filePath = op === 'new' ? file : file.id;
      const myFile = await File.createFromPath(filePath);
      const fileStats = await fs.promises.stat(filePath);
      filesMetadata.push({
        track_id: op === 'new' ? uuidv4() : file.track_id,
        root: findRoot(op === 'new' ? file : file.id),
        audiotrack: filePath /* op === 'new' ? file : file.audiotrack, */,
        modified: fileStats.mtimeMs || null,
        birthtime: fileStats.birthtime.toISOString() || null,
        like: 0,
        error: null,
        albumArtists: checkDataType(myFile.tag.albumArtists),
        album: checkDataType(myFile.tag.album),
        audioBitrate: checkDataType(myFile.properties.audioBitrate),
        audioSampleRate: checkDataType(myFile.properties.audioSampleRate),
        bpm: checkDataType(myFile.tag.beatsPerMinute),
        codecs: checkDataType(myFile.properties.description),
        composers: checkDataType(myFile.tag.composers),
        conductor: checkDataType(myFile.tag.conductor),
        copyright: checkDataType(myFile.tag.copyright),
        comment: checkDataType(myFile.tag.comment),
        disc: checkDataType(myFile.tag.disc),
        discCount: checkDataType(myFile.tag.discCount),
        description: checkDataType(myFile.tag.description),
        duration: checkDataType(myFile.properties.durationMilliseconds),
        genres: checkDataType(myFile.tag.genres),
        isCompilation: checkDataType(myFile.tag.isCompilation),
        isrc: checkDataType(myFile.tag.isrc),
        lyrics: checkDataType(myFile.tag.lyrics),
        performers: checkDataType(myFile.tag.performers),
        performersRole: checkDataType(myFile.tag.performersRole),
        pictures: myFile.tag.pictures?.[0]?.data ? 1 : 0,
        publisher: checkDataType(myFile.tag.publisher),
        remixedBy: checkDataType(myFile.tag.remixedBy),
        replayGainAlbumGain: checkDataType(myFile.tag.replayGainAlbumGain) || null,
        replayGainAlbumPeak: checkDataType(myFile.tag.replayGainAlbumPeak) || null,
        replayGainTrackGain: checkDataType(myFile.tag.replayGainTrackGain) || null,
        replayGainTrackPeak: checkDataType(myFile.tag.replayGainTrackPeak) || null,
        title: checkDataType(myFile.tag.title),
        track: checkDataType(myFile.tag.track),
        trackCount: checkDataType(myFile.tag.trackCount),
        year: checkDataType(myFile.tag.year)
      });
    } catch (error) {
      console.error(`Error processing file ${file}: ${error.message}`);
      const fileStats = await fs.promises.stat(op === 'new' ? file : file.id);
      filesMetadata.push({
        track_id: op === 'new' ? uuidv4() : file.track_id,
        root: findRoot(op === 'new' ? file : file.id),
        audiotrack: op === 'new' ? file : file.id,
        modified: fileStats.mtimeMs || null,
        birthtime: fileStats.birthtime.toISOString() || null,
        like: 0,
        error: error.toString(),
        albumArtists: null,
        album: null,
        audioBitrate: null,
        audioSampleRate: null,
        bpm: null,
        codecs: null,
        composers: null,
        conductor: null,
        copyright: null,
        comment: null,
        disc: null,
        discCount: null,
        description: null,
        duration: null,
        genres: null,
        isCompilation: null,
        isrc: null,
        lyrics: null,
        performers: null,
        performersRole: null,
        pictures: null,
        publisher: null,
        remixedBy: null,
        replayGainAlbumGain: null,
        replayGainAlbumPeak: null,
        replayGainTrackGain: null,
        replayGainTrackPeak: null,
        title: null,
        track: null,
        trackCount: null,
        year: null
      });
    }
  }
  return filesMetadata;
};

const getFiles = () => {
  console.log('getFiles');
  const allFiles = db.prepare('SELECT audiotrack FROM "audio-tracks"');
  const files = allFiles.all();
  return files;
};

const insertFiles = (files) => {
  console.log('insertFiles: ', files);
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
               year,
               birthtime)
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
               @year,
               @birthtime) `);

  try {
    const insertMany = db.transaction((files) => {
      for (const f of files) insert.run(f);
    });

    const info = insertMany(files);
    console.log('info: ', info);
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

const runFiles = async (newestRoots, cb) => {
  console.log('roots: ', newestRoots);
  const patterns = newestRoots.map((root) => `${root}/**/*.${fileExtensions}`);
  await glob(patterns)
    .catch((e) => console.log('error reading: ', e.message))
    .then((allfiles) => compareDbRecords(allfiles))
    .then((prepared) => cb(prepared));
};

// Function to run the task
const processFiles = async (message) => {
  return new Promise((resolve, reject) => {
    runFiles(newestRoots, (result) => resolve(result));
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
