import fs from 'node:fs/promises';
import path from 'path';
import ffmpeg from 'fluent-ffmpeg';

// Function to process a file with FFmpeg and create a copy
function processFile(filePath) {
  return new Promise((resolve, reject) => {
    const fileDir = path.dirname(filePath);
    const fileExt = path.extname(filePath);
    const fileName = path.basename(filePath, fileExt);
    const copyFilePath = path.join(fileDir, `${fileName}_copy${fileExt}`);

    ffmpeg(filePath)
      .output(copyFilePath)
      .on('end', () => {
        console.log(`Created copy: ${copyFilePath}`);
        resolve();
      })
      .on('error', (err) => {
        console.error(`Error processing ${filePath}:`, err.message);
        reject(err);
      })
      .run();
  });
}

/* async function processFilesInFolder(folderPath) {
  try {
    const files = fs.readdirSync(folderPath);

    for (const file of files) {
      const filePath = path.join(folderPath, file);
      const fileExt = path.extname(file).toLowerCase();

      if (fileExt === '.mp3' || fileExt === '.flac') {
        try {
          await processFile(filePath);
          console.log(`Processed and copied: ${file}`);
        } catch (error) {
          console.error(`Failed to process ${file}:`, error.message);
        }
      } else {
        console.log(`Skipping unsupported file: ${file}`);
      }
    }
  } catch (error) {
    console.error('Error reading folder:', error.message);
  }
}

const folderPath = 'path/to/your/folder';

processFilesInFolder(folderPath); */
