// src/components/layout/StaffLayout.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { UserAvatar } from '../common/ImageDisplay';
import {
    LayoutDashboard, ClipboardList, Clock, FileText,
    Camera, LogOut, Bell, Upload, Menu, ChevronLeft,
    ChevronRight, FlaskConical, MapPin, Play, Square, User, Settings
} from 'lucide-react';

const NAV_ITEMS = [
    { icon: LayoutDashboard, label: 'Tổng quan',      path: '/staff',              exact: true },
    { icon: FlaskConical,    label: 'Kiểm định lô',   path: '/staff/batches'                  },
    { icon: MapPin,          label: 'Nhật ký trace',  path: '/staff/trace'                    },
    { icon: ClipboardList,   label: 'Nhiệm vụ',       path: '/staff/tasks'                    },
    { icon: Clock,           label: 'Chấm công',      path: '/staff/time-tracking'            },
    { icon: FileText,        label: 'Báo cáo',        path: '/staff/report'                   },
    { icon: Camera,          label: 'Upload ảnh',     path: '/staff/photo-upload'             },
];

const NOTIS = [
    { id:1, type:'task',     msg:'Công việc mới: Bón phân lô BATCH025', time:'5 phút trước',  unread:true  },
    { id:2, type:'reminder', msg:'Nhắc nhở: Hoàn thành báo cáo tuần',   time:'1 giờ trước',   unread:true  },
    { id:3, type:'approval', msg:'Báo cáo của bạn đã được phê duyệt',   time:'3 giờ trước',   unread:false },
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
                 style={{ background:'rgba(2,6,23,0.95)', border:'1px solid rgba(129,140,248,0.2)' }}>
                {label}
                <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent"
                     style={{ borderRightColor:'rgba(2,6,23,0.95)' }}/>
            </div>
        </div>
    );
};

export default function StaffLayout() {
    const { user, logout } = useAuth();
    const navigate         = useNavigate();
    const location         = useLocation();

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [collapsed,   setCollapsed]   = useState(false);
    const [notiOpen,    setNotiOpen]    = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const [isCheckedIn, setCheckedIn]   = useState(false);
    const [seconds,     setSeconds]     = useState(0);

    const notiRef    = useRef();
    const profileRef = useRef();

    // Click outside
    useEffect(() => {
        const fn = e => {
            if (notiRef.current    && !notiRef.current.contains(e.target))    setNotiOpen(false);
            if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
        };
        document.addEventListener('mousedown', fn);
        return () => document.removeEventListener('mousedown', fn);
    }, []);

    // Timer
    useEffect(() => {
        let tm;
        if (isCheckedIn) tm = setInterval(() => setSeconds(s => s+1), 1000);
        else setSeconds(0);
        return () => clearInterval(tm);
    }, [isCheckedIn]);

    const fmt = s => `${String(Math.floor(s/3600)).padStart(2,'0')}:${String(Math.floor(s%3600/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;

    const isActive = (path, exact=false) =>
        exact ? location.pathname === path : location.pathname.startsWith(path);

    const handleLogout = () => {
        if (window.confirm('Bạn có chắc muốn đăng xuất?')) { logout(); navigate('/'); }
    };

    const unread = NOTIS.filter(n => n.unread).length;
    const SIDEBAR_W   = 'w-[220px]';
    const COLLAPSED_W = 'w-[68px]';
    const MAIN_ML     = collapsed ? 'lg:ml-[68px]' : 'lg:ml-[220px]';

    const currentPage = NAV_ITEMS.find(i =>
        i.exact ? location.pathname === i.path : location.pathname.startsWith(i.path)
    );

    // Violet accent for staff
    const ACCENT = '#818cf8';
    const ACCENT_DIM = 'rgba(129,140,248,0.12)';
    const ACCENT_BORDER = 'rgba(129,140,248,0.25)';

    return (
        <div className="min-h-screen text-slate-200" style={{ background:'#06080f', fontFamily:"'DM Sans','Syne',system-ui,sans-serif" }}>

            {/* Background */}
            <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
                <div className="absolute inset-0" style={{ background:'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(129,140,248,0.07) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 80% 90%, rgba(192,132,252,0.04) 0%, transparent 50%), #06080f' }}/>
                <div className="absolute top-[-20%] right-[10%] w-[600px] h-[600px] rounded-full opacity-[0.05]"
                     style={{ background:'radial-gradient(circle,#818cf8,transparent 70%)', animation:'orb1 14s ease-in-out infinite alternate' }}/>
                <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full opacity-[0.04]"
                     style={{ background:'radial-gradient(circle,#c084fc,transparent 70%)', animation:'orb2 18s ease-in-out infinite alternate' }}/>
                <div className="absolute inset-0 opacity-[0.03]" style={{
                    backgroundImage:'linear-gradient(rgba(129,140,248,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(129,140,248,0.5) 1px,transparent 1px)',
                    backgroundSize:'60px 60px',
                    maskImage:'radial-gradient(ellipse at center, black 20%, transparent 80%)'
                }}/>
            </div>

            {/* ═══ SIDEBAR ═══ */}
            <aside className={`
                fixed top-0 left-0 z-40 h-screen flex flex-col
                transition-all duration-300 ease-in-out
                ${collapsed ? COLLAPSED_W : SIDEBAR_W}
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
            `} style={{ background:'rgba(4,5,16,0.93)', borderRight:'1px solid rgba(129,140,248,0.1)', backdropFilter:'blur(20px)' }}>

                {/* Top glow */}
                <div className="absolute top-0 left-0 right-0 h-32 pointer-events-none"
                     style={{ background:'radial-gradient(ellipse at top, rgba(129,140,248,0.1), transparent 70%)' }}/>

                {/* Logo */}
                <div className={`relative flex items-center h-16 shrink-0 ${collapsed ? 'justify-center px-2' : 'justify-between px-5'}`}
                     style={{ borderBottom:'1px solid rgba(129,140,248,0.08)' }}>
                    {!collapsed && (
                        <Link to="/staff" className="flex items-center gap-2.5 group">
                            <div className="w-8 h-8 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform"
                                 style={{ background:'linear-gradient(135deg,#6366f1,#818cf8)', boxShadow:'0 4px 12px rgba(129,140,248,0.4)' }}>
                                <span className="text-base">👷</span>
                            </div>
                            <div>
                                <div className="font-black text-sm text-white leading-none" style={{ fontFamily:'Syne,sans-serif' }}>Staff Panel</div>
                                <div className="text-[10px] leading-none mt-0.5" style={{ color:ACCENT }}>FruitTrace</div>
                            </div>
                        </Link>
                    )}
                    {collapsed && (
                        <Link to="/staff" className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                              style={{ background:'linear-gradient(135deg,#6366f1,#818cf8)' }}>
                            <span className="text-base">👷</span>
                        </Link>
                    )}
                </div>

                {/* User info */}
                {!collapsed && (
                    <div className="px-4 py-4 shrink-0" style={{ borderBottom:'1px solid rgba(129,140,248,0.06)' }}>
                        <div className="flex items-center gap-3 mb-3">
                            <UserAvatar avatarStr={user?.avatar} name={user?.username||'S'} size="md"/>
                            <div className="flex-1 min-w-0">
                                <div className="font-bold text-white text-sm truncate">{user?.username || 'Nhân viên'}</div>
                                <div className="text-[11px] truncate" style={{ color:ACCENT }}>Nhân viên kỹ thuật</div>
                            </div>
                            <div className="w-2 h-2 rounded-full flex-shrink-0"
                                 style={{ background: isCheckedIn ? '#22c55e' : '#94a3b8', boxShadow: isCheckedIn ? '0 0 6px #22c55e' : 'none' }}/>
                        </div>

                        {/* Check-in status */}
                        {isCheckedIn ? (
                            <div className="rounded-xl px-3 py-2.5" style={{ background:'rgba(34,197,94,0.08)', border:'1px solid rgba(34,197,94,0.2)' }}>
                                <div className="flex items-center justify-between mb-1">
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background:'#22c55e' }}/>
                                        <span className="text-[10px] font-semibold" style={{ color:'#86efac' }}>Đang làm việc</span>
                                    </div>
                                    <button onClick={()=>{ if(window.confirm('Chấm công ra?')) setCheckedIn(false); }}
                                            className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                                            style={{ background:'rgba(239,68,68,0.15)', color:'#f87171' }}>
                                        Ra
                                    </button>
                                </div>
                                <div className="text-xl font-black font-mono text-white">{fmt(seconds)}</div>
                            </div>
                        ) : (
                            <button onClick={()=>setCheckedIn(true)}
                                    className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-bold text-white transition-all hover:brightness-110"
                                    style={{ background:'linear-gradient(135deg,#16a34a,#22c55e)', boxShadow:'0 4px 12px rgba(34,197,94,0.3)' }}>
                                <Play size={13}/> Chấm công vào
                            </button>
                        )}
                    </div>
                )}

                {/* Nav */}
                <nav className={`flex-1 overflow-y-auto py-4 ${collapsed ? 'px-2' : 'px-3'}`} style={{ scrollbarWidth:'none' }}>
                    {!collapsed && (
                        <p className="text-[9px] uppercase tracking-[0.2em] font-black px-3 mb-2" style={{ color:'rgba(129,140,248,0.4)' }}>Nhiệm vụ</p>
                    )}
                    <div className="space-y-0.5">
                        {NAV_ITEMS.map(item => {
                            const active = isActive(item.path, item.exact);
                            const Icon   = item.icon;
                            return (
                                <NavTooltip key={item.path} label={item.label} collapsed={collapsed}>
                                    <Link to={item.path} onClick={()=>setSidebarOpen(false)}
                                          className={`relative flex items-center gap-3 rounded-xl transition-all duration-150
                                            ${collapsed ? 'justify-center p-2.5' : 'px-3 py-2.5'}`}
                                          style={ active
                                              ? { background:ACCENT_DIM, border:`1px solid ${ACCENT_BORDER}`, color:ACCENT }
                                              : { border:'1px solid transparent', color:'rgba(255,255,255,0.3)' }
                                          }>
                                        {active && (
                                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full"
                                                 style={{ background:`linear-gradient(180deg,#6366f1,${ACCENT})`, boxShadow:`0 0 8px ${ACCENT}` }}/>
                                        )}
                                        <Icon size={16} style={{ color:active?ACCENT:'inherit', flexShrink:0 }}/>
                                        {!collapsed && (
                                            <span className="text-sm font-semibold truncate" style={{ color:active?'#f0f0ff':'rgba(255,255,255,0.45)' }}>
                                                {item.label}
                                            </span>
                                        )}
                                    </Link>
                                </NavTooltip>
                            );
                        })}
                    </div>

                    <div className="mt-4 pt-4 space-y-0.5" style={{ borderTop:'1px solid rgba(129,140,248,0.06)' }}>
                        {!collapsed && (
                            <p className="text-[9px] uppercase tracking-[0.2em] font-black px-3 mb-2" style={{ color:'rgba(129,140,248,0.25)' }}>Hệ thống</p>
                        )}
                        {[
                            { icon:Settings, label:'Cài đặt', path:'/staff/settings' },
                            { icon:User,     label:'Hồ sơ',   path:'/staff/profile'  },
                        ].map(item => {
                            const Icon = item.icon;
                            return (
                                <NavTooltip key={item.path} label={item.label} collapsed={collapsed}>
                                    <Link to={item.path}
                                          className={`flex items-center gap-3 rounded-xl transition-all ${collapsed?'justify-center p-2.5':'px-3 py-2.5'}`}
                                          style={{ color:'rgba(255,255,255,0.2)', border:'1px solid transparent' }}>
                                        <Icon size={15}/>
                                        {!collapsed && <span className="text-sm">{item.label}</span>}
                                    </Link>
                                </NavTooltip>
                            );
                        })}
                    </div>
                </nav>

                {/* Logout */}
                <div className="shrink-0 p-3" style={{ borderTop:'1px solid rgba(129,140,248,0.06)' }}>
                    <NavTooltip label="Đăng xuất" collapsed={collapsed}>
                        <button onClick={handleLogout}
                                className={`w-full flex items-center gap-3 rounded-xl transition-all ${collapsed?'justify-center p-2.5':'px-3 py-2.5'}`}
                                style={{ color:'rgba(248,113,113,0.6)', border:'1px solid transparent' }}
                                onMouseEnter={e=>{ e.currentTarget.style.background='rgba(239,68,68,0.08)'; e.currentTarget.style.color='#f87171'; e.currentTarget.style.borderColor='rgba(239,68,68,0.15)'; }}
                                onMouseLeave={e=>{ e.currentTarget.style.background='transparent'; e.currentTarget.style.color='rgba(248,113,113,0.6)'; e.currentTarget.style.borderColor='transparent'; }}>
                            <LogOut size={15}/>
                            {!collapsed && <span className="text-sm font-semibold">Đăng xuất</span>}
                        </button>
                    </NavTooltip>
                </div>

                {/* Collapse toggle */}
                <button onClick={()=>setCollapsed(!collapsed)}
                        className="absolute -right-3 top-20 hidden lg:flex w-6 h-6 rounded-full items-center justify-center transition-all shadow-lg hover:scale-110"
                        style={{ background:'rgba(4,5,16,0.9)', border:'1px solid rgba(129,140,248,0.2)', color:ACCENT }}>
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
                <header className="sticky top-0 z-20 h-16" style={{ background:'rgba(6,8,15,0.85)', borderBottom:'1px solid rgba(129,140,248,0.08)', backdropFilter:'blur(20px)' }}>
                    <div className="h-full px-5 flex items-center gap-4">

                        <button onClick={()=>setSidebarOpen(true)}
                                className="lg:hidden p-2 rounded-xl transition-colors"
                                style={{ color:'rgba(255,255,255,0.5)' }}>
                            <Menu size={20}/>
                        </button>

                        {/* Breadcrumb */}
                        <div className="hidden sm:flex items-center gap-2 text-sm">
                            <Link to="/staff" className="font-semibold transition-colors hover:opacity-80" style={{ color:'rgba(129,140,248,0.6)' }}>Staff</Link>
                            {currentPage && currentPage.path !== '/staff' && (
                                <>
                                    <ChevronRight size={13} style={{ color:'rgba(255,255,255,0.2)' }}/>
                                    <span className="font-bold text-white">{currentPage.label}</span>
                                </>
                            )}
                        </div>

                        {/* Check-in pill */}
                        {isCheckedIn && (
                            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl ml-2"
                                 style={{ background:'rgba(34,197,94,0.08)', border:'1px solid rgba(34,197,94,0.15)' }}>
                                <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background:'#22c55e' }}/>
                                <span className="text-xs font-black font-mono text-white">{fmt(seconds)}</span>
                            </div>
                        )}

                        <div className="flex-1"/>

                        <div className="flex items-center gap-2">

                            {/* Check-in/out button */}
                            {!isCheckedIn ? (
                                <button onClick={()=>setCheckedIn(true)}
                                        className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-white transition-all hover:brightness-110"
                                        style={{ background:'linear-gradient(135deg,#16a34a,#22c55e)', boxShadow:'0 4px 12px rgba(34,197,94,0.35)' }}>
                                    <Play size={13}/> Chấm công vào
                                </button>
                            ) : (
                                <button onClick={()=>{ if(window.confirm('Chấm công ra?')) setCheckedIn(false); }}
                                        className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-white transition-all hover:brightness-110"
                                        style={{ background:'linear-gradient(135deg,#dc2626,#ef4444)', boxShadow:'0 4px 12px rgba(239,68,68,0.35)' }}>
                                    <Square size={13}/> Chấm công ra
                                </button>
                            )}

                            {/* Upload */}
                            <Link to="/staff/photo-upload"
                                  className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all"
                                  style={{ background:ACCENT_DIM, border:`1px solid ${ACCENT_BORDER}`, color:ACCENT }}
                                  onMouseEnter={e=>e.currentTarget.style.background='rgba(129,140,248,0.2)'}
                                  onMouseLeave={e=>e.currentTarget.style.background=ACCENT_DIM}>
                                <Upload size={13}/> Upload ảnh
                            </Link>

                            {/* Notifications */}
                            <div className="relative" ref={notiRef}>
                                <button onClick={()=>{ setNotiOpen(!notiOpen); setProfileOpen(false); }}
                                        className="relative p-2.5 rounded-xl transition-colors"
                                        style={{ color:'rgba(255,255,255,0.4)' }}
                                        onMouseEnter={e=>e.currentTarget.style.background=ACCENT_DIM}
                                        onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                                    <Bell size={18}/>
                                    {unread > 0 && (
                                        <span className="absolute top-1.5 right-1.5 w-4 h-4 flex items-center justify-center text-white text-[9px] font-black rounded-full"
                                              style={{ background:'#ef4444' }}>{unread}</span>
                                    )}
                                </button>

                                {notiOpen && (
                                    <div className="absolute right-0 mt-2 w-80 rounded-2xl overflow-hidden shadow-2xl"
                                         style={{ background:'rgba(4,5,16,0.98)', border:'1px solid rgba(129,140,248,0.12)', backdropFilter:'blur(20px)' }}>
                                        <div className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
                                            <span className="font-black text-white" style={{ fontFamily:'Syne,sans-serif' }}>Thông báo</span>
                                            <button className="text-xs font-bold" style={{ color:ACCENT }}>Đọc tất cả</button>
                                        </div>
                                        <div className="max-h-72 overflow-y-auto divide-y" style={{ borderColor:'rgba(255,255,255,0.04)' }}>
                                            {NOTIS.map(n => (
                                                <div key={n.id} className="flex gap-3 px-5 py-3.5 cursor-pointer transition-colors"
                                                     style={{ background: n.unread ? 'rgba(129,140,248,0.04)' : 'transparent' }}
                                                     onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.03)'}
                                                     onMouseLeave={e=>e.currentTarget.style.background=n.unread?'rgba(129,140,248,0.04)':'transparent'}>
                                                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm flex-shrink-0"
                                                         style={{ background: n.type==='task'?'rgba(129,140,248,0.12)':n.type==='reminder'?'rgba(251,191,36,0.12)':'rgba(34,197,94,0.12)' }}>
                                                        {n.type==='task'?'📋':n.type==='reminder'?'⏰':'✅'}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-semibold leading-snug" style={{ color:'rgba(255,255,255,0.85)' }}>{n.msg}</p>
                                                        <p className="text-xs mt-0.5" style={{ color:'rgba(255,255,255,0.3)' }}>{n.time}</p>
                                                    </div>
                                                    {n.unread && <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ background:ACCENT }}/>}
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
                                        onMouseEnter={e=>e.currentTarget.style.background=ACCENT_DIM}
                                        onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                                    <UserAvatar avatarStr={user?.avatar} name={user?.username||'S'} size="sm"/>
                                    <div className="hidden lg:block text-left">
                                        <div className="text-sm font-bold text-white leading-none">{user?.username||'Staff'}</div>
                                        <div className="text-[10px] mt-0.5" style={{ color:ACCENT }}>Nhân viên</div>
                                    </div>
                                    <ChevronRight size={12} style={{ color:'rgba(255,255,255,0.3)', transform:profileOpen?'rotate(90deg)':'none', transition:'transform 0.2s' }}/>
                                </button>

                                {profileOpen && (
                                    <div className="absolute right-0 mt-2 w-52 rounded-2xl overflow-hidden shadow-2xl py-1"
                                         style={{ background:'rgba(4,5,16,0.98)', border:'1px solid rgba(129,140,248,0.12)', backdropFilter:'blur(20px)' }}>
                                        <div className="px-4 py-3 mb-1" style={{ borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
                                            <p className="text-sm font-black text-white">{user?.username}</p>
                                            <p className="text-xs mt-0.5" style={{ color:ACCENT }}>Nhân viên · FruitTrace</p>
                                        </div>
                                        {[
                                            { icon:User,     label:'Hồ sơ cá nhân', path:'/staff/profile'  },
                                            { icon:Settings, label:'Cài đặt',        path:'/staff/settings' },
                                        ].map(item => {
                                            const Icon = item.icon;
                                            return (
                                                <Link key={item.path} to={item.path} onClick={()=>setProfileOpen(false)}
                                                      className="flex items-center gap-3 px-4 py-2.5 text-sm transition-colors"
                                                      style={{ color:'rgba(255,255,255,0.45)' }}
                                                      onMouseEnter={e=>{ e.currentTarget.style.background=ACCENT_DIM; e.currentTarget.style.color='rgba(255,255,255,0.85)'; }}
                                                      onMouseLeave={e=>{ e.currentTarget.style.background='transparent'; e.currentTarget.style.color='rgba(255,255,255,0.45)'; }}>
                                                    <Icon size={14}/>
                                                    {item.label}
                                                </Link>
                                            );
                                        })}
                                        <div className="pt-1" style={{ borderTop:'1px solid rgba(255,255,255,0.05)' }}>
                                            <button onClick={handleLogout}
                                                    className="flex items-center gap-3 w-full px-4 py-2.5 text-sm transition-colors"
                                                    style={{ color:'rgba(248,113,113,0.6)' }}
                                                    onMouseEnter={e=>{ e.currentTarget.style.background='rgba(239,68,68,0.08)'; e.currentTarget.style.color='#f87171'; }}
                                                    onMouseLeave={e=>{ e.currentTarget.style.background='transparent'; e.currentTarget.style.color='rgba(248,113,113,0.6)'; }}>
                                                <LogOut size={14}/> Đăng xuất
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
                @keyframes orb1 { from{transform:translate(0,0) scale(1)} to{transform:translate(-40px,30px) scale(1.2)} }
                @keyframes orb2 { from{transform:translate(0,0) scale(1)} to{transform:translate(30px,-20px) scale(0.9)} }
                ::-webkit-scrollbar{width:4px}
                ::-webkit-scrollbar-track{background:transparent}
                ::-webkit-scrollbar-thumb{background:rgba(129,140,248,0.2);border-radius:4px}
            `}}/>
        </div>
    );
}