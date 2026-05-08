// src/pages/staff/PhotoUpload.jsx
import React, { useState, useRef, useCallback } from 'react';
import {
    Upload, X, Image, CheckCircle, AlertTriangle,
    Camera, Folder, Trash2, ZoomIn, Download
} from 'lucide-react';

const CATEGORIES = ['Thu hoạch', 'Kiểm định', 'Đóng gói', 'Vận chuyển', 'Nông trại', 'Khác'];

const ACCEPT = 'image/jpeg,image/png,image/webp,image/jpg';

// ── Lightbox ──
const Lightbox = ({ src, onClose }) => (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
         onClick={onClose}>
        <button className="absolute top-4 right-4 p-2 rounded-full text-white hover:bg-white/10" onClick={onClose}>
            <X size={20}/>
        </button>
        <img src={src} alt="" className="max-w-full max-h-[85vh] rounded-2xl object-contain"
             onClick={e=>e.stopPropagation()}/>
    </div>
);

// ── Preview card ──
const PhotoCard = ({ photo, onRemove, onView }) => {
    const cat = CATEGORIES.find(c => c === photo.category) ? photo.category : 'Khác';
    const CAT_COLOR = {
        'Thu hoạch':'#22c55e', 'Kiểm định':'#38bdf8', 'Đóng gói':'#818cf8',
        'Vận chuyển':'#fbbf24', 'Nông trại':'#10b981', 'Khác':'#94a3b8'
    };
    const color = CAT_COLOR[cat] || '#94a3b8';

    return (
        <div className="rounded-2xl overflow-hidden group relative transition-all hover:-translate-y-0.5"
             style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)' }}>
            <div className="h-40 overflow-hidden relative cursor-pointer" onClick={()=>onView(photo.preview)}>
                <img src={photo.preview} alt={photo.name}
                     className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"/>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-full bg-black/50">
                        <ZoomIn size={18} className="text-white"/>
                    </div>
                </div>
                {/* Status badge */}
                <div className="absolute top-2 left-2">
                    {photo.status === 'done' && (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
                              style={{ background:'rgba(34,197,94,0.9)', color:'white' }}>
                            <CheckCircle size={9}/> Xong
                        </span>
                    )}
                    {photo.status === 'uploading' && (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
                              style={{ background:'rgba(56,189,248,0.9)', color:'white' }}>
                            <div className="w-2 h-2 border border-white/50 border-t-white rounded-full animate-spin"/>
                            Đang tải
                        </span>
                    )}
                    {photo.status === 'error' && (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
                              style={{ background:'rgba(239,68,68,0.9)', color:'white' }}>
                            <AlertTriangle size={9}/> Lỗi
                        </span>
                    )}
                </div>
                {/* Remove */}
                <button onClick={e=>{e.stopPropagation();onRemove(photo.id);}}
                        className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ background:'rgba(239,68,68,0.8)' }}>
                    <X size={11} className="text-white"/>
                </button>
            </div>
            <div className="p-3">
                <p className="text-xs font-bold text-white truncate mb-1">{photo.name}</p>
                <div className="flex items-center justify-between">
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                          style={{ background:`${color}15`, color, border:`1px solid ${color}25` }}>
                        {photo.category}
                    </span>
                    <span className="text-[10px]" style={{ color:'rgba(255,255,255,0.3)' }}>
                        {(photo.size/1024).toFixed(0)}KB
                    </span>
                </div>
                {photo.batch && (
                    <p className="text-[10px] mt-1 font-mono" style={{ color:'rgba(255,255,255,0.3)' }}>
                        📦 {photo.batch}
                    </p>
                )}
            </div>
        </div>
    );
};

export default function PhotoUpload() {
    const [photos, setPhotos]       = useState([]);
    const [dragging, setDragging]   = useState(false);
    const [category, setCategory]   = useState('Thu hoạch');
    const [batch, setBatch]         = useState('');
    const [note, setNote]           = useState('');
    const [lightbox, setLightbox]   = useState(null);
    const [uploading, setUploading] = useState(false);
    const fileInputRef              = useRef();

    const addFiles = useCallback((files) => {
        const newPhotos = Array.from(files)
            .filter(f => f.type.startsWith('image/'))
            .map(f => ({
                id:       Date.now() + Math.random(),
                file:     f,
                name:     f.name,
                size:     f.size,
                preview:  URL.createObjectURL(f),
                category,
                batch,
                note,
                status:   'pending',
            }));
        setPhotos(p => [...p, ...newPhotos]);
    }, [category, batch, note]);

    const handleDrop = useCallback(e => {
        e.preventDefault(); setDragging(false);
        addFiles(e.dataTransfer.files);
    }, [addFiles]);

    const handleFileInput = e => addFiles(e.target.files);

    const removePhoto = id => {
        setPhotos(p => {
            const photo = p.find(ph => ph.id === id);
            if (photo) URL.revokeObjectURL(photo.preview);
            return p.filter(ph => ph.id !== id);
        });
    };

    const handleUploadAll = async () => {
        if (photos.length === 0) return;
        setUploading(true);
        // Simulate upload with delay
        for (let i = 0; i < photos.length; i++) {
            setPhotos(p => p.map(ph =>
                ph.id === photos[i].id ? {...ph, status:'uploading'} : ph
            ));
            await new Promise(r => setTimeout(r, 800 + Math.random()*400));
            setPhotos(p => p.map(ph =>
                ph.id === photos[i].id ? {...ph, status:'done'} : ph
            ));
        }
        setUploading(false);
    };

    const clearDone = () => setPhotos(p => p.filter(ph => ph.status !== 'done'));

    const pending = photos.filter(p => p.status === 'pending').length;
    const done    = photos.filter(p => p.status === 'done').length;

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-white" style={{ fontFamily:'Syne,sans-serif' }}>📸 Upload ảnh</h1>
                    <p className="text-sm mt-1" style={{ color:'rgba(255,255,255,0.35)' }}>
                        Tải lên ảnh minh chứng cho lô hàng và hoạt động
                    </p>
                </div>
                <div className="flex gap-2">
                    {done > 0 && (
                        <button onClick={clearDone}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all"
                                style={{ background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)', color:'#f87171' }}>
                            <Trash2 size={14}/> Xóa đã upload ({done})
                        </button>
                    )}
                    {pending > 0 && (
                        <button onClick={handleUploadAll} disabled={uploading}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-60"
                                style={{ background:'linear-gradient(135deg,#6366f1,#818cf8)', boxShadow:'0 4px 16px rgba(129,140,248,0.35)' }}>
                            <Upload size={14}/> Upload tất cả ({pending})
                        </button>
                    )}
                </div>
            </div>

            {/* Stats */}
            {photos.length > 0 && (
                <div className="grid grid-cols-3 gap-3">
                    {[
                        { label:'Tổng ảnh',    value:photos.length, color:'#818cf8' },
                        { label:'Chờ upload',  value:pending,       color:'#fbbf24' },
                        { label:'Hoàn thành',  value:done,          color:'#22c55e' },
                    ].map((s,i)=>(
                        <div key={i} className="rounded-2xl p-4 text-center"
                             style={{ background:'rgba(4,5,16,0.7)', border:'1px solid rgba(255,255,255,0.07)' }}>
                            <div className="text-2xl font-black" style={{ color:s.color, fontFamily:'Syne,sans-serif' }}>{s.value}</div>
                            <div className="text-xs mt-0.5" style={{ color:'rgba(255,255,255,0.35)' }}>{s.label}</div>
                        </div>
                    ))}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Left: Config + Dropzone */}
                <div className="space-y-4">
                    {/* Config */}
                    <div className="rounded-2xl p-4 space-y-3"
                         style={{ background:'rgba(4,5,16,0.7)', border:'1px solid rgba(255,255,255,0.07)' }}>
                        <h3 className="font-black text-white text-sm" style={{ fontFamily:'Syne,sans-serif' }}>⚙️ Cài đặt upload</h3>

                        <div>
                            <label className="text-[10px] font-bold uppercase tracking-wider block mb-1.5" style={{ color:'rgba(255,255,255,0.35)' }}>Danh mục</label>
                            <div className="grid grid-cols-2 gap-1.5">
                                {CATEGORIES.map(c => (
                                    <button key={c} onClick={()=>setCategory(c)}
                                            className="px-2 py-1.5 rounded-lg text-xs font-bold transition-all"
                                            style={ category===c
                                                ? { background:'rgba(129,140,248,0.2)', border:'1px solid rgba(129,140,248,0.4)', color:'#c4b5fd' }
                                                : { background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)', color:'rgba(255,255,255,0.4)' }
                                            }>{c}</button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] font-bold uppercase tracking-wider block mb-1.5" style={{ color:'rgba(255,255,255,0.35)' }}>Mã lô hàng</label>
                            <input value={batch} onChange={e=>setBatch(e.target.value)}
                                   placeholder="VD: BATCH-001"
                                   className="w-full px-3 py-2.5 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none"
                                   style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)' }}/>
                        </div>

                        <div>
                            <label className="text-[10px] font-bold uppercase tracking-wider block mb-1.5" style={{ color:'rgba(255,255,255,0.35)' }}>Ghi chú</label>
                            <textarea value={note} onChange={e=>setNote(e.target.value)} rows={2}
                                      placeholder="Mô tả ảnh..."
                                      className="w-full px-3 py-2.5 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none resize-none"
                                      style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)' }}/>
                        </div>
                    </div>

                    {/* Dropzone */}
                    <div
                        onDragOver={e=>{e.preventDefault();setDragging(true)}}
                        onDragLeave={()=>setDragging(false)}
                        onDrop={handleDrop}
                        onClick={()=>fileInputRef.current?.click()}
                        className="rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all"
                        style={{
                            background: dragging ? 'rgba(129,140,248,0.1)' : 'rgba(4,5,16,0.5)',
                            border: `2px dashed ${dragging ? 'rgba(129,140,248,0.5)' : 'rgba(255,255,255,0.1)'}`,
                            transform: dragging ? 'scale(1.02)' : 'scale(1)',
                        }}>
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3"
                             style={{ background:'rgba(129,140,248,0.12)', border:'1px solid rgba(129,140,248,0.2)' }}>
                            {dragging ? <Download size={22} style={{ color:'#a78bfa' }}/> : <Upload size={22} style={{ color:'#818cf8' }}/>}
                        </div>
                        <p className="font-bold text-white text-sm mb-1">
                            {dragging ? 'Thả ảnh vào đây!' : 'Kéo thả hoặc click'}
                        </p>
                        <p className="text-xs" style={{ color:'rgba(255,255,255,0.3)' }}>JPG, PNG, WEBP — tối đa 10MB</p>

                        <div className="flex gap-2 mt-4">
                            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold"
                                 style={{ background:'rgba(129,140,248,0.1)', color:'#a78bfa', border:'1px solid rgba(129,140,248,0.2)' }}>
                                <Folder size={12}/> Chọn file
                            </div>
                            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold"
                                 style={{ background:'rgba(34,197,94,0.1)', color:'#4ade80', border:'1px solid rgba(34,197,94,0.2)' }}>
                                <Camera size={12}/> Chụp ảnh
                            </div>
                        </div>
                        <input ref={fileInputRef} type="file" multiple accept={ACCEPT}
                               className="hidden" onChange={handleFileInput}/>
                    </div>
                </div>

                {/* Right: Photo grid */}
                <div className="lg:col-span-2">
                    {photos.length === 0 ? (
                        <div className="rounded-2xl h-full min-h-64 flex flex-col items-center justify-center"
                             style={{ background:'rgba(4,5,16,0.4)', border:'2px dashed rgba(255,255,255,0.06)' }}>
                            <Image size={40} className="mb-3 opacity-20 text-white"/>
                            <p className="text-sm font-bold" style={{ color:'rgba(255,255,255,0.3)' }}>Chưa có ảnh nào</p>
                            <p className="text-xs mt-1" style={{ color:'rgba(255,255,255,0.2)' }}>Kéo thả hoặc chọn ảnh từ bên trái</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {photos.map(photo => (
                                <PhotoCard key={photo.id} photo={photo}
                                           onRemove={removePhoto}
                                           onView={setLightbox}/>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {lightbox && <Lightbox src={lightbox} onClose={()=>setLightbox(null)}/>}
        </div>
    );
}