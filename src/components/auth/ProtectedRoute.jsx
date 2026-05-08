// src/components/auth/ProtectedRoute.jsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    const { user, loading } = useAuth();
    const location = useLocation();
    const currentRole = String(user?.role || "").trim().toLowerCase();
    const normalizedAllowedRoles = allowedRoles.map((r) =>
        String(r).trim().toLowerCase()
    );

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-500 text-sm">Đang kiểm tra xác thực...</p>
            </div>
        </div>
    );

    if (!user) return <Navigate to="/login" state={{ from: location }} replace />;

    if (
        normalizedAllowedRoles.length > 0 &&
        !normalizedAllowedRoles.includes(currentRole)
    )
        return <Navigate to="/" replace />;

    return children;
};

export default ProtectedRoute;