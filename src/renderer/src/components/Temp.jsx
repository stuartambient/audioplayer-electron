import {
  app,
  shell,
  session,
  BrowserWindow,
  ipcMain,
  Menu,
  webContents,
  dialog,
  net,
  protocol,
  powerMonitor,
  MessageChannelMain
} from 'electron';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import process from 'node:process';
import fs from 'node:fs';
import fg from 'fast-glob';
import checkAndRemoveReadOnly from './utility/checkAndRemoveReadOnly.js';

import { createOrUpdateChildWindow, getWindowNames, getWindow } from './windowManager.js';
import url, { pathToFileURL } from 'url';

import * as stream from 'stream';
import covit from './assets/covit.exe?asset';
import { Worker } from 'worker_threads';
import { Picture, File } from 'node-taglib-sharp';
import transformTags from './transformTags.js';
import createUpdateTagsWorker from './updateTagsWorker?nodeWorker';
import createUpdateFilesWorker from './updateFilesWorker?nodeWorker';
import createUpdateFoldersWorker from './updateFoldersWorker?nodeWorker';
import createUpdateCoversWorker from './updateCoversWorker?nodeWorker';
import createUpdateMetadataWorker from './updateMetadataWorker?nodeWorker';
import createUpdateTagImageWorker from './updateTagImageWorker?nodeWorker';
import axios from 'axios';
import { electronApp, optimizer, is } from '@electron-toolkit/utils';
import { writeFile, convertToUTC /* , parseMeta */ } from './utility/index.js';
import searchCover from './folderImageCheck.js';
import db from './connection.js';

import { getPreferences, savePreferences } from './preferences.js';
import {
  allTracksByScroll,
  allTracksBySearchTerm,
  allAlbumsByScroll,
  allAlbumsBySearchTerm,
  allCoversByScroll,
  allMissingCoversByScroll,
  filesByAlbum,
  requestedFile,
  getAlbums,
  likeTrack,
  isLiked,
  getAlbum,
  getPlaylist,
  getFiles,
  getAllPkeys,
  getAllTracks,
  deleteAlbum,
  allTracks,
  refreshMetadata,
  getUpdatedTracks,
  getRoots,
  updateRoots,
  initializeDatabase
} from './sql.js';

import {
  totalTracks,
  topHundredArtists,
  genresWithCount,
  nullMetadata,
  allTracksByArtist,
  allTracksByGenres,
  distinctDirectories,
  foldersWithCount,
  allTracksByRoot,
  albumsByTopFolder
} from './stats';

import initCovers from './updateFolderCovers';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.disableHardwareAcceleration();

protocol.registerSchemesAsPrivileged([
  {
    scheme: 'streaming',
    privileges: { stream: true, standard: true, bypassCSP: true, supportFetchAPI: true }
  }
]);

protocol.registerSchemesAsPrivileged([
  {
    scheme: 'cover',
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      corsEnabled: true
    }
  }
]);

const updatesFolder = `${app.getPath('documents')}\\ElectronMusicplayer\\updates`;
const metaErrorsFolder = `${app.getPath('documents')}\\ElectronMusicplayer\\metaerrors`;
const playlistsFolder = `${app.getPath('documents')}\\ElectronMusicplayer\\playlists`;
const coversFolder = `${app.getPath('documents')}\\ElectronMusicplayer\\covers`;
const preferences = `${app.getPath('documents')}\\ElectronMusicplayer\\preferences`;
if (!fs.existsSync(updatesFolder)) {
  fs.mkdirSync(updatesFolder);
}
if (!fs.existsSync(metaErrorsFolder)) {
  fs.mkdirSync(metaErrorsFolder);
}
if (!fs.existsSync(playlistsFolder)) {
  fs.mkdirSync(playlistsFolder);
}
if (!fs.existsSync(coversFolder)) {
  fs.mkdirSync(coversFolder);
}

/* RANDOM ARRAY FOR TRACKS SHUFFLE */
let shuffled = new Array();

process.on('unhandledRejection', (err) => {
  console.error('Unhandled promise rejection:', err);
});

const capitalizeDriveLetter = (str) => {
  return `${str.charAt(0).toUpperCase()}:${str.slice(1)}`;
};
export let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    frame: false,
    useContentSize: true,
    transparent: true,
    show: false,
    ...(process.platform === 'linux'
      ? {
          icon: path.join(__dirname, '../../build/icon.png')
        }
      : {}),
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      sandbox: true,
      webSecurity: true,
      contextIsolation: true
      /* nodeIntegration: true */
    }
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: 'deny' };
  });

  ipcMain.on('app-close', (events, args) => {
    mainWindow.close();
  });

  ipcMain.on('minimize', (events, args) => {
    mainWindow.minimize();
  });

  ipcMain.on('maximize', (events, args) => {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.setMaximumSize(4000, 4000);
      mainWindow.maximize();
    }
  });

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(`${process.env['ELECTRON_RENDERER_URL']}/index.html`);
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }
}

const reactDevToolsPath = 'C:/Users/sambi/documents/Devtools2/4.27.1_0';

app.whenReady().then(async () => {
  const createRootsTable = `CREATE TABLE IF NOT EXISTS roots ( id INTEGER PRIMARY KEY AUTOINCREMENT, root TEXT UNIQUE)`;
  db.exec(createRootsTable);

  await session.defaultSession.clearCache(() => {
    console.log('--------> Cache cleared!');
  });
  await session.defaultSession.loadExtension(reactDevToolsPath, { allowFileAccess: true });
  electronApp.setAppUserModelId('com.electron');

  protocol.registerStreamProtocol('streaming', async (request, cb) => {
    try {
      const uri = decodeURIComponent(request.url);
      const filePath = uri.replace('streaming://', '');
      const path = capitalizeDriveLetter(filePath);

      const fileSize = fs.statSync(path).size;
      const range = request.headers.Range;

      if (range) {
        const parts = range.replace(/bytes=/, '').split('-');
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
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
          data: fs.createReadStream(path, { start, end }).on('error', (err) => {
            console.error('Stream error:', err);
            cb({
              statusCode: 200,
              headers: { 'Content-Type': 'text/plain', 'X-Stream-Error': 'true' },
              data: 'Stream failed due to an error.'
            });
          })
        });
      } else {
        console.log('No range header provided');
        cb({
          statusCode: 200,
          headers: {
            'Content-Length': String(fileSize),
            'Content-Type': 'audio/mpeg'
          },
          data: fs.createReadStream(path).on('error', (err) => {
            console.error('Stream error:', err);
            cb({
              statusCode: 200,
              headers: { 'Content-Type': 'text/plain', 'X-Stream-Error': 'true' },
              data: 'Stream failed due to an error.'
            });
          })
        });
      }
    } catch (err) {
      console.error('Error processing streaming request:', err);
      cb({
        statusCode: 200,
        headers: { 'Content-Type': 'text/plain', 'X-Stream-Error': 'true' },
        data: 'Internal Server Error'
      });
    }
  });

  protocol.registerFileProtocol('cover', (request, callback) => {
    let url = decodeURI(request.url.substr(8));

    // If the URL is for a Windows path (e.g., starts with a drive letter), add the colon back after the drive letter
    if (/^[a-zA-Z]\//.test(url)) {
      url = `${url[0]}:${url.slice(1)}`;
    }

    const filePath = path.normalize(url);

    fs.access(filePath, fs.constants.F_OK, (err) => {
      if (err) {
        console.error('File does not exist:', filePath);
        callback({ error: -6 }); // -6 corresponds to FILE_NOT_FOUND
      } else {
        callback({ path: filePath });
      }
    });
  });

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  createWindow();
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
  // Optional: Watch for window shortcuts if needed
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  initializeDatabase();
  mainWindow.show();
  mainWindow.webContents.openDevTools();
});

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

ipcMain.on('toggle-resizable', (event, isResizable) => {
  mainWindow.setResizable(isResizable);
  const [currentWidth, currentHeight] = mainWindow.getSize();
  if (isResizable) {
    mainWindow.setMinimumSize(currentWidth, currentHeight);
  }
});

ipcMain.handle('get-roots', async (event) => {
  const rootFolders = await getRoots();
  return rootFolders;
});

ipcMain.handle('update-roots', async (event, roots) => {
  try {
    const update = await updateRoots(roots);
    return update;
  } catch (error) {
    console.error(error.message);
  }
});

ipcMain.handle('get-folder-path', (event, folderName) => {
  return path.resolve(folderName);
});

ipcMain.handle('update-folders', async (event) => {
  try {
    const workerPath = process.resourcesPath;
    await createUpdateFoldersWorker({
      workerData: workerPath
    })
      .on('message', (message) => {
        console.log('message from worker: ', message);
        mainWindow.webContents.send('folder-update-complete', message.result);
      })
      .on('error', (err) => {
        console.error('Worker error:', err);
      })
      .on('exit', (code) => {
        if (code !== 0) {
          const errorMessage = `Worker stopped with exit code ${code}`;
          console.error(errorMessage);
        }
      })
      .postMessage('');
  } catch (error) {
    console.error('Worker encountered an error:', error);

    console.log('Handling subsequent code after worker error.');
  }
});

function getObjectWithLengths(obj) {
  return {
    new: Array.isArray(obj.new) ? obj.new.length : 0,
    deleted: Array.isArray(obj.deleted) ? obj.deleted.length : 0,
    nochange: obj.nochange
  };
}

ipcMain.handle('update-files', async (event) => {
  const senderWebContents = event.sender;
  const senderWindow = BrowserWindow.fromWebContents(senderWebContents);
  const targetWindow = BrowserWindow.fromId(senderWindow.id);

  try {
    const workerPath = process.resourcesPath;
    await createUpdateFilesWorker({
      workerData: workerPath
    })
      .on('message', (message) => {
        console.log('message from worker: ', message);
        mainWindow.webContents.send('file-update-complete', getObjectWithLengths(message.result));
      })
      .on('error', (err) => {
        console.error('Worker error:', err);
      })
      .on('exit', (code) => {
        if (code !== 0) {
          const errorMessage = `Worker stopped with exit code ${code}`;
          console.error(errorMessage);
        }
      })
      .postMessage('');
  } catch (error) {
    console.error('Worker encountered an error:', error);

    console.log('Handling subsequent code after worker error.');
  }
});

ipcMain.handle('update-meta', async (event) => {
  const senderWebContents = event.sender;
  const senderWindow = BrowserWindow.fromWebContents(senderWebContents);
  const targetWindow = BrowserWindow.fromId(senderWindow.id);

  try {
    const workerPath = process.resourcesPath;
    await createUpdateMetadataWorker({
      workerData: workerPath
    })
      .on('message', (message) => {
        console.log('message from worker: ', message);
        mainWindow.webContents.send('meta-update-complete', getObjectWithLengths(message.result));
      })
      .on('error', (err) => {
        console.error('Worker error:', err);
      })
      .on('exit', (code) => {
        if (code !== 0) {
          const errorMessage = `Worker stopped with exit code ${code}`;
          console.error(errorMessage);
        }
      })
      .postMessage('');
  } catch (error) {
    console.error('Worker encountered an error:', error);
    console.log('Handling subsequent code after worker error.');
  }
});

ipcMain.handle('update-covers', async (event) => {
  console.log('update-covers');
  try {
    const workerPath = process.resourcesPath;
    await createUpdateCoversWorker({
      workerData: workerPath
    })
      .on('message', (message) => {
        console.log('message from worker: ', message);
        mainWindow.webContents.send('cover-update-complete', message.result);
      })
      .on('error', (err) => {
        console.error('Worker error:', err);
      })
      .on('exit', (code) => {
        if (code !== 0) {
          const errorMessage = `Worker stopped with exit code ${code}`;
          console.error(errorMessage);
        }
      })
      .postMessage('');
  } catch (error) {
    console.error('Worker encountered an error:', error);

    console.log('Handling subsequent code after worker error.');
  }
});

ipcMain.handle('get-tracks', async (event, ...args) => {
  if (args[1] === '') {
    const alltracks = await allTracksByScroll(args[0], args[2]);
    return alltracks;
  } else if (args[1]) {
    const alltracks = await allTracksBySearchTerm(args[0], args[1], args[2]);
    return alltracks;
  }
});

ipcMain.handle('get-albums', async (event, ...args) => {
  if (args[1] === '') {
    const allAlbums = await allAlbumsByScroll(args[0], args[2]);
    return allAlbums;
  } else {
    const allAlbums = await allAlbumsBySearchTerm(args[0], args[1], args[2]);
    return allAlbums;
  }
});

ipcMain.handle('get-album', async (_, args) => {
  const album = getAlbum(args);
  return album;
});

ipcMain.handle('get-album-tracks', async (event, args) => {
  const allAlbumTracks = await filesByAlbum(args);
  return allAlbumTracks;
});

const getRoot = (currentDir) => {
  console.log(currentDir);
  const root = getRoots();
  const allPaths = [];
  const paths = path.normalize(currentDir).split(path.sep);
  const pathsStr = paths.join('/');
  const rootFiltered = root.filter((r) => pathsStr.startsWith(r)).join('');
  const sliced = pathsStr.replace(`${rootFiltered}/`, '');
  const split = sliced.split('/');
  const splitLength = split.length;
  if (splitLength > 1) {
    allPaths.push(`${rootFiltered}/${split[0]}`);
    for (let i = splitLength - 1; i > 0; i--) {
      let tmp = `${rootFiltered}/${split[0]}/${split[i]}`;
      if (tmp !== currentDir) {
        allPaths.push(tmp);
      }
    }
  }
  return allPaths;
};

ipcMain.handle('get-cover', async (event, arg) => {
  const trackDirectory = path.dirname(arg);
  const trackRoot = getRoot(trackDirectory);

  const myFile = await File.createFromPath(arg);

  if (myFile.tag.pictures?.[0]?.data) {
    return myFile.tag.pictures[0].data._bytes;
  }

  const folderCover = await searchCover(trackDirectory);
  if (folderCover) {
    console.log('folder cover: ', folderCover);
    return folderCover;
  }

  if (trackRoot.length > 0) {
    const coverResults = await searchCover(trackRoot);
    if (coverResults) {
      console.log('cover results: ', coverResults);
      return coverResults;
    }
    console.log('coverResults: ', coverResults);
  }

  return 0;
});

ipcMain.handle('screen-mode', async (event, ...args) => {
  if (args[0] === 'mini') {
    await mainWindow.setMinimumSize(290, 350);
    await mainWindow.setSize(290, 350, false);
  }
  if (args[0] === 'player-library') {
    await mainWindow.setMinimumSize(660, 500);
    await mainWindow.setSize(660, 500, false);
  }
  if (args[0] === 'player') {
    await mainWindow.setMinimumSize(300, 500);
    await mainWindow.setSize(300, 500, false);
  }
  if (args[0] === 'mini-expanded') {
    await mainWindow.setMinimumSize(380, 610);
    await mainWindow.setSize(380, 610, false);
  }
  if (args[0] === 'default') {
    await mainWindow.setMinimumSize(800, 600);
    await mainWindow.setSize(800, 600, true);
  }
});

ipcMain.handle('update-like', async (event, ...args) => {
  const updateTrackLike = likeTrack(args[0]);
  return true;
});

ipcMain.handle('is-liked', async (event, arg) => {
  const checkIsLiked = await isLiked(arg);
  return checkIsLiked;
});

ipcMain.handle('total-tracks-stat', async () => {
  const totals = await totalTracks();
  const totalCounts = {
    albums: totals.albumsInfo['COUNT(*)'],
    tracks: totals.tracksInfo['COUNT(*)']
  };
  return totalCounts;
});

ipcMain.handle('top-hundred-artists-stat', async () => {
  const topHundred = await topHundredArtists();
  return topHundred.slice(1);
});

async function openWindowAndSendData(queryResults, listType) {
  const targetWindow = await getWindow('table-data');

  if (targetWindow) {
    if (targetWindow.webContents.isLoading()) {
      targetWindow.webContents.once('did-finish-load', () => {
        targetWindow.webContents.send('send-to-child', {
          listType,
          results: queryResults
        });
      });
    } else {
      targetWindow.webContents.send('send-to-child', {
        listType,
        results: queryResults
      });
    }
  } else {
    console.error('Target window not found');
  }
}

ipcMain.handle('get-tracks-by-artist', async (event, artist, listType) => {
  const artistTracks = await allTracksByArtist(artist);
  try {
    await openWindowAndSendData(artistTracks, listType);
  } catch (err) {
    console.error(err.message);
  }
});

ipcMain.handle('distinct-directories', async () => {
  try {
    const dirs = await distinctDirectories();
    return dirs;
  } catch (e) {
    console.log(e.message);
  }
});

ipcMain.handle('get-tracks-by-genre', async (event, genre, listType) => {
  const genreTracks = await allTracksByGenres(genre);
  try {
    await openWindowAndSendData(genreTracks, listType);
  } catch (err) {
    console.error('message: ', err.message);
  }
});

ipcMain.handle('get-tracks-by-root', async (event, root, listType) => {
  const isWindow = await getWindowNames();
  /* if (!) */
  const rootTracks = await allTracksByRoot(root);
  try {
    await openWindowAndSendData(rootTracks, listType);
  } catch (e) {
    console.error(e.message);
  }
});

ipcMain.handle('get-tracks-by-album', async (event, listType, album) => {
  console.log(listType, album);
  try {
    const albumTracks = await filesByAlbum(album);
    if (albumTracks) {
      await openWindowAndSendData(albumTracks, listType);
      return event.sender.send('album-tracks-loaded', 'success');
    } else {
      return 'empty folder . no tracks';
    }
  } catch (e) {
    console.error(e.message);
  }
});

ipcMain.handle('check-for-open-table', async (event, name) => {
  const names = await getWindowNames();
  if (names.includes(name)) {
    return true;
  }
  return false;
});

ipcMain.handle('clear-table', async (event) => {
  const targetWindow = await getWindow('table-data');
  targetWindow.webContents.send('clear-table', 'clear');
});

ipcMain.handle('get-albums-by-root', async (event, dirs) => {
  const results = await albumsByTopFolder(dirs);
  return results;
});

ipcMain.handle('genres-stat', async () => {
  const genres = await genresWithCount();
  return genres;
});

ipcMain.handle('open-playlist', async () => {
  const open = await dialog.showOpenDialog(mainWindow, {
    defaultPath: playlistsFolder,
    properties: ['openFile'],
    filters: [{ name: 'Playlist', extensions: ['m3u'] }]
  });
  if (open.canceled) return 'action cancelled';
  const plfiles = await fs.promises.readFile(open.filePaths.join(), 'utf8');
  const parsedPlFiles = plfiles.replaceAll('\\', '/').split('\n');
  return getPlaylist(parsedPlFiles);
});

ipcMain.handle('save-playlist', async (_, args) => {
  const save = await dialog.showSaveDialog(mainWindow, {
    defaultPath: playlistsFolder,
    filters: [{ name: 'Playlist', extensions: ['m3u'] }]
  });

  if (save.canceled) return 'action cancelled';

  args.forEach((a, index) => {
    const tmp = a.audiotrack.replaceAll('/', '\\');
    if (index === args.length - 1) {
      fs.writeFileSync(save.filePath, `${tmp}`, {
        flag: 'a'
      });
    } else {
      fs.writeFileSync(save.filePath, `${tmp}\n`, {
        flag: 'a'
      });
    }
  });

  const show = await dialog.showMessageBox(mainWindow, {
    message: `Saved playlist ${path.basename(save.filePath)}`,
    buttons: []
  });
});

ipcMain.handle('get-playlists', async () => {
  const playlistsStats = [];
  const playlists = await fs.promises.readdir(playlistsFolder);
  for await (const pl of playlists) {
    let tmp = await fs.promises.stat(`${playlistsFolder}\\${pl}`);
    if (tmp) {
      playlistsStats.push({ name: pl, createdon: convertToUTC(tmp.birthtimeMs) });
    }
  }
  return playlists;
});

ipcMain.handle('get-temp-path', async () => {
  console.log('get-temp-path');
  return app.getPath('temp');
});

ipcMain.handle('get-covers', async (_, ...args) => {
  console.log('args: ', args);
  let albums;

  if (args[3] === 'missing-covers') {
    albums = await allMissingCoversByScroll(args[0], args[2], args[1]);
  } else {
    albums = await allCoversByScroll(args[0], args[2], args[1]);
  }
  return albums;
});

const shuffle = (array) => {
  const shuffledArray = [...array];
  for (let i = shuffledArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
  }
  return shuffledArray;
};

ipcMain.handle('set-shuffled-tracks-array', async () => {
  shuffled = [];
  const primaryKeysArray = getAllPkeys();
  shuffled = shuffle(primaryKeysArray);
});

ipcMain.handle('get-shuffled-tracks', async (_, ...args) => {
  const offset = args[0];
  const limit = 200;
  try {
    const start = offset * limit;
    const end = start + limit - 1;

    const fifty = shuffled.slice(start, end + 1);
    const tracks = getAllTracks(fifty);
    return tracks;
  } catch (err) {
    console.log(err.message);
  }
});

ipcMain.handle('update-tags', async (event, arr) => {
  const senderWebContents = event.sender;
  const senderWindow = BrowserWindow.fromWebContents(senderWebContents);
  const targetWindow = BrowserWindow.fromId(senderWindow.id);
  console.log(
    `Request received from window ID: ${senderWindow.id}, Title: ${senderWindow.getTitle()}`
  );
  targetWindow.webContents.send('update-tags', 'starting');
  try {
    const workerPath = process.resourcesPath;
    await createUpdateTagsWorker({
      workerData: { workerPath: workerPath, data: arr }
    })
      .on('message', (message) => {
        console.log('message from worker: ', message);
        targetWindow.webContents.send('update-tags', 'success');
        mainWindow.webContents.send('updated-tags', 'updated-tags');
      })
      .on('error', (err) => {
        console.error('Tags worker error: ', err);
      })
      .on('exit', (code) => {
        if (code !== 0) {
          const errorMessage = `Worker stopped with exit code ${code}`;
          console.error(errorMessage);
        }
      })
      .postMessage('');
  } catch (error) {
    console.error('Error on tag update: ', error.message);
  }
});

ipcMain.on('show-context-menu', (event, id, type) => {
  const template = [];
  if (type === 'files') {
    template.push(
      {
        label: 'Add Track to Playlist',
        click: () => event.sender.send('context-menu-command', 'add-track-to-playlist')
      },
      { type: 'separator' },
      {
        label: 'Edit Track Metadata',
        click: () => event.sender.send('context-menu-command', 'edit-track-metadata')
      }
    );
  }

  if (type === 'folder') {
    template.push(
      {
        label: 'Add Album to Playlist',
        click: () => event.sender.send('context-menu-command', 'add-album-to-playlist')
      },
      { type: 'separator' },
      {
        label: 'Open Album Folder',
        click: () => event.sender.send('context-menu-command', 'open-album-folder')
      }
    );
  }

  if (type === 'playlist') {
    template.push(
      {
        label: 'Remove from Playlist',
        click: () => event.sender.send('context-menu-command', 'remove-from-playlist')
      },
      { type: 'separator' },
      {
        label: 'Edit Track Metadata',
        click: () => event.sender.send('context-menu-command', 'edit-track-metadata')
      }
    );
  }

  if (type === 'cover') {
    const customLabel = id === 'cover-search-alt' ? 'Save Image' : 'Select Image';
    template.push({
      label: customLabel,
      click: () => event.sender.send('context-menu-command', 'save image')
    });
  }

  if (type === 'picture') {
    const fileIndex = id.path.lastIndexOf('/');
    const strEnd = id.path.substring(0, fileIndex);
    template.push(
      {
        label: `Get image for single track`,
        click: () => event.sender.send('context-menu-command', { type: 'single-track', params: id })
      },
      {
        label: `Get image for selected tracks`,
        click: () =>
          event.sender.send('context-menu-command', {
            type: 'all-tracks',
            params: 'all-tracks'
          })
      },
      {
        label: 'Select image from folder',
        click: () => event.sender.send('context-menu-command', 'search-folder')
      }
    );
  }

  if (type === 'menu') {
    template.push(
      {
        label: 'Update All',
        click: () => event.sender.send('context-menu-command', 'update-all')
      },
      { type: 'separator' },
      {
        label: 'Schedule Updates',
        click: () => event.sender.send('context-menu-command', 'schedule-updates')
      },
      { type: 'separator' },
      {
        label: 'Update Files',
        click: () => event.sender.send('context-menu-command', 'update-files')
      },
      { type: 'separator' },
      {
        label: 'Update Folders',
        click: () => event.sender.send('context-menu-command', 'update-folders')
      },
      { type: 'separator' },
      {
        label: 'Update Covers',
        click: () => event.sender.send('context-menu-command', 'update-covers')
      },
      { type: 'separator' },
      {
        label: 'Update Meta',
        click: () => event.sender.send('context-menu-command', 'update-meta')
      }
    );
  }

  const menu = Menu.buildFromTemplate(template);
  menu.popup(BrowserWindow.fromWebContents(event.sender));
});

ipcMain.handle('show-album-cover-menu', (event) => {
  const template = [
    {
      label: 'add album to playlist',
      click: () => {
        return event.sender.send('album-menu', 'add album to playlist');
      }
    },
    { type: 'separator' },
    {
      label: 'open album folder',
      click: () => {
        return event.sender.send('album-menu', 'open album folder');
      }
    },
    { type: 'separator' },
    {
      label: 'cover search',
      click: () => {
        return event.sender.send('album-menu', 'cover search');
      }
    }
  ];
  const menu = Menu.buildFromTemplate(template);
  menu.popup(BrowserWindow.fromWebContents(event.sender));
});

ipcMain.handle('show-text-input-menu', (event) => {
  const selectionMenu = Menu.buildFromTemplate([
    { role: 'copy' },
    { type: 'separator' },
    { role: 'selectall' }
  ]);

  const inputMenu = Menu.buildFromTemplate([
    { role: 'undo' },
    { role: 'redo' },
    { type: 'separator' },
    { role: 'cut' },
    { role: 'copy' },
    { role: 'paste' },
    { type: 'separator' },
    { role: 'selectall' }
  ]);

  inputMenu.popup(BrowserWindow.fromWebContents(event.sender));
});

ipcMain.handle('show-child', (event, args) => {
  const { name, type, winConfig, data } = args;
  createOrUpdateChildWindow(name, type, winConfig, data);
});

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

ipcMain.handle('download-file', async (event, ...args) => {
  const senderWebContents = event.sender;
  const senderWindow = BrowserWindow.fromWebContents(senderWebContents);
  const targetWindow = BrowserWindow.fromId(senderWindow.id);
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
    return event.sender.send('download-completed', 'download cancelled');
  }

  try {
    await downloadFile(fileUrl, savePath.filePath).then(() =>
      event.sender.send('download-completed', 'download successful')
    );
  } catch (error) {
    console.error(error.message);
    event.sender.send('download-failed', 'download failed');
  }
});

ipcMain.handle('download-tag-image', async (event, ...args) => {
  const targetWindow = await getWindow('table-data');
  targetWindow.webContents.send('update-tags', 'starting');
  const [fileUrl, filePath, listType, embedType] = args;
  const extension = path.extname(new URL(fileUrl).pathname);
  const defaultFilename = `cover${extension}`;
  const tempDir = app.getPath('temp');
  const saveTo = path.join(tempDir, defaultFilename);

  const success = await downloadFile(fileUrl, saveTo);
  if (success) {
    const tempFile = saveTo.replace(/\\/g, '/');
    try {
      const workerPath = process.resourcesPath;
      await createUpdateTagImageWorker({
        workerData: { tempFile, filePath }
      })
        .on('message', (message) => {
          console.log('message from worker: ', message);
          targetWindow.webContents.send('update-tags', 'success');
        })
        .on('error', (err) => {
          console.error('Worker error:', err);
        })
        .on('exit', (code) => {
          if (code !== 0) {
            const errorMessage = `Worker stopped with exit code ${code}`;
            console.error(errorMessage);
          }
        })
        .postMessage('');
    } catch (error) {
      console.error(error.message);
    }
  }
});

ipcMain.handle('refresh-cover', async (event, ...args) => {
  const [file, filepath] = args;
  const imgurl = url.pathToFileURL(file).href;
  BrowserWindow.fromId(mainWindow.id).webContents.send('refresh-home-cover', filepath, imgurl);
});

ipcMain.handle('get-window-name', async (event) => {
  console.log('event sender: ', event.sender);
  return 1;
});

ipcMain.handle('open-album-folder', async (_, path) => {
  try {
    const properPath = path.replaceAll('/', '\\');
    shell.openPath(properPath);
  } catch (error) {
    console.error(error.message);
  }
});

ipcMain.handle('get-preferences', async (event) => {
  return await getPreferences();
});

ipcMain.handle('save-preferences', async (event, preferences) => {
  await savePreferences(preferences);
});
