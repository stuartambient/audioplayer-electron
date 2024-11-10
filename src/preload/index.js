import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('api', {
  updateFiles: () => ipcRenderer.invoke('update-files'),
  updateFolders: () => ipcRenderer.invoke('update-folders'),
  updateCovers: () => ipcRenderer.invoke('update-covers'),
  getTracks: (page, term, sort) => ipcRenderer.invoke('get-tracks', page, term, sort),
  getAlbums: (page, term, sort) => ipcRenderer.invoke('get-albums', page, term, sort),
  getAlbum: (id) => ipcRenderer.invoke('get-album', id),
  getAlbumTracks: (pattern) => ipcRenderer.invoke('get-album-tracks', pattern),
  getCover: (trackid) => ipcRenderer.invoke('get-cover', trackid),
  windowAction: (action) => ipcRenderer.send('window-action', action),
  screenMode: (size) => ipcRenderer.invoke('screen-mode', size),
  updateLike: (id) => ipcRenderer.invoke('update-like', id),
  isLiked: (id) => ipcRenderer.invoke('is-liked', id),
  totalTracksStat: () => ipcRenderer.invoke('total-tracks-stat'),
  topHundredArtistsStat: () => ipcRenderer.invoke('top-hundred-artists-stat'),
  last10AlbumsStat: () => ipcRenderer.invoke('last-10Albums-stat'),
  last100TracksStat: () => ipcRenderer.invoke('last-100Tracks-stat'),
  openPlaylist: () => ipcRenderer.invoke('open-playlist'),
  savePlaylist: (playlistTracks) => ipcRenderer.invoke('save-playlist', playlistTracks),
  getPlaylists: () => ipcRenderer.invoke('get-playlists'),
  getCovers: (coversPageNum, coversSearchTerm, coversDateSort, coversMissingReq) =>
    ipcRenderer.invoke(
      'get-covers',
      coversPageNum,
      coversSearchTerm,
      coversDateSort,
      coversMissingReq
    ),
  setShuffledTracksArray: () => ipcRenderer.invoke('set-shuffled-tracks-array'),
  getShuffledTracks: (start, end) => ipcRenderer.invoke('get-shuffled-tracks', start, end),
  showAlbumsMenu: () => ipcRenderer.invoke('show-albums-menu'),
  showAlbumCoverMenu: () => ipcRenderer.invoke('show-album-cover-menu'),
  showTextInputMenu: () => ipcRenderer.invoke('show-text-input-menu'),
  onEditTrackMetadata: (cb) => ipcRenderer.once('edit-metadata', (event, args) => cb(args)),
  onRemoveFromPlaylist: (cb) =>
    ipcRenderer.once('remove-from-playlist', (event, ...args) => cb(args)),
  onAlbumCoverMenu: (cb) => ipcRenderer.once('album-menu', (event, ...args) => cb(args)),
  showChild: (args) => ipcRenderer.invoke('show-child', args),
  onRefreshHomeCover: (cb) => ipcRenderer.on('refresh-home-cover', (event, ...args) => cb(args)),
  openAlbumFolder: (path) => ipcRenderer.invoke('open-album-folder', path),
  updateMeta: () => ipcRenderer.invoke('update-meta'),
  genresStat: () => ipcRenderer.invoke('genres-stat'),
  distinctDirectories: () => ipcRenderer.invoke('distinct-directories'),
  getTracksByArtist: (listType, artist) =>
    ipcRenderer.invoke('get-tracks-by-artist', listType, artist),
  getTracksByGenre: (listType, genre) => ipcRenderer.invoke('get-tracks-by-genre', listType, genre),
  getTracksByRoot: (root, listType) => ipcRenderer.invoke('get-tracks-by-root', root, listType),
  getTracksByAlbum: (listType, album) => ipcRenderer.invoke('get-tracks-by-album', listType, album),
  onTracksByAlbum: (cb) => ipcRenderer.on('album-tracks-loaded', (event, arg) => cb(arg)),
  showContextMenu: (id, itemType) => ipcRenderer.send('show-context-menu', id, itemType),
  onContextMenuCommand: (callback) => {
    ipcRenderer.once('context-menu-command', (event, command) => callback(command));
    return () => ipcRenderer.removeAllListeners('context-menu-command'); // Cleanup
  },
  getAlbumsByRoot: (roots) => ipcRenderer.invoke('get-albums-by-root', roots),
  toggleResizable: (isResizable) => ipcRenderer.send('toggle-resizable', isResizable),
  checkForOpenTable: (name) => ipcRenderer.invoke('check-for-open-table', name),
  clearTable: () => ipcRenderer.invoke('clear-table'),
  onUpdatedTags: (cb) => ipcRenderer.on('updated-tags', (event, msg) => cb(msg)),
  onChildWindowClosed: (cb) => ipcRenderer.on('window-closed', (event, name) => cb(name)),
  onUpdateFiles: (cb) => {
    ipcRenderer.on('file-update-complete', (event, result) => {
      cb(result);
    });
  },
  onUpdateFolders: (cb) => {
    ipcRenderer.on('folder-update-complete', (event, result) => {
      cb(result);
    });
  },
  onUpdateMetadata: (cb) => {
    ipcRenderer.on('meta-update-complete', (event, result) => {
      cb(result);
    });
  },
  onUpdateCovers: (cb) => {
    ipcRenderer.on('cover-update-complete', (event, result) => {
      cb(result);
    });
  },
  removeChildWindowClosedListener: (callback) => {
    ipcRenderer.removeListener('window-closed', callback);
  },
  getState: () => ipcRenderer.invole('get-prefernces'),
  saveState: (preferences) => {
    console.log('prefs: ', preferences);
    ipcRenderer.invoke('save-preferences', preferences);
  },
  getRoots: () => ipcRenderer.invoke('get-roots'),
  updateRoots: (roots) => ipcRenderer.invoke('update-roots', roots),
  getFolderPath: (folderName) => ipcRenderer.invoke('get-folder-path', folderName),
  off: (channel, callback) => ipcRenderer.removeListener(channel, callback)
});
