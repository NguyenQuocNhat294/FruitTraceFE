import React, { useEffect, useMemo, useState } from 'react';
import { userService } from '../../services/userService';

const ROLE_STYLE = {
    admin:    { label: 'Admin',         cls: 'bg-violet-100 text-violet-700 ring-violet-200' },
    farmer:   { label: 'Nông dân',      cls: 'bg-emerald-100 text-emerald-700 ring-emerald-200' },
    staff:    { label: 'Nhân viên',     cls: 'bg-blue-100 text-blue-700 ring-blue-200' },
    customer: { label: 'Khách hàng',    cls: 'bg-amber-100 text-amber-700 ring-amber-200' },
};

const STATUS_STYLE = {
    active:   { label: 'Hoạt động', cls: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
    inactive: { label: 'Bị khóa',   cls: 'bg-gray-100 text-gray-500',       dot: 'bg-gray-400' },
};

function Avatar({ name }) {
    const initials = (name || '?').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
    const palette = ['bg-violet-500','bg-blue-500','bg-emerald-500','bg-amber-500','bg-rose-500'];
    const color = palette[(name?.charCodeAt(0) || 0) % palette.length];
    return (
        <div className={`w-8 h-8 rounded-full ${color} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
            {initials}
        </div>
    );
}

function StatCard({ label, value, icon, color }) {
    return (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center text-lg`}>
                {icon}
            </div>
            <div>
                <p className="text-xs text-gray-400 font-medium">{label}</p>
                <p className="text-xl font-bold text-gray-800">{value}</p>
            </div>
        </div>
    );
}

function UsersManagement() {
    const [users, setUsers]       = useState([]);
    const [loading, setLoading]   = useState(true);
    const [error, setError]       = useState('');
    const [search, setSearch]     = useState('');
    const [roleFilter, setRole]   = useState('all');
    const [statusFilter, setStatus] = useState('all');
    const [actionId, setActionId] = useState(null);

    // ── lấy ID user đang đăng nhập từ localStorage (để chặn tự xóa mình) ──
    const currentUserId = useMemo(() => {
        try { return JSON.parse(localStorage.getItem('user'))?._id || null; }
        catch { return null; }
    }, []);

    const fetchUsers = async () => {
        setLoading(true); setError('');
        try {
            const res = await userService.getAll();
            setUsers(res.data || []);
        } catch {
            setError('Không thể tải danh sách người dùng.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchUsers(); }, []);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        return users.filter(u => {
            const matchSearch = !q || [u.username, u.email, u.fullName, u.role, u.status]
                .filter(Boolean).join(' ').toLowerCase().includes(q);
            const matchRole   = roleFilter   === 'all' || u.role   === roleFilter;
            const matchStatus = statusFilter === 'all' || (u.status || 'active') === statusFilter;
            return matchSearch && matchRole && matchStatus;
        });
    }, [users, search, roleFilter, statusFilter]);

    const stats = useMemo(() => ({
        total:    users.length,
        active:   users.filter(u => (u.status || 'active') === 'active').length,
        farmers:  users.filter(u => u.role === 'farmer').length,
        staff:    users.filter(u => u.role === 'staff').length,
    }), [users]);

    // ── kiểm tra có được phép thao tác không ──
    const canModify = (u) => u.role !== 'admin' && u._id !== currentUserId;

    const handleToggleStatus = async (u) => {
        if (!canModify(u)) return;
        const nextStatus = (u.status || 'active') === 'active' ? 'inactive' : 'active';
        setActionId(u._id);
        try {
            await userService.update(u._id, { status: nextStatus });
            setUsers(prev => prev.map(x => x._id === u._id ? { ...x, status: nextStatus } : x));
        } catch {
            alert('Không thể cập nhật trạng thái.');
        } finally {
            setActionId(null);
        }
    };

    const handleDelete = async (u) => {
        if (!canModify(u)) return;
        if (!window.confirm(`Xóa tài khoản "${u.username}"? Hành động này không thể hoàn tác.`)) return;
        setActionId(u._id);
        try {
            await userService.delete(u._id);
            setUsers(prev => prev.filter(x => x._id !== u._id));
        } catch {
            alert('Không thể xóa người dùng.');
        } finally {
            setActionId(null);
        }
    };

    const isLoading = (u) => actionId === u._id;

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">

            {/* ── Header ── */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Quản lý người dùng</h1>
                    <p className="text-gray-400 mt-1 text-sm">Theo dõi, khóa/mở và xóa tài khoản người dùng.</p>
                </div>
                <button
                    onClick={fetchUsers}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-sm font-medium text-gray-600 transition"
                >
                    <span>↻</span> Làm mới
                </button>
            </div>

            {/* ── Stats ── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard label="Tổng người dùng" value={stats.total}   icon="👥" color="bg-violet-50" />
                <StatCard label="Đang hoạt động"  value={stats.active}  icon="✅" color="bg-emerald-50" />
                <StatCard label="Nông dân"         value={stats.farmers} icon="🌾" color="bg-amber-50" />
                <StatCard label="Nhân viên"        value={stats.staff}   icon="👷" color="bg-blue-50" />
            </div>

            {/* ── Error ── */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm flex items-center justify-between">
                    <span>⚠️ {error}</span>
                    <button onClick={fetchUsers} className="text-red-500 underline text-xs">Thử lại</button>
                </div>
            )}

            {/* ── Filters ── */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-wrap gap-3 items-center">
                <div className="relative flex-1 min-w-52">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Tìm theo username, email, role..."
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 pl-9 pr-3 text-sm focus:outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-200"
                    />
                </div>
                <select
                    value={roleFilter}
                    onChange={e => setRole(e.target.value)}
                    className="bg-gray-50 border border-gray-200 rounded-lg py-2.5 px-3 text-sm focus:outline-none focus:border-violet-400"
                >
                    <option value="all">Tất cả vai trò</option>
                    <option value="admin">Admin</option>
                    <option value="farmer">Nông dân</option>
                    <option value="staff">Nhân viên</option>
                    <option value="customer">Khách hàng</option>
                </select>
                <select
                    value={statusFilter}
                    onChange={e => setStatus(e.target.value)}
                    className="bg-gray-50 border border-gray-200 rounded-lg py-2.5 px-3 text-sm focus:outline-none focus:border-violet-400"
                >
                    <option value="all">Tất cả trạng thái</option>
                    <option value="active">Hoạt động</option>
                    <option value="inactive">Bị khóa</option>
                </select>
                {(search || roleFilter !== 'all' || statusFilter !== 'all') && (
                    <button
                        onClick={() => { setSearch(''); setRole('all'); setStatus('all'); }}
                        className="text-xs text-gray-400 hover:text-gray-600 underline"
                    >
                        Xóa bộ lọc
                    </button>
                )}
            </div>

            {/* ── Table ── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Người dùng</th>
                            <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</th>
                            <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Vai trò</th>
                            <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Trạng thái</th>
                            <th className="p-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Thao tác</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                        {loading ? (
                            <tr>
                                <td colSpan={5} className="p-12 text-center">
                                    <div className="flex flex-col items-center gap-2 text-gray-400">
                                        <div className="w-6 h-6 border-2 border-gray-200 border-t-violet-500 rounded-full animate-spin" />
                                        <span className="text-sm">Đang tải dữ liệu...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : filtered.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="p-12 text-center text-gray-400 text-sm">
                                    <div className="text-3xl mb-2">🔍</div>
                                    Không có người dùng phù hợp.
                                </td>
                            </tr>
                        ) : (
                            filtered.map(u => {
                                const role   = ROLE_STYLE[u.role]   || { label: u.role, cls: 'bg-gray-100 text-gray-600 ring-gray-200' };
                                const status = STATUS_STYLE[u.status || 'active'];
                                const locked = !canModify(u);
                                const busy   = isLoading(u);

                                return (
                                    <tr key={u._id} className="hover:bg-gray-50/60 transition-colors">
                                        {/* User */}
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <Avatar name={u.username || u.email} />
                                                <div>
                                                    <p className="font-semibold text-gray-800">{u.username}</p>
                                                    {u.fullName && <p className="text-xs text-gray-400">{u.fullName}</p>}
                                                </div>
                                            </div>
                                        </td>

                                        {/* Email */}
                                        <td className="p-4 text-gray-500">{u.email}</td>

                                        {/* Role */}
                                        <td className="p-4">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ring-1 ${role.cls}`}>
                                                {role.label}
                                            </span>
                                        </td>

                                        {/* Status */}
                                        <td className="p-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${status.cls}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                                                {status.label}
                                            </span>
                                        </td>

                                        {/* Actions */}
                                        <td className="p-4">
                                            <div className="flex items-center justify-end gap-2">
                                                {locked ? (
                                                    // Admin hoặc chính mình → không cho thao tác
                                                    <span className="text-xs text-gray-300 italic select-none">
                                                        {u._id === currentUserId ? 'Tài khoản của bạn' : 'Không thể chỉnh sửa'}
                                                    </span>
                                                ) : (
                                                    <>
                                                        <button
                                                            onClick={() => handleToggleStatus(u)}
                                                            disabled={busy}
                                                            className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition
                                                                ${(u.status || 'active') === 'active'
                                                                    ? 'border-amber-200 text-amber-600 hover:bg-amber-50'
                                                                    : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'}
                                                                disabled:opacity-40 disabled:cursor-not-allowed`}
                                                        >
                                                            {busy ? '...' : (u.status || 'active') === 'active' ? '🔒 Khóa' : '🔓 Mở khóa'}
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(u)}
                                                            disabled={busy}
                                                            className="px-3 py-1.5 rounded-lg border border-red-200 text-red-500 text-xs font-semibold hover:bg-red-50 transition disabled:opacity-40 disabled:cursor-not-allowed"
                                                        >
                                                            {busy ? '...' : '🗑️ Xóa'}
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                        </tbody>
                    </table>
                </div>

                {/* Footer */}
                {!loading && filtered.length > 0 && (
                    <div className="px-4 py-3 border-t border-gray-50 text-xs text-gray-400 text-right">
                        Hiển thị {filtered.length} / {users.length} người dùng
                    </div>
                )}
            </div>
        </div>
    );
}

export default UsersManagement;