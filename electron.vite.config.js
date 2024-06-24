import { resolve } from 'path';
import { fileURLToPath } from 'url';
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
          metadataEditing: resolve(__dirname, 'src/preload/metadataEditing.js'),
          tagForm: resolve(__dirname, 'src/preload/tagForm.js')
        }
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
        }
      }
    },
    plugins: [react()]
  }
});
