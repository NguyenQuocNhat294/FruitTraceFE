// src/pages/ProductsPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
    Search, X, Star, Package, RefreshCw, Filter,
    ChevronRight, Home, ShieldCheck, Leaf, ArrowUpDown,
    ZoomIn, QrCode, MapPin, Weight, Grid, List
} from 'lucide-react';
import { productService } from '../services/productService';
import { ProductCardImage, ImageGallery } from '../components/common/ImageDisplay';

/* ── Helpers ── */
const fmt = (n) => (n || 0).toLocaleString('vi-VN');
const Stars = ({ rating, size = 13 }) => (
    <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, i) => (
            <Star key={i} size={size}
                  style={{ color: i < Math.round(rating) ? '#fbbf24' : 'rgba(255,255,255,0.1)' }}
                  fill="currentColor"/>
        ))}
    </div>
);

/* ── Lightbox ── */
const Lightbox = ({ src, onClose }) => (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[60] flex items-center justify-center p-4" onClick={onClose}>
        <button className="absolute top-4 right-4 p-2 rounded-full text-white hover:bg-white/10" onClick={onClose}><X size={20}/></button>
        <img src={src} alt="" className="max-w-full max-h-[85vh] rounded-2xl object-contain" onClick={e=>e.stopPropagation()}/>
    </div>
);

/* ── Product Card ── */
const ProductCard = ({ product, onClick, view }) => {
    const [imgError, setImgError] = useState(false);
    const [imgLoaded, setImgLoaded] = useState(false);

  // ✅ MỚI — thay vào
const parseFirst = (str) => {
    if (!str) return null;
    const first = str.split(',')[0].trim();
    if (!first) return null;
    if (first.startsWith('http://') || first.startsWith('https://')) return first;
    return first.startsWith('/') ? first : `/${first}`;
};
    const src = parseFirst(product.image);

    if (view === 'list') return (
        <div onClick={()=>onClick(product)}
             className="flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all hover:bg-white/[0.04] group"
             style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.07)' }}>
            <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0" style={{ background:'rgba(255,255,255,0.04)' }}>
                {src && !imgError
                    ? <img src={src} alt={product.name} className="w-full h-full object-cover" onError={()=>setImgError(true)}/>
                    : <div className="w-full h-full flex items-center justify-center text-2xl">🍊</div>
                }
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider mb-0.5" style={{ color:'rgba(34,197,94,0.7)' }}>{product.CategoryId}</p>
                <h3 className="font-black text-white text-sm truncate">{product.name}</h3>
                <p className="text-xs truncate mt-0.5" style={{ color:'rgba(255,255,255,0.35)' }}>{product.description}</p>
            </div>
            <div className="text-right flex-shrink-0">
                <div className="font-black text-white">{fmt(product.price)}đ</div>
                <div className="text-xs" style={{ color:'rgba(255,255,255,0.3)' }}>/{product.unit}</div>
            </div>
            <ChevronRight size={16} className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color:'#22c55e' }}/>
        </div>
    );

    return (
        <div onClick={()=>onClick(product)}
             className="rounded-2xl overflow-hidden cursor-pointer group transition-all hover:-translate-y-1 hover:shadow-2xl"
             style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)' }}>

            {/* Image */}
            <div className="relative h-48 overflow-hidden" style={{ background:'rgba(255,255,255,0.04)' }}>
                {src && !imgError ? (
                    <>
                        {!imgLoaded && (
                            <div className="absolute inset-0 flex items-center justify-center text-4xl animate-pulse">🍊</div>
                        )}
                        <img src={src} alt={product.name}
                             className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-110 ${imgLoaded?'opacity-100':'opacity-0'}`}
                             onLoad={()=>setImgLoaded(true)}
                             onError={()=>setImgError(true)}/>
                    </>
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-5xl">🍊</div>
                )}

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"/>

                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                    {product.is_organic && (
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full"
                              style={{ background:'rgba(34,197,94,0.9)', color:'white' }}>🌿 Hữu cơ</span>
                    )}
                    {product.stock > 0 && product.stock < 50 && (
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full"
                              style={{ background:'rgba(251,191,36,0.9)', color:'#1a0a00' }}>🔥 Sắp hết</span>
                    )}
                </div>

                {/* Image count */}
                {product.image && product.image.split(',').length > 1 && (
                    <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-bold text-white"
                         style={{ background:'rgba(0,0,0,0.5)', backdropFilter:'blur(8px)' }}>
                        +{product.image.split(',').length-1}
                    </div>
                )}

                {/* View details */}
                <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                    <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold text-white"
                         style={{ background:'rgba(34,197,94,0.9)', backdropFilter:'blur(8px)' }}>
                        Xem chi tiết <ChevronRight size={11}/>
                    </div>
                </div>
            </div>

            {/* Info */}
            <div className="p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color:'rgba(34,197,94,0.7)' }}>{product.CategoryId}</p>
                <h3 className="font-black text-white text-sm leading-tight mb-1 line-clamp-1">{product.name}</h3>
                <p className="text-xs leading-relaxed mb-3 line-clamp-2" style={{ color:'rgba(255,255,255,0.35)' }}>{product.description}</p>

                <div className="flex items-center justify-between">
                    <div>
                        <span className="text-base font-black" style={{ color:'#4ade80' }}>{fmt(product.price)}đ</span>
                        <span className="text-[10px] ml-1" style={{ color:'rgba(255,255,255,0.3)' }}>/{product.unit}</span>
                    </div>
                    {product.rating > 0 && (
                        <div className="flex items-center gap-1.5">
                            <Stars rating={product.rating} size={11}/>
                            <span className="text-[10px] font-bold" style={{ color:'rgba(255,255,255,0.4)' }}>{product.rating}</span>
                        </div>
                    )}
                </div>

                {product.stock !== undefined && (
                    <div className="mt-2.5 pt-2.5" style={{ borderTop:'1px solid rgba(255,255,255,0.06)' }}>
                        <div className="flex justify-between text-[10px] mb-1" style={{ color:'rgba(255,255,255,0.3)' }}>
                            <span>Tồn kho</span>
                            <span className="font-bold text-white">{product.stock} {product.unit}</span>
                        </div>
                        <div className="h-1 rounded-full overflow-hidden" style={{ background:'rgba(255,255,255,0.06)' }}>
                            <div className="h-full rounded-full"
                                 style={{ width:`${Math.min((product.stock/200)*100,100)}%`, background:'linear-gradient(90deg,#16a34a,#22c55e)' }}/>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

/* ── Product Modal ── */
const ProductModal = ({ product, onClose }) => {
    const [lightbox, setLightbox] = useState(null);
    if (!product) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl relative"
                 style={{ background:'rgba(6,12,20,0.98)', border:'1px solid rgba(255,255,255,0.1)', backdropFilter:'blur(20px)' }}
                 onClick={e=>e.stopPropagation()}>

                {/* Top line */}
                <div className="h-1 w-full rounded-t-3xl" style={{ background:'linear-gradient(90deg,#16a34a,#22c55e,#38bdf8)' }}/>

                <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-5">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color:'rgba(34,197,94,0.7)' }}>
                                {product.CategoryId} · {product.FarmId}
                            </p>
                            <h2 className="text-2xl font-black text-white" style={{ fontFamily:'Syne,sans-serif' }}>{product.name}</h2>
                        </div>
                        <button onClick={onClose}
                                className="p-2 rounded-xl transition-colors"
                                style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.08)' }}>
                            <X size={18} style={{ color:'rgba(255,255,255,0.6)' }}/>
                        </button>
                    </div>

                    {/* Gallery */}
                    <div className="rounded-2xl overflow-hidden mb-5" style={{ background:'rgba(255,255,255,0.03)' }}>
                        <ImageGallery imageStr={product.image} alt={product.name}/>
                    </div>

                    {/* Price + rating */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="rounded-2xl p-4" style={{ background:'rgba(34,197,94,0.08)', border:'1px solid rgba(34,197,94,0.15)' }}>
                            <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color:'rgba(34,197,94,0.6)' }}>Giá bán</p>
                            <p className="text-2xl font-black" style={{ color:'#4ade80', fontFamily:'Syne,sans-serif' }}>
                                {fmt(product.price)}đ
                            </p>
                            <p className="text-xs mt-0.5" style={{ color:'rgba(255,255,255,0.3)' }}>/{product.unit}</p>
                        </div>
                        <div className="rounded-2xl p-4" style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)' }}>
                            <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color:'rgba(255,255,255,0.3)' }}>Tồn kho</p>
                            <p className="text-2xl font-black text-white" style={{ fontFamily:'Syne,sans-serif' }}>{product.stock || 0}</p>
                            <p className="text-xs mt-0.5" style={{ color:'rgba(255,255,255,0.3)' }}>{product.unit}</p>
                        </div>
                    </div>

                    {/* Details grid */}
                    <div className="grid grid-cols-3 gap-2 mb-4">
                        {[
                            { icon:<MapPin size={13}/>,   label:'Nông trại',    val:product.FarmId || '—',   color:'#38bdf8' },
                            { icon:<Weight size={13}/>,   label:'Đơn vị',       val:product.unit || '—',     color:'#fbbf24' },
                            { icon:<Package size={13}/>,  label:'Danh mục',     val:product.CategoryId||'—', color:'#818cf8' },
                        ].map((item,i)=>(
                            <div key={i} className="rounded-xl p-3" style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)' }}>
                                <div className="flex items-center gap-1 mb-1.5" style={{ color:item.color }}>{item.icon}</div>
                                <p className="text-[9px] uppercase tracking-wider mb-1" style={{ color:'rgba(255,255,255,0.3)' }}>{item.label}</p>
                                <p className="text-xs font-bold text-white truncate">{item.val}</p>
                            </div>
                        ))}
                    </div>

                    {/* Rating */}
                    {product.rating > 0 && (
                        <div className="flex items-center gap-3 mb-4 px-4 py-3 rounded-xl"
                             style={{ background:'rgba(251,191,36,0.06)', border:'1px solid rgba(251,191,36,0.12)' }}>
                            <Stars rating={product.rating} size={16}/>
                            <span className="text-sm font-black text-white">{product.rating}/5</span>
                            <span className="text-xs" style={{ color:'rgba(255,255,255,0.3)' }}>Đánh giá chất lượng</span>
                        </div>
                    )}

                    {/* Description */}
                    {product.description && (
                        <div className="rounded-xl p-4 mb-4" style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)' }}>
                            <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color:'rgba(255,255,255,0.3)' }}>Mô tả</p>
                            <p className="text-sm leading-relaxed" style={{ color:'rgba(255,255,255,0.6)' }}>{product.description}</p>
                        </div>
                    )}

                    {/* CTA */}
                    <Link to="/trace"
                          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold text-white transition-all hover:brightness-110"
                          style={{ background:'linear-gradient(135deg,#16a34a,#22c55e)', boxShadow:'0 4px 20px rgba(34,197,94,0.35)' }}>
                        <QrCode size={16}/> Truy xuất nguồn gốc
                    </Link>
                </div>
            </div>
            {lightbox && <Lightbox src={lightbox} onClose={()=>setLightbox(null)}/>}
        </div>
    );
};

/* ════ MAIN ════ */
export default function ProductsPage() {
    const [products, setProducts]   = useState([]);
    const [loading, setLoading]     = useState(true);
    const [search, setSearch]       = useState('');
    const [category, setCategory]   = useState('');
    const [sortBy, setSortBy]       = useState('name');
    const [viewMode, setViewMode]   = useState('grid');
    const [selected, setSelected]   = useState(null);
    const [showSort, setShowSort]   = useState(false);
    const inputRef                  = useRef();

    useEffect(() => {
        productService.getAll()
            .then(r => setProducts(r.data || []))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const categories = [...new Set(products.map(p => p.CategoryId).filter(Boolean))];

    const filtered = products
        .filter(p =>
            (!search || (p.name||'').toLowerCase().includes(search.toLowerCase()) || (p.CategoryId||'').toLowerCase().includes(search.toLowerCase())) &&
            (!category || p.CategoryId === category)
        )
        .sort((a,b) => {
            if (sortBy === 'name')       return (a.name||'').localeCompare(b.name||'');
            if (sortBy === 'price_asc')  return (a.price||0) - (b.price||0);
            if (sortBy === 'price_desc') return (b.price||0) - (a.price||0);
            if (sortBy === 'rating')     return (b.rating||0) - (a.rating||0);
            if (sortBy === 'stock')      return (b.stock||0) - (a.stock||0);
            return 0;
        });

    const SORTS = [
        { val:'name',       label:'Tên A→Z' },
        { val:'price_asc',  label:'Giá thấp → cao' },
        { val:'price_desc', label:'Giá cao → thấp' },
        { val:'rating',     label:'Đánh giá cao nhất' },
        { val:'stock',      label:'Tồn kho nhiều nhất' },
    ];

    return (
        <div className="min-h-screen" style={{ background:'#060c14', fontFamily:"'DM Sans','Syne',system-ui,sans-serif" }}>

            {/* Background */}
            <div className="fixed inset-0 -z-10 pointer-events-none">
                <div className="absolute inset-0" style={{ background:'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(34,197,94,0.07) 0%, transparent 60%), #060c14' }}/>
                <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full opacity-[0.04]"
                     style={{ background:'radial-gradient(circle,#22c55e,transparent 70%)' }}/>
            </div>

            {/* Navbar */}
            <nav className="sticky top-0 z-30 h-14" style={{ background:'rgba(6,12,20,0.9)', borderBottom:'1px solid rgba(34,197,94,0.08)', backdropFilter:'blur(20px)' }}>
                <div className="max-w-7xl mx-auto h-full px-4 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background:'linear-gradient(135deg,#16a34a,#22c55e)' }}>
                            <span className="text-sm">🍊</span>
                        </div>
                        <span className="font-black text-white text-sm" style={{ fontFamily:'Syne,sans-serif' }}>FruitTrace</span>
                    </Link>
                    <div className="flex items-center gap-1 text-xs" style={{ color:'rgba(255,255,255,0.3)' }}>
                        <Link to="/" className="hover:text-white transition-colors flex items-center gap-1"><Home size={12}/> Trang chủ</Link>
                        <ChevronRight size={11}/>
                        <span className="text-white font-semibold">Sản phẩm</span>
                    </div>
                </div>
            </nav>

            {/* Hero */}
            <div className="pt-12 pb-10 px-4 text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-4"
                     style={{ background:'rgba(34,197,94,0.1)', border:'1px solid rgba(34,197,94,0.2)', color:'#4ade80' }}>
                    <Leaf size={11}/> Nông sản sạch, chất lượng cao
                </div>
                <h1 className="text-4xl font-black text-white mb-2" style={{ fontFamily:'Syne,sans-serif' }}>🍊 Sản phẩm</h1>
                <p className="text-sm" style={{ color:'rgba(255,255,255,0.4)' }}>Khám phá {products.length} sản phẩm nông sản tươi ngon từ các nông trại uy tín</p>
            </div>

            <div className="max-w-7xl mx-auto px-4 pb-16">

                {/* Toolbar */}
                <div className="flex flex-wrap gap-3 items-center mb-6">
                    {/* Search */}
                    <div className="relative flex-1 min-w-[200px]">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color:'rgba(255,255,255,0.3)' }}/>
                        <input ref={inputRef} value={search} onChange={e=>setSearch(e.target.value)}
                               placeholder="Tìm sản phẩm, danh mục..."
                               className="w-full pl-9 pr-9 py-2.5 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none"
                               style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)' }}/>
                        {search && (
                            <button onClick={()=>setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color:'rgba(255,255,255,0.3)' }}>
                                <X size={13}/>
                            </button>
                        )}
                    </div>

                    {/* Category filter */}
                    <div className="flex gap-1.5 flex-wrap">
                        <button onClick={()=>setCategory('')}
                                className="px-3 py-2 rounded-xl text-xs font-bold transition-all"
                                style={ !category
                                    ? { background:'rgba(34,197,94,0.15)', border:'1px solid rgba(34,197,94,0.3)', color:'#4ade80' }
                                    : { background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)', color:'rgba(255,255,255,0.4)' }
                                }>
                            Tất cả
                        </button>
                        {categories.slice(0,5).map(cat=>(
                            <button key={cat} onClick={()=>setCategory(cat)}
                                    className="px-3 py-2 rounded-xl text-xs font-bold transition-all"
                                    style={ category===cat
                                        ? { background:'rgba(34,197,94,0.15)', border:'1px solid rgba(34,197,94,0.3)', color:'#4ade80' }
                                        : { background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)', color:'rgba(255,255,255,0.4)' }
                                    }>
                                {cat}
                            </button>
                        ))}
                    </div>

                    {/* Sort */}
                    <div className="relative">
                        <button onClick={()=>setShowSort(!showSort)}
                                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold"
                                style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', color:'rgba(255,255,255,0.5)' }}>
                            <ArrowUpDown size={12}/> {SORTS.find(s=>s.val===sortBy)?.label}
                        </button>
                        {showSort && (
                            <div className="absolute right-0 top-full mt-1.5 w-48 rounded-xl overflow-hidden z-10 shadow-2xl"
                                 style={{ background:'rgba(4,9,20,0.98)', border:'1px solid rgba(255,255,255,0.08)' }}>
                                {SORTS.map(s=>(
                                    <button key={s.val} onClick={()=>{ setSortBy(s.val); setShowSort(false); }}
                                            className="w-full text-left px-4 py-2.5 text-xs font-semibold transition-colors"
                                            style={{ color:sortBy===s.val?'#4ade80':'rgba(255,255,255,0.5)', background:sortBy===s.val?'rgba(34,197,94,0.08)':'transparent' }}>
                                        {s.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* View toggle */}
                    <div className="flex rounded-xl overflow-hidden" style={{ border:'1px solid rgba(255,255,255,0.07)' }}>
                        {[{m:'grid',i:<Grid size={14}/>},{m:'list',i:<List size={14}/>}].map(v=>(
                            <button key={v.m} onClick={()=>setViewMode(v.m)} className="px-3 py-2 transition-all"
                                    style={{ background:viewMode===v.m?'rgba(34,197,94,0.15)':'transparent', color:viewMode===v.m?'#4ade80':'rgba(255,255,255,0.3)' }}>
                                {v.i}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Count */}
                {!loading && (
                    <p className="text-xs mb-4" style={{ color:'rgba(255,255,255,0.3)' }}>
                        <span className="font-bold text-white">{filtered.length}</span> sản phẩm{category ? ` · ${category}` : ''}
                        {search ? ` · tìm kiếm "${search}"` : ''}
                    </p>
                )}

                {/* Grid/List */}
                {loading ? (
                    <div className={viewMode==='grid' ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" : "space-y-3"}>
                        {[...Array(8)].map((_,i)=>(
                            <div key={i} className="rounded-2xl animate-pulse" style={{ height: viewMode==='grid'?'280px':'68px', background:'rgba(255,255,255,0.04)' }}/>
                        ))}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="rounded-3xl py-16 text-center" style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)' }}>
                        <div className="text-5xl mb-4">🔍</div>
                        <p className="font-black text-white mb-2">Không tìm thấy sản phẩm</p>
                        <p className="text-sm" style={{ color:'rgba(255,255,255,0.35)' }}>Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
                        <button onClick={()=>{ setSearch(''); setCategory(''); }}
                                className="mt-4 text-xs font-bold px-4 py-2 rounded-xl"
                                style={{ background:'rgba(34,197,94,0.12)', color:'#4ade80', border:'1px solid rgba(34,197,94,0.2)' }}>
                            Xóa bộ lọc
                        </button>
                    </div>
                ) : viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filtered.map(p => <ProductCard key={p._id} product={p} onClick={setSelected} view="grid"/>)}
                    </div>
                ) : (
                    <div className="space-y-2">
                        {filtered.map(p => <ProductCard key={p._id} product={p} onClick={setSelected} view="list"/>)}
                    </div>
                )}
            </div>

            <ProductModal product={selected} onClose={()=>setSelected(null)}/>

            <style dangerouslySetInnerHTML={{ __html:`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&family=Syne:wght@700;800&display=swap');
            `}}/>
        </div>
    );
}