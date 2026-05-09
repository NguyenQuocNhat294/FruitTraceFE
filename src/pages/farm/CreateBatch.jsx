// src/pages/farm/CreateBatch.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, RefreshCw, CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { batchService }   from '../../services/batchService';
import { farmService }    from '../../services/farmService';
import { productService } from '../../services/productService';
import { useAuth } from '../../hooks/useAuth';

// ── Vietnamese Calendar Picker ──────────────────────────────────────────────
const VI_MONTHS = ['Tháng 1','Tháng 2','Tháng 3','Tháng 4','Tháng 5','Tháng 6',
                   'Tháng 7','Tháng 8','Tháng 9','Tháng 10','Tháng 11','Tháng 12'];
const VI_DAYS   = ['CN','T2','T3','T4','T5','T6','T7'];

function parseYMD(str) {
    if (!str) return null;
    const [y,m,d] = str.split('-').map(Number);
    return new Date(y, m-1, d);
}
function toYMD(date) {
    if (!date) return '';
    const y = date.getFullYear();
    const m = String(date.getMonth()+1).padStart(2,'0');
    const d = String(date.getDate()).padStart(2,'0');
    return `${y}-${m}-${d}`;
}
function formatDMY(str) {
    if (!str) return '';
    const [y,m,d] = str.split('-');
    return `${d}/${m}/${y}`;
}
function getDaysInMonth(year, month) {
    return new Date(year, month+1, 0).getDate();
}
function getFirstDayOfMonth(year, month) {
    return new Date(year, month, 1).getDay(); // 0=Sun
}

function DatePicker({ label, required, value, onChange, minDate, maxDate, placeholder }) {
    const [open, setOpen]     = useState(false);
    const [viewY, setViewY]   = useState(() => {
        const d = parseYMD(value) || new Date();
        return d.getFullYear();
    });
    const [viewM, setViewM]   = useState(() => {
        const d = parseYMD(value) || new Date();
        return d.getMonth();
    });
    const ref = useRef(null);

    // Close on outside click
    useEffect(() => {
        if (!open) return;
        const handler = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [open]);

    // Sync view when value changes externally
    useEffect(() => {
        if (value) {
            const d = parseYMD(value);
            if (d) { setViewY(d.getFullYear()); setViewM(d.getMonth()); }
        }
    }, [value]);

    const prevMonth = () => {
        if (viewM === 0) { setViewM(11); setViewY(y => y-1); }
        else setViewM(m => m-1);
    };
    const nextMonth = () => {
        if (viewM === 11) { setViewM(0); setViewY(y => y+1); }
        else setViewM(m => m+1);
    };

    const days     = getDaysInMonth(viewY, viewM);
    const firstDay = getFirstDayOfMonth(viewY, viewM);
    const cells    = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= days; d++) cells.push(d);

    const isSelected = d => {
        if (!d || !value) return false;
        const sel = parseYMD(value);
        return sel && sel.getFullYear()===viewY && sel.getMonth()===viewM && sel.getDate()===d;
    };
    const isDisabled = d => {
        if (!d) return false;
        const dt = new Date(viewY, viewM, d);
        if (minDate && dt < parseYMD(minDate)) return true;
        if (maxDate && dt > parseYMD(maxDate)) return true;
        return false;
    };
    const isToday = d => {
        if (!d) return false;
        const now = new Date();
        return now.getFullYear()===viewY && now.getMonth()===viewM && now.getDate()===d;
    };

    const select = d => {
        if (!d || isDisabled(d)) return;
        onChange(toYMD(new Date(viewY, viewM, d)));
        setOpen(false);
    };

    const labelStyle = {
        color:'rgba(255,255,255,0.5)', fontSize:'11px', fontWeight:'700',
        textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'6px', display:'block',
    };

    return (
        <div style={{ position:'relative' }} ref={ref}>
            <label style={labelStyle}>{label}{required && ' *'}</label>
            {/* Trigger */}
            <button
                type="button"
                onClick={() => setOpen(o => !o)}
                style={{
                    background: open ? 'rgba(34,197,94,0.08)' : 'rgba(4,9,20,0.9)',
                    border: `1px solid ${open ? 'rgba(34,197,94,0.4)' : 'rgba(255,255,255,0.1)'}`,
                    color: value ? 'white' : 'rgba(255,255,255,0.3)',
                    borderRadius:'12px', padding:'10px 14px', width:'100%',
                    fontSize:'14px', textAlign:'left', cursor:'pointer',
                    display:'flex', alignItems:'center', justifyContent:'space-between',
                    transition:'all 0.2s',
                }}
            >
                <span>{value ? formatDMY(value) : (placeholder || 'Chọn ngày')}</span>
                <CalendarDays size={15} style={{ color: open ? '#22c55e' : 'rgba(255,255,255,0.3)', flexShrink:0 }}/>
            </button>

            {/* Calendar dropdown */}
            {open && (
                <div style={{
                    position:'absolute', zIndex:9999, top:'calc(100% + 6px)', left:0,
                    background:'rgba(6,12,28,0.98)', border:'1px solid rgba(34,197,94,0.25)',
                    borderRadius:'16px', padding:'16px', width:'280px',
                    boxShadow:'0 20px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(34,197,94,0.1)',
                    backdropFilter:'blur(20px)',
                }}>
                    {/* Month nav */}
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'12px' }}>
                        <button type="button" onClick={prevMonth} style={{
                            background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.08)',
                            borderRadius:'8px', width:'28px', height:'28px', cursor:'pointer',
                            color:'rgba(255,255,255,0.6)', display:'flex', alignItems:'center', justifyContent:'center',
                        }}>
                            <ChevronLeft size={14}/>
                        </button>
                        <span style={{ color:'white', fontWeight:'800', fontSize:'13px', letterSpacing:'0.02em' }}>
                            {VI_MONTHS[viewM]} {viewY}
                        </span>
                        <button type="button" onClick={nextMonth} style={{
                            background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.08)',
                            borderRadius:'8px', width:'28px', height:'28px', cursor:'pointer',
                            color:'rgba(255,255,255,0.6)', display:'flex', alignItems:'center', justifyContent:'center',
                        }}>
                            <ChevronRight size={14}/>
                        </button>
                    </div>

                    {/* Day headers */}
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:'2px', marginBottom:'4px' }}>
                        {VI_DAYS.map(d => (
                            <div key={d} style={{
                                textAlign:'center', fontSize:'10px', fontWeight:'700',
                                color: d==='CN' ? 'rgba(248,113,113,0.7)' : 'rgba(255,255,255,0.3)',
                                padding:'4px 0',
                            }}>{d}</div>
                        ))}
                    </div>

                    {/* Day cells */}
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:'2px' }}>
                        {cells.map((d, i) => {
                            const sel  = isSelected(d);
                            const dis  = isDisabled(d);
                            const tod  = isToday(d);
                            const isSun = (i % 7) === 0;
                            return (
                                <button
                                    key={i}
                                    type="button"
                                    onClick={() => select(d)}
                                    disabled={!d || dis}
                                    style={{
                                        height:'32px', borderRadius:'8px', fontSize:'12px',
                                        fontWeight: sel ? '800' : tod ? '700' : '500',
                                        cursor: !d || dis ? 'default' : 'pointer',
                                        border: tod && !sel ? '1px solid rgba(34,197,94,0.4)' : '1px solid transparent',
                                        background: sel
                                            ? 'linear-gradient(135deg,#16a34a,#22c55e)'
                                            : tod ? 'rgba(34,197,94,0.1)' : 'transparent',
                                        color: sel ? 'white'
                                            : dis ? 'rgba(255,255,255,0.12)'
                                            : isSun ? 'rgba(248,113,113,0.8)'
                                            : tod ? '#4ade80'
                                            : 'rgba(255,255,255,0.75)',
                                        boxShadow: sel ? '0 2px 8px rgba(34,197,94,0.4)' : 'none',
                                        transition:'all 0.15s',
                                    }}
                                    onMouseEnter={e => {
                                        if (!sel && d && !dis) e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                                    }}
                                    onMouseLeave={e => {
                                        if (!sel && d && !dis) e.currentTarget.style.background = tod ? 'rgba(34,197,94,0.1)' : 'transparent';
                                    }}
                                >
                                    {d || ''}
                                </button>
                            );
                        })}
                    </div>

                    {/* Quick: Hôm nay */}
                    <div style={{ borderTop:'1px solid rgba(255,255,255,0.06)', marginTop:'12px', paddingTop:'10px' }}>
                        <button type="button" onClick={() => {
                            const today = toYMD(new Date());
                            if (!isDisabled(new Date().getDate())) { onChange(today); setOpen(false); }
                        }} style={{
                            width:'100%', padding:'6px', borderRadius:'8px', fontSize:'11px', fontWeight:'700',
                            background:'rgba(34,197,94,0.08)', border:'1px solid rgba(34,197,94,0.2)',
                            color:'#4ade80', cursor:'pointer', letterSpacing:'0.04em',
                        }}>
                            📅 Hôm nay
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function CreateBatch() {
    const navigate           = useNavigate();
    const { user: authUser } = useAuth();

    const [farms, setFarms]       = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading]   = useState(false);
    const [saving, setSaving]     = useState(false);
    const [error, setError]       = useState('');

    const [form, setForm] = useState({
        farmid:        '',
        productid:     '',
        quantitykg:    '',
        harvestdate:   '',
        packagingdate: '',
        expirydate:    '',
        status:        'available',
    });

    useEffect(() => {
        if (!authUser) return;
        setLoading(true);
        Promise.all([
            farmService.getAll(),
            productService.getAll(),
        ]).then(([farmRes, productRes]) => {
            const myFarms = (farmRes.data || []).filter(f =>
                f.OwnerId === authUser.id || f.OwnerId === authUser._id
            );
            setFarms(myFarms);
            setProducts(productRes.data || []);
            if (myFarms.length > 0) {
                setForm(p => ({ ...p, farmid: myFarms[0].id || myFarms[0]._id }));
            }
        }).catch(() => {})
        .finally(() => setLoading(false));
    }, [authUser?.id]);

    const set = (key, val) => setForm(p => ({ ...p, [key]: val }));

    // Auto-adjust downstream dates when a date changes
    const setDate = (key, val) => {
        setForm(p => {
            const next = { ...p, [key]: val };
            // packagingdate must be >= harvestdate
            if (key === 'harvestdate' && next.packagingdate && val > next.packagingdate)
                next.packagingdate = val;
            // expirydate must be > packagingdate (or harvestdate if no packaging)
            const base = next.packagingdate || next.harvestdate;
            if ((key === 'harvestdate' || key === 'packagingdate') && next.expirydate && base >= next.expirydate)
                next.expirydate = '';
            return next;
        });
    };

    const handleSubmit = async () => {
        setError('');
        if (!form.farmid)      return setError('Vui lòng chọn nông trại');
        if (!form.productid)   return setError('Vui lòng chọn sản phẩm');
        if (!form.quantitykg)  return setError('Vui lòng nhập số lượng');
        if (!form.harvestdate) return setError('Vui lòng chọn ngày thu hoạch');
        if (!form.expirydate)  return setError('Vui lòng chọn ngày hết hạn');
        if (Number(form.quantitykg) <= 0) return setError('Số lượng phải lớn hơn 0');
        if (form.packagingdate && form.packagingdate < form.harvestdate)
            return setError('Ngày đóng gói phải từ ngày thu hoạch trở đi');
        if (form.expirydate <= (form.packagingdate || form.harvestdate))
            return setError('Ngày hết hạn phải sau ngày đóng gói (hoặc thu hoạch)');

        setSaving(true);
        try {
            await batchService.create({ ...form, quantitykg: Number(form.quantitykg) });
            navigate('/farm/mybatches');
        } catch (err) {
            setError(err?.response?.data?.message || 'Tạo lô hàng thất bại');
        } finally {
            setSaving(false);
        }
    };

    const STATUS_OPTIONS = [
        { val: 'available', label: 'Có sẵn'     },
        { val: 'harvested', label: 'Thu hoạch'  },
        { val: 'shipping',  label: 'Vận chuyển' },
        { val: 'sold',      label: 'Đã bán'     },
    ];

    const inputStyle = {
        background:'rgba(4,9,20,0.9)', border:'1px solid rgba(255,255,255,0.1)',
        color:'white', borderRadius:'12px', padding:'10px 14px', width:'100%',
        fontSize:'14px', outline:'none',
    };
    const labelStyle = {
        color:'rgba(255,255,255,0.5)', fontSize:'11px', fontWeight:'700',
        textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'6px', display:'block',
    };

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <RefreshCw size={24} className="animate-spin text-green-400"/>
        </div>
    );

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button onClick={() => navigate('/farm/mybatches')}
                        className="p-2.5 rounded-xl transition-all hover:bg-white/10"
                        style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', color:'rgba(255,255,255,0.6)' }}>
                    <ArrowLeft size={16}/>
                </button>
                <div>
                    <h1 className="text-2xl font-black text-white" style={{ fontFamily:'Syne,sans-serif' }}>
                        📦 Tạo lô hàng mới
                    </h1>
                    <p className="text-sm mt-0.5" style={{ color:'rgba(255,255,255,0.35)' }}>
                        Điền thông tin lô hàng thu hoạch
                    </p>
                </div>
            </div>

            {/* Form */}
            <div className="rounded-2xl overflow-hidden"
                 style={{ background:'rgba(4,9,20,0.7)', border:'1px solid rgba(255,255,255,0.07)' }}>
                <div className="h-1 w-full" style={{ background:'linear-gradient(90deg,#16a34a,#22c55e,#38bdf8)' }}/>
                <div className="p-6 space-y-5">

                    {/* Error */}
                    {error && (
                        <div className="px-4 py-3 rounded-xl text-sm font-medium"
                             style={{ background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.25)', color:'#fca5a5' }}>
                            ⚠ {error}
                        </div>
                    )}

                    {/* Farm */}
                    <div>
                        <label style={labelStyle}>Nông trại *</label>
                        <select value={form.farmid} onChange={e => set('farmid', e.target.value)} style={inputStyle}>
                            <option value="">-- Chọn nông trại --</option>
                            {farms.map(f => (
                                <option key={f.id || f._id} value={f.id || f._id}>
                                    {f.FarmName} ({f.id || f._id})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Product */}
                    <div>
                        <label style={labelStyle}>Sản phẩm *</label>
                        <select value={form.productid} onChange={e => set('productid', e.target.value)} style={inputStyle}>
                            <option value="">-- Chọn sản phẩm --</option>
                            {products.map(p => (
                                <option key={p.id || p._id} value={p.id || p._id}>
                                    {p.name} ({p.id || p._id})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Số lượng + Trạng thái */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label style={labelStyle}>Số lượng (kg) *</label>
                            <input type="number" min="1" value={form.quantitykg}
                                   onChange={e => set('quantitykg', e.target.value)}
                                   placeholder="VD: 500" style={inputStyle}/>
                        </div>
                        <div>
                            <label style={labelStyle}>Trạng thái</label>
                            <select value={form.status} onChange={e => set('status', e.target.value)} style={inputStyle}>
                                {STATUS_OPTIONS.map(s => (
                                    <option key={s.val} value={s.val}>{s.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* ── Date pickers ── */}
                    <div className="grid grid-cols-2 gap-4">
                        <DatePicker
                            label="Ngày thu hoạch" required
                            value={form.harvestdate}
                            onChange={val => setDate('harvestdate', val)}
                            placeholder="DD/MM/YYYY"
                        />
                        <DatePicker
                            label="Ngày đóng gói"
                            value={form.packagingdate}
                            onChange={val => setDate('packagingdate', val)}
                            minDate={form.harvestdate || undefined}
                            placeholder="DD/MM/YYYY"
                        />
                    </div>

                    <DatePicker
                        label="Ngày hết hạn" required
                        value={form.expirydate}
                        onChange={val => setDate('expirydate', val)}
                        minDate={
                            form.packagingdate
                                ? (() => { const d = new Date(form.packagingdate); d.setDate(d.getDate()+1); return toYMD(d); })()
                                : form.harvestdate
                                    ? (() => { const d = new Date(form.harvestdate); d.setDate(d.getDate()+1); return toYMD(d); })()
                                    : undefined
                        }
                        placeholder="DD/MM/YYYY"
                    />

                    {/* Visual timeline */}
                    {(form.harvestdate || form.packagingdate || form.expirydate) && (
                        <div style={{
                            background:'rgba(34,197,94,0.05)', border:'1px solid rgba(34,197,94,0.15)',
                            borderRadius:'12px', padding:'12px 16px',
                        }}>
                            <p style={{ color:'rgba(255,255,255,0.35)', fontSize:'10px', fontWeight:'700', letterSpacing:'0.08em', marginBottom:'10px' }}>
                                TIMELINE LÔ HÀNG
                            </p>
                            <div style={{ display:'flex', alignItems:'center', gap:'6px', flexWrap:'wrap' }}>
                                {[
                                    { icon:'🌾', label:'Thu hoạch', val:form.harvestdate, color:'#22c55e' },
                                    { icon:'📦', label:'Đóng gói',  val:form.packagingdate, color:'#38bdf8' },
                                    { icon:'⏰', label:'Hết hạn',   val:form.expirydate,    color:'#f87171' },
                                ].map((item, i, arr) => (
                                    <React.Fragment key={i}>
                                        <div style={{ textAlign:'center', minWidth:'80px' }}>
                                            <div style={{ fontSize:'18px', marginBottom:'2px' }}>{item.icon}</div>
                                            <div style={{ fontSize:'10px', color: item.val ? item.color : 'rgba(255,255,255,0.2)', fontWeight:'700' }}>
                                                {item.label}
                                            </div>
                                            <div style={{ fontSize:'11px', color: item.val ? 'white' : 'rgba(255,255,255,0.2)', marginTop:'2px' }}>
                                                {item.val ? formatDMY(item.val) : '—'}
                                            </div>
                                        </div>
                                        {i < arr.length - 1 && (
                                            <div style={{ flex:1, height:'1px', background: item.val ? `linear-gradient(90deg,${item.color}60,rgba(255,255,255,0.1))` : 'rgba(255,255,255,0.08)', minWidth:'16px' }}/>
                                        )}
                                    </React.Fragment>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Buttons */}
                    <div className="flex gap-3 pt-2">
                        <button onClick={() => navigate('/farm/mybatches')}
                                className="flex-1 py-3 rounded-xl text-sm font-bold transition-all hover:bg-white/10"
                                style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', color:'rgba(255,255,255,0.6)' }}>
                            Hủy
                        </button>
                        <button onClick={handleSubmit} disabled={saving}
                                className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white transition-all hover:brightness-110 disabled:opacity-60"
                                style={{ flex:2, background:'linear-gradient(135deg,#16a34a,#22c55e)', boxShadow:'0 4px 16px rgba(34,197,94,0.35)' }}>
                            {saving
                                ? <><RefreshCw size={15} className="animate-spin"/>Đang lưu...</>
                                : <><Save size={15}/>Tạo lô hàng</>
                            }
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
