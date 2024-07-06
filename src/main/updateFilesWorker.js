import { parentPort } from 'worker_threads';
import fg from 'fast-glob';
import { parseMeta } from './utility/index.js';
import { v4 as uuidv4 } from 'uuid';
import {
  roots,
  playlistExtensions,
  audioExtensions,
  fileExtensions
} from '../constant/constants.js';
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
    try {
      const parsed = await parseMeta(newEntries, 'new');
      const message = await insertFiles(parsed);
      if (message) {
        status.new = newEntries; // Update status only if the insertion was successful
        console.log('Insertion successful!');
      } else {
        console.error('Insertion failed with message:', message);
      }
    } catch (error) {
      console.error('Error in processing new entries:', error);
    }
  }

  if (missingEntries.length > 0) {
    try {
      deleteFiles(missingEntries);
      status.deleted = missingEntries;
    } catch (error) {
      console.error('Error in deleting missing entries:', error);
    }
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
  try {
    const entries = await fg(escapedPatterns, {
      caseSensitiveMatch: false,
      suppressErrors: true
    });
    return entries;
  } catch (e) {
    console.error('fg error: ', e.message);
    return [];
  }
};

const runFiles = async (roots, cb) => {
  console.log('roots: ', roots);
  const patterns = roots.map((root) => `${root}/**/*.${fileExtensions}`);
  try {
    const allfiles = await glob(patterns);
    const result = await compareDbRecords(allfiles);
    cb(result);
  } catch (error) {
    console.error('Error in runFiles:', error);
    cb({ error: error.message });
  }
};

// Function to run the task
const processFiles = async () => {
  return new Promise((resolve, reject) => {
    runFiles(roots, (result) => {
      if (result.error) {
        reject(result.error);
      } else {
        resolve(result);
      }
    });
  });
};

// Listen for messages from the main thread
parentPort.on('message', async () => {
  try {
    const result = await processFiles();
    parentPort.postMessage({ result });
  } catch (error) {
    parentPort.postMessage({ error: error.message });
  }
});
