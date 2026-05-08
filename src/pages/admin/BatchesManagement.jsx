// src/pages/admin/BatchesManagement.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Package, Search, RefreshCw, Eye, Sprout, Truck,
    CheckCircle, X, Filter, ArrowUpDown, Plus, AlertTriangle
} from 'lucide-react';
import { batchService } from '../../services/batchService';

const STATUS = {
    available: { label:'Có sẵn',       color:'#22c55e', bg:'rgba(34,197,94,0.12)',   border:'rgba(34,197,94,0.25)',   icon:<Sprout size={11}/>     },
    harvested: { label:'Thu hoạch',    color:'#fbbf24', bg:'rgba(251,191,36,0.12)',  border:'rgba(251,191,36,0.25)',  icon:<CheckCircle size={11}/> },
    shipping:  { label:'Vận chuyển',   color:'#38bdf8', bg:'rgba(56,189,248,0.12)',  border:'rgba(56,189,248,0.25)',  icon:<Truck size={11}/>       },
    sold:      { label:'Đã bán',       color:'#a78bfa', bg:'rgba(167,139,250,0.12)', border:'rgba(167,139,250,0.25)', icon:<CheckCircle size={11}/> },
    completed: { label:'Hoàn tất',     color:'#94a3b8', bg:'rgba(148,163,184,0.1)',  border:'rgba(148,163,184,0.2)',  icon:<CheckCircle size={11}/> },
};

const fmt = (d) => d ? new Date(d).toLocaleDateString('vi-VN') : '—';

export default function BatchesManagement() {
    const [batches, setBatches]     = useState([]);
    const [loading, setLoading]     = useState(true);
    const [search, setSearch]       = useState('');
    const [statusFilter, setStatus] = useState('');
    const [sortBy, setSortBy]       = useState('newest');
    const [showSort, setShowSort]   = useState(false);
    const [selected, setSelected]   = useState(new Set());

    const load = () => {
        setLoading(true);
        batchService.getAll()
            .then(r => setBatches(r.data || []))
            .catch(() => {})
            .finally(() => setLoading(false));
    };
    useEffect(() => { load(); }, []);

    const filtered = batches
        .filter(b =>
            (!search || [b.batchcode, b.productid, b.farmid].some(f => (f||'').toLowerCase().includes(search.toLowerCase()))) &&
            (!statusFilter || b.status === statusFilter)
        )
        .sort((a, b) => {
            if (sortBy === 'newest')   return new Date(b.harvestdate||0) - new Date(a.harvestdate||0);
            if (sortBy === 'oldest')   return new Date(a.harvestdate||0) - new Date(b.harvestdate||0);
            if (sortBy === 'expiry')   return new Date(a.expirydate||0)  - new Date(b.expirydate||0);
            if (sortBy === 'quantity') return (b.quantitykg||0) - (a.quantitykg||0);
            return 0;
        });

    // Expiry alerts
    const expiring = batches.filter(b => {
        if (!b.expirydate) return false;
        const d = Math.ceil((new Date(b.expirydate) - new Date()) / 86400000);
        return d >= 0 && d <= 7;
    });

    const toggleSelect = (id) => setSelected(prev => {
        const n = new Set(prev);
        n.has(id) ? n.delete(id) : n.add(id);
        return n;
    });
    const toggleAll = () => setSelected(prev => prev.size === filtered.length ? new Set() : new Set(filtered.map(b => b._id)));

    const SORTS = [
        { val:'newest',   label:'Mới nhất'     },
        { val:'oldest',   label:'Cũ nhất'      },
        { val:'expiry',   label:'Hết hạn sớm'  },
        { val:'quantity', label:'Số lượng nhiều nhất' },
    ];

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white" style={{ fontFamily:'Syne,sans-serif' }}>📦 Lô hàng</h1>
                    <p className="text-sm mt-1" style={{ color:'rgba(255,255,255,0.35)' }}>Quản lý toàn bộ lô hàng trên hệ thống</p>
                </div>
                <button onClick={load}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all"
                        style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', color:'rgba(255,255,255,0.6)' }}>
                    <RefreshCw size={15} className={loading?'animate-spin':''}/>
                    Làm mới
                </button>
            </div>

            {/* Alert */}
            {expiring.length > 0 && (
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium"
                     style={{ background:'rgba(251,191,36,0.08)', border:'1px solid rgba(251,191,36,0.2)', color:'#fde68a' }}>
                    <AlertTriangle size={15} className="flex-shrink-0"/>
                    {expiring.length} lô sắp hết hạn trong 7 ngày: {expiring.map(b=>b.batchcode).join(', ')}
                </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                {[
                    { label:'Tổng lô',    value:batches.length, color:'#38bdf8' },
                    ...Object.entries(STATUS).slice(0,4).map(([k,v]) => ({
                        label: v.label,
                        value: batches.filter(b=>b.status===k).length,
                        color: v.color
                    }))
                ].map((s,i) => (
                    <div key={i} className="rounded-2xl p-4 text-center cursor-pointer transition-all hover:bg-white/[0.03]"
                         style={{ background:'rgba(255,255,255,0.03)', border:`1px solid ${i===0?'rgba(255,255,255,0.07)':STATUS[Object.keys(STATUS)[i-1]]?.border||'rgba(255,255,255,0.07)'}` }}
                         onClick={()=>setStatus(i===0?'':Object.keys(STATUS)[i-1])}>
                        <div className="text-2xl font-black" style={{ fontFamily:'Syne,sans-serif', color:s.color }}>{s.value}</div>
                        <div className="text-[10px] mt-0.5" style={{ color:'rgba(255,255,255,0.3)' }}>{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Toolbar */}
            <div className="rounded-2xl overflow-hidden" style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)' }}>
                <div className="flex flex-wrap gap-3 p-4 items-center" style={{ borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
                    {/* Search */}
                    <div className="relative flex-1 min-w-[200px]">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color:'rgba(255,255,255,0.3)' }}/>
                        <input value={search} onChange={e=>setSearch(e.target.value)}
                               placeholder="Tìm mã lô, sản phẩm, nông trại..."
                               className="w-full pl-9 pr-8 py-2.5 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none"
                               style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)' }}/>
                        {search && <button onClick={()=>setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color:'rgba(255,255,255,0.3)' }}><X size={13}/></button>}
                    </div>

                    {/* Status */}
                    <div className="flex gap-1.5 flex-wrap">
                        {[{val:'',label:'Tất cả'},...Object.entries(STATUS).map(([k,v])=>({val:k,label:v.label}))].map(f=>(
                            <button key={f.val} onClick={()=>setStatus(f.val)}
                                    className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
                                    style={ statusFilter===f.val
                                        ? { background:'rgba(56,189,248,0.15)', border:'1px solid rgba(56,189,248,0.3)', color:'#38bdf8' }
                                        : { background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)', color:'rgba(255,255,255,0.4)' }
                                    }>{f.label}</button>
                        ))}
                    </div>

                    {/* Sort */}
                    <div className="relative">
                        <button onClick={()=>setShowSort(!showSort)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold"
                                style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)', color:'rgba(255,255,255,0.4)' }}>
                            <ArrowUpDown size={12}/>{SORTS.find(s=>s.val===sortBy)?.label}
                        </button>
                        {showSort && (
                            <div className="absolute right-0 top-full mt-1 w-44 rounded-xl overflow-hidden z-10 shadow-2xl"
                                 style={{ background:'rgba(4,9,20,0.98)', border:'1px solid rgba(255,255,255,0.08)' }}>
                                {SORTS.map(s=>(
                                    <button key={s.val} onClick={()=>{ setSortBy(s.val); setShowSort(false); }}
                                            className="w-full text-left px-4 py-2.5 text-xs font-semibold transition-colors"
                                            style={{ color:sortBy===s.val?'#38bdf8':'rgba(255,255,255,0.5)', background:sortBy===s.val?'rgba(56,189,248,0.08)':'transparent' }}>
                                        {s.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <span className="text-xs ml-auto" style={{ color:'rgba(255,255,255,0.25)' }}>
                        {selected.size > 0 ? `${selected.size} đã chọn` : `${filtered.length} lô hàng`}
                    </span>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                        <tr style={{ borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
                            <th className="px-4 py-3">
                                <input type="checkbox" checked={selected.size===filtered.length&&filtered.length>0}
                                       onChange={toggleAll} className="rounded accent-sky-500"/>
                            </th>
                            {['Mã lô','Sản phẩm','Nông trại','Số lượng','Thu hoạch','Hết hạn','Trạng thái',''].map(h=>(
                                <th key={h} className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-wider"
                                    style={{ color:'rgba(255,255,255,0.25)' }}>{h}</th>
                            ))}
                        </tr>
                        </thead>
                        <tbody>
                        {loading ? [...Array(6)].map((_,i)=>(
                            <tr key={i} style={{ borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
                                {[...Array(9)].map((_,j)=>(
                                    <td key={j} className="px-4 py-4">
                                        <div className="h-3 rounded animate-pulse" style={{ background:'rgba(255,255,255,0.06)', width:`${[30,60,50,40,60,60,70,70,40][j]}px` }}/>
                                    </td>
                                ))}
                            </tr>
                        )) : filtered.length === 0 ? (
                            <tr><td colSpan={9} className="px-4 py-12 text-center" style={{ color:'rgba(255,255,255,0.25)' }}>
                                <Package size={32} className="mx-auto mb-2 opacity-30"/>
                                Không tìm thấy lô hàng
                            </td></tr>
                        ) : filtered.map(batch => {
                            const s = STATUS[batch.status] || STATUS.available;
                            const daysLeft = batch.expirydate ? Math.ceil((new Date(batch.expirydate)-new Date())/86400000) : null;
                            const isExpiring = daysLeft !== null && daysLeft <= 7 && daysLeft >= 0;
                            const isExp = daysLeft !== null && daysLeft < 0;
                            return (
                                <tr key={batch._id}
                                    className="transition-colors hover:bg-white/[0.02] group"
                                    style={{ borderBottom:'1px solid rgba(255,255,255,0.04)', background:selected.has(batch._id)?'rgba(56,189,248,0.05)':'transparent' }}>
                                    <td className="px-4 py-3.5">
                                        <input type="checkbox" checked={selected.has(batch._id)} onChange={()=>toggleSelect(batch._id)} className="rounded accent-sky-500"/>
                                    </td>
                                    <td className="px-4 py-3.5">
                                        <span className="font-mono font-bold text-white text-sm">{batch.batchcode}</span>
                                    </td>
                                    <td className="px-4 py-3.5 text-sm" style={{ color:'rgba(255,255,255,0.7)' }}>{batch.productid}</td>
                                    <td className="px-4 py-3.5 text-xs" style={{ color:'rgba(255,255,255,0.4)' }}>{batch.farmid}</td>
                                    <td className="px-4 py-3.5 text-sm font-semibold text-white">{batch.quantitykg}kg</td>
                                    <td className="px-4 py-3.5 text-xs" style={{ color:'rgba(255,255,255,0.4)' }}>{fmt(batch.harvestdate)}</td>
                                    <td className="px-4 py-3.5">
                                            <span className="text-xs font-bold" style={{ color: isExp?'#f87171':isExpiring?'#fbbf24':'rgba(255,255,255,0.4)' }}>
                                                {isExp ? '⛔ Hết hạn' : isExpiring ? `⚠ ${daysLeft}d` : fmt(batch.expirydate)}
                                            </span>
                                    </td>
                                    <td className="px-4 py-3.5">
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold"
                                                  style={{ background:s.bg, color:s.color, border:`1px solid ${s.border}` }}>
                                                {s.icon} {s.label}
                                            </span>
                                    </td>
                                    <td className="px-4 py-3.5">
                                        <Link to={`/admin/batches/${batch._id}`}
                                              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold opacity-0 group-hover:opacity-100 transition-all"
                                              style={{ background:'rgba(56,189,248,0.1)', color:'#38bdf8', border:'1px solid rgba(56,189,248,0.2)' }}>
                                            <Eye size={12}/> Chi tiết
                                        </Link>
                                    </td>
                                </tr>
                            );
                        })}
                        </tbody>
                    </table>
                </div>

                {/* Footer */}
                <div className="px-5 py-3 flex items-center justify-between" style={{ borderTop:'1px solid rgba(255,255,255,0.05)' }}>
                    <span className="text-xs" style={{ color:'rgba(255,255,255,0.25)' }}>
                        Hiển thị {filtered.length}/{batches.length} lô hàng
                    </span>
                    {selected.size > 0 && (
                        <button className="text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
                                style={{ background:'rgba(239,68,68,0.1)', color:'#f87171', border:'1px solid rgba(239,68,68,0.2)' }}>
                            Xóa {selected.size} lô đã chọn
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}