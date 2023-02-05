import {
  app,
  shell,
  session,
  BrowserWindow,
  ipcMain,
  Menu,
  BrowserView,
  dialog,
  webContents
} from 'electron';
import * as path from 'path';
import fs from 'fs';
import url from 'url';
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
  requestedFile,
  likeTrack,
  isLiked,
  getAlbum,
  getPlaylist
  /* createFoldersTable,
  createFilesTable */
} from './sql.js';

import { totalTracks, topTenArtists, last10Albums, last100Tracks } from './stats';
import initAlbums from './updateFolders';
import initFiles from './updateFiles';

/* const db = new Database('music.db', { verbose: console.log });
console.log(db); */

/* const updatesFolder = `${process.cwd()}/src/updates`; */

/* IN DOCUMENTS/ELECTRONMUSICPLAYER */
const updatesFolder = `${app.getPath('documents')}\\ElectronMusicplayer\\updates`;
const metaErrorsFolder = `${app.getPath('documents')}\\ElectronMusicplayer\\metaerrors`;
const playlistsFolder = `${app.getPath('documents')}\\ElectronMusicplayer\\playlists`;
if (!fs.existsSync(updatesFolder)) {
  fs.mkdirSync(updatesFolder);
}
if (!fs.existsSync(metaErrorsFolder)) {
  fs.mkdirSync(metaErrorsFolder);
}
if (!fs.existsSync(playlistsFolder)) {
  fs.mkdirSync(playlistsFolder);
}

/* console.log('df: ', documentsFolder); */

/* const updatesFolder = `${app.getPath('appData')}/musicplayer-electron/updatelogs`; */

/* let splashWindow;

function createSplashWindow() {
  splashWindow = new BrowserWindow({
    width: 320,
    height: 240,
    frame: false,
    resizable: false,
    backgroundColor: '#FFF',
    alwaysOnTop: true,
    show: false
  });
  splashWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, 'splash.html'),
      protocol: 'file',
      slashes: true
    })
  );
  splashWindow.on('closed', () => {
    splashWindow = null;
  });
  splashWindow.once('ready-to-show', () => {
    splashWindow.show();
  });
} */

let mainWindow;

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 660,
    height: 600,
    frame: false,
    backgroundColor: '#1D1B1B',

    resizable: false,
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
    /* mainWindow.setMinimumSize(300, 300); */
    mainWindow.show();
    /* console.log('dirname: ', __dirname); */
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
    console.log('getsize: ', mainWindow.getBounds());
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
  console.log('getAppPath() - ', app.getAppPath());
  console.log(
    'HOME : ',
    app.getPath('home'),
    'APPDATE : ',
    app.getPath('appData'),
    'DESKTOP : ',
    app.getPath('desktop'),
    'DOCUMENTS : ',
    app.getPath('documents'),
    'LOGS: ',
    app.getPath('logs')
  );

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

/* app.on('ready', createSplashWindow); */

const processUpdateResult = (type, result) => {
  let filename;
  type === 'folder' ? (filename = 'folder-updates.txt') : (filename = 'file-updates.txt');
  /* console.log(filename); */
  if (Array.isArray(result.new)) {
    writeFile(`\nDate: ${Date()} \nAdditions:\n`, `${updatesFolder}\\${filename}`);
    result.new.forEach((res) => {
      writeFile(`${res}\n`, `${updatesFolder}\\${filename}`);
    });
    /* console.log('completed folders'); */
  }
  if (Array.isArray(result.deleted)) {
    writeFile(`\nDate: ${Date()} \nDeletions:\n`, `${updatesFolder}\\${filename}`);

    result.deleted.forEach((res) => {
      writeFile(`${res}\n`, `${updatesFolder}\\${filename}`);
    });
  } else if (result.nochange === true) {
    writeFile(`\nDate: ${Date()} No changes`, `${updatesFolder}\\${filename}`);
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
  /* console.log('args: ', args); */
  /* console.log(args); */
  if (args[1] === '') {
    const alltracks = await allTracksByScroll(args[0]);
    return alltracks;
  } else if (args[1]) {
    const alltracks = await allTracksBySearchTerm(args[0], args[1]);
    return alltracks;
  }
});

ipcMain.handle('get-albums', async (event, ...args) => {
  if (args[1] === '') {
    const allAlbums = await allAlbumsByScroll(args[0]);
    return allAlbums;
  } else {
    const allAlbums = await allAlbumsBySearchTerm(args[0], args[1]);
    return allAlbums;
  }
});

ipcMain.handle('get-album', async (_, args) => {
  const album = getAlbum(args);
  return album;
});

ipcMain.handle('get-album-tracks', async (event, args) => {
  /* console.log(args); */
  const allAlbumTracks = await filesByAlbum(args);
  return allAlbumTracks;
});

ipcMain.handle('stream-audio', async (event, arg) => {
  /*  const track = await requestedFile(arg);
  console.log('track: ', track); */
  /* const picture = await parseFile(track.audiofile); */
  const file = await fs.promises.readFile(arg);
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
  /*   const mainWindow = BrowserWindow.getFocusedWindow();
  const child = new BrowserWindow({ parent: mainWindow });
  child.show();
  child.loadFile(`${updatesFolder}/folder-updates.txt`); */

  const folderupdates = await fs.promises.readFile(`${updatesFolder}\\folder-updates.txt`, {
    encoding: 'utf8'
  });
  /*   const parsedFolderUpdate = folderupdates.split('\n');
  console.log(parsedFolderUpdate); */
  return folderupdates;
});

ipcMain.handle('screen-mode', async (event, ...args) => {
  console.log(args);
  if (args[0] === 'mini') {
    /* console.log('confirmed mini'); */
    await mainWindow.setMinimumSize(380, 320);
    await mainWindow.setSize(380, 320, false);
  }
  if (args[0] === 'default') {
    /* console.log('confirmed default'); */
    /* const [width, height] = await mainWindow.getMinimumSize(); */
    /* console.log(width, height, width === 660, height === 680); */
    /* if (width === 660 && height === 600) return; */
    /* await mainWindow.setMinimumSize(660, 600); */
    await mainWindow.setMinimumSize(660, 600);
    await mainWindow.setSize(660, 600, false);
  }
  if (args[0] === 'mini-expanded') {
    /* console.log('confirmed default'); */
    /* const [width, height] = await mainWindow.getMinimumSize(); */
    /* console.log(width, height, width === 660, height === 680); */
    /* await mainWindow.setMinimumSize(580, 320); */
    await mainWindow.setMinimumSize(380, 550);
    await mainWindow.setSize(380, 550, false);
  }
});

ipcMain.handle('update-like', async (event, ...args) => {
  const updateTrackLike = likeTrack(args[0]);
  /* return updateTrackLike; */
  return true;
});

ipcMain.handle('is-liked', async (event, arg) => {
  const checkIsLiked = await isLiked(arg);
  return checkIsLiked;
});

ipcMain.on('open-child', async (event, ...args) => {
  const child = new BrowserWindow({ parent: mainWindow });
  /*  console.log('dirname: ', __dirname); */
  child.loadFile(path.join(__dirname, '../renderer/index.html'));
  child.show();
  return true;
});

ipcMain.on('send-state', async (event, ...args) => {
  console.log('----->', args);
});

ipcMain.handle('total-tracks-stat', async () => {
  const totaltracks = await totalTracks();
  /* console.log(totaltracks.count(*)); */
  const total = Object.values(totaltracks).join();
  return total;
});

ipcMain.handle('top-ten-artists-stat', async () => {
  const topTen = await topTenArtists();
  return topTen;
});

ipcMain.handle('last-10Albums-stat', async () => {
  const last10 = await last10Albums();
  const last10withImages = await Promise.all(
    last10.map(async (l) => {
      let tmp = await fs.promises.readdir(l.fullpath);
      const checkImg = tmp.find((t) => t.endsWith('.jpg'));
      if (!checkImg) return l;
      const imgPath = `${l.fullpath}/${checkImg}`;
      const file = await fs.promises.readFile(imgPath);
      const filebuf = Buffer.from(file);
      const imageobj = { img: filebuf };
      return { ...l, ...imageobj };
    })
  );
  return last10withImages;
});

ipcMain.handle('last-100Tracks-stat', async () => {
  const last100 = await last100Tracks();
  return last100;
});

ipcMain.handle('open-playlist', async () => {
  let result;
  const open = await dialog.showOpenDialog(mainWindow, {
    defaultPath: playlistsFolder,
    properties: ['openFile'],
    filters: [{ name: 'Playlist', extensions: ['m3u'] }]
  });
  fs.readFile(open.filePaths.join(), 'utf8', (err, f) => {
    if (err) return console.log(err);
    const plfiles = f.replaceAll('\\', '/').split('\n');
    const result = getPlaylist(plfiles);
  });
});

ipcMain.handle('save-playlist', async (_, args) => {
  const save = await dialog.showSaveDialog(mainWindow, {
    defaultPath: playlistsFolder,
    filters: [{ name: 'Playlist', extensions: ['m3u'] }]
  });

  args.forEach((a, index) => {
    const tmp = a.audiofile.replaceAll('/', '\\');
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
