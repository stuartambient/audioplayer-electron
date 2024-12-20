import fg from 'fast-glob';

function escapeSpecialChars(path) {
  return path.replace(/[\[\]\(\)\{\}\']/g, '\\$&');
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

function searchCover(folder) {
  const files = ['.jpg', '.jpeg', '.png', '.webp'];
  const escapedPath = escapeSpecialChars(folder);
  //const cover = fg.sync(`${escapedPath}/*`, options);
  //const cover = fg.sync(`${escapedPath}/**/*.{jpg,jpeg,png,webp}`, options);
  const cover = fg.sync('**/*.{jpg,jpeg,png,webp,gif}', { cwd: folder });
  if (cover.length > 0) {
    /* const filtered = cover.filter((cvr) => checkFile(cvr));
    if (!filtered[0]) return;
    return filtered[0]; */
    return `${folder}/${cover[0]}`;
  }
}

export default searchCover;
