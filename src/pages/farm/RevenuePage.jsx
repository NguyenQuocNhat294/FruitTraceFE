// src/pages/farm/RevenuePage.jsx
import React, { useState, useEffect } from 'react';
import {
    TrendingUp, Package, DollarSign, BarChart2,
    RefreshCw, ChevronUp, ChevronDown, Calendar,
    ShoppingCart, Sprout, Truck, CheckCircle
} from 'lucide-react';
import { batchService }   from '../../services/batchService';
import { farmService }    from '../../services/farmService';
import { productService } from '../../services/productService';
import { useAuth }        from '../../hooks/useAuth';

const fmt     = n => (n||0).toLocaleString('vi-VN');
const fmtCur  = n => `${fmt(n)}đ`;

// ── Mini sparkline ──
const Sparkline = ({ values, color }) => {
    if (!values || values.length < 2) return null;
    const max = Math.max(...values, 1);
    const min = Math.min(...values);
    const h = 40, w = 120;
    const pts = values.map((v, i) => {
        const x = (i / (values.length - 1)) * w;
        const y = h - ((v - min) / (max - min || 1)) * h;
        return `${x},${y}`;
    }).join(' ');
    return (
        <svg width={w} height={h} className="opacity-60">
            <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
    );
};

// ── Bar chart ──
const BarChart = ({ data, color, valuePrefix='' }) => {
    const max = Math.max(...data.map(d=>d.value), 1);
    return (
        <div className="flex items-end gap-1.5 h-20">
            {data.map((d,i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                    <div className="relative w-full">
                        <div className="w-full rounded-t-sm transition-all duration-700 cursor-pointer"
                             style={{ height:`${Math.max((d.value/max)*72,2)}px`, background:`${color}`, opacity:0.5+0.5*(i/(data.length-1||1)) }}/>
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-black/80 text-white text-[9px] px-1.5 py-0.5 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                            {valuePrefix}{fmt(d.value)}
                        </div>
                    </div>
                    <span className="text-[8px] text-center" style={{ color:'rgba(255,255,255,0.25)' }}>{d.label}</span>
                </div>
            ))}
        </div>
    );
};

// ── Stat card ──
const StatCard = ({ icon, label, value, sub, color, trend, spark }) => (
    <div className="rounded-2xl p-5 relative overflow-hidden group hover:bg-white/[0.03] transition-all"
         style={{ background:'rgba(4,5,16,0.7)', border:'1px solid rgba(255,255,255,0.07)' }}>
        <div className="absolute top-0 left-0 right-0 h-px"
             style={{ background:`linear-gradient(90deg,transparent,${color}50,transparent)` }}/>
        <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                 style={{ background:`${color}15`, color }}>{icon}</div>
            {trend !== undefined && (
                <div className={`flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full`}
                     style={ trend >= 0
                         ? { background:'rgba(34,197,94,0.12)', color:'#4ade80' }
                         : { background:'rgba(239,68,68,0.12)', color:'#f87171' }
                     }>
                    {trend >= 0 ? <ChevronUp size={11}/> : <ChevronDown size={11}/>}
                    {Math.abs(trend)}%
                </div>
            )}
        </div>
        <div className="flex items-end justify-between">
            <div>
                <div className="text-2xl font-black text-white" style={{ fontFamily:'Syne,sans-serif' }}>{value}</div>
                <div className="text-xs mt-0.5" style={{ color:'rgba(255,255,255,0.35)' }}>{label}</div>
                {sub && <div className="text-[10px] mt-0.5 font-semibold" style={{ color }}>{sub}</div>}
            </div>
            {spark && <Sparkline values={spark} color={color}/>}
        </div>
    </div>
);

const MONTHS = ['T1','T2','T3','T4','T5','T6','T7','T8','T9','T10','T11','T12'];
const COLORS  = ['#22c55e','#38bdf8','#fbbf24','#a78bfa','#f97316','#f87171','#10b981','#06b6d4'];

export default function RevenuePage() {
    const { user }              = useAuth();
    const [batches, setBatches] = useState([]);
    const [farms,   setFarms]   = useState([]);
    const [products,setProducts]= useState([]);
    const [loading, setLoading] = useState(true);
    const [period,  setPeriod]  = useState('month'); // month | quarter | year
    const [myFarms, setMyFarms] = useState([]);

    const load = async () => {
        setLoading(true);
        try {
            const [br, fr, pr] = await Promise.allSettled([
                batchService.getAll(),
                farmService.getAll(),
                productService.getAll(),
            ]);
            const allBatches   = br.status==='fulfilled' ? br.value.data||[] : [];
            const allFarms     = fr.status==='fulfilled' ? fr.value.data||[] : [];
            const allProducts  = pr.status==='fulfilled' ? pr.value.data||[] : [];

            const mine = allFarms.filter(f => f.OwnerId === user?.id);
            setMyFarms(mine);
            const myFarmIds = mine.map(f => f.id);
            setBatches(allBatches.filter(b => myFarmIds.includes(b.farmid)));
            setFarms(mine);
            setProducts(allProducts);
        } catch {}
        finally { setLoading(false); }
    };
    useEffect(() => { load(); }, [user?.id]);

    // ── Computed ──
    const sold       = batches.filter(b => b.status === 'sold');
    const shipping   = batches.filter(b => b.status === 'shipping');
    const available  = batches.filter(b => b.status === 'available');
    const totalKg    = batches.reduce((s,b) => s+(b.quantitykg||0), 0);
    const soldKg     = sold.reduce((s,b)     => s+(b.quantitykg||0), 0);

    // Estimate revenue (quantitykg * avg product price)
    const avgPrice = products.length ? products.reduce((s,p)=>s+(p.price||0),0)/products.length : 25000;
    const totalRevenue = soldKg * avgPrice;
    const pendingRevenue = batches.filter(b=>b.status!=='sold').reduce((s,b)=>s+(b.quantitykg||0),0) * avgPrice;

    // By month
    const byMonth = MONTHS.map((label,i) => ({
        label,
        value: batches.filter(b => {
            if (!b.harvestdate) return false;
            return new Date(b.harvestdate).getMonth() === i;
        }).reduce((s,b) => s+(b.quantitykg||0), 0)
    }));

    // By farm
    const byFarm = farms.map((f,i) => ({
        name:  f.FarmName || f.id,
        kg:    batches.filter(b=>b.farmid===f.id).reduce((s,b)=>s+(b.quantitykg||0),0),
        count: batches.filter(b=>b.farmid===f.id).length,
        color: COLORS[i%COLORS.length],
    })).sort((a,b)=>b.kg-a.kg);

    // By status
    const statusData = [
        { label:'Đã bán',     value:sold.length,      color:'#a78bfa', kg:soldKg },
        { label:'Vận chuyển', value:shipping.length,  color:'#38bdf8', kg:shipping.reduce((s,b)=>s+(b.quantitykg||0),0) },
        { label:'Có sẵn',    value:available.length,  color:'#22c55e', kg:available.reduce((s,b)=>s+(b.quantitykg||0),0) },
    ];

    // Top products (by batch count matching productid)
    const prodCount = batches.reduce((acc,b)=>{
        acc[b.productid] = (acc[b.productid]||0) + 1;
        return acc;
    },{});
    const topProducts = Object.entries(prodCount)
        .sort((a,b)=>b[1]-a[1]).slice(0,5)
        .map(([name,count])=>({ name, count, pct: Math.round((count/batches.length||1)*100) }));

    const sparkData = byMonth.slice(0,8).map(m=>m.value);

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-white" style={{ fontFamily:'Syne,sans-serif' }}>💰 Doanh thu</h1>
                    <p className="text-sm mt-1" style={{ color:'rgba(255,255,255,0.35)' }}>
                        Thống kê sản lượng và doanh thu nông trại
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {/* Period toggle */}
                    <div className="flex rounded-xl overflow-hidden" style={{ border:'1px solid rgba(255,255,255,0.08)' }}>
                        {[{val:'month',label:'Tháng'},{val:'quarter',label:'Quý'},{val:'year',label:'Năm'}].map(p=>(
                            <button key={p.val} onClick={()=>setPeriod(p.val)}
                                    className="px-3 py-2 text-xs font-bold transition-all"
                                    style={ period===p.val
                                        ? { background:'rgba(34,197,94,0.15)', color:'#4ade80' }
                                        : { background:'transparent', color:'rgba(255,255,255,0.3)' }
                                    }>{p.label}</button>
                        ))}
                    </div>
                    <button onClick={load}
                            className="p-2.5 rounded-xl transition-all"
                            style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', color:'rgba(255,255,255,0.5)' }}>
                        <RefreshCw size={15} className={loading?'animate-spin':''}/>
                    </button>
                </div>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <StatCard icon={<DollarSign size={18}/>} label="Doanh thu ước tính" color="#22c55e"
                          value={loading?'—':fmtCur(totalRevenue)} sub={`${fmt(soldKg)}kg đã bán`}
                          trend={12} spark={sparkData}/>
                <StatCard icon={<Package size={18}/>} label="Tổng lô hàng" color="#38bdf8"
                          value={loading?'—':batches.length} sub={`${myFarms.length} nông trại`}
                          trend={5}/>
                <StatCard icon={<Sprout size={18}/>} label="Tổng sản lượng" color="#fbbf24"
                          value={loading?'—':`${fmt(totalKg)}kg`} sub="thu hoạch"
                          trend={8}/>
                <StatCard icon={<TrendingUp size={18}/>} label="Doanh thu chờ" color="#a78bfa"
                          value={loading?'—':fmtCur(pendingRevenue)} sub="chưa bán"/>
            </div>

            {/* Charts row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Monthly output */}
                <div className="lg:col-span-2 rounded-2xl p-5"
                     style={{ background:'rgba(4,5,16,0.7)', border:'1px solid rgba(255,255,255,0.07)' }}>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-black text-white text-sm" style={{ fontFamily:'Syne,sans-serif' }}>
                            <BarChart2 size={14} className="inline mr-1.5" style={{ color:'#22c55e' }}/>
                            Sản lượng theo tháng (kg)
                        </h3>
                        <span className="text-xs" style={{ color:'rgba(255,255,255,0.3)' }}>
                            Năm {new Date().getFullYear()}
                        </span>
                    </div>
                    {loading
                        ? <div className="h-20 animate-pulse rounded-xl" style={{ background:'rgba(255,255,255,0.04)' }}/>
                        : <BarChart data={byMonth} color="#22c55e"/>
                    }
                </div>

                {/* Status breakdown */}
                <div className="rounded-2xl p-5"
                     style={{ background:'rgba(4,5,16,0.7)', border:'1px solid rgba(255,255,255,0.07)' }}>
                    <h3 className="font-black text-white text-sm mb-4" style={{ fontFamily:'Syne,sans-serif' }}>
                        <ShoppingCart size={14} className="inline mr-1.5" style={{ color:'#a78bfa' }}/>
                        Trạng thái lô hàng
                    </h3>
                    <div className="space-y-3">
                        {statusData.map((s,i) => (
                            <div key={i}>
                                <div className="flex items-center justify-between mb-1">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full" style={{ background:s.color }}/>
                                        <span className="text-xs" style={{ color:'rgba(255,255,255,0.5)' }}>{s.label}</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-xs font-black text-white">{s.value} lô</span>
                                        <span className="text-[10px] ml-1" style={{ color:'rgba(255,255,255,0.3)' }}>{fmt(s.kg)}kg</span>
                                    </div>
                                </div>
                                <div className="h-1.5 rounded-full overflow-hidden" style={{ background:'rgba(255,255,255,0.06)' }}>
                                    <div className="h-full rounded-full transition-all duration-700"
                                         style={{ width:`${batches.length?(s.value/batches.length*100):0}%`, background:s.color }}/>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Revenue estimate */}
                    <div className="mt-4 pt-4 rounded-xl p-3"
                         style={{ background:'rgba(34,197,94,0.08)', border:'1px solid rgba(34,197,94,0.15)', borderTop:'none' }}>
                        <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color:'rgba(34,197,94,0.7)' }}>
                            Doanh thu ước tính
                        </p>
                        <p className="text-lg font-black" style={{ color:'#4ade80', fontFamily:'Syne,sans-serif' }}>
                            {loading ? '—' : fmtCur(totalRevenue)}
                        </p>
                        <p className="text-[10px] mt-0.5" style={{ color:'rgba(255,255,255,0.3)' }}>
                            Dựa trên giá trung bình {fmtCur(avgPrice)}/kg
                        </p>
                    </div>
                </div>
            </div>

            {/* Bottom row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Farm performance */}
                <div className="rounded-2xl p-5"
                     style={{ background:'rgba(4,5,16,0.7)', border:'1px solid rgba(255,255,255,0.07)' }}>
                    <h3 className="font-black text-white text-sm mb-4" style={{ fontFamily:'Syne,sans-serif' }}>
                        🌾 Hiệu suất nông trại
                    </h3>
                    {loading ? (
                        <div className="space-y-3">
                            {[...Array(3)].map((_,i)=>(
                                <div key={i} className="h-10 rounded-xl animate-pulse" style={{ background:'rgba(255,255,255,0.04)' }}/>
                            ))}
                        </div>
                    ) : byFarm.length === 0 ? (
                        <p className="text-xs text-center py-8" style={{ color:'rgba(255,255,255,0.25)' }}>Chưa có dữ liệu</p>
                    ) : (
                        <div className="space-y-3">
                            {byFarm.map((f,i) => {
                                const maxKg = byFarm[0]?.kg || 1;
                                return (
                                    <div key={i}>
                                        <div className="flex items-center justify-between mb-1">
                                            <div className="flex items-center gap-2">
                                                <div className="w-5 h-5 rounded-lg flex items-center justify-center text-[10px] font-black text-white"
                                                     style={{ background:f.color }}>
                                                    {i+1}
                                                </div>
                                                <span className="text-xs font-semibold truncate max-w-[120px]" style={{ color:'rgba(255,255,255,0.7)' }}>
                                                    {f.name}
                                                </span>
                                            </div>
                                            <div className="text-right flex-shrink-0">
                                                <span className="text-xs font-black text-white">{fmt(f.kg)}kg</span>
                                                <span className="text-[10px] ml-1" style={{ color:'rgba(255,255,255,0.3)' }}>{f.count} lô</span>
                                            </div>
                                        </div>
                                        <div className="h-1.5 rounded-full overflow-hidden" style={{ background:'rgba(255,255,255,0.06)' }}>
                                            <div className="h-full rounded-full transition-all duration-700"
                                                 style={{ width:`${(f.kg/maxKg)*100}%`, background:f.color }}/>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Top products */}
                <div className="rounded-2xl p-5"
                     style={{ background:'rgba(4,5,16,0.7)', border:'1px solid rgba(255,255,255,0.07)' }}>
                    <h3 className="font-black text-white text-sm mb-4" style={{ fontFamily:'Syne,sans-serif' }}>
                        🍊 Sản phẩm nổi bật
                    </h3>
                    {loading ? (
                        <div className="space-y-3">
                            {[...Array(4)].map((_,i)=>(
                                <div key={i} className="h-10 rounded-xl animate-pulse" style={{ background:'rgba(255,255,255,0.04)' }}/>
                            ))}
                        </div>
                    ) : topProducts.length === 0 ? (
                        <p className="text-xs text-center py-8" style={{ color:'rgba(255,255,255,0.25)' }}>Chưa có dữ liệu</p>
                    ) : (
                        <div className="space-y-3">
                            {topProducts.map((p,i) => (
                                <div key={i}>
                                    <div className="flex items-center justify-between mb-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm">{['🥇','🥈','🥉','4️⃣','5️⃣'][i]}</span>
                                            <span className="text-xs font-semibold" style={{ color:'rgba(255,255,255,0.7)' }}>{p.name}</span>
                                        </div>
                                        <span className="text-xs font-black text-white">{p.count} lô · {p.pct}%</span>
                                    </div>
                                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background:'rgba(255,255,255,0.06)' }}>
                                        <div className="h-full rounded-full"
                                             style={{ width:`${p.pct}%`, background:COLORS[i] }}/>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Summary footer */}
                    <div className="grid grid-cols-3 gap-2 mt-4 pt-4" style={{ borderTop:'1px solid rgba(255,255,255,0.05)' }}>
                        {[
                            { label:'Lô đã bán',     value:sold.length,     color:'#a78bfa', icon:<CheckCircle size={12}/> },
                            { label:'Đang vận chuyển',value:shipping.length, color:'#38bdf8', icon:<Truck size={12}/> },
                            { label:'Sẵn sàng',      value:available.length,color:'#22c55e', icon:<Sprout size={12}/> },
                        ].map((s,i)=>(
                            <div key={i} className="text-center p-2.5 rounded-xl"
                                 style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ color:s.color }} className="flex justify-center mb-1">{s.icon}</div>
                                <div className="text-base font-black" style={{ color:s.color, fontFamily:'Syne,sans-serif' }}>{s.value}</div>
                                <div className="text-[9px] mt-0.5" style={{ color:'rgba(255,255,255,0.3)' }}>{s.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}