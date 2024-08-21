import { parentPort, workerData, isMainThread } from 'worker_threads';
import path from 'node:path';
import fs from 'node:fs/promises';
import fg from 'fast-glob';
import { getAlbums, getAlbumsNullImg, updateCoversInDatabase } from './workerSql.js';

function normalizePath(p) {
  return p.replace(/\\/g, '/');
}

function escapeSpecialChars(path) {
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
}

async function searchCover(folder) {
  /*   if (folder.startsWith('D:/music/Ghédalia')) {
    const w = await fs.readdir(folder);
    console.log('fs: ', w);
    const z = fg.sync(`${folder}/*`);
    console.log('z: ', z);
  } */
  const files = ['.jpg', '.jpeg', '.png', '.webp'];
  /*  const escapedPath = fg.escapePath(path.normalize(folder));
  console.log('path: ', escapedPath); */
  const escapedPath = escapeSpecialChars(folder);
  /* console.log(escapedPath); */
  //const cover = fg.sync(`${escapedPath}/**/*.{jpg, jpeg, png, webp}`, options);
  /* const cover = fg.sync(`${escapedPath}/*.{jpeg,jpg}`, options); */
  const cover = fg.sync(`${escapedPath}/*`, options);
  /*   console.log('cover: ', cover); */
  if (cover.length > 0) {
    const filtered = cover.filter((cvr) => checkFile(cvr));
    if (!filtered[0]) return;
    return filtered[0];
  }
  return;
}

const updateCoversLink = async () => {
  console.log('updateCoversLink');
  const foundCovers = [];
  const allAlbumsRootFolder = await getAlbumsNullImg();
  console.log('length: ', allAlbumsRootFolder.length);

  const covers = await Promise.all(
    allAlbumsRootFolder.map(async (folder) => ({
      fullpath: folder.fullpath,
      img: await searchCover(folder.fullpath)
    }))
  );

  const coversFiltered = covers.filter((cvr) => cvr.img !== undefined);

  const processedCovers = updateCoversInDatabase(coversFiltered);
  return processedCovers;
  /*   covers.forEach((cover) => console.log(cover)); */

  /*   for (const albumRoot of allAlbumsRootFolder) {
    console.log('Original path:', albumRoot.fullpath);

    const escapedPattern = escapeSpecialChars(albumRoot.fullpath); // Make sure this function preserves forward slashes
    console.log('Escaped pattern:', escapedPattern);

    const pattern = `${escapedPattern}/*.{jpg,jpeg,png,webp}`;
    console.log('Final glob pattern:', pattern);

    const options = {
      dot: true,
      onlyFiles: true
    };

    try {
      const covers = await fg(pattern, options);
      if (covers && covers.length > 0) {
        console.log('Found covers:', covers);
        foundCovers.push(...covers);
      } else {
        console.log('No covers found for:', albumRoot.fullpath);
      }
    } catch (e) {
      console.error('Error during fg execution:', e.message);
      console.log('Pattern causing the error:', pattern);
    }
  } */

  /* console.log('All found covers:', foundCovers); */
  /*  const processedCovers = updateCoversInDatabase(foundCovers);
  return processedCovers; */
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
