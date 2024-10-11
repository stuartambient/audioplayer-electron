import fs from 'node:fs';
import { promisify } from 'node:util';
import { finished } from 'node:stream';
import path from 'node:path';
import { parentPort, workerData } from 'worker_threads';
import { v4 as uuidv4 } from 'uuid';
import { File } from 'node-taglib-sharp';
import Database from 'better-sqlite3';

const streamFinished = promisify(finished);

const convertToUTC = (milliseconds) => {
  const date = new Date(milliseconds);

  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();

  // Format the date/time string
  const formattedDate = `${year}-${month.toString().padStart(2, '0')}-${day
    .toString()
    .padStart(2, '0')}`;
  const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes
    .toString()
    .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  return ` ${formattedDate} -- ${formattedTime}`;
};

const writeFile = async (data, filename) => {
  const writer = fs.createWriteStream(filename, { flags: 'a' });
  writer.write(data.join('\n') + '\n'); // Join the array and write it at once
  writer.end();

  try {
    await streamFinished(writer); // Wait for the stream to finish
  } catch (error) {
    console.error('Stream failed to finish:', error);
    throw error;
  }
};

const findRoot = (file) => {
  for (const root of newestRoots) {
    if (file.startsWith(root)) {
      return root;
    }
  }
  return 'No root found';
};

export { writeFile, convertToUTC };
