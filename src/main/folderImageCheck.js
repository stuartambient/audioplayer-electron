import fg from 'fast-glob';
import fs from 'node:fs/promises';

async function convertToBuffer(imagePath) {
  try {
    const data = await fs.readFile(imagePath);

    return data;
  } catch (err) {
    console.error('Error reading the file:', err);
  }
}

function escapeSpecialChars(path) {
  return path.replace(/[\[\]\(\)\{\}]/g, '\\$&');
}

const options = {
  caseSensitiveMatch: false,
  suppressErrors: true,
  dot: true
};

function checkFile(file) {
  const lc = file.toLowerCase();
  if (lc.endsWith('.jpg') || lc.endsWith('.jpeg') || lc.endsWith('.png') || lc.endsWith('.webp')) {
    return true;
  }
  return false;
}

/* async function searchCover(folder) {
  const escapedPath = escapeSpecialChars(folder);

  const cover = await fg(`${escapedPath}/*`, options);

  if (cover.length > 0) {
    const filtered = cover.filter((cvr) => checkFile(cvr));
    if (filtered[0]) {
      return convertToBuffer(filtered[0]);
    }
  } else return;
} */

async function searchCover(folder) {
  // Ensure folders is always an array
  const folders = Array.isArray(folder) ? folder : [folder];

  for (const singleFolder of folders) {
    const escapedPath = escapeSpecialChars(singleFolder);

    const cover = await fg(`${escapedPath}/*`, options);

    if (cover.length > 0) {
      const filtered = cover.filter((cvr) => checkFile(cvr));
      if (filtered[0]) {
        return await convertToBuffer(filtered[0]);
      }
    }
    // Continue to the next folder if no cover is found
  }
  // Return null if no cover is found in any folder
  return null;
}

export default searchCover;
