import { contextBridge, ipcRenderer } from 'electron';
import { electronAPI } from '@electron-toolkit/preload';

const coverSearchAltApi = {
  onSendToChild: (cb) => ipcRenderer.once('send-to-child', (event, args) => cb(args)),
  iframeLinks: () => ipcRenderer.send('iframe-links'),
  onIframeLink: (cb) => ipcRenderer.on('iframe-link', (event, url) => cb(url)),
  off: (channel, callback) => ipcRenderer.removeListener(channel, callback)
};

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI);
    contextBridge.exposeInMainWorld('coverSearchAltApi', coverSearchAltApi);
  } catch (error) {
    console.error(error);
  }
} else {
  window.electron = electronAPI;
  window.coverSearchAltApi = coverSearchAltApi;
}