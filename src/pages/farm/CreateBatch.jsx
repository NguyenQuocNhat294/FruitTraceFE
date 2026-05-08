// src/pages/farm/CreateBatch.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, RefreshCw } from 'lucide-react';
import { batchService }   from '../../services/batchService';
import { farmService }    from '../../services/farmService';
import { productService } from '../../services/productService';
import { useAuth } from '../../hooks/useAuth';

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

    const handleSubmit = async () => {
        setError('');
        if (!form.farmid)      return setError('Vui lòng chọn nông trại');
        if (!form.productid)   return setError('Vui lòng chọn sản phẩm');
        if (!form.quantitykg)  return setError('Vui lòng nhập số lượng');
        if (!form.harvestdate) return setError('Vui lòng chọn ngày thu hoạch');
        if (!form.expirydate)  return setError('Vui lòng chọn ngày hết hạn');
        if (Number(form.quantitykg) <= 0) return setError('Số lượng phải lớn hơn 0');
        if (new Date(form.expirydate) <= new Date(form.harvestdate))
            return setError('Ngày hết hạn phải sau ngày thu hoạch');

        setSaving(true);
        try {
            await batchService.create({
                ...form,
                quantitykg: Number(form.quantitykg),
            });
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
        background:   'rgba(4,9,20,0.9)',
        border:       '1px solid rgba(255,255,255,0.1)',
        color:        'white',
        borderRadius: '12px',
        padding:      '10px 14px',
        width:        '100%',
        fontSize:     '14px',
        outline:      'none',
    };

    const labelStyle = {
        color:          'rgba(255,255,255,0.5)',
        fontSize:       '11px',
        fontWeight:     '700',
        textTransform:  'uppercase',
        letterSpacing:  '0.08em',
        marginBottom:   '6px',
        display:        'block',
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
                                   placeholder="VD: 500"
                                   style={inputStyle}/>
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

                    {/* Ngày */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label style={labelStyle}>Ngày thu hoạch *</label>
                            <input type="date" value={form.harvestdate}
                                   onChange={e => set('harvestdate', e.target.value)}
                                   style={inputStyle}/>
                        </div>
                        <div>
                            <label style={labelStyle}>Ngày đóng gói</label>
                            <input type="date" value={form.packagingdate}
                                   onChange={e => set('packagingdate', e.target.value)}
                                   style={inputStyle}/>
                        </div>
                    </div>

                    <div>
                        <label style={labelStyle}>Ngày hết hạn *</label>
                        <input type="date" value={form.expirydate}
                               onChange={e => set('expirydate', e.target.value)}
                               style={inputStyle}/>
                    </div>

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