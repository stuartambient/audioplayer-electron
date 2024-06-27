import fs from 'fs';
import { allTracks, refreshMetadata, checkRecordsExist } from './sql.js';
import { parseMeta } from './utility';
import workerTrigger from './wokerTrigger.js';

const run = async (cb) => {
  let status = { deleted: '', new: '', nochange: false };
  const updatedTracks = [];
  const result = await allTracks();

  for await (const r of result) {
    if (!r) return;
    const stats = await fs.promises.stat(r.audiotrack);
    const lastModified = stats.mtimeMs;
    if (lastModified > r.modified) {
      updatedTracks.push(r /* .audiotrack */);
    }
  }
  if (!updatedTracks.length) {
    status.nochange = true;
    return Promise.resolve(cb(status));
  }
  /* await parseMeta(updatedTracks).then((parsed) => triggerInsert(parsed)); */
  const updatedMeta = await parseMeta(updatedTracks, 'mod');
  /* Promise.resolve(await refreshMetadata(updatedMeta)).then((response) => cb(updatedMeta)); */
  console.log('updatedMeta: ', updatedTracks);
  Promise.resolve(await workerTrigger(updatedMeta, 'refreshMetadata'))
    .then((message) => {
      if (message) {
        console.log('Update successful!');
      } else {
        console.log('Update failed with message: ', message);
      }
    })
    .then(() => (status.new = updatedMeta.map((f) => f.audiotrack)))
    .catch((error) => {
      console.error('Error in processing:', error);
    })
    .then(() => cb(status));
};

const initUpdateMetadata = async () => {
  return new Promise((res, rej) => {
    run((result) => res(result));
  });
};

export default initUpdateMetadata;
