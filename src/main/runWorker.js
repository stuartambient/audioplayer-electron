import { Worker } from 'worker_threads';
import createUpdateTagsWorker from './updateTagsWorker?nodeWorker';
import createUpdateFilesWorker from './updateFilesWorker?nodeWorker';

const runWorker = (createWorkerFn, msg) => {
  console.log('msg: ', createWorkerFn, '----', msg);
  return new Promise((resolve, reject) => {
    /*   const worker = new Worker(createWorkerFn, { workerData: msg }); */
    const worker = createWorkerFn({ workerData: msg });

    worker.on('message', (result) => {
      console.log('Result from worker =====>:', result);
      if (result.error) {
        reject(new Error(result.error));
      } else {
        resolve(result);
      }
    });

    worker.on('error', (err) => {
      console.error('Worker error:', err);
      reject(err);
    });

    // Handle worker exit
    worker.on('exit', (code) => {
      if (code !== 0) {
        const errorMessage = `Worker stopped with exit code ${code}`;
        console.error(errorMessage);
        reject(new Error(errorMessage));
      }
    });

    worker.postMessage(msg);
  });
};

export default runWorker;
