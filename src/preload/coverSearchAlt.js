import { contextBridge, ipcRenderer } from 'electron';
import { electronAPI } from '@electron-toolkit/preload';

// Custom APIs for renderer
const coverSearchAltApi = {
  onSendToChild: (cb) => ipcRenderer.once('send-to-child', (event, args) => cb(args))
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

/* releases.release[0].results
releases.release[0].path
releases.release[1].searched */
