/**
 * Link tra cứu trên QR / chia sẻ.
 * Khi deploy: đặt VITE_PUBLIC_APP_URL=https://ten-mien.com (không / cuối) để QR mở được từ Internet.
 */
export function getPublicAppOrigin() {
    const u = import.meta.env.VITE_PUBLIC_APP_URL?.trim?.()
    if (u) return u.replace(/\/$/, '')
    if (typeof window !== 'undefined') return window.location.origin
    return ''
}

export function getPublicTraceUrl(batchcode) {
    const base = getPublicAppOrigin()
    if (!batchcode) return `${base}/trace`
    return `${base}/trace?code=${encodeURIComponent(batchcode)}`
}
