const embedImage = (savedImage, file) => {
  console.log('savedImage: ', savedImage, file);
  try {
    const pic = Picture.fromPath(savedImage);
    const myFile = File.createFromPath(file);
    console.log('pic: ', pic);
    myFile.tag.pictures = [pic];
    myFile.save();
    myFile.dispose();
    return true;
  } catch (err) {
    console.error(err);
    return err.message;
  }
};

const downloadFile = async (fileUrl, savePath) => {
  try {
    const response = await axios.get(fileUrl, {
      responseType: 'arraybuffer',
      headers: {
        'User-Agent': 'musicplayer-electron/1.0 +https://stuartambient.github.io/musicapp-intro/'
      }
    });

    if (response.status === 200) {
      await fs.promises.writeFile(savePath, response.data);
      console.log('Download complete:', savePath);
      return true;
    } else {
      console.log('Failed to download:', response.status);
      return false;
    }
  } catch (err) {
    console.error('Error during download or save:', err);
    throw new Error(`Error: ${err.message}`);
  }
};

ipcMain.handle('download-tag-image', async (event, ...args) => {
  const [fileUrl, filePath, listType] = args;
  console.log('download-tag-image: ', fileUrl, filePath, listType);
  const extension = path.extname(new URL(fileUrl).pathname);
  const defaultFilename = `cover${extension}`;
  const tempDir = app.getPath('temp');
  const saveTo = path.join(tempDir, defaultFilename);

  const success = await downloadFile(fileUrl, saveTo);
  if (success) {
    const tempFile = saveTo.replace(/\\/g, '/');
    const embedImgTag = embedImage(tempFile, filePath);
    console.log('embedImgTag: ', embedImgTag);
  }
  /*   if (success) event.sender.send('download-completed', 'download successful');
  else event.sender.send('download-failed', 'download failed'); */
});

if (type === 'picture') {
  const fileIndex = id.path.lastIndexOf('/');
  const strEnd = id.path.substring(0, fileIndex);
  template.push(
    {
      label: `Search pictures for ${
        id.artist && id.album ? `${id.artist} - ${id.album}` : `${strEnd}`
      } `,
      click: () => event.sender.send('context-menu-command', id)
    },
    {
      label: 'From folder',
      click: () => event.sender.send('context-menu-command', 'search-folder')
    }
  );
}
