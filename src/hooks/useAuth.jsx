// src/hooks/useAuth.jsx
import React, { createContext, useContext, useEffect, useState } from "react";

const ROLE_REDIRECTS = {
    admin:  "/admin",
    farmer: "/farm",
    farm:   "/farm",
    staff:  "/staff",
};

// Demo fallback khi backend chưa hoạt động
const DEMO_USERS = {
    "admin":      { id:"U001", username:"admin",      email:"admin@gmail.com",   role:"admin",  avatar:"/images/admin.jpeg" },
    "farmer_bay": { id:"U002", username:"farmer_bay", email:"bay@gmail.com",     role:"farmer", avatar:"/images/farmer.jpg" },
    "staff_quan": { id:"U003", username:"staff_quan", email:"quan@gmail.com",    role:"staff",  avatar:"/images/staff.jpg"  },
};

const AuthContext = createContext({
    user: null, loading: true,
    login: async () => ({ success: false }),
    logout: () => {},
    getRoleRedirect: () => "/",
});

export function AuthProvider({ children }) {
    const [user, setUser]       = useState(null);
    const [loading, setLoading] = useState(true);

    // Khôi phục session khi refresh
    useEffect(() => {
        const raw = localStorage.getItem("fruittrace_user");
        if (raw) {
            try { setUser(JSON.parse(raw)); }
            catch { localStorage.removeItem("fruittrace_user"); }
        }
        setLoading(false);
    }, []);

    const login = async ({ username, password }) => {
        // 1. Thử API thật trước
        try {
            const { api } = await import("../services/api");
            const res = await api.post("/auth/login", { username, password });
            const { token, user: userData } = res.data;

            localStorage.setItem("token", token);
            localStorage.setItem("fruittrace_user", JSON.stringify(userData));
            setUser(userData);
            return { success: true, user: userData };
        } catch (apiErr) {
            console.warn("API login failed, trying demo:", apiErr?.response?.data?.message);

            // 2. Fallback demo users (password = username)
            const demo = DEMO_USERS[username];
            if (demo && password === username) {
                localStorage.setItem("fruittrace_user", JSON.stringify(demo));
                setUser(demo);
                return { success: true, user: demo };
            }

            const isNetwork =
                !apiErr?.response &&
                (apiErr?.code === "ERR_NETWORK" ||
                    apiErr?.message === "Network Error" ||
                    String(apiErr?.message || "").toLowerCase().includes("network"));

            return {
                success: false,
                error: isNetwork
                    ? "Không kết nối được API (CORS/ngrok/mạng). Chạy backend cập nhật hoặc dùng VITE_API_BASE_URL=http://localhost:5000/api"
                    : apiErr?.response?.data?.message || "Sai tài khoản hoặc mật khẩu",
            };
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem("token");
        localStorage.removeItem("fruittrace_user");
    };

    const getRoleRedirect = (role) => ROLE_REDIRECTS[role] || "/";

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, getRoleRedirect }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}