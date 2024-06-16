import { parentPort, workerData } from 'worker_threads';
import { insertFiles, refreshMetadata } from './sql.js';
import updateTags from './updateTags';

const functions = {
  insertFiles,
  refreshMetadata,
  updateTags // Ensure this function can handle an array of objects as input
};

/* console.log(workerData); */

const port = parentPort;
if (!port) throw new Error('IllegalState');

port.on('message', (msg) => {
  console.log('msg: ', msg);
  const func = functions[workerData.functionName];
  if (func) {
    const result = func(workerData.params);
    port.postMessage(`Function result: ${result.success}`);
  } else {
    port.postMessage('Function not found');
  }
});

/* parentPort.on('message', (data) => {
  console.log('data: ', data); */

/*  try {
    if (functions[functionName]) {
      const result = functions[functionName](params); // Calls insertFiles with an array of objects
      parentPort.postMessage({ id, result });
    } else {
      throw new Error('Function not defined: ' + functionName);
    }
  } catch (error) {
    parentPort.postMessage({ id, error: error.message });
  } */
//});
/* const { parentPort, workerData } = require('worker_threads'); */
/* import { parentPort, workerData } from 'worker_threads';

parentPort.on('message', (message) => {
  console.log(`Worker received message: ${message}`);

  parentPort.postMessage(`Processed data with ${workerData}`);
});
 */
