// src/components/layout/Sidebar.jsx
import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { UserAvatar } from "../common/ImageDisplay";

const MENU = {
    admin: [
        { section: "Tổng quan", items: [
                { to: "/admin", end: true, label: "Dashboard", icon: "📊" },
                { to: "/admin/analytics", label: "Phân tích", icon: "📈" },
            ]},
        { section: "Quản lý", items: [
                { to: "/admin/users", label: "Người dùng", icon: "👥" },
                { to: "/admin/farms", label: "Nông trại", icon: "🌾" },
                { to: "/admin/batches", label: "Lô hàng", icon: "📦" },
                { to: "/admin/inspections", label: "Kiểm định", icon: "🔬" },
            ]},
        { section: "Hệ thống", items: [
                { to: "/admin/trace-logs", label: "Trace Logs", icon: "📋" },
                { to: "/admin/settings", label: "Cài đặt", icon: "⚙️" },
            ]},
    ],
    farmer: [
        { section: "Tổng quan", items: [
                { to: "/farm", end: true, label: "Dashboard", icon: "🌾" },
                { to: "/farm/mybatches", label: "Lô hàng của tôi", icon: "📦" },
            ]},
        { section: "Công cụ", items: [
                { to: "/farm/qr", label: "Tạo QR Code", icon: "📱" },
                { to: "/farm/gallery", label: "Thư viện ảnh", icon: "🖼️" },
                { to: "/farm/calendar", label: "Lịch công việc", icon: "📅" },
            ]},
        { section: "Báo cáo", items: [
                { to: "/farm/revenue", label: "Doanh thu", icon: "💰" },
                { to: "/farm/staff-management", label: "Nhân viên", icon: "👷" },
            ]},
    ],
    staff: [
        { section: "Tổng quan", items: [
                { to: "/staff", end: true, label: "Dashboard", icon: "👷" },
            ]},
        { section: "Nhiệm vụ", items: [
                { to: "/staff/batches", label: "Kiểm định lô", icon: "🔬" },
                { to: "/staff/trace", label: "Nhật ký truy xuất", icon: "📋" },
                { to: "/staff/tasks", label: "Nhiệm vụ", icon: "✅" },
                { to: "/staff/time-tracking", label: "Chấm công", icon: "🕐" },
            ]},
        { section: "Báo cáo", items: [
                { to: "/staff/report", label: "Báo cáo", icon: "📊" },
                { to: "/staff/photo-upload", label: "Upload ảnh", icon: "📷" },
            ]},
    ],
};

// Màu accent theo role
const ROLE_ACCENT = {
    admin:  { grad: 'from-sky-500 to-indigo-600', glow: 'rgba(56,189,248,0.15)', active: 'rgba(56,189,248,0.12)', border: 'rgba(56,189,248,0.2)', dot: '#38bdf8' },
    farmer: { grad: 'from-emerald-500 to-teal-600', glow: 'rgba(16,185,129,0.15)', active: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.2)', dot: '#10b981' },
    staff:  { grad: 'from-violet-500 to-purple-600', glow: 'rgba(139,92,246,0.15)', active: 'rgba(139,92,246,0.12)', border: 'rgba(139,92,246,0.2)', dot: '#8b5cf6' },
};

const ROLE_LABEL = {
    admin: 'Quản trị viên',
    farmer: 'Chủ nông trại',
    staff: 'Nhân viên',
};

function Sidebar({ role }) {
    const [collapsed, setCollapsed] = useState(false);
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const menu   = MENU[role] || MENU.staff;
    const accent = ROLE_ACCENT[role] || ROLE_ACCENT.staff;

    const handleLogout = () => { logout(); navigate("/login"); };

    return (
        <aside
            className={`relative flex flex-col h-screen sticky top-0 overflow-hidden transition-all duration-300 ease-in-out ${collapsed ? "w-[64px]" : "w-[220px]"}`}
            style={{ background: 'rgba(2,6,23,0.97)', borderRight: '1px solid rgba(148,163,184,0.07)' }}
        >
            {/* ── Ambient glow top ── */}
            <div className="absolute top-0 left-0 right-0 h-32 pointer-events-none"
                 style={{ background: `radial-gradient(ellipse at top, ${accent.glow}, transparent 70%)` }} />

            {/* ── Animated side accent line ── */}
            <div className="absolute left-0 top-0 bottom-0 w-[2px]"
                 style={{ background: `linear-gradient(180deg, transparent, ${accent.dot}60, transparent)` }} />

            {/* ── LOGO ── */}
            <div className="relative flex items-center gap-2.5 px-3 py-4 flex-shrink-0"
                 style={{ borderBottom: '1px solid rgba(148,163,184,0.06)' }}>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg bg-gradient-to-br ${accent.grad}`}
                     style={{ boxShadow: `0 4px 16px ${accent.dot}40` }}>
                    <span className="text-base">🍊</span>
                </div>
                {!collapsed && (
                    <div className="overflow-hidden flex-1">
                        <p className="text-sm font-black text-white leading-tight tracking-tight"
                           style={{ fontFamily: 'Syne, sans-serif' }}>FruitTrace</p>
                        <p className="text-[9px] leading-tight" style={{ color: accent.dot + 'aa' }}>Truy xuất nguồn gốc</p>
                    </div>
                )}
                <button onClick={() => setCollapsed(!collapsed)}
                        className={`p-1.5 rounded-lg transition-all hover:bg-white/5 flex-shrink-0 ${collapsed ? "mx-auto" : ""}`}>
                    <svg className={`w-3 h-3 text-slate-500 transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`}
                         fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
            </div>

            {/* ── NAV ── */}
            <nav className="relative flex-1 overflow-y-auto py-3 px-2 space-y-3"
                 style={{ scrollbarWidth: 'none' }}>
                {menu.map((section, si) => (
                    <div key={si}>
                        {!collapsed && (
                            <p className="text-[9px] font-black uppercase tracking-[0.15em] px-2 mb-1.5"
                               style={{ color: accent.dot + '70' }}>
                                {section.section}
                            </p>
                        )}
                        <div className="space-y-0.5">
                            {section.items.map((item) => (
                                <NavLink
                                    key={item.to}
                                    to={item.to}
                                    end={item.end}
                                    title={collapsed ? item.label : undefined}
                                >
                                    {({ isActive }) => (
                                        <div className={`relative flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-[12px] font-semibold transition-all duration-200 cursor-pointer
                                            ${collapsed ? "justify-center" : ""}
                                            ${isActive ? 'text-white' : 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.03]'}`}
                                             style={isActive ? {
                                                 background: accent.active,
                                                 border: `1px solid ${accent.border}`,
                                                 color: accent.dot,
                                             } : { border: '1px solid transparent' }}>

                                            {/* Active indicator */}
                                            {isActive && (
                                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 rounded-full"
                                                     style={{ background: accent.dot, boxShadow: `0 0 8px ${accent.dot}` }} />
                                            )}

                                            <span className="text-sm flex-shrink-0 leading-none">{item.icon}</span>
                                            {!collapsed && (
                                                <span className="truncate">{item.label}</span>
                                            )}
                                        </div>
                                    )}
                                </NavLink>
                            ))}
                        </div>
                    </div>
                ))}
            </nav>

            {/* ── DIVIDER ── */}
            <div className="mx-3" style={{ borderTop: '1px solid rgba(148,163,184,0.06)' }} />

            {/* ── USER FOOTER ── */}
            <div className="px-2 py-3 flex-shrink-0">
                <div className={`relative flex items-center gap-2.5 p-2 rounded-xl transition-all cursor-pointer group hover:bg-white/[0.04]
                    ${collapsed ? "justify-center" : ""}`}
                     style={{ border: '1px solid rgba(148,163,184,0.06)' }}>

                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                        <UserAvatar
                            avatarStr={user?.avatar}
                            name={user?.username || 'U'}
                            size="sm"
                        />
                        {/* Online dot */}
                        <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2"
                              style={{ background: '#10b981', borderColor: 'rgb(2,6,23)' }} />
                    </div>

                    {!collapsed && (
                        <>
                            <div className="flex-1 min-w-0 overflow-hidden">
                                <p className="text-[11px] font-bold text-white truncate leading-tight">
                                    {user?.username || 'User'}
                                </p>
                                <p className="text-[9px] truncate leading-tight" style={{ color: accent.dot + '80' }}>
                                    {ROLE_LABEL[role] || role || 'Khách'}
                                </p>
                            </div>

                            {/* Logout button */}
                            <button
                                onClick={handleLogout}
                                title="Đăng xuất"
                                className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500/15 flex-shrink-0"
                            >
                                <svg className="w-3.5 h-3.5 text-slate-600 hover:text-red-400 transition-colors"
                                     fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                            </button>
                        </>
                    )}
                </div>

                {/* Version tag */}
                {!collapsed && (
                    <p className="text-center text-[9px] mt-2" style={{ color: 'rgba(148,163,184,0.2)' }}>
                        FruitTrace v1.0 • 2026
                    </p>
                )}
            </div>
        </aside>
    );
}

export default Sidebar;