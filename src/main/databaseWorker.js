// WORKER SCRIPT
import { parentPort, workerData } from 'worker_threads';
import { insertFiles, refreshMetadata, getUpdatedTracks } from './sql.js';
import updateTags from './updateTags';
import { parseMeta } from './utility/index.js';

const functions = {
  insertFiles,
  refreshMetadata,
  updateTags,
  parseMeta
};

const port = parentPort;
if (!port) throw new Error('IllegalState');

port.on('message', async () => {
  console.log('database worker: ', workerData);
  /* const func = functions[workerData.functionName]; */
  const { functionName, params } = workerData;
  const func = functions[functionName];
  if (func) {
    try {
      const result = await func(params);
      port.postMessage({ success: true, result });
    } catch (error) {
      port.postMessage({ success: false, error: error.message });
    }
  } else {
    port.postMessage({ success: false, error: 'Function not found' });
  }
});
