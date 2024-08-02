import { contextBridge, ipcRenderer } from 'electron';

/* const coverSearchAltApi = {
  onSendToChild: (cb) => ipcRenderer.once('send-to-child', (event, args) => cb(args)),
  iframeLinks: () => ipcRenderer.send('iframe-links'),
  onIframeLink: (cb) => ipcRenderer.on('iframe-link', (event, url) => cb(url)),
  off: (channel, callback) => ipcRenderer.removeListener(channel, callback)
}; */

contextBridge.exposeInMainWorld('coverSearchAltApi', {
  onSendToChild: (cb) => ipcRenderer.once('send-to-child', (event, args) => cb(args)),
  downloadFile: (fileUrl, savepath) => ipcRenderer.invoke('download-file', fileUrl, savepath),
  showContextMenu: (id, itemType) => ipcRenderer.send('show-context-menu', id, itemType),
  onContextMenuCommand: (callback) => {
    ipcRenderer.once('context-menu-command', (event, command) => callback(command));
    return () => ipcRenderer.removeAllListeners('context-menu-command'); // Cleanup
  },
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
