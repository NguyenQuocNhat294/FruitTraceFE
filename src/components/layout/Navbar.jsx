import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate, Link } from "react-router-dom";
import { UserAvatar } from '../common/ImageDisplay';
import {
    Search, Bell, Sun, Moon, LogOut, User, Shield,
    Leaf, Briefcase, Command, ChevronDown, X,
    Package, LayoutDashboard, Tractor, Settings,
    CheckCircle2, AlertTriangle
} from "lucide-react";
import LoginModal from "../auth/LoginModal";

const NOTIFICATIONS = [
    { id: 1, type: "batch", title: "Lô hàng mới", desc: "BATCH-024 vừa được tạo", time: "5 phút trước", unread: true },
    { id: 2, type: "user",  title: "Người dùng mới", desc: "user@farm.vn đã đăng ký", time: "1 giờ trước", unread: true },
    { id: 3, type: "warn",  title: "Cảnh báo",  desc: "Lô BATCH-019 sắp hết hạn", time: "3 giờ trước", unread: false },
];

const NOTI_ICON = {
    batch: { icon: <Package size={16} />, bg: "bg-blue-100 text-blue-600" },
    user:  { icon: <User    size={16} />, bg: "bg-emerald-100 text-emerald-600" },
    warn:  { icon: <AlertTriangle size={16} />, bg: "bg-amber-100 text-amber-600" },
};

const CMD_ROUTES = [
    { label: "Dashboard Admin",   path: "/admin",  icon: <Shield size={16} /> },
    { label: "Farm Panel",        path: "/farm",   icon: <Tractor size={16} /> },
    { label: "Staff Panel",       path: "/staff",  icon: <Briefcase size={16} /> },
    { label: "Tra cứu lô hàng",  path: "/trace",  icon: <Search size={16} /> },
    { label: "Cài đặt",          path: "/settings", icon: <Settings size={16} /> },
];

const Navbar = ({ onMenuClick }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [loginOpen,    setLoginOpen]    = useState(false);
    const [openDropdown, setOpenDropdown] = useState(false);
    const [openNoti,     setOpenNoti]     = useState(false);
    const [openCmd,      setOpenCmd]      = useState(false);
    const [dark,         setDark]         = useState(localStorage.getItem("theme") === "dark");
    const [cmdQuery,     setCmdQuery]     = useState("");

    const dropdownRef = useRef();
    const notiRef     = useRef();
    const cmdInputRef = useRef();

    /* ---------- outside click ---------- */
    useEffect(() => {
        const fn = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setOpenDropdown(false);
            if (notiRef.current     && !notiRef.current.contains(e.target))     setOpenNoti(false);
        };
        document.addEventListener("mousedown", fn);
        return () => document.removeEventListener("mousedown", fn);
    }, []);

    /* ---------- dark mode ---------- */
    useEffect(() => {
        document.documentElement.classList.toggle("dark", dark);
        localStorage.setItem("theme", dark ? "dark" : "light");
    }, [dark]);

    /* ---------- Ctrl + K ---------- */
    useEffect(() => {
        const fn = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === "k") { e.preventDefault(); setOpenCmd(true); }
            if (e.key === "Escape") { setOpenCmd(false); setCmdQuery(""); }
        };
        window.addEventListener("keydown", fn);
        return () => window.removeEventListener("keydown", fn);
    }, []);

    useEffect(() => {
        if (openCmd) setTimeout(() => cmdInputRef.current?.focus(), 50);
    }, [openCmd]);

    const unreadCount  = NOTIFICATIONS.filter(n => n.unread).length;
    const filteredCmds = CMD_ROUTES.filter(r => r.label.toLowerCase().includes(cmdQuery.toLowerCase()));

    const handleLogout = () => {
        if (window.confirm("Bạn có chắc muốn đăng xuất?")) { logout(); navigate("/"); }
    };

    const ROLE_META = {
        admin:  { label: "Admin",     icon: <Shield   size={13} />, color: "text-violet-400" },
        farmer: { label: "Farm",      icon: <Leaf     size={13} />, color: "text-emerald-400" },
        staff:  { label: "Staff",     icon: <Briefcase size={13} />, color: "text-sky-400" },
    };
    const roleMeta = ROLE_META[user?.role] ?? { label: user?.role, icon: <User size={13} />, color: "text-gray-400" };

    return (
        <>
            {/* ───────────────── NAVBAR ───────────────── */}
            <nav className="sticky top-0 z-30 h-14 flex items-center
                      bg-slate-900/80 backdrop-blur-xl
                      border-b border-white/[0.06]
                      shadow-[0_1px_0_0_rgba(255,255,255,0.04)]">

                <div className="flex items-center gap-3 px-4 md:px-5 w-full">

                    {/* ── Hamburger ── */}
                    <button onClick={onMenuClick}
                            className="lg:hidden p-2 rounded-lg hover:bg-white/8 text-gray-300 transition">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/>
                        </svg>
                    </button>

                    {/* ── Search / Command trigger ── */}
                    <button onClick={() => setOpenCmd(true)}
                            className="hidden sm:flex flex-1 max-w-xs items-center gap-2
                             h-9 px-3 rounded-lg bg-white/[0.06] border border-white/[0.08]
                             text-gray-400 text-xs hover:bg-white/10 hover:border-white/15
                             transition-all group">
                        <Search size={14} className="shrink-0"/>
                        <span className="flex-1 text-left">Tìm kiếm...</span>
                        <kbd className="hidden md:inline-flex items-center gap-0.5 px-1.5 py-0.5
                           bg-white/[0.07] border border-white/[0.1] rounded text-[10px]
                           text-gray-500 font-mono">
                            <Command size={10}/> K
                        </kbd>
                    </button>

                    <div className="flex-1 sm:flex-none"/>

                    {/* ── Right actions ── */}
                    <div className="flex items-center gap-1">

                        {/* Dark mode */}
                        <button onClick={() => setDark(!dark)}
                                className="p-2 rounded-lg hover:bg-white/8 text-gray-400 hover:text-gray-200 transition">
                            {dark ? <Moon size={17}/> : <Sun size={17}/>}
                        </button>

                        {/* Notifications */}
                        <div className="relative" ref={notiRef}>
                            <button onClick={() => { setOpenNoti(!openNoti); setOpenDropdown(false); }}
                                    className="relative p-2 rounded-lg hover:bg-white/8 text-gray-400 hover:text-gray-200 transition">
                                <Bell size={17}/>
                                {unreadCount > 0 && (
                                    <span className="absolute top-1.5 right-1.5 w-4 h-4 flex items-center justify-center
                                   bg-red-500 rounded-full text-[10px] font-bold text-white leading-none">
                    {unreadCount}
                  </span>
                                )}
                            </button>

                            {openNoti && (
                                <div className="absolute right-0 mt-2 w-80 rounded-2xl
                                bg-slate-800 border border-white/10
                                shadow-2xl shadow-black/40 overflow-hidden
                                animate-in fade-in slide-in-from-top-2 duration-150">
                                    <div className="flex items-center justify-between px-4 py-3 border-b border-white/8">
                                        <span className="text-sm font-semibold text-white">Thông báo</span>
                                        <button className="text-xs text-emerald-400 hover:text-emerald-300 transition">
                                            Đánh dấu đã đọc
                                        </button>
                                    </div>
                                    <div className="divide-y divide-white/[0.05] max-h-80 overflow-y-auto">
                                        {NOTIFICATIONS.map(n => {
                                            const meta = NOTI_ICON[n.type];
                                            return (
                                                <div key={n.id}
                                                     className={`flex gap-3 px-4 py-3 hover:bg-white/5 cursor-pointer transition
                                         ${n.unread ? "bg-white/[0.03]" : ""}`}>
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${meta.bg}`}>
                                                        {meta.icon}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-white">{n.title}</p>
                                                        <p className="text-xs text-gray-400 truncate">{n.desc}</p>
                                                        <p className="text-[11px] text-gray-500 mt-0.5">{n.time}</p>
                                                    </div>
                                                    {n.unread && <div className="w-2 h-2 bg-emerald-400 rounded-full shrink-0 mt-2"/>}
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div className="px-4 py-2 border-t border-white/8">
                                        <button className="text-xs text-gray-400 hover:text-white w-full text-center transition py-1">
                                            Xem tất cả thông báo
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* User menu */}
                        {user ? (
                            <div className="relative" ref={dropdownRef}>
                                <button onClick={() => { setOpenDropdown(!openDropdown); setOpenNoti(false); }}
                                        className="flex items-center gap-2 pl-1.5 pr-2.5 py-1.5
                                   rounded-xl hover:bg-white/8 transition group">
                                    <UserAvatar
                                        avatarStr={user?.avatar}
                                        name={user?.username}
                                        size="md"
                                    />
                                    <div className="hidden md:block text-left">
                                        <div className="text-xs font-semibold text-white leading-none">{user.username}</div>
                                        <div className={`flex items-center gap-1 text-[10px] mt-0.5 ${roleMeta.color}`}>
                                            {roleMeta.icon}{roleMeta.label}
                                        </div>
                                    </div>
                                    <ChevronDown size={13} className={`hidden md:block text-gray-500 transition-transform ${openDropdown ? "rotate-180" : ""}`}/>
                                </button>

                                {openDropdown && (
                                    <div className="absolute right-0 mt-2 w-48 rounded-2xl
                                  bg-slate-800 border border-white/10
                                  shadow-2xl shadow-black/40 overflow-hidden py-1
                                  animate-in fade-in slide-in-from-top-2 duration-150">
                                        <div className="px-4 py-2.5 border-b border-white/8 mb-1">
                                            <p className="text-xs font-semibold text-white">{user.username}</p>
                                            <p className={`text-[11px] mt-0.5 ${roleMeta.color}`}>{roleMeta.label}</p>
                                        </div>
                                        {[
                                            user.role === "admin"  && { to: "/admin",   icon: <Shield   size={15}/>, label: "Admin Panel" },
                                            user.role === "farmer" && { to: "/farm",    icon: <Leaf     size={15}/>, label: "Farm Panel" },
                                            user.role === "staff"  && { to: "/staff",   icon: <Briefcase size={15}/>, label: "Staff Panel" },
                                            { to: "/profile", icon: <User size={15}/>, label: "Hồ sơ" },
                                            { to: "/settings", icon: <Settings size={15}/>, label: "Cài đặt" },
                                        ].filter(Boolean).map(item => (
                                            <Link key={item.to} to={item.to}
                                                  onClick={() => setOpenDropdown(false)}
                                                  className="flex items-center gap-3 px-4 py-2.5
                                       text-sm text-gray-300 hover:text-white hover:bg-white/8 transition">
                                                <span className="text-gray-500">{item.icon}</span>
                                                {item.label}
                                            </Link>
                                        ))}
                                        <div className="border-t border-white/8 mt-1 pt-1">
                                            <button onClick={handleLogout}
                                                    className="flex items-center gap-3 w-full px-4 py-2.5
                                         text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition">
                                                <LogOut size={15}/>
                                                Đăng xuất
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <button onClick={() => setLoginOpen(true)}
                                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500
                                 text-white text-xs font-semibold transition">
                                Đăng nhập
                            </button>
                        )}
                    </div>
                </div>
            </nav>

            {/* ───────────────── COMMAND PALETTE ───────────────── */}
            {openCmd && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center pt-28 z-50 px-4"
                     onClick={() => { setOpenCmd(false); setCmdQuery(""); }}>
                    <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-white/10
                          shadow-2xl shadow-black/60 overflow-hidden h-fit"
                         onClick={e => e.stopPropagation()}>

                        {/* Input */}
                        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/8">
                            <Search size={16} className="text-gray-400 shrink-0"/>
                            <input ref={cmdInputRef} value={cmdQuery}
                                   onChange={e => setCmdQuery(e.target.value)}
                                   placeholder="Tìm kiếm trang, tính năng..."
                                   className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-gray-500"/>
                            <button onClick={() => { setOpenCmd(false); setCmdQuery(""); }}>
                                <X size={16} className="text-gray-500 hover:text-gray-300 transition"/>
                            </button>
                        </div>

                        {/* Results */}
                        <div className="p-2 max-h-72 overflow-y-auto">
                            {filteredCmds.length > 0 ? (
                                <>
                                    <p className="text-[10px] uppercase tracking-widest text-gray-500 px-3 pt-1 pb-2 font-semibold">
                                        Điều hướng
                                    </p>
                                    {filteredCmds.map(r => (
                                        <button key={r.path}
                                                onClick={() => { navigate(r.path); setOpenCmd(false); setCmdQuery(""); }}
                                                className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl
                                       text-sm text-gray-300 hover:text-white hover:bg-white/8 transition text-left">
                      <span className="w-7 h-7 rounded-lg bg-white/8 flex items-center justify-center text-gray-400">
                        {r.icon}
                      </span>
                                            {r.label}
                                        </button>
                                    ))}
                                </>
                            ) : (
                                <div className="py-8 text-center text-sm text-gray-500">Không tìm thấy kết quả</div>
                            )}
                        </div>

                        {/* Footer hint */}
                        <div className="flex items-center gap-3 px-4 py-2 border-t border-white/8 text-[11px] text-gray-600">
                            <span className="flex items-center gap-1"><kbd className="px-1 bg-white/8 rounded">↵</kbd> chọn</span>
                            <span className="flex items-center gap-1"><kbd className="px-1 bg-white/8 rounded">Esc</kbd> đóng</span>
                        </div>
                    </div>
                </div>
            )}

            {/* ───────────────── CHAT FAB ───────────────── */}
            <div className="fixed bottom-6 right-6 z-40">
                <button className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600
                           text-white rounded-full shadow-xl shadow-emerald-600/30
                           hover:shadow-emerald-600/50 hover:-translate-y-1 transition-all
                           flex items-center justify-center">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                    </svg>
                </button>
            </div>

            <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)}/>
        </>
    );
};

export default Navbar;