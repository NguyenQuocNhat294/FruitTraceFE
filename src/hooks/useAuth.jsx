// src/hooks/useAuth.jsx

import React, {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";

const ROLE_REDIRECTS = {
    admin: "/admin",
    farmer: "/farm",
    farm: "/farm",
    staff: "/staff",
};

// Demo fallback khi backend chưa hoạt động
const DEMO_USERS = {
    admin: {
        id: "U001",
        username: "admin",
        email: "admin@gmail.com",
        role: "admin",
        avatar: "/images/admin.jpeg",
    },

    farmer_bay: {
        id: "U002",
        username: "farmer_bay",
        email: "bay@gmail.com",
        role: "farmer",
        avatar: "/images/farmer.jpg",
    },

    staff_quan: {
        id: "U003",
        username: "staff_quan",
        email: "quan@gmail.com",
        role: "staff",
        avatar: "/images/staff.jpg",
    },
};

const AuthContext = createContext({
    user: null,
    loading: true,

    login: async () => ({
        success: false,
    }),

    logout: () => {},

    getRoleRedirect: () => "/",
});

export function AuthProvider({ children }) {

    const [user, setUser] = useState(null);

    const [loading, setLoading] = useState(true);

    // ─────────────────────────────────────────────
    // Restore session
    // ─────────────────────────────────────────────
    useEffect(() => {

        try {

            const rawUser =
                localStorage.getItem("fruittrace_user");

            const token =
                localStorage.getItem("token");

            if (rawUser && token) {

                const parsedUser = JSON.parse(rawUser);

                setUser(parsedUser);
            }

        } catch (err) {

            console.error(
                "Restore session error:",
                err
            );

            localStorage.removeItem("token");

            localStorage.removeItem("fruittrace_user");
        }

        setLoading(false);

    }, []);

    // ─────────────────────────────────────────────
    // LOGIN
    // ─────────────────────────────────────────────
    const login = async ({
        username,
        password,
    }) => {

        try {

            const { api } =
                await import("../services/api");

            const res = await api.post(
                "/auth/login",
                {
                    username,
                    password,
                },
                {
                    withCredentials: true,
                }
            );

            console.log(
                "✅ LOGIN RESPONSE:",
                res.data
            );

            // hỗ trợ nhiều kiểu response
            const token =
                res.data?.token ||
                res.data?.data?.token;

            const userData =
                res.data?.user ||
                res.data?.data?.user;

            if (!token) {

                console.error(
                    "❌ Token undefined"
                );

                return {
                    success: false,
                    error:
                        "Backend không trả token",
                };
            }

            // lưu token
            localStorage.setItem(
                "token",
                token
            );

            // lưu user
            localStorage.setItem(
                "fruittrace_user",
                JSON.stringify(userData)
            );

            // set default auth header
            api.defaults.headers.common[
                "Authorization"
            ] = `Bearer ${token}`;

            // update state
            setUser(userData);

            return {
                success: true,
                user: userData,
            };

        } catch (apiErr) {

            console.warn(
                "❌ API login failed:",
                apiErr
            );

            // ─────────────────────────────
            // DEMO FALLBACK
            // password = username
            // ─────────────────────────────
            const demo =
                DEMO_USERS[username];

            if (
                demo &&
                password === username
            ) {

                localStorage.setItem(
                    "fruittrace_user",
                    JSON.stringify(demo)
                );

                setUser(demo);

                return {
                    success: true,
                    user: demo,
                };
            }

            const isNetwork =
                !apiErr?.response &&
                (
                    apiErr?.code ===
                    "ERR_NETWORK" ||

                    apiErr?.message ===
                    "Network Error" ||

                    String(
                        apiErr?.message || ""
                    )
                        .toLowerCase()
                        .includes("network")
                );

            return {
                success: false,

                error: isNetwork
                    ? "Không kết nối được API (CORS / Render / mạng)"
                    : apiErr?.response?.data?.message ||
                    apiErr?.message ||
                    "Sai tài khoản hoặc mật khẩu",
            };
        }
    };

    // ─────────────────────────────────────────────
    // LOGOUT
    // ─────────────────────────────────────────────
    const logout = async () => {

        try {

            const { api } =
                await import("../services/api");

            await api.post(
                "/auth/logout",
                {},
                {
                    withCredentials: true,
                }
            );

        } catch (err) {

            console.warn(
                "Logout API failed:",
                err
            );
        }

        localStorage.removeItem("token");

        localStorage.removeItem(
            "fruittrace_user"
        );

        setUser(null);
    };

    // ─────────────────────────────────────────────
    // ROLE REDIRECT
    // ─────────────────────────────────────────────
    const getRoleRedirect = (role) =>
        ROLE_REDIRECTS[role] || "/";

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                login,
                logout,
                getRoleRedirect,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

// ─────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────
export function useAuth() {
    return useContext(AuthContext);
}
