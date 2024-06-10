import { contextBridge, ipcRenderer } from 'electron';
import { electronAPI } from '@electron-toolkit/preload';

// Custom APIs for renderer
/* const metadataEditingApi = {
  onSendToChild: (cb) => ipcRenderer.on('send-to-child', (event, arg) => cb(arg)),
  updateTags: (arr) => ipcRenderer.invoke('update-tags', arr)
}; */

contextBridge.exposeInMainWorld('metadataEditingApi', {
  onSendToChild: (cb) => ipcRenderer.on('send-to-child', (event, arg) => cb(arg)),
  updateTags: (arr) => ipcRenderer.invoke('update-tags', arr),
  showChild: (args) => ipcRenderer.invoke('show-child', args),
  onClearTable: (cb) => ipcRenderer.on('clear-table', (event, arg) => cb(arg)),
  off: (channel, callback) => ipcRenderer.removeListener(channel, callback)
});

/* if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI);
    contextBridge.exposeInMainWorld('metadataEditingApi', metadataEditingApi);
  } catch (error) {
    console.error(error);
  }
} else {
  window.electron = electronAPI;
  window.metadataEditingApi = metadataEditingApi;
} */

/* releases.release[0].results
releases.release[0].path
releases.release[1].searched */
