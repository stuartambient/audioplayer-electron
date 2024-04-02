const { app, BrowserWindow, ipcMain } = require('electron');
import { electronApp, optimizer, is } from '@electron-toolkit/utils';
const path = require('path');

// Store windows by name
const windows = new Map();

function createOrUpdateChildWindow(name, config, data) {
  console.log(`${process.env['ELECTRON_RENDERER_URL']}/${config.preload}.html`);

  let window = windows.get(name);
  if (window) {
    return window.webContents.send('send-to-child', data);
  }

  if (!window) {
    window = new BrowserWindow({
      width: config.width,
      height: config.height,
      show: config.show,
      resizable: config.resizable,
      webPreferences: {
        preload: path.join(__dirname, `../preload/${config.preload}.js`),
        sandbox: config.sandbox,
        webSecurity: config.webSecurity,
        contextIsolation: config.contextIsolation
      }
    });

    const url =
      is.dev && process.env['ELECTRON_RENDERER_URL']
        ? `${process.env['ELECTRON_RENDERER_URL']}/${config.preload}.html`
        : path.join(__dirname, `../renderer/${config.preload}.html`);

    is.dev ? window.loadURL(url) : window.loadFile(url);

    window.on('closed', () => {
      windows.delete(name);
    });

    windows.set(name, window);
    console.log(windows);

    window.once('ready-to-show', () => {
      window.show();
      window.webContents.send('send-to-child', data);
    });
  }
}

export default createOrUpdateChildWindow;
