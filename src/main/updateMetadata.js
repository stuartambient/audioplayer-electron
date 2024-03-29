import fs from 'fs';
import { allTracks, refreshMetadata } from './sql.js';
import { updateMeta } from './utility';

const run = async (cb) => {
  let status = { deleted: '', new: '', nochange: false };
  const updatedTracks = [];
  const result = await allTracks();

  for await (const r of result) {
    if (!r) return;
    const stats = await fs.promises.stat(r.audiofile);
    const lastModified = stats.mtimeMs;
    console.log(lastModified);
    if (lastModified > r.modified) {
      updatedTracks.push(r);
    }
  }
  if (!updatedTracks.length) {
    status.nochange = true;
    return Promise.resolve(cb(status));
  }

  const updatedMeta = await updateMeta(updatedTracks);
  /* Promise.resolve(await refreshMetadata(updatedMeta)).then((response) => cb(updatedMeta)); */
  Promise.resolve(await refreshMetadata(updatedMeta))
    .then(() => (status.new = updatedMeta.map((f) => f.audiofile)))
    .then(() => cb(status));
};

const initUpdateMetadata = async () => {
  return new Promise((res, rej) => {
    run((result) => res(result));
  });
};

export default initUpdateMetadata;
