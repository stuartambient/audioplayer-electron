import { promises as fsPromises } from 'node:fs';

const checkDirs = async (root, results) => {
  const firstLevel = await fsPromises.readdir(root);
  for await (const f of firstLevel) {
    /* firstLevel.forEach(async (f) => { */
    const entries = await fsPromises.readdir(`${root}/${f}`);
    const isCover = entries.find(
      (img) =>
        img.endsWith('.jpg') ||
        img.endsWith('.JPG') ||
        img.endsWith('.jpeg') ||
        img.endsWith('.JPEG') ||
        img.endsWith('.png') ||
        img.endsWith('.PNG') ||
        img.endsWith('.webp')
    );
    if (!isCover) {
      let tmp = { path: `${root}/${f}`, folder: f };
      results.push(tmp);
    }
  }
  return Promise.resolve(results.length);
  /*  return results; */
};

const dirs = [
  'J:/S_Music',
  'F:/Music',
  'D:/Music',
  'D:/G_MUSIC',
  'H:/Top/Music',
  'I:/Music',
  'E:/music'
];

const run = async (cb) => {
  const results = [];
  for await (const dir of dirs) {
    const resarr = await checkDirs(dir, results);
    results.concat(resarr);
  }
  return cb(results);
};

const initCovers = async () => {
  return new Promise((res, rej) => {
    run((result) => res(result));
  });
};

export default initCovers;
