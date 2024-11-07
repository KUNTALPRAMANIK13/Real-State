import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  server:{
    proxy:{
      "/api":{
        target:'https://real-state-iota-inky.vercel.app',
        secure: false
      },
    },
  },
  plugins: [react()],

})