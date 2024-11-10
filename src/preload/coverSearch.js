import { contextBridge, ipcRenderer } from 'electron';
import { electronAPI } from '@electron-toolkit/preload';

const coverSearchApi = {
  onSendToChild: (cb) => ipcRenderer.once('send-to-child', (event, args) => cb(args)),
  downloadFile: (fileUrl, savepath) => ipcRenderer.invoke('download-file', fileUrl, savepath),
  refreshCover: (cover, path) => ipcRenderer.invoke('refresh-cover', cover, path)
};

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI);
    contextBridge.exposeInMainWorld('coverSearchApi', coverSearchApi);
  } catch (error) {
    console.error(error);
  }
} else {
  window.electron = electronAPI;
  window.coverSearchApi = coverSearchApi;
}
