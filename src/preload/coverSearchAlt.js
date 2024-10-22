import { contextBridge, ipcRenderer } from 'electron';

/* const coverSearchAltApi = {
  onSendToChild: (cb) => ipcRenderer.once('send-to-child', (event, args) => cb(args)),
  iframeLinks: () => ipcRenderer.send('iframe-links'),
  onIframeLink: (cb) => ipcRenderer.on('iframe-link', (event, url) => cb(url)),
  off: (channel, callback) => ipcRenderer.removeListener(channel, callback)
}; */

contextBridge.exposeInMainWorld('coverSearchAltApi', {
  onSendToChild: (cb) => ipcRenderer.on('send-to-child', (event, args) => cb(args)),
  notifyReady: () => ipcRenderer.send('child-ready'),
  getTempPath: () => ipcRenderer.invoke('get-temp-path'),
  downloadFile: (fileUrl, savepath, listType) =>
    ipcRenderer.invoke('download-file', fileUrl, savepath, listType),
  onDownloadFile: (cb) => ipcRenderer.on('download-completed', (event, ...args) => cb(args)),
  downloadTagImage: (fileUrl, savepath, listType) =>
    ipcRenderer.invoke('download-tag-image', fileUrl, savepath, listType),
  showContextMenu: (id, itemType) => ipcRenderer.send('show-context-menu', id, itemType),
  onContextMenuCommand: (callback) => {
    ipcRenderer.on('context-menu-command', (event, command) => callback(command));
    /* return () => ipcRenderer.removeAllListeners('context-menu-command'); */ // Cleanup
  },
  getWindowName: () => ipcRenderer.invoke('get-window-name', event),
  off: (channel, callback) => ipcRenderer.removeListener(channel, callback)
});

/* if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI);
    contextBridge.exposeInMainWorld('coverSearchAltApi', coverSearchAltApi);
  } catch (error) {
    console.error(error);
  }
} else {
  window.electron = electronAPI;
  window.coverSearchAltApi = coverSearchAltApi;
} */
