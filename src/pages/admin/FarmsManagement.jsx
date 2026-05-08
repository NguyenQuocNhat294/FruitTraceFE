// src/pages/admin/FarmsManagement.jsx
import React, { useState, useEffect } from 'react';
import { Search, MapPin, User, Plus, RefreshCw, Award, X } from 'lucide-react';
import { farmService } from '../../services/farmService';
import { FarmImage } from '../../components/common/ImageDisplay';

const CERT_COLOR = {
    'VietGAP':   { color:'#22c55e', bg:'rgba(34,197,94,0.12)',   border:'rgba(34,197,94,0.25)'   },
    'GlobalGAP': { color:'#38bdf8', bg:'rgba(56,189,248,0.12)',  border:'rgba(56,189,248,0.25)'  },
    'Organic':   { color:'#a78bfa', bg:'rgba(167,139,250,0.12)', border:'rgba(167,139,250,0.25)' },
};

const FarmsManagement = () => {
    const [farms, setFarms]       = useState([]);
    const [loading, setLoading]   = useState(true);
    const [search, setSearch]     = useState('');
    const [certFilter, setCert]   = useState('');
    const [selected, setSelected] = useState(null);

    const load = async () => {
        setLoading(true);
        try { const r = await farmService.getAll(); setFarms(r.data || []); }
        catch {} finally { setLoading(false); }
    };
    useEffect(() => { load(); }, []);

    const filtered = farms.filter(f =>
        (!search || (f.FarmName||'').toLowerCase().includes(search.toLowerCase()) || (f.province||'').toLowerCase().includes(search.toLowerCase())) &&
        (!certFilter || f.certification === certFilter)
    );

    const certs = [...new Set(farms.map(f => f.certification).filter(Boolean))];

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white" style={{ fontFamily:'Syne,sans-serif' }}>🌾 Nông trại</h1>
                    <p className="text-sm mt-1" style={{ color:'rgba(255,255,255,0.35)' }}>
                        Danh sách {farms.length} nông trại trong hệ thống
                    </p>
                </div>
                <button onClick={load}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all"
                        style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', color:'rgba(255,255,255,0.6)' }}>
                    <RefreshCw size={15} className={loading?'animate-spin':''}/> Làm mới
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
                {[
                    { label:'Tổng nông trại', value:farms.length,   color:'#38bdf8' },
                    { label:'VietGAP',        value:farms.filter(f=>f.certification==='VietGAP').length,   color:'#22c55e' },
                    { label:'GlobalGAP',      value:farms.filter(f=>f.certification==='GlobalGAP').length, color:'#38bdf8' },
                ].map((s,i) => (
                    <div key={i} className="rounded-2xl p-4 text-center"
                         style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)' }}>
                        <div className="text-2xl font-black" style={{ color:s.color, fontFamily:'Syne,sans-serif' }}>{s.value}</div>
                        <div className="text-xs mt-0.5" style={{ color:'rgba(255,255,255,0.3)' }}>{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
                <div className="relative flex-1 min-w-[200px]">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color:'rgba(255,255,255,0.3)' }}/>
                    <input value={search} onChange={e=>setSearch(e.target.value)}
                           placeholder="Tìm tên vườn, tỉnh thành..."
                           className="w-full pl-9 pr-8 py-2.5 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none"
                           style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)' }}/>
                    {search && <button onClick={()=>setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color:'rgba(255,255,255,0.3)' }}><X size={13}/></button>}
                </div>
                <div className="flex gap-1.5">
                    <button onClick={()=>setCert('')}
                            className="px-3 py-2 rounded-xl text-xs font-bold transition-all"
                            style={ !certFilter
                                ? { background:'rgba(56,189,248,0.15)', border:'1px solid rgba(56,189,248,0.3)', color:'#38bdf8' }
                                : { background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)', color:'rgba(255,255,255,0.4)' }
                            }>Tất cả</button>
                    {certs.map(c => {
                        const cc = CERT_COLOR[c] || CERT_COLOR.VietGAP;
                        return (
                            <button key={c} onClick={()=>setCert(c)}
                                    className="px-3 py-2 rounded-xl text-xs font-bold transition-all"
                                    style={ certFilter===c
                                        ? { background:cc.bg, border:`1px solid ${cc.border}`, color:cc.color }
                                        : { background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)', color:'rgba(255,255,255,0.4)' }
                                    }>{c}</button>
                        );
                    })}
                </div>
            </div>

            {/* Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(6)].map((_,i) => (
                        <div key={i} className="rounded-2xl h-64 animate-pulse"
                             style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.06)' }}/>
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <div className="rounded-2xl py-16 text-center"
                     style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)' }}>
                    <div className="text-4xl mb-3">🌾</div>
                    <p className="text-sm" style={{ color:'rgba(255,255,255,0.35)' }}>Không tìm thấy nông trại nào</p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filtered.map(farm => {
                            const cc = CERT_COLOR[farm.certification] || CERT_COLOR.VietGAP;
                            return (
                                <div key={farm._id}
                                     onClick={() => setSelected(farm)}
                                     className="rounded-2xl overflow-hidden cursor-pointer group transition-all hover:-translate-y-1 hover:shadow-2xl"
                                     style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)' }}>

                                    {/* Image */}
                                    <div className="h-44 overflow-hidden relative">
                                        <FarmImage imageStr={farm.image} alt={farm.FarmName}
                                                   className="w-full h-44 group-hover:scale-105 transition-transform duration-500"/>
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"/>
                                        {farm.certification && (
                                            <div className="absolute top-3 right-3">
                                                <span className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-black"
                                                      style={{ background:'rgba(0,0,0,0.6)', color:cc.color, backdropFilter:'blur(8px)' }}>
                                                    <Award size={9}/>{farm.certification}
                                                </span>
                                            </div>
                                        )}
                                        <div className="absolute bottom-3 left-3">
                                            <h3 className="font-black text-white text-sm drop-shadow-lg">{farm.FarmName}</h3>
                                        </div>
                                    </div>

                                    {/* Info */}
                                    <div className="p-4">
                                        <div className="space-y-2 text-xs" style={{ color:'rgba(255,255,255,0.45)' }}>
                                            <div className="flex items-center gap-2">
                                                <MapPin size={11} style={{ color:'#38bdf8', flexShrink:0 }}/>
                                                {farm.district ? `${farm.district}, ` : ''}{farm.province}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <User size={11} style={{ color:'#22c55e', flexShrink:0 }}/>
                                                {farm.OwnerId}
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between mt-3 pt-3"
                                             style={{ borderTop:'1px solid rgba(255,255,255,0.06)' }}>
                                            <span className="text-xs font-bold px-2 py-1 rounded-lg"
                                                  style={{ background:cc.bg, color:cc.color, border:`1px solid ${cc.border}` }}>
                                                {farm.certification || 'N/A'}
                                            </span>
                                            <span className="text-xs font-bold" style={{ color:'rgba(255,255,255,0.4)' }}>
                                                📐 {farm.AreaHectare} ha
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <p className="text-xs text-center" style={{ color:'rgba(255,255,255,0.25)' }}>
                        Hiển thị <span className="font-bold text-white">{filtered.length}</span> / {farms.length} nông trại
                    </p>
                </>
            )}

            {/* Detail Modal */}
            {selected && (
                <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                     onClick={()=>setSelected(null)}>
                    <div className="w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl"
                         style={{ background:'rgba(6,12,20,0.98)', border:'1px solid rgba(255,255,255,0.1)' }}
                         onClick={e=>e.stopPropagation()}>
                        <div className="h-1.5" style={{ background:'linear-gradient(90deg,#16a34a,#22c55e,#38bdf8)' }}/>

                        <div className="h-52 overflow-hidden relative">
                            <FarmImage imageStr={selected.image} alt={selected.FarmName} className="w-full h-52"/>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"/>
                            <button onClick={()=>setSelected(null)}
                                    className="absolute top-3 right-3 p-2 rounded-xl transition-colors"
                                    style={{ background:'rgba(0,0,0,0.5)', color:'white' }}>
                                <X size={16}/>
                            </button>
                            <div className="absolute bottom-4 left-4">
                                <h2 className="text-xl font-black text-white" style={{ fontFamily:'Syne,sans-serif' }}>{selected.FarmName}</h2>
                                <p className="text-sm" style={{ color:'rgba(255,255,255,0.6)' }}>{selected.id || selected._id}</p>
                            </div>
                        </div>

                        <div className="p-5">
                            <div className="grid grid-cols-2 gap-3 mb-4">
                                {[
                                    { label:'Tỉnh/Thành', value:`${selected.district?selected.district+', ':''}${selected.province}`, icon:'📍' },
                                    { label:'Chủ vườn',   value:selected.OwnerId,        icon:'👤' },
                                    { label:'Diện tích',  value:`${selected.AreaHectare} ha`, icon:'📐' },
                                    { label:'Chứng nhận', value:selected.certification||'N/A', icon:'🏅' },
                                    { label:'Địa chỉ',   value:selected.address||'—',    icon:'🏠' },
                                    { label:'Farm ID',    value:selected.id||'—',         icon:'🔑' },
                                ].map((item,i) => (
                                    <div key={i} className="p-3 rounded-xl"
                                         style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.06)' }}>
                                        <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color:'rgba(255,255,255,0.3)' }}>
                                            {item.icon} {item.label}
                                        </p>
                                        <p className="text-sm font-bold text-white truncate">{item.value}</p>
                                    </div>
                                ))}
                            </div>
                            <button onClick={()=>setSelected(null)}
                                    className="w-full py-2.5 rounded-xl text-sm font-bold transition-all"
                                    style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.08)', color:'rgba(255,255,255,0.6)' }}>
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FarmsManagement;