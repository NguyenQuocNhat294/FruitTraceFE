// src/pages/staff/StaffBatchesPage.jsx
import React, { useState, useEffect } from 'react';
import { Search, RefreshCw, FlaskConical, CheckCircle, Truck, Sprout, X, AlertTriangle, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { batchService } from '../../services/batchService';
import { traceService }  from '../../services/traceService';

const STATUS = {
    available: { label:'Có sẵn',     color:'#22c55e', bg:'rgba(34,197,94,0.12)',   border:'rgba(34,197,94,0.25)'   },
    harvested: { label:'Thu hoạch',  color:'#fbbf24', bg:'rgba(251,191,36,0.12)',  border:'rgba(251,191,36,0.25)'  },
    shipping:  { label:'Vận chuyển', color:'#38bdf8', bg:'rgba(56,189,248,0.12)',  border:'rgba(56,189,248,0.25)'  },
    sold:      { label:'Đã bán',     color:'#a78bfa', bg:'rgba(167,139,250,0.12)', border:'rgba(167,139,250,0.25)' },
};

const RESULTS = ['✅ Đạt tiêu chuẩn','⚠️ Đạt có điều kiện','❌ Không đạt'];

const fmt = d => d ? new Date(d).toLocaleDateString('vi-VN') : '—';

export default function StaffBatchesPage() {
    const [batches, setBatches]     = useState([]);
    const [loading, setLoading]     = useState(true);
    const [search, setSearch]       = useState('');
    const [statusFilter, setStatus] = useState('');
    const [inspecting, setInspect]  = useState(null);
    const [result, setResult]       = useState(RESULTS[0]);
    const [note, setNote]           = useState('');
    const [location, setLocation]   = useState('Trạm QC');
    const [saving, setSaving]       = useState(false);

    const load = () => {
        setLoading(true);
        batchService.getAll().then(r=>setBatches(r.data||[])).catch(()=>{}).finally(()=>setLoading(false));
    };
    useEffect(()=>{ load(); },[]);

    const filtered = batches.filter(b =>
        (!search || [b.batchcode,b.productid,b.farmid].some(f=>(f||'').toLowerCase().includes(search.toLowerCase()))) &&
        (!statusFilter || b.status === statusFilter)
    );

    const handleInspect = async () => {
        if (!note.trim()) return alert('Vui lòng nhập ghi chú!');
        setSaving(true);
        try {
            await traceService.create({
                batch_id:    inspecting.id || inspecting._id,
                step:        '5',
                title:       'Kiểm định',
                description: `${result} — ${note}`,
                location,
                date:        new Date().toISOString(),
            });
            if (result === RESULTS[0]) {
                await batchService.update(inspecting._id, { status:'shipping' });
            }
            setInspect(null); setNote(''); load();
        } catch { alert('Lỗi khi lưu!'); }
        finally { setSaving(false); }
    };

    const pending = batches.filter(b=>b.status==='available').length;

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-3xl font-black text-white" style={{ fontFamily:'Syne,sans-serif' }}>🔬 Kiểm định lô hàng</h1>
                    <p className="text-sm mt-1" style={{ color:'rgba(255,255,255,0.35)' }}>Xem và kiểm định chất lượng lô hàng</p>
                </div>
                <button onClick={load}
                        className="p-2.5 rounded-xl transition-all"
                        style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', color:'rgba(255,255,255,0.5)' }}>
                    <RefreshCw size={16} className={loading?'animate-spin':''}/>
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                    { label:'Cần kiểm định', value:pending, color:'#818cf8', icon:<FlaskConical size={18}/> },
                    { label:'Vận chuyển',    value:batches.filter(b=>b.status==='shipping').length,  color:'#38bdf8', icon:<Truck size={18}/> },
                    { label:'Đã bán',        value:batches.filter(b=>b.status==='sold').length,      color:'#a78bfa', icon:<CheckCircle size={18}/> },
                    { label:'Tổng lô',       value:batches.length, color:'#22c55e', icon:<Sprout size={18}/> },
                ].map((s,i)=>(
                    <div key={i} className="rounded-2xl p-4 relative overflow-hidden"
                         style={{ background:'rgba(4,5,16,0.7)', border:'1px solid rgba(255,255,255,0.07)' }}>
                        <div className="absolute top-0 left-0 right-0 h-px"
                             style={{ background:`linear-gradient(90deg,transparent,${s.color}50,transparent)` }}/>
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
                             style={{ background:`${s.color}15`, color:s.color }}>{s.icon}</div>
                        <div className="text-2xl font-black text-white" style={{ fontFamily:'Syne,sans-serif' }}>{loading?'—':s.value}</div>
                        <div className="text-xs mt-0.5" style={{ color:'rgba(255,255,255,0.3)' }}>{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Pending alert */}
            {pending > 0 && (
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm"
                     style={{ background:'rgba(129,140,248,0.08)', border:'1px solid rgba(129,140,248,0.2)', color:'#c4b5fd' }}>
                    <AlertTriangle size={15} className="flex-shrink-0"/>
                    Có <strong className="mx-1">{pending}</strong> lô hàng đang chờ kiểm định
                </div>
            )}

            {/* Table */}
            <div className="rounded-2xl overflow-hidden" style={{ background:'rgba(4,5,16,0.7)', border:'1px solid rgba(255,255,255,0.07)' }}>
                {/* Toolbar */}
                <div className="flex flex-wrap gap-3 p-4" style={{ borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
                    <div className="relative flex-1 min-w-[200px]">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color:'rgba(255,255,255,0.3)' }}/>
                        <input value={search} onChange={e=>setSearch(e.target.value)}
                               placeholder="Tìm mã lô, sản phẩm..."
                               className="w-full pl-9 pr-8 py-2.5 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none"
                               style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)' }}/>
                        {search && <button onClick={()=>setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color:'rgba(255,255,255,0.3)' }}><X size={13}/></button>}
                    </div>
                    <div className="flex gap-1.5">
                        {[{val:'',label:'Tất cả'},{val:'available',label:'Cần KĐ'},{val:'shipping',label:'Vận chuyển'},{val:'sold',label:'Đã bán'}].map(f=>(
                            <button key={f.val} onClick={()=>setStatus(f.val)}
                                    className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
                                    style={ statusFilter===f.val
                                        ? { background:'rgba(129,140,248,0.15)', border:'1px solid rgba(129,140,248,0.3)', color:'#a78bfa' }
                                        : { background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)', color:'rgba(255,255,255,0.4)' }
                                    }>{f.label}</button>
                        ))}
                    </div>
                </div>

                <table className="w-full text-sm">
                    <thead>
                    <tr style={{ borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
                        {['Mã lô','Sản phẩm','Nông trại','Số lượng','Thu hoạch','Hết hạn','Trạng thái','Hành động'].map(h=>(
                            <th key={h} className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-wider" style={{ color:'rgba(255,255,255,0.25)' }}>{h}</th>
                        ))}
                    </tr>
                    </thead>
                    <tbody>
                    {loading ? [...Array(5)].map((_,i)=>(
                        <tr key={i} style={{ borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
                            {[...Array(8)].map((_,j)=>(
                                <td key={j} className="px-4 py-4"><div className="h-3 rounded animate-pulse" style={{ background:'rgba(255,255,255,0.06)', width:'70px' }}/></td>
                            ))}
                        </tr>
                    )) : filtered.map(batch => {
                        const s = STATUS[batch.status] || STATUS.available;
                        const daysLeft = batch.expirydate ? Math.ceil((new Date(batch.expirydate)-new Date())/86400000) : null;
                        return (
                            <tr key={batch._id} className="hover:bg-white/[0.02] transition-colors group"
                                style={{ borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
                                <td className="px-4 py-3.5 font-mono font-bold text-white">{batch.batchcode}</td>
                                <td className="px-4 py-3.5" style={{ color:'rgba(255,255,255,0.7)' }}>{batch.productid}</td>
                                <td className="px-4 py-3.5 text-xs" style={{ color:'rgba(255,255,255,0.4)' }}>{batch.farmid}</td>
                                <td className="px-4 py-3.5 font-bold text-white">{batch.quantitykg}kg</td>
                                <td className="px-4 py-3.5 text-xs" style={{ color:'rgba(255,255,255,0.4)' }}>{fmt(batch.harvestdate)}</td>
                                <td className="px-4 py-3.5 text-xs">
                                        <span style={{ color: daysLeft!==null&&daysLeft<0?'#f87171':daysLeft!==null&&daysLeft<=7?'#fbbf24':'rgba(255,255,255,0.4)' }}>
                                            {daysLeft!==null&&daysLeft<0?'⛔ Hết hạn':daysLeft!==null&&daysLeft<=7?`⚠ ${daysLeft}d`:fmt(batch.expirydate)}
                                        </span>
                                </td>
                                <td className="px-4 py-3.5">
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold"
                                              style={{ background:s.bg, color:s.color, border:`1px solid ${s.border}` }}>
                                            {s.label}
                                        </span>
                                </td>
                                <td className="px-4 py-3.5">
                                    <div className="flex gap-2">
                                        {batch.status === 'available' && (
                                            <button onClick={()=>{ setInspect(batch); setNote(''); setResult(RESULTS[0]); }}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                                                    style={{ background:'rgba(129,140,248,0.12)', color:'#a78bfa', border:'1px solid rgba(129,140,248,0.25)' }}>
                                                <FlaskConical size={12}/> Kiểm định
                                            </button>
                                        )}
                                        <Link to={`/trace?code=${batch.batchcode}`}
                                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold opacity-0 group-hover:opacity-100 transition-all"
                                              style={{ background:'rgba(56,189,248,0.08)', color:'#38bdf8', border:'1px solid rgba(56,189,248,0.15)' }}>
                                            <Eye size={12}/>
                                        </Link>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                    </tbody>
                </table>

                {!loading && filtered.length === 0 && (
                    <div className="py-12 text-center" style={{ color:'rgba(255,255,255,0.25)' }}>
                        <FlaskConical size={32} className="mx-auto mb-2 opacity-30"/>
                        Không tìm thấy lô hàng nào
                    </div>
                )}

                <div className="px-5 py-3" style={{ borderTop:'1px solid rgba(255,255,255,0.05)' }}>
                    <span className="text-xs" style={{ color:'rgba(255,255,255,0.25)' }}>Hiển thị {filtered.length}/{batches.length} lô hàng</span>
                </div>
            </div>

            {/* Inspect Modal */}
            {inspecting && (
                <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="w-full max-w-md rounded-2xl overflow-hidden shadow-2xl"
                         style={{ background:'rgba(4,5,16,0.98)', border:'1px solid rgba(129,140,248,0.2)' }}>
                        <div className="h-1" style={{ background:'linear-gradient(90deg,#6366f1,#818cf8,#c084fc)' }}/>
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-5">
                                <div>
                                    <h3 className="font-black text-white text-lg" style={{ fontFamily:'Syne,sans-serif' }}>🔬 Kiểm định lô hàng</h3>
                                    <p className="text-xs mt-0.5 font-mono" style={{ color:'#a78bfa' }}>{inspecting.batchcode} · {inspecting.productid}</p>
                                </div>
                                <button onClick={()=>setInspect(null)} style={{ color:'rgba(255,255,255,0.4)' }}><X size={18}/></button>
                            </div>

                            <div className="space-y-4">
                                {/* Batch summary */}
                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { label:'Số lượng', value:`${inspecting.quantitykg}kg` },
                                        { label:'Thu hoạch', value:fmt(inspecting.harvestdate) },
                                        { label:'Hết hạn',   value:fmt(inspecting.expirydate) },
                                    ].map((item,i)=>(
                                        <div key={i} className="p-2.5 rounded-xl text-center"
                                             style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.06)' }}>
                                            <p className="text-[9px] uppercase tracking-wider mb-1" style={{ color:'rgba(255,255,255,0.3)' }}>{item.label}</p>
                                            <p className="text-xs font-bold text-white">{item.value}</p>
                                        </div>
                                    ))}
                                </div>

                                {/* Result */}
                                <div>
                                    <label className="text-xs font-bold uppercase tracking-wider block mb-2" style={{ color:'rgba(255,255,255,0.4)' }}>Kết quả kiểm định *</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {RESULTS.map(r=>(
                                            <button key={r} onClick={()=>setResult(r)}
                                                    className="py-2 px-2 rounded-xl text-xs font-bold transition-all text-center"
                                                    style={ result===r
                                                        ? { background:'rgba(129,140,248,0.2)', border:'1px solid rgba(129,140,248,0.4)', color:'#c4b5fd' }
                                                        : { background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)', color:'rgba(255,255,255,0.4)' }
                                                    }>{r}</button>
                                        ))}
                                    </div>
                                </div>

                                {/* Location */}
                                <div>
                                    <label className="text-xs font-bold uppercase tracking-wider block mb-1.5" style={{ color:'rgba(255,255,255,0.4)' }}>Địa điểm</label>
                                    <input value={location} onChange={e=>setLocation(e.target.value)}
                                           className="w-full px-4 py-2.5 rounded-xl text-sm text-white focus:outline-none"
                                           style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)' }}/>
                                </div>

                                {/* Note */}
                                <div>
                                    <label className="text-xs font-bold uppercase tracking-wider block mb-1.5" style={{ color:'rgba(255,255,255,0.4)' }}>Ghi chú *</label>
                                    <textarea value={note} onChange={e=>setNote(e.target.value)} rows={3}
                                              placeholder="Nhập kết quả kiểm tra dư lượng thuốc, chất lượng..."
                                              className="w-full px-4 py-2.5 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none resize-none"
                                              style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)' }}/>
                                </div>
                            </div>

                            <div className="flex gap-3 mt-5">
                                <button onClick={()=>setInspect(null)}
                                        className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all"
                                        style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', color:'rgba(255,255,255,0.5)' }}>
                                    Hủy
                                </button>
                                <button onClick={handleInspect} disabled={saving||!note.trim()}
                                        className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-50"
                                        style={{ background:'linear-gradient(135deg,#6366f1,#818cf8)', boxShadow:'0 4px 16px rgba(129,140,248,0.35)' }}>
                                    {saving ? 'Đang lưu...' : '✅ Xác nhận'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}