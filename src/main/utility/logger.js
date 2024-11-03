const winston = require('winston');
import path from 'node:path';
import { app } from 'electron';

// Create the Winston logger
const logPath = path.join(app.getPath('documents'), 'ElectronMusicplayer', 'logs', 'app.log');
export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
  transports: [new winston.transports.File({ filename: logPath, level: 'error' })]
});
