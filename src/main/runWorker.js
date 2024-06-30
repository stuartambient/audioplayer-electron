import createUpdateTagsWorker from './updateTagsWorker?nodeWorker';
import createUpdateFilesWorker from './updateFilesWorker?nodeWorker';

const runWorker = (createWorkerFn, msg) => {
  return new Promise((resolve, reject) => {
    const worker = createWorkerFn(msg);

    // Handle messages from the worker
    worker.on('message', (result) => {
      console.log('Result from worker =====>:', result);
      if (result.error) {
        reject(new Error(result.error));
      } else {
        resolve(result);
      }
    });

    // Handle errors from the worker
    worker.on('error', (err) => {
      console.error('Worker error:', err);
      reject(err);
    });

    // Handle worker exit
    worker.on('exit', (code) => {
      if (code !== 0) {
        console.error(`Worker stopped with exit code ${code}`);
        console.error(error);
        reject(error);
      }
    });

    // Start the worker
    worker.postMessage(msg);
  });
};

export default runWorker;
