import { app, BrowserWindow, ipcMain } from 'electron';
import { /* electronApp, optimizer,  */ is } from '@electron-toolkit/utils';
import path from 'node:path';
/* import { EventEmitter } from 'node:events'; */
import { mainWindow } from './index.js';

const windows = new Map();

function createOrUpdateChildWindow(name, type, config, data) {
  console.log('name: ', name, 'type: ', type);
  let window = windows.get(name);
  if (window) {
    console.log(`Window ${name} already exists. Sending data to it.`);
    return window.webContents.send('send-to-child', data);
  }

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
        contextIsolation: config.contextIsolation,
        nodeIntegration: false
      }
    });

    window.removeMenu();

    const url =
      is.dev && process.env['ELECTRON_RENDERER_URL']
        ? `${process.env['ELECTRON_RENDERER_URL']}/${config.preload}.html`
        : path.join(__dirname, `../renderer/${config.preload}.html`);

    is.dev ? window.loadURL(url) : window.loadFile(url);
  }

  window.on('closed', () => {
    console.log(`Window ${name} closed`);
    windows.delete(name);
    mainWindow.webContents.send('window-closed', name);
  });

  windows.set(name, window);

  /*   window.once('ready-to-show', () => {
    window.show();
    if (window.isFocusable()) {
      window.webContents.send('send-to-child', data);
    }
  }); */

  let readyToShow = false;
  let childReady = false;

  const sendDataIfReady = () => {
    if (readyToShow && childReady) {
      console.log('=====> Both events occurred. Sending data...');
      window.webContents.send('send-to-child', data);
    }
  };

  window.once('ready-to-show', () => {
    console.log('=====> ready-to-show');
    readyToShow = true;
    window.show();
    sendDataIfReady();
  });

  ipcMain.removeAllListeners('child-ready'); // Clear any previous listeners

  ipcMain.once('child-ready', () => {
    console.log('=====> Child window is ready.');
    /* if (window.webContents) {
      window.webContents.send('send-to-child', data);
    } */
    childReady = true;
    sendDataIfReady();
  });
}

function getWindow(win) {
  return windows.get(win);
}

function getWindowNames() {
  return Array.from(windows.keys());
}

export { createOrUpdateChildWindow, getWindowNames, getWindow };
