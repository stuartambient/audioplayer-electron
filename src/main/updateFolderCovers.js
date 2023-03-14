import { promises as fsPromises } from 'node:fs';

const checkDirs = async (root, results) => {
  const firstLevel = await fsPromises.readdir(root);
  firstLevel.forEach(async (f) => {
    const entries = await fsPromises.readdir(`${root}/${f}`);
    const isCover = entries.find(
      (img) => img.endsWith('jpg') || img.endsWith('jpeg') || img.endsWith('png')
    );
    /* if (isCover) console.log(`F:/Music/${f}/${isCover}`); */
    if (!isCover) {
      /*  const [artist, release] = f.split("-");
      let writeData;
      if (!release) {
        writeData = `${root},${artist.trim()}\n`;
      } else {
        writeData = `${root},${artist.trim()},${release.trimStart()}\n`;
      } */
      let tmp = { path: `${root}/${f}`, folder: f };
      results.push(tmp);
      /* console.log(`${root}/${f}`); */

      /*    fsPromises.writeFile(
        "../missing-covers.txt",
         `${root},${artist.trim()},${release}\n`, 
        writeData,
        {
          flag: "a",
          encoding: "utf8",
        }
      ); */
    }
  });
  return Promise.resolve(results);
};

const dirs = [
  'J:S_Music',
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
  cb(results);
};

const initCovers = async () => {
  return new Promise((res, rej) => {
    run((result) => res(result));
  });
};

export default initCovers;
