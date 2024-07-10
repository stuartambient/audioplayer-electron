import { parentPort, workerData, isMainThread } from 'worker_threads';

// Send a success message
parentPort.postMessage({ status: 'success' });
