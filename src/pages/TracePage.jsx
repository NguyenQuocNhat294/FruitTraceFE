// src/pages/TracePage.jsx
import React, { useState, useEffect, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
    Search, Package, MapPin, Calendar, CheckCircle,
    Truck, Sprout, FlaskConical, Box, ArrowRight,
    Clock, Weight, Building2, ShieldCheck, ImageIcon,
    QrCode, ChevronRight, X, ZoomIn, Home, Droplets,
    Star, Award
} from "lucide-react";
import { batchService }   from "../services/batchService";
import { traceService }   from "../services/traceService";
import { productService } from "../services/productService";
import { farmService }    from "../services/farmService";

/* ── Step config — bao gồm cả tiếng Anh từ DB ── */
const STEPS = {
    // Vietnamese
    "Chuẩn bị đất": { icon:<Sprout size={15}/>,      color:'#22c55e', label:'Chuẩn bị đất' },
    "Xuống giống":  { icon:<Sprout size={15}/>,      color:'#86efac', label:'Xuống giống'  },
    "Bón phân":     { icon:<FlaskConical size={15}/>, color:'#fbbf24', label:'Bón phân'    },
    "Tưới nước":    { icon:<Droplets size={15}/>,    color:'#38bdf8', label:'Tưới nước'   },
    "Chăm sóc":     { icon:<Sprout size={15}/>,      color:'#34d399', label:'Chăm sóc'    },
    "Phun thuốc":   { icon:<FlaskConical size={15}/>, color:'#f97316', label:'Phun thuốc'  },
    "Thu hoạch":    { icon:<Package size={15}/>,      color:'#10b981', label:'Thu hoạch'   },
    "Kiểm định":    { icon:<CheckCircle size={15}/>,  color:'#38bdf8', label:'Kiểm định'   },
    "Đóng gói":     { icon:<Box size={15}/>,          color:'#818cf8', label:'Đóng gói'    },
    "Xuất kho":     { icon:<Truck size={15}/>,        color:'#f59e0b', label:'Xuất kho'    },
    "Vận chuyển":   { icon:<Truck size={15}/>,        color:'#f97316', label:'Vận chuyển'  },
    "Giao hàng":    { icon:<Truck size={15}/>,        color:'#22c55e', label:'Giao hàng'   },
    // English keys from DB
    "fertilizer":   { icon:<FlaskConical size={15}/>, color:'#fbbf24', label:'Bón phân'    },
    "watering":     { icon:<Droplets size={15}/>,    color:'#38bdf8', label:'Tưới nước'   },
    "harvest":      { icon:<Package size={15}/>,      color:'#10b981', label:'Thu hoạch'   },
    "transport":    { icon:<Truck size={15}/>,        color:'#f97316', label:'Vận chuyển'  },
    "inspection":   { icon:<CheckCircle size={15}/>,  color:'#818cf8', label:'Kiểm định'   },
    "packaging":    { icon:<Box size={15}/>,          color:'#818cf8', label:'Đóng gói'    },
};

const getStep = (log) => STEPS[log.title] || STEPS[log.step] || { icon:<CheckCircle size={15}/>, color:'#94a3b8', label: log.title || log.step };

const getQuality = (expirydate) => {
    if (!expirydate) return { text:"Không rõ", color:'#94a3b8', bg:'rgba(148,163,184,0.12)', border:'rgba(148,163,184,0.2)' };
    const diff = (new Date(expirydate) - new Date()) / 86400000;
    if (diff < 0)  return { text:"⛔ Hết hạn",    color:'#f87171', bg:'rgba(239,68,68,0.12)',  border:'rgba(239,68,68,0.25)'  };
    if (diff < 3)  return { text:"⚠ Sắp hết hạn", color:'#fbbf24', bg:'rgba(251,191,36,0.12)', border:'rgba(251,191,36,0.25)' };
    if (diff < 30) return { text:"✓ Còn tươi",    color:'#34d399', bg:'rgba(52,211,153,0.12)', border:'rgba(52,211,153,0.25)' };
    return               { text:"✓ Tốt",           color:'#22c55e', bg:'rgba(34,197,94,0.12)',  border:'rgba(34,197,94,0.25)'  };
};

const useDevProxy = import.meta.env.DEV && !import.meta.env.VITE_API_BASE_URL?.trim?.()
const BASE = useDevProxy ? '' : (import.meta.env.VITE_API_BASE_URL?.replace(/\/api\/?$/,'') || 'http://localhost:5000');
const imgUrl = (p) => !p ? null : p.startsWith('http') ? p : p.startsWith('/') ? `${BASE}${p}` : `${BASE}/images/${p}`;

/* ── Lightbox ── */
const Lightbox = ({ src, onClose }) => (
    <div className="fixed inset-0 bg-black/92 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
        <button className="absolute top-4 right-4 p-2 rounded-full text-white hover:bg-white/10" onClick={onClose}><X size={20}/></button>
        <img src={src} alt="" className="max-w-full max-h-[85vh] rounded-2xl object-contain" onClick={e=>e.stopPropagation()}/>
    </div>
);

/* ── Timeline step ── */
const TimelineStep = ({ log, index, isLast }) => {
    const [lb, setLb] = useState(false);
    const cfg   = getStep(log);
    const color = cfg.color;
    const src   = imgUrl(log.image);

    return (
        <div className="flex gap-4">
            <div className="flex flex-col items-center flex-shrink-0">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-lg"
                     style={{ background:`linear-gradient(135deg,${color},${color}80)`, boxShadow:`0 4px 16px ${color}40` }}>
                    {cfg.icon}
                </div>
                {!isLast && <div className="w-0.5 flex-1 my-2" style={{ background:`linear-gradient(180deg,${color}50,rgba(255,255,255,0.03))` }}/>}
            </div>

            <div className={`flex-1 ${isLast?'pb-0':'pb-5'}`}>
                <div className="rounded-2xl p-5 transition-all hover:bg-white/[0.02]"
                     style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)' }}>
                    <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex items-center gap-2.5">
                            <span className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black text-white"
                                  style={{ background:`linear-gradient(135deg,${color},${color}70)` }}>
                                {index+1}
                            </span>
                            <h3 className="font-black text-white text-sm">{log.title || cfg.label}</h3>
                        </div>
                        {log.date && (
                            <span className="flex items-center gap-1 text-[11px] flex-shrink-0" style={{ color:'rgba(255,255,255,0.3)' }}>
                                <Clock size={10}/>{log.date}
                            </span>
                        )}
                    </div>

                    {log.description && (
                        <p className="text-sm leading-relaxed mb-3" style={{ color:'rgba(255,255,255,0.55)' }}>{log.description}</p>
                    )}

                    <div className="flex flex-wrap gap-2">
                        {log.location && (
                            <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full"
                                  style={{ background:'rgba(56,189,248,0.1)', color:'#7dd3fc', border:'1px solid rgba(56,189,248,0.15)' }}>
                                <MapPin size={10}/>{log.location}
                            </span>
                        )}
                        {log.actor_id && (
                            <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full"
                                  style={{ background:'rgba(255,255,255,0.05)', color:'rgba(255,255,255,0.4)', border:'1px solid rgba(255,255,255,0.08)' }}>
                                👤 {log.actor_id}
                            </span>
                        )}
                    </div>

                    {src && (
                        <div className="mt-4 relative group cursor-pointer rounded-xl overflow-hidden" onClick={()=>setLb(true)}>
                            <img src={src} alt={log.title} loading="lazy"
                                 className="w-full max-h-48 object-cover transition-transform duration-500 group-hover:scale-105"
                                 onError={e=>e.target.parentElement.style.display='none'}/>
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors flex items-center justify-center">
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-full bg-black/50">
                                    <ZoomIn size={18} className="text-white"/>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                {lb && src && <Lightbox src={src} onClose={()=>setLb(false)}/>}
            </div>
        </div>
    );
};

/* ════ MAIN ════ */
export default function TracePage() {
    const [searchParams]              = useSearchParams();
    const [searchCode, setSearchCode] = useState(searchParams.get('code') || '');
    const [batch,      setBatch]      = useState(null);
    const [product,    setProduct]    = useState(null);
    const [farm,       setFarm]       = useState(null);
    const [logs,       setLogs]       = useState([]);
    const [loading,    setLoading]    = useState(false);
    const [error,      setError]      = useState(null);
    const [searched,   setSearched]   = useState(false);
    const [lightbox,   setLightbox]   = useState(null);
    const inputRef                    = useRef();

    useEffect(() => {
        const code = searchParams.get('code');
        if (code) { setSearchCode(code); doSearch(code); }
    }, []);

    const doSearch = async (code) => {
        const q = (code || searchCode).trim();
        if (!q) return;
        setLoading(true); setError(null); setBatch(null); setProduct(null); setFarm(null); setLogs([]); setSearched(true);
        try {
            // 1. Lấy batch
            const br = await batchService.getByCode(q);
            const batchData = br.data;
            setBatch(batchData);

            // 2. Lấy trace logs
            const batchCustomId = batchData.id || batchData._id;
            const tr = await traceService.getByBatch(batchCustomId);
            setLogs(tr.data || []);

            // 3. Lấy tên sản phẩm thật
            try {
                const pr = await productService.getAll();
                const prod = (pr.data||[]).find(p =>
                    p.id === batchData.productid || p._id === batchData.productid
                );
                if (prod) setProduct(prod);
            } catch {}

            // 4. Lấy tên farm thật
            try {
                const fr = await farmService.getAll();
                const f = (fr.data||[]).find(f =>
                    f.id === batchData.farmid || f._id === batchData.farmid
                );
                if (f) setFarm(f);
            } catch {}

        } catch (e) {
            const st = e?.response?.status
            const msg = e?.response?.data?.message
            const noResponse = !e?.response
            if (noResponse) {
                setError(
                    'Không kết nối được máy chủ API. Nếu đang mở bằng IP Wi‑Fi (vd. 192.168.x.x), hãy chạy frontend với proxy (mặc định /api) và bật backend; hoặc đặt VITE_API_BASE_URL trỏ tới IP máy chủ :5000.'
                )
            } else if (st === 404) {
                setError(msg || 'Không có lô hàng này trong hệ thống. Kiểm tra mã hoặc tạo lô trên admin/farm.')
            } else {
                setError(msg || 'Không tìm thấy dữ liệu cho mã này. Vui lòng kiểm tra lại.')
            }
        } finally { setLoading(false); }
    };

    const handleSubmit = (e) => { e.preventDefault(); doSearch(); };
    const quality      = batch ? getQuality(batch.expirydate) : null;
    const progress     = Math.min(Math.round((logs.length / 8) * 100), 100);
    const images       = logs.filter(l => l.image && !l.image.includes('trace.jpg'));

    const STATUS_MAP = {
        available: { label:'Có sẵn',    color:'#22c55e', bg:'rgba(34,197,94,0.12)',   border:'rgba(34,197,94,0.25)'   },
        harvested: { label:'Thu hoạch', color:'#fbbf24', bg:'rgba(251,191,36,0.12)',  border:'rgba(251,191,36,0.25)'  },
        shipping:  { label:'Vận chuyển',color:'#38bdf8', bg:'rgba(56,189,248,0.12)',  border:'rgba(56,189,248,0.25)'  },
        sold:      { label:'Đã bán',    color:'#a78bfa', bg:'rgba(167,139,250,0.12)', border:'rgba(167,139,250,0.25)' },
    };
    const batchStatus = batch ? (STATUS_MAP[batch.status] || STATUS_MAP.available) : null;

    // Parse product image
    const productImg = product?.image
        ? imgUrl(product.image.split(',')[0].trim())
        : null;

    return (
        <div className="min-h-screen" style={{ background:'#060c14', fontFamily:"'DM Sans','Syne',system-ui,sans-serif" }}>

            {/* Background */}
            <div className="fixed inset-0 -z-10 pointer-events-none">
                <div className="absolute inset-0" style={{ background:'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(34,197,94,0.08) 0%, transparent 60%), #060c14' }}/>
                <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-[0.06]"
                     style={{ background:'radial-gradient(circle,#22c55e,transparent 70%)' }}/>
                <div className="absolute inset-0 opacity-[0.025]" style={{
                    backgroundImage:'linear-gradient(rgba(34,197,94,0.4) 1px,transparent 1px),linear-gradient(90deg,rgba(34,197,94,0.4) 1px,transparent 1px)',
                    backgroundSize:'48px 48px',
                    maskImage:'radial-gradient(ellipse at top, black 20%, transparent 70%)'
                }}/>
            </div>

            {/* Navbar */}
            <nav className="sticky top-0 z-30 h-14" style={{ background:'rgba(6,12,20,0.85)', borderBottom:'1px solid rgba(34,197,94,0.08)', backdropFilter:'blur(20px)' }}>
                <div className="max-w-5xl mx-auto h-full px-4 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background:'linear-gradient(135deg,#16a34a,#22c55e)' }}>
                            <span className="text-sm">🍊</span>
                        </div>
                        <span className="font-black text-white text-sm" style={{ fontFamily:'Syne,sans-serif' }}>FruitTrace</span>
                    </Link>
                    <Link to="/" className="flex items-center gap-1.5 text-xs font-semibold transition-colors"
                          style={{ color:'rgba(255,255,255,0.4)' }}
                          onMouseEnter={e=>e.currentTarget.style.color='#22c55e'}
                          onMouseLeave={e=>e.currentTarget.style.color='rgba(255,255,255,0.4)'}>
                        <Home size={13}/> Trang chủ
                    </Link>
                </div>
            </nav>

            {/* Hero search */}
            <div className="pt-16 pb-12 px-4">
                <div className="max-w-2xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-6"
                         style={{ background:'rgba(34,197,94,0.1)', border:'1px solid rgba(34,197,94,0.2)', color:'#4ade80' }}>
                        <ShieldCheck size={12}/> Xác minh nguồn gốc minh bạch 100%
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-white mb-3 leading-tight" style={{ fontFamily:'Syne,sans-serif' }}>
                        Truy xuất<br/>
                        <span style={{ background:'linear-gradient(135deg,#22c55e,#38bdf8)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
                            nguồn gốc
                        </span>
                    </h1>
                    <p className="text-sm mb-8" style={{ color:'rgba(255,255,255,0.4)' }}>
                        Nhập mã batch để xem toàn bộ hành trình sản phẩm từ nông trại đến tay bạn
                    </p>

                    <form onSubmit={handleSubmit}
                          className="flex gap-2 p-2 rounded-2xl"
                          style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', backdropFilter:'blur(12px)' }}>
                        <div className="relative flex-1">
                            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color:'rgba(255,255,255,0.3)' }}/>
                            <input ref={inputRef} value={searchCode} onChange={e=>setSearchCode(e.target.value)}
                                   placeholder="Nhập mã lô: BATCH-001..."
                                   className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none"
                                   style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.08)' }}
                                   autoFocus/>
                            {searchCode && (
                                <button type="button" onClick={()=>{ setSearchCode(''); setBatch(null); setProduct(null); setFarm(null); setLogs([]); setSearched(false); inputRef.current?.focus(); }}
                                        className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color:'rgba(255,255,255,0.3)' }}>
                                    <X size={14}/>
                                </button>
                            )}
                        </div>
                        <button type="submit" disabled={loading}
                                className="px-6 py-3 rounded-xl text-sm font-black text-white transition-all hover:brightness-110 disabled:opacity-60 flex items-center gap-2 flex-shrink-0"
                                style={{ background:'linear-gradient(135deg,#16a34a,#22c55e)', boxShadow:'0 4px 20px rgba(34,197,94,0.4)' }}>
                            {loading
                                ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                                : <><Search size={14}/> Tra cứu</>
                            }
                        </button>
                    </form>

                    <div className="flex flex-wrap gap-2 justify-center mt-4">
                        <span className="text-xs" style={{ color:'rgba(255,255,255,0.3)' }}>Thử:</span>
                        {['BATCH-001','BATCH-002','BATCH-003'].map(code => (
                            <button key={code} onClick={()=>{ setSearchCode(code); doSearch(code); }}
                                    className="px-3 py-1 rounded-full text-xs font-semibold transition-all"
                                    style={{ background:'rgba(34,197,94,0.08)', border:'1px solid rgba(34,197,94,0.15)', color:'#4ade80' }}
                                    onMouseEnter={e=>e.currentTarget.style.background='rgba(34,197,94,0.15)'}
                                    onMouseLeave={e=>e.currentTarget.style.background='rgba(34,197,94,0.08)'}>
                                {code}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-4 pb-16">

                {error && (
                    <div className="flex items-center gap-3 px-4 py-3.5 rounded-2xl mb-6 text-sm font-medium"
                         style={{ background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)', color:'#fca5a5' }}>
                        <ShieldCheck size={16} className="flex-shrink-0"/>{error}
                    </div>
                )}

                {loading && (
                    <div className="space-y-4">
                        {[1,2].map(i=>(
                            <div key={i} className="rounded-3xl h-36 animate-pulse" style={{ background:'rgba(255,255,255,0.04)' }}/>
                        ))}
                    </div>
                )}

                {/* Batch card */}
                {batch && !loading && (
                    <div className="rounded-3xl overflow-hidden mb-6"
                         style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)' }}>
                        <div className="h-1.5" style={{ background:'linear-gradient(90deg,#16a34a,#22c55e,#38bdf8)' }}/>

                        {/* Product image */}
                        {productImg && (
                            <div className="h-52 overflow-hidden relative cursor-pointer group" onClick={()=>setLightbox(productImg)}>
                                <img src={productImg} alt={product?.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                     onError={e=>e.target.parentElement.style.display='none'}/>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"/>
                                <div className="absolute bottom-4 left-5">
                                    <div className="text-white font-black text-2xl" style={{ fontFamily:'Syne,sans-serif', textShadow:'0 2px 8px rgba(0,0,0,0.5)' }}>
                                        {product?.name}
                                    </div>
                                    {product?.rating > 0 && (
                                        <div className="flex items-center gap-1 mt-1">
                                            {[...Array(5)].map((_,i)=>(
                                                <Star key={i} size={12} style={{ color:i<Math.round(product.rating)?'#fbbf24':'rgba(255,255,255,0.3)' }} fill={i<Math.round(product.rating)?'#fbbf24':'transparent'}/>
                                            ))}
                                            <span className="text-xs text-white ml-1">{product.rating}/5</span>
                                        </div>
                                    )}
                                </div>
                                <div className="absolute bottom-4 right-4 p-2 rounded-xl bg-black/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
                                    <ZoomIn size={16} className="text-white"/>
                                </div>
                            </div>
                        )}

                        <div className="p-6">
                            {/* Header */}
                            <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
                                <div>
                                    <h2 className="text-2xl font-black text-white" style={{ fontFamily:'Syne,sans-serif' }}>
                                        {product?.name || batch.productid}
                                    </h2>
                                    <p className="text-sm font-mono mt-0.5" style={{ color:'rgba(255,255,255,0.4)' }}>
                                        {batch.batchcode || searchCode}
                                        {product?.CategoryId && <span className="ml-2" style={{ color:'rgba(34,197,94,0.6)' }}>· {product.CategoryId}</span>}
                                    </p>
                                    {product?.description && (
                                        <p className="text-xs mt-1.5 max-w-md" style={{ color:'rgba(255,255,255,0.4)' }}>{product.description}</p>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 flex-wrap">
                                    {batchStatus && (
                                        <span className="px-3 py-1.5 rounded-full text-xs font-bold"
                                              style={{ background:batchStatus.bg, color:batchStatus.color, border:`1px solid ${batchStatus.border}` }}>
                                            {batchStatus.label}
                                        </span>
                                    )}
                                    <span className="px-3 py-1.5 rounded-full text-xs font-bold"
                                          style={{ background:quality.bg, color:quality.color, border:`1px solid ${quality.border}` }}>
                                        {quality.text}
                                    </span>
                                </div>
                            </div>

                            {/* Info grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                                {[
                                    { icon:<Weight size={14}/>,    label:'Khối lượng', val:`${batch.quantitykg||0} kg`, color:'#22c55e' },
                                    { icon:<Building2 size={14}/>, label:'Nông trại',  val:farm?.FarmName||batch.farmid||'—', color:'#38bdf8' },
                                    { icon:<Calendar size={14}/>,  label:'Thu hoạch',  val:batch.harvestdate ? new Date(batch.harvestdate).toLocaleDateString('vi-VN') : '—', color:'#fbbf24' },
                                    { icon:<Calendar size={14}/>,  label:'Hết hạn',    val:batch.expirydate  ? new Date(batch.expirydate).toLocaleDateString('vi-VN')  : '—', color:quality.color },
                                ].map((item,i)=>(
                                    <div key={i} className="rounded-xl p-3.5" style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.06)' }}>
                                        <div className="flex items-center gap-1.5 mb-1.5" style={{ color:item.color }}>
                                            {item.icon}
                                            <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color:'rgba(255,255,255,0.3)' }}>{item.label}</span>
                                        </div>
                                        <div className="text-sm font-bold text-white truncate">{item.val}</div>
                                    </div>
                                ))}
                            </div>

                            {/* Farm + Cert info */}
                            {farm && (
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {farm.province && (
                                        <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full"
                                              style={{ background:'rgba(56,189,248,0.08)', color:'#7dd3fc', border:'1px solid rgba(56,189,248,0.15)' }}>
                                            <MapPin size={10}/> {farm.province}
                                        </span>
                                    )}
                                    {farm.certification && (
                                        <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full"
                                              style={{ background:'rgba(34,197,94,0.08)', color:'#4ade80', border:'1px solid rgba(34,197,94,0.15)' }}>
                                            <Award size={10}/> {farm.certification}
                                        </span>
                                    )}
                                </div>
                            )}

                            {/* QR */}
                            <div className="flex items-center gap-3 px-4 py-3 rounded-xl"
                                 style={{ background:'rgba(34,197,94,0.06)', border:'1px solid rgba(34,197,94,0.12)' }}>
                                <QrCode size={16} style={{ color:'#4ade80' }}/>
                                <span className="text-sm" style={{ color:'rgba(255,255,255,0.5)' }}>
                                    Mã QR: <span className="font-mono font-bold text-white">{batch.batchcode || searchCode}</span>
                                </span>
                                {batch.qr_code && (
                                    <a href={batch.qr_code} target="_blank" rel="noreferrer"
                                       className="ml-auto flex items-center gap-1 text-xs font-bold"
                                       style={{ color:'#4ade80' }}>
                                        Xem QR <ChevronRight size={12}/>
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Progress */}
                {logs.length > 0 && (
                    <div className="rounded-2xl p-5 mb-6" style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)' }}>
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-black text-white text-sm" style={{ fontFamily:'Syne,sans-serif' }}>📊 Tiến trình hành trình</h3>
                            <span className="text-sm font-black" style={{ color:'#4ade80' }}>{logs.length}/8 bước · {progress}%</span>
                        </div>
                        <div className="h-2.5 rounded-full overflow-hidden" style={{ background:'rgba(255,255,255,0.06)' }}>
                            <div className="h-full rounded-full transition-all duration-1000"
                                 style={{ width:`${progress}%`, background:'linear-gradient(90deg,#16a34a,#22c55e,#38bdf8)', boxShadow:'0 0 12px rgba(34,197,94,0.5)' }}/>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-4">
                            {logs.map((log,i) => {
                                const cfg = getStep(log);
                                return (
                                    <span key={i} className="text-[10px] font-bold px-2.5 py-1 rounded-full"
                                          style={{ background:`${cfg.color}15`, color:cfg.color, border:`1px solid ${cfg.color}30` }}>
                                        ✓ {log.title || cfg.label}
                                    </span>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Timeline */}
                {!loading && logs.length > 0 && (
                    <div className="mb-8">
                        <h3 className="font-black text-white mb-5 flex items-center gap-2" style={{ fontFamily:'Syne,sans-serif' }}>
                            <span className="w-7 h-7 rounded-lg flex items-center justify-center"
                                  style={{ background:'rgba(34,197,94,0.12)', border:'1px solid rgba(34,197,94,0.2)' }}>
                                <ArrowRight size={14} style={{ color:'#22c55e' }}/>
                            </span>
                            Hành trình sản phẩm
                        </h3>
                        {logs.map((log,i) => (
                            <TimelineStep key={i} log={log} index={i} isLast={i===logs.length-1}/>
                        ))}
                    </div>
                )}

                {/* Image gallery — chỉ hiện nếu có ảnh thật */}
                {images.length > 0 && (
                    <div className="rounded-2xl p-5 mb-6" style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)' }}>
                        <h3 className="font-black text-white mb-4 flex items-center gap-2" style={{ fontFamily:'Syne,sans-serif' }}>
                            <ImageIcon size={15} style={{ color:'#22c55e' }}/> Hình ảnh ghi nhận
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {images.map((l,i) => {
                                const src = imgUrl(l.image);
                                return src ? (
                                    <div key={i} className="relative group cursor-pointer overflow-hidden rounded-xl aspect-square"
                                         onClick={()=>setLightbox(src)}>
                                        <img src={src} alt={l.title} loading="lazy"
                                             className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"/>
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors"/>
                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <ZoomIn size={20} className="text-white"/>
                                        </div>
                                        <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent translate-y-full group-hover:translate-y-0 transition-transform">
                                            <p className="text-[10px] text-white font-bold truncate">{l.title}</p>
                                        </div>
                                    </div>
                                ) : null;
                            })}
                        </div>
                    </div>
                )}

                {/* Empty states */}
                {!loading && !batch && searched && (
                    <div className="rounded-3xl py-16 text-center" style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)' }}>
                        <Search size={32} className="mx-auto mb-3 opacity-20 text-white"/>
                        <h3 className="font-black text-white mb-2">Không tìm thấy lô hàng</h3>
                        <p className="text-sm" style={{ color:'rgba(255,255,255,0.35)' }}>Vui lòng kiểm tra lại mã batch.</p>
                    </div>
                )}

                {!loading && !searched && (
                    <div className="rounded-3xl py-16 text-center" style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)' }}>
                        <div className="text-5xl mb-4">🍊</div>
                        <h3 className="font-black text-white mb-2" style={{ fontFamily:'Syne,sans-serif' }}>Nhập mã để tra cứu</h3>
                        <p className="text-sm" style={{ color:'rgba(255,255,255,0.35)' }}>Xem toàn bộ hành trình sản phẩm từ nông trại đến tay bạn</p>
                        <div className="grid grid-cols-3 gap-4 mt-8 max-w-md mx-auto">
                            {[{emoji:'🌾',label:'Nguồn gốc nông trại'},{emoji:'🔬',label:'Quy trình kiểm định'},{emoji:'🚚',label:'Lịch sử vận chuyển'}].map((f,i)=>(
                                <div key={i} className="p-4 rounded-2xl text-center"
                                     style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)' }}>
                                    <div className="text-2xl mb-2">{f.emoji}</div>
                                    <p className="text-[11px] font-semibold" style={{ color:'rgba(255,255,255,0.4)' }}>{f.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {lightbox && <Lightbox src={lightbox} onClose={()=>setLightbox(null)}/>}

            <style dangerouslySetInnerHTML={{ __html:`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&family=Syne:wght@700;800&display=swap');
            `}}/>
        </div>
    );
}