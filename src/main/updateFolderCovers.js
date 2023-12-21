import { promises as fsPromises } from 'node:fs';

const checkDirs = async (root, results) => {
  const firstLevel = await fsPromises.readdir(root);
  for await (const f of firstLevel) {
    try {
      const entries = await fsPromises.readdir(`${root}/${f}`);
      const isCover = entries.find((img) => /\.(jpe?g|png|webp)$/i.test(img));

      if (!isCover) {
        let tmp = { path: `${root}/${f}`, folder: f };
        results.push(tmp);
      }
    } catch (error) {
      console.error(error.message);
    }
  }
  return Promise.resolve(results);
};

const dirs = [
  /* 'J:/S_Music', */
  'F:/Music',
  'D:/Music',
  'D:/G_MUSIC',
  'H:/Music',
  /* 'I:/Music', */
  'E:/music'
];

const run = async (cb) => {
  const results = [];
  for await (const dir of dirs) {
    const resarr = await checkDirs(dir, results);
    results.concat(resarr);
  }

  /*   results.forEach((r) => {
    setTimeout(() => console.log(r));
  }); */

  return cb(results);
};

const initCovers = async () => {
  return new Promise((res, rej) => {
    run((result) => res(result));
  });
};

export default initCovers;
