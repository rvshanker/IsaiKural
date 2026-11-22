import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, type Plugin} from 'vite';
import {KURAL_MEDIA} from './src/data/kuralMedia';

/** Publishes the song list as /kural-media.json so the iPhone app picks up new songs without an App Store update. */
function songListFile(): Plugin {
  return {
    name: 'isaikural-song-list',
    apply: 'build',
    generateBundle() {
      this.emitFile({type: 'asset', fileName: 'kural-media.json', source: JSON.stringify(KURAL_MEDIA)});
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), songListFile()],
    resolve: {
      alias: {
        '@': path.resolve(process.cwd(), '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
