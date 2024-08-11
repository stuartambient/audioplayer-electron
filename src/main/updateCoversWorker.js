import { parentPort, workerData, isMainThread } from 'worker_threads';
import path from 'node:path';

import fg from 'fast-glob';
import { getAlbums, updateCoversInDatabase } from './sql.js';

const updateCoversLink = async () => {
  console.log('updateCoversLink');
  const foundCovers = [];
  const allAlbumsRootFolder = await getAlbums();
  allAlbumsRootFolder.forEach((albumRoot) => {
    /* const normalizedPath = path.posix.normalize(albumRoot.fullpath.replace(/\\/g, '/')); */
    const escapedFullpath = albumRoot.fullpath.replace(/[\[\]\(\)']/g, '\\$&');
    const cover = fg.sync(`${escapedFullpath}/**/*.{jpg, jpeg, png, webp}`, {
      caseSensitiveMatch: false,
      suppressErrors: true,
      dot: true
    });
    if (cover && cover.length > 0) {
      foundCovers.push({ fullpath: albumRoot.fullpath, img: cover[0] });
    }
  });
  const processedCovers = updateCoversInDatabase(foundCovers);
  return processedCovers; // Return the processed result
};

const initCovers = async () => {
  return await updateCoversLink(); // Simply return the result of updateCoversLink
};

if (!parentPort) throw Error('IllegalState');
parentPort.on('message', async (message) => {
  try {
    const result = await initCovers();
    /* const result = addTwoNums(2, 3); */
    parentPort.postMessage({ result });
  } catch (error) {
    parentPort.postMessage({ error: error.message });
  }
});
