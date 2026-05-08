// src/pages/staff/StaffTracePage.jsx
import React, { useState, useEffect } from 'react';
import { Search, Plus, RefreshCw, MapPin, Clock, X, ChevronDown, CheckCircle } from 'lucide-react';
import { batchService } from '../../services/batchService';
import { traceService }  from '../../services/traceService';

const STEPS = ['Chuẩn bị đất','Xuống giống','Bón phân','Phun thuốc BVTV','Thu hoạch','Kiểm định','Đóng gói','Xuất kho','Giao hàng'];

const STEP_COLOR = {
    'Chuẩn bị đất':'#94a3b8','Xuống giống':'#22c55e','Bón phân':'#fbbf24',
    'Phun thuốc BVTV':'#f97316','Thu hoạch':'#10b981','Kiểm định':'#38bdf8',
    'Đóng gói':'#818cf8','Xuất kho':'#f59e0b','Giao hàng':'#22c55e'
};

export default function StaffTracePage() {
    const [batches, setBatches]         = useState([]);
    const [selectedCode, setSelected]   = useState('');
    const [logs, setLogs]               = useState([]);
    const [loadingLogs, setLL]          = useState(false);
    const [showForm, setShowForm]       = useState(false);
    const [saving, setSaving]           = useState(false);
    const [search, setSearch]           = useState('');
    const [form, setForm]               = useState({
        title: '', description: '', location: '', date: new Date().toISOString().slice(0,10)
    });

    useEffect(() => {
        batchService.getAll().then(r=>setBatches(r.data||[])).catch(()=>{});
    }, []);

    const loadLogs = async (code) => {
        if (!code) return;
        setLL(true);
        try {
            const batch = batches.find(b => b.batchcode === code);
            if (batch) {
                const r = await traceService.getByBatch(batch.id || batch._id);
                setLogs(r.data || []);
            }
        } catch { setLogs([]); }
        finally { setLL(false); }
    };

    const handleSelect = (code) => {
        setSelected(code); setLogs([]); setShowForm(false);
        if (code) loadLogs(code);
    };

    const handleAdd = async () => {
        if (!form.title || !form.description) return alert('Điền đầy đủ bước và mô tả!');
        setSaving(true);
        try {
            const batch = batches.find(b => b.batchcode === selectedCode);
            await traceService.create({
                batch_id:    batch?.id || batch?._id || selectedCode,
                step:        String(logs.length + 1),
                title:       form.title,
                description: form.description,
                location:    form.location,
                date:        new Date(form.date).toISOString(),
            });
            setForm({ title:'', description:'', location:'', date:new Date().toISOString().slice(0,10) });
            setShowForm(false);
            loadLogs(selectedCode);
        } catch { alert('Lỗi khi lưu!'); }
        finally { setSaving(false); }
    };

    const filtered = batches.filter(b =>
        !search || (b.batchcode||'').toLowerCase().includes(search.toLowerCase()) ||
        (b.productid||'').toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-white" style={{ fontFamily:'Syne,sans-serif' }}>📋 Nhật ký truy xuất</h1>
                    <p className="text-sm mt-1" style={{ color:'rgba(255,255,255,0.35)' }}>Thêm và quản lý nhật ký hành trình lô hàng</p>
                </div>
                {selectedCode && (
                    <button onClick={()=>setShowForm(true)}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all"
                            style={{ background:'linear-gradient(135deg,#6366f1,#818cf8)', boxShadow:'0 4px 16px rgba(129,140,248,0.35)' }}>
                        <Plus size={15}/> Thêm nhật ký
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Left: Batch selector */}
                <div className="space-y-3">
                    <div className="rounded-2xl overflow-hidden" style={{ background:'rgba(4,5,16,0.7)', border:'1px solid rgba(255,255,255,0.07)' }}>
                        <div className="p-4" style={{ borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
                            <h3 className="font-black text-white text-sm mb-3" style={{ fontFamily:'Syne,sans-serif' }}>Chọn lô hàng</h3>
                            <div className="relative">
                                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color:'rgba(255,255,255,0.3)' }}/>
                                <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Tìm lô hàng..."
                                       className="w-full pl-8 pr-3 py-2 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none"
                                       style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)' }}/>
                            </div>
                        </div>
                        <div className="max-h-80 overflow-y-auto" style={{ scrollbarWidth:'none' }}>
                            {filtered.length === 0 ? (
                                <p className="p-6 text-center text-xs" style={{ color:'rgba(255,255,255,0.25)' }}>Không có lô hàng</p>
                            ) : filtered.map(b => (
                                <button key={b._id} onClick={()=>handleSelect(b.batchcode)}
                                        className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-white/[0.03]"
                                        style={{ borderBottom:'1px solid rgba(255,255,255,0.04)', background:selectedCode===b.batchcode?'rgba(129,140,248,0.08)':'transparent' }}>
                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-black flex-shrink-0"
                                         style={{ background:`linear-gradient(135deg,#6366f1,#818cf8)` }}>
                                        {(b.productid||'B').charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold text-white truncate">{b.batchcode}</p>
                                        <p className="text-[10px] truncate" style={{ color:'rgba(255,255,255,0.3)' }}>{b.productid}</p>
                                    </div>
                                    {selectedCode===b.batchcode && <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background:'#818cf8' }}/>}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Add form */}
                    {showForm && (
                        <div className="rounded-2xl p-4 space-y-3" style={{ background:'rgba(4,5,16,0.7)', border:'1px solid rgba(129,140,248,0.2)' }}>
                            <div className="flex items-center justify-between mb-1">
                                <h3 className="font-black text-white text-sm" style={{ fontFamily:'Syne,sans-serif' }}>➕ Thêm bước</h3>
                                <button onClick={()=>setShowForm(false)} style={{ color:'rgba(255,255,255,0.4)' }}><X size={15}/></button>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold uppercase tracking-wider block mb-1.5" style={{ color:'rgba(255,255,255,0.3)' }}>Bước *</label>
                                <select value={form.title} onChange={e=>setForm({...form,title:e.target.value})}
                                        className="w-full px-3 py-2 rounded-xl text-xs text-white focus:outline-none"
                                        style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)' }}>
                                    <option value="">-- Chọn bước --</option>
                                    {STEPS.map(s=><option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold uppercase tracking-wider block mb-1.5" style={{ color:'rgba(255,255,255,0.3)' }}>Địa điểm</label>
                                <input value={form.location} onChange={e=>setForm({...form,location:e.target.value})}
                                       placeholder="VD: Kho lạnh Cái Bè"
                                       className="w-full px-3 py-2 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none"
                                       style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)' }}/>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold uppercase tracking-wider block mb-1.5" style={{ color:'rgba(255,255,255,0.3)' }}>Ngày *</label>
                                <input type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})}
                                       className="w-full px-3 py-2 rounded-xl text-xs text-white focus:outline-none"
                                       style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)' }}/>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold uppercase tracking-wider block mb-1.5" style={{ color:'rgba(255,255,255,0.3)' }}>Mô tả *</label>
                                <textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})}
                                          rows={3} placeholder="Mô tả chi tiết..."
                                          className="w-full px-3 py-2 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none resize-none"
                                          style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)' }}/>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={()=>setShowForm(false)}
                                        className="flex-1 py-2 rounded-xl text-xs font-bold"
                                        style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', color:'rgba(255,255,255,0.5)' }}>
                                    Hủy
                                </button>
                                <button onClick={handleAdd} disabled={saving||!form.title||!form.description}
                                        className="flex-1 py-2 rounded-xl text-xs font-bold text-white disabled:opacity-50"
                                        style={{ background:'linear-gradient(135deg,#6366f1,#818cf8)' }}>
                                    {saving ? 'Lưu...' : '💾 Lưu'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right: Timeline */}
                <div className="lg:col-span-2">
                    {!selectedCode ? (
                        <div className="rounded-2xl h-64 flex flex-col items-center justify-center"
                             style={{ background:'rgba(4,5,16,0.5)', border:'1px solid rgba(255,255,255,0.06)' }}>
                            <div className="text-4xl mb-3">📋</div>
                            <p className="text-sm font-semibold" style={{ color:'rgba(255,255,255,0.35)' }}>Chọn lô hàng để xem nhật ký</p>
                        </div>
                    ) : (
                        <div className="rounded-2xl overflow-hidden" style={{ background:'rgba(4,5,16,0.7)', border:'1px solid rgba(255,255,255,0.07)' }}>
                            <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
                                <div>
                                    <h3 className="font-black text-white text-sm" style={{ fontFamily:'Syne,sans-serif' }}>
                                        Hành trình lô <span style={{ color:'#818cf8' }}>{selectedCode}</span>
                                    </h3>
                                    <p className="text-[10px] mt-0.5" style={{ color:'rgba(255,255,255,0.3)' }}>{logs.length} bước đã ghi nhận</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={()=>loadLogs(selectedCode)}
                                            className="p-1.5 rounded-lg transition-colors"
                                            style={{ color:'rgba(255,255,255,0.4)' }}>
                                        <RefreshCw size={14} className={loadingLogs?'animate-spin':''}/>
                                    </button>
                                    <button onClick={()=>setShowForm(true)}
                                            className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-white"
                                            style={{ background:'linear-gradient(135deg,#6366f1,#818cf8)' }}>
                                        <Plus size={12}/> Thêm
                                    </button>
                                </div>
                            </div>

                            {loadingLogs ? (
                                <div className="p-8 text-center"><RefreshCw size={22} className="animate-spin mx-auto" style={{ color:'#818cf8' }}/></div>
                            ) : logs.length === 0 ? (
                                <div className="p-10 text-center">
                                    <div className="text-3xl mb-2">📋</div>
                                    <p className="text-sm" style={{ color:'rgba(255,255,255,0.3)' }}>Chưa có nhật ký. Nhấn "Thêm" để bắt đầu.</p>
                                </div>
                            ) : (
                                <div className="p-5 space-y-0">
                                    {logs.map((log,i) => {
                                        const color = STEP_COLOR[log.title] || '#818cf8';
                                        const isLast = i === logs.length - 1;
                                        return (
                                            <div key={log._id||i} className="flex gap-4">
                                                <div className="flex flex-col items-center flex-shrink-0">
                                                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-black shadow-lg"
                                                         style={{ background:`linear-gradient(135deg,${color},${color}70)`, boxShadow:`0 4px 12px ${color}35` }}>
                                                        {i+1}
                                                    </div>
                                                    {!isLast && <div className="w-0.5 flex-1 my-1.5" style={{ background:`linear-gradient(180deg,${color}40,rgba(255,255,255,0.04))` }}/>}
                                                </div>
                                                <div className={`flex-1 ${isLast?'pb-0':'pb-4'}`}>
                                                    <div className="rounded-xl p-4 hover:bg-white/[0.02] transition-colors"
                                                         style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)' }}>
                                                        <div className="flex items-start justify-between mb-2">
                                                            <span className="font-black text-white text-sm">{log.title || log.step}</span>
                                                            {log.date && (
                                                                <span className="flex items-center gap-1 text-[10px]" style={{ color:'rgba(255,255,255,0.3)' }}>
                                                                    <Clock size={10}/>{new Date(log.date).toLocaleDateString('vi-VN')}
                                                                </span>
                                                            )}
                                                        </div>
                                                        {log.description && <p className="text-xs leading-relaxed mb-2" style={{ color:'rgba(255,255,255,0.5)' }}>{log.description}</p>}
                                                        {log.location && (
                                                            <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full"
                                                                  style={{ background:'rgba(56,189,248,0.08)', color:'#7dd3fc', border:'1px solid rgba(56,189,248,0.12)' }}>
                                                                <MapPin size={9}/>{log.location}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}