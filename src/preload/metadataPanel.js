import { contextBridge, ipcRenderer } from 'electron';
import { electronAPI } from '@electron-toolkit/preload';

// Custom APIs for renderer
contextBridge.exposeInMainWorld('api', {
  /* testRealStream: (path) => ipcRenderer.send('test-real-stream', path), */
  /* testRealStream: async (path) =>
    await fetch(`streaming://${path}`, { method: 'GET' }).then((res) => console.log(res.url)) */
  /*   onStartStream: (stream) => ipcRenderer.on('start-stream', (args) => args) */
  /* onAlbumCoverMenu: (cb) => ipcRenderer.once('add-album-to-playlist', (event, ...args) => cb(args)) */
});
