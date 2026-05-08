import { api } from './api';

// ── token helpers ─────────────────────────────────────────────────────────────
const TOKEN_KEY = 'token';
const USER_KEY  = 'user';

const storage = {
    getToken : ()        => localStorage.getItem(TOKEN_KEY),
    setToken : (token)   => localStorage.setItem(TOKEN_KEY, token),
    getUser  : ()        => { try { return JSON.parse(localStorage.getItem(USER_KEY)); } catch { return null; } },
    setUser  : (user)    => localStorage.setItem(USER_KEY, JSON.stringify(user)),
    clear    : ()        => { localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(USER_KEY); },
};

export const authService = {
    // ── auth core ─────────────────────────────────────────────────────────────
    login: async (data) => {
        const res = await api.post('/auth/login', {
            ...data,
            username: data.username?.trim(),
            email:    data.email?.trim(),
        });
        // tự động lưu token + user sau khi login thành công
        const { token, user } = res.data;
        if (token) storage.setToken(token);
        if (user)  storage.setUser(user);
        return res;
    },

    register: (data) => api.post('/auth/register', {
        ...data,
        username: data.username?.trim(),
        email:    data.email?.trim(),
        fullName: data.fullName?.trim(),
        phone:    data.phone?.trim(),
    }),

    logout: () => storage.clear(),

    // ── lấy thông tin user hiện tại ───────────────────────────────────────────
    getMe: () => api.get('/auth/me'),

    refreshMe: async () => {
        const res = await api.get('/auth/me');
        if (res.data) storage.setUser(res.data);
        return res;
    },

    // ── kiểm tra unique (dùng cho debounce trong RegisterPage) ───────────────
    checkUsername: (username) =>
        api.get('/auth/check-username', { params: { username: username.trim() } }),

    checkEmail: (email) =>
        api.get('/auth/check-email', { params: { email: email.trim() } }),

    // ── đọc từ localStorage (không cần gọi API) ───────────────────────────────
    getCurrentUser  : () => storage.getUser(),
    getToken        : () => storage.getToken(),
    isAuthenticated : () => !!storage.getToken(),

    // ── kiểm tra role ─────────────────────────────────────────────────────────
    isAdmin  : () => storage.getUser()?.role === 'admin',
    isFarmer : () => storage.getUser()?.role === 'farmer',
    isStaff  : () => storage.getUser()?.role === 'staff',
};