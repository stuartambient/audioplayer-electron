import {
  app,
  shell,
  session,
  BrowserWindow,
  ipcMain,
  Menu,
  /* BrowserView, */
  dialog,
  /* webContents, */
  protocol,
  powerMonitor
  /* powerSaveBlocker */
} from 'electron';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import process from 'node:process';
import fs from 'node:fs';
/* import { spawn } from 'child_process'; */
import { createOrUpdateChildWindow, getWindowNames, getWindow } from './windowManager.js';
import url, { pathToFileURL } from 'url';
/* import http from 'node:http'; */
import * as stream from 'stream';
import covit from './assets/covit.exe?asset';
/* import { promisify } from 'util'; */
/* import { Buffer } from 'buffer'; */
import { Worker } from 'worker_threads';
import { Picture, File } from 'node-taglib-sharp';
import transformTags from './transformTags.js';
import createUpdateTagsWorker from './updateTagsWorker?nodeWorker';
import createUpdateFilesWorker from './updateFilesWorker?nodeWorker';
import axios from 'axios';
import { electronApp, optimizer, is } from '@electron-toolkit/utils';
import { writeFile, convertToUTC, parseMeta } from './utility/index.js';
import db from './connection.js';

import { getPreferences, savePreferences } from './preferences.js';
import {
  allTracksByScroll,
  allTracksBySearchTerm,
  allAlbumsByScroll,
  allAlbumsBySearchTerm,
  allCoversByScroll,
  filesByAlbum,
  requestedFile,
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
  getUpdatedTracks
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
import initAlbums from './updateFolders';
/* import initFiles from './updateFiles'; */
import initCovers from './updateFolderCovers';
/* import initUpdateMetadata from './updateMetadata'; */
import updateTags from './updateTags';
/* const devDb = import.meta.env.MAIN_VITE_DB_PATH_DEV;
const prodDb = import.meta.env.MAIN_VITE_DB_PATH_PROD; */
/* import checkDataTypes from './checkDataTypes.js'; */
/* import { Genres } from '../renderer/src/components/StatsComponents.jsx'; */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.disableHardwareAcceleration();

protocol.registerSchemesAsPrivileged([
  {
    scheme: 'streaming',
    privileges: { stream: true, standard: true, bypassCSP: true, supportFetchAPI: true }
  }
]);

/* IN DOCUMENTS/ELECTRONMUSICPLAYER */
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
/* console.log('df: ', documentsFolder); */

process.on('unhandledRejection', (err) => {
  console.error('Unhandled promise rejection:', err);
});

const capitalizeDriveLetter = (str) => {
  return `${str.charAt(0).toUpperCase()}:${str.slice(1)}`;
};
export let mainWindow;

function createWindow() {
  // Create the browser window.
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
      sandbox: false,
      webSecurity: false,
      contextIsolation: true,
      nodeIntegration: true
    }
  });

  mainWindow.on('ready-to-show', () => {
    mainWindow.show();
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
    /* console.log('getsize: ', mainWindow.getBounds()); */
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.setMaximumSize(4000, 4000);
      mainWindow.maximize();
    }
  });

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(`${process.env['ELECTRON_RENDERER_URL']}/index.html`);
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }
}

const reactDevToolsPath =
  /* 'C:/Users/sambi/AppData/Local/Google/Chrome/User Data/Default/Extensions/fmkadmapgofadopljbjfkapdkoienihi/4.27.1_0'; */
  'C:/Users/sambi/documents/Devtools2/4.27.1_0';

/*  'C:/Users/sambi/AppData/Local/Google/Chrome/User Data/Default/Extensions/fmkadmapgofadopljbjfkapdkoienihi/5.0.2_0'; */
/* 'C:/Users/sambi/documents/Devtools2/5.0.2_0'; */

let primaryDisplay;
let resumeSleep;

app.whenReady().then(async () => {
  // Load React DevTools extension

  await session.defaultSession.loadExtension(reactDevToolsPath, { allowFileAccess: true });
  electronApp.setAppUserModelId('com.electron');
  // Register the custom 'streaming' protocol
  protocol.registerStreamProtocol('streaming', async (request, cb) => {
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
        data: fs.createReadStream(path, { start, end })
      });
    } else {
      console.log('no range');
      cb({
        statusCode: 200,
        headers: {
          'Content-Length': String(fileSize),
          'Content-Type': 'audio/mpeg'
        },
        data: fs.createReadStream(path)
      });
    }
  });

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });
  // Create the initial window
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

  /*   resumeSleep = powerSaveBlocker.start('prevent-app-suspension');
  console.log(`Power save blocker started with id: ${resumeSleep}`); */

  // LINUX or MACoS
  powerMonitor.on('shutdown', () => {
    console.log('The system is shutting down: ', new Date());
  });

  mainWindow.webContents.openDevTools();
});

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

const processUpdateResult = (type, result) => {
  let filename;
  switch (type) {
    case 'folder':
      filename = 'folder-updates.txt';
      break;
    case 'file':
      filename = 'file-updates.txt';
      break;
    case 'meta':
      filename = 'meta-updates.txt';
      break;
    default:
      return;
  }
  if (Array.isArray(result.new)) {
    const buffer = [];
    buffer.push(`\nDate: ${new Date()} \nAdditions:\n`);
    buffer.push(...result.new);

    writeFile(buffer, `${updatesFolder}\\${filename}`).catch((err) => console.error(err));
  }
  if (Array.isArray(result.deleted)) {
    writeFile(`\nDate: ${Date()} \nDeletions:\n`, `${updatesFolder}\\${filename}`);

    result.deleted.forEach((res) => {
      writeFile(`${res}\n`, `${updatesFolder}\\${filename}`);
    });
  } else if (result.nochange === true) {
    /* console.log('result: ', result); */
    writeFile(`\nDate: ${Date()} No changes`, `${updatesFolder}\\${filename}`);
  }
};

ipcMain.on('toggle-resizable', (event, isResizable) => {
  mainWindow.setResizable(isResizable);
  const [currentWidth, currentHeight] = mainWindow.getSize();
  if (isResizable) {
    mainWindow.setMinimumSize(currentWidth, currentHeight);
  }
});

ipcMain.handle('update-folders', async () => {
  const result = await initAlbums();
  /* processUpdateResult('folder', result); */
  console.log('result: ', result);
  return result;
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
    /* console.log('createUpdateFilesWorker', createUpdateFilesWorker()); */
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
    /* const result = await runWorker(createUpdateFilesWorker, {
      msg: 'run'
    });
    console.log('Worker completed successfully:', result);
    console.log('Running subsequent code after worker completion.');*/
  } catch (error) {
    console.error('Worker encountered an error:', error);

    console.log('Handling subsequent code after worker error.');
  }
});
/* } catch (error) {
    console.error('Error on tag update: ', error.message);
  } */

ipcMain.handle('update-meta', async () => {
  const result = await initUpdateMetadata();
  /* processUpdateResult('meta', result); */
  /* console.log('meta result: ', result); */
  return result;
});

ipcMain.handle('create-table', () => {
  const result = createTable();
  return true;
});

ipcMain.handle('get-tracks', async (event, ...args) => {
  /* console.log('get-tracks'); */
  /* console.log('sort: ', args[2]); */
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

/* ipcMain.handle('stream-audio', async (event, arg) => {
  const file = await fs.promises.readFile(arg);
  const filebuf = Buffer.from(file);
  return filebuf;
}); */

ipcMain.on('test-real-stream', async (event, ...args) => {
  let url = await `streaming://${args[0]}`;
  return url;
});

ipcMain.handle('get-cover', async (event, arg) => {
  const track = await requestedFile(arg);
  const myFile = await File.createFromPath(track.audiotrack);

  /*   const pic = await myPic.data;
  if (!pic) return 0; */
  if (!myFile.tag.pictures?.[0]?.data) return 0;
  return myFile.tag.pictures[0].data._bytes;
  /*   const track = await requestedFile(arg);
  const meta = await parseFile(track.audiotrack);
  if (!meta.common.picture) return 0;
  return meta.common.picture[0].data; */
});

ipcMain.handle('file-update-details', async (event, ...args) => {
  const fileupdates = await fs.promises.readFile(`${updatesFolder}/file-updates.txt`, {
    encoding: 'utf8'
  });
  return fileupdates;
});

ipcMain.handle('folder-update-details', async (event, ...args) => {
  const folderupdates = await fs.promises.readFile(`${updatesFolder}\\folder-updates.txt`, {
    encoding: 'utf8'
  });
  return folderupdates;
});

ipcMain.handle('screen-mode', async (event, ...args) => {
  console.log('screen-mode-change: ', args[0]);
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

/* ipcMain.on('open-child', async (event, ...args) => {
  const child = new BrowserWindow({ parent: mainWindow });
  child.loadFile(path.join(__dirname, '../renderer/child.html'));
  child.show();
  return true;
}); */

ipcMain.handle('total-tracks-stat', async () => {
  const totals = await totalTracks();
  const totalCounts = {
    albums: totals.albumsInfo['COUNT(*)'],
    tracks: totals.tracksInfo['COUNT(*)']
  };
  /* console.log('total counts: ', totalCounts); */
  /*  const total = Object.values(totaltracks).join();
  return total; */
  /* return totals.tracksInfo['COUNT(*)']; */
  return totalCounts;
});

ipcMain.handle('top-hundred-artists-stat', async () => {
  const topHundred = await topHundredArtists();
  /* console.log('topHundred: ', topHundred.length); */
  return topHundred.slice(1);
});

async function openWindowAndSendData(queryResults, listType) {
  const targetWindow = await getWindow('table-data');

  if (targetWindow) {
    if (targetWindow.webContents.isLoading()) {
      targetWindow.webContents.once('did-finish-load', () => {
        console.log('Window loaded. Sending data');
        targetWindow.webContents.send('send-to-child', {
          listType,
          results: queryResults
        });
      });
    } else {
      console.log('Window already loaded. Sending data');
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
  /* console.log('distinct-directories called'); */
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

ipcMain.handle('get-tracks-by-album', async (event, album, listType) => {
  try {
    const albumTracks = await filesByAlbum(album);
    console.log(albumTracks);
    if (albumTracks) {
      await openWindowAndSendData(albumTracks, listType);
    } else {
      return 'empty folder . no tracks';
    }
  } catch (e) {
    console.error(e.message);
  }
});

ipcMain.handle('check-for-open-table', async (event, name) => {
  console.log('check for open table');
  const names = await getWindowNames();
  if (names.includes(name)) {
    return true;
  }
  return false;
});

ipcMain.handle('clear-table', async (event) => {
  console.log('clear table');
  const targetWindow = await getWindow('table-data');
  targetWindow.webContents.send('clear-table', 'clear');
});
/* ipcMain.handle('get-albums-by-top-folder', async (event, folder) => {
  const folderAlbums = await albumsByTopFolder(folder);
  return folderAlbums;
}); */

ipcMain.handle('get-albums-by-root', async (event, dirs) => {
  const results = await albumsByTopFolder(dirs);
  return results;
});

ipcMain.handle('genres-stat', async () => {
  const genres = await genresWithCount();
  return genres;
});

ipcMain.handle('folders-stat', async (event, dirs) => {
  const folders = await foldersWithCount(dirs);
  return folders;
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

ipcMain.handle('homepage-playlists', async (_m, ...args) => {
  /* const folderupdates = await fs.promises.readFile(`${updatesFolder}\\folder-updates.txt`, {
    encoding: 'utf8'
  });
  return folderupdates; */
  const [type, value] = args;
  switch (type) {
    case 'edit':
      const editplfile = await fs.promises.readFile(`${playlistsFolder}\\${value}`, {
        encoding: 'utf8'
      });
      break;
    case 'delete':
      const delplfile = await fs.promises.unlink(`${playlistsFolder}\\${value}`);
      break;
    case 'play':
    default:
      return;
  }
});

ipcMain.handle('get-covers', async (_, ...args) => {
  const albums = await allCoversByScroll(args[0], args[1]);
  const albumsWithImages = Promise.all(
    albums.map(async (l) => {
      try {
        let tmp = await fs.promises.readdir(l.fullpath);
        const checkImg = tmp.find((t) => t.match(/\.(jpe?g|png|webp)$/i));
        if (!checkImg) {
          return { ...l, list: 'covers' };
        }
        const imgPath = `${l.fullpath}/${checkImg}`;
        const imgUrl = url.pathToFileURL(imgPath);
        const imageobj = { img: imgUrl.href, list: 'covers' };

        return { ...l, ...imageobj };
      } catch (err) {
        if (err.code === 'ENOENT') {
          console.error(`Directory not found: ${l.fullpath}`);
          return null;
        } else if (err.code === 'ENOTDIR') {
          console.error(`ENOTDIR: ${l.fullpath}`);
          return null;
        } else {
          return;
        }
      }
    })
  );
  return albumsWithImages.then((res) => res.filter((entry) => entry !== null));
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
  const limit = 50;
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
    /*     runWorker(createUpdateTagsWorker, { data: arr })
      .then((result) => {
        console.log('Worker completed successfully:', result);
        console.log('Running subsequent code after worker completion.');
        targetWindow.webContents.send('update-tags', 'success');
        mainWindow.webContents.send('updated-tags', 'updated-tags');
      })
      .catch((error) => {
        console.error('Worker encountered an error:', error);
        console.log('Handling subsequent code after worker error.');
      }); */
  } catch (error) {
    console.error('Error on tag update: ', error.message);
  }
});

ipcMain.on('show-context-menu', (event, id, type) => {
  const template = [
    {
      label: 'Add Track to Playlist',
      visible: type === 'file',
      click: () => {
        return event.sender.send('context-menu-command', 'add-track-to-playlist');
      }
    },
    {
      label: 'Edit Track Metadata',
      visible: type === 'file',
      click: () => {
        return event.sender.send('context-menu-command', 'edit-track-metadata');
      }
    },
    {
      label: 'Add Album to Playlist',
      visible: type === 'folder',
      click: () => {
        return event.sender.send('context-menu-command', 'add-album-to-playlist');
      }
    },
    {
      label: 'Open Album Folder',
      visible: type === 'folder',
      click: () => {
        return event.sender.send('context-menu-command', 'open-album-folder');
      }
    },
    {
      label: 'Remove from Playlist',
      visible: type === 'playlist',
      click: () => {
        return event.sender.send('context-menu-command', 'remove-from-playlist');
      }
    }
  ];
  const menu = Menu.buildFromTemplate(template);
  menu.popup(BrowserWindow.fromWebContents(event.sender));
});

ipcMain.handle('show-album-cover-menu', (event) => {
  const template = [
    {
      label: 'search for cover',
      click: () => {
        return event.sender.send('album-menu', 'search for cover');
      }
    },
    { type: 'separator' },
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
      label: 'cover search engine',
      click: () => {
        return event.sender.send('album-menu', 'cover search engine');
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

ipcMain.handle('download-file', async (event, ...args) => {
  const [fileUrl, filePath] = args;

  const extension = path.extname(new URL(fileUrl).pathname);
  const defaultFilename = `cover${extension}`;
  const initialPath = filePath ? path.join(filePath, defaultFilename) : defaultFilename;

  let savePath = await dialog.showSaveDialog({
    title: 'Save Image',
    defaultPath: initialPath,
    filters: [{ name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'gif'] }],
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
      return 'Download complete';
    } else {
      console.log('Failed to download:', response.status);
      return `Download failed with status: ${response.status}`;
    }
  } catch (err) {
    console.error('Error during download or save:', err);
    return `Error: ${err.message}`;
  }
});

const createRemoteWindow = (artist, title) => {
  const remotePort = 'browser';
  const remoteAgent = 'MusicPlayer-Electron/1.0';
  const remoteText = 'Integration active.';

  const url = new URL('https://covers.musichoarders.xyz');
  url.searchParams.set('remote.port', remotePort);
  url.searchParams.set('remote.agent', remoteAgent);
  url.searchParams.set('remote.text', remoteText);
  url.searchParams.set('artist', artist);
  url.searchParams.set('album', title);
  url.searchParams.set('sources]', ['amazonmusic', 'applemusic']);

  const remoteWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  remoteWindow.loadURL(url.toString());
};

function openCoverSearch(address) {
  let win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  win.loadURL(address);
}

ipcMain.handle('search-musicHoarders', async (event, artist, title) => {
  console.log('musicHoarders: ', artist, title);
  /* const executablePath = path.join(__dirname, 'covit.exe');
  console.log('executable path: ', executablePath); */
  /*   exec(
    `${covit} --address "https://covers.musichoarders.xyz" --query-artist ${artist} --query-album ${title}`,
    (error, stdout, stderr) => {
      if (error) {
        console.error(`Error: ${error.message}`);
        return;
      }
      if (stderr) {
        console.error(`Stderr: ${stderr}`);
        return;
      }
      console.log(`Stdout: ${stdout}`); */
  /* openCoverSearch(`https://covers.musichoarders.xyz?theme=dark&album=${title}&artist=${artist}`); */
  /*   }
  ); */

  createRemoteWindow(artist, title);
});

ipcMain.handle('refresh-cover', async (event, ...args) => {
  const [file, filepath] = args;
  const imgurl = url.pathToFileURL(file).href;
  /* const imageobj = { img: imgurl.href }; */

  BrowserWindow.fromId(mainWindow.id).webContents.send('refresh-home-cover', filepath, imgurl);
});

ipcMain.handle('open-album-folder', async (_, path) => {
  const properPath = path.replaceAll('/', '\\');
  /*   let explorer;
  switch (process.platform) {
    case 'win32':
      explorer = 'explorer';
      break;
    case 'linux':
      explorer = 'xdg-open';
      break;
    case 'darwin':
      explorer = 'open';
      break;
  } */
  /*  spawn(explorer, [path], { detached: true }).unref(); */
  shell.openPath(properPath);
});

ipcMain.handle('get-preferences', async (event) => {
  return await getPreferences();
});

ipcMain.handle('save-preferences', async (event, preferences) => {
  await savePreferences(preferences);
});
