import { promises as fsPromises } from 'node:fs';
import { v4 as uuidv4 } from 'uuid';
import { roots } from '../constant/constants.js';
import { insertAlbums, deleteAlbums, getAlbums } from './sql.js';
const [...newroots] = roots;

const parseNewEntries = (newEntries) => {
  const newAlbums = [];

  for (const entry of newEntries) {
    const id = uuidv4();
    let name, root, fullpath /* , datecreated, datemodified */;

    for (const r of newroots) {
      if (entry.startsWith(r)) {
        const newStr = entry.replace(`${r}/`, '');
        root = r;
        name = newStr;
      }
      /*       datecreated = Date();
      datemodified = Date(); */
      fullpath = entry;
    }
    newAlbums.push({ id, root, name, fullpath /* , datecreated, datemodified */ });
  }
  return newAlbums;
};

const difference = (setA, setB) => {
  const _difference = new Set(setA);
  for (const elem of setB) {
    _difference.delete(elem);
  }
  return _difference;
};

const checkAgainstEntries = (data) => {
  return new Promise((resolve, reject) => {
    let status = { deleted: '', new: '', nochange: false };
    const dbAlbums = getAlbums();
    const dbAlbumsFullpath = dbAlbums.map((album) => album.fullpath);

    const allAlbums = new Set(data);
    const dbEntries = new Set(dbAlbumsFullpath);

    const newEntries = Array.from(difference(allAlbums, dbEntries));
    const missingEntries = Array.from(difference(dbEntries, allAlbums));

    if (newEntries.length > 0) {
      insertAlbums(parseNewEntries(newEntries));
      status.new = newEntries;
    }
    if (missingEntries.length > 0) {
      deleteAlbums(missingEntries);
      status.deleted = missingEntries;
    }
    if (!newEntries.length && !missingEntries.length) {
      status.nochange = true;
    }
    return resolve(status);
  });
};

const topDirs = async (root) => {
  const entries = await fsPromises.readdir(root);
  return entries.map((entry) => `${root}/${entry}`);
};

const run = async (cb) => {
  let dirs = [];

  for (const root of roots) {
    const tmp = await topDirs(root);
    dirs = [...dirs, ...tmp];
  }
  Promise.resolve(checkAgainstEntries(dirs)).then((response) => cb(response));
  /* return cb(dirs) */
};

const initAlbums = async () => {
  /* run((result) => res.status(200).send({ 'album-update': result })) */
  return new Promise((res, rej) => {
    run((result) => res(result));
  });
};

export default initAlbums;
