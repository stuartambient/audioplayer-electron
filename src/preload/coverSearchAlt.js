import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('coverSearchAltApi', {
  onSendToChild: (cb) => ipcRenderer.on('send-to-child', (event, args) => cb(args)),
  notifyReady: () => ipcRenderer.send('child-ready'),
  getTempPath: () => ipcRenderer.invoke('get-temp-path'),
  downloadFile: (fileUrl, savepath, listType) =>
    ipcRenderer.invoke('download-file', fileUrl, savepath, listType),
  onDownloadFile: (cb) => ipcRenderer.on('download-completed', (event, ...args) => cb(args)),
  downloadTagImage: (fileUrl, savepath, listType, delayDownload) =>
    ipcRenderer.invoke('download-tag-image', fileUrl, savepath, listType, delayDownload),
  showContextMenu: (id, itemType) => ipcRenderer.send('show-context-menu', id, itemType),
  onContextMenuCommand: (callback) => {
    ipcRenderer.on('context-menu-command', (event, command) => callback(command));
    /* return () => ipcRenderer.removeAllListeners('context-menu-command'); */ // Cleanup
  },
  off: (channel, callback) => ipcRenderer.removeListener(channel, callback)
});
