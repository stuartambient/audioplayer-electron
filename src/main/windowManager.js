const { app, BrowserWindow, ipcMain } = require('electron');
import { electronApp, optimizer, is } from '@electron-toolkit/utils';
const path = require('path');

const windows = new Map();
/* let splash;
const createSplash = () => {

  splash = new BrowserWindow({
    width: 400,
    height: 300,
    frame: false,
    alwaysOnTop: true,
    show: false
  });

  const url =
    is.dev && process.env['ELECTRON_RENDERER_URL']
      ? `${process.env['ELECTRON_RENDERER_URL']}/splash.html`
      : path.join(__dirname, `../renderer/splash.html`);

  is.dev ? splash.loadURL(url) : splash.loadFile(url);
}; */

function createOrUpdateChildWindow(name, config, data) {
  let window = windows.get(name);
  /*   if (!window) {
    createSplash();
    splash.show();
  } */
  if (window) {
    return window.webContents.send('send-to-child', data);
  }

  /*  if (!window) {
    createSplash();
    splash.show();
  } */

  if (!window) {
    window = new BrowserWindow({
      width: config.width,
      height: config.height,
      show: config.show,
      parent: windows.get(config.parent) || null,
      modal: !!config.parent,
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
    /* console.log(windows); */
    /* app.on('ready', () => {
      createSplash();
    }); */

    window.once('ready-to-show', () => {
      window.show();
      window.webContents.send('send-to-child', data);
    });
  }
}

function getWindow(win) {
  return windows.get(win);
}

function getWindowNames() {
  return Array.from(windows.keys());
}

export { createOrUpdateChildWindow, getWindowNames, getWindow };
