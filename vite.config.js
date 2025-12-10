import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    build: {
        rollupOptions: {
            output: {
                assetFileNames: (assetInfo) => {
                    // Keep logo.png without hash
                    if (assetInfo.name === 'UofM_Logo.png') {
                        return 'assets/UofM_Logo.png'
                    }
                    // Everything else gets hashed normally
                    return 'assets/[name]-[hash][extname]'
                }
            }
        }
    }
})