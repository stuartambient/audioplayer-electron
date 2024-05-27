/* import fs from 'node:fs/promises'; */
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';

function processFile(filePath) {
  return new Promise((resolve, reject) => {
    const fileDir = path.dirname(filePath);
    const fileExt = path.extname(filePath);
    const fileName = path.basename(filePath, fileExt);
    const copyFilePath = path.join(fileDir, `${fileName}_copy${fileExt}`);
    const command = `ffmpeg -y -hide_banner -loglevel error -i "${filePath}" -c copy "${copyFilePath}"`;

    exec(command, (err, stdout, stderr) => {
      if (err) {
        fs.unlink(copyFilePath, () => {}); // Clean up the copy file on error
        reject(new Error(stderr));
      } else {
        resolve(copyFilePath);
      }
    });
  });
}

export default processFile;
