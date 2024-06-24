import { contextBridge, ipcRenderer } from 'electron';
import { electronAPI } from '@electron-toolkit/preload';

// Custom APIs for renderer
contextBridge.exposeInMainWorld('tagFormApi', {});
