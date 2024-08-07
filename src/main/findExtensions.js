/* import fs from 'node:fs'; */
import path from 'node:path';
import fg from 'fast-glob';
import { parseMeta } from './utility/index.js';
import { v4 as uuidv4 } from 'uuid';
import { roots, playlistExtensions } from '../constant/constants.js';
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
  const dbAll = dbFiles.map((d) => d.audiofile);

  const allfiles = new Set(files);
  const dbentries = new Set(dbAll);

  const newEntries = Array.from(difference(allfiles, dbentries));
  const missingEntries = Array.from(difference(dbentries, allfiles));

  if (newEntries.length > 0) {
    await parseMeta(newEntries)
      .then((parsed) => insertFiles(parsed))
      .then(() => (status.new = newEntries));
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

const glob = async (patterns) => {
  const entries = await fg(patterns, { caseSensitiveMatch: false });
  /* compareDbRecords(entries); */
  return entries;
};

const runExtensions = async (roots, cb) => {
  const patterns = roots.map((root) => `${root}/**/*.${playlistExtensions}`);
  await glob(patterns).then((results) => console.log(results));
  /* .then((allfiles) => compareDbRecords(allfiles))
    .then((prepared) => cb(prepared)); */
};

const initExtensions = async (req, res) => {
  /* const results = (result) => res.status(200).send({ 'file-update': result });
  runFiles(roots, results); */
  return new Promise((res, rej) => {
    runExtensions(roots, (result) => res(result));
  });
};

export default initExtensions;
