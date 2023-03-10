import fs from 'node:fs';
import path from 'node:path';
import app from 'electron';
/* import { Buffer } from "node:buffer"; */
import { v4 as uuidv4 } from 'uuid';
import { parseFile } from 'music-metadata';
import { roots } from '../../constant/constants';
import { error } from 'node:console';

/* const writeFile = async (data, filename) => {
  const writer = fs.createWriteStream(filename, { flags: 'a' });
  writer.on('error', (err) => {
    console.log(err);
  });
  await writer.write(data + '\n');
  writer.end();
}; */

const writeFile = async (data, filename) => {
  fs.writeFileSync(filename, data, { flag: 'a', encoding: 'utf8' });
};

const parseMeta = async (files) => {
  const filesWMetadata = [];
  for (const audiofile of files) {
    let root;
    for (const r of roots) {
      if (audiofile.startsWith(r)) {
        root = r;
      }
    }
    const modified = fs.statSync(audiofile).mtimeMs;
    try {
      const metadata = await parseFile(audiofile);
      let { year, title, artist, album, genre /*  picture */ } = metadata.common;
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
        /*         picture: picture ? (picture = picture[0].data) : null, */
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
      fs.renameSync(`${audiofile}`, `${audiofile}.bad`);
      console.error(err);
    }
  }
  return filesWMetadata;
};

export { parseMeta, writeFile };
