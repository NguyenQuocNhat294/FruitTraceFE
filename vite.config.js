import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '')
    const target = env.VITE_PROXY_TARGET || 'http://127.0.0.1:5000'

    return {
        plugins: [react()],
        server: {
            proxy: {
                // Cùng origin với trang (kể cả mở bằng 192.168.x.x) — tránh lỗi localhost trên điện thoại sau khi quét QR
                '/api': {
                    target,
                    changeOrigin: true,
                },
                '/images': {
                    target,
                    changeOrigin: true,
                },
            },
        },
    }
})
