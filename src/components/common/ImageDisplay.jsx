// src/components/common/ImageDisplay.jsx
import React, { useState } from 'react';

// Parse chuỗi ảnh từ MongoDB: "/images/a.jpg,b.jpg" → array URLs
export function parseImages(imageStr = '') {
    if (!imageStr) return [];
    const BASE = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000';

    return imageStr
        .split(',')
        .map(s => s.trim())
        .filter(Boolean)
        .map(path => {
            if (path.startsWith('http')) return path;
            // Có /images/ hoặc /xxx/ ở đầu → thêm BASE
            if (path.startsWith('/')) return `${BASE}${path}`;
            // Không có / → tự thêm /images/ prefix
            return `${BASE}/images/${path}`;  // ← thêm dòng này
        });
}
// Fallback emoji theo loại
const FALLBACK = {
    product: '🍊',
    farm:    '🌾',
    user:    '👤',
    batch:   '📦',
    trace:   '📷',
};

// ── 1. Ảnh đơn — dùng trong card, table row, avatar ──────────────
export function SingleImage({ imageStr, alt = '', className = '', type = 'product', fallbackSize = 'text-3xl' }) {
    const [error, setError] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const images = parseImages(imageStr);
    const src = images[0];

    if (!src || error) return (
        <div className={`flex items-center justify-center ${fallbackSize} ${className}`}
             style={{ background: 'rgba(148,163,184,0.06)' }}>
            {FALLBACK[type]}
        </div>
    );

    return (
        <div className={`relative overflow-hidden ${className}`}>
            {!loaded && (
                <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(15,23,42,0.6)' }}>
                    <div className="w-5 h-5 border-2 border-slate-600 border-t-sky-400 rounded-full animate-spin" />
                </div>
            )}
            <img src={src} alt={alt}
                 className={`w-full h-full object-cover transition-all duration-500 ${loaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`}
                 onLoad={() => setLoaded(true)}
                 onError={() => setError(true)} />
        </div>
    );
}

// ── 2. Gallery nhiều ảnh — dùng cho trang chi tiết ──────────────
export function ImageGallery({ imageStr, alt = '', className = '' }) {
    const [active, setActive] = useState(0);
    const [errors, setErrors] = useState({});
    const [loaded, setLoaded] = useState({});
    const images = parseImages(imageStr);

    if (images.length === 0) return (
        <div className={`flex items-center justify-center text-5xl rounded-2xl ${className}`}
             style={{ background: 'rgba(148,163,184,0.06)', minHeight: '200px' }}>
            🍊
        </div>
    );

    return (
        <div className={className}>
            {/* Main image */}
            <div className="relative rounded-2xl overflow-hidden mb-3" style={{ minHeight: '220px', background: 'rgba(15,23,42,0.8)' }}>
                {!loaded[active] && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-8 h-8 border-2 border-slate-700 border-t-sky-400 rounded-full animate-spin" />
                    </div>
                )}
                {errors[active] ? (
                    <div className="w-full h-56 flex items-center justify-center text-5xl">🍊</div>
                ) : (
                    <img src={images[active]} alt={`${alt} ${active + 1}`}
                         className={`w-full h-56 object-cover transition-all duration-500 ${loaded[active] ? 'opacity-100' : 'opacity-0'}`}
                         onLoad={() => setLoaded(p => ({ ...p, [active]: true }))}
                         onError={() => setErrors(p => ({ ...p, [active]: true }))} />
                )}

                {/* Counter badge */}
                {images.length > 1 && (
                    <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full text-xs font-bold text-white"
                         style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}>
                        {active + 1} / {images.length}
                    </div>
                )}

                {/* Nav arrows */}
                {images.length > 1 && <>
                    <button onClick={() => setActive(p => (p - 1 + images.length) % images.length)}
                            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center text-white transition-all hover:scale-110"
                            style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}>‹</button>
                    <button onClick={() => setActive(p => (p + 1) % images.length)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center text-white transition-all hover:scale-110"
                            style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}>›</button>
                </>}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                    {images.map((src, i) => (
                        <button key={i} onClick={() => setActive(i)}
                                className="flex-shrink-0 w-14 h-14 rounded-xl overflow-hidden transition-all"
                                style={{ border: `2px solid ${i === active ? '#38bdf8' : 'rgba(148,163,184,0.1)'}`, boxShadow: i === active ? '0 0 12px rgba(56,189,248,0.4)' : 'none' }}>
                            {errors[i] ? (
                                <div className="w-full h-full flex items-center justify-center text-xl" style={{ background: 'rgba(148,163,184,0.06)' }}>🍊</div>
                            ) : (
                                <img src={src} alt={`thumb ${i}`} className="w-full h-full object-cover"
                                     onError={() => setErrors(p => ({ ...p, [i]: true }))} />
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

// ── 3. Avatar user ──────────────────────────────────────────────
export function UserAvatar({ avatarStr, name = '', size = 'md', className = '' }) {
    const [error, setError] = useState(false);
    const images = parseImages(avatarStr);
    const src = images[0];

    const sizeMap = { sm: 'w-7 h-7 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-14 h-14 text-lg', xl: 'w-20 h-20 text-2xl' };
    const sizeClass = sizeMap[size] || sizeMap.md;

    if (!src || error) return (
        <div className={`${sizeClass} ${className} rounded-full flex items-center justify-center font-black text-white flex-shrink-0`}
             style={{ background: 'linear-gradient(135deg, #38bdf8, #818cf8)' }}>
            {name.charAt(0).toUpperCase() || '👤'}
        </div>
    );

    return (
        <img src={src} alt={name}
             className={`${sizeClass} ${className} rounded-full object-cover flex-shrink-0`}
             onError={() => setError(true)} />
    );
}

// ── 4. Farm image card ──────────────────────────────────────────
export function FarmImage({ imageStr, alt = '', className = '' }) {
    const [error, setError] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const images = parseImages(imageStr);
    const src = images[0];

    if (!src || error) return (
        <div className={`flex items-center justify-center text-4xl ${className}`}
             style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(56,189,248,0.08))' }}>
            🌾
        </div>
    );

    return (
        <div className={`relative overflow-hidden ${className}`}>
            {!loaded && <div className="absolute inset-0 flex items-center justify-center text-3xl" style={{ background: 'rgba(15,23,42,0.8)' }}>🌾</div>}
            <img src={src} alt={alt}
                 className={`w-full h-full object-cover transition-all duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}
                 onLoad={() => setLoaded(true)}
                 onError={() => setError(true)} />
        </div>
    );
}

// ── 5. Evidence image trong TracePage ──────────────────────────
export function EvidenceImage({ imageStr, alt = '', className = '' }) {
    const [error, setError] = useState(false);
    const images = parseImages(imageStr);
    const src = images[0];

    if (!src || error) return null;

    return (
        <img src={src} alt={alt}
             className={`rounded-xl object-cover ${className}`}
             onError={() => setError(true)} />
    );
}

// ── 6. Product card image (với hover zoom) ──────────────────────
export function ProductCardImage({ imageStr, alt = '', className = '' }) {
    const [error, setError] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const images = parseImages(imageStr);
    const src = images[0];

    if (!src || error) return (
        <div className={`flex items-center justify-center text-4xl ${className}`}
             style={{ background: 'linear-gradient(135deg, rgba(56,189,248,0.08), rgba(129,140,248,0.06))' }}>
            🍊
        </div>
    );

    return (
        <div className={`relative overflow-hidden ${className}`}>
            {!loaded && <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(15,23,42,0.8)' }}>
                <div className="w-6 h-6 border-2 border-slate-700 border-t-sky-400 rounded-full animate-spin" />
            </div>}
            <img src={src} alt={alt}
                 className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-110 ${loaded ? 'opacity-100' : 'opacity-0'}`}
                 onLoad={() => setLoaded(true)}
                 onError={() => setError(true)} />
        </div>
    );
}

// Default export
export default SingleImage;