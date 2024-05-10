import fs from 'node:fs';
import path from 'node:path';
import { promisify } from 'node:util';
import { finished } from 'node:stream';
import app from 'electron';
/* import { Buffer } from "node:buffer"; */
import { v4 as uuidv4 } from 'uuid';
import { parseFile } from 'music-metadata';
import { File } from 'node-taglib-sharp';
import db from '../connection';
import { roots } from '../../constant/constants';
import { error } from 'node:console';

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
  console.log('writeFile: ', data, filename);
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

const updateMeta = async (files) => {
  const updatedMetadata = [];
  for await (const file of files) {
    let stats = await fs.promises.stat(file.audiofile);
    let modified = stats.mtimeMs;
    const metadata = await parseFile(file.audiofile);
    let { year, title, artist, album, genre, picture } = metadata.common;
    const { lossless, bitrate, sampleRate } = metadata.format;
    updatedMetadata.push({
      afid: file.afid,
      audiofile: file.audiofile,
      modified,
      year,
      title,
      artist,
      album,
      genre: genre ? (genre = genre.join(',')) : null,
      picture: picture ? 1 : null
    });
  }
  return updatedMetadata;
};

const findRoot = (filePath) => {
  for (const root of roots) {
    if (filePath.startsWith(root)) {
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

const parseMeta = async (files) => {
  const filesMetadata = [];
  let index = 0;
  for (const file of files) {
    /* console.log(`Processing ${file} at index ${index}`); */
    try {
      const myFile = await File.createFromPath(file);
      const fileStats = await fs.promises.stat(file);
      filesMetadata.push({
        afid: uuidv4(),
        root: findRoot(file),
        file: file,
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
        dateTagged: checkDataType(myFile.tag.dateTagged),
        disc: checkDataType(myFile.tag.disc),
        discCount: checkDataType(myFile.tag.discCount),
        description: checkDataType(myFile.tag.description),
        duration: checkDataType(myFile.properties.durationMilliseconds),
        genre: checkDataType(myFile.tag.genres),
        isCompilation: checkDataType(myFile.tag.isCompilation),
        isrc: checkDataType(myFile.tag.isrc),
        lyrics: checkDataType(myFile.tag.lyrics),
        performers: checkDataType(myFile.tag.performers),
        performersRole: checkDataType(myFile.tag.performersRole),
        pictures: myFile.tag.pictures ? 1 : 0,
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
      /*     db.prepare('INSERT INTO audio_track_errors (file_path, error_message) VALUES (?, ?)').run(
        file,
        error.toString()
      ); */
      filesMetadata.push({
        afid: uuidv4(),
        root: findRoot(file),
        file: file,
        modified: null,
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
        dateTagged: null,
        disc: null,
        discCount: null,
        description: null,
        duration: null,
        genre: null,
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
    index++;
  }
  return filesMetadata;
};

export { parseMeta, writeFile, updateMeta, convertToUTC };
