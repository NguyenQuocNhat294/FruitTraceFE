// src/pages/staff/StaffTasksPage.jsx
import React, { useState } from 'react';
import { Plus, CheckCircle, Clock, AlertTriangle, X, Filter } from 'lucide-react';

const INIT_TASKS = [
    { id:1, title:'Kiểm định lô BATCH-001', batch:'BATCH-001', time:'10:00', priority:'high',   done:false, desc:'Kiểm tra dư lượng thuốc và chất lượng' },
    { id:2, title:'Cập nhật nhật ký BATCH-002', batch:'BATCH-002', time:'13:00', priority:'medium', done:false, desc:'Thêm bước đóng gói vào trace log' },
    { id:3, title:'Xác nhận đóng gói BATCH-003', batch:'BATCH-003', time:'15:30', priority:'high',   done:true,  desc:'Xác nhận số lượng và chất lượng đóng gói' },
    { id:4, title:'Kiểm tra xuất kho BATCH-004', batch:'BATCH-004', time:'17:00', priority:'low',    done:false, desc:'Kiểm tra trước khi xuất kho' },
    { id:5, title:'Chụp ảnh lô BATCH-005',      batch:'BATCH-005', time:'09:00', priority:'medium', done:false, desc:'Chụp ảnh minh chứng thu hoạch' },
];

const PRIORITY = {
    high:   { label:'Cao',   color:'#f87171', bg:'rgba(239,68,68,0.1)',   border:'rgba(239,68,68,0.2)'   },
    medium: { label:'Trung', color:'#fbbf24', bg:'rgba(251,191,36,0.1)',  border:'rgba(251,191,36,0.2)'  },
    low:    { label:'Thấp',  color:'#94a3b8', bg:'rgba(148,163,184,0.08)',border:'rgba(148,163,184,0.15)'},
};

export default function StaffTasksPage() {
    const [tasks, setTasks]     = useState(INIT_TASKS);
    const [filter, setFilter]   = useState('all');
    const [showAdd, setShowAdd] = useState(false);
    const [form, setForm]       = useState({ title:'', batch:'', time:'09:00', priority:'medium', desc:'' });

    const toggle  = id => setTasks(p => p.map(t => t.id===id ? {...t,done:!t.done} : t));
    const remove  = id => setTasks(p => p.filter(t => t.id!==id));
    const addTask = () => {
        if (!form.title) return;
        setTasks(p => [...p, { ...form, id:Date.now(), done:false }]);
        setForm({ title:'', batch:'', time:'09:00', priority:'medium', desc:'' });
        setShowAdd(false);
    };

    const filtered = tasks.filter(t =>
        filter === 'all'      ? true :
            filter === 'pending'  ? !t.done :
                filter === 'done'     ? t.done :
                    filter === 'high'     ? t.priority === 'high' && !t.done : true
    );

    const done    = tasks.filter(t=>t.done).length;
    const pending = tasks.filter(t=>!t.done).length;
    const high    = tasks.filter(t=>t.priority==='high'&&!t.done).length;

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-white" style={{ fontFamily:'Syne,sans-serif' }}>✅ Nhiệm vụ</h1>
                    <p className="text-sm mt-1" style={{ color:'rgba(255,255,255,0.35)' }}>Quản lý và theo dõi nhiệm vụ hàng ngày</p>
                </div>
                <button onClick={()=>setShowAdd(true)}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white"
                        style={{ background:'linear-gradient(135deg,#6366f1,#818cf8)', boxShadow:'0 4px 16px rgba(129,140,248,0.35)' }}>
                    <Plus size={15}/> Thêm nhiệm vụ
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
                {[
                    { label:'Chờ xử lý',  value:pending, color:'#818cf8', icon:<Clock size={18}/> },
                    { label:'Ưu tiên cao', value:high,    color:'#f87171', icon:<AlertTriangle size={18}/> },
                    { label:'Hoàn thành', value:done,    color:'#22c55e', icon:<CheckCircle size={18}/> },
                ].map((s,i)=>(
                    <div key={i} className="rounded-2xl p-4 relative overflow-hidden"
                         style={{ background:'rgba(4,5,16,0.7)', border:'1px solid rgba(255,255,255,0.07)' }}>
                        <div className="absolute top-0 left-0 right-0 h-px"
                             style={{ background:`linear-gradient(90deg,transparent,${s.color}50,transparent)` }}/>
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-2"
                             style={{ background:`${s.color}15`, color:s.color }}>{s.icon}</div>
                        <div className="text-2xl font-black text-white" style={{ fontFamily:'Syne,sans-serif' }}>{s.value}</div>
                        <div className="text-xs mt-0.5" style={{ color:'rgba(255,255,255,0.3)' }}>{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Progress */}
            <div className="rounded-2xl p-4" style={{ background:'rgba(4,5,16,0.7)', border:'1px solid rgba(255,255,255,0.07)' }}>
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-white">Tiến độ hôm nay</span>
                    <span className="text-sm font-black" style={{ color:'#818cf8' }}>{done}/{tasks.length}</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background:'rgba(255,255,255,0.06)' }}>
                    <div className="h-full rounded-full transition-all duration-700"
                         style={{ width:`${(done/tasks.length)*100}%`, background:'linear-gradient(90deg,#6366f1,#818cf8,#c084fc)', boxShadow:'0 0 12px rgba(129,140,248,0.5)' }}/>
                </div>
            </div>

            {/* Filter tabs */}
            <div className="flex gap-2 flex-wrap">
                {[
                    { val:'all',     label:`Tất cả (${tasks.length})`    },
                    { val:'pending', label:`Chờ xử lý (${pending})`     },
                    { val:'high',    label:`Ưu tiên cao (${high})`       },
                    { val:'done',    label:`Hoàn thành (${done})`        },
                ].map(f=>(
                    <button key={f.val} onClick={()=>setFilter(f.val)}
                            className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
                            style={ filter===f.val
                                ? { background:'rgba(129,140,248,0.15)', border:'1px solid rgba(129,140,248,0.3)', color:'#a78bfa' }
                                : { background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)', color:'rgba(255,255,255,0.4)' }
                            }>{f.label}</button>
                ))}
            </div>

            {/* Task list */}
            <div className="rounded-2xl overflow-hidden" style={{ background:'rgba(4,5,16,0.7)', border:'1px solid rgba(255,255,255,0.07)' }}>
                {filtered.length === 0 ? (
                    <div className="py-12 text-center" style={{ color:'rgba(255,255,255,0.25)' }}>
                        <CheckCircle size={32} className="mx-auto mb-2 opacity-30"/>
                        <p className="text-sm">Không có nhiệm vụ nào</p>
                    </div>
                ) : filtered.map((task,i) => {
                    const p = PRIORITY[task.priority] || PRIORITY.medium;
                    return (
                        <div key={task.id}
                             className={`flex items-start gap-4 px-5 py-4 group transition-colors hover:bg-white/[0.02] ${task.done?'opacity-50':''}`}
                             style={{ borderBottom: i<filtered.length-1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                            <button onClick={()=>toggle(task.id)}
                                    className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all"
                                    style={ task.done
                                        ? { background:'linear-gradient(135deg,#6366f1,#818cf8)', borderColor:'transparent', boxShadow:'0 0 8px rgba(129,140,248,0.4)' }
                                        : { borderColor:'rgba(255,255,255,0.2)' }
                                    }>
                                {task.done && <CheckCircle size={11} className="text-white"/>}
                            </button>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-0.5">
                                    <p className={`text-sm font-bold ${task.done?'line-through text-slate-600':'text-white'}`}>{task.title}</p>
                                    <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full flex-shrink-0"
                                          style={{ background:p.bg, color:p.color, border:`1px solid ${p.border}` }}>
                                        {p.label}
                                    </span>
                                </div>
                                {task.desc && <p className="text-xs mb-1" style={{ color:'rgba(255,255,255,0.35)' }}>{task.desc}</p>}
                                <div className="flex items-center gap-3 text-[10px]" style={{ color:'rgba(255,255,255,0.3)' }}>
                                    <span>🕐 {task.time}</span>
                                    {task.batch && <span>📦 {task.batch}</span>}
                                </div>
                            </div>
                            <button onClick={()=>remove(task.id)}
                                    className="opacity-0 group-hover:opacity-100 p-1 rounded-lg transition-all"
                                    style={{ color:'rgba(248,113,113,0.5)' }}
                                    onMouseEnter={e=>e.currentTarget.style.color='#f87171'}
                                    onMouseLeave={e=>e.currentTarget.style.color='rgba(248,113,113,0.5)'}>
                                <X size={14}/>
                            </button>
                        </div>
                    );
                })}
            </div>

            {/* Add modal */}
            {showAdd && (
                <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="w-full max-w-md rounded-2xl overflow-hidden shadow-2xl"
                         style={{ background:'rgba(4,5,16,0.98)', border:'1px solid rgba(129,140,248,0.2)' }}>
                        <div className="h-1" style={{ background:'linear-gradient(90deg,#6366f1,#818cf8,#c084fc)' }}/>
                        <div className="p-5">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-black text-white" style={{ fontFamily:'Syne,sans-serif' }}>➕ Thêm nhiệm vụ</h3>
                                <button onClick={()=>setShowAdd(false)} style={{ color:'rgba(255,255,255,0.4)' }}><X size={16}/></button>
                            </div>
                            <div className="space-y-3">
                                {[
                                    { key:'title', label:'Tên nhiệm vụ *', placeholder:'VD: Kiểm định lô BATCH-001' },
                                    { key:'batch', label:'Mã lô',           placeholder:'VD: BATCH-001' },
                                    { key:'desc',  label:'Mô tả',           placeholder:'Mô tả chi tiết...' },
                                ].map(f=>(
                                    <div key={f.key}>
                                        <label className="text-[10px] font-bold uppercase tracking-wider block mb-1" style={{ color:'rgba(255,255,255,0.35)' }}>{f.label}</label>
                                        <input value={form[f.key]} onChange={e=>setForm({...form,[f.key]:e.target.value})}
                                               placeholder={f.placeholder}
                                               className="w-full px-3 py-2.5 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none"
                                               style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)' }}/>
                                    </div>
                                ))}
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-[10px] font-bold uppercase tracking-wider block mb-1" style={{ color:'rgba(255,255,255,0.35)' }}>Giờ</label>
                                        <input type="time" value={form.time} onChange={e=>setForm({...form,time:e.target.value})}
                                               className="w-full px-3 py-2.5 rounded-xl text-sm text-white focus:outline-none"
                                               style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)' }}/>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold uppercase tracking-wider block mb-1" style={{ color:'rgba(255,255,255,0.35)' }}>Ưu tiên</label>
                                        <select value={form.priority} onChange={e=>setForm({...form,priority:e.target.value})}
                                                className="w-full px-3 py-2.5 rounded-xl text-sm text-white focus:outline-none"
                                                style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)' }}>
                                            <option value="high">Cao</option>
                                            <option value="medium">Trung bình</option>
                                            <option value="low">Thấp</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-3 mt-5">
                                <button onClick={()=>setShowAdd(false)}
                                        className="flex-1 py-2.5 rounded-xl text-sm font-bold"
                                        style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', color:'rgba(255,255,255,0.5)' }}>
                                    Hủy
                                </button>
                                <button onClick={addTask} disabled={!form.title}
                                        className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50"
                                        style={{ background:'linear-gradient(135deg,#6366f1,#818cf8)' }}>
                                    Thêm
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}