import { BrowserWindow } from 'electron';

class WindowManager {
  constructor() {
    this.windows = new Map();
  }

  createMainWindow(config, url) {
    const id = 'main'; // A fixed ID for the main window
    if (this.windows.has(id)) {
      console.error('Main window already exists.');
      return this.windows.get(id);
    }

    const mainWindow = new BrowserWindow(config);
    mainWindow.loadURL(url);

    mainWindow.on('closed', () => {
      this.windows.delete(id);
    });

    this.windows.set(id, mainWindow);
    return mainWindow;
  }

  createChildWindow(id, config, url) {
    if (this.windows.has(id)) {
      const existingWindow = this.windows.get(id);
      existingWindow.focus();
      return existingWindow;
    }

    const childWindow = new BrowserWindow(config);
    childWindow.loadURL(url);

    childWindow.on('closed', () => {
      this.windows.delete(id);
    });

    this.windows.set(id, childWindow);
    return childWindow;
  }

  getWindow(id) {
    return this.windows.get(id);
  }

  // You can add more methods as needed, for example, to send data to specific windows, close all windows, etc.
}

const windowManager = new WindowManager();
export default windowManager;
