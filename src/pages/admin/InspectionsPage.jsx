import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { inspectionService } from '../../services/inspectionService';

// ── Helpers ───────────────────────────────────────────────────────────────────
const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const RESULT_MAP = {
    pass:    { label: 'Đạt chuẩn',  icon: '✓', cls: 'bg-emerald-100 text-emerald-700 ring-emerald-200', dot: 'bg-emerald-500' },
    fail:    { label: 'Không đạt',  icon: '✕', cls: 'bg-red-100 text-red-700 ring-red-200',             dot: 'bg-red-500'     },
    pending: { label: 'Chờ duyệt',  icon: '◷', cls: 'bg-amber-100 text-amber-700 ring-amber-200',       dot: 'bg-amber-400'   },
};

const EMPTY_FORM = { batchcode: '', inspector: '', result: 'pending', note: '', date: '' };

// ── Sub-components ────────────────────────────────────────────────────────────
function ResultBadge({ result }) {
    const r = RESULT_MAP[result] || RESULT_MAP.pending;
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ring-1 ${r.cls}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${r.dot}`} />
            {r.label}
        </span>
    );
}

function StatCard({ label, value, color, icon, total }) {
    const pct = total > 0 ? Math.round((value / total) * 100) : 0;
    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${color.bg}`}>
                {icon}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-400 font-medium mb-0.5">{label}</p>
                <div className="flex items-end gap-2">
                    <span className={`text-2xl font-bold ${color.text}`}>{value}</span>
                    {total > 0 && <span className="text-xs text-gray-400 mb-0.5">{pct}%</span>}
                </div>
                {/* mini progress bar */}
                <div className="mt-1.5 h-1 bg-gray-100 rounded-full overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all duration-700 ${color.bar}`}
                        style={{ width: `${pct}%` }}
                    />
                </div>
            </div>
        </div>
    );
}

function Field({ label, required, error, children }) {
    return (
        <div>
            <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                {label} {required && <span className="text-red-400">*</span>}
            </label>
            {children}
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>
    );
}

const inputCls = 'w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 focus:bg-white transition';

// ── Main ──────────────────────────────────────────────────────────────────────
export default function InspectionsPage() {
    const [items, setItems]         = useState([]);
    const [loading, setLoading]     = useState(true);
    const [saving, setSaving]       = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm]           = useState(EMPTY_FORM);
    const [errors, setErrors]       = useState({});
    const [search, setSearch]       = useState('');
    const [filter, setFilter]       = useState('all');
    const [actionId, setActionId]   = useState(null);
    const [toast, setToast]         = useState(null); // { msg, type }

    // ── Toast ─────────────────────────────────────────────────────────────────
    const showToast = useCallback((msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    }, []);

    // ── Fetch ─────────────────────────────────────────────────────────────────
    const fetchInspections = useCallback(async () => {
        setLoading(true);
        try {
            const res = await inspectionService.getAll();
            setItems(res.data || []);
        } catch {
            showToast('Không thể tải danh sách kiểm định.', 'error');
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => { fetchInspections(); }, [fetchInspections]);

    // ── Stats ─────────────────────────────────────────────────────────────────
    const summary = useMemo(() => ({
        pass:    items.filter(i => i.result === 'pass').length,
        fail:    items.filter(i => i.result === 'fail').length,
        pending: items.filter(i => i.result === 'pending').length,
        total:   items.length,
    }), [items]);

    // ── Filtered list ─────────────────────────────────────────────────────────
    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        return items.filter(item => {
            const matchFilter = filter === 'all' || item.result === filter;
            const matchSearch = !q ||
                (item.inspectionCode || item.id || '').toLowerCase().includes(q) ||
                (item.batchcode || '').toLowerCase().includes(q) ||
                (item.inspector || '').toLowerCase().includes(q);
            return matchFilter && matchSearch;
        });
    }, [items, search, filter]);

    // ── Validate ──────────────────────────────────────────────────────────────
    const validate = () => {
        const e = {};
        if (!form.batchcode.trim())  e.batchcode  = 'Vui lòng nhập mã lô.';
        if (!form.inspector.trim())  e.inspector  = 'Vui lòng nhập tên kiểm định viên.';
        return e;
    };

    // ── Submit ────────────────────────────────────────────────────────────────
    const onSubmit = async (e) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length) { setErrors(errs); return; }
        setSaving(true);
        try {
            if (editingId) {
                await inspectionService.update(editingId, form);
                showToast('Cập nhật phiếu kiểm định thành công!');
            } else {
                await inspectionService.create(form);
                showToast('Tạo phiếu kiểm định thành công!');
            }
            await fetchInspections();
            resetForm();
        } catch {
            showToast('Không thể lưu phiếu kiểm định.', 'error');
        } finally {
            setSaving(false);
        }
    };

    const resetForm = () => {
        setEditingId(null);
        setForm(EMPTY_FORM);
        setErrors({});
    };

    const handleEdit = (item) => {
        setEditingId(item._id);
        setForm({
            batchcode: item.batchcode || '',
            inspector: item.inspector || '',
            result:    item.result    || 'pending',
            note:      item.note      || '',
            date:      item.date      ? item.date.slice(0, 10) : '',
        });
        setErrors({});
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (item) => {
        if (!window.confirm(`Xóa phiếu "${item.inspectionCode || item.id}"?`)) return;
        setActionId(item._id);
        try {
            await inspectionService.delete(item._id);
            setItems(prev => prev.filter(x => x._id !== item._id));
            showToast('Đã xóa phiếu kiểm định.');
        } catch {
            showToast('Không thể xóa phiếu.', 'error');
        } finally {
            setActionId(null);
        }
    };

    const updateResult = async (item, newResult) => {
        setActionId(item._id);
        try {
            await inspectionService.update(item._id, { ...item, result: newResult });
            setItems(prev => prev.map(x => x._id === item._id ? { ...x, result: newResult } : x));
            showToast(`Đã cập nhật kết quả: ${RESULT_MAP[newResult].label}`);
        } catch {
            showToast('Không thể cập nhật kết quả.', 'error');
        } finally {
            setActionId(null);
        }
    };

    const upd = (field) => (e) => {
        setForm(p => ({ ...p, [field]: e.target.value }));
        setErrors(p => ({ ...p, [field]: '' }));
    };

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">

            {/* ── Toast ── */}
            {toast && (
                <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg text-sm font-semibold transition-all
                    ${toast.type === 'error'
                        ? 'bg-red-600 text-white'
                        : 'bg-emerald-600 text-white'}`}>
                    <span>{toast.type === 'error' ? '✕' : '✓'}</span>
                    {toast.msg}
                </div>
            )}

            {/* ── Header ── */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Kiểm định & chứng nhận</h1>
                    <p className="text-gray-400 mt-1 text-sm">Quản lý phiếu kiểm định cho từng lô hàng trước khi phân phối.</p>
                </div>
                <button
                    onClick={fetchInspections}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-sm font-medium text-gray-600 transition"
                >
                    ↻ Làm mới
                </button>
            </div>

            {/* ── Stats ── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard label="Đạt chuẩn"  value={summary.pass}    total={summary.total} icon="✅"
                    color={{ bg: 'bg-emerald-50', text: 'text-emerald-600', bar: 'bg-emerald-500' }} />
                <StatCard label="Không đạt"  value={summary.fail}    total={summary.total} icon="❌"
                    color={{ bg: 'bg-red-50',     text: 'text-red-600',     bar: 'bg-red-500'     }} />
                <StatCard label="Chờ duyệt"  value={summary.pending} total={summary.total} icon="⏳"
                    color={{ bg: 'bg-amber-50',   text: 'text-amber-600',   bar: 'bg-amber-400'   }} />
            </div>

            {/* ── Main grid ── */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

                {/* ── Form ── */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-base font-semibold text-gray-800">
                            {editingId ? '✏️ Chỉnh sửa phiếu' : '➕ Tạo phiếu mới'}
                        </h2>
                        {editingId && (
                            <span className="text-xs bg-violet-100 text-violet-700 px-2.5 py-1 rounded-full font-semibold">
                                Đang chỉnh sửa
                            </span>
                        )}
                    </div>

                    <form onSubmit={onSubmit} className="space-y-4">
                        <Field label="Mã lô hàng" required error={errors.batchcode}>
                            <input
                                value={form.batchcode} onChange={upd('batchcode')}
                                placeholder="VD: BATCH-001"
                                className={`${inputCls} ${errors.batchcode ? 'border-red-300 focus:border-red-400' : ''}`}
                            />
                        </Field>

                        <Field label="Kiểm định viên" required error={errors.inspector}>
                            <input
                                value={form.inspector} onChange={upd('inspector')}
                                placeholder="Họ tên người kiểm định"
                                className={`${inputCls} ${errors.inspector ? 'border-red-300 focus:border-red-400' : ''}`}
                            />
                        </Field>

                        <Field label="Ngày kiểm định">
                            <input
                                type="date"
                                value={form.date}
                                max={new Date().toISOString().split('T')[0]}
                                onChange={upd('date')}
                                className={inputCls}
                            />
                        </Field>

                        <Field label="Kết quả">
                            <div className="grid grid-cols-3 gap-2">
                                {Object.entries(RESULT_MAP).map(([val, r]) => (
                                    <button key={val} type="button"
                                        onClick={() => setForm(p => ({ ...p, result: val }))}
                                        className={`py-2 px-2 rounded-lg text-xs font-semibold border-2 transition text-center ${
                                            form.result === val
                                                ? val === 'pass'    ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                                                : val === 'fail'    ? 'border-red-500 bg-red-50 text-red-700'
                                                :                     'border-amber-400 bg-amber-50 text-amber-700'
                                                : 'border-gray-200 text-gray-500 hover:border-gray-300'
                                        }`}>
                                        {r.label}
                                    </button>
                                ))}
                            </div>
                        </Field>

                        <Field label="Ghi chú">
                            <textarea
                                value={form.note} onChange={upd('note')}
                                rows={3}
                                placeholder="Ghi chú thêm về kết quả kiểm định..."
                                className={inputCls}
                            />
                        </Field>

                        <button type="submit" disabled={saving}
                            className="w-full py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-violet-500/25 transition disabled:opacity-60 flex items-center justify-center gap-2">
                            {saving
                                ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Đang lưu...</>
                                : editingId ? '💾 Cập nhật phiếu' : '✚ Lưu phiếu kiểm định'
                            }
                        </button>

                        {editingId && (
                            <button type="button" onClick={resetForm}
                                className="w-full py-2.5 border-2 border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition">
                                ✕ Hủy chỉnh sửa
                            </button>
                        )}
                    </form>
                </div>

                {/* ── Table ── */}
                <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">

                    {/* Table toolbar */}
                    <div className="p-4 border-b border-gray-50 flex flex-wrap gap-3 items-center">
                        <div className="relative flex-1 min-w-44">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">🔍</span>
                            <input
                                value={search} onChange={e => setSearch(e.target.value)}
                                placeholder="Tìm mã phiếu, mã lô, kiểm định viên..."
                                className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 pl-9 pr-3 text-sm focus:outline-none focus:border-violet-400"
                            />
                        </div>
                        <div className="flex gap-1.5">
                            {[
                                { val: 'all',     label: 'Tất cả'    },
                                { val: 'pass',    label: '✓ Đạt'     },
                                { val: 'pending', label: '◷ Chờ'     },
                                { val: 'fail',    label: '✕ Không đạt' },
                            ].map(f => (
                                <button key={f.val} onClick={() => setFilter(f.val)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                                        filter === f.val
                                            ? 'bg-violet-600 text-white'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}>
                                    {f.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto flex-1">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                {['Mã phiếu', 'Mã lô', 'Kiểm định viên', 'Kết quả', 'Ngày', 'Thao tác'].map(h => (
                                    <th key={h} className="p-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                                        {h}
                                    </th>
                                ))}
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="p-12 text-center">
                                        <div className="flex flex-col items-center gap-2 text-gray-400">
                                            <div className="w-6 h-6 border-2 border-gray-200 border-t-violet-500 rounded-full animate-spin" />
                                            <span className="text-sm">Đang tải...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-12 text-center">
                                        <div className="text-3xl mb-2">📋</div>
                                        <p className="text-gray-400 text-sm">
                                            {search || filter !== 'all' ? 'Không tìm thấy phiếu phù hợp.' : 'Chưa có phiếu kiểm định nào.'}
                                        </p>
                                    </td>
                                </tr>
                            ) : filtered.map(item => (
                                <tr key={item._id || item.id}
                                    className={`hover:bg-gray-50/60 transition-colors ${editingId === item._id ? 'bg-violet-50/60' : ''}`}>

                                    <td className="p-3 font-mono text-xs font-semibold text-gray-700">
                                        {item.inspectionCode || item.id || '—'}
                                    </td>
                                    <td className="p-3">
                                        <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded font-mono text-xs">
                                            {item.batchcode}
                                        </span>
                                    </td>
                                    <td className="p-3 text-gray-600 text-sm">{item.inspector}</td>
                                    <td className="p-3">
                                        {/* Click badge để đổi kết quả nhanh */}
                                        <div className="relative group">
                                            <ResultBadge result={item.result} />
                                            <div className="absolute left-0 top-7 z-10 hidden group-hover:flex flex-col gap-1 bg-white border border-gray-100 rounded-xl shadow-lg p-2 min-w-28">
                                                {Object.entries(RESULT_MAP).filter(([v]) => v !== item.result).map(([val, r]) => (
                                                    <button key={val}
                                                        onClick={() => updateResult(item, val)}
                                                        disabled={actionId === item._id}
                                                        className="text-xs px-3 py-1.5 rounded-lg hover:bg-gray-50 text-left font-medium text-gray-700 whitespace-nowrap">
                                                        {r.icon} {r.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-3 text-gray-500 text-xs whitespace-nowrap">
                                        {formatDate(item.date || item.createdAt)}
                                    </td>
                                    <td className="p-3">
                                        <div className="flex items-center gap-1.5">
                                            <button onClick={() => handleEdit(item)}
                                                disabled={actionId === item._id}
                                                className="w-7 h-7 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 flex items-center justify-center text-xs transition"
                                                title="Chỉnh sửa">
                                                ✏️
                                            </button>
                                            <button onClick={() => handleDelete(item)}
                                                disabled={actionId === item._id}
                                                className="w-7 h-7 rounded-lg border border-red-200 text-red-400 hover:bg-red-50 flex items-center justify-center text-xs transition"
                                                title="Xóa">
                                                🗑️
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer */}
                    {!loading && filtered.length > 0 && (
                        <div className="px-4 py-3 border-t border-gray-50 text-xs text-gray-400 text-right">
                            Hiển thị {filtered.length} / {items.length} phiếu
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}