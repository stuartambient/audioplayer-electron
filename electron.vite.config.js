import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { builtinModules } from 'module';
import { defineConfig, externalizeDepsPlugin } from 'electron-vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    build: {
      rollupOptions: {
        external: ['src/db/music.db'], // Exclude the database file
        input: {
          index: resolve(__dirname, 'src/main/index.js'),
          updateFilesWorker: resolve(__dirname, 'src/main/updateFilesWorker.js')
        }
      }
    }
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'src/preload/index.js'),
          coverSearch: resolve(__dirname, 'src/preload/coverSearch.js'),
          metadataEditing: resolve(__dirname, 'src/preload/metadataEditing.js'),
          tagForm: resolve(__dirname, 'src/preload/tagForm.js')
        },
        external: ['src/db/music.db'] // Exclude the database file
      }
    }
  },
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src'),
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    build: {
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'src/renderer/index.html'),
          coverSearch: resolve(__dirname, 'src/renderer/coverSearch.html'),
          metadataEditing: resolve(__dirname, 'src/renderer/metadataEditing.html'),
          tagForm: resolve(__dirname, 'src/renderer/tagForm.html'),
          splash: resolve(__dirname, 'src/renderer/splash.html')
        },
        external: ['src/db/music.db'] // Exclude the database file
      }
    },
    plugins: [react()]
  }
});
