import { contextBridge, ipcRenderer } from 'electron';
import { electronAPI } from '@electron-toolkit/preload';

// Custom APIs for renderer
const childapi = {
  onSendToChild: (cb) => ipcRenderer.once('send-to-child', (event, ...args) => cb(args)),
  downloadFile: (fileUrl, savepath) => ipcRenderer.invoke('download-file', fileUrl, savepath)
};

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI);
    contextBridge.exposeInMainWorld('childapi', childapi);
  } catch (error) {
    console.error(error);
  }
} else {
  window.electron = electronAPI;
  window.childapi = childapi;
}
