// src/pages/admin/AnalyticsPage.jsx
import React, { useState, useEffect } from 'react';
import {
    TrendingUp, Package, Building2, Users, ShoppingCart,
    CheckCircle, Truck, Sprout, AlertTriangle, RefreshCw,
    BarChart2, PieChart, Activity
} from 'lucide-react';
import { batchService }   from '../../services/batchService';
import { farmService }    from '../../services/farmService';
import { productService } from '../../services/productService';
import { userService }    from '../../services/userService';

// ── Mini bar chart ──
const BarChart = ({ data, color }) => {
    const max = Math.max(...data.map(d => d.value), 1);
    return (
        <div className="flex items-end gap-1 h-16">
            {data.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full rounded-sm transition-all duration-700"
                         style={{ height:`${(d.value/max)*100}%`, background:color, opacity:0.7+0.3*(i/data.length), minHeight:'2px' }}/>
                    <span className="text-[8px]" style={{ color:'rgba(255,255,255,0.25)' }}>{d.label}</span>
                </div>
            ))}
        </div>
    );
};

// ── Donut chart ──
const DonutChart = ({ segments }) => {
    const total = segments.reduce((s, i) => s + i.value, 0) || 1;
    let offset = 0;
    const r = 40, circ = 2 * Math.PI * r;
    return (
        <div className="relative w-24 h-24 flex-shrink-0">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="12"/>
                {segments.map((s, i) => {
                    const pct = s.value / total;
                    const dash = pct * circ;
                    const el = (
                        <circle key={i} cx="50" cy="50" r={r} fill="none"
                                stroke={s.color} strokeWidth="12"
                                strokeDasharray={`${dash} ${circ - dash}`}
                                strokeDashoffset={-offset * circ}
                                strokeLinecap="round"/>
                    );
                    offset += pct;
                    return el;
                })}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-lg font-black text-white">{total}</span>
                <span className="text-[9px]" style={{ color:'rgba(255,255,255,0.35)' }}>tổng</span>
            </div>
        </div>
    );
};

// ── Stat card ──
const StatCard = ({ icon, label, value, sub, color, loading }) => (
    <div className="rounded-2xl p-5 relative overflow-hidden group hover:bg-white/[0.03] transition-all"
         style={{ background:'rgba(4,5,16,0.7)', border:'1px solid rgba(255,255,255,0.07)' }}>
        <div className="absolute top-0 left-0 right-0 h-px"
             style={{ background:`linear-gradient(90deg,transparent,${color}50,transparent)` }}/>
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
             style={{ background:`radial-gradient(circle at 50% 100%,${color}08,transparent 70%)` }}/>
        <div className="relative">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                 style={{ background:`${color}15`, border:`1px solid ${color}25`, color }}>
                {icon}
            </div>
            <div className="text-3xl font-black text-white" style={{ fontFamily:'Syne,sans-serif' }}>
                {loading ? '—' : value}
            </div>
            <div className="text-xs mt-0.5" style={{ color:'rgba(255,255,255,0.35)' }}>{label}</div>
            {sub && <div className="text-[10px] mt-1 font-semibold" style={{ color }}>{sub}</div>}
        </div>
    </div>
);

export default function AnalyticsPage() {
    const [batches,  setBatches]  = useState([]);
    const [farms,    setFarms]    = useState([]);
    const [products, setProducts] = useState([]);
    const [users,    setUsers]    = useState([]);
    const [loading,  setLoading]  = useState(true);

    const load = async () => {
        setLoading(true);
        try {
            const [br, fr, pr, ur] = await Promise.allSettled([
                batchService.getAll(),
                farmService.getAll(),
                productService.getAll(),
                userService.getAll(),
            ]);
            if (br.status==='fulfilled') setBatches(br.value.data || []);
            if (fr.status==='fulfilled') setFarms(fr.value.data || []);
            if (pr.status==='fulfilled') setProducts(pr.value.data || []);
            if (ur.status==='fulfilled') setUsers(ur.value.data || []);
        } catch {}
        finally { setLoading(false); }
    };
    useEffect(() => { load(); }, []);

    // ── Computed stats ──
    const totalKg    = batches.reduce((s, b) => s + (b.quantitykg || 0), 0);
    const available  = batches.filter(b => b.status === 'available').length;
    const shipping   = batches.filter(b => b.status === 'shipping').length;
    const sold       = batches.filter(b => b.status === 'sold').length;
    const harvested  = batches.filter(b => b.status === 'harvested').length;

    const expiring = batches.filter(b => {
        if (!b.expirydate) return false;
        const d = Math.ceil((new Date(b.expirydate) - new Date()) / 86400000);
        return d >= 0 && d <= 7;
    }).length;
    const expired = batches.filter(b => {
        if (!b.expirydate) return false;
        return new Date(b.expirydate) < new Date();
    }).length;

    // Farm by province
    const byProvince = farms.reduce((acc, f) => {
        const p = f.province || 'Khác';
        acc[p] = (acc[p] || 0) + 1;
        return acc;
    }, {});
    const topProvinces = Object.entries(byProvince)
        .sort((a, b) => b[1] - a[1]).slice(0, 5)
        .map(([label, value]) => ({ label: label.replace('Tỉnh ','').replace('Thành phố ','').slice(0,8), value }));

    // Batch by farm
    const byFarm = batches.reduce((acc, b) => {
        acc[b.farmid] = (acc[b.farmid] || 0) + 1;
        return acc;
    }, {});
    const topFarms = Object.entries(byFarm)
        .sort((a, b) => b[1] - a[1]).slice(0, 6)
        .map(([label, value]) => ({ label, value }));

    // Cert breakdown
    const certs = farms.reduce((acc, f) => {
        const c = f.certification || 'Khác';
        acc[c] = (acc[c] || 0) + 1;
        return acc;
    }, {});

    // Role breakdown
    const roles = users.reduce((acc, u) => {
        const r = u.role || 'user';
        acc[r] = (acc[r] || 0) + 1;
        return acc;
    }, {});

    const STATUS_SEGS = [
        { label:'Có sẵn',    value:available, color:'#22c55e' },
        { label:'Vận chuyển',value:shipping,  color:'#38bdf8' },
        { label:'Đã bán',    value:sold,      color:'#a78bfa' },
        { label:'Thu hoạch', value:harvested, color:'#fbbf24' },
    ];

    const CERT_COLORS = ['#22c55e','#38bdf8','#a78bfa','#fbbf24','#f97316'];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-white" style={{ fontFamily:'Syne,sans-serif' }}>📊 Phân tích</h1>
                    <p className="text-sm mt-1" style={{ color:'rgba(255,255,255,0.35)' }}>Thống kê toàn hệ thống FruitTrace</p>
                </div>
                <button onClick={load}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all"
                        style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', color:'rgba(255,255,255,0.6)' }}>
                    <RefreshCw size={15} className={loading?'animate-spin':''}/> Làm mới
                </button>
            </div>

            {/* Main stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <StatCard icon={<Package size={18}/>}   label="Tổng lô hàng"  value={batches.length}  sub={`${totalKg.toLocaleString('vi-VN')} kg`} color="#38bdf8" loading={loading}/>
                <StatCard icon={<Building2 size={18}/>} label="Nông trại"     value={farms.length}    sub={`${Object.keys(byProvince).length} tỉnh/thành`} color="#22c55e" loading={loading}/>
                <StatCard icon={<ShoppingCart size={18}/>} label="Sản phẩm"  value={products.length} sub="loại nông sản" color="#a78bfa" loading={loading}/>
                <StatCard icon={<Users size={18}/>}     label="Người dùng"   value={users.length}    sub={`${roles.admin||0} admin`} color="#fbbf24" loading={loading}/>
            </div>

            {/* Alerts */}
            {(expiring > 0 || expired > 0) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {expiring > 0 && (
                        <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm"
                             style={{ background:'rgba(251,191,36,0.08)', border:'1px solid rgba(251,191,36,0.2)', color:'#fde68a' }}>
                            <AlertTriangle size={15} className="flex-shrink-0"/>
                            <span><strong>{expiring}</strong> lô hàng sắp hết hạn trong 7 ngày</span>
                        </div>
                    )}
                    {expired > 0 && (
                        <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm"
                             style={{ background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)', color:'#fca5a5' }}>
                            <AlertTriangle size={15} className="flex-shrink-0"/>
                            <span><strong>{expired}</strong> lô hàng đã hết hạn</span>
                        </div>
                    )}
                </div>
            )}

            {/* Charts row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

                {/* Batch status donut */}
                <div className="rounded-2xl p-5" style={{ background:'rgba(4,5,16,0.7)', border:'1px solid rgba(255,255,255,0.07)' }}>
                    <h3 className="font-black text-white text-sm mb-4" style={{ fontFamily:'Syne,sans-serif' }}>
                        <BarChart2 size={14} className="inline mr-1.5" style={{ color:'#38bdf8' }}/>
                        Trạng thái lô hàng
                    </h3>
                    <div className="flex items-center gap-4">
                        <DonutChart segments={STATUS_SEGS}/>
                        <div className="space-y-2 flex-1">
                            {STATUS_SEGS.map((s,i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full" style={{ background:s.color }}/>
                                        <span className="text-xs" style={{ color:'rgba(255,255,255,0.5)' }}>{s.label}</span>
                                    </div>
                                    <span className="text-xs font-bold text-white">{s.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Top farms bar */}
                <div className="rounded-2xl p-5" style={{ background:'rgba(4,5,16,0.7)', border:'1px solid rgba(255,255,255,0.07)' }}>
                    <h3 className="font-black text-white text-sm mb-4" style={{ fontFamily:'Syne,sans-serif' }}>
                        <Activity size={14} className="inline mr-1.5" style={{ color:'#22c55e' }}/>
                        Farm nhiều lô nhất
                    </h3>
                    {loading ? <div className="h-16 animate-pulse rounded-lg" style={{ background:'rgba(255,255,255,0.04)' }}/> :
                        topFarms.length > 0 ? <BarChart data={topFarms} color="#22c55e"/> :
                            <p className="text-xs text-center py-6" style={{ color:'rgba(255,255,255,0.25)' }}>Chưa có dữ liệu</p>
                    }
                </div>

                {/* Farm by province bar */}
                <div className="rounded-2xl p-5" style={{ background:'rgba(4,5,16,0.7)', border:'1px solid rgba(255,255,255,0.07)' }}>
                    <h3 className="font-black text-white text-sm mb-4" style={{ fontFamily:'Syne,sans-serif' }}>
                        <Building2 size={14} className="inline mr-1.5" style={{ color:'#a78bfa' }}/>
                        Farm theo tỉnh
                    </h3>
                    {loading ? <div className="h-16 animate-pulse rounded-lg" style={{ background:'rgba(255,255,255,0.04)' }}/> :
                        topProvinces.length > 0 ? <BarChart data={topProvinces} color="#a78bfa"/> :
                            <p className="text-xs text-center py-6" style={{ color:'rgba(255,255,255,0.25)' }}>Chưa có dữ liệu</p>
                    }
                </div>
            </div>

            {/* Bottom row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                {/* Cert breakdown */}
                <div className="rounded-2xl p-5" style={{ background:'rgba(4,5,16,0.7)', border:'1px solid rgba(255,255,255,0.07)' }}>
                    <h3 className="font-black text-white text-sm mb-4" style={{ fontFamily:'Syne,sans-serif' }}>
                        <CheckCircle size={14} className="inline mr-1.5" style={{ color:'#22c55e' }}/>
                        Chứng nhận nông trại
                    </h3>
                    <div className="space-y-3">
                        {Object.entries(certs).map(([cert, count], i) => (
                            <div key={cert}>
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs font-semibold" style={{ color:'rgba(255,255,255,0.6)' }}>{cert}</span>
                                    <span className="text-xs font-black text-white">{count} farm</span>
                                </div>
                                <div className="h-1.5 rounded-full overflow-hidden" style={{ background:'rgba(255,255,255,0.06)' }}>
                                    <div className="h-full rounded-full transition-all duration-700"
                                         style={{ width:`${(count/farms.length)*100}%`, background:CERT_COLORS[i%5] }}/>
                                </div>
                            </div>
                        ))}
                        {Object.keys(certs).length === 0 && (
                            <p className="text-xs text-center py-4" style={{ color:'rgba(255,255,255,0.25)' }}>Chưa có dữ liệu</p>
                        )}
                    </div>
                </div>

                {/* Batch expiry timeline */}
                <div className="rounded-2xl p-5" style={{ background:'rgba(4,5,16,0.7)', border:'1px solid rgba(255,255,255,0.07)' }}>
                    <h3 className="font-black text-white text-sm mb-4" style={{ fontFamily:'Syne,sans-serif' }}>
                        <AlertTriangle size={14} className="inline mr-1.5" style={{ color:'#fbbf24' }}/>
                        Tình trạng hạn sử dụng
                    </h3>
                    <div className="space-y-3">
                        {[
                            { label:'Đã hết hạn',         value:expired,                  color:'#f87171' },
                            { label:'Hết hạn trong 7 ngày',value:expiring,                color:'#fbbf24' },
                            { label:'Còn hạn > 7 ngày',   value:batches.length-expired-expiring, color:'#22c55e' },
                        ].map((item, i) => (
                            <div key={i}>
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs font-semibold" style={{ color:'rgba(255,255,255,0.6)' }}>{item.label}</span>
                                    <span className="text-xs font-black" style={{ color:item.color }}>{item.value} lô</span>
                                </div>
                                <div className="h-1.5 rounded-full overflow-hidden" style={{ background:'rgba(255,255,255,0.06)' }}>
                                    <div className="h-full rounded-full"
                                         style={{ width:`${batches.length?((item.value/batches.length)*100):0}%`, background:item.color }}/>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Quick stats */}
                    <div className="grid grid-cols-3 gap-2 mt-4 pt-4" style={{ borderTop:'1px solid rgba(255,255,255,0.05)' }}>
                        {[
                            { label:'Có sẵn',    value:available, color:'#22c55e' },
                            { label:'Vận chuyển',value:shipping,  color:'#38bdf8' },
                            { label:'Đã bán',    value:sold,      color:'#a78bfa' },
                        ].map((s,i) => (
                            <div key={i} className="text-center p-2 rounded-xl" style={{ background:'rgba(255,255,255,0.03)' }}>
                                <div className="text-lg font-black" style={{ color:s.color, fontFamily:'Syne,sans-serif' }}>{s.value}</div>
                                <div className="text-[9px]" style={{ color:'rgba(255,255,255,0.3)' }}>{s.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
