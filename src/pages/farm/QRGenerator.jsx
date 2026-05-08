// src/pages/farm/QRGenerator.jsx
import React, { useState, useEffect, useRef } from "react";
import {
    QrCode, Download, Copy, RefreshCw, Package,
    CheckCircle, ExternalLink, Search, Wifi, Smartphone, Info
} from "lucide-react";
import { batchService } from "../../services/batchService";
import { farmService }  from "../../services/farmService";
import { getPublicTraceUrl } from "../../utils/publicTraceUrl";
import { useAuth } from "../../hooks/useAuth";

const ENV_PUBLIC_BASE = import.meta.env.VITE_PUBLIC_APP_URL?.trim?.()?.replace(/\/$/, "");

const STATUS_INFO = {
    available: { label:"Có sẵn",     color:"#22c55e" },
    harvested: { label:"Thu hoạch",  color:"#fbbf24" },
    shipping:  { label:"Vận chuyển", color:"#38bdf8" },
    sold:      { label:"Đã bán",     color:"#a78bfa" },
};

export default function QRGenerator() {
    const { user }                  = useAuth();
    const [batches, setBatches]     = useState([]);
    const [selected, setSelected]   = useState(null);
    const [search, setSearch]       = useState("");
    const [loading, setLoading]     = useState(true);
    const [copying, setCopying]     = useState(false);
    const [downloading, setDL]      = useState(false);
    const [localIP, setLocalIP]     = useState('');
    const [useIP, setUseIP]         = useState(false);
    const [customIP, setCustomIP]   = useState('');
    const imgRef                    = useRef();

    useEffect(() => {
        const loadBatches = async () => {
            if (!user) return;
            setLoading(true);
            try {
                // 1. Lấy farms của farmer đang đăng nhập
                const farmRes = await farmService.getAll();
                const myFarms = (farmRes.data || []).filter(f =>
                    f.OwnerId === user.id || f.OwnerId === user._id
                );

                if (myFarms.length === 0) {
                    setBatches([]);
                    return;
                }

                // 2. Lấy batch của từng farm, gộp lại
                const batchResults = await Promise.all(
                    myFarms.map(f =>
                        batchService.getAll({ farmid: f.id || f._id })
                            .catch(() => ({ data: [] }))
                    )
                );
                const allBatches = batchResults.flatMap(r => r.data || []);

                setBatches(allBatches);
                if (allBatches.length > 0) setSelected(allBatches[0]);
            } catch (e) {
                console.error('QRGenerator load error:', e);
            } finally {
                setLoading(false);
            }
        };

        loadBatches();

        // Cố lấy local IP từ WebRTC
        try {
            const pc = new RTCPeerConnection({ iceServers: [] });
            pc.createDataChannel('');
            pc.createOffer().then(o => pc.setLocalDescription(o));
            pc.onicecandidate = e => {
                if (!e || !e.candidate) return;
                const m = e.candidate.candidate.match(/(\d+\.\d+\.\d+\.\d+)/);
                if (m && !m[1].startsWith('127.')) {
                    setLocalIP(m[1]);
                    pc.close();
                }
            };
        } catch {}
    }, [user?.id]);

    // URL để quét QR
    const getTraceUrl = () => {
        const code = selected?.batchcode || '';
        if (useIP) {
            const ip = customIP || localIP;
            if (ip) {
                return code
                    ? `http://${ip}:5173/trace?code=${encodeURIComponent(code)}`
                    : `http://${ip}:5173/trace`;
            }
        }
        if (ENV_PUBLIC_BASE) {
            return code
                ? `${ENV_PUBLIC_BASE}/trace?code=${encodeURIComponent(code)}`
                : `${ENV_PUBLIC_BASE}/trace`;
        }
        return getPublicTraceUrl(code);
    };

    const traceUrl = getTraceUrl();
    const qrImgUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(traceUrl)}&bgcolor=ffffff&color=111827&qzone=2&format=png`;

    const filtered = batches.filter(b =>
        (b.batchcode || '').toLowerCase().includes(search.toLowerCase()) ||
        (b.productid || '').toLowerCase().includes(search.toLowerCase())
    );

    const handleCopy = async () => {
        await navigator.clipboard.writeText(traceUrl);
        setCopying(true);
        setTimeout(() => setCopying(false), 2000);
    };

    const handleDownload = async () => {
        setDL(true);
        try {
            const res  = await fetch(qrImgUrl);
            const blob = await res.blob();
            const url  = URL.createObjectURL(blob);
            const a    = document.createElement("a");
            a.href = url;
            a.download = `QR-${selected?.batchcode || 'batch'}.png`;
            a.click();
            URL.revokeObjectURL(url);
        } catch { alert("Lỗi tải QR!"); }
        finally { setDL(false); }
    };

    return (
        <div className="space-y-5">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-black text-white" style={{ fontFamily:"Syne,sans-serif" }}>📱 QR Generator</h1>
                <p className="text-sm mt-1" style={{ color:'rgba(255,255,255,0.35)' }}>
                    Tạo mã QR truy xuất nguồn gốc — quét bằng điện thoại để xem hành trình
                </p>
            </div>

            {/* IP config banner */}
            <div className="rounded-2xl p-4" style={{ background:'rgba(56,189,248,0.06)', border:'1px solid rgba(56,189,248,0.15)' }}>
                <div className="flex items-start gap-3">
                    <Wifi size={16} style={{ color:'#38bdf8', flexShrink:0, marginTop:2 }}/>
                    <div className="flex-1">
                        {ENV_PUBLIC_BASE && (
                            <p className="text-xs mb-3 py-2 px-3 rounded-lg leading-relaxed"
                               style={{ background:'rgba(34,197,94,0.1)', border:'1px solid rgba(34,197,94,0.2)', color:'#86efac' }}>
                                <strong className="text-white">Link công khai:</strong> QR đang dùng <span className="font-mono">{ENV_PUBLIC_BASE}</span>
                                — ai có Internet đều quét được.
                            </p>
                        )}
                        <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                            <p className="text-sm font-bold text-white">
                                {ENV_PUBLIC_BASE ? 'Hoặc chỉ thử nội bộ (cùng WiFi)' : 'Quét bằng điện thoại cùng WiFi'}
                            </p>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <span className="text-xs" style={{ color:'rgba(255,255,255,0.5)' }}>
                                    {useIP ? 'Dùng IP nội bộ ✓' : 'Dùng IP nội bộ'}
                                </span>
                                <div onClick={() => setUseIP(!useIP)}
                                     className="relative w-10 h-5 rounded-full transition-all cursor-pointer"
                                     style={{ background: useIP ? '#22c55e' : 'rgba(255,255,255,0.1)' }}>
                                    <div className="absolute top-0.5 transition-all duration-300 w-4 h-4 rounded-full bg-white shadow"
                                         style={{ left: useIP ? '22px' : '2px' }}/>
                                </div>
                            </label>
                        </div>

                        {useIP ? (
                            <div className="flex gap-2 items-center">
                                <span className="text-xs" style={{ color:'rgba(255,255,255,0.4)' }}>IP máy tính:</span>
                                <input value={customIP || localIP}
                                       onChange={e => setCustomIP(e.target.value)}
                                       placeholder={localIP || "192.168.1.8"}
                                       className="flex-1 px-3 py-1.5 rounded-lg text-sm text-white font-mono focus:outline-none"
                                       style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(56,189,248,0.2)' }}/>
                                <span className="text-xs font-mono" style={{ color:'rgba(255,255,255,0.3)' }}>:5173</span>
                            </div>
                        ) : (
                            <p className="text-xs" style={{ color:'rgba(255,255,255,0.4)' }}>
                                {!ENV_PUBLIC_BASE && (
                                    <>
                                        Muốn <strong className="text-white">người ngoài</strong> quét được: deploy web + API lên hosting rồi đặt{' '}
                                        <span className="font-mono text-sky-300">VITE_PUBLIC_APP_URL</span> trong file env khi build.
                                        <br/>
                                    </>
                                )}
                                Bật để điện thoại cùng WiFi scan được QR. IP tự động:{' '}
                                <span className="font-mono text-white">{localIP || 'đang tìm...'}</span>
                            </p>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
                {/* Left: batch list */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="rounded-2xl overflow-hidden"
                         style={{ background:'rgba(4,5,16,0.7)', border:'1px solid rgba(255,255,255,0.07)' }}>
                        <div className="p-4" style={{ borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
                            <h3 className="font-black text-white text-sm mb-3" style={{ fontFamily:'Syne,sans-serif' }}>
                                Chọn lô hàng
                            </h3>
                            <div className="relative">
                                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color:'rgba(255,255,255,0.3)' }}/>
                                <input value={search} onChange={e => setSearch(e.target.value)}
                                       placeholder="Tìm mã lô, sản phẩm..."
                                       className="w-full pl-8 pr-3 py-2 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none"
                                       style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)' }}/>
                            </div>
                        </div>
                        <div className="max-h-80 overflow-y-auto" style={{ scrollbarWidth:'none' }}>
                            {loading ? (
                                <div className="p-6 text-center text-xs" style={{ color:'rgba(255,255,255,0.3)' }}>Đang tải...</div>
                            ) : filtered.length === 0 ? (
                                <div className="p-6 text-center text-xs" style={{ color:'rgba(255,255,255,0.3)' }}>
                                    Không có lô hàng nào
                                </div>
                            ) : filtered.map(batch => {
                                const s = STATUS_INFO[batch.status] || STATUS_INFO.available;
                                const active = selected?._id === batch._id;
                                return (
                                    <button key={batch._id} onClick={() => setSelected(batch)}
                                            className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-white/[0.03]"
                                            style={{ borderBottom:'1px solid rgba(255,255,255,0.04)', background: active ? 'rgba(34,197,94,0.06)' : 'transparent' }}>
                                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-black flex-shrink-0"
                                             style={{ background:`linear-gradient(135deg,${s.color},${s.color}80)` }}>
                                            {(batch.productid || 'B').charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-bold text-white truncate">{batch.batchcode}</p>
                                            <p className="text-[10px] truncate" style={{ color:'rgba(255,255,255,0.35)' }}>
                                                {batch.productid} · {batch.farmid}
                                            </p>
                                        </div>
                                        {active && <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background:'#22c55e' }}/>}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Batch info */}
                    {selected && (
                        <div className="rounded-2xl p-4 space-y-2"
                             style={{ background:'rgba(4,5,16,0.7)', border:'1px solid rgba(255,255,255,0.07)' }}>
                            <p className="text-[10px] font-black uppercase tracking-wider mb-3" style={{ color:'rgba(255,255,255,0.25)' }}>
                                Thông tin lô hàng
                            </p>
                            {[
                                { label:"Mã lô",      value: selected.batchcode },
                                { label:"Sản phẩm",   value: selected.productid },
                                { label:"Nông trại",  value: selected.farmid },
                                { label:"Số lượng",   value: selected.quantitykg ? `${selected.quantitykg}kg` : null },
                                { label:"Trạng thái", value: STATUS_INFO[selected.status]?.label || selected.status },
                            ].filter(i => i.value).map((item, i) => (
                                <div key={i} className="flex justify-between text-xs">
                                    <span style={{ color:'rgba(255,255,255,0.35)' }}>{item.label}</span>
                                    <span className="font-semibold text-white">{item.value}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right: QR preview */}
                <div className="lg:col-span-3">
                    <div className="rounded-2xl p-8 flex flex-col items-center text-center relative overflow-hidden"
                         style={{ background:'rgba(4,5,16,0.7)', border:'1px solid rgba(255,255,255,0.07)', minHeight:'440px' }}>

                        <div className="absolute inset-0 pointer-events-none"
                             style={{ background:'radial-gradient(circle at 50% 30%, rgba(34,197,94,0.05), transparent 70%)' }}/>

                        {selected ? (
                            <>
                                <div className="relative mb-6">
                                    <div className="bg-white p-4 rounded-2xl shadow-2xl"
                                         style={{ boxShadow:'0 0 60px rgba(34,197,94,0.2)' }}>
                                        <img ref={imgRef} src={qrImgUrl} alt="QR Code"
                                             className="w-56 h-56 object-contain"
                                             onError={e => e.target.style.display = 'none'}/>
                                    </div>
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <div className="w-11 h-11 rounded-xl flex items-center justify-center shadow-xl"
                                             style={{ background:'linear-gradient(135deg,#16a34a,#22c55e)', border:'3px solid white' }}>
                                            <span className="text-xl">🍊</span>
                                        </div>
                                    </div>
                                </div>

                                <p className="text-lg font-black text-white mb-0.5" style={{ fontFamily:'Syne,sans-serif' }}>
                                    {selected.productid}
                                </p>
                                <p className="text-sm font-mono mb-4" style={{ color:'rgba(255,255,255,0.4)' }}>
                                    {selected.batchcode}
                                </p>

                                <div className="w-full max-w-sm mb-5 px-3 py-2 rounded-xl text-xs font-mono truncate text-left"
                                     style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', color:'rgba(255,255,255,0.5)' }}>
                                    {traceUrl}
                                </div>

                                <div className="flex items-center gap-2 mb-5 px-3 py-2 rounded-xl w-full max-w-sm"
                                     style={{ background: ENV_PUBLIC_BASE && !useIP ? 'rgba(34,197,94,0.08)' : useIP ? 'rgba(34,197,94,0.08)' : 'rgba(251,191,36,0.06)',
                                              border: `1px solid ${ENV_PUBLIC_BASE && !useIP ? 'rgba(34,197,94,0.2)' : useIP ? 'rgba(34,197,94,0.2)' : 'rgba(251,191,36,0.15)'}` }}>
                                    <Smartphone size={13} style={{ color: ENV_PUBLIC_BASE && !useIP ? '#4ade80' : useIP ? '#4ade80' : '#fbbf24', flexShrink:0 }}/>
                                    <span className="text-xs" style={{ color: ENV_PUBLIC_BASE && !useIP ? '#4ade80' : useIP ? '#4ade80' : '#fbbf24' }}>
                                        {ENV_PUBLIC_BASE && !useIP
                                            ? '✓ QR dùng link công khai — mạng ngoài quét được'
                                            : useIP ? '✓ Điện thoại cùng WiFi scan được'
                                            : '⚠ Chỉ localhost / cùng máy — bật IP nội bộ hoặc VITE_PUBLIC_APP_URL'}
                                    </span>
                                </div>

                                <div className="flex gap-3 w-full max-w-sm">
                                    <button onClick={handleDownload} disabled={downloading}
                                            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white transition-all hover:-translate-y-0.5 disabled:opacity-60"
                                            style={{ background:'linear-gradient(135deg,#16a34a,#22c55e)', boxShadow:'0 4px 16px rgba(34,197,94,0.35)' }}>
                                        {downloading ? <><RefreshCw size={14} className="animate-spin"/>Đang tải...</> : <><Download size={14}/>Tải QR</>}
                                    </button>
                                    <button onClick={handleCopy}
                                            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all hover:-translate-y-0.5"
                                            style={copying
                                                ? { background:'rgba(34,197,94,0.12)', border:'1px solid rgba(34,197,94,0.25)', color:'#4ade80' }
                                                : { background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', color:'rgba(255,255,255,0.6)' }}>
                                        {copying ? <><CheckCircle size={14}/>Đã copy!</> : <><Copy size={14}/>Copy link</>}
                                    </button>
                                </div>

                                <a href={traceUrl} target="_blank" rel="noreferrer"
                                   className="mt-3 flex items-center gap-1.5 text-xs font-semibold transition-colors hover:opacity-80"
                                   style={{ color:'#38bdf8' }}>
                                    <ExternalLink size={12}/> Xem trang truy xuất
                                </a>
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full">
                                <QrCode size={48} className="mb-3 opacity-20 text-white"/>
                                <p className="text-sm" style={{ color:'rgba(255,255,255,0.3)' }}>Chọn lô hàng để tạo QR Code</p>
                            </div>
                        )}
                    </div>

                    <div className="mt-4 rounded-2xl p-5"
                         style={{ background:'rgba(4,5,16,0.5)', border:'1px solid rgba(255,255,255,0.06)' }}>
                        <p className="text-[10px] font-black uppercase tracking-wider mb-4" style={{ color:'rgba(255,255,255,0.25)' }}>
                            Hướng dẫn sử dụng
                        </p>
                        <div className="grid grid-cols-4 gap-3 text-center">
                            {[
                                { step:"1", emoji:"📦", text:"Chọn lô hàng" },
                                { step:"2", emoji:"📶", text:"Bật IP nội bộ" },
                                { step:"3", emoji:"⬇️", text:"Tải QR về" },
                                { step:"4", emoji:"📱", text:"Scan bằng điện thoại" },
                            ].map(s => (
                                <div key={s.step} className="space-y-1.5">
                                    <div className="text-2xl">{s.emoji}</div>
                                    <div className="w-5 h-5 rounded-full mx-auto flex items-center justify-center text-[10px] font-black text-white"
                                         style={{ background:'linear-gradient(135deg,#22c55e,#38bdf8)' }}>{s.step}</div>
                                    <p className="text-[10px] leading-tight" style={{ color:'rgba(255,255,255,0.35)' }}>{s.text}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}