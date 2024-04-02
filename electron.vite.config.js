import { resolve } from 'path';
import { defineConfig, externalizeDepsPlugin } from 'electron-vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()]
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'src/preload/index.js'),
          coverSearch: resolve(__dirname, 'src/preload/coverSearch.js'),
          metadataEditing: resolve(__dirname, 'src/preload/metadataEditing.js')
        }
      }
    }
  },
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src')
      }
    },
    build: {
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'src/renderer/index.html'),
          coverSearch: resolve(__dirname, 'src/renderer/coverSearch.html'),
          metadataEditing: resolve(__dirname, 'src/renderer/metadataEditing.html')
        }
      }
    },
    plugins: [react()]
  }
});
