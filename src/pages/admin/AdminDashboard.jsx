    // src/pages/admin/AdminDashboard.jsx
    import React, { useState, useEffect, useRef } from 'react';
    import { Link } from 'react-router-dom';
    import { Users, Tractor, Package, Activity, RefreshCw, Settings, TrendingUp, ArrowUpRight, ArrowDownRight, Zap } from 'lucide-react';
    import { api } from '../../services/api';

    // ── Animated Counter ──
    const AnimatedNumber = ({ value, suffix = '' }) => {
        const [display, setDisplay] = useState(0);
        useEffect(() => {
            const target = parseInt(String(value).replace(/\D/g, '')) || 0;
            const duration = 1200;
            const steps = 40;
            let step = 0;
            const timer = setInterval(() => {
                step++;
                setDisplay(Math.round(target * (step / steps)));
                if (step >= steps) { setDisplay(target); clearInterval(timer); }
            }, duration / steps);
            return () => clearInterval(timer);
        }, [value]);
        return <>{display.toLocaleString()}{suffix}</>;
    };

    // ── Stat Card ──
    const StatCard = ({ icon, label, value, change, positive, accent, delay = 0 }) => (
        <div className="stat-card glass-card rounded-2xl p-5 relative overflow-hidden group cursor-default"
            style={{ animationDelay: `${delay}ms` }}>
            {/* Glow on hover */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"
                style={{ background: `radial-gradient(circle at 50% 0%, ${accent}15, transparent 70%)` }} />
            {/* Top accent line */}
            <div className="absolute top-0 left-0 right-0 h-[1px]"
                style={{ background: `linear-gradient(90deg, transparent, ${accent}80, transparent)` }} />

            <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center"
                        style={{ background: `${accent}18`, border: `1px solid ${accent}30` }}>
                        <span style={{ color: accent }}>{icon}</span>
                    </div>
                    <span className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${positive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                        {positive ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
                        {change}
                    </span>
                </div>
                <div className="text-3xl font-black text-white mb-1 tracking-tight" style={{ fontFamily: 'Syne, sans-serif' }}>
                    <AnimatedNumber value={value} />
                </div>
                <p className="text-sm text-slate-400 font-medium">{label}</p>
            </div>
        </div>
    );

    // ── Mini Sparkline SVG ──
    const Sparkline = ({ values, color }) => {
        const max = Math.max(...values);
        const min = Math.min(...values);
        const range = max - min || 1;
        const w = 120, h = 36;
        const pts = values.map((v, i) => `${(i / (values.length - 1)) * w},${h - ((v - min) / range) * h}`).join(' ');
        return (
            <svg width={w} height={h} className="overflow-visible">
                <defs>
                    <linearGradient id={`sg-${color}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity="0.3" />
                        <stop offset="100%" stopColor={color} stopOpacity="0" />
                    </linearGradient>
                </defs>
                <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        );
    };

    // ── Revenue Bar Chart ──
    const RevenueChart = ({ data }) => {
        const max = Math.max(...(data.values || [1]));
        return (
            <div className="flex items-end gap-2 h-32">
                {(data.categories || []).map((cat, i) => {
                    const pct = ((data.values?.[i] || 0) / max) * 100;
                    const isLast = i === (data.categories?.length || 0) - 1;
                    return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                            <div className="w-full rounded-t-lg relative overflow-hidden transition-all duration-300 group-hover:scale-105"
                                style={{ height: `${Math.max(pct, 8)}%`, background: isLast ? 'linear-gradient(180deg, #38bdf8, #818cf8)' : 'rgba(148,163,184,0.12)', minHeight: '4px' }}>
                                {isLast && <div className="absolute inset-0 shimmer-line rounded-t-lg" />}
                            </div>
                            <span className="text-[10px] text-slate-500">{cat}</span>
                        </div>
                    );
                })}
            </div>
        );
    };

    // ── Donut Chart ──
    const DonutChart = ({ data }) => {
        const colors = ['#38bdf8', '#818cf8', '#10b981'];
        const total = data.values.reduce((a, b) => a + b, 0);
        let offset = 0;
        const r = 36, cx = 44, cy = 44, circumference = 2 * Math.PI * r;
        return (
            <div className="flex items-center gap-4">
                <svg width="88" height="88" className="flex-shrink-0">
                    <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(148,163,184,0.08)" strokeWidth="10" />
                    {data.values.map((val, i) => {
                        const pct = val / total;
                        const dash = pct * circumference;
                        const gap = circumference - dash;
                        const seg = (
                            <circle key={i} cx={cx} cy={cy} r={r} fill="none"
                                    stroke={colors[i]} strokeWidth="10"
                                    strokeDasharray={`${dash} ${gap}`}
                                    strokeDashoffset={-offset * circumference}
                                    strokeLinecap="round"
                                    style={{ transform: 'rotate(-90deg)', transformOrigin: '44px 44px', filter: `drop-shadow(0 0 4px ${colors[i]}60)` }} />
                        );
                        offset += pct;
                        return seg;
                    })}
                    <text x={cx} y={cy + 1} textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="11" fontWeight="700">{total}%</text>
                </svg>
                <div className="space-y-1.5">
                    {data.labels.map((label, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm">
                            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: colors[i], boxShadow: `0 0 6px ${colors[i]}` }} />
                            <span className="text-slate-400">{label}</span>
                            <span className="text-white font-bold ml-auto">{data.values[i]}%</span>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    // ══════════════════════════════════════════
    const AdminDashboard = () => {
        const [stats, setStats]             = useState(null);
        const [recentActivities, setRecent] = useState([]);
        const [topFarms, setTopFarms]       = useState([]);
        const [revenueData, setRevenue]     = useState({ categories: ['T1','T2','T3','T4','T5','T6','T7','T8','T9','T10','T11','T12'], values: [] });
        const [farmDist, setFarmDist]       = useState({ labels: ['Miền Nam','Miền Bắc','Miền Trung'], values: [65,25,10] });
        const [loading, setLoading]         = useState(true);
        const [error, setError]             = useState(null);

        const fetchData = async () => {
            setLoading(true); setError(null);
            try {
                const [d, r, a, f] = await Promise.all([
                    api.get('/admin/dashboard'), api.get('/admin/revenue'),
                    api.get('/admin/activities'), api.get('/admin/top-farms'),
                ]);
                setStats(d.data); setRevenue(r.data); setRecent(a.data); setTopFarms(f.data);
            } catch {
                setError('Không thể tải dữ liệu. Đang hiển thị dữ liệu mẫu.');
                setStats({ totalUsers: 75, totalFarms: 18, totalBatches: 234, totalLogs: 1842 });
                setRevenue({ categories: ['T1','T2','T3','T4','T5','T6','T7','T8','T9','T10','T11','T12'], values: [42,58,71,65,89,94,78,102,115,98,127,143] });
            } finally { setLoading(false); }
        };

        useEffect(() => { fetchData(); }, []);

        const sparkData = [42,58,71,65,89,94,78,102,115,98,127,143];

        return (
            <div className="space-y-6">
                {/* ── Header ── */}
                <div className="flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #38bdf8, #818cf8)' }}>
                                <Zap size={16} className="text-white" />
                            </div>
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Control Center</span>
                        </div>
                        <h1 className="text-4xl font-black tracking-tight" style={{ fontFamily: 'Syne, sans-serif' }}>
                            <span className="neon-text-blue">Admin</span>
                            <span className="text-white"> Dashboard</span>
                        </h1>
                        <p className="text-slate-500 mt-1 text-sm">Toàn quyền kiểm soát hệ thống FruitTrace</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={fetchData} disabled={loading}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-slate-400 hover:text-white transition-all"
                                style={{ background: 'rgba(148,163,184,0.06)', border: '1px solid rgba(148,163,184,0.1)' }}>
                            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Làm mới
                        </button>
                        <Link to="/admin/settings"
                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
                            style={{ background: 'linear-gradient(135deg, #38bdf8, #818cf8)', boxShadow: '0 4px 20px rgba(56,189,248,0.3)' }}>
                            <Settings size={14} /> Cài đặt
                        </Link>
                    </div>
                </div>

                {error && (
                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-amber-400"
                        style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
                        ⚡ {error}
                    </div>
                )}

                {/* ── Stat Cards ── */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { icon: <Users size={20} />, label: 'Người dùng', value: stats?.totalUsers || 0, change: '+12%', positive: true, accent: '#38bdf8', delay: 0 },
                        { icon: <Tractor size={20} />, label: 'Nông trại', value: stats?.totalFarms || 0, change: '+8%', positive: true, accent: '#10b981', delay: 80 },
                        { icon: <Package size={20} />, label: 'Lô hàng', value: stats?.totalBatches || 0, change: '+15%', positive: true, accent: '#818cf8', delay: 160 },
                        { icon: <Activity size={20} />, label: 'Nhật ký', value: stats?.totalLogs || 0, change: '+20%', positive: true, accent: '#f59e0b', delay: 240 },
                    ].map((card, i) => <StatCard key={i} {...card} />)}
                </div>

                {/* ── Charts Row ── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Revenue */}
                    <div className="lg:col-span-2 glass-card rounded-2xl p-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 opacity-5 rounded-full"
                            style={{ background: 'radial-gradient(circle, #38bdf8, transparent)', transform: 'translate(30%, -30%)' }} />
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-lg font-bold text-white" style={{ fontFamily: 'Syne, sans-serif' }}>Doanh thu</h3>
                                <p className="text-xs text-slate-500 mt-0.5">12 tháng gần nhất</p>
                            </div>
                            <div className="flex items-center gap-2 text-emerald-400 text-sm font-bold">
                                <TrendingUp size={16} />
                                <span>+18.4%</span>
                                <Sparkline values={sparkData} color="#10b981" />
                            </div>
                        </div>
                        <RevenueChart data={revenueData} />
                    </div>

                    {/* Farm distribution */}
                    <div className="glass-card rounded-2xl p-6">
                        <h3 className="text-lg font-bold text-white mb-5" style={{ fontFamily: 'Syne, sans-serif' }}>🗺️ Phân bố</h3>
                        <DonutChart data={farmDist} />
                        <div className="mt-5 pt-4" style={{ borderTop: '1px solid rgba(148,163,184,0.08)' }}>
                            <p className="text-xs text-slate-500 text-center">Tổng cộng {farmDist.values.reduce((a,b)=>a+b,0)} nông trại đang hoạt động</p>
                        </div>
                    </div>
                </div>

                {/* ── Activities + Top Farms ── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Activities */}
                    <div className="glass-card rounded-2xl overflow-hidden">
                        <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(148,163,184,0.06)' }}>
                            <h3 className="font-bold text-white" style={{ fontFamily: 'Syne, sans-serif' }}>🔔 Hoạt động gần đây</h3>
                            <span className="text-xs text-slate-500">{recentActivities.length} sự kiện</span>
                        </div>
                        <div className="divide-y" style={{ borderColor: 'rgba(148,163,184,0.04)' }}>
                            {loading ? [...Array(4)].map((_, i) => (
                                <div key={i} className="flex items-center gap-3 px-6 py-4">
                                    <div className="w-8 h-8 rounded-full shimmer-line flex-shrink-0" style={{ background: 'rgba(148,163,184,0.1)' }} />
                                    <div className="flex-1 space-y-1.5">
                                        <div className="h-3 rounded shimmer-line" style={{ background: 'rgba(148,163,184,0.1)', width: '60%' }} />
                                        <div className="h-2.5 rounded shimmer-line" style={{ background: 'rgba(148,163,184,0.06)', width: '40%' }} />
                                    </div>
                                </div>
                            )) : recentActivities.length === 0 ? (
                                <div className="px-6 py-8 text-center text-slate-600 text-sm">Chưa có hoạt động</div>
                            ) : recentActivities.map((a, i) => (
                                <div key={i} className="flex items-start gap-3 px-6 py-4 hover:bg-white/[0.02] transition-colors">
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                                        style={{ background: 'linear-gradient(135deg, rgba(56,189,248,0.2), rgba(129,140,248,0.2))', border: '1px solid rgba(56,189,248,0.2)', color: '#38bdf8' }}>
                                        {i + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-slate-200 truncate">{a.user}</p>
                                        <p className="text-xs text-slate-500 truncate">{a.action}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Top Farms */}
                    <div className="glass-card rounded-2xl overflow-hidden">
                        <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(148,163,184,0.06)' }}>
                            <h3 className="font-bold text-white" style={{ fontFamily: 'Syne, sans-serif' }}>🏆 Top Nông trại</h3>
                            <Link to="/admin/farms" className="text-xs text-sky-400 hover:text-sky-300 transition-colors font-semibold">Xem tất cả →</Link>
                        </div>
                        <div className="p-6 space-y-3">
                            {loading ? [...Array(4)].map((_,i) => (
                                <div key={i} className="h-12 rounded-xl shimmer-line" style={{ background: 'rgba(148,163,184,0.06)' }} />
                            )) : topFarms.length === 0 ? (
                                <p className="text-slate-600 text-sm text-center py-4">Chưa có dữ liệu</p>
                            ) : topFarms.map((farm, i) => (
                                <div key={i} className="flex items-center gap-3 p-3 rounded-xl transition-all hover:bg-white/[0.03] group"
                                    style={{ border: '1px solid rgba(148,163,184,0.06)' }}>
                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black flex-shrink-0"
                                        style={{
                                            background: i === 0 ? 'linear-gradient(135deg, #f59e0b, #fbbf24)' : i === 1 ? 'linear-gradient(135deg, #94a3b8, #cbd5e1)' : i === 2 ? 'linear-gradient(135deg, #f97316, #fb923c)' : 'rgba(148,163,184,0.1)',
                                            color: i < 3 ? '#020617' : '#64748b'
                                        }}>
                                        {i + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-slate-200 truncate">{farm.name}</p>
                                        <p className="text-xs text-slate-500">{farm.province}</p>
                                    </div>
                                    <span className="text-sm font-black" style={{ color: '#38bdf8' }}>{farm.batches} lô</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    export default AdminDashboard;