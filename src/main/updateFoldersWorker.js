import { parentPort, workerData, isMainThread } from 'worker_threads';
import { promises as fsPromises } from 'node:fs';
/* import path from 'node:path'; */
import { v4 as uuidv4 } from 'uuid';
import fg from 'fast-glob';
/* import Database from 'better-sqlite3'; */
import searchCover from './utility/searchCover.js';
import { roots } from '../constant/constants.js';
import { /* roots, */ insertAlbums, deleteAlbums, getAlbums } from './workerSql.js';
console.log(roots);
const [...newroots] = roots;

/* function escapeSpecialChars(path) {
  return path.replace(/[\[\]\(\)\{\}]/g, '\\$&');
}

const options = {
  caseSensitiveMatch: false,
  suppressErrors: true,
  dot: true
};

function checkFile(file) {
  const lc = file.toLowerCase();
  if (lc.endsWith('.jpg') || lc.endsWith('.jpeg') || lc.endsWith('.png') || lc.endsWith('.webp')) {
    return true;
  }
  return false;
} */

/* function searchCover(folder) {
  const files = ['.jpg', '.jpeg', '.png', '.webp'];
  const escapedPath = escapeSpecialChars(folder);
  const cover = fg.sync(`${escapedPath}/*`, options);
  if (cover.length > 0) {
    const filtered = cover.filter((cvr) => checkFile(cvr));
    if (!filtered[0]) return;
    return filtered[0];
  }
  return;
} */

const parseNewEntries = (newEntries) => {
  const newAlbums = [];

  for (const entry of newEntries) {
    console.log('entry: ', entry);
    const id = uuidv4();
    let name, root, fullpath /* , datecreated, datemodified */;

    for (const r of newroots) {
      if (entry.startsWith(r)) {
        const newStr = entry.replace(`${r}/`, '');
        root = r;
        name = newStr;
      }

      fullpath = entry;
    }

    const cover = searchCover(fullpath);

    console.log('cover: ', cover);
    const newAlbum = {
      id,
      root,
      name,
      fullpath
    };

    if (cover) {
      newAlbum.img = cover; // Assuming you only want the first match
    }

    newAlbums.push(newAlbum);
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
      status.new = newEntries.length;
    }
    if (missingEntries.length > 0) {
      deleteAlbums(missingEntries);
      status.deleted = missingEntries.length;
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

if (!parentPort) throw Error('IllegalState');
parentPort.on('message', async (message) => {
  console.log('message: ', message);
  try {
    const result = await initAlbums();
    /* const result = addTwoNums(2, 3); */
    parentPort.postMessage({ result });
  } catch (error) {
    parentPort.postMessage({ error: error.message });
  }
});
