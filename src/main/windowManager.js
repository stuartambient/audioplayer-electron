const { BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');

class WindowManager {
  constructor() {
    this.windows = new Map();
  }

  createWindow(id, config, url) {
    if (this.windows.has(id)) {
      this.windows.get(id).focus();
      return;
    }

    const window = new BrowserWindow(config);

    window.on('ready-to-show', () => {
      window.show();
    });

    window.webContents.setWindowOpenHandler((details) => {
      shell.openExternal(details.url);
      return { action: 'deny' };
    });

    ipcMain.on('app-close', () => {
      window.close();
    });

    ipcMain.on('minimize', () => {
      window.minimize();
    });

    ipcMain.on('maximize', () => {
      if (window.isMaximized()) {
        window.unmaximize();
      } else {
        window.setMaximizable(true); // Ensure the window can be maximized
        window.maximize();
      }
    });

    window.loadURL(url);

    window.on('closed', () => {
      this.windows.delete(id);
    });

    this.windows.set(id, window);
  }

  getWindow(id) {
    return this.windows.get(id); // Retrieve a window by ID
  }
}

const windowManager = new WindowManager();
export default windowManager;
