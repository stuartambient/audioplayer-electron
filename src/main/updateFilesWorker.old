import { parentPort, workerData } from 'worker_threads';
import fg from 'fast-glob';
import { parseMeta } from './utility/index.js';
import { v4 as uuidv4 } from 'uuid';
import {
  roots,
  playlistExtensions,
  audioExtensions,
  fileExtensions
} from '../constant/constants.js';

/* import workerTrigger from './workerTrigger.js'; */
import { getFiles, insertFiles, deleteFiles } from './sql.js';

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
    suppressErrors: true
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
const processFiles = async () => {
  return new Promise((resolve, reject) => {
    runFiles(roots, (result) => resolve(result));
  });
};

// Listen for messages from the main thread
parentPort.on('message', async (/* message */) => {
  // if (message === 'start') {
  try {
    const result = await processFiles();
    parentPort.postMessage({ result });
  } catch (error) {
    parentPort.postMessage({ error: error.message });
  }
  // }
});
