// src/pages/farm/CalendarPage.jsx
import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Plus, X, Clock, Sprout, Truck, FlaskConical, Droplets, Package } from "lucide-react";

const MONTHS_VI = ["Tháng 1","Tháng 2","Tháng 3","Tháng 4","Tháng 5","Tháng 6","Tháng 7","Tháng 8","Tháng 9","Tháng 10","Tháng 11","Tháng 12"];
const DAYS_VI   = ["CN","T2","T3","T4","T5","T6","T7"];

const EVENT_TYPES = {
    harvest:  { label: "Thu hoạch",    color: "#10b981", bg: "rgba(16,185,129,0.15)",  icon: <Sprout size={11}/> },
    water:    { label: "Tưới nước",    color: "#38bdf8", bg: "rgba(56,189,248,0.15)",  icon: <Droplets size={11}/> },
    inspect:  { label: "Kiểm định",    color: "#818cf8", bg: "rgba(129,140,248,0.15)", icon: <FlaskConical size={11}/> },
    shipping: { label: "Vận chuyển",   color: "#f59e0b", bg: "rgba(245,158,11,0.15)",  icon: <Truck size={11}/> },
    package:  { label: "Đóng gói",     color: "#f97316", bg: "rgba(249,115,22,0.15)",  icon: <Package size={11}/> },
    other:    { label: "Khác",         color: "#94a3b8", bg: "rgba(148,163,184,0.12)", icon: <Clock size={11}/> },
};

const INIT_EVENTS = [
    { id:1, day:5,  month:3, year:2026, title:"Thu hoạch lô B001", type:"harvest",  time:"06:00" },
    { id:2, day:8,  month:3, year:2026, title:"Tưới nước vườn A",  type:"water",    time:"07:30" },
    { id:3, day:8,  month:3, year:2026, title:"Kiểm định BATCH002",type:"inspect",  time:"14:00" },
    { id:4, day:12, month:3, year:2026, title:"Đóng gói lô hàng",  type:"package",  time:"08:00" },
    { id:5, day:15, month:3, year:2026, title:"Xuất kho Cái Bè",   type:"shipping", time:"05:30" },
    { id:6, day:20, month:3, year:2026, title:"Bón phân hữu cơ",   type:"other",    time:"09:00" },
];

export default function CalendarPage() {
    const today = new Date();
    const [cur, setCur]           = useState(new Date(2026, 2, 1)); // tháng 3/2026
    const [events, setEvents]     = useState(INIT_EVENTS);
    const [selected, setSelected] = useState(null); // ngày được chọn
    const [showModal, setModal]   = useState(false);
    const [form, setForm]         = useState({ title:"", type:"harvest", time:"08:00" });

    const year  = cur.getFullYear();
    const month = cur.getMonth() + 1;
    const daysInMonth   = new Date(year, month, 0).getDate();
    const firstDayOfMonth = new Date(year, month - 1, 1).getDay();

    const getEvents = (day) => events.filter(e => e.day===day && e.month===month && e.year===year);

    const addEvent = () => {
        if (!form.title || !selected) return;
        setEvents(prev => [...prev, { id: Date.now(), day: selected, month, year, ...form }]);
        setForm({ title:"", type:"harvest", time:"08:00" });
        setModal(false);
    };

    const removeEvent = (id) => setEvents(prev => prev.filter(e => e.id !== id));

    const isToday = (day) => day===today.getDate() && month-1===today.getMonth() && year===today.getFullYear();

    // Tất cả event tháng này để show trong panel bên phải
    const monthEvents = events.filter(e=>e.month===month&&e.year===year).sort((a,b)=>a.day-b.day||a.time.localeCompare(b.time));

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-white" style={{ fontFamily:"Syne,sans-serif" }}>📅 Lịch công việc</h1>
                    <p className="text-slate-500 text-sm mt-1">Quản lý lịch trình hoạt động nông trại</p>
                </div>
                <button onClick={()=>{ if(selected) setModal(true); else alert("Chọn ngày trước!"); }}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white"
                        style={{ background:"linear-gradient(135deg,#10b981,#38bdf8)", boxShadow:"0 4px 16px rgba(16,185,129,0.3)" }}>
                    <Plus size={15}/> Thêm sự kiện
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* ── Calendar ── */}
                <div className="lg:col-span-2 rounded-2xl overflow-hidden"
                     style={{ background:"rgba(15,23,42,0.6)", border:"1px solid rgba(148,163,184,0.08)" }}>

                    {/* Nav */}
                    <div className="flex items-center justify-between px-5 py-4"
                         style={{ borderBottom:"1px solid rgba(148,163,184,0.06)" }}>
                        <button onClick={()=>setCur(new Date(year,month-2,1))}
                                className="p-1.5 rounded-lg hover:bg-white/5 transition-colors text-slate-400 hover:text-white">
                            <ChevronLeft size={18}/>
                        </button>
                        <h2 className="font-black text-white" style={{ fontFamily:"Syne,sans-serif" }}>
                            {MONTHS_VI[month-1]} {year}
                        </h2>
                        <button onClick={()=>setCur(new Date(year,month,1))}
                                className="p-1.5 rounded-lg hover:bg-white/5 transition-colors text-slate-400 hover:text-white">
                            <ChevronRight size={18}/>
                        </button>
                    </div>

                    {/* Day headers */}
                    <div className="grid grid-cols-7" style={{ borderBottom:"1px solid rgba(148,163,184,0.06)" }}>
                        {DAYS_VI.map(d => (
                            <div key={d} className="py-2.5 text-center text-[10px] font-black uppercase tracking-widest text-slate-600">{d}</div>
                        ))}
                    </div>

                    {/* Days grid */}
                    <div className="grid grid-cols-7">
                        {/* Empty cells */}
                        {[...Array(firstDayOfMonth)].map((_,i)=>(
                            <div key={`e${i}`} className="min-h-[90px]" style={{ borderBottom:"1px solid rgba(148,163,184,0.04)", borderRight:"1px solid rgba(148,163,184,0.04)" }} />
                        ))}

                        {/* Day cells */}
                        {[...Array(daysInMonth)].map((_,i)=>{
                            const day = i+1;
                            const dayEvents = getEvents(day);
                            const today_  = isToday(day);
                            const isSelected = selected === day;
                            return (
                                <div key={day} onClick={()=>setSelected(day)}
                                     className="min-h-[90px] p-2 cursor-pointer transition-colors hover:bg-white/[0.02] relative group"
                                     style={{
                                         borderBottom:"1px solid rgba(148,163,184,0.04)",
                                         borderRight:"1px solid rgba(148,163,184,0.04)",
                                         background: isSelected ? "rgba(56,189,248,0.05)" : today_ ? "rgba(16,185,129,0.04)" : "transparent"
                                     }}>
                                    <span className={`w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold mb-1.5 ${today_ ? "text-white" : isSelected ? "text-sky-400" : "text-slate-500"}`}
                                          style={ today_ ? { background:"linear-gradient(135deg,#10b981,#38bdf8)", boxShadow:"0 0 12px rgba(16,185,129,0.4)" }
                                              : isSelected ? { background:"rgba(56,189,248,0.15)", border:"1px solid rgba(56,189,248,0.3)" } : {}}>
                                        {day}
                                    </span>
                                    <div className="space-y-0.5">
                                        {dayEvents.slice(0,2).map(ev=>{
                                            const t = EVENT_TYPES[ev.type]||EVENT_TYPES.other;
                                            return (
                                                <div key={ev.id} className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-semibold truncate"
                                                     style={{ background:t.bg, color:t.color }}>
                                                    {t.icon}<span className="truncate">{ev.title}</span>
                                                </div>
                                            );
                                        })}
                                        {dayEvents.length > 2 && (
                                            <div className="text-[9px] text-slate-600 pl-1">+{dayEvents.length-2} nữa</div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* ── Right panel ── */}
                <div className="space-y-4">
                    {/* Selected day events */}
                    <div className="rounded-2xl overflow-hidden"
                         style={{ background:"rgba(15,23,42,0.6)", border:"1px solid rgba(148,163,184,0.08)" }}>
                        <div className="px-4 py-3 flex items-center justify-between"
                             style={{ borderBottom:"1px solid rgba(148,163,184,0.06)" }}>
                            <h3 className="font-bold text-white text-sm" style={{ fontFamily:"Syne,sans-serif" }}>
                                {selected ? `Ngày ${selected}/${month}` : "Chọn ngày"}
                            </h3>
                            {selected && (
                                <button onClick={()=>{ setModal(true); }}
                                        className="p-1 rounded-lg text-slate-500 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors">
                                    <Plus size={14}/>
                                </button>
                            )}
                        </div>
                        <div className="p-3 space-y-2 max-h-48 overflow-y-auto" style={{ scrollbarWidth:"none" }}>
                            {selected ? getEvents(selected).length===0 ? (
                                <p className="text-xs text-slate-600 text-center py-4">Không có sự kiện</p>
                            ) : getEvents(selected).map(ev=>{
                                const t = EVENT_TYPES[ev.type]||EVENT_TYPES.other;
                                return (
                                    <div key={ev.id} className="flex items-center gap-2 p-2.5 rounded-xl group"
                                         style={{ background:"rgba(30,41,59,0.5)", border:"1px solid rgba(148,163,184,0.06)" }}>
                                        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                                             style={{ background:t.bg, color:t.color }}>{t.icon}</div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-semibold text-white truncate">{ev.title}</p>
                                            <p className="text-[10px] text-slate-500">🕐 {ev.time}</p>
                                        </div>
                                        <button onClick={()=>removeEvent(ev.id)}
                                                className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-500/10 text-slate-600 hover:text-red-400 transition-all">
                                            <X size={11}/>
                                        </button>
                                    </div>
                                );
                            }) : <p className="text-xs text-slate-600 text-center py-4">Click vào ngày để xem</p>}
                        </div>
                    </div>

                    {/* All month events */}
                    <div className="rounded-2xl overflow-hidden"
                         style={{ background:"rgba(15,23,42,0.6)", border:"1px solid rgba(148,163,184,0.08)" }}>
                        <div className="px-4 py-3" style={{ borderBottom:"1px solid rgba(148,163,184,0.06)" }}>
                            <h3 className="font-bold text-white text-sm" style={{ fontFamily:"Syne,sans-serif" }}>
                                Tháng này ({monthEvents.length})
                            </h3>
                        </div>
                        <div className="p-3 space-y-1.5 max-h-64 overflow-y-auto" style={{ scrollbarWidth:"none" }}>
                            {monthEvents.length===0 ? (
                                <p className="text-xs text-slate-600 text-center py-4">Chưa có sự kiện</p>
                            ) : monthEvents.map(ev=>{
                                const t = EVENT_TYPES[ev.type]||EVENT_TYPES.other;
                                return (
                                    <div key={ev.id} className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-white/[0.03] transition-colors">
                                        <div className="w-6 h-6 rounded text-[10px] font-black text-white flex items-center justify-center flex-shrink-0"
                                             style={{ background:`linear-gradient(135deg,${t.color},${t.color}80)` }}>{ev.day}</div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-semibold text-white truncate">{ev.title}</p>
                                            <p className="text-[9px] text-slate-600">{ev.time}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Legend */}
                    <div className="rounded-2xl p-4" style={{ background:"rgba(15,23,42,0.4)", border:"1px solid rgba(148,163,184,0.06)" }}>
                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-wider mb-2">Loại sự kiện</p>
                        <div className="grid grid-cols-2 gap-1.5">
                            {Object.entries(EVENT_TYPES).map(([key,t])=>(
                                <div key={key} className="flex items-center gap-1.5 text-[10px] text-slate-500">
                                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background:t.color }} />
                                    {t.label}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Add Event Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="rounded-2xl p-6 w-full max-w-sm" style={{ background:"rgba(15,23,42,0.95)", border:"1px solid rgba(148,163,184,0.12)" }}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-black text-white" style={{ fontFamily:"Syne,sans-serif" }}>
                                ➕ Thêm sự kiện — Ngày {selected}/{month}
                            </h3>
                            <button onClick={()=>setModal(false)} className="text-slate-500 hover:text-white"><X size={18}/></button>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <label className="text-xs font-bold text-slate-500 mb-1 block">Tên sự kiện *</label>
                                <input value={form.title} onChange={e=>setForm({...form,title:e.target.value})}
                                       placeholder="VD: Thu hoạch lô BATCH-001"
                                       className="w-full px-4 py-2.5 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none"
                                       style={{ background:"rgba(30,41,59,0.8)", border:"1px solid rgba(148,163,184,0.1)" }} />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 mb-1 block">Loại</label>
                                    <select value={form.type} onChange={e=>setForm({...form,type:e.target.value})}
                                            className="w-full px-3 py-2.5 rounded-xl text-sm text-white focus:outline-none"
                                            style={{ background:"rgba(30,41,59,0.8)", border:"1px solid rgba(148,163,184,0.1)" }}>
                                        {Object.entries(EVENT_TYPES).map(([k,t])=><option key={k} value={k}>{t.label}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 mb-1 block">Giờ</label>
                                    <input type="time" value={form.time} onChange={e=>setForm({...form,time:e.target.value})}
                                           className="w-full px-3 py-2.5 rounded-xl text-sm text-white focus:outline-none"
                                           style={{ background:"rgba(30,41,59,0.8)", border:"1px solid rgba(148,163,184,0.1)" }} />
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-3 mt-5">
                            <button onClick={()=>setModal(false)} className="flex-1 py-2.5 rounded-xl text-sm font-bold text-slate-400"
                                    style={{ background:"rgba(148,163,184,0.06)", border:"1px solid rgba(148,163,184,0.1)" }}>Hủy</button>
                            <button onClick={addEvent} disabled={!form.title} className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50"
                                    style={{ background:"linear-gradient(135deg,#10b981,#38bdf8)" }}>Thêm</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}