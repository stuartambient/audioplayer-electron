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
          child: resolve(__dirname, 'src/preload/child.js'),
          list: resolve(__dirname, 'src/preload/list.js'),
          metadataPanel: resolve(__dirname, 'src/preload/metadataPanel.js')
          /* list: resolve(__dirname, 'src/renderer/list.js') */
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
          child: resolve(__dirname, 'src/renderer/child.html'),
          list: resolve(__dirname, 'src/renderer/list.html')
        }
      }
    },
    plugins: [react()]
  }
});
