import createWorker from './newWorker?nodeWorker';

const runWorker = (msg) => {
  return new Promise((resolve, reject) => {
    console.log('runworker msg: ');
    const worker = createWorker(msg);

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
