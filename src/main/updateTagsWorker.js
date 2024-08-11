import { parentPort, workerData } from 'worker_threads';
import path from 'node:path';
import process from 'node:process';
import Database from 'better-sqlite3';
import updateTags from './updateTags';
import { parseMeta } from './utility';

const mode = import.meta.env.MODE;
const dbPath =
  mode === 'development'
    ? path.join(process.cwd(), import.meta.env.MAIN_VITE_DB_PATH_DEV)
    : path.join(workerData.workerPath, 'music.db');

const db = new Database(dbPath);

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
async function func1(data) {
  // Simulate a task
  return new Promise((resolve, reject) => {
    try {
      const updateTagsResult = updateTags(data);
      /* console.log('tags result: ', updateTagsResult); */
      const updatedArray = data.filter(
        (obj) => !updateTagsResult.errors.find((e) => e.track_id === obj.track_id)
      );
      /* console.log('updatedArray = ', updatedArray); */
      resolve(updatedArray); // Assuming updateTags is synchronous. Adjust if it's asynchronous.
    } catch (error) {
      reject(error);
    }
  });
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
