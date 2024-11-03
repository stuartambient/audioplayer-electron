// Refactored async/await version
protocol.registerStreamProtocol('streaming', async (request, cb) => {
  try {
    const uri = decodeURIComponent(request.url);
    const filePath = capitalizeDriveLetter(uri.replace('streaming://', ''));

    if (!(await checkFileExists(filePath))) {
      return sendError(cb, 404, 'File not found');
    }

    const fileSize = (await fs.promises.stat(filePath)).size;
    const range = request.headers.Range;

    if (range) {
      return handleRangeRequest(filePath, fileSize, range, cb);
    } else {
      return handleFullRequest(filePath, fileSize, cb);
    }
  } catch (err) {
    console.error('Error processing streaming request:', err);
    sendError(cb, 500, 'Internal Server Error');
  }
});

async function checkFileExists(filePath) {
  try {
    await fs.promises.access(filePath, fs.constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

function sendError(cb, statusCode, message) {
  cb({
    statusCode,
    headers: { 'Content-Type': 'text/plain', 'X-Stream-Error': 'true' },
    data: message
  });
}

function handleRangeRequest(filePath, fileSize, range, cb) {
  const parts = range.replace(/bytes=/, '').split('-');
  const start = parseInt(parts[0], 10);
  const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

  if (start >= fileSize || end >= fileSize) {
    console.error('Invalid range request:', range);
    return sendError(cb, 416, 'Requested range not satisfiable');
  }

  const chunksize = end - start + 1;

  const headers = {
    'Content-Range': `bytes ${start}-${end}/${fileSize}`,
    'Accept-Ranges': 'bytes',
    'Content-Length': String(chunksize),
    'Content-Type': 'audio/mpeg'
  };

  cb({
    statusCode: 206,
    headers,
    data: fs.createReadStream(filePath, { start, end }).on('error', (err) => {
      console.error('Stream error:', err);
      sendError(cb, 500, 'Stream failed due to an internal error.');
    })
  });
}

function handleFullRequest(filePath, fileSize, cb) {
  const headers = {
    'Content-Length': String(fileSize),
    'Content-Type': 'audio/mpeg'
  };

  cb({
    statusCode: 200,
    headers,
    data: fs.createReadStream(filePath).on('error', (err) => {
      console.error('Stream error:', err);
      sendError(cb, 500, 'Stream failed due to an internal error.');
    })
  });
}
