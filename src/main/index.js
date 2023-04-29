import {
  app,
  shell,
  session,
  BrowserWindow,
  ipcMain,
  Menu,
  BrowserView,
  dialog,
  webContents,
  protocol
} from 'electron';
import * as path from 'path';
import fs from 'fs';
/* import { spawn } from 'child_process'; */
import url, { pathToFileURL } from 'url';
import http from 'node:http';
import * as stream from 'stream';
import { promisify } from 'util';
import { Buffer } from 'buffer';
import { parseFile } from 'music-metadata';
import axios from 'axios';
import { electronApp, optimizer, is } from '@electron-toolkit/utils';
import { writeFile } from './utility';
/* import Database from 'better-sqlite3'; */
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
  getAllTracks,
  insertCovers,
  getMissingCovers,
  deleteAlbum
  /* createFoldersTable,
  createFilesTable */
} from './sql.js';

import { totalTracks, topTenArtists, last10Albums, last100Tracks } from './stats';
import initAlbums from './updateFolders';
import initFiles from './updateFiles';
import initCovers from './updateFolderCovers';
protocol.registerSchemesAsPrivileged([
  {
    scheme: 'streaming',
    privileges: { stream: true, standard: true, bypassCSP: true, supportFetchAPI: true }
  }
]);
/* protocol.registerStreamProtocol('streaming', async (request, callback) => {
  console.log('streaming --> ', request.url);
});
 */
/* const db = new Database('music.db', { verbose: console.log });
console.log(db); */

/* const updatesFolder = `${process.cwd()}/src/updates`; */

/* IN DOCUMENTS/ELECTRONMUSICPLAYER */
const updatesFolder = `${app.getPath('documents')}\\ElectronMusicplayer\\updates`;
const metaErrorsFolder = `${app.getPath('documents')}\\ElectronMusicplayer\\metaerrors`;
const playlistsFolder = `${app.getPath('documents')}\\ElectronMusicplayer\\playlists`;
const coversFolder = `${app.getPath('documents')}\\ElectronMusicplayer\\covers`;
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

const capitalizeDriveLetter = (str) => {
  return `${str.charAt(0).toUpperCase()}:${str.slice(1)}`;
};
let mainWindow;

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 660,
    height: 600,
    frame: false,
    /* backgroundColor: '#1D1B1B', */
    transparent: true,

    /* resizable: false, */
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
      sandbox: false,
      webSecurity: false,
      nodeIntegration: true
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
    mainWindow.loadFile(`path.join(__dirname, '../renderer/index.html`);
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
  protocol.registerStreamProtocol('streaming', async (request, cb) => {
    const uri = decodeURI(request.url);
    const filePath = uri.replace('streaming://', '');
    const path = capitalizeDriveLetter(filePath);

    const fileSize = fs.statSync(path).size;
    const range = request.headers.Range;
    console.log('range: ', range);
    /*  const fileSize = fs.statSync(file).size; */
    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = end - start + 1;
      /* const chunksize = fileSize / 10; */

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
      /* WITH NO RANGE SET IN HEADERS ON REQUEST, SET THE FIRST CHUNK TO DEFAULT 64kb. RANGE WILL BE SET
      NOW BAED ON FILE SIZE */
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
  /*  protocol.registerStreamProtocol('streaming', async (request, callback) => {
    const uri = decodeURI(request.url);
    const filePath = uri.replace('streaming://', '');
    const file = capitalizeDriveLetter(filePath);
    const fileSize = fs.statSync(file).size;

    const range = request.headers.Range || '0';

    if (range) {
      const chunkSize = 10 * 1e6;
      const start = Number(range.replace(/\D/g, ''));
      const end = Math.min(start + chunkSize, fileSize - 1);
      const contentLength = end - start + 1;

      const headers = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': String(fileSize),
        'Content-Type': 'audio/mpeg'
      };
      console.log(start, end, fileSize);
      callback({
        statusCode: 206,
        headers,
        data: fs.createReadStream(file, { start, end })
      });
    } else {
      callback({
        statusCode: 200,
        headers: {
          'Content-Length': String(fileSize),
          'Content-Type': 'audio/mpeg'
        },
        data: fs.createReadStream(file)
      });
    }
  }); */
  /* console.log('getAppPath() - ', app.getAppPath()); */

  /*   console.log(
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
  ); */

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
  /* console.log(filename); */
  if (Array.isArray(result.new)) {
    writeFile(`\nDate: ${Date()} \nAdditions:\n`, `${updatesFolder}\\${filename}`);
    result.new.forEach((res) => {
      writeFile(`${res}\n`, `${updatesFolder}\\${filename}`);
    });
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

ipcMain.handle('update-covers', async () => {
  const result = await initCovers();
  let updatedFolders = [];
  for await (const r of result) {
    let tmp = await fs.promises.readdir(r.path);

    if (!tmp[0]) continue;
    if (tmp[0].endsWith('mp3') || tmp[0].endsWith('flac') || tmp[0].endsWith('ape')) {
      try {
        const f = await parseFile(`${r.path}/${tmp[0]}`);
        if (f.common.picture) {
          let tmppic = f.common.picture[0].data;
          fs.promises.writeFile(`${r.path}/cover.jpg`, tmppic);
          updatedFolders.push(r);
        }
      } catch (err) {
        console.log(err.message);
      }
    }
  }
  return updatedFolders;
});

ipcMain.handle('missing-covers', async () => {
  const result = getMissingCovers();
  return result;
});

ipcMain.handle('create-table', () => {
  const result = createTable();
  return true;
});

ipcMain.handle('get-tracks', async (event, ...args) => {
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
  console.log('all album tracks: ', allAlbumTracks);
  return allAlbumTracks;
});

ipcMain.handle('stream-audio', async (event, arg) => {
  const file = await fs.promises.readFile(arg);
  const filebuf = Buffer.from(file);
  return filebuf;
});

ipcMain.on('test-real-stream', async (event, ...args) => {
  let url = await `streaming://${args[0]}`;
  return url;

  /* protocol.registerStreamProtocol('streaming', async (request, callback) => {
    console.log('request: ', request);
    const stat = fs.statSync(request);
    const fileSize = stat.size;
    console.log('filesize: ', fileSize);
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

      callback({
        statusCode: 206,
        headers,
        data: fs.createReadStream(path, { start, end })
      });
    } else {
      callback({
        statusCode: 200,
        headers: {
          'Content-Length': String(fileSize),
          'Content-Type': 'audio/mpeg'
        },
        data: fs.createReadStream(path)
      });
    }
  }); */
});

ipcMain.handle('get-cover', async (event, arg) => {
  const track = await requestedFile(arg);
  const meta = await parseFile(track.audiofile);
  if (!meta.common.picture) return 0;
  return meta.common.picture[0].data;
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
  console.log('screen-mode: ', args[0]);
  if (args[0] === 'mini') {
    await mainWindow.setMinimumSize(290, 350);
    await mainWindow.setSize(290, 350, false);
  }
  if (args[0] === 'default') {
    await mainWindow.setMinimumSize(660, 600);
    await mainWindow.setSize(660, 600, false);
  }
  if (args[0] === 'mini-expanded') {
    await mainWindow.setMinimumSize(380, 610);
    await mainWindow.setSize(380, 610, false);
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

ipcMain.on('open-child', async (event, ...args) => {
  const child = new BrowserWindow({ parent: mainWindow });
  child.loadFile(path.join(__dirname, '../renderer/index.html'));
  child.show();
  return true;
});

ipcMain.handle('total-tracks-stat', async () => {
  const totaltracks = await totalTracks();
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
      if (!checkImg) return { ...l, list: 'last10albums' };
      const imgPath = `${l.fullpath}/${checkImg}`;
      const imgurl = url.pathToFileURL(imgPath);
      /* const imageobj = { img: imgurl.href };
      const stub = { list: 'last10albums' }; */
      const imageobj = { img: imgurl.href, list: 'last10albums' };

      /* console.log('imgPath:----> ', imgPath, 'imgurl:----> ', imgurl, 'imageobj:----> ', imageobj); */
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

ipcMain.handle('get-playlists', async () => {
  const playlists = fs.promises.readdir(playlistsFolder);
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
  /* console.log(albums); */
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
        } else {
          throw err;
        }
      }
    })
  );
  return albumsWithImages.then((res) => res.filter((entry) => entry !== null));
});

ipcMain.handle('set-shuffled-tracks-array', async (_, ...args) => {
  shuffled = [];
  if (!shuffled.length) {
    let array = [...Array(+args[0]).keys()];
    let shuffle = [...array];

    const getRandomValue = (i, N) => Math.floor(Math.random() * (N - i) + i);

    shuffle.forEach(
      (elem, i, arr, j = getRandomValue(i, arr.length)) => ([arr[i], arr[j]] = [arr[j], arr[i]])
    );

    shuffled = shuffle;
  }
  return true;
});

ipcMain.handle('get-shuffled-tracks', async (_, ...args) => {
  try {
    const [start, end] = args;
    const fifty = shuffled.slice(start, end);
    const tracks = getAllTracks(fifty);
    return tracks;
  } catch (err) {
    console.log(err.message);
  }
});

ipcMain.handle('show-tracks-menu', (event) => {
  const template = [
    {
      label: 'add track to playlist',
      click: () => {
        return event.sender.send('track-to-playlist', 'add track to playlist');
      }
    }
  ];
  const menu = Menu.buildFromTemplate(template);
  menu.popup(BrowserWindow.fromWebContents(event.sender));
});

ipcMain.handle('show-albums-menu', (event) => {
  const template = [
    {
      label: 'add album to playlist',
      click: () => {
        return event.sender.send('album-to-playlist', 'add album to playlist');
      }
    }
  ];
  const menu = Menu.buildFromTemplate(template);
  menu.popup(BrowserWindow.fromWebContents(event.sender));
});

ipcMain.handle('show-playlists-menu', (event) => {
  const template = [
    {
      label: 'remove from playlist',
      click: () => {
        return event.sender.send('remove-from-playlist', 'remove from playlist');
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
    }
  ];
  const menu = Menu.buildFromTemplate(template);
  menu.popup(BrowserWindow.fromWebContents(event.sender));
});
let newWin;
ipcMain.handle('show-child', (event, args) => {
  const createChildWindow = () => {
    newWin = new BrowserWindow({
      width: 450,
      height: 550,
      show: false,
      resizable: false,
      webPreferences: {
        preload: path.join(__dirname, '../preload/child.js'),
        sandbox: false,
        webSecurity: false
      }
    });

    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
      newWin.loadURL(`${process.env['ELECTRON_RENDERER_URL']}/child.html`);
    } else {
      newWin.loadFile(path.join(__dirname, '../renderer/child.html'));
    }
    /* newWin.loadFile(path.join(__dirname, '../renderer/child.html')); */

    newWin.on('ready-to-show', () => {
      newWin.show();
      newWin.webContents.send('send-to-child', args);
    });
  };

  const openWindows = BrowserWindow.getAllWindows().length;
  if (openWindows === 1) {
    createChildWindow();
  } else {
    BrowserWindow.fromId(newWin.id).webContents.send('send-to-child', args);
  }
});

ipcMain.handle('download-file', async (event, ...args) => {
  const [fileUrl, filePath] = args;

  try {
    const res = await axios.get(`${fileUrl}`, { responseType: 'arraybuffer' });
    /* fs.writeFileSync(filePath, res.data); */
    fs.writeFileSync(`${filePath}/cover.jpg`, res.data);
    return 'download complete';
  } catch (err) {
    return err.message;
  }
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

/* ipcMain.handle('get-covers', async (_, ...args) => {
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
          return { ...l, list: 'covers' };
        } else {
          throw err;
        }
      }
    })
  );
  return albumsWithImages;
});
*/
