import fs from 'fs';
import { allTracks, refreshMetadata } from './sql.js';
import { updateMeta } from './utility';

const run = async (cb) => {
  const updatedTracks = [];
  const result = await allTracks();

  for (const r of result) {
    if (fs.statSync(r.audiofile).mtimeMs > r.modified) {
      updatedTracks.push(r);
    }
  }
  if (!updatedTracks.length) {
    return Promise.resolve(cb('no updated needed'));
  }

  const updatedMeta = await updateMeta(updatedTracks);
  Promise.resolve(await refreshMetadata(updatedMeta)).then((response) =>
    cb({ response: response, changed: updatedMeta })
  );
};

const initUpdateMetadata = async () => {
  return new Promise((res, rej) => {
    run((result) => res(result));
  });
};

export default initUpdateMetadata;
