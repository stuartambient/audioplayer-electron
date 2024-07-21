import { contextBridge, ipcRenderer } from 'electron';
import { electronAPI } from '@electron-toolkit/preload';

// Custom APIs for renderer
const coverSearchAltApi = {};

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI);
    contextBridge.exposeInMainWorld('coverSearchAltApi', coverSearchAltApi);
  } catch (error) {
    console.error(error);
  }
} else {
  window.electron = electronAPI;
  window.coverSearchApi = coverSearchApi;
}

/* releases.release[0].results
releases.release[0].path
releases.release[1].searched */
