pcMain.handle('download-file', async (event, ...args) => {
  console.log('download-file: ', args);
  const [fileUrl, filePath, listType] = args;

  const extension = path.extname(new URL(fileUrl).pathname);
  const defaultFilename = `cover${extension}`;
  const initialPath = filePath ? path.join(filePath, defaultFilename) : defaultFilename;

  let savePath = await dialog.showSaveDialog({
    title: 'save image',
    defaultPath: initialPath,
    filters: [{ name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp'] }],
    properties: ['showOverwriteConfirmation']
  });

  if (savePath.canceled) {
    console.log('Download canceled by user.');
    return 'User cancelled the download';
  }

  try {
    const response = await axios.get(fileUrl, {
      responseType: 'arraybuffer',
      headers: {
        'User-Agent': 'musicplayer-electron/1.0 +https://stuartambient.github.io/musicapp-intro/'
      }
    });
    if (response.status === 200) {
      await fs.promises.writeFile(savePath.filePath, response.data);
      console.log('Download complete:', savePath.filePath);
      if (listType === 'cover-search-alt-tags') {
        /* */
      }

      return event.sender.send('download-completed', 'download successful');
    } else {
      console.log('Failed to download:', response.status);
      return `Download failed with status: ${response.status}`;
    }
  } catch (err) {
    console.error('Error during download or save:', err);
    return `Error: ${err.message}`;
  }
});
