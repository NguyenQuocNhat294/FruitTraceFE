import axios from 'axios'

const envBase = import.meta.env.VITE_API_BASE_URL?.trim?.()
// Dev: mặc định /api → Vite proxy tới backend (điện thoại/LAN IP vẫn gọi đúng máy dev)
// Set VITE_API_BASE_URL đầy đủ (ngrok, v.v.) khi cần gọi API từ xa
export const api = axios.create({
    baseURL: envBase || '/api',
    headers: {
        'ngrok-skip-browser-warning': 'true',
    },

    timeout: 15_000,
})

api.interceptors.request.use((config) => {
    // Thêm token nếu có
    const token = localStorage.getItem('token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
})

api.interceptors.response.use(
    (res) => res,
    (err) => {
        // Log hoặc xử lý lỗi tập trung
        console.error('API error:', err?.response?.status, err?.message)
        return Promise.reject(err)
    }
)