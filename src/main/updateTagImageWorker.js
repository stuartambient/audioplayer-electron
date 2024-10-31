import { parentPort, workerData, isMainThread } from 'worker_threads';
import { Picture, File } from 'node-taglib-sharp';
import path from 'node:path';
import fs from 'node:fs';
import process from 'node:process';
import Database from 'better-sqlite3';
import checkAndRemoveReadOnly from './utility/checkAndRemoveReadOnly';

const mode = import.meta.env.MODE;
const dbPath =
  mode === 'development'
    ? path.join(process.cwd(), import.meta.env.MAIN_VITE_DB_PATH_DEV)
    : path.join(workerData.workerPath, 'music.db');

const db = new Database(dbPath);

const refreshMetadata = (tracks) => {
  const transaction = db.transaction(() => {
    const updateStmt = db.prepare(`
        UPDATE "audio-tracks" SET 
          modified = @modified,
          pictures = @pictures,
        WHERE 
          audiotrack = @audiotrack
        `);

    for (const track of tracks) {
      const info = updateStmt.run({
        modified: track.modified,
        pictures: track.pictures,
        audiotrack: track.audiotrack
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

const parseMeta = async (files) => {
  const filesMetadata = [];

  for (const file of files) {
    try {
      const filePath = file;
      const myFile = await File.createFromPath(filePath);
      const fileStats = await fs.promises.stat(filePath);
      filesMetadata.push({
        audiotrack: filePath /* op === 'new' ? file : file.audiotrack, */,
        modified: fileStats.mtimeMs || null
      });
    } catch (error) {
      console.error(`Error processing file ${file}: ${error.message}`);
      const fileStats = await fs.promises.stat(file);
      filesMetadata.push({
        modified: fileStats.mtimeMs || null,
        pictures: null
      });
    }
  }
  return filesMetadata;
};

const embedImage = async (savedImage, file) => {
  try {
    // Ensure 'file' is an array, even if it's a single string
    const files = Array.isArray(file) ? file : [file];

    for (const filePath of files) {
      const fileWritable = await checkAndRemoveReadOnly(filePath); // Await here to ensure file is writable before proceeding
      if (!fileWritable) return 'file not writable';

      const pic = Picture.fromPath(savedImage);
      const myFile = File.createFromPath(filePath);
      myFile.tag.pictures = [pic];
      myFile.save();
      myFile.dispose();
    }

    // Delete the temp file after embedding the image
    fs.unlinkSync(savedImage);
    console.log('Temp file deleted:', savedImage);

    return file;
  } catch (err) {
    console.error(err);
    return err.message;
  }
};

const processFiles = async (message) => {
  return new Promise((resolve, reject) => {
    embedImage(message.tempFile, message.filePath)
      .then((embedded) => parseMeta(embedded))
      .then((updatedTags) => refreshMetadata(updatedTags))
      .then((result) => resolve(result))
      .catch((error) => reject(error));
  });
};

if (!parentPort) throw Error('IllegalState');
parentPort.on('message', async (message) => {
  try {
    const result = await processFiles(workerData);
    /* const result = addTwoNums(2, 3); */
    parentPort.postMessage({ result });
  } catch (error) {
    parentPort.postMessage({ error: error.message });
  }
});
