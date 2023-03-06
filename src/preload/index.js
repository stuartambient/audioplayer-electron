import { contextBridge, ipcRenderer } from 'electron';
import { electronAPI } from '@electron-toolkit/preload';

// Custom APIs for renderer
const api = {
  updateFiles: () => ipcRenderer.invoke('update-files'),
  updateFolders: () => ipcRenderer.invoke('update-folders'),
  updateCovers: () => ipcRenderer.invoke('update-covers'),
  missingCovers: () => ipcRenderer.invoke('missing-covers'),
  createTable: () => ipcRenderer.invoke('create-table'),
  getTracks: (page, term, sort) => ipcRenderer.invoke('get-tracks', page, term, sort),
  getAlbums: (page, term) => ipcRenderer.invoke('get-albums', page, term),
  getAlbum: (id) => ipcRenderer.invoke('get-album', id),
  getAlbumTracks: (pattern) => ipcRenderer.invoke('get-album-tracks', pattern),
  streamAudio: (trackid) => ipcRenderer.invoke('stream-audio', trackid),
  getCover: (trackid) => ipcRenderer.invoke('get-cover', trackid),
  appMinimize: () => ipcRenderer.send('minimize'),
  appMaximize: () => ipcRenderer.send('maximize'),
  appClose: () => ipcRenderer.send('app-close'),
  fileUpdateDetails: () => ipcRenderer.invoke('file-update-details'),
  folderUpdateDetails: () => ipcRenderer.invoke('folder-update-details'),
  screenMode: (size) => ipcRenderer.invoke('screen-mode', size),
  updateLike: (id) => ipcRenderer.invoke('update-like', id),
  isLiked: (id) => ipcRenderer.invoke('is-liked', id),

  totalTracksStat: () => ipcRenderer.invoke('total-tracks-stat'),
  topTenArtistsStat: () => ipcRenderer.invoke('top-ten-artists-stat'),
  last10AlbumsStat: () => ipcRenderer.invoke('last-10Albums-stat'),
  last100TracksStat: () => ipcRenderer.invoke('last-100Tracks-stat'),
  openPlaylist: () => ipcRenderer.invoke('open-playlist'),
  savePlaylist: (playlistTracks) => ipcRenderer.invoke('save-playlist', playlistTracks),
  getPlaylists: () => ipcRenderer.invoke('get-playlists'),
  homepagePlaylists: (action, id) => ipcRenderer.invoke('homepage-playlists', action, id),
  getCovers: (coversPageNum, coversSearchTerm) =>
    ipcRenderer.invoke('get-covers', coversPageNum, coversSearchTerm),
  getAllTracks: (numofTracks, refreshKey) =>
    ipcRenderer.invoke('get-all-tracks', numofTracks, refreshKey),
  testGlobal: (start, end) => ipcRenderer.invoke('test-global', start, end),
  showTracksMenu: () => ipcRenderer.invoke('show-tracks-menu'),
  showAlbumsMenu: () => ipcRenderer.invoke('show-albums-menu'),
  showPlaylistsMenu: () => ipcRenderer.invoke('show-playlists-menu'),
  showAlbumCoverMenu: () => ipcRenderer.invoke('show-album-cover-menu'),
  onTrackToPlaylist: (cb) => ipcRenderer.once('track-to-playlist', (event, ...args) => cb(args)),
  onAlbumToPlaylist: (cb) => ipcRenderer.once('album-to-playlist', (event, ...args) => cb(args)),
  onRemoveFromPlaylist: (cb) =>
    ipcRenderer.once('remove-from-playlist', (event, ...args) => cb(args)),
  onAlbumCoverMenu: (cb) => ipcRenderer.once('album-menu', (event, ...args) => cb(args)),
  showChild: (arr) => ipcRenderer.invoke('show-child', arr)
  /* onAlbumCoverMenu: (cb) => ipcRenderer.once('add-album-to-playlist', (event, ...args) => cb(args)) */
};

/* ipcRenderer.on('track-to-playlist', (_event, arg) => {
  console.log(arg);
}); */

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI);
    contextBridge.exposeInMainWorld('api', api);
  } catch (error) {
    console.error(error);
  }
} else {
  window.electron = electronAPI;
  window.api = api;
}
