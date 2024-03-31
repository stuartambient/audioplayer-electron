const { app, BrowserWindow, ipcMain } = require('electron');
import { electronApp, optimizer, is } from '@electron-toolkit/utils';
const path = require('path');

// Store windows by name
const windows = new Map();

/* if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
  mainWindow.loadURL(`${process.env['ELECTRON_RENDERER_URL']}/index.html`);
} else {
  mainWindow.loadFile(`path.join(__dirname, '../renderer/index.html`);
}
 */

// Utility function to create or update child windows
function createOrUpdateChildWindow(name, config, data) {
  let window = windows.get(name);

  if (!window) {
    window = new BrowserWindow({
      width: config.width,
      height: config.height,
      show: config.show,
      resizable: config.resizable,
      webPreferences: {
        preload: path.join(__dirname, `../preload/${config.preload}`),
        sandbox: config.sandbox,
        webSecurity: config.webSecurity,
        contextIsolation: config.contextIsolation
      }
    });

    const url =
      is.dev && process.env['ELECTRON_RENDERER_URL']
        ? `${process.env['ELECTRON_RENDERER_URL']}/child.html`
        : path.join(__dirname, '../renderer/child.html');

    is.dev ? window.loadURL(url) : window.loadFile(url);

    window.on('closed', () => {
      windows.delete(name);
    });

    windows.set(name, window);

    window.once('ready-to-show', () => {
      window.show();
    });
    window.webContents.send('send-to-child', data);
  }

  /* window.webContents.send('send-to-child', args); */
}

/* ipcMain.handle('show-child', (event, args) => {
  const name = args.name || 'defaultChildWindow'; 
  createOrUpdateChildWindow(name, args);
});

app.whenReady().then(() => {

}); */

export default createOrUpdateChildWindow;
