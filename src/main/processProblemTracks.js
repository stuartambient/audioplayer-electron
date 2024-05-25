/* import fs from 'node:fs/promises'; */
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

/* const execAsync = promisify(exec);
const renameAsync = promisify(fs.rename); */

async function processFile(filePath) {
  const fileDir = path.dirname(filePath);
  const fileExt = path.extname(filePath);
  const fileName = path.basename(filePath, fileExt);
  const tempFilePath = path.join(fileDir, `${fileName}_temp${fileExt}`);

  const command = `ffmpeg -hide_banner -loglevel error -i "${filePath}" -c copy "${tempFilePath}"`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return;
    }
    console.log(`stdout: ${stdout}`);
    console.error(`stderr: ${stderr}`);
  });

  //console.log(`Running command: ${command}`);
  /*   try {
    const { stderr } = await execAsync(command);
    if (stderr) {
      console.error(`Error processing ${filePath}: ${stderr}`);
      fs.appendFileSync('error_log.txt', `Error processing ${filePath}: ${stderr}\n`);
      throw new Error(stderr);
    }
    await renameAsync(tempFilePath, filePath);
    console.log(`Successfully processed and overwritten: ${filePath}`);
  } catch (err) {
    console.error(`Error in processFile for ${filePath}: ${err.message}`);
    fs.unlink(tempFilePath, () => {}); // Clean up temp file
    throw err;
  } */
}

export default processFile;
