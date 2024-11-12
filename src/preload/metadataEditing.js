import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('metadataEditingApi', {
  onSendToChild: (cb) => ipcRenderer.on('send-to-child', (event, arg) => cb(arg)),
  updateTags: (arr) => ipcRenderer.invoke('update-tags', arr),
  onUpdateTagsStatus: (cb) => ipcRenderer.on('update-tags', (event, msg) => cb(msg)),
  selectImageFromFolder: (arr) => ipcRenderer.invoke('select-image-from-folder', arr),
  onSelectedImage: (cb) => ipcRenderer.on('selected-image', (event, msg) => cb(msg)),
  onDownloadedImage: (cb) => ipcRenderer.on('downloaded-image', (event, img) => cb(img)),
  showChild: (args) => ipcRenderer.invoke('show-child', args),
  onClearTable: (cb) => ipcRenderer.on('clear-table', (event, arg) => cb(arg)),
  getRoots: () => ipcRenderer.invoke('get-roots'),
  getPreferences: () => ipcRenderer.invoke('get-preferences'),
  savePreferences: (preferences) => ipcRenderer.invoke('save-preferences', preferences),
  showContextMenu: (id, itemType) => ipcRenderer.send('show-context-menu', id, itemType),
  onContextMenuCommand: (callback) => {
    ipcRenderer.on('context-menu-command', (event, command) => callback(command));
  },
  onFormMenuCommand: (callback) => {
    ipcRenderer.on('form-menu-command', (event, command) => callback(command));
  },
  onImagesForSubmit: (callback) => {
    ipcRenderer.on('for-submit-form', (event, command) => callback(command));
  },
  off: (channel, callback) => ipcRenderer.removeListener(channel, callback)
});
