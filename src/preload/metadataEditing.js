import { contextBridge, ipcRenderer } from 'electron';
import { electronAPI } from '@electron-toolkit/preload';

// Custom APIs for renderer
const metadataEditingApi = {
  onSendToChild: (cb) => ipcRenderer.on('send-to-child', (event, arg) => cb(arg))
};

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI);
    contextBridge.exposeInMainWorld('metadataEditingApi', metadataEditingApi);
  } catch (error) {
    console.error(error);
  }
} else {
  window.electron = electronAPI;
  window.metadataEditingApi = metadataEditingApi;
}

/* releases.release[0].results
releases.release[0].path
releases.release[1].searched */
