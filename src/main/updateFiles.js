/* import fs from 'node:fs'; */
import path from 'node:path';
import fg from 'fast-glob';
import { parseMeta } from './utility/index.js';
import { v4 as uuidv4 } from 'uuid';
import {
  roots,
  playlistExtensions,
  audioExtensions,
  fileExtensions
} from '../constant/constants.js';
import { workerData } from 'worker_threads';
import createWorker from './databaseWorker?nodeWorker';
import { getFiles, insertFiles, deleteFiles } from './sql.js';

const difference = (setA, setB) => {
  const _difference = new Set(setA);
  for (const elem of setB) {
    _difference.delete(elem);
  }
  return _difference;
};

/* const triggerInsert = (parsed) => {
  createWorker({ workerData: { id: 'insertFiles', functionName: 'insertFiles', params: parsed } })
    .on('message', (message) => {
      console.log(`Message from worker: ${message}`);
    })
    .postMessage('');
};
 */
const triggerInsert = (parsed) => {
  return new Promise((resolve, reject) => {
    createWorker({ workerData: { id: 'insertFiles', functionName: 'insertFiles', params: parsed } })
      .on('message', (message) => {
        resolve(message); // Resolve the promise with the message from the worker
      })
      .on('error', (err) => {
        console.error('Worker error:', err);
        reject(err); // Reject the promise on error
      })
      .postMessage('');
  });
};

const compareDbRecords = async (files) => {
  const status = { new: '', deleted: '', nochange: false };
  const dbFiles = getFiles();
  /* const dbAll = dbFiles.map((d) => d.audiofile); */
  const dbAll = dbFiles.map((d) => d.audiotrack);

  const allfiles = new Set(files);
  const dbentries = new Set(dbAll);

  const newEntries = Array.from(difference(allfiles, dbentries));
  const missingEntries = Array.from(difference(dbentries, allfiles));
  /*  console.log(files.length); */

  if (newEntries.length > 0) {
    await parseMeta(newEntries)
      .then((parsed) => triggerInsert(parsed))
      .then((message) => {
        if (message) {
          status.new = newEntries.length; // Update status only if the insertion was successful
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
    status.deleted = missingEntries.length;
  }
  if (!newEntries.length && !missingEntries.length) {
    status.nochange = true;
  }
  return status;
};

const glob = async (patterns) => {
  /* console.log(patterns); */
  const entries = await fg(patterns, {
    caseSensitiveMatch: false,
    suppressErrors: true
  })
    .then((e) => e)
    .catch((e) => console.error('fg error: ', e.message));
  /* compareDbRecords(entries); */
  return entries;
};

const runFiles = async (roots, cb) => {
  const patterns = roots.map((root) => `${root}/**/*.${fileExtensions}`);
  await glob(patterns)
    .catch((e) => console.log('error reading: ', e.message))
    .then((allfiles) => compareDbRecords(allfiles))
    .then((prepared) => cb(prepared));
};

const initFiles = async (req, res) => {
  /* const results = (result) => res.status(200).send({ 'file-update': result });
  runFiles(roots, results); */
  return new Promise((res, rej) => {
    runFiles(roots, (result) => res(result));
  });
};

export default initFiles;
