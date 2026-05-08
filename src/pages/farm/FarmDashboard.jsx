// src/pages/farm/FarmDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Package, TrendingUp, DollarSign, QrCode, Plus, Eye,
    Leaf, ChevronRight, Droplets, Wind, Thermometer,
    AlertTriangle, CheckCircle, Clock, MapPin, Award, Activity
} from 'lucide-react';
import { batchService } from '../../services/batchService';
import { farmService } from '../../services/farmService';
import { useAuth } from '../../hooks/useAuth';

// ── Design tokens ──
const C = {
    // Backgrounds
    page:       'linear-gradient(160deg, #0a1628 0%, #0d2137 50%, #0a1a10 100%)',
    card:       'rgba(255,255,255,0.04)',
    cardHover:  'rgba(255,255,255,0.07)',
    cardBorder: 'rgba(255,255,255,0.09)',

    // Brand greens
    primary:    '#22c55e',
    primaryDim: 'rgba(34,197,94,0.15)',
    primaryBorder:'rgba(34,197,94,0.3)',

    // Accents
    sky:        '#38bdf8',
    skyDim:     'rgba(56,189,248,0.12)',
    violet:     '#a78bfa',
    amber:      '#fbbf24',
    red:        '#f87171',

    // Text
    textHigh:   '#f0fdf4',
    textMid:    '#86efac',
    textLow:    '#4ade80',
    textMuted:  'rgba(255,255,255,0.35)',
    textFaint:  'rgba(255,255,255,0.18)',
};

const STATUS = {
    available: { label:'Có sẵn',     color:'#22c55e', bg:'rgba(34,197,94,0.12)',  border:'rgba(34,197,94,0.3)'  },
    harvested: { label:'Thu hoạch',  color:'#fbbf24', bg:'rgba(251,191,36,0.12)', border:'rgba(251,191,36,0.3)' },
    shipping:  { label:'Vận chuyển', color:'#38bdf8', bg:'rgba(56,189,248,0.12)', border:'rgba(56,189,248,0.3)'  },
    sold:      { label:'Đã bán',     color:'#a78bfa', bg:'rgba(167,139,250,0.12)',border:'rgba(167,139,250,0.3)' },
};

function AnimNum({ value }) {
    const [n, setN] = useState(0);
    useEffect(() => {
        const t = parseInt(String(value).replace(/\D/g,'')) || 0;
        let s = 0;
        const tm = setInterval(() => {
            s++; setN(Math.round(t*s/30));
            if (s>=30) { setN(t); clearInterval(tm); }
        }, 25);
        return () => clearInterval(tm);
    }, [value]);
    return <>{n.toLocaleString()}</>;
}

const Card = ({ children, className='', style={} }) => (
    <div className={`rounded-2xl ${className}`}
         style={{ background: C.card, border: `1px solid ${C.cardBorder}`, backdropFilter:'blur(12px)', ...style }}>
        {children}
    </div>
);

export default function FarmDashboard() {
    const { user } = useAuth();
    const [farm, setFarm]           = useState(null);
    const [allFarms, setAllFarms]   = useState([]);
    const [batches, setBatches]     = useState([]);
    const [alerts, setAlerts]       = useState([]);
    const [loadingFarm, setLF]      = useState(true);
    const [loadingBatch, setLB]     = useState(true);
    const [weather]                 = useState({ temp:32, condition:'Nắng đẹp', humidity:75, wind:12, uv:7, icon:'☀️' });
    const [tasks, setTasks]         = useState([
        { id:1, title:'Bón phân lô BATCH002', time:'09:00', priority:'high',   done:false },
        { id:2, title:'Thu hoạch lô BATCH001', time:'14:00', priority:'high',  done:false },
        { id:3, title:'Kiểm tra chất lượng',  time:'16:00', priority:'medium', done:true  },
    ]);
    const toggleTask = id => setTasks(p => p.map(t => t.id===id ? {...t,done:!t.done} : t));

    useEffect(() => {
        if (!user) return;
        const uid = user.id;
        setLF(true); setLB(true);

        farmService.getAll().then(async fr => {
            const myFarms = (fr.data||[]).filter(f => f.OwnerId === uid);
            setAllFarms(myFarms);
            setFarm(myFarms[0]||null);
            setLF(false);
            if (!myFarms.length) { setLB(false); return; }

            const results = await Promise.all(
                myFarms.map(f => batchService.getAll({ farmid: f.id }).catch(()=>({ data:[] })))
            );
            const seen = new Set(), all = [];
            results.forEach(r => (r.data||[]).forEach(b => { if(!seen.has(b._id)){ seen.add(b._id); all.push(b); }}));
            setBatches(all);

            const now = new Date();
            setAlerts(all.filter(b=>b.expirydate).map(b=>({
                b, days: Math.ceil((new Date(b.expirydate)-now)/86400000)
            })).filter(({days})=>days<=7&&days>=0).sort((a,b)=>a.days-b.days).slice(0,3).map(({b,days})=>({
                type: days<=3?'danger':'warning',
                msg: `Lô ${b.batchcode} hết hạn ${days===0?'hôm nay':`trong ${days} ngày`}`
            })));
        }).catch(()=>setLF(false)).finally(()=>setLB(false));
    }, [user?.id]);

    const recent    = batches.slice(0,4);
    const totalKg   = batches.reduce((a,b)=>a+(b.quantitykg||0),0);
    const tasksDone = tasks.filter(t=>t.done).length;

    const stats = [
        { icon:<Package size={20}/>,    label:'Lô hàng',    value:batches.length,                                       sub:`${allFarms.length} farm`, color:C.primary  },
        { icon:<TrendingUp size={20}/>, label:'Sản lượng',  value:`${(totalKg/1000).toFixed(1)}T`,                      sub:'+15%',     color:C.sky     },
        { icon:<Activity size={20}/>,   label:'Vận chuyển', value:batches.filter(b=>b.status==='shipping').length,       sub:'đang đi',  color:C.violet  },
        { icon:<DollarSign size={20}/>, label:'Đã bán',     value:batches.filter(b=>b.status==='sold').length,           sub:'lô',       color:C.amber   },
    ];

    return (
        <div className="space-y-6 min-h-screen">

            {/* ── HEADER ── */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center shadow-lg"
                             style={{ background:'linear-gradient(135deg,#16a34a,#22c55e)', boxShadow:'0 4px 16px rgba(34,197,94,0.4)' }}>
                            <Leaf size={16} className="text-white"/>
                        </div>
                        <span className="text-xs font-black uppercase tracking-[0.2em]" style={{ color:C.textLow }}>Farm Control</span>
                    </div>

                    {loadingFarm
                        ? <div className="h-9 w-72 rounded-xl animate-pulse" style={{ background:'rgba(255,255,255,0.06)' }}/>
                        : <h1 className="text-3xl font-black leading-tight" style={{ color:C.textHigh, fontFamily:'Syne,sans-serif', textShadow:'0 0 40px rgba(34,197,94,0.3)' }}>
                            🌾 {farm?.FarmName || `${user?.username}'s Farm`}
                        </h1>
                    }

                    <div className="flex flex-wrap items-center gap-3 mt-2 text-xs" style={{ color:C.textMuted }}>
                        {farm?.province && (
                            <span className="flex items-center gap-1">
                                <MapPin size={11}/>{farm.district ? `${farm.district}, ` : ''}{farm.province}
                            </span>
                        )}
                        {farm?.AreaHectare && <span>📐 {farm.AreaHectare} ha</span>}
                        {allFarms.length > 1 && <span>+{allFarms.length-1} farm khác</span>}
                        {farm?.certification && (
                            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold"
                                  style={{ background:C.primaryDim, color:C.primary, border:`1px solid ${C.primaryBorder}` }}>
                                <Award size={10}/> {farm.certification}
                            </span>
                        )}
                    </div>
                </div>

                <div className="flex gap-2.5 flex-shrink-0">
                    <Link to="/farm/mybatches"
                          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all hover:bg-white/10"
                          style={{ background:'rgba(255,255,255,0.06)', border:`1px solid ${C.cardBorder}`, color:C.textHigh }}>
                        <Package size={15}/> Xem lô hàng
                    </Link>
                    <Link to="/farm/mybatches/create"
                          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:brightness-110"
                          style={{ background:'linear-gradient(135deg,#16a34a,#22c55e)', boxShadow:'0 4px 20px rgba(34,197,94,0.4)' }}>
                        <Plus size={16}/> Tạo lô hàng
                    </Link>
                </div>
            </div>

            {/* ── ALERTS ── */}
            {alerts.length > 0 && (
                <div className="space-y-2">
                    {alerts.map((a,i) => (
                        <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium"
                             style={{
                                 background: a.type==='danger' ? 'rgba(239,68,68,0.1)' : 'rgba(251,191,36,0.1)',
                                 border: `1px solid ${a.type==='danger' ? 'rgba(239,68,68,0.3)' : 'rgba(251,191,36,0.3)'}`,
                                 color: a.type==='danger' ? '#fca5a5' : '#fde68a'
                             }}>
                            <AlertTriangle size={15} className="flex-shrink-0"/>{a.msg}
                        </div>
                    ))}
                </div>
            )}

            {/* ── WEATHER + STATS ── */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {/* Weather */}
                <div className="md:col-span-2 rounded-2xl p-5 relative overflow-hidden"
                     style={{ background:'linear-gradient(135deg,rgba(34,197,94,0.18),rgba(56,189,248,0.1))', border:`1px solid rgba(34,197,94,0.2)` }}>
                    <div className="absolute -top-8 -right-8 w-36 h-36 rounded-full opacity-20"
                         style={{ background:'radial-gradient(circle,#22c55e,transparent)' }}/>
                    <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color:C.textLow }}>Thời tiết hôm nay</p>
                    <div className="flex items-center gap-4 mb-5">
                        <span className="text-5xl drop-shadow-lg">{weather.icon}</span>
                        <div>
                            <div className="text-5xl font-black" style={{ color:C.textHigh, fontFamily:'Syne,sans-serif' }}>{weather.temp}°</div>
                            <div className="text-sm font-medium mt-0.5" style={{ color:C.textMid }}>{weather.condition}</div>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        {[
                            { icon:<Droplets size={13}/>, label:'Độ ẩm', val:`${weather.humidity}%` },
                            { icon:<Wind size={13}/>,     label:'Gió',   val:`${weather.wind}km/h`  },
                            { icon:<Thermometer size={13}/>, label:'UV', val:`${weather.uv}/10`     },
                        ].map((w,i)=>(
                            <div key={i} className="rounded-xl p-2.5 text-center" style={{ background:'rgba(0,0,0,0.25)' }}>
                                <div className="flex justify-center mb-1" style={{ color:C.textLow }}>{w.icon}</div>
                                <div className="text-sm font-black" style={{ color:C.textHigh }}>{w.val}</div>
                                <div className="text-[10px] mt-0.5" style={{ color:C.textMuted }}>{w.label}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Stats */}
                <div className="md:col-span-3 grid grid-cols-2 gap-3">
                    {stats.map((s,i)=>(
                        <div key={i} className="rounded-2xl p-5 relative overflow-hidden group cursor-default transition-all hover:scale-[1.02]"
                             style={{ background:C.card, border:`1px solid ${C.cardBorder}` }}>
                            {/* Glow bg on hover */}
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"
                                 style={{ background:`radial-gradient(circle at 20% 80%,${s.color}18,transparent 60%)` }}/>
                            {/* Top accent line */}
                            <div className="absolute top-0 left-4 right-4 h-[1px]"
                                 style={{ background:`linear-gradient(90deg,transparent,${s.color}60,transparent)` }}/>
                            <div className="relative">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                                         style={{ background:`${s.color}18`, border:`1px solid ${s.color}30`, color:s.color }}>
                                        {s.icon}
                                    </div>
                                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                                          style={{ background:`${s.color}15`, color:s.color }}>{s.sub}</span>
                                </div>
                                <div className="text-3xl font-black" style={{ color:C.textHigh, fontFamily:'Syne,sans-serif' }}>
                                    {loadingBatch ? <span style={{ color:C.textFaint }}>—</span> : <AnimNum value={s.value}/>}
                                </div>
                                <div className="text-xs font-semibold mt-1" style={{ color:C.textMuted }}>{s.label}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── MAIN GRID ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

                {/* Batch list */}
                <Card className="lg:col-span-2 overflow-hidden">
                    {/* Header */}
                    <div className="px-6 py-4 flex items-center justify-between"
                         style={{ borderBottom:`1px solid ${C.cardBorder}` }}>
                        <div>
                            <h3 className="font-black text-base" style={{ color:C.textHigh, fontFamily:'Syne,sans-serif' }}>📦 Lô hàng gần đây</h3>
                            {allFarms.length > 1 && (
                                <p className="text-[11px] mt-0.5" style={{ color:C.textFaint }}>
                                    {allFarms.length} farm: {allFarms.map(f=>f.id).join(', ')}
                                </p>
                            )}
                        </div>
                        <Link to="/farm/mybatches" className="flex items-center gap-1 text-xs font-bold transition-colors hover:opacity-80"
                              style={{ color:C.primary }}>
                            Tất cả <ChevronRight size={13}/>
                        </Link>
                    </div>

                    {/* Status pills */}
                    <div className="px-6 py-3 flex gap-2 flex-wrap" style={{ borderBottom:`1px solid rgba(255,255,255,0.05)` }}>
                        {[
                            { label:`Tất cả: ${batches.length}`, color:'#94a3b8' },
                            { label:`Có sẵn: ${batches.filter(b=>b.status==='available').length}`, color:STATUS.available.color },
                            { label:`Thu hoạch: ${batches.filter(b=>b.status==='harvested').length}`, color:STATUS.harvested.color },
                            { label:`Vận chuyển: ${batches.filter(b=>b.status==='shipping').length}`, color:STATUS.shipping.color },
                            { label:`Đã bán: ${batches.filter(b=>b.status==='sold').length}`, color:STATUS.sold.color },
                        ].map((p,i)=>(
                            <span key={i} className="text-[10px] font-bold px-2.5 py-1 rounded-full"
                                  style={{ background:`${p.color}12`, color:p.color, border:`1px solid ${p.color}25` }}>
                                {p.label}
                            </span>
                        ))}
                    </div>

                    {/* Rows */}
                    {loadingBatch ? (
                        [...Array(3)].map((_,i)=>(
                            <div key={i} className="flex items-center gap-4 px-6 py-4" style={{ borderBottom:`1px solid rgba(255,255,255,0.04)` }}>
                                <div className="w-10 h-10 rounded-xl flex-shrink-0 animate-pulse" style={{ background:'rgba(255,255,255,0.06)' }}/>
                                <div className="flex-1 space-y-2">
                                    <div className="h-3.5 rounded-lg animate-pulse" style={{ background:'rgba(255,255,255,0.06)', width:'45%' }}/>
                                    <div className="h-2.5 rounded animate-pulse" style={{ background:'rgba(255,255,255,0.04)', width:'30%' }}/>
                                </div>
                            </div>
                        ))
                    ) : recent.length === 0 ? (
                        <div className="px-6 py-12 text-center">
                            <div className="text-4xl mb-3">📦</div>
                            <p className="text-sm font-semibold" style={{ color:C.textMuted }}>Chưa có lô hàng nào</p>
                            <Link to="/farm/qr" className="text-xs mt-2 inline-block font-bold" style={{ color:C.primary }}>+ Tạo lô đầu tiên</Link>
                        </div>
                    ) : recent.map(batch => {
                        const s = STATUS[batch.status] || STATUS.available;
                        const daysLeft = batch.expirydate
                            ? Math.ceil((new Date(batch.expirydate)-new Date())/86400000) : null;
                        return (
                            <div key={batch._id} className="flex items-center gap-4 px-6 py-4 group transition-colors hover:bg-white/[0.03]"
                                 style={{ borderBottom:`1px solid rgba(255,255,255,0.04)` }}>
                                {/* Avatar */}
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm text-white flex-shrink-0"
                                     style={{ background:`linear-gradient(135deg,${s.color}cc,${s.color}66)`, boxShadow:`0 4px 12px ${s.color}30` }}>
                                    {(batch.productid||'B').charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <span className="font-bold text-sm" style={{ color:C.textHigh }}>{batch.batchcode}</span>
                                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                                              style={{ background:s.bg, color:s.color, border:`1px solid ${s.border}` }}>
                                            {s.label}
                                        </span>
                                        {daysLeft!==null && daysLeft<=7 && (
                                            <span className="text-[9px] font-bold flex-shrink-0"
                                                  style={{ color: daysLeft<=3 ? C.red : C.amber }}>
                                                ⚠ {daysLeft}d
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 text-[11px]" style={{ color:C.textMuted }}>
                                        <span>{batch.productid}</span>
                                        <span>·</span>
                                        <span>{batch.quantitykg}kg</span>
                                        <span>·</span>
                                        <span style={{ color:C.textFaint }}>{batch.farmid}</span>
                                    </div>
                                </div>
                                <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all">
                                    <Link to={`/trace?code=${batch.batchcode}`}
                                          className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-sky-500/20"
                                          style={{ background:C.skyDim, color:C.sky }}>
                                        <Eye size={13}/>
                                    </Link>
                                    <Link to="/farm/mybatches/create"
                                          className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                                          style={{ background:'rgba(167,139,250,0.12)', color:C.violet }}>
                                        <QrCode size={13}/>
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
                </Card>

                {/* Right col */}
                <div className="space-y-4">

                    {/* Tasks */}
                    <Card className="overflow-hidden">
                        <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom:`1px solid ${C.cardBorder}` }}>
                            <h3 className="font-black text-sm" style={{ color:C.textHigh, fontFamily:'Syne,sans-serif' }}>✅ Công việc hôm nay</h3>
                            <span className="text-xs font-black px-2.5 py-1 rounded-full"
                                  style={{ background:C.primaryDim, color:C.primary, border:`1px solid ${C.primaryBorder}` }}>
                                {tasksDone}/{tasks.length}
                            </span>
                        </div>
                        {/* Progress bar */}
                        <div className="px-5 py-2.5" style={{ borderBottom:`1px solid rgba(255,255,255,0.05)` }}>
                            <div className="h-1.5 rounded-full overflow-hidden" style={{ background:'rgba(255,255,255,0.06)' }}>
                                <div className="h-full rounded-full transition-all duration-700"
                                     style={{ width:`${(tasksDone/tasks.length)*100}%`, background:`linear-gradient(90deg,#16a34a,#22c55e,#4ade80)`, boxShadow:'0 0 8px rgba(34,197,94,0.5)' }}/>
                            </div>
                        </div>
                        <div className="p-4 space-y-2">
                            {tasks.map(task=>(
                                <button key={task.id} onClick={()=>toggleTask(task.id)}
                                        className="w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all hover:bg-white/[0.04]"
                                        style={{ border:`1px solid rgba(255,255,255,0.06)`, opacity:task.done?0.55:1 }}>
                                    <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all"
                                         style={ task.done
                                             ? { background:'linear-gradient(135deg,#16a34a,#22c55e)', borderColor:'transparent', boxShadow:'0 0 8px rgba(34,197,94,0.4)' }
                                             : { borderColor:'rgba(255,255,255,0.2)' }
                                         }>
                                        {task.done && <CheckCircle size={11} className="text-white"/>}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-semibold truncate" style={{ color:task.done?C.textFaint:C.textHigh, textDecoration:task.done?'line-through':'none' }}>
                                            {task.title}
                                        </p>
                                        <p className="text-[10px] flex items-center gap-1 mt-0.5" style={{ color:C.textMuted }}>
                                            <Clock size={9}/>{task.time}
                                        </p>
                                    </div>
                                    <div className="w-2 h-2 rounded-full flex-shrink-0"
                                         style={{ background:task.priority==='high'?C.red:C.amber, boxShadow:`0 0 6px ${task.priority==='high'?C.red:C.amber}` }}/>
                                </button>
                            ))}
                        </div>
                        <div className="px-4 pb-4">
                            <Link to="/farm/calendar"
                                  className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl text-xs font-bold transition-all hover:bg-white/5"
                                  style={{ border:`1px solid rgba(255,255,255,0.08)`, color:C.textMuted }}>
                                Xem lịch công việc <ChevronRight size={11}/>
                            </Link>
                        </div>
                    </Card>

                    {/* Quick actions */}
                    <div className="rounded-2xl p-5 relative overflow-hidden"
                         style={{ background:'linear-gradient(135deg,rgba(22,163,74,0.2),rgba(34,197,94,0.08))', border:`1px solid rgba(34,197,94,0.2)` }}>
                        <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-20"
                             style={{ background:'radial-gradient(circle,#22c55e,transparent)' }}/>
                        <h3 className="font-black text-sm mb-3 relative" style={{ color:C.textHigh, fontFamily:'Syne,sans-serif' }}>⚡ Thao tác nhanh</h3>
                        <div className="space-y-1.5 relative">
                            {[
                                { to:'/farm/mybatches',        emoji:'📦', label:'Lô hàng của tôi' },
                                { to:'/farm/qr',               emoji:'📱', label:'Tạo QR Code'      },
                                { to:'/farm/gallery',          emoji:'🖼️', label:'Thư viện ảnh'     },
                                { to:'/farm/calendar',         emoji:'📅', label:'Lịch công việc'   },
                                { to:'/farm/revenue',          emoji:'💰', label:'Doanh thu'        },
                                { to:'/farm/staff-management', emoji:'👷', label:'Nhân viên'        },
                            ].map((item,i)=>(
                                <Link key={i} to={item.to}
                                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-sm transition-all hover:bg-white/10 hover:translate-x-0.5"
                                      style={{ background:'rgba(0,0,0,0.25)', color:C.textHigh }}>
                                    <span>{item.emoji}</span>
                                    <span>{item.label}</span>
                                    <ChevronRight size={13} className="ml-auto" style={{ color:C.textFaint }}/>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Health */}
                    <Card className="p-5">
                        <h3 className="font-black text-sm mb-4" style={{ color:C.textHigh, fontFamily:'Syne,sans-serif' }}>🌡️ Sức khỏe vườn</h3>
                        <div className="space-y-4">
                            {[
                                { label:'Độ tin cậy', value:98, color:C.primary },
                                { label:'Hiệu suất',  value:85, color:C.sky     },
                                { label:'Chất lượng', value:92, color:C.violet  },
                            ].map((m,i)=>(
                                <div key={i}>
                                    <div className="flex justify-between text-xs mb-1.5">
                                        <span className="font-medium" style={{ color:C.textMuted }}>{m.label}</span>
                                        <span className="font-black" style={{ color:m.color }}>{m.value}%</span>
                                    </div>
                                    <div className="h-2 rounded-full overflow-hidden" style={{ background:'rgba(255,255,255,0.06)' }}>
                                        <div className="h-full rounded-full"
                                             style={{ width:`${m.value}%`, background:`linear-gradient(90deg,${m.color}99,${m.color})`, boxShadow:`0 0 8px ${m.color}50`, transition:'width 1.2s ease' }}/>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {farm?.certification && (
                            <div className="mt-4 pt-3 flex items-center gap-2" style={{ borderTop:`1px solid rgba(255,255,255,0.06)` }}>
                                <Award size={13} style={{ color:C.primary }}/>
                                <span className="text-xs font-semibold" style={{ color:C.textMid }}>{farm.certification}</span>
                                <span className="text-xs ml-auto" style={{ color:C.textFaint }}>Đã chứng nhận</span>
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </div>
    );
}