// src/components/layout/FarmLayout.jsx
import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation, Link, Outlet } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import {
    LayoutDashboard, Package, Users, CalendarDays,
    QrCode, Image, BarChart3, LogOut, Bell, Plus,
    ChevronLeft, Menu, ChevronRight, Settings, User,
    Droplets, Wind, Sun
} from "lucide-react";
import { UserAvatar } from "../common/ImageDisplay";

const NAV_ITEMS = [
    { icon: LayoutDashboard, label: "Tổng Quan",         path: "/farm",                exact: true },
    { icon: Package,         label: "Lô Hàng Của Tôi",   path: "/farm/mybatches"                  },
    { icon: Users,           label: "Quản Lý Nhân Viên", path: "/farm/staff-management"            },
    { icon: CalendarDays,    label: "Lịch Công Việc",    path: "/farm/calendar"                    },
    { icon: QrCode,          label: "Tạo QR Code",       path: "/farm/qr"                          },
    { icon: Image,           label: "Gallery",            path: "/farm/gallery"                     },
    { icon: BarChart3,       label: "Doanh Thu",          path: "/farm/revenue"                     },
];

const NOTIFICATIONS = [
    { id:1, type:"success", msg:"Nhân viên A hoàn thành bón phân",    time:"10 phút trước", unread:true  },
    { id:2, type:"info",    msg:"Lô BATCH024 đã được thu hoạch",      time:"1 giờ trước",   unread:true  },
    { id:3, type:"warn",    msg:"Cảnh báo: Mưa lớn trong 2 giờ tới", time:"2 giờ trước",   unread:false },
];

const NavTooltip = ({ label, children, collapsed }) => {
    if (!collapsed) return children;
    return (
        <div className="relative group/tip">
            {children}
            <div className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3 z-50
                px-2.5 py-1.5 rounded-lg text-white text-xs font-semibold whitespace-nowrap
                opacity-0 group-hover/tip:opacity-100 translate-x-1 group-hover/tip:translate-x-0
                transition-all duration-150 shadow-xl"
                 style={{ background:'rgba(2,6,23,0.95)', border:'1px solid rgba(34,197,94,0.2)' }}>
                {label}
                <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent"
                     style={{ borderRightColor:'rgba(2,6,23,0.95)' }}/>
            </div>
        </div>
    );
};

const FarmLayout = () => {
    const { user, logout } = useAuth();
    const navigate         = useNavigate();
    const location         = useLocation();

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [collapsed,   setCollapsed]   = useState(false);
    const [notiOpen,    setNotiOpen]    = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);

    const notiRef    = useRef();
    const profileRef = useRef();

    useEffect(() => {
        const fn = (e) => {
            if (notiRef.current    && !notiRef.current.contains(e.target))    setNotiOpen(false);
            if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
        };
        document.addEventListener("mousedown", fn);
        return () => document.removeEventListener("mousedown", fn);
    }, []);

    const isActive = (path, exact=false) =>
        exact ? location.pathname === path : location.pathname.startsWith(path);

    const handleLogout = () => {
        if (window.confirm("Bạn có chắc muốn đăng xuất?")) { logout(); navigate("/"); }
    };

    const unread = NOTIFICATIONS.filter(n => n.unread).length;
    const SIDEBAR_W   = "w-60";
    const COLLAPSED_W = "w-[68px]";
    const MAIN_ML     = collapsed ? "lg:ml-[68px]" : "lg:ml-60";

    const currentPage = NAV_ITEMS.find(i =>
        i.exact ? location.pathname === i.path : location.pathname.startsWith(i.path)
    );

    return (
        <div className="min-h-screen text-slate-200" style={{ background:'#060f1a', fontFamily:"'DM Sans','Syne',system-ui,sans-serif" }}>

            {/* ── Background ── */}
            <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
                <div className="absolute inset-0" style={{ background:'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(34,197,94,0.07) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 80% 90%, rgba(56,189,248,0.05) 0%, transparent 50%), #060f1a' }}/>
                <div className="absolute top-[-20%] right-[10%] w-[600px] h-[600px] rounded-full opacity-[0.06]"
                     style={{ background:'radial-gradient(circle,#22c55e,transparent 70%)', animation:'orb1 14s ease-in-out infinite alternate' }}/>
                <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full opacity-[0.05]"
                     style={{ background:'radial-gradient(circle,#38bdf8,transparent 70%)', animation:'orb2 18s ease-in-out infinite alternate' }}/>
                <div className="absolute inset-0 opacity-[0.04]" style={{
                    backgroundImage:'linear-gradient(rgba(34,197,94,0.4) 1px,transparent 1px),linear-gradient(90deg,rgba(34,197,94,0.4) 1px,transparent 1px)',
                    backgroundSize:'60px 60px',
                    maskImage:'radial-gradient(ellipse at center, black 20%, transparent 80%)'
                }}/>
            </div>

            {/* ═══ SIDEBAR ═══ */}
            <aside className={`
                fixed top-0 left-0 z-40 h-screen flex flex-col
                transition-all duration-300 ease-in-out
                ${collapsed ? COLLAPSED_W : SIDEBAR_W}
                ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0
            `} style={{ background:'rgba(4,9,20,0.92)', borderRight:'1px solid rgba(34,197,94,0.1)', backdropFilter:'blur(20px)' }}>

                {/* Top glow */}
                <div className="absolute top-0 left-0 right-0 h-32 pointer-events-none"
                     style={{ background:'radial-gradient(ellipse at top, rgba(34,197,94,0.12), transparent 70%)' }}/>

                {/* Logo */}
                <div className={`relative flex items-center h-16 shrink-0 ${collapsed ? "justify-center px-2" : "justify-between px-5"}`}
                     style={{ borderBottom:'1px solid rgba(34,197,94,0.08)' }}>
                    {!collapsed && (
                        <Link to="/farm" className="flex items-center gap-2.5 group">
                            <div className="w-8 h-8 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform"
                                 style={{ background:'linear-gradient(135deg,#16a34a,#22c55e)', boxShadow:'0 4px 12px rgba(34,197,94,0.4)' }}>
                                <span className="text-base">🌾</span>
                            </div>
                            <div>
                                <div className="font-black text-sm text-white leading-none" style={{ fontFamily:'Syne,sans-serif' }}>Farm Panel</div>
                                <div className="text-[10px] leading-none mt-0.5" style={{ color:'#4ade80' }}>FruitTrace</div>
                            </div>
                        </Link>
                    )}
                    {collapsed && (
                        <Link to="/farm" className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                              style={{ background:'linear-gradient(135deg,#16a34a,#22c55e)' }}>
                            <span className="text-base">🌾</span>
                        </Link>
                    )}
                </div>

                {/* User info */}
                {!collapsed && (
                    <div className="px-4 py-4 shrink-0" style={{ borderBottom:'1px solid rgba(34,197,94,0.06)' }}>
                        <div className="flex items-center gap-3 mb-3">
                            <UserAvatar avatarStr={user?.avatar} name={user?.username||'F'} size="md"/>
                            <div className="flex-1 min-w-0">
                                <div className="font-bold text-white text-sm truncate">{user?.username || 'Chủ vườn'}</div>
                                <div className="text-[11px] truncate" style={{ color:'#4ade80' }}>Chủ vườn</div>
                            </div>
                            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background:'#22c55e', boxShadow:'0 0 6px #22c55e' }}/>
                        </div>
                        <div className="rounded-xl px-3 py-2.5" style={{ background:'rgba(34,197,94,0.06)', border:'1px solid rgba(34,197,94,0.12)' }}>
                            <div className="flex items-center justify-between mb-1.5">
                                <span className="text-[11px] font-semibold" style={{ color:'#86efac' }}>Độ tin cậy</span>
                                <span className="text-sm font-black text-white">98%</span>
                            </div>
                            <div className="h-1.5 rounded-full overflow-hidden" style={{ background:'rgba(255,255,255,0.06)' }}>
                                <div className="h-full rounded-full" style={{ width:'98%', background:'linear-gradient(90deg,#16a34a,#22c55e,#4ade80)', boxShadow:'0 0 8px rgba(34,197,94,0.5)' }}/>
                            </div>
                        </div>
                    </div>
                )}

                {/* Nav */}
                <nav className={`flex-1 overflow-y-auto py-4 ${collapsed ? "px-2" : "px-3"}`} style={{ scrollbarWidth:'none' }}>
                    {!collapsed && (
                        <p className="text-[9px] uppercase tracking-[0.2em] font-black px-3 mb-2" style={{ color:'rgba(34,197,94,0.5)' }}>Menu chính</p>
                    )}
                    <div className="space-y-0.5">
                        {NAV_ITEMS.map(item => {
                            const active = isActive(item.path, item.exact);
                            const Icon   = item.icon;
                            return (
                                <NavTooltip key={item.path} label={item.label} collapsed={collapsed}>
                                    <Link to={item.path} onClick={()=>setSidebarOpen(false)}
                                          className={`relative flex items-center gap-3 rounded-xl transition-all duration-150
                                            ${collapsed ? "justify-center p-2.5" : "px-3 py-2.5"}`}
                                          style={ active
                                              ? { background:'rgba(34,197,94,0.12)', border:'1px solid rgba(34,197,94,0.2)', color:'#4ade80' }
                                              : { border:'1px solid transparent', color:'rgba(255,255,255,0.35)' }
                                          }>
                                        {active && (
                                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full"
                                                 style={{ background:'linear-gradient(180deg,#22c55e,#4ade80)', boxShadow:'0 0 8px #22c55e' }}/>
                                        )}
                                        <Icon size={17} style={{ color: active ? '#4ade80' : 'inherit', flexShrink:0 }}/>
                                        {!collapsed && (
                                            <span className="text-sm font-semibold truncate" style={{ color: active ? '#f0fdf4' : 'rgba(255,255,255,0.5)' }}>
                                                {item.label}
                                            </span>
                                        )}
                                    </Link>
                                </NavTooltip>
                            );
                        })}
                    </div>

                    <div className="mt-4 pt-4 space-y-0.5" style={{ borderTop:'1px solid rgba(34,197,94,0.06)' }}>
                        {!collapsed && (
                            <p className="text-[9px] uppercase tracking-[0.2em] font-black px-3 mb-2" style={{ color:'rgba(34,197,94,0.3)' }}>Hệ thống</p>
                        )}
                        {[
                            { icon:Settings, label:"Cài đặt", path:"/farm/settings" },
                            { icon:User,     label:"Hồ sơ",   path:"/farm/profile"  },
                        ].map(item => {
                            const Icon = item.icon;
                            return (
                                <NavTooltip key={item.path} label={item.label} collapsed={collapsed}>
                                    <Link to={item.path}
                                          className={`flex items-center gap-3 rounded-xl transition-all
                                            ${collapsed ? "justify-center p-2.5" : "px-3 py-2.5"}`}
                                          style={{ color:'rgba(255,255,255,0.25)', border:'1px solid transparent' }}
                                          onMouseEnter={e=>e.currentTarget.style.color='rgba(255,255,255,0.7)'}
                                          onMouseLeave={e=>e.currentTarget.style.color='rgba(255,255,255,0.25)'}>
                                        <Icon size={16}/>
                                        {!collapsed && <span className="text-sm">{item.label}</span>}
                                    </Link>
                                </NavTooltip>
                            );
                        })}
                    </div>
                </nav>

                {/* Logout */}
                <div className="shrink-0 p-3" style={{ borderTop:'1px solid rgba(34,197,94,0.06)' }}>
                    <NavTooltip label="Đăng Xuất" collapsed={collapsed}>
                        <button onClick={handleLogout}
                                className={`w-full flex items-center gap-3 rounded-xl transition-all duration-150
                                ${collapsed ? "justify-center p-2.5" : "px-3 py-2.5"}`}
                                style={{ color:'rgba(248,113,113,0.7)', border:'1px solid transparent' }}
                                onMouseEnter={e=>{ e.currentTarget.style.background='rgba(239,68,68,0.08)'; e.currentTarget.style.color='#f87171'; e.currentTarget.style.borderColor='rgba(239,68,68,0.15)'; }}
                                onMouseLeave={e=>{ e.currentTarget.style.background='transparent'; e.currentTarget.style.color='rgba(248,113,113,0.7)'; e.currentTarget.style.borderColor='transparent'; }}>
                            <LogOut size={16}/>
                            {!collapsed && <span className="text-sm font-semibold">Đăng Xuất</span>}
                        </button>
                    </NavTooltip>
                </div>

                {/* Collapse toggle */}
                <button onClick={()=>setCollapsed(!collapsed)}
                        className="absolute -right-3 top-20 hidden lg:flex w-6 h-6 rounded-full items-center justify-center transition-all shadow-lg hover:scale-110"
                        style={{ background:'rgba(4,9,20,0.9)', border:'1px solid rgba(34,197,94,0.2)', color:'#4ade80' }}>
                    {collapsed ? <ChevronRight size={12}/> : <ChevronLeft size={12}/>}
                </button>
            </aside>

            {/* Mobile overlay */}
            {sidebarOpen && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-30 lg:hidden"
                     onClick={()=>setSidebarOpen(false)}/>
            )}

            {/* ═══ MAIN ═══ */}
            <div className={`transition-all duration-300 ${MAIN_ML}`}>

                {/* Header */}
                <header className="sticky top-0 z-20 h-16" style={{ background:'rgba(6,15,26,0.85)', borderBottom:'1px solid rgba(34,197,94,0.08)', backdropFilter:'blur(20px)' }}>
                    <div className="h-full px-5 flex items-center gap-4">

                        <button onClick={()=>setSidebarOpen(true)}
                                className="lg:hidden p-2 rounded-xl transition-colors"
                                style={{ color:'rgba(255,255,255,0.5)' }}>
                            <Menu size={20}/>
                        </button>

                        {/* Breadcrumb */}
                        <div className="hidden sm:flex items-center gap-2 text-sm">
                            <Link to="/farm" className="font-semibold transition-colors hover:opacity-80" style={{ color:'rgba(34,197,94,0.6)' }}>Farm</Link>
                            {currentPage && currentPage.path !== "/farm" && (
                                <>
                                    <ChevronRight size={13} style={{ color:'rgba(255,255,255,0.2)' }}/>
                                    <span className="font-bold text-white">{currentPage.label}</span>
                                </>
                            )}
                        </div>

                        {/* Weather pill */}
                        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl ml-2"
                             style={{ background:'rgba(34,197,94,0.08)', border:'1px solid rgba(34,197,94,0.15)' }}>
                            <Sun size={15} style={{ color:'#fbbf24' }}/>
                            <span className="font-black text-sm" style={{ color:'#f0fdf4' }}>32°C</span>
                            <span className="text-xs" style={{ color:'rgba(255,255,255,0.4)' }}>• Độ ẩm 75%</span>
                        </div>

                        <div className="flex-1"/>

                        {/* Actions */}
                        <div className="flex items-center gap-2">

                            <Link to="/farm/qr"
                                  className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-white transition-all hover:brightness-110 hover:-translate-y-0.5"
                                  style={{ background:'linear-gradient(135deg,#16a34a,#22c55e)', boxShadow:'0 4px 16px rgba(34,197,94,0.35)' }}>
                                <Plus size={15}/> Tạo lô hàng
                            </Link>

                            {/* Notifications */}
                            <div className="relative" ref={notiRef}>
                                <button onClick={()=>{ setNotiOpen(!notiOpen); setProfileOpen(false); }}
                                        className="relative p-2.5 rounded-xl transition-colors"
                                        style={{ color:'rgba(255,255,255,0.5)' }}
                                        onMouseEnter={e=>e.currentTarget.style.background='rgba(34,197,94,0.08)'}
                                        onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                                    <Bell size={18}/>
                                    {unread > 0 && (
                                        <span className="absolute top-1.5 right-1.5 w-4 h-4 flex items-center justify-center text-white text-[9px] font-black rounded-full"
                                              style={{ background:'#ef4444' }}>{unread}</span>
                                    )}
                                </button>

                                {notiOpen && (
                                    <div className="absolute right-0 mt-2 w-80 rounded-2xl overflow-hidden shadow-2xl"
                                         style={{ background:'rgba(4,9,20,0.98)', border:'1px solid rgba(34,197,94,0.12)', backdropFilter:'blur(20px)' }}>
                                        <div className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
                                            <span className="font-black text-white" style={{ fontFamily:'Syne,sans-serif' }}>Thông báo</span>
                                            <button className="text-xs font-bold transition-colors" style={{ color:'#4ade80' }}>Đọc tất cả</button>
                                        </div>
                                        <div className="max-h-72 overflow-y-auto divide-y" style={{ borderColor:'rgba(255,255,255,0.04)' }}>
                                            {NOTIFICATIONS.map(n => (
                                                <div key={n.id} className="flex gap-3 px-5 py-3.5 cursor-pointer transition-colors"
                                                     style={{ background: n.unread ? 'rgba(34,197,94,0.04)' : 'transparent' }}
                                                     onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.03)'}
                                                     onMouseLeave={e=>e.currentTarget.style.background=n.unread?'rgba(34,197,94,0.04)':'transparent'}>
                                                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm flex-shrink-0"
                                                         style={{ background: n.type==='success'?'rgba(34,197,94,0.12)':n.type==='info'?'rgba(56,189,248,0.12)':'rgba(251,191,36,0.12)' }}>
                                                        {n.type==='success'?'✅':n.type==='info'?'📦':'⚠️'}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-semibold leading-snug" style={{ color:'rgba(255,255,255,0.85)' }}>{n.msg}</p>
                                                        <p className="text-xs mt-0.5" style={{ color:'rgba(255,255,255,0.3)' }}>{n.time}</p>
                                                    </div>
                                                    {n.unread && <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ background:'#22c55e' }}/>}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Profile */}
                            <div className="relative" ref={profileRef}>
                                <button onClick={()=>{ setProfileOpen(!profileOpen); setNotiOpen(false); }}
                                        className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl transition-colors"
                                        onMouseEnter={e=>e.currentTarget.style.background='rgba(34,197,94,0.06)'}
                                        onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                                    <UserAvatar avatarStr={user?.avatar} name={user?.username||'F'} size="sm"/>
                                    <div className="hidden lg:block text-left">
                                        <div className="text-sm font-bold text-white leading-none">{user?.username||'Farm Owner'}</div>
                                        <div className="text-[10px] mt-0.5" style={{ color:'#4ade80' }}>Chủ vườn</div>
                                    </div>
                                    <ChevronRight size={12} style={{ color:'rgba(255,255,255,0.3)', transform: profileOpen?'rotate(90deg)':'none', transition:'transform 0.2s' }}/>
                                </button>

                                {profileOpen && (
                                    <div className="absolute right-0 mt-2 w-52 rounded-2xl overflow-hidden shadow-2xl py-1"
                                         style={{ background:'rgba(4,9,20,0.98)', border:'1px solid rgba(34,197,94,0.12)', backdropFilter:'blur(20px)' }}>
                                        <div className="px-4 py-3 mb-1" style={{ borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
                                            <p className="text-sm font-black text-white">{user?.username}</p>
                                            <p className="text-xs mt-0.5" style={{ color:'#4ade80' }}>Chủ vườn · FruitTrace</p>
                                        </div>
                                        {[
                                            { icon:User,     label:"Hồ sơ cá nhân", path:"/farm/profile"  },
                                            { icon:Settings, label:"Cài đặt",        path:"/farm/settings" },
                                        ].map(item => {
                                            const Icon = item.icon;
                                            return (
                                                <Link key={item.path} to={item.path} onClick={()=>setProfileOpen(false)}
                                                      className="flex items-center gap-3 px-4 py-2.5 text-sm transition-colors"
                                                      style={{ color:'rgba(255,255,255,0.5)' }}
                                                      onMouseEnter={e=>{ e.currentTarget.style.background='rgba(34,197,94,0.06)'; e.currentTarget.style.color='rgba(255,255,255,0.85)'; }}
                                                      onMouseLeave={e=>{ e.currentTarget.style.background='transparent'; e.currentTarget.style.color='rgba(255,255,255,0.5)'; }}>
                                                    <Icon size={14}/>
                                                    {item.label}
                                                </Link>
                                            );
                                        })}
                                        <div className="pt-1" style={{ borderTop:'1px solid rgba(255,255,255,0.06)' }}>
                                            <button onClick={handleLogout}
                                                    className="flex items-center gap-3 w-full px-4 py-2.5 text-sm transition-colors"
                                                    style={{ color:'rgba(248,113,113,0.7)' }}
                                                    onMouseEnter={e=>{ e.currentTarget.style.background='rgba(239,68,68,0.08)'; e.currentTarget.style.color='#f87171'; }}
                                                    onMouseLeave={e=>{ e.currentTarget.style.background='transparent'; e.currentTarget.style.color='rgba(248,113,113,0.7)'; }}>
                                                <LogOut size={14}/>
                                                Đăng xuất
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <main className="min-h-[calc(100vh-4rem)]">
                    <div className="max-w-[1600px] mx-auto p-4 md:p-6 lg:p-8">
                        <Outlet/>
                    </div>
                </main>
            </div>

            <style dangerouslySetInnerHTML={{ __html:`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&family=Syne:wght@700;800&display=swap');
                @keyframes orb1 { from { transform:translate(0,0) scale(1); } to { transform:translate(-40px,30px) scale(1.2); } }
                @keyframes orb2 { from { transform:translate(0,0) scale(1); } to { transform:translate(30px,-20px) scale(0.9); } }
                ::-webkit-scrollbar { width:4px; }
                ::-webkit-scrollbar-track { background:transparent; }
                ::-webkit-scrollbar-thumb { background:rgba(34,197,94,0.2); border-radius:4px; }
            `}}/>
        </div>
    );
};

export default FarmLayout;