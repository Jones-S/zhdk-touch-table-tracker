import { fileURLToPath, URL } from 'node:url'
import svgLoader from 'vite-svg-loader'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '') // eslint-disable-line

  return {
    plugins: [vue(), svgLoader()],
    server: {
      port: 3000 // default: 5173
    },
    // when building and running the vue app inside an electron container
    // we need to change the relative paths to make sure index.html still finds file references
    // like src="/assets/index-f2976393.js"
    // changing the base will set src files now like:
    // src="./assets/index-b2808ef9.js"
    base: env.NODE_ENV === 'production' ? './' : '/',
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    }
  }
})
