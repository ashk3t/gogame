import {defineConfig, splitVendorChunkPlugin} from "vite"
import react from "@vitejs/plugin-react-swc"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), splitVendorChunkPlugin()],
  preview: {
    host: true,
    port: 3000,
  },
  build: {
    rollupOptions: {
      output: {
        assetFileNames: "gogame/assets/[name]-[hash][extname]",
        chunkFileNames: "gogame/assets/[name]-[hash].js",
        entryFileNames: "gogame/assets/[name].js",
      },
    },
  },
})