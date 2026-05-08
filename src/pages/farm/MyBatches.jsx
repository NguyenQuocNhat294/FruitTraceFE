    // src/pages/farm/MyBatches.jsx
    import React, { useState, useEffect } from 'react';
    import { Link } from 'react-router-dom';
    import {
        Plus, Search, Package, Truck, CheckCircle, RefreshCw,
        QrCode, Eye, Sprout, AlertTriangle, Calendar, Weight,
        LayoutGrid, List, Download, Filter, ChevronDown, X
    } from 'lucide-react';
    import { batchService } from '../../services/batchService';
    import { farmService }  from '../../services/farmService';
    import { useAuth } from '../../hooks/useAuth';

    // ── Status config ──
    const STATUS = {
        available: { label:'Có sẵn',       color:'#22c55e', bg:'rgba(34,197,94,0.12)',  border:'rgba(34,197,94,0.25)',  icon:<Sprout size={11}/>     },
        harvested: { label:'Thu hoạch',    color:'#fbbf24', bg:'rgba(251,191,36,0.12)', border:'rgba(251,191,36,0.25)', icon:<CheckCircle size={11}/> },
        shipping:  { label:'Vận chuyển',   color:'#38bdf8', bg:'rgba(56,189,248,0.12)', border:'rgba(56,189,248,0.25)', icon:<Truck size={11}/>       },
        sold:      { label:'Đã bán',       color:'#a78bfa', bg:'rgba(167,139,250,0.12)',border:'rgba(167,139,250,0.25)',icon:<CheckCircle size={11}/> },
    };

    // ── Card view ──
    const BatchCard = ({ batch }) => {
        const s = STATUS[batch.status] || STATUS.available;
        const now = new Date();
        const daysLeft = batch.expirydate
            ? Math.ceil((new Date(batch.expirydate) - now) / 86400000) : null;
        const isExpiringSoon = daysLeft !== null && daysLeft <= 7 && daysLeft >= 0;
        const isExpired      = daysLeft !== null && daysLeft < 0;

        return (
            <div className="rounded-2xl overflow-hidden group transition-all hover:-translate-y-0.5 hover:shadow-2xl"
                style={{ background:'rgba(4,9,20,0.7)', border:`1px solid rgba(255,255,255,0.07)`, backdropFilter:'blur(12px)' }}>

                {/* Top bar */}
                <div className="h-1 w-full" style={{ background:`linear-gradient(90deg,${s.color}80,${s.color},${s.color}80)` }}/>

                <div className="p-5">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-black text-base flex-shrink-0 shadow-lg"
                                style={{ background:`linear-gradient(135deg,${s.color},${s.color}70)`, boxShadow:`0 4px 16px ${s.color}30` }}>
                                {(batch.productid||'B').charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h3 className="font-black text-white text-sm leading-tight">{batch.productid}</h3>
                                <p className="text-[10px] font-mono mt-0.5" style={{ color:'rgba(255,255,255,0.35)' }}>{batch.batchcode}</p>
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-1.5">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold"
                                style={{ background:s.bg, color:s.color, border:`1px solid ${s.border}` }}>
                                {s.icon} {s.label}
                            </span>
                            {isExpired && (
                                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                                    style={{ background:'rgba(239,68,68,0.15)', color:'#f87171', border:'1px solid rgba(239,68,68,0.3)' }}>
                                    ⛔ Hết hạn
                                </span>
                            )}
                            {isExpiringSoon && !isExpired && (
                                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                                    style={{ background:'rgba(251,191,36,0.12)', color:'#fbbf24', border:'1px solid rgba(251,191,36,0.25)' }}>
                                    ⚠ {daysLeft}d
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Stats grid */}
                    <div className="grid grid-cols-3 gap-2 py-3 mb-4 rounded-xl px-2"
                        style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.05)' }}>
                        {[
                            { icon:<Weight size={11}/>,   label:'Số lượng', value: batch.quantitykg ? `${batch.quantitykg}kg` : '—' },
                            { icon:<Calendar size={11}/>, label:'Thu hoạch', value: batch.harvestdate ? new Date(batch.harvestdate).toLocaleDateString('vi-VN') : '—' },
                            { icon:<Calendar size={11}/>, label:'Hết hạn',   value: batch.expirydate  ? new Date(batch.expirydate).toLocaleDateString('vi-VN')  : '—' },
                        ].map((item,i) => (
                            <div key={i} className="text-center">
                                <div className="flex justify-center mb-1" style={{ color:'rgba(255,255,255,0.2)' }}>{item.icon}</div>
                                <p className="text-[8px] uppercase tracking-wider mb-0.5" style={{ color:'rgba(255,255,255,0.25)' }}>{item.label}</p>
                                <p className="text-[11px] font-bold text-white">{item.value}</p>
                            </div>
                        ))}
                    </div>

                    {/* Farm tag */}
                    <div className="flex items-center gap-1.5 mb-4 text-[10px]" style={{ color:'rgba(255,255,255,0.25)' }}>
                        <Package size={10}/>
                        <span>Farm: {batch.farmid}</span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                        <Link to={`/trace?code=${batch.batchcode}`}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all"
                            style={{ background:'rgba(56,189,248,0.08)', border:'1px solid rgba(56,189,248,0.2)', color:'#38bdf8' }}
                            onMouseEnter={e=>e.currentTarget.style.background='rgba(56,189,248,0.15)'}
                            onMouseLeave={e=>e.currentTarget.style.background='rgba(56,189,248,0.08)'}>
                            <Eye size={12}/> Truy xuất
                        </Link>
                        <Link to="/farm/qr"
                            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all"
                            style={{ background:'rgba(167,139,250,0.08)', border:'1px solid rgba(167,139,250,0.2)', color:'#a78bfa' }}
                            onMouseEnter={e=>e.currentTarget.style.background='rgba(167,139,250,0.15)'}
                            onMouseLeave={e=>e.currentTarget.style.background='rgba(167,139,250,0.08)'}>
                            <QrCode size={12}/> Tạo QR
                        </Link>
                    </div>
                </div>
            </div>
        );
    };

    // ── List row view ──
    const BatchRow = ({ batch }) => {
        const s = STATUS[batch.status] || STATUS.available;
        const daysLeft = batch.expirydate
            ? Math.ceil((new Date(batch.expirydate) - new Date()) / 86400000) : null;
        return (
            <div className="flex items-center gap-4 px-5 py-3.5 group transition-colors hover:bg-white/[0.03]"
                style={{ borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-black text-xs flex-shrink-0"
                    style={{ background:`linear-gradient(135deg,${s.color},${s.color}70)` }}>
                    {(batch.productid||'B').charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{batch.batchcode}</span>
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                            style={{ background:s.bg, color:s.color, border:`1px solid ${s.border}` }}>
                            {s.label}
                        </span>
                    </div>
                    <span className="text-xs" style={{ color:'rgba(255,255,255,0.3)' }}>{batch.productid} · {batch.farmid}</span>
                </div>
                <div className="hidden md:block text-xs text-center" style={{ color:'rgba(255,255,255,0.4)', minWidth:60 }}>
                    {batch.quantitykg}kg
                </div>
                <div className="hidden lg:block text-xs text-center" style={{ color:'rgba(255,255,255,0.4)', minWidth:80 }}>
                    {batch.harvestdate ? new Date(batch.harvestdate).toLocaleDateString('vi-VN') : '—'}
                </div>
                <div className="hidden lg:block text-xs text-center" style={{ minWidth:80 }}>
                    {daysLeft !== null && (
                        <span style={{ color: daysLeft < 0 ? '#f87171' : daysLeft <= 7 ? '#fbbf24' : 'rgba(255,255,255,0.4)' }}>
                            {daysLeft < 0 ? 'Hết hạn' : `${daysLeft}d`}
                        </span>
                    )}
                </div>
                <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link to={`/trace?code=${batch.batchcode}`}
                        className="w-7 h-7 rounded-lg flex items-center justify-center"
                        style={{ background:'rgba(56,189,248,0.1)', color:'#38bdf8' }}>
                        <Eye size={12}/>
                    </Link>
                    <Link to="/farm/qr"
                        className="w-7 h-7 rounded-lg flex items-center justify-center"
                        style={{ background:'rgba(167,139,250,0.1)', color:'#a78bfa' }}>
                        <QrCode size={12}/>
                    </Link>
                </div>
            </div>
        );
    };

    // ── Main ──
    export default function MyBatches() {
        const { user } = useAuth();
        const [batches, setBatches]       = useState([]);
        const [loading, setLoading]       = useState(true);
        const [search, setSearch]         = useState('');
        const [statusFilter, setStatus]   = useState('');
        const [farmFilter, setFarmFilter] = useState('');
        const [myFarms, setMyFarms]       = useState([]);
        const [viewMode, setViewMode]     = useState('grid'); // grid | list
        const [sortBy, setSortBy]         = useState('newest');
        const [showSort, setShowSort]     = useState(false);

        const loadData = async () => {
            if (!user) return;
            setLoading(true);
            try {
                const farmRes = await farmService.getAll();
                const farms   = (farmRes.data||[]).filter(f => f.OwnerId === user.id);
                setMyFarms(farms);

                const results = await Promise.all(
                    farms.map(f => batchService.getAll({ farmid: f.id }).catch(()=>({ data:[] })))
                );
                const seen = new Set(), all = [];
                results.forEach(r => (r.data||[]).forEach(b => {
                    if (!seen.has(b._id)) { seen.add(b._id); all.push(b); }
                }));
                setBatches(all);
            } catch { setBatches([]); }
            finally { setLoading(false); }
        };

        useEffect(() => { loadData(); }, [user?.id]);

        // Filter + Sort
        const filtered = batches
            .filter(b =>
                (!search || (b.batchcode||'').toLowerCase().includes(search.toLowerCase()) || (b.productid||'').toLowerCase().includes(search.toLowerCase())) &&
                (!statusFilter || b.status === statusFilter) &&
                (!farmFilter || b.farmid === farmFilter)
            )
            .sort((a,b) => {
                if (sortBy === 'newest')   return new Date(b.harvestdate||0) - new Date(a.harvestdate||0);
                if (sortBy === 'oldest')   return new Date(a.harvestdate||0) - new Date(b.harvestdate||0);
                if (sortBy === 'expiry')   return new Date(a.expirydate||0)  - new Date(b.expirydate||0);
                if (sortBy === 'quantity') return (b.quantitykg||0) - (a.quantitykg||0);
                return 0;
            });

        // Alerts
        const expiring = batches.filter(b => {
            if (!b.expirydate) return false;
            const d = Math.ceil((new Date(b.expirydate)-new Date())/86400000);
            return d >= 0 && d <= 7;
        });

        const stats = [
            { label:'Tổng lô',      value:batches.length,                                   icon:<Package size={18}/>,     color:'#38bdf8' },
            { label:'Vận chuyển',   value:batches.filter(b=>b.status==='shipping').length,  icon:<Truck size={18}/>,       color:'#22c55e' },
            { label:'Thu hoạch',    value:batches.filter(b=>b.status==='harvested').length, icon:<Sprout size={18}/>,      color:'#fbbf24' },
            { label:'Sắp hết hạn',  value:expiring.length,                                  icon:<AlertTriangle size={18}/>, color:'#f87171' },
        ];

        const SORT_OPTIONS = [
            { val:'newest',   label:'Mới nhất' },
            { val:'oldest',   label:'Cũ nhất'  },
            { val:'expiry',   label:'Hết hạn sớm' },
            { val:'quantity', label:'Số lượng' },
        ];

        return (
            <div className="space-y-5">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-white" style={{ fontFamily:'Syne,sans-serif' }}>📦 Lô hàng của tôi</h1>
                        <p className="text-sm mt-1" style={{ color:'rgba(255,255,255,0.35)' }}>
                            {myFarms.length} farm · {batches.length} lô hàng
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={loadData}
                                className="p-2.5 rounded-xl transition-all"
                                style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', color:'rgba(255,255,255,0.5)' }}>
                            <RefreshCw size={16} className={loading?'animate-spin':''}/>
                        </button>
                        <Link to="/farm/qr"
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:brightness-110"
                            style={{ background:'linear-gradient(135deg,#16a34a,#22c55e)', boxShadow:'0 4px 16px rgba(34,197,94,0.35)' }}>
                            <Plus size={16}/> Tạo lô hàng
                        </Link>
                    </div>
                </div>

                {/* Expiry alerts */}
                {expiring.length > 0 && (
                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium"
                        style={{ background:'rgba(251,191,36,0.08)', border:'1px solid rgba(251,191,36,0.2)', color:'#fde68a' }}>
                        <AlertTriangle size={15} className="flex-shrink-0"/>
                        <span>{expiring.length} lô hàng sắp hết hạn trong 7 ngày: {expiring.map(b=>b.batchcode).join(', ')}</span>
                    </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {stats.map((s,i) => (
                        <div key={i} className="rounded-2xl p-4 relative overflow-hidden group hover:bg-white/[0.03] transition-all cursor-default"
                            style={{ background:'rgba(4,9,20,0.7)', border:'1px solid rgba(255,255,255,0.07)' }}>
                            <div className="absolute top-0 left-0 right-0 h-px"
                                style={{ background:`linear-gradient(90deg,transparent,${s.color}50,transparent)` }}/>
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
                                style={{ background:`${s.color}15`, border:`1px solid ${s.color}25`, color:s.color }}>
                                {s.icon}
                            </div>
                            <div className="text-2xl font-black text-white" style={{ fontFamily:'Syne,sans-serif' }}>
                                {loading ? '—' : s.value}
                            </div>
                            <div className="text-xs mt-0.5" style={{ color:'rgba(255,255,255,0.35)' }}>{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* Toolbar */}
                <div className="flex flex-wrap gap-3 items-center">
                    {/* Search */}
                    <div className="relative flex-1 min-w-[200px]">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color:'rgba(255,255,255,0.3)' }}/>
                        <input value={search} onChange={e=>setSearch(e.target.value)}
                            placeholder="Tìm mã lô, sản phẩm..."
                            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none transition-all"
                            style={{ background:'rgba(4,9,20,0.7)', border:'1px solid rgba(255,255,255,0.08)' }}/>
                        {search && (
                            <button onClick={()=>setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color:'rgba(255,255,255,0.3)' }}>
                                <X size={13}/>
                            </button>
                        )}
                    </div>

                    {/* Status tabs */}
                    <div className="flex gap-1.5 flex-wrap">
                        {[
                            { val:'', label:'Tất cả', count:batches.length },
                            { val:'available', label:'Có sẵn',    count:batches.filter(b=>b.status==='available').length },
                            { val:'harvested', label:'Thu hoạch', count:batches.filter(b=>b.status==='harvested').length },
                            { val:'shipping',  label:'Vận chuyển',count:batches.filter(b=>b.status==='shipping').length  },
                            { val:'sold',      label:'Đã bán',    count:batches.filter(b=>b.status==='sold').length      },
                        ].map(f => (
                            <button key={f.val} onClick={()=>setStatus(f.val)}
                                    className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
                                    style={ statusFilter===f.val
                                        ? { background:'rgba(34,197,94,0.15)', border:'1px solid rgba(34,197,94,0.3)', color:'#4ade80' }
                                        : { background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)', color:'rgba(255,255,255,0.35)' }
                                    }>
                                {f.label} <span className="ml-1 opacity-60">{f.count}</span>
                            </button>
                        ))}
                    </div>

                    {/* Farm filter */}
                    {myFarms.length > 1 && (
                        <select value={farmFilter} onChange={e=>setFarmFilter(e.target.value)}
                                className="px-3 py-2 rounded-xl text-xs font-bold text-white focus:outline-none"
                                style={{ background:'rgba(4,9,20,0.7)', border:'1px solid rgba(255,255,255,0.08)' }}>
                            <option value="">Tất cả farm</option>
                            {myFarms.map(f => <option key={f.id} value={f.id}>{f.FarmName} ({f.id})</option>)}
                        </select>
                    )}

                    {/* Sort */}
                    <div className="relative">
                        <button onClick={()=>setShowSort(!showSort)}
                                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all"
                                style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)', color:'rgba(255,255,255,0.5)' }}>
                            <Filter size={12}/> {SORT_OPTIONS.find(s=>s.val===sortBy)?.label} <ChevronDown size={11}/>
                        </button>
                        {showSort && (
                            <div className="absolute right-0 top-full mt-1.5 w-40 rounded-xl overflow-hidden z-10 shadow-2xl"
                                style={{ background:'rgba(4,9,20,0.97)', border:'1px solid rgba(255,255,255,0.08)' }}>
                                {SORT_OPTIONS.map(o=>(
                                    <button key={o.val} onClick={()=>{ setSortBy(o.val); setShowSort(false); }}
                                            className="w-full text-left px-4 py-2.5 text-xs font-semibold transition-colors"
                                            style={{ color: sortBy===o.val ? '#4ade80' : 'rgba(255,255,255,0.5)', background: sortBy===o.val ? 'rgba(34,197,94,0.08)' : 'transparent' }}>
                                        {o.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* View toggle */}
                    <div className="flex rounded-xl overflow-hidden" style={{ border:'1px solid rgba(255,255,255,0.07)' }}>
                        {[
                            { mode:'grid', icon:<LayoutGrid size={14}/> },
                            { mode:'list', icon:<List size={14}/> },
                        ].map(v => (
                            <button key={v.mode} onClick={()=>setViewMode(v.mode)}
                                    className="px-3 py-2 transition-all"
                                    style={{ background: viewMode===v.mode ? 'rgba(34,197,94,0.15)' : 'transparent', color: viewMode===v.mode ? '#4ade80' : 'rgba(255,255,255,0.3)' }}>
                                {v.icon}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Results */}
                {loading ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {[...Array(4)].map((_,i) => (
                            <div key={i} className="rounded-2xl h-52 animate-pulse"
                                style={{ background:'rgba(4,9,20,0.5)', border:'1px solid rgba(255,255,255,0.05)' }}/>
                        ))}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="rounded-2xl py-16 text-center"
                        style={{ background:'rgba(4,9,20,0.5)', border:'1px solid rgba(255,255,255,0.05)' }}>
                        <Package size={40} className="mx-auto mb-3" style={{ color:'rgba(255,255,255,0.1)' }}/>
                        <p className="text-sm font-semibold mb-1" style={{ color:'rgba(255,255,255,0.4)' }}>
                            {search||statusFilter||farmFilter ? 'Không tìm thấy lô hàng phù hợp' : 'Chưa có lô hàng nào'}
                        </p>
                        {(search||statusFilter||farmFilter) && (
                            <button onClick={()=>{ setSearch(''); setStatus(''); setFarmFilter(''); }}
                                    className="text-xs font-bold mt-2" style={{ color:'#4ade80' }}>
                                Xóa bộ lọc
                            </button>
                        )}
                    </div>
                ) : viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                        {filtered.map(b => <BatchCard key={b._id} batch={b}/>)}
                    </div>
                ) : (
                    <div className="rounded-2xl overflow-hidden"
                        style={{ background:'rgba(4,9,20,0.7)', border:'1px solid rgba(255,255,255,0.07)' }}>
                        {/* List header */}
                        <div className="grid px-5 py-3 text-[10px] font-black uppercase tracking-wider"
                            style={{ gridTemplateColumns:'1fr auto auto auto auto', borderBottom:'1px solid rgba(255,255,255,0.05)', color:'rgba(255,255,255,0.25)' }}>
                            <span>Lô hàng</span>
                            <span className="hidden md:block w-16 text-center">KG</span>
                            <span className="hidden lg:block w-24 text-center">Thu hoạch</span>
                            <span className="hidden lg:block w-20 text-center">Còn lại</span>
                            <span className="w-20 text-center">Hành động</span>
                        </div>
                        {filtered.map(b => <BatchRow key={b._id} batch={b}/>)}
                    </div>
                )}

                {/* Footer */}
                {filtered.length > 0 && (
                    <p className="text-center text-xs" style={{ color:'rgba(255,255,255,0.25)' }}>
                        Hiển thị <span className="font-bold text-white">{filtered.length}</span> / {batches.length} lô hàng
                        {(statusFilter||farmFilter||search) && ' (đang lọc)'}
                    </p>
                )}
            </div>
        );
    }