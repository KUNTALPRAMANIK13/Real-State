import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  server:{
    proxy:{
      "/api":{
        target:'real-state-hsfa.vercel.app',
        secure: false
      },
    },
  },
  plugins: [react()],

})