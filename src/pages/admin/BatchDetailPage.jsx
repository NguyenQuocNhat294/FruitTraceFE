// src/pages/admin/BatchDetailPage.jsx
import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Package, MapPin, Calendar, CheckCircle, Truck, Sprout, FlaskConical, Box, RefreshCw, QrCode, ExternalLink } from "lucide-react";
import { batchService } from "../../services/batchService";
import { traceService } from "../../services/traceService";
import { getPublicTraceUrl } from "../../utils/publicTraceUrl";
import { EvidenceImage } from "../../components/common/ImageDisplay";

const STATUS_INFO = {
    available: { label: "Có sẵn",          color: "#10b981", bg: "rgba(16,185,129,0.12)", border: "rgba(16,185,129,0.25)" },
    harvested: { label: "Đã thu hoạch",    color: "#f59e0b", bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.25)" },
    shipping:  { label: "Đang vận chuyển", color: "#38bdf8", bg: "rgba(56,189,248,0.12)", border: "rgba(56,189,248,0.25)" },
    sold:      { label: "Đã bán",          color: "#94a3b8", bg: "rgba(148,163,184,0.1)",  border: "rgba(148,163,184,0.2)" },
    completed: { label: "Hoàn tất",        color: "#818cf8", bg: "rgba(129,140,248,0.12)", border: "rgba(129,140,248,0.25)" },
};

const STEP_ICONS = {
    "Chuẩn bị đất":  <Sprout size={15}/>,
    "Xuống giống":   <Sprout size={15}/>,
    "Bón phân":      <FlaskConical size={15}/>,
    "Phun thuốc":    <FlaskConical size={15}/>,
    "Thu hoạch":     <Package size={15}/>,
    "Kiểm định":     <CheckCircle size={15}/>,
    "Đóng gói":      <Box size={15}/>,
    "Xuất kho":      <Truck size={15}/>,
    "Giao hàng":     <Truck size={15}/>,
};

const STEP_COLOR = {
    "Chuẩn bị đất":  "#94a3b8",
    "Xuống giống":   "#10b981",
    "Bón phân":      "#f59e0b",
    "Phun thuốc":    "#f97316",
    "Thu hoạch":     "#10b981",
    "Kiểm định":     "#38bdf8",
    "Đóng gói":      "#818cf8",
    "Xuất kho":      "#f59e0b",
    "Giao hàng":     "#10b981",
};

const fmt      = (d) => d ? new Date(d).toLocaleDateString("vi-VN") : "N/A";
const fmtFull  = (d) => d ? new Date(d).toLocaleString("vi-VN") : "N/A";

function BatchDetailPage() {
    const { id }  = useParams();
    const [batch, setBatch]   = useState(null);
    const [logs, setLogs]     = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError]   = useState("");

    const load = async () => {
        setLoading(true); setError("");
        try {
            const [bRes, lRes] = await Promise.all([
                batchService.getById(id),
                traceService.getByBatch(id),
            ]);
            setBatch(bRes.data);
            setLogs(lRes.data || []);
        } catch {
            setError("Không tải được chi tiết lô hàng.");
        } finally { setLoading(false); }
    };

    useEffect(() => { load(); }, [id]);

    const traceUrl = batch ? getPublicTraceUrl(batch.batchcode) : "";
    const qrUrl    = batch ? `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(traceUrl)}&bgcolor=ffffff` : "";

    if (loading) return (
        <div className="flex items-center justify-center h-64 text-slate-500">
            <RefreshCw size={22} className="animate-spin mr-2"/> Đang tải...
        </div>
    );

    if (error || !batch) return (
        <div className="space-y-4">
            <div className="px-4 py-3 rounded-xl text-sm text-red-400"
                 style={{ background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.2)" }}>
                {error || "Không tìm thấy lô hàng"}
            </div>
            <Link to="/admin/batches" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
                <ArrowLeft size={15}/> Quay lại
            </Link>
        </div>
    );

    const s = STATUS_INFO[batch.status] || STATUS_INFO.available;

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
                <div>
                    <Link to="/admin/batches"
                          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-white mb-3 transition-colors">
                        <ArrowLeft size={13}/> Quay lại danh sách lô
                    </Link>
                    <h1 className="text-3xl font-black text-white" style={{ fontFamily:"Syne,sans-serif" }}>
                        📦 {batch.batchcode}
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">Chi tiết & hành trình truy xuất lô hàng</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                    <button onClick={load} className="p-2.5 rounded-xl text-slate-400 hover:text-white transition-all"
                            style={{ background:"rgba(148,163,184,0.06)", border:"1px solid rgba(148,163,184,0.1)" }}>
                        <RefreshCw size={16}/>
                    </button>
                    <a href={traceUrl} target="_blank" rel="noreferrer"
                       className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white"
                       style={{ background:"linear-gradient(135deg,#38bdf8,#818cf8)", boxShadow:"0 4px 16px rgba(56,189,248,0.3)" }}>
                        <ExternalLink size={14}/> Xem trace
                    </a>
                </div>
            </div>

            {/* Info grid + QR */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Info cards */}
                <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-3 gap-3">
                    {[
                        { label:"Mã lô hàng",   value:batch.batchcode,   icon:<Package size={14}/>,  color:"#38bdf8" },
                        { label:"Sản phẩm",     value:batch.productid,   icon:<Package size={14}/>,  color:"#10b981" },
                        { label:"Nông trại",    value:batch.farmid,      icon:<MapPin size={14}/>,   color:"#f59e0b" },
                        { label:"Số lượng",     value:`${batch.quantitykg||0}kg`, icon:<Package size={14}/>, color:"#818cf8" },
                        { label:"Thu hoạch",    value:fmt(batch.harvestdate), icon:<Calendar size={14}/>, color:"#10b981" },
                        { label:"Hết hạn",      value:fmt(batch.expirydate),  icon:<Calendar size={14}/>, color:"#ef4444" },
                    ].map((item,i) => (
                        <div key={i} className="rounded-2xl p-4 relative overflow-hidden"
                             style={{ background:"rgba(15,23,42,0.6)", border:"1px solid rgba(148,163,184,0.08)" }}>
                            <div className="flex items-center gap-2 mb-2">
                                <span style={{ color:item.color }}>{item.icon}</span>
                                <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">{item.label}</p>
                            </div>
                            <p className="font-bold text-white text-sm">{item.value || "N/A"}</p>
                        </div>
                    ))}

                    {/* Status */}
                    <div className="rounded-2xl p-4 col-span-2 md:col-span-3"
                         style={{ background:s.bg, border:`1px solid ${s.border}` }}>
                        <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color:s.color }}>Trạng thái</p>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full animate-pulse" style={{ background:s.color, boxShadow:`0 0 8px ${s.color}` }}/>
                            <span className="font-black text-lg" style={{ color:s.color, fontFamily:"Syne,sans-serif" }}>{s.label}</span>
                        </div>
                    </div>
                </div>

                {/* QR Code */}
                <div className="rounded-2xl p-6 flex flex-col items-center justify-center text-center"
                     style={{ background:"rgba(15,23,42,0.6)", border:"1px solid rgba(148,163,184,0.08)" }}>
                    <p className="text-xs font-black text-slate-500 uppercase tracking-wider mb-4">QR Truy xuất</p>
                    <div className="bg-white p-3 rounded-2xl shadow-2xl mb-4"
                         style={{ boxShadow:"0 0 30px rgba(56,189,248,0.2)" }}>
                        <img src={qrUrl} alt="QR" className="w-24 h-24"/>
                    </div>
                    <p className="text-xs font-mono text-slate-500 truncate w-full mb-3">{batch.batchcode}</p>
                    <a href={traceUrl} target="_blank" rel="noreferrer"
                       className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl transition-all"
                       style={{ background:"rgba(56,189,248,0.12)", color:"#38bdf8", border:"1px solid rgba(56,189,248,0.2)" }}>
                        <QrCode size={12}/> Mở trang trace
                    </a>
                </div>
            </div>

            {/* Timeline */}
            <div className="rounded-2xl overflow-hidden"
                 style={{ background:"rgba(15,23,42,0.6)", border:"1px solid rgba(148,163,184,0.08)" }}>
                <div className="px-6 py-4 flex items-center justify-between"
                     style={{ borderBottom:"1px solid rgba(148,163,184,0.06)" }}>
                    <h2 className="font-black text-white" style={{ fontFamily:"Syne,sans-serif" }}>
                        🗺️ Hành trình truy xuất
                    </h2>
                    <span className="text-xs font-bold px-3 py-1 rounded-full"
                          style={{ background:"rgba(56,189,248,0.12)", color:"#38bdf8", border:"1px solid rgba(56,189,248,0.2)" }}>
                        {logs.length} bước
                    </span>
                </div>

                {logs.length === 0 ? (
                    <div className="py-12 text-center text-slate-600 text-sm">
                        <Package size={36} className="mx-auto mb-3 opacity-30"/>
                        Chưa có nhật ký truy xuất cho lô này.
                    </div>
                ) : (
                    <div className="p-6 space-y-0">
                        {logs.map((log, i) => {
                            const title  = log.title || log.action || log.step || `Bước ${i+1}`;
                            const color  = STEP_COLOR[title] || "#94a3b8";
                            const icon   = STEP_ICONS[title] || <CheckCircle size={15}/>;
                            const isLast = i === logs.length - 1;
                            return (
                                <div key={log._id||i} className="flex gap-4">
                                    {/* Dot + line */}
                                    <div className="flex flex-col items-center flex-shrink-0">
                                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-white shadow-lg"
                                             style={{ background:`linear-gradient(135deg,${color},${color}80)`, boxShadow:`0 0 16px ${color}40` }}>
                                            {icon}
                                        </div>
                                        {!isLast && <div className="w-0.5 flex-1 my-1.5" style={{ background:`linear-gradient(180deg,${color}40,rgba(148,163,184,0.08))` }}/>}
                                    </div>

                                    {/* Content */}
                                    <div className={`flex-1 ${isLast ? "pb-0" : "pb-5"}`}>
                                        <div className="rounded-2xl p-4 hover:bg-white/[0.02] transition-colors"
                                             style={{ background:"rgba(30,41,59,0.4)", border:"1px solid rgba(148,163,184,0.06)" }}>
                                            <div className="flex items-start justify-between gap-3 mb-2">
                                                <h4 className="font-bold text-white text-sm">{title}</h4>
                                                <span className="text-[10px] text-slate-500 flex-shrink-0">
                                                    {fmtFull(log.timestamp || log.date || log.createdAt)}
                                                </span>
                                            </div>
                                            {(log.description || log.note) && (
                                                <p className="text-sm text-slate-400 mb-2">{log.description || log.note}</p>
                                            )}
                                            <div className="flex items-center gap-4 text-xs text-slate-600">
                                                {log.location && (
                                                    <span className="flex items-center gap-1"><MapPin size={11}/>{log.location}</span>
                                                )}
                                                {(log.actor_id || log.actor) && (
                                                    <span>👤 {log.actor_id || log.actor}</span>
                                                )}
                                            </div>
                                            {/* Evidence image */}
                                            {log.image && (
                                                <div className="mt-3">
                                                    <EvidenceImage
                                                        imageStr={log.image}
                                                        alt={title}
                                                        className="max-h-36 rounded-xl object-cover"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

export default BatchDetailPage;