// src/pages/farm/GalleryPage.jsx
import React, { useState, useEffect, useRef } from "react";
import {
    Upload, X, Heart, Maximize2, Search, Image as ImageIcon,
    Check, RefreshCw, Package, Sprout, FlaskConical, Truck, Building2
} from "lucide-react";
import { batchService }   from "../../services/batchService";
import { farmService }    from "../../services/farmService";
import { productService } from "../../services/productService";
import { useAuth }        from "../../hooks/useAuth";

const BASE = import.meta.env.VITE_API_BASE_URL?.replace('/api','') || 'http://localhost:5000';

// ✅ Parse image string → array of full URLs (hỗ trợ cả Cloudinary lẫn path cũ)
const parseImgs = (str = '') =>
    str.split(',').map(s => s.trim()).filter(Boolean).map(p => {
        if (p.startsWith('http')) return p;          // Cloudinary URL → dùng thẳng
        if (p.startsWith('/')) return `${BASE}${p}`; // path cũ /images/abc.jpg
        return `${BASE}/images/${p}`;                // chỉ tên file
    });

const CATEGORIES = ["Tất cả", "Thu hoạch", "Nông trại", "Kiểm định", "Đóng gói", "Vận chuyển"];
const CAT_ICON   = {
    "Thu hoạch":  <Sprout size={11}/>,
    "Nông trại":  <Building2 size={11}/>,
    "Kiểm định":  <FlaskConical size={11}/>,
    "Đóng gói":   <Package size={11}/>,
    "Vận chuyển": <Truck size={11}/>,
};
const CAT_COLOR  = {
    "Thu hoạch":  '#22c55e',
    "Nông trại":  '#38bdf8',
    "Kiểm định":  '#818cf8',
    "Đóng gói":   '#fbbf24',
    "Vận chuyển": '#f97316',
};

// ── Lightbox ──
const Lightbox = ({ image, onClose, onPrev, onNext }) => (
    <div className="fixed inset-0 bg-black/92 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
        <button onClick={onClose}
                className="absolute top-4 right-4 p-2.5 rounded-full text-white transition-colors hover:bg-white/10">
            <X size={20}/>
        </button>
        <button onClick={e => { e.stopPropagation(); onPrev(); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full text-white hover:bg-white/10 text-3xl transition-colors">‹</button>
        <div className="max-w-4xl max-h-[85vh] flex flex-col items-center gap-4" onClick={e => e.stopPropagation()}>
            <img src={image.url} alt={image.title}
                 className="max-h-[72vh] max-w-full object-contain rounded-2xl shadow-2xl"
                 onError={e => { e.target.style.display = 'none'; }}/>
            <div className="text-center">
                <p className="font-black text-white" style={{ fontFamily: 'Syne,sans-serif' }}>{image.title}</p>
                <div className="flex items-center justify-center gap-2 mt-1">
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                          style={{ background: `${CAT_COLOR[image.category] || '#94a3b8'}20`, color: CAT_COLOR[image.category] || '#94a3b8' }}>
                        {image.category}
                    </span>
                    <span className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>{image.date}</span>
                    {image.farmName && <span className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>· {image.farmName}</span>}
                </div>
            </div>
        </div>
        <button onClick={e => { e.stopPropagation(); onNext(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full text-white hover:bg-white/10 text-3xl transition-colors">›</button>
    </div>
);

export default function GalleryPage() {
    const { user }                  = useAuth();
    const [images, setImages]       = useState([]);
    const [loading, setLoading]     = useState(true);
    const [category, setCategory]   = useState("Tất cả");
    const [search, setSearch]       = useState("");
    const [lightbox, setLightbox]   = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploaded,  setUploaded]  = useState(false);
    const [likedIds,  setLikedIds]  = useState(new Set());
    const inputRef = useRef();

    // ── Load: Farm → Batches → Products ──
    const loadImages = async () => {
        if (!user) return;
        setLoading(true);
        try {
            // 1. Lấy tất cả farms, lọc theo OwnerId
            const farmRes  = await farmService.getAll();
            const allFarms = farmRes.data || [];
            const myFarms  = allFarms.filter(f =>
                f.OwnerId === user.id || f.OwnerId === user._id
            );
            const farmMap  = Object.fromEntries(myFarms.map(f => [f.id || f._id, f.FarmName || f.id]));

            // 2. Lấy batches của từng farm
            const batchResults = await Promise.all(
                myFarms.map(f =>
                    batchService.getAll({ farmid: f.id || f._id }).catch(() => ({ data: [] }))
                )
            );
            const allBatches = batchResults.flatMap(r => r.data || []);

            // 3. Lấy productIds từ batches (loại trùng)
            const productIds = [...new Set(allBatches.map(b => b.productid).filter(Boolean))];

            // 4. Lấy tất cả products
            const productRes  = await productService.getAll();
            const allProducts = productRes.data || [];

            const imgs = [];

            // ── Ảnh từ Products (trái cây) ──
            productIds.forEach(pid => {
                const product = allProducts.find(p => p.id === pid || p._id === pid);
                if (!product?.image) return;

                const batch    = allBatches.find(b => b.productid === pid);
                const farmId   = batch?.farmid;
                const farmName = farmMap[farmId] || farmId || '';

                parseImgs(product.image).forEach((url, i) => {
                    imgs.push({
                        id:        `prod_${pid}_${i}`,
                        url,
                        title:     product.name || pid,
                        category:  'Thu hoạch',
                        date:      batch?.harvestdate
                            ? new Date(batch.harvestdate).toLocaleDateString('vi-VN')
                            : '',
                        farmName,
                        batchcode: batch?.batchcode || '',
                        source:    'product',
                    });
                });
            });

            // ── Ảnh từ Farms (nông trại) ──
            myFarms.forEach(f => {
                if (!f.image) return;
                parseImgs(f.image).forEach((url, i) => {
                    imgs.push({
                        id:       `farm_${f.id || f._id}_${i}`,
                        url,
                        title:    f.FarmName || f.id,
                        category: 'Nông trại',
                        date:     '',
                        farmName: f.FarmName || f.id,
                        source:   'farm',
                    });
                });
            });

            setImages(imgs);
        } catch (e) {
            console.error('GalleryPage error:', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadImages(); }, [user?.id]);

    // Upload local (preview only)
    const handleUpload = (e) => {
        const files = Array.from(e.target.files);
        setUploading(true);
        setTimeout(() => {
            const newImgs = files.map((f, i) => ({
                id:       `upload_${Date.now()}_${i}`,
                url:      URL.createObjectURL(f),
                title:    f.name.replace(/\.[^.]+$/, ''),
                category: 'Thu hoạch',
                date:     new Date().toLocaleDateString('vi-VN'),
                farmName: '',
                source:   'upload',
            }));
            setImages(p => [...newImgs, ...p]);
            setUploading(false);
            setUploaded(true);
            setTimeout(() => setUploaded(false), 2000);
        }, 800);
    };

    const toggleLike  = id => setLikedIds(p => {
        const n = new Set(p);
        n.has(id) ? n.delete(id) : n.add(id);
        return n;
    });
    const removeImage = id => setImages(p => p.filter(i => i.id !== id));

    const filtered = images.filter(img =>
        (category === "Tất cả" || img.category === category) &&
        (!search || img.title.toLowerCase().includes(search.toLowerCase()) ||
            (img.farmName || '').toLowerCase().includes(search.toLowerCase()))
    );

    const lightboxIdx = lightbox !== null ? filtered.findIndex(i => i.id === lightbox) : -1;
    const likes = images.filter(i => likedIds.has(i.id)).length;

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white" style={{ fontFamily: "Syne,sans-serif" }}>🖼️ Thư viện ảnh</h1>
                    <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>
                        {loading ? 'Đang tải...' : `${images.length} ảnh từ nông trại`}
                    </p>
                </div>
                <div className="flex gap-2">
                    <button onClick={loadImages}
                            className="p-2.5 rounded-xl transition-all"
                            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)' }}>
                        <RefreshCw size={15} className={loading ? 'animate-spin' : ''}/>
                    </button>
                    <button onClick={() => inputRef.current?.click()} disabled={uploading}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-60 hover:brightness-110"
                            style={{ background: uploaded ? 'linear-gradient(135deg,#16a34a,#22c55e)' : 'linear-gradient(135deg,#16a34a,#38bdf8)', boxShadow: '0 4px 16px rgba(34,197,94,0.3)' }}>
                        {uploading
                            ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Đang upload...</>
                            : uploaded
                                ? <><Check size={15}/>Đã upload!</>
                                : <><Upload size={15}/>Upload ảnh</>}
                    </button>
                    <input ref={inputRef} type="file" multiple accept="image/*" className="hidden" onChange={handleUpload}/>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-1 max-w-xs">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'rgba(255,255,255,0.3)' }}/>
                    <input value={search} onChange={e => setSearch(e.target.value)}
                           placeholder="Tìm ảnh, tên vườn..."
                           className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none"
                           style={{ background: 'rgba(4,5,16,0.7)', border: '1px solid rgba(255,255,255,0.08)' }}/>
                </div>
                <div className="flex gap-1.5 flex-wrap">
                    {CATEGORIES.map(cat => (
                        <button key={cat} onClick={() => setCategory(cat)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
                                style={category === cat
                                    ? { background: `${CAT_COLOR[cat] || 'rgba(34,197,94'}15`, border: `1px solid ${CAT_COLOR[cat] || '#22c55e'}30`, color: CAT_COLOR[cat] || '#22c55e' }
                                    : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.4)' }
                                }>
                            {CAT_ICON[cat]} {cat}
                            <span className="opacity-60 text-[9px]">
                                {cat === 'Tất cả' ? images.length : images.filter(i => i.category === cat).length}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Stats */}
            <div className="flex gap-4 text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
                <span><span className="font-bold text-white">{filtered.length}</span> ảnh</span>
                <span>·</span>
                <span><span className="font-bold text-white">{likes}</span> yêu thích</span>
                <span>·</span>
                <span><span className="font-bold text-white">{images.filter(i => i.source === 'product').length}</span> trái cây</span>
                <span>·</span>
                <span><span className="font-bold text-white">{images.filter(i => i.source === 'farm').length}</span> nông trại</span>
            </div>

            {/* Loading skeleton */}
            {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="aspect-[4/3] rounded-2xl animate-pulse"
                             style={{ background: 'rgba(255,255,255,0.04)' }}/>
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <div className="rounded-2xl py-16 text-center"
                     style={{ background: 'rgba(255,255,255,0.02)', border: '2px dashed rgba(255,255,255,0.07)' }}>
                    <ImageIcon size={40} className="mx-auto mb-3 opacity-20 text-white"/>
                    <p className="text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.35)' }}>
                        {search || category !== "Tất cả" ? 'Không tìm thấy ảnh phù hợp' : 'Chưa có ảnh nào'}
                    </p>
                    <button onClick={() => inputRef.current?.click()}
                            className="mt-3 text-xs font-bold px-4 py-2 rounded-xl"
                            style={{ background: 'rgba(34,197,94,0.1)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.2)' }}>
                        Upload ảnh đầu tiên
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filtered.map(img => {
                        const color = CAT_COLOR[img.category] || '#94a3b8';
                        const liked = likedIds.has(img.id);
                        return (
                            <div key={img.id}
                                 className="group relative aspect-[4/3] rounded-2xl overflow-hidden cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-2xl"
                                 style={{ background: 'rgba(4,5,16,0.7)', border: '1px solid rgba(255,255,255,0.07)' }}
                                 onClick={() => setLightbox(img.id)}>

                                <img src={img.url} alt={img.title}
                                     className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                     onError={e => {
                                         e.target.style.display = 'none';
                                         e.target.nextSibling.style.display = 'flex';
                                     }}/>
                                {/* Fallback emoji */}
                                <div className="hidden w-full h-full items-center justify-center text-4xl absolute inset-0"
                                     style={{ background: 'rgba(255,255,255,0.03)' }}>🍊</div>

                                {/* Overlay */}
                                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                     style={{ background: 'linear-gradient(to top,rgba(0,0,0,0.85) 0%,rgba(0,0,0,0.2) 50%,transparent 100%)' }}/>

                                {/* Top actions */}
                                <div className="absolute top-2 right-2 flex gap-1.5 -translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                                    <button onClick={e => { e.stopPropagation(); toggleLike(img.id); }}
                                            className="p-1.5 rounded-full backdrop-blur-sm transition-colors"
                                            style={{ background: 'rgba(0,0,0,0.5)' }}>
                                        <Heart size={12} style={{ color: liked ? '#f87171' : 'white', fill: liked ? '#f87171' : 'transparent' }}/>
                                    </button>
                                    <button onClick={e => { e.stopPropagation(); removeImage(img.id); }}
                                            className="p-1.5 rounded-full backdrop-blur-sm transition-colors hover:bg-red-500/50"
                                            style={{ background: 'rgba(0,0,0,0.5)' }}>
                                        <X size={12} className="text-white"/>
                                    </button>
                                </div>

                                {/* Category badge */}
                                <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold"
                                          style={{ background: `${color}90`, color: 'white', backdropFilter: 'blur(4px)' }}>
                                        {CAT_ICON[img.category]} {img.category}
                                    </span>
                                </div>

                                {/* Bottom info */}
                                <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                                    <p className="text-white text-xs font-black truncate leading-tight">{img.title}</p>
                                    <div className="flex items-center justify-between mt-0.5">
                                        <p className="text-[9px]" style={{ color: 'rgba(255,255,255,0.5)' }}>
                                            {img.farmName && `${img.farmName} · `}{img.date}
                                        </p>
                                        <Maximize2 size={11} className="text-white opacity-60"/>
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {/* Upload placeholder */}
                    <div onClick={() => inputRef.current?.click()}
                         className="aspect-[4/3] rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all"
                         style={{ border: '2px dashed rgba(255,255,255,0.08)' }}
                         onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(34,197,94,0.3)'}
                         onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}>
                        <Upload size={22} className="mb-2" style={{ color: 'rgba(255,255,255,0.2)' }}/>
                        <p className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.2)' }}>Thêm ảnh</p>
                    </div>
                </div>
            )}

            {/* Lightbox */}
            {lightbox !== null && lightboxIdx >= 0 && (
                <Lightbox
                    image={filtered[lightboxIdx]}
                    onClose={() => setLightbox(null)}
                    onPrev={() => setLightbox(filtered[(lightboxIdx - 1 + filtered.length) % filtered.length].id)}
                    onNext={() => setLightbox(filtered[(lightboxIdx + 1) % filtered.length].id)}
                />
            )}
        </div>
    );
}