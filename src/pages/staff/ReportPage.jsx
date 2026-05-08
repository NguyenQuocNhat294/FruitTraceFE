// src/pages/staff/ReportPage.jsx
import React, { useState, useEffect } from 'react';
import {
    FileText, Download, RefreshCw, CheckCircle,
    Package, Clock, Camera, TrendingUp, Calendar,
    ChevronDown, X, Send, Star
} from 'lucide-react';
import { batchService } from '../../services/batchService';
import { useAuth } from '../../hooks/useAuth';

const REPORT_TYPES = [
    { val:'daily',   label:'Báo cáo ngày',   icon:'📅' },
    { val:'weekly',  label:'Báo cáo tuần',   icon:'📆' },
    { val:'monthly', label:'Báo cáo tháng',  icon:'🗓️' },
    { val:'batch',   label:'Báo cáo lô hàng',icon:'📦' },
];

const SECTIONS = [
    { key:'tasks',     label:'Nhiệm vụ đã hoàn thành', icon:<CheckCircle size={14}/>,  color:'#22c55e' },
    { key:'batches',   label:'Lô hàng đã kiểm định',   icon:<Package size={14}/>,      color:'#38bdf8' },
    { key:'time',      label:'Thời gian làm việc',      icon:<Clock size={14}/>,        color:'#818cf8' },
    { key:'photos',    label:'Ảnh đã chụp',             icon:<Camera size={14}/>,       color:'#fbbf24' },
    { key:'issues',    label:'Vấn đề phát sinh',        icon:<TrendingUp size={14}/>,   color:'#f87171' },
];

export default function ReportPage() {
    const { user }                  = useAuth();
    const [batches, setBatches]     = useState([]);
    const [loading, setLoading]     = useState(true);
    const [type, setType]           = useState('daily');
    const [submitted, setSubmitted] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [form, setForm]           = useState({
        date:     new Date().toISOString().slice(0,10),
        tasks:    '',
        batches:  '',
        time:     '8',
        photos:   '',
        issues:   '',
        rating:   5,
        summary:  '',
    });

    useEffect(() => {
        batchService.getAll()
            .then(r => setBatches(r.data || []))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const today = new Date();
    const inspected = batches.filter(b => b.status === 'shipping').length;
    const pending   = batches.filter(b => b.status === 'available').length;

    const handleSubmit = async () => {
        setSubmitting(true);
        await new Promise(r => setTimeout(r, 1500));
        setSubmitting(false);
        setSubmitted(true);
    };

    const handleReset = () => {
        setSubmitted(false);
        setForm({ date:new Date().toISOString().slice(0,10), tasks:'', batches:'', time:'8', photos:'', issues:'', rating:5, summary:'' });
    };

    const now = today.toLocaleDateString('vi-VN', { weekday:'long', day:'2-digit', month:'2-digit', year:'numeric' });

    if (submitted) return (
        <div className="space-y-5">
            <div>
                <h1 className="text-3xl font-black text-white" style={{ fontFamily:'Syne,sans-serif' }}>📝 Báo cáo</h1>
            </div>
            <div className="rounded-3xl py-20 text-center"
                 style={{ background:'rgba(34,197,94,0.06)', border:'1px solid rgba(34,197,94,0.2)' }}>
                <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
                     style={{ background:'rgba(34,197,94,0.15)', border:'2px solid rgba(34,197,94,0.3)' }}>
                    <CheckCircle size={36} style={{ color:'#22c55e' }}/>
                </div>
                <h2 className="text-2xl font-black text-white mb-2" style={{ fontFamily:'Syne,sans-serif' }}>
                    Báo cáo đã gửi!
                </h2>
                <p className="text-sm mb-6" style={{ color:'rgba(255,255,255,0.4)' }}>
                    Báo cáo {REPORT_TYPES.find(t=>t.val===type)?.label.toLowerCase()} của bạn đã được gửi thành công
                </p>
                <div className="inline-flex flex-col gap-2">
                    <div className="px-4 py-2 rounded-xl text-sm"
                         style={{ background:'rgba(255,255,255,0.04)', color:'rgba(255,255,255,0.5)' }}>
                        📅 {now} · 👤 {user?.username}
                    </div>
                    <button onClick={handleReset}
                            className="px-6 py-2.5 rounded-xl text-sm font-bold text-white"
                            style={{ background:'linear-gradient(135deg,#6366f1,#818cf8)' }}>
                        ✏️ Tạo báo cáo mới
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-white" style={{ fontFamily:'Syne,sans-serif' }}>📝 Báo cáo</h1>
                    <p className="text-sm mt-1" style={{ color:'rgba(255,255,255,0.35)' }}>
                        Tạo và gửi báo cáo công việc
                    </p>
                </div>
                <div className="text-right">
                    <div className="text-sm font-bold text-white">{user?.username}</div>
                    <div className="text-xs mt-0.5 capitalize" style={{ color:'rgba(255,255,255,0.35)' }}>{now}</div>
                </div>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                    { label:'Lô đã kiểm định', value:loading?'—':inspected, color:'#22c55e', icon:<CheckCircle size={16}/> },
                    { label:'Lô chờ kiểm định', value:loading?'—':pending,   color:'#fbbf24', icon:<Package size={16}/> },
                    { label:'Giờ làm việc',     value:'8h',                  color:'#818cf8', icon:<Clock size={16}/> },
                    { label:'Ngày làm việc',    value:today.getDate(),       color:'#38bdf8', icon:<Calendar size={16}/> },
                ].map((s,i)=>(
                    <div key={i} className="rounded-2xl p-4 relative overflow-hidden"
                         style={{ background:'rgba(4,5,16,0.7)', border:'1px solid rgba(255,255,255,0.07)' }}>
                        <div className="absolute top-0 left-0 right-0 h-px"
                             style={{ background:`linear-gradient(90deg,transparent,${s.color}50,transparent)` }}/>
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-2"
                             style={{ background:`${s.color}15`, color:s.color }}>{s.icon}</div>
                        <div className="text-2xl font-black text-white" style={{ fontFamily:'Syne,sans-serif' }}>{s.value}</div>
                        <div className="text-xs mt-0.5" style={{ color:'rgba(255,255,255,0.3)' }}>{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Form */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Left: Report type + date */}
                <div className="space-y-4">
                    {/* Type */}
                    <div className="rounded-2xl p-4"
                         style={{ background:'rgba(4,5,16,0.7)', border:'1px solid rgba(255,255,255,0.07)' }}>
                        <h3 className="font-black text-white text-sm mb-3" style={{ fontFamily:'Syne,sans-serif' }}>Loại báo cáo</h3>
                        <div className="space-y-1.5">
                            {REPORT_TYPES.map(rt=>(
                                <button key={rt.val} onClick={()=>setType(rt.val)}
                                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all text-left"
                                        style={ type===rt.val
                                            ? { background:'rgba(129,140,248,0.15)', border:'1px solid rgba(129,140,248,0.3)', color:'#c4b5fd' }
                                            : { background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)', color:'rgba(255,255,255,0.4)' }
                                        }>
                                    <span>{rt.icon}</span>
                                    <span>{rt.label}</span>
                                    {type===rt.val && <div className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background:'#818cf8' }}/>}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Date */}
                    <div className="rounded-2xl p-4"
                         style={{ background:'rgba(4,5,16,0.7)', border:'1px solid rgba(255,255,255,0.07)' }}>
                        <h3 className="font-black text-white text-sm mb-3" style={{ fontFamily:'Syne,sans-serif' }}>Ngày báo cáo</h3>
                        <input type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})}
                               className="w-full px-3 py-2.5 rounded-xl text-sm text-white focus:outline-none"
                               style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)' }}/>
                    </div>

                    {/* Rating */}
                    <div className="rounded-2xl p-4"
                         style={{ background:'rgba(4,5,16,0.7)', border:'1px solid rgba(255,255,255,0.07)' }}>
                        <h3 className="font-black text-white text-sm mb-3" style={{ fontFamily:'Syne,sans-serif' }}>Đánh giá ngày làm việc</h3>
                        <div className="flex gap-1.5 justify-center">
                            {[1,2,3,4,5].map(s=>(
                                <button key={s} onClick={()=>setForm({...form,rating:s})}
                                        className="transition-all hover:scale-110">
                                    <Star size={28} style={{
                                        color: s<=form.rating ? '#fbbf24' : 'rgba(255,255,255,0.1)',
                                        fill:  s<=form.rating ? '#fbbf24' : 'transparent',
                                    }}/>
                                </button>
                            ))}
                        </div>
                        <p className="text-xs text-center mt-2" style={{ color:'rgba(255,255,255,0.3)' }}>
                            {form.rating===5?'Xuất sắc':form.rating===4?'Tốt':form.rating===3?'Bình thường':form.rating===2?'Khó khăn':'Rất khó khăn'}
                        </p>
                    </div>
                </div>

                {/* Right: Content */}
                <div className="lg:col-span-2 rounded-2xl p-5 space-y-4"
                     style={{ background:'rgba(4,5,16,0.7)', border:'1px solid rgba(255,255,255,0.07)' }}>
                    <h3 className="font-black text-white text-sm" style={{ fontFamily:'Syne,sans-serif' }}>Nội dung báo cáo</h3>

                    {SECTIONS.map(sec=>(
                        <div key={sec.key}>
                            <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider mb-1.5"
                                   style={{ color:sec.color }}>
                                {sec.icon} {sec.label}
                            </label>
                            <textarea
                                value={form[sec.key]}
                                onChange={e=>setForm({...form,[sec.key]:e.target.value})}
                                rows={sec.key==='issues'||sec.key==='summary'?3:2}
                                placeholder={
                                    sec.key==='tasks'   ? 'VD: Kiểm định lô BATCH-001, BATCH-002. Cập nhật trace log...' :
                                        sec.key==='batches' ? 'VD: BATCH-001 (đạt), BATCH-002 (đạt có điều kiện)...' :
                                            sec.key==='time'    ? 'VD: Vào lúc 7:30, ra lúc 16:30. Tổng 9 tiếng...' :
                                                sec.key==='photos'  ? 'VD: 15 ảnh thu hoạch, 8 ảnh kiểm định...' :
                                                    'VD: Lô BATCH-003 phát hiện dư lượng thuốc vượt ngưỡng...'
                                }
                                className="w-full px-3 py-2.5 rounded-xl text-sm text-white placeholder-slate-700 focus:outline-none resize-none transition-all"
                                style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)' }}
                                onFocus={e=>e.target.style.borderColor=`${sec.color}40`}
                                onBlur={e=>e.target.style.borderColor='rgba(255,255,255,0.08)'}
                            />
                        </div>
                    ))}

                    {/* Summary */}
                    <div>
                        <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider mb-1.5"
                               style={{ color:'rgba(255,255,255,0.4)' }}>
                            <FileText size={13}/> Tổng kết & đề xuất
                        </label>
                        <textarea
                            value={form.summary}
                            onChange={e=>setForm({...form,summary:e.target.value})}
                            rows={3}
                            placeholder="Tóm tắt công việc trong ngày và đề xuất cho ngày mai..."
                            className="w-full px-3 py-2.5 rounded-xl text-sm text-white placeholder-slate-700 focus:outline-none resize-none"
                            style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)' }}/>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <button onClick={()=>setShowPreview(true)}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all"
                                style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', color:'rgba(255,255,255,0.6)' }}>
                            <FileText size={14}/> Xem trước
                        </button>
                        <button onClick={handleSubmit} disabled={submitting}
                                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-60"
                                style={{ background:'linear-gradient(135deg,#6366f1,#818cf8)', boxShadow:'0 4px 16px rgba(129,140,248,0.35)' }}>
                            {submitting
                                ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> Đang gửi...</>
                                : <><Send size={14}/> Gửi báo cáo</>
                            }
                        </button>
                    </div>
                </div>
            </div>

            {/* Preview Modal */}
            {showPreview && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-3xl shadow-2xl"
                         style={{ background:'rgba(4,5,16,0.98)', border:'1px solid rgba(129,140,248,0.2)' }}>
                        <div className="h-1.5" style={{ background:'linear-gradient(90deg,#6366f1,#818cf8,#c084fc)' }}/>
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-5">
                                <h3 className="font-black text-white text-lg" style={{ fontFamily:'Syne,sans-serif' }}>
                                    {REPORT_TYPES.find(t=>t.val===type)?.icon} {REPORT_TYPES.find(t=>t.val===type)?.label}
                                </h3>
                                <button onClick={()=>setShowPreview(false)} style={{ color:'rgba(255,255,255,0.4)' }}><X size={18}/></button>
                            </div>

                            <div className="space-y-1 text-xs mb-4 p-3 rounded-xl"
                                 style={{ background:'rgba(255,255,255,0.04)', color:'rgba(255,255,255,0.5)' }}>
                                <div>📅 Ngày: <strong className="text-white">{form.date}</strong></div>
                                <div>👤 Nhân viên: <strong className="text-white">{user?.username}</strong></div>
                                <div>⭐ Đánh giá: <strong className="text-white">{'⭐'.repeat(form.rating)}</strong></div>
                            </div>

                            <div className="space-y-3">
                                {SECTIONS.filter(s=>form[s.key]).map(sec=>(
                                    <div key={sec.key} className="p-3 rounded-xl"
                                         style={{ background:'rgba(255,255,255,0.03)', border:`1px solid ${sec.color}20` }}>
                                        <p className="text-[10px] font-black uppercase tracking-wider mb-1.5" style={{ color:sec.color }}>
                                            {sec.label}
                                        </p>
                                        <p className="text-sm" style={{ color:'rgba(255,255,255,0.7)' }}>{form[sec.key]}</p>
                                    </div>
                                ))}
                                {form.summary && (
                                    <div className="p-3 rounded-xl"
                                         style={{ background:'rgba(129,140,248,0.06)', border:'1px solid rgba(129,140,248,0.15)' }}>
                                        <p className="text-[10px] font-black uppercase tracking-wider mb-1.5" style={{ color:'#a78bfa' }}>
                                            Tổng kết & đề xuất
                                        </p>
                                        <p className="text-sm" style={{ color:'rgba(255,255,255,0.7)' }}>{form.summary}</p>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-3 mt-5">
                                <button onClick={()=>setShowPreview(false)}
                                        className="flex-1 py-2.5 rounded-xl text-sm font-bold"
                                        style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', color:'rgba(255,255,255,0.5)' }}>
                                    Chỉnh sửa
                                </button>
                                <button onClick={()=>{ setShowPreview(false); handleSubmit(); }}
                                        className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white"
                                        style={{ background:'linear-gradient(135deg,#6366f1,#818cf8)' }}>
                                    <Send size={13} className="inline mr-1.5"/> Xác nhận gửi
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}