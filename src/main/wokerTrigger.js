/* const triggerInsert = (parsed, id) => {
  return new Promise((resolve, reject) => {
    createWorker({ workerData: { id: 'insertFiles', functionName: 'insertFiles', params: parsed } })
      .on('message', (message) => {
        resolve(message); // Resolve the promise with the message from the worker
      })
      .on('error', (err) => {
        console.error('Worker error:', err);
        reject(err); // Reject the promise on error
      })
      .postMessage('');
  });
}; */

import createWorker from './databaseWorker?nodeWorker';

const workerTrigger = (data, id) => {
  return new Promise((resolve, reject) => {
    createWorker({ workerData: { id: id, functionName: id, params: data } })
      .on('message', (message) => {
        resolve(message); // Resolve the promise with the message from the worker
      })
      .on('error', (err) => {
        console.error('Worker error:', err);
        reject(err); // Reject the promise on error
      })
      .postMessage('');
  });
};

export default workerTrigger;
