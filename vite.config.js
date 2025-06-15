import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '~': '/src',
      '~components': '/src/components',
      '~css': '/src/css',
      '~pages': '/src/pages',
      'amplify-json': '/amplify_outputs.json',
      "~utils": '/src/utils',
      "~amplify": '/amplify',
      "~assets": '/src/assets',
      "~layouts": '/src/layouts',
      "~providers": '/src/providers',
      "~data": '/src/data',
    },
  },
})
