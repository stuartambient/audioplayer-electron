import { parentPort, workerData } from 'worker_threads';
import updateTags from './updateTags';
import { getUpdatedTracks } from './sql';
import { parseMeta } from './utility';
import { refreshMetadata } from './sql';

// Define the sequential functions
async function func1(data) {
  // Simulate a task
  return new Promise((resolve, reject) => {
    try {
      updateTags(data);
      console.log('update tags completed');
      resolve(data); // Assuming updateTags is synchronous. Adjust if it's asynchronous.
    } catch (error) {
      reject(error);
    }
  });
}

async function func2(data) {
  // Simulate a task
  return new Promise((resolve) => {
    const updatedTracks = data.map((updatedTrack) => updatedTrack.id);
    console.log('array completed');
    resolve(updatedTracks);
  });
}

async function func3(input) {
  return new Promise((resolve, reject) => {
    try {
      const updatedMetadataTracks = getUpdatedTracks(input);
      console.log('getUpdatedTracks completed');
      resolve(updatedMetadataTracks);
    } catch (error) {
      reject(error);
    }
  });
}

async function func4(input) {
  return new Promise((resolve, reject) => {
    try {
      const updatedMeta = parseMeta(input, 'mod');
      console.log('parseMeta completed');
      resolve(updatedMeta);
    } catch (error) {
      reject(error);
    }
  });
}

async function func5(input) {
  return new Promise((resolve, reject) => {
    try {
      const updateMessage = refreshMetadata(input);
      console.log('refreshMetadata completed');
      resolve(updateMessage);
    } catch (error) {
      reject(error);
    }
  });
}

// Run the functions sequentially
async function runSequentially(originalData) {
  const result1 = await func1(originalData);
  const result2 = await func2(originalData);
  const result3 = await func3(result2);
  const result4 = await func4(result3);
  const result5 = await func5(result4);
  return result5;
}

// Listen for messages from the main thread
parentPort.on('message', async (message) => {
  if (message) {
    try {
      const finalResult = await runSequentially(message.data);
      parentPort.postMessage(finalResult);
    } catch (error) {
      parentPort.postMessage({ error: error.message });
    }
  }
});
