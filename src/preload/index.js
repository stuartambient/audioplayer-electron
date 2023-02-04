import { contextBridge, ipcRenderer } from 'electron';
import { electronAPI } from '@electron-toolkit/preload';

// Custom APIs for renderer
const api = {
  updateFiles: () => ipcRenderer.invoke('update-files'),
  updateFolders: () => ipcRenderer.invoke('update-folders'),
  createTable: () => ipcRenderer.invoke('create-table'),
  getTracks: (page, term) => ipcRenderer.invoke('get-tracks', page, term),
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
  openChild: () => ipcRenderer.send('open-child'),
  totalTracksStat: () => ipcRenderer.invoke('total-tracks-stat'),
  topTenArtistsStat: () => ipcRenderer.invoke('top-ten-artists-stat'),
  last10AlbumsStat: () => ipcRenderer.invoke('last-10Albums-stat'),
  last100TracksStat: () => ipcRenderer.invoke('last-100Tracks-stat'),
  openPlaylist: () => ipcRenderer.invoke('open-playlist'),
  savePlaylist: (playlistTracks) => ipcRenderer.invoke('save-playlist', playlistTracks)
};

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
