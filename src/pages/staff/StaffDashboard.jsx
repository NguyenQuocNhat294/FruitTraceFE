// src/pages/staff/StaffDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    FlaskConical, Clock, CheckCircle, ClipboardList,
    AlertTriangle, ChevronRight, Shield, Zap,
    Package, TrendingUp, Eye
} from 'lucide-react';
import { batchService } from '../../services/batchService';
import { useAuth } from '../../hooks/useAuth';

// Animated counter
function AnimNum({ value }) {
    const [n, setN] = useState(0);
    useEffect(() => {
        const t = parseInt(String(value).replace(/\D/g,'')) || 0;
        let s = 0;
        const tm = setInterval(() => { s++; setN(Math.round(t*s/30)); if(s>=30){setN(t);clearInterval(tm);} }, 25);
        return () => clearInterval(tm);
    }, [value]);
    return <>{n}</>;
}

const ACCENT = '#818cf8';

export default function StaffDashboard() {
    const { user } = useAuth();
    const [batches, setBatches]   = useState([]);
    const [loading, setLoading]   = useState(true);
    const [tasks, setTasks]       = useState([
        { id:1, title:'Kiểm định lô BATCH-001', batch:'BATCH-001', time:'10:00', priority:'high',   done:false },
        { id:2, title:'Cập nhật nhật ký BATCH-002', batch:'BATCH-002', time:'13:00', priority:'medium', done:false },
        { id:3, title:'Xác nhận đóng gói BATCH-003', batch:'BATCH-003', time:'15:30', priority:'high',   done:true  },
        { id:4, title:'Kiểm tra xuất kho BATCH-004', batch:'BATCH-004', time:'17:00', priority:'low',    done:false },
    ]);

    const toggleTask = id => setTasks(p => p.map(t => t.id===id?{...t,done:!t.done}:t));

    useEffect(() => {
        batchService.getAll().then(r=>setBatches(r.data||[])).catch(()=>{}).finally(()=>setLoading(false));
    }, []);

    const pending    = batches.filter(b=>b.status==='available').length;
    const shipping   = batches.filter(b=>b.status==='shipping').length;
    const sold       = batches.filter(b=>b.status==='sold').length;
    const tasksDone  = tasks.filter(t=>t.done).length;
    const progress   = Math.round((tasksDone/tasks.length)*100);

    const now     = new Date();
    const timeStr = now.toLocaleTimeString('vi-VN',{hour:'2-digit',minute:'2-digit'});
    const dateStr = now.toLocaleDateString('vi-VN',{weekday:'long',day:'2-digit',month:'2-digit',year:'numeric'});

    // Expiry alerts
    const expiring = batches.filter(b => {
        if (!b.expirydate) return false;
        const d = Math.ceil((new Date(b.expirydate)-now)/86400000);
        return d >= 0 && d <= 7;
    });

    const stats = [
        { icon:<FlaskConical size={18}/>, label:'Cần kiểm định', value:pending,  color:'#818cf8' },
        { icon:<Clock size={18}/>,        label:'Vận chuyển',    value:shipping, color:'#38bdf8' },
        { icon:<CheckCircle size={18}/>,  label:'Đã bán',        value:sold,     color:'#22c55e' },
        { icon:<ClipboardList size={18}/>,label:'Nhiệm vụ',      value:`${tasksDone}/${tasks.length}`, color:'#fbbf24' },
    ];

    return (
        <div className="space-y-5">

            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                             style={{ background:'linear-gradient(135deg,#6366f1,#818cf8)', boxShadow:'0 4px 12px rgba(129,140,248,0.4)' }}>
                            <Shield size={14} className="text-white"/>
                        </div>
                        <span className="text-xs font-black uppercase tracking-widest" style={{ color:'rgba(129,140,248,0.6)' }}>Quality Control</span>
                    </div>
                    <h1 className="text-3xl font-black text-white" style={{ fontFamily:'Syne,sans-serif' }}>
                        Xin chào, <span style={{ background:'linear-gradient(135deg,#818cf8,#c084fc)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
                            {user?.username || 'Staff'}
                        </span> 👷
                    </h1>
                    <p className="text-sm mt-1" style={{ color:'rgba(255,255,255,0.35)' }}>Kiểm định chất lượng & quản lý nhật ký truy xuất</p>
                </div>
                <div className="text-right flex-shrink-0">
                    <div className="text-2xl font-black text-white" style={{ fontFamily:'Syne,sans-serif' }}>{timeStr}</div>
                    <div className="text-xs mt-0.5 capitalize" style={{ color:'rgba(255,255,255,0.3)' }}>{dateStr}</div>
                </div>
            </div>

            {/* Expiry alert */}
            {expiring.length > 0 && (
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm"
                     style={{ background:'rgba(251,191,36,0.08)', border:'1px solid rgba(251,191,36,0.2)', color:'#fde68a' }}>
                    <AlertTriangle size={15} className="flex-shrink-0"/>
                    {expiring.length} lô sắp hết hạn: {expiring.map(b=>b.batchcode).join(', ')}
                </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {stats.map((s,i) => (
                    <div key={i} className="rounded-2xl p-5 relative overflow-hidden group hover:bg-white/[0.03] transition-all cursor-default"
                         style={{ background:'rgba(4,5,16,0.7)', border:'1px solid rgba(255,255,255,0.07)' }}>
                        <div className="absolute top-0 left-0 right-0 h-px"
                             style={{ background:`linear-gradient(90deg,transparent,${s.color}50,transparent)` }}/>
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                             style={{ background:`radial-gradient(circle at 50% 100%,${s.color}08,transparent 70%)` }}/>
                        <div className="relative">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                                 style={{ background:`${s.color}15`, border:`1px solid ${s.color}25`, color:s.color }}>
                                {s.icon}
                            </div>
                            <div className="text-3xl font-black text-white" style={{ fontFamily:'Syne,sans-serif' }}>
                                {loading ? '—' : typeof s.value === 'string' ? s.value : <AnimNum value={s.value}/>}
                            </div>
                            <div className="text-xs mt-0.5" style={{ color:'rgba(255,255,255,0.35)' }}>{s.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Progress banner */}
            <div className="rounded-2xl p-5 relative overflow-hidden"
                 style={{ background:'linear-gradient(135deg,rgba(99,102,241,0.15),rgba(192,132,252,0.08))', border:'1px solid rgba(129,140,248,0.2)' }}>
                <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-15 pointer-events-none"
                     style={{ background:'radial-gradient(circle,#818cf8,transparent)' }}/>
                <div className="flex items-center justify-between mb-3">
                    <div>
                        <p className="font-black text-white text-sm">Tiến độ nhiệm vụ hôm nay</p>
                        <p className="text-xs mt-0.5" style={{ color:'rgba(255,255,255,0.35)' }}>
                            {tasksDone} hoàn thành · {tasks.length - tasksDone} còn lại
                        </p>
                    </div>
                    <div className="text-3xl font-black" style={{ fontFamily:'Syne,sans-serif', color:ACCENT }}>{progress}%</div>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background:'rgba(255,255,255,0.06)' }}>
                    <div className="h-full rounded-full transition-all duration-1000"
                         style={{ width:`${progress}%`, background:'linear-gradient(90deg,#6366f1,#818cf8,#c084fc)', boxShadow:'0 0 12px rgba(129,140,248,0.5)' }}/>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-3">
                    {tasks.map(t=>(
                        <span key={t.id} className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                              style={ t.done
                                  ? { background:'rgba(34,197,94,0.12)', color:'#4ade80', border:'1px solid rgba(34,197,94,0.2)' }
                                  : { background:'rgba(255,255,255,0.04)', color:'rgba(255,255,255,0.3)', border:'1px solid rgba(255,255,255,0.07)' }
                              }>
                            {t.done?'✓':''} {t.title.split(' ').slice(0,3).join(' ')}
                        </span>
                    ))}
                </div>
            </div>

            {/* Main grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

                {/* Task list */}
                <div className="lg:col-span-2 rounded-2xl overflow-hidden"
                     style={{ background:'rgba(4,5,16,0.7)', border:'1px solid rgba(255,255,255,0.07)' }}>
                    <div className="px-5 py-4 flex items-center justify-between"
                         style={{ borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
                        <h3 className="font-black text-white text-sm" style={{ fontFamily:'Syne,sans-serif' }}>✅ Nhiệm vụ hôm nay</h3>
                        <Link to="/staff/tasks" className="flex items-center gap-1 text-xs font-bold"
                              style={{ color:ACCENT }}>
                            Tất cả <ChevronRight size={12}/>
                        </Link>
                    </div>
                    <div className="divide-y" style={{ borderColor:'rgba(255,255,255,0.04)' }}>
                        {tasks.map(task=>(
                            <div key={task.id}
                                 className={`flex items-center gap-4 px-5 py-4 transition-colors hover:bg-white/[0.02] ${task.done?'opacity-50':''}`}>
                                <button onClick={()=>toggleTask(task.id)}
                                        className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all"
                                        style={ task.done
                                            ? { background:'linear-gradient(135deg,#6366f1,#818cf8)', borderColor:'transparent', boxShadow:'0 0 8px rgba(129,140,248,0.4)' }
                                            : { borderColor:'rgba(255,255,255,0.2)' }
                                        }>
                                    {task.done && <CheckCircle size={11} className="text-white"/>}
                                </button>
                                <div className="flex-1 min-w-0">
                                    <p className={`text-sm font-semibold truncate ${task.done?'line-through text-slate-600':'text-white'}`}>
                                        {task.title}
                                    </p>
                                    <p className="text-[10px] mt-0.5" style={{ color:'rgba(255,255,255,0.3)' }}>
                                        🕐 {task.time} · 📦 {task.batch}
                                    </p>
                                </div>
                                <span className="text-[10px] px-2.5 py-1 rounded-full font-bold flex-shrink-0"
                                      style={{
                                          background: task.priority==='high'?'rgba(239,68,68,0.1)':task.priority==='medium'?'rgba(251,191,36,0.1)':'rgba(148,163,184,0.08)',
                                          color:      task.priority==='high'?'#f87171':task.priority==='medium'?'#fbbf24':'#94a3b8',
                                          border:     `1px solid ${task.priority==='high'?'rgba(239,68,68,0.2)':task.priority==='medium'?'rgba(251,191,36,0.15)':'rgba(148,163,184,0.1)'}`
                                      }}>
                                    {task.priority==='high'?'🔥 Cao':task.priority==='medium'?'⚠ TB':'✓ Thấp'}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right col */}
                <div className="space-y-4">
                    {/* Quick actions */}
                    <div className="rounded-2xl p-4 relative overflow-hidden"
                         style={{ background:'linear-gradient(135deg,rgba(99,102,241,0.18),rgba(192,132,252,0.08))', border:'1px solid rgba(129,140,248,0.2)' }}>
                        <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full opacity-15"
                             style={{ background:'radial-gradient(circle,#818cf8,transparent)' }}/>
                        <h3 className="font-black text-white text-sm mb-3 relative" style={{ fontFamily:'Syne,sans-serif' }}>
                            <Zap size={14} className="inline mr-1.5" style={{ color:ACCENT }}/> Thao tác nhanh
                        </h3>
                        <div className="space-y-1.5 relative">
                            {[
                                { to:'/staff/batches',      emoji:'🔬', label:'Kiểm định lô hàng',  color:'#818cf8' },
                                { to:'/staff/trace',        emoji:'📋', label:'Nhật ký truy xuất',   color:'#38bdf8' },
                                { to:'/staff/tasks',        emoji:'✅', label:'Quản lý nhiệm vụ',    color:'#22c55e' },
                                { to:'/staff/time-tracking',emoji:'🕐', label:'Chấm công',           color:'#fbbf24' },
                                { to:'/staff/report',       emoji:'📊', label:'Báo cáo',             color:'#f97316' },
                                { to:'/staff/photo-upload', emoji:'📷', label:'Upload ảnh',          color:'#a78bfa' },
                            ].map((item,i)=>(
                                <Link key={i} to={item.to}
                                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:bg-white/10"
                                      style={{ background:'rgba(0,0,0,0.25)' }}>
                                    <span>{item.emoji}</span>
                                    <span>{item.label}</span>
                                    <ChevronRight size={12} className="ml-auto" style={{ color:item.color }}/>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Pending batches */}
                    <div className="rounded-2xl overflow-hidden"
                         style={{ background:'rgba(4,5,16,0.7)', border:'1px solid rgba(255,255,255,0.07)' }}>
                        <div className="px-4 py-3.5 flex items-center gap-2"
                             style={{ borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
                            <AlertTriangle size={14} style={{ color:'#fbbf24' }}/>
                            <h3 className="font-black text-white text-sm" style={{ fontFamily:'Syne,sans-serif' }}>Cần kiểm định</h3>
                            <span className="ml-auto text-xs font-black px-2 py-0.5 rounded-full"
                                  style={{ background:'rgba(129,140,248,0.12)', color:ACCENT, border:'1px solid rgba(129,140,248,0.2)' }}>
                                {loading?'...':pending}
                            </span>
                        </div>
                        <div className="p-3 space-y-2">
                            {loading ? [...Array(3)].map((_,i)=>(
                                <div key={i} className="h-10 rounded-xl animate-pulse" style={{ background:'rgba(255,255,255,0.04)' }}/>
                            )) : batches.filter(b=>b.status==='available').slice(0,4).map(batch=>(
                                <div key={batch._id} className="flex items-center justify-between p-2.5 rounded-xl group"
                                     style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)' }}>
                                    <div>
                                        <p className="text-xs font-bold text-white">{batch.batchcode}</p>
                                        <p className="text-[10px]" style={{ color:'rgba(255,255,255,0.35)' }}>{batch.quantitykg}kg · {batch.farmid}</p>
                                    </div>
                                    <Link to="/staff/batches"
                                          className="text-[10px] px-2.5 py-1 rounded-lg font-bold transition-all"
                                          style={{ background:'rgba(129,140,248,0.12)', color:ACCENT, border:'1px solid rgba(129,140,248,0.2)' }}>
                                        KĐ ngay
                                    </Link>
                                </div>
                            ))}
                            {!loading && pending === 0 && (
                                <p className="text-xs text-center py-4" style={{ color:'rgba(255,255,255,0.25)' }}>
                                    ✓ Không có lô nào cần kiểm định
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}