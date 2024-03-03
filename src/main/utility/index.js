import fs from 'node:fs';
import path from 'node:path';
import app from 'electron';
/* import { Buffer } from "node:buffer"; */
import { v4 as uuidv4 } from 'uuid';
import { parseFile } from 'music-metadata';
import { roots } from '../../constant/constants';
import { error } from 'node:console';

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

const parseMeta = async (files) => {
  const filesWMetadata = [];
  for (const audiofile of files) {
    /*  writeFile(audiofile, './meta-processed.txt'); */
    let root;
    for (const r of roots) {
      if (audiofile.startsWith(r)) {
        root = r;
      }
    }
    const modified = fs.statSync(audiofile).mtimeMs;
    try {
      const metadata = await parseFile(audiofile);
      console.log(
        'format: ',
        metadata.format,
        'common: ',
        metadata.common,
        'trackInfo: ',
        metadata.trackInfo,
        'native: ',
        metadata.native
      );
      let { year, title, artist, album, genre, picture } = metadata.common;
      const { lossless, bitrate, sampleRate } = metadata.format;
      const afid = uuidv4();

      filesWMetadata.push({
        afid,

        audiofile,
        modified,
        extension: path.extname(audiofile),
        year,
        title,
        artist,
        album,
        genre: genre ? (genre = genre.join(',')) : null,
        picture: picture ? 1 : null,
        lossless: lossless === false ? 0 : 1,
        bitrate,
        sampleRate,
        like: 0,
        root
      });
    } catch (err) {
      writeFile(audiofile, './metadataErrors.txt');
      /*    writeFile(
        audiofile,
        `${app.getPath('appData')}/musicplayer-electron/logs/metadataErrors.txt`
      ); */
      /* fs.renameSync(`${audiofile}`, `${audiofile}.bad`); */
      console.error(`${audiofile} -- ${err.message}`);
    }
  }
  return filesWMetadata;
};

export { parseMeta, writeFile, updateMeta, convertToUTC };
