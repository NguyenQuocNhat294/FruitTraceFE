// src/pages/staff/TimeTracking.jsx
import React, { useState, useEffect, useRef } from 'react';
import {
    Clock, Play, Square, Coffee, CheckCircle,
    Calendar, TrendingUp, AlertTriangle, ChevronDown,
    Download, BarChart2
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

// ── Helpers ──
const fmt    = s => `${String(Math.floor(s/3600)).padStart(2,'0')}:${String(Math.floor(s%3600/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;
const fmtHm  = s => `${Math.floor(s/3600)}h ${Math.floor(s%3600/60)}m`;
const today  = () => new Date().toLocaleDateString('vi-VN',{weekday:'long',day:'2-digit',month:'2-digit',year:'numeric'});
const todayKey = () => new Date().toISOString().slice(0,10);

const DAYS   = ['CN','T2','T3','T4','T5','T6','T7'];
const MONTHS = ['T1','T2','T3','T4','T5','T6','T7','T8','T9','T10','T11','T12'];

// Demo history data
const DEMO_HISTORY = [
    { date:'2026-04-08', checkIn:'07:28', checkOut:'16:45', breaks:30, note:'Kiểm định 3 lô hàng' },
    { date:'2026-04-07', checkIn:'07:35', checkOut:'17:00', breaks:45, note:'Cập nhật trace log' },
    { date:'2026-04-06', checkIn:'08:00', checkOut:'16:30', breaks:30, note:'Chụp ảnh thu hoạch' },
    { date:'2026-04-05', checkIn:'07:30', checkOut:'17:30', breaks:60, note:'Kiểm định 5 lô, OT' },
    { date:'2026-04-04', checkIn:'07:45', checkOut:'16:00', breaks:30, note:'Báo cáo tuần' },
    { date:'2026-04-03', checkIn:'07:30', checkOut:'16:45', breaks:30, note:'Xuất kho BATCH-012' },
    { date:'2026-04-02', checkIn:'07:20', checkOut:'17:00', breaks:45, note:'Kiểm định lô mới' },
];

const calcHours = (checkIn, checkOut, breaks=30) => {
    if (!checkIn || !checkOut) return 0;
    const [ih,im] = checkIn.split(':').map(Number);
    const [oh,om] = checkOut.split(':').map(Number);
    const total = (oh*60+om) - (ih*60+im) - breaks;
    return Math.max(total/60, 0);
};

// ── Ring progress ──
const Ring = ({ pct, size=120, stroke=10, color='#22c55e', children }) => {
    const r    = (size-stroke*2)/2;
    const circ = 2*Math.PI*r;
    return (
        <div className="relative flex items-center justify-center" style={{ width:size, height:size }}>
            <svg width={size} height={size} className="-rotate-90">
                <circle cx={size/2} cy={size/2} r={r} fill="none"
                        stroke="rgba(255,255,255,0.06)" strokeWidth={stroke}/>
                <circle cx={size/2} cy={size/2} r={r} fill="none"
                        stroke={color} strokeWidth={stroke}
                        strokeDasharray={`${(pct/100)*circ} ${circ}`}
                        strokeLinecap="round"
                        style={{ filter:`drop-shadow(0 0 6px ${color}80)`, transition:'stroke-dasharray 1s ease' }}/>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                {children}
            </div>
        </div>
    );
};

// ── Bar chart weekly ──
const WeekBar = ({ data }) => {
    const max = Math.max(...data.map(d=>d.h), 8);
    return (
        <div className="flex items-end gap-2 h-20">
            {data.map((d,i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                    <div className="relative w-full flex flex-col items-center justify-end" style={{ height:72 }}>
                        <div className="absolute -top-5 opacity-0 group-hover:opacity-100 transition-opacity
                            text-[9px] font-bold text-white px-1.5 py-0.5 rounded whitespace-nowrap"
                             style={{ background:'rgba(0,0,0,0.8)' }}>
                            {d.h.toFixed(1)}h
                        </div>
                        <div className="w-full rounded-t-lg transition-all duration-700"
                             style={{
                                 height:`${Math.max((d.h/max)*72,2)}px`,
                                 background: d.today
                                     ? 'linear-gradient(180deg,#22c55e,#16a34a)'
                                     : d.h >= 8 ? 'rgba(56,189,248,0.5)' : d.h > 0 ? 'rgba(34,197,94,0.35)' : 'rgba(255,255,255,0.05)',
                                 boxShadow: d.today ? '0 0 12px rgba(34,197,94,0.5)' : 'none'
                             }}/>
                    </div>
                    <span className="text-[9px] font-bold" style={{ color: d.today?'#4ade80':'rgba(255,255,255,0.25)' }}>{d.label}</span>
                </div>
            ))}
        </div>
    );
};

export default function TimeTracking() {
    const { user }                      = useAuth();
    const [isCheckedIn, setCheckedIn]   = useState(false);
    const [onBreak, setOnBreak]         = useState(false);
    const [seconds, setSeconds]         = useState(0);
    const [breakSecs, setBreakSecs]     = useState(0);
    const [checkInTime, setCheckInTime] = useState(null);
    const [history, setHistory]         = useState(DEMO_HISTORY);
    const [note, setNote]               = useState('');
    const [showNote, setShowNote]       = useState(false);
    const timerRef                      = useRef();
    const breakRef                      = useRef();

    // Work timer
    useEffect(() => {
        if (isCheckedIn && !onBreak) {
            timerRef.current = setInterval(() => setSeconds(s=>s+1), 1000);
        } else {
            clearInterval(timerRef.current);
        }
        return () => clearInterval(timerRef.current);
    }, [isCheckedIn, onBreak]);

    // Break timer
    useEffect(() => {
        if (onBreak) {
            breakRef.current = setInterval(() => setBreakSecs(s=>s+1), 1000);
        } else {
            clearInterval(breakRef.current);
        }
        return () => clearInterval(breakRef.current);
    }, [onBreak]);

    const handleCheckIn = () => {
        setCheckedIn(true);
        setSeconds(0); setBreakSecs(0);
        const now = new Date();
        setCheckInTime(now.toTimeString().slice(0,5));
    };

    const handleCheckOut = () => {
        if (!window.confirm('Xác nhận chấm công ra?')) return;
        const now = new Date();
        const newRecord = {
            date:     todayKey(),
            checkIn:  checkInTime,
            checkOut: now.toTimeString().slice(0,5),
            breaks:   Math.floor(breakSecs/60),
            note:     note || 'Không có ghi chú',
        };
        setHistory(p => [newRecord, ...p]);
        setCheckedIn(false); setOnBreak(false);
        setSeconds(0); setBreakSecs(0);
        setCheckInTime(null); setNote('');
    };

    // Stats
    const totalHoursThisWeek = history.slice(0,7).reduce((s,r) => s+calcHours(r.checkIn,r.checkOut,r.breaks), 0);
    const avgHoursPerDay     = history.length ? (history.reduce((s,r)=>s+calcHours(r.checkIn,r.checkOut,r.breaks),0)/history.length) : 0;
    const workedToday        = seconds/3600;
    const target             = 8; // 8 hours/day
    const weekTarget         = 40;
    const weekPct            = Math.min((totalHoursThisWeek/weekTarget)*100, 100);
    const dayPct             = Math.min((workedToday/target)*100, 100);

    // Weekly bar data
    const weekData = DAYS.map((label,i) => {
        const dayOfWeek = new Date().getDay();
        const diff = i - dayOfWeek;
        const d    = new Date(); d.setDate(d.getDate()+diff);
        const key  = d.toISOString().slice(0,10);
        const rec  = history.find(r=>r.date===key);
        return {
            label,
            h:     rec ? calcHours(rec.checkIn,rec.checkOut,rec.breaks) : (i<dayOfWeek?7.5:0),
            today: i === dayOfWeek,
        };
    });

    const netSeconds = Math.max(seconds - breakSecs, 0);

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-white" style={{ fontFamily:'Syne,sans-serif' }}>⏰ Chấm công</h1>
                    <p className="text-sm mt-1 capitalize" style={{ color:'rgba(255,255,255,0.35)' }}>{today()}</p>
                </div>
                <div className="text-right">
                    <div className="text-2xl font-black font-mono text-white">{fmt(seconds)}</div>
                    <div className="text-[10px] mt-0.5" style={{ color:'rgba(255,255,255,0.35)' }}>
                        {isCheckedIn ? (onBreak ? '☕ Đang nghỉ' : '🟢 Đang làm việc') : '⭕ Chưa vào ca'}
                    </div>
                </div>
            </div>

            {/* Main check-in area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

                {/* Clock + controls */}
                <div className="rounded-2xl p-6 flex flex-col items-center gap-5"
                     style={{ background:'rgba(4,5,16,0.7)', border:'1px solid rgba(255,255,255,0.07)' }}>

                    {/* Ring */}
                    <Ring pct={dayPct} size={160} stroke={12} color={isCheckedIn?'#22c55e':'rgba(255,255,255,0.1)'}>
                        <div className="text-3xl font-black font-mono text-white" style={{ fontFamily:'Syne,sans-serif' }}>
                            {fmt(netSeconds)}
                        </div>
                        <div className="text-[10px] mt-1" style={{ color:'rgba(255,255,255,0.35)' }}>
                            giờ làm thực tế
                        </div>
                    </Ring>

                    {/* Info pills */}
                    {isCheckedIn && (
                        <div className="flex gap-2 flex-wrap justify-center">
                            <span className="text-xs px-2.5 py-1 rounded-full font-bold"
                                  style={{ background:'rgba(34,197,94,0.12)', color:'#4ade80', border:'1px solid rgba(34,197,94,0.2)' }}>
                                Vào: {checkInTime}
                            </span>
                            {breakSecs > 0 && (
                                <span className="text-xs px-2.5 py-1 rounded-full font-bold"
                                      style={{ background:'rgba(251,191,36,0.12)', color:'#fbbf24', border:'1px solid rgba(251,191,36,0.2)' }}>
                                    Nghỉ: {fmtHm(breakSecs)}
                                </span>
                            )}
                        </div>
                    )}

                    {/* Buttons */}
                    {!isCheckedIn ? (
                        <button onClick={handleCheckIn}
                                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-base font-black text-white transition-all hover:brightness-110"
                                style={{ background:'linear-gradient(135deg,#16a34a,#22c55e)', boxShadow:'0 6px 24px rgba(34,197,94,0.4)' }}>
                            <Play size={18}/> Chấm công vào
                        </button>
                    ) : (
                        <div className="w-full space-y-2">
                            {!onBreak ? (
                                <button onClick={()=>setOnBreak(true)}
                                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all"
                                        style={{ background:'rgba(251,191,36,0.12)', border:'1px solid rgba(251,191,36,0.25)', color:'#fbbf24' }}>
                                    <Coffee size={15}/> Nghỉ giải lao
                                </button>
                            ) : (
                                <button onClick={()=>setOnBreak(false)}
                                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all"
                                        style={{ background:'rgba(56,189,248,0.12)', border:'1px solid rgba(56,189,248,0.25)', color:'#38bdf8' }}>
                                    <Play size={15}/> Tiếp tục làm
                                </button>
                            )}
                            <button onClick={()=>setShowNote(true)}
                                    className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-black text-white transition-all hover:brightness-110"
                                    style={{ background:'linear-gradient(135deg,#dc2626,#ef4444)', boxShadow:'0 4px 16px rgba(239,68,68,0.4)' }}>
                                <Square size={15}/> Chấm công ra
                            </button>
                        </div>
                    )}
                </div>

                {/* Stats */}
                <div className="lg:col-span-2 space-y-4">
                    {/* Week progress */}
                    <div className="rounded-2xl p-5"
                         style={{ background:'rgba(4,5,16,0.7)', border:'1px solid rgba(255,255,255,0.07)' }}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-black text-white text-sm" style={{ fontFamily:'Syne,sans-serif' }}>
                                <BarChart2 size={14} className="inline mr-1.5" style={{ color:'#38bdf8' }}/>
                                Giờ làm tuần này
                            </h3>
                            <span className="text-xs font-black" style={{ color:'#38bdf8' }}>
                                {totalHoursThisWeek.toFixed(1)}h / {weekTarget}h
                            </span>
                        </div>
                        <div className="h-1.5 rounded-full overflow-hidden mb-4" style={{ background:'rgba(255,255,255,0.06)' }}>
                            <div className="h-full rounded-full transition-all duration-1000"
                                 style={{ width:`${weekPct}%`, background:'linear-gradient(90deg,#0369a1,#38bdf8)', boxShadow:'0 0 10px rgba(56,189,248,0.5)' }}/>
                        </div>
                        <WeekBar data={weekData}/>
                    </div>

                    {/* Stat cards */}
                    <div className="grid grid-cols-3 gap-3">
                        {[
                            { label:'Trung bình/ngày', value:`${avgHoursPerDay.toFixed(1)}h`, color:'#22c55e' },
                            { label:'Tổng tuần này',   value:`${totalHoursThisWeek.toFixed(1)}h`, color:'#38bdf8' },
                            { label:'Ngày công tháng', value:`${history.length}`, color:'#818cf8' },
                        ].map((s,i)=>(
                            <div key={i} className="rounded-2xl p-4 text-center"
                                 style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)' }}>
                                <div className="text-2xl font-black" style={{ color:s.color, fontFamily:'Syne,sans-serif' }}>{s.value}</div>
                                <div className="text-[10px] mt-0.5" style={{ color:'rgba(255,255,255,0.3)' }}>{s.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* History table */}
            <div className="rounded-2xl overflow-hidden"
                 style={{ background:'rgba(4,5,16,0.7)', border:'1px solid rgba(255,255,255,0.07)' }}>
                <div className="flex items-center justify-between px-5 py-4"
                     style={{ borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
                    <h3 className="font-black text-white text-sm" style={{ fontFamily:'Syne,sans-serif' }}>
                        <Calendar size={14} className="inline mr-1.5" style={{ color:'#818cf8' }}/>
                        Lịch sử chấm công
                    </h3>
                    <button className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl transition-all"
                            style={{ background:'rgba(56,189,248,0.08)', color:'#38bdf8', border:'1px solid rgba(56,189,248,0.15)' }}>
                        <Download size={11}/> Xuất báo cáo
                    </button>
                </div>

                {/* Table header */}
                <div className="grid px-5 py-2.5 text-[10px] font-black uppercase tracking-wider"
                     style={{ gridTemplateColumns:'1fr 80px 80px 60px 1fr', borderBottom:'1px solid rgba(255,255,255,0.04)', color:'rgba(255,255,255,0.25)' }}>
                    <span>Ngày</span>
                    <span className="text-center">Vào ca</span>
                    <span className="text-center">Ra ca</span>
                    <span className="text-center">Giờ làm</span>
                    <span>Ghi chú</span>
                </div>

                <div className="max-h-80 overflow-y-auto" style={{ scrollbarWidth:'none' }}>
                    {history.map((r,i) => {
                        const hours = calcHours(r.checkIn, r.checkOut, r.breaks);
                        const isOT  = hours > 8;
                        const isLow = hours < 7 && hours > 0;
                        return (
                            <div key={i}
                                 className="grid px-5 py-3.5 items-center hover:bg-white/[0.02] transition-colors"
                                 style={{ gridTemplateColumns:'1fr 80px 80px 60px 1fr', borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
                                <div>
                                    <p className="text-sm font-bold text-white">
                                        {new Date(r.date).toLocaleDateString('vi-VN',{weekday:'short',day:'2-digit',month:'2-digit'})}
                                    </p>
                                </div>
                                <div className="text-center">
                                    <span className="text-xs font-mono font-bold" style={{ color:'#4ade80' }}>{r.checkIn}</span>
                                </div>
                                <div className="text-center">
                                    <span className="text-xs font-mono font-bold" style={{ color:'#f87171' }}>{r.checkOut}</span>
                                </div>
                                <div className="text-center">
                                    <span className="text-xs font-black"
                                          style={{ color: isOT?'#fbbf24':isLow?'#f87171':'rgba(255,255,255,0.7)' }}>
                                        {hours.toFixed(1)}h{isOT?' ⚡':''}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-xs" style={{ color:'rgba(255,255,255,0.4)' }}>{r.note}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Summary footer */}
                <div className="px-5 py-3 flex items-center justify-between"
                     style={{ borderTop:'1px solid rgba(255,255,255,0.05)' }}>
                    <span className="text-xs" style={{ color:'rgba(255,255,255,0.25)' }}>
                        {history.length} ngày công
                    </span>
                    <div className="flex items-center gap-3 text-xs" style={{ color:'rgba(255,255,255,0.35)' }}>
                        <span style={{ color:'#fbbf24' }}>⚡ OT</span>
                        <span style={{ color:'#f87171' }}>Thiếu giờ</span>
                        <span style={{ color:'rgba(255,255,255,0.6)' }}>Đủ giờ</span>
                    </div>
                </div>
            </div>

            {/* Note modal before checkout */}
            {showNote && (
                <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl"
                         style={{ background:'rgba(4,5,16,0.98)', border:'1px solid rgba(239,68,68,0.25)' }}>
                        <div className="h-1" style={{ background:'linear-gradient(90deg,#dc2626,#ef4444)' }}/>
                        <div className="p-5">
                            <h3 className="font-black text-white mb-1" style={{ fontFamily:'Syne,sans-serif' }}>📝 Ghi chú trước khi ra ca</h3>
                            <p className="text-xs mb-4" style={{ color:'rgba(255,255,255,0.4)' }}>Tóm tắt công việc hôm nay</p>
                            <textarea value={note} onChange={e=>setNote(e.target.value)} rows={3}
                                      placeholder="VD: Kiểm định 3 lô hàng, cập nhật trace log BATCH-001..."
                                      className="w-full px-3 py-2.5 rounded-xl text-sm text-white placeholder-slate-700 focus:outline-none resize-none"
                                      style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)' }}/>
                            <div className="flex gap-3 mt-4">
                                <button onClick={()=>setShowNote(false)}
                                        className="flex-1 py-2.5 rounded-xl text-sm font-bold"
                                        style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', color:'rgba(255,255,255,0.5)' }}>
                                    Hủy
                                </button>
                                <button onClick={()=>{ setShowNote(false); handleCheckOut(); }}
                                        className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white"
                                        style={{ background:'linear-gradient(135deg,#dc2626,#ef4444)' }}>
                                    <Square size={13} className="inline mr-1"/> Xác nhận ra ca
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}