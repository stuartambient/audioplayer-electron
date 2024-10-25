import { parentPort, workerData } from 'worker_threads';
import path from 'node:path';
import fs from 'node:fs';
import process from 'node:process';
import Database from 'better-sqlite3';
import updateTags from './updateTags';
import { v4 as uuidv4 } from 'uuid';
import { File } from 'node-taglib-sharp';
/* import { parseMeta } from './utility'; */
console.log('worker path: ', path.join(workerData.workerPath, 'music.db'));
const mode = import.meta.env.MODE;
const dbPath =
  mode === 'development'
    ? path.join(process.cwd(), import.meta.env.MAIN_VITE_DB_PATH_DEV)
    : path.join(workerData.workerPath, 'music.db');

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

const getUpdatedTracks = (tracks) => {
  const placeholders = tracks.map(() => '?').join(', ');
  const stmt = db.prepare(
    `SELECT track_id, audiotrack FROM "audio-tracks" WHERE audiotrack IN (${placeholders})`
  );
  return stmt.all(...tracks);
};

const refreshMetadata = (tracks) => {
  const transaction = db.transaction(() => {
    const updateStmt = db.prepare(`
      UPDATE "audio-tracks" SET 
        root = @root,
        modified = @modified,
        like = @like,
        error = @error,
        albumArtists = @albumArtists,
        album = @album,
        audioBitrate = @audioBitrate,
        audioSampleRate = @audioSampleRate,
        bpm = @bpm,
        codecs = @codecs,
        composers = @composers,
        conductor = @conductor,
        copyright = @copyright,
        comment = @comment,
        disc = @disc,
        discCount = @discCount,
        description = @description,
        duration = @duration,
        genres = @genres,
        isCompilation = @isCompilation,
        isrc = @isrc,
        lyrics = @lyrics,
        performers = @performers,
        performersRole = @performersRole,
        pictures = @pictures,
        publisher = @publisher,
        remixedBy = @remixedBy,
        replayGainAlbumGain = @replayGainAlbumGain,
        replayGainAlbumPeak = @replayGainAlbumPeak,
        replayGainTrackGain = @replayGainTrackGain,
        replayGainTrackPeak = @replayGainTrackPeak,
        title = @title,
        track = @track,
        trackCount = @trackCount,
        year = @year
      WHERE 
        audiotrack = @audiotrack
      `);

    for (const track of tracks) {
      const info = updateStmt.run({
        track_id: track.track_id,
        audiotrack: track.audiotrack,
        root: track.root,
        modified: track.modified,
        like: track.like,
        error: track.error,
        albumArtists: track.albumArtists,
        album: track.album,
        audioBitrate: track.audioBitrate,
        audioSampleRate: track.audioSampleRate,
        bpm: track.bpm,
        codecs: track.codecs,
        composers: track.composers,
        conductor: track.conductor,
        copyright: track.copyright,
        comment: track.comment,
        disc: track.disc,
        discCount: track.discCount,
        description: track.description,
        duration: track.duration,
        genres: track.genres,
        isCompilation: track.isCompilation,
        isrc: track.isrc,
        lyrics: track.lyrics,
        performers: track.performers,
        performersRole: track.performersRole,
        pictures: track.pictures,
        publisher: track.publisher,
        remixedBy: track.remixedBy,
        replayGainAlbumGain: track.replayGainAlbumGain,
        replayGainAlbumPeak: track.replayGainAlbumPeak,
        replayGainTrackGain: track.replayGainTrackGain,
        replayGainTrackPeak: track.replayGainTrackPeak,
        title: track.title,
        track: track.track,
        trackCount: track.trackCount,
        year: track.year
      });
    }
  });
  try {
    transaction();
    return 'Records updated successfully!';
  } catch (error) {
    console.error('Error updating records:', error);
    throw new Error(error);
  }
};

// Define the sequential functions
/* async function func1(data) {
  return new Promise((resolve, reject) => {
    try {
      const updateTagsResult = await updateTags(data);
      const updatedArray = data.filter(
        (obj) => !updateTagsResult.errors.find((e) => e.track_id === obj.track_id)
      );
      resolve(updatedArray); 
    } catch (error) {
      reject(error);
    }
  });
} */

async function func1(data) {
  try {
    const updateTagsResult = await updateTags(data);
    const updatedArray = data.filter(
      (obj) => !updateTagsResult.errors.find((e) => e.track_id === obj.track_id)
    );
    return updatedArray;
  } catch (error) {
    return error;
  }
}

async function func2(input) {
  /* console.log('parseMeta: '); */
  return new Promise((resolve, reject) => {
    try {
      const updatedMeta = parseMeta(input, 'mod');
      resolve(updatedMeta);
    } catch (error) {
      reject(error);
    }
  });
}

async function func3(input) {
  console.log('input: ', input);
  return new Promise((resolve, reject) => {
    try {
      const updateMessage = refreshMetadata(input);
      resolve(updateMessage);
    } catch (error) {
      reject(error);
    }
  });
}

// Run the functions sequentially
async function runSequentially(originalData) {
  console.log('original data: ', originalData);
  const result1 = await func1(originalData);
  const result2 = await func2(result1);
  const result3 = await func3(result2);
  return result3;
}

// Listen for messages from the main thread
parentPort.on('message', async (message) => {
  try {
    const finalResult = await runSequentially(workerData.data);
    parentPort.postMessage(finalResult);
  } catch (error) {
    parentPort.postMessage({ error: error.message });
  }
});
