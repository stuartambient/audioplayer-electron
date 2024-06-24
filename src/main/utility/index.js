import fs from 'node:fs';
import { promisify } from 'node:util';
import { finished } from 'node:stream';
import { v4 as uuidv4 } from 'uuid';
import { File } from 'node-taglib-sharp';
import db from '../connection';
import { roots } from '../../constant/constants';
import processFile from '../processProblemTracks';

const streamFinished = promisify(finished);

const convertToUTC = (milliseconds) => {
  const date = new Date(milliseconds);

  // Get the individual components of the date/time
  const year = date.getFullYear();
  const month = date.getMonth() + 1; // Note: Month starts from 0
  const day = date.getDate();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();

  // Format the date/time string
  const formattedDate = `${year}-${month.toString().padStart(2, '0')}-${day
    .toString()
    .padStart(2, '0')}`;
  const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes
    .toString()
    .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  return ` ${formattedDate} -- ${formattedTime}`;

  /* console.log(`Date: ${formattedDate}`);
  console.log(`Time: ${formattedTime}`); */
};

/* const streamFinished = util.promisify(require('stream').finished);

const writeFile = async (data, filename) => {
  return new Promise((resolve, reject) => {
    const writer = fs.createWriteStream(filename, { flags: 'a' });
    writer.on('error', (err) => {
      reject(err);
    });
    writer.on('finish', () => {
      resolve();
    });
    writer.write(data + '\n', () => {
      writer.end();
    });
  });
}; */

const writeFile = async (data, filename) => {
  //const fullpath = path.join(updatesFolder, filename);
  const writer = fs.createWriteStream(filename, { flags: 'a' });
  writer.write(data.join('\n') + '\n'); // Join the array and write it at once
  writer.end();

  try {
    await streamFinished(writer); // Wait for the stream to finish
  } catch (error) {
    console.error('Stream failed to finish:', error);
    throw error;
  }
};

const findRoot = (file) => {
  for (const root of roots) {
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

/* const extractMetadata = async (file, op) => {
  const filePath = op === 'new' ? file : file.audiotrack;
  const myFile = await File.createFromPath(filePath);
  const fileStats = await fs.promises.stat(filePath);

  return {
    track_id: op === 'new' ? uuidv4() : file.track_id,
    root: findRoot(filePath),
    audiotrack: filePath,
    modified: fileStats.mtimeMs || null,
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
  };
}; */

// Function to parse metadata and handle errors with processFile integration
/* const parseMeta = async (files, op) => {
  const filesMetadata = [];
  for (const file of files) {
    const filePath = op === 'new' ? file : file.audiotrack;
    console.log(`Processing file: ${filePath}`);
    try {
      const metadata = await extractMetadata(file, op);
      filesMetadata.push(metadata);
      console.log(`Metadata extracted for file: ${filePath}`);
    } catch (error) {
      console.error(`Error extracting metadata for file ${filePath}: ${error.message}`);
      try {
        console.log(`Attempting to repair file with FFmpeg: ${filePath}`);
        await processFile(filePath);
        console.log(`Successfully repaired file ${filePath} with FFmpeg`);
        const metadata = await extractMetadata(file, op);
        filesMetadata.push(metadata);
        console.log(`Metadata re-extracted for repaired file: ${filePath}`);
      } catch (processError) {
        console.error(`Error repairing file ${filePath} with FFmpeg: ${processError.message}`);
        const fileStats = await fs.promises.stat(filePath);
        filesMetadata.push({
          track_id: op === 'new' ? uuidv4() : file.track_id,
          root: findRoot(filePath),
          audiotrack: filePath,
          modified: fileStats.mtimeMs || null,
          like: 0,
          error: processError.toString(),
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
  }
  return filesMetadata;
}; */

const parseMeta = async (files, op) => {
  const filesMetadata = [];

  for (const file of files) {
    try {
      const filePath = op === 'new' ? file : file.audiotrack;
      console.log('filePath: ', filePath);
      const myFile = await File.createFromPath(filePath);
      const fileStats = await fs.promises.stat(filePath);
      filesMetadata.push({
        track_id: op === 'new' ? uuidv4() : file.track_id,
        root: findRoot(op === 'new' ? file : file.audiotrack),
        audiotrack: filePath /* op === 'new' ? file : file.audiotrack, */,
        modified: fileStats.mtimeMs || null,
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
      const fileStats = await fs.promises.stat(op === 'new' ? file : file.audiotrack);
      filesMetadata.push({
        track_id: op === 'new' ? uuidv4() : file.track_id,
        root: findRoot(op === 'new' ? file : file.audiotrack),
        audiotrack: op === 'new' ? file : file.audiotrack,
        modified: fileStats.mtimeMs || null,
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

export { parseMeta, writeFile, convertToUTC };
