import { app, shell, session, BrowserWindow, ipcMain, Menu } from 'electron';
import * as path from 'path';
import fs from 'fs';
import { Buffer } from 'buffer';
import { parseFile } from 'music-metadata';
import { electronApp, optimizer, is } from '@electron-toolkit/utils';
import { writeFile } from './utility';
/* import Database from 'better-sqlite3'; */
import {
  allTracksByScroll,
  allTracksBySearchTerm,
  allAlbumsByScroll,
  allAlbumsBySearchTerm,
  filesByAlbum,
  createTable,
  requestedFile
} from './sql.js';
import initAlbums from './updateFolders';
import initFiles from './updateFiles';

/* const db = new Database('music.db', { verbose: console.log });
console.log(db); */

const updatesFolder = `${process.cwd()}/src/updates`;

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 680,
    /* transparent: true,
    frame: false, */
    backgroundColor: '#1D1B1B',
    frame: false,
    /* rgb(9, 0, 7) */
    show: false,
    /* autoHideMenuBar: true, */
    ...(process.platform === 'linux'
      ? {
          icon: path.join(__dirname, '../../build/icon.png')
        }
      : {}),
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      sandbox: false
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

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }
}

const reactDevToolsPath =
  'C:/Users/sambi/AppData/Local/Google/Chrome/User Data/Default/Extensions/fmkadmapgofadopljbjfkapdkoienihi/4.27.1_0';

app.on('ready', async () => await session.defaultSession.loadExtension(reactDevToolsPath));

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron');

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  createWindow();

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

const processUpdateResult = (type, result) => {
  let filename;
  type === 'folder' ? (filename = 'folder-updates.txt') : (filename = 'file-updates.txt');
  console.log(filename);
  if (Array.isArray(result.new)) {
    writeFile(`\nDate: ${Date()} \nAdditions:`, `${updatesFolder}/${filename}`);
    result.new.forEach((res) => {
      writeFile(res, `${updatesFolder}/${filename}`);
    });
  }
  if (Array.isArray(result.deleted)) {
    writeFile(`\nDate: ${Date()} \nDeletions:`, `${updatesFolder}/${filename}`);

    result.deleted.forEach((res) => {
      writeFile(res, `${updatesFolder}/${filename}`);
    });
  } else if (result.nochange === true) {
    writeFile(`\nDate: ${Date()} No changes`, `${updatesFolder}/${filename}`);
  }
};

ipcMain.handle('update-folders', async () => {
  const result = await initAlbums();
  processUpdateResult('folder', result);
  return result;
});

ipcMain.handle('update-files', async () => {
  const result = await initFiles();
  processUpdateResult('file', result);
  return result;
});

ipcMain.handle('create-table', () => {
  const result = createTable();
  return true;
});

ipcMain.handle('get-tracks', async (event, ...args) => {
  console.log('get-tracks');
  console.log(args);
  if (args[1] === '') {
    const alltracks = await allTracksByScroll(args[0]);
    return alltracks;
  } else if (args[1]) {
    const alltracks = await allTracksBySearchTerm(args[0], args[1]);
    return alltracks;
  }
});

ipcMain.handle('get-albums', async (event, ...args) => {
  console.log('get-albums');
  if (args[1] === '') {
    const allAlbums = await allAlbumsByScroll(args[0]);
    return allAlbums;
  } else {
    const allAlbums = await allAlbumsBySearchTerm(args[0], args[1]);
    return allAlbums;
  }
});

ipcMain.handle('get-album-tracks', async (event, args) => {
  console.log(args);
  const allAlbumTracks = await filesByAlbum(args);
  return allAlbumTracks;
});

ipcMain.handle('stream-audio', async (event, arg) => {
  console.log(arg);
  const track = await requestedFile(arg);
  /* const picture = await parseFile(track.audiofile); */
  const file = await fs.promises.readFile(track.audiofile);
  const filebuf = Buffer.from(file);
  /* return { filebuf, picture: picture.common.picture[0].data }; */
  return filebuf;
});

ipcMain.handle('get-cover', async (event, arg) => {
  const track = await requestedFile(arg);
  const meta = await parseFile(track.audiofile);
  if (!meta.common.picture) return 0;
  return meta.common.picture[0].data;
  /* return meta.common.picture[0].data; */
  /* return meta.common.picture[0].data; */
});

ipcMain.handle('file-update-details', async (event, ...args) => {
  const fileupdates = await fs.promises.readFile(`${updatesFolder}/file-updates.txt`, {
    encoding: 'utf8'
  });
  return fileupdates;
});

ipcMain.handle('folder-update-details', async (event, ...args) => {
  console.log('called');
  const folderupdates = await fs.promises.readFile(`${updatesFolder}/folder-updates.txt`, {
    encoding: 'utf8'
  });
  return folderupdates;
});
