import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    base: "/Fancy-Schedule-Maker/",
    build: {
        rollupOptions: {
            output: {
                assetFileNames: (assetInfo) => {
                    // Keep logo.png without hash
                    if (assetInfo.name === 'logo.png') {
                        return 'assets/logo.png'
                    }
                    // Everything else gets hashed normally
                    return 'assets/[name]-[hash][extname]'
                }
            }
        }
    }
})