// src/pages/farm/StaffManagement.jsx
import React, { useState, useEffect } from 'react';
import {
    Users, Search, Plus, X, Phone, Mail, RefreshCw,
    CheckCircle, Clock, AlertTriangle, Edit2, Trash2,
    Shield, Star, ChevronRight, Eye
} from 'lucide-react';
import { userService } from '../../services/userService';
import { useAuth }     from '../../hooks/useAuth';

const ROLES_COLOR = {
    staff:    { label:'Nhân viên', color:'#818cf8', bg:'rgba(129,140,248,0.12)', border:'rgba(129,140,248,0.25)' },
    customer: { label:'Nhân viên', color:'#818cf8', bg:'rgba(129,140,248,0.12)', border:'rgba(129,140,248,0.25)' },
    farmer:   { label:'Chủ vườn',  color:'#22c55e', bg:'rgba(34,197,94,0.12)',   border:'rgba(34,197,94,0.25)'   },
    admin:    { label:'Admin',     color:'#f87171', bg:'rgba(239,68,68,0.12)',    border:'rgba(239,68,68,0.25)'   },
};

const STATUS_COLOR = {
    active:   { label:'Hoạt động', color:'#22c55e', bg:'rgba(34,197,94,0.12)',  border:'rgba(34,197,94,0.2)'  },
    inactive: { label:'Nghỉ',      color:'#94a3b8', bg:'rgba(148,163,184,0.08)',border:'rgba(148,163,184,0.15)'},
    busy:     { label:'Bận',       color:'#fbbf24', bg:'rgba(251,191,36,0.12)', border:'rgba(251,191,36,0.2)' },
};

// Demo staff data
const DEMO_STAFF = [
    { _id:'1', username:'nguyen_van_a', fullName:'Nguyễn Văn A', role:'staff', phone:'0901234561', email:'nva@farm.vn', status:'active',   tasks:5, done:4, rating:4.8 },
    { _id:'2', username:'tran_thi_b',   fullName:'Trần Thị B',   role:'staff', phone:'0901234562', email:'ttb@farm.vn', status:'active',   tasks:3, done:3, rating:5.0 },
    { _id:'3', username:'le_van_c',     fullName:'Lê Văn C',     role:'staff', phone:'0901234563', email:'lvc@farm.vn', status:'busy',     tasks:4, done:2, rating:4.2 },
    { _id:'4', username:'pham_thi_d',   fullName:'Phạm Thị D',   role:'staff', phone:'0901234564', email:'ptd@farm.vn', status:'inactive', tasks:0, done:0, rating:4.0 },
];

// ── Avatar ──
const Avatar = ({ name, size='md' }) => {
    const s = size === 'sm' ? 'w-8 h-8 text-sm' : size === 'lg' ? 'w-14 h-14 text-xl' : 'w-10 h-10 text-sm';
    const colors = ['#6366f1','#22c55e','#38bdf8','#fbbf24','#f97316','#a78bfa'];
    const color  = colors[(name?.charCodeAt(0)||0) % colors.length];
    return (
        <div className={`${s} rounded-2xl flex items-center justify-center font-black text-white flex-shrink-0`}
             style={{ background:`linear-gradient(135deg,${color},${color}99)`, boxShadow:`0 4px 12px ${color}30` }}>
            {name?.charAt(0)?.toUpperCase() || '?'}
        </div>
    );
};

// ── Staff Card ──
const StaffCard = ({ staff, onEdit, onDelete, onView }) => {
    const role   = ROLES_COLOR[staff.role]   || ROLES_COLOR.staff;
    const status = STATUS_COLOR[staff.status] || STATUS_COLOR.active;
    const progress = staff.tasks ? Math.round((staff.done/staff.tasks)*100) : 0;

    return (
        <div className="rounded-2xl overflow-hidden group transition-all hover:-translate-y-0.5 hover:shadow-2xl"
             style={{ background:'rgba(4,5,16,0.7)', border:'1px solid rgba(255,255,255,0.07)' }}>
            <div className="h-1" style={{ background:`linear-gradient(90deg,${role.color},${role.color}50)` }}/>
            <div className="p-5">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <Avatar name={staff.fullName || staff.username} size="md"/>
                        <div>
                            <h3 className="font-black text-white text-sm">{staff.fullName || staff.username}</h3>
                            <p className="text-[10px] font-mono mt-0.5" style={{ color:'rgba(255,255,255,0.3)' }}>@{staff.username}</p>
                        </div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                              style={{ background:role.bg, color:role.color, border:`1px solid ${role.border}` }}>
                            {role.label}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                              style={{ background:status.bg, color:status.color, border:`1px solid ${status.border}` }}>
                            {status.label}
                        </span>
                    </div>
                </div>

                {/* Contact */}
                <div className="space-y-1.5 mb-4">
                    {staff.phone && (
                        <div className="flex items-center gap-2 text-xs" style={{ color:'rgba(255,255,255,0.4)' }}>
                            <Phone size={11} style={{ flexShrink:0 }}/> {staff.phone}
                        </div>
                    )}
                    {staff.email && (
                        <div className="flex items-center gap-2 text-xs" style={{ color:'rgba(255,255,255,0.4)' }}>
                            <Mail size={11} style={{ flexShrink:0 }}/> {staff.email}
                        </div>
                    )}
                </div>

                {/* Task progress */}
                {staff.tasks > 0 && (
                    <div className="mb-4">
                        <div className="flex justify-between text-[10px] mb-1" style={{ color:'rgba(255,255,255,0.35)' }}>
                            <span>Nhiệm vụ hôm nay</span>
                            <span className="font-bold text-white">{staff.done}/{staff.tasks}</span>
                        </div>
                        <div className="h-1.5 rounded-full overflow-hidden" style={{ background:'rgba(255,255,255,0.06)' }}>
                            <div className="h-full rounded-full transition-all duration-700"
                                 style={{ width:`${progress}%`, background:`linear-gradient(90deg,${role.color},${role.color}80)` }}/>
                        </div>
                    </div>
                )}

                {/* Rating */}
                {staff.rating > 0 && (
                    <div className="flex items-center gap-1.5 mb-4">
                        <Star size={11} style={{ color:'#fbbf24' }} fill="#fbbf24"/>
                        <span className="text-xs font-bold text-white">{staff.rating}</span>
                        <span className="text-[10px]" style={{ color:'rgba(255,255,255,0.3)' }}>đánh giá</span>
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={()=>onView(staff)}
                            className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-xl text-xs font-bold transition-all"
                            style={{ background:'rgba(56,189,248,0.08)', color:'#38bdf8', border:'1px solid rgba(56,189,248,0.15)' }}>
                        <Eye size={11}/> Xem
                    </button>
                    <button onClick={()=>onEdit(staff)}
                            className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-xl text-xs font-bold transition-all"
                            style={{ background:'rgba(129,140,248,0.08)', color:'#818cf8', border:'1px solid rgba(129,140,248,0.15)' }}>
                        <Edit2 size={11}/> Sửa
                    </button>
                    <button onClick={()=>onDelete(staff._id)}
                            className="w-8 flex items-center justify-center py-1.5 rounded-xl text-xs font-bold transition-all"
                            style={{ background:'rgba(239,68,68,0.08)', color:'#f87171', border:'1px solid rgba(239,68,68,0.15)' }}>
                        <Trash2 size={11}/>
                    </button>
                </div>
            </div>
        </div>
    );
};

// ── Staff Modal (view/edit) ──
const StaffModal = ({ staff, mode, onClose, onSave }) => {
    const [form, setForm] = useState({ ...staff });
    if (!staff) return null;
    const role   = ROLES_COLOR[form.role]   || ROLES_COLOR.staff;
    const status = STATUS_COLOR[form.status] || STATUS_COLOR.active;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
             onClick={onClose}>
            <div className="w-full max-w-md rounded-3xl overflow-hidden shadow-2xl"
                 style={{ background:'rgba(4,5,16,0.98)', border:'1px solid rgba(255,255,255,0.1)' }}
                 onClick={e=>e.stopPropagation()}>
                <div className="h-1.5" style={{ background:`linear-gradient(90deg,${role.color},${role.color}50,transparent)` }}/>
                <div className="p-6">
                    <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-3">
                            <Avatar name={form.fullName||form.username} size="lg"/>
                            <div>
                                <h3 className="font-black text-white" style={{ fontFamily:'Syne,sans-serif' }}>
                                    {mode==='view' ? (form.fullName||form.username) : 'Chỉnh sửa nhân viên'}
                                </h3>
                                <p className="text-xs mt-0.5 font-mono" style={{ color:'rgba(255,255,255,0.3)' }}>@{form.username}</p>
                            </div>
                        </div>
                        <button onClick={onClose} style={{ color:'rgba(255,255,255,0.4)' }}><X size={18}/></button>
                    </div>

                    {mode === 'view' ? (
                        <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-2">
                                {[
                                    { label:'Vai trò',    value:<span style={{ color:role.color }}>{role.label}</span> },
                                    { label:'Trạng thái', value:<span style={{ color:status.color }}>{status.label}</span> },
                                    { label:'Điện thoại', value:form.phone||'—' },
                                    { label:'Email',      value:form.email||'—' },
                                    { label:'Nhiệm vụ',   value:`${form.done||0}/${form.tasks||0}` },
                                    { label:'Đánh giá',   value:form.rating ? `⭐ ${form.rating}` : '—' },
                                ].map((item,i)=>(
                                    <div key={i} className="p-3 rounded-xl"
                                         style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.06)' }}>
                                        <p className="text-[9px] uppercase tracking-wider mb-1" style={{ color:'rgba(255,255,255,0.3)' }}>{item.label}</p>
                                        <p className="text-sm font-bold text-white">{item.value}</p>
                                    </div>
                                ))}
                            </div>
                            <button onClick={onClose}
                                    className="w-full py-2.5 rounded-xl text-sm font-bold text-white mt-2"
                                    style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.08)' }}>
                                Đóng
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {[
                                { label:'Họ và tên', key:'fullName', placeholder:'Nguyễn Văn A' },
                                { label:'Số điện thoại', key:'phone', placeholder:'0901234567' },
                                { label:'Email', key:'email', placeholder:'nva@farm.vn' },
                            ].map(f=>(
                                <div key={f.key}>
                                    <label className="text-[10px] font-bold uppercase tracking-wider block mb-1.5"
                                           style={{ color:'rgba(255,255,255,0.35)' }}>{f.label}</label>
                                    <input value={form[f.key]||''} onChange={e=>setForm({...form,[f.key]:e.target.value})}
                                           placeholder={f.placeholder}
                                           className="w-full px-3 py-2.5 rounded-xl text-sm text-white placeholder-slate-700 focus:outline-none"
                                           style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)' }}/>
                                </div>
                            ))}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[10px] font-bold uppercase tracking-wider block mb-1.5"
                                           style={{ color:'rgba(255,255,255,0.35)' }}>Trạng thái</label>
                                    <select value={form.status} onChange={e=>setForm({...form,status:e.target.value})}
                                            className="w-full px-3 py-2.5 rounded-xl text-sm text-white focus:outline-none"
                                            style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)' }}>
                                        <option value="active">Hoạt động</option>
                                        <option value="busy">Bận</option>
                                        <option value="inactive">Nghỉ</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold uppercase tracking-wider block mb-1.5"
                                           style={{ color:'rgba(255,255,255,0.35)' }}>Đánh giá</label>
                                    <select value={form.rating} onChange={e=>setForm({...form,rating:parseFloat(e.target.value)})}
                                            className="w-full px-3 py-2.5 rounded-xl text-sm text-white focus:outline-none"
                                            style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)' }}>
                                        {[5,4.5,4,3.5,3].map(r=><option key={r} value={r}>⭐ {r}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="flex gap-3 mt-2">
                                <button onClick={onClose}
                                        className="flex-1 py-2.5 rounded-xl text-sm font-bold"
                                        style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', color:'rgba(255,255,255,0.5)' }}>
                                    Hủy
                                </button>
                                <button onClick={()=>onSave(form)}
                                        className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white"
                                        style={{ background:`linear-gradient(135deg,${role.color},${role.color}80)` }}>
                                    Lưu thay đổi
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// ── Add Staff Modal ──
const AddModal = ({ onClose, onAdd }) => {
    const [form, setForm] = useState({ username:'', fullName:'', phone:'', email:'', role:'staff', status:'active' });
    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="w-full max-w-md rounded-2xl overflow-hidden shadow-2xl"
                 style={{ background:'rgba(4,5,16,0.98)', border:'1px solid rgba(129,140,248,0.2)' }}
                 onClick={e=>e.stopPropagation()}>
                <div className="h-1" style={{ background:'linear-gradient(90deg,#6366f1,#818cf8,#c084fc)' }}/>
                <div className="p-6">
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="font-black text-white" style={{ fontFamily:'Syne,sans-serif' }}>➕ Thêm nhân viên</h3>
                        <button onClick={onClose} style={{ color:'rgba(255,255,255,0.4)' }}><X size={18}/></button>
                    </div>
                    <div className="space-y-3">
                        {[
                            { label:'Tên đăng nhập *', key:'username',  placeholder:'nguyen_van_a' },
                            { label:'Họ và tên',       key:'fullName',  placeholder:'Nguyễn Văn A' },
                            { label:'Số điện thoại',   key:'phone',     placeholder:'0901234567' },
                            { label:'Email',           key:'email',     placeholder:'nva@farm.vn' },
                        ].map(f=>(
                            <div key={f.key}>
                                <label className="text-[10px] font-bold uppercase tracking-wider block mb-1.5"
                                       style={{ color:'rgba(255,255,255,0.35)' }}>{f.label}</label>
                                <input value={form[f.key]} onChange={e=>setForm({...form,[f.key]:e.target.value})}
                                       placeholder={f.placeholder}
                                       className="w-full px-3 py-2.5 rounded-xl text-sm text-white placeholder-slate-700 focus:outline-none"
                                       style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)' }}/>
                            </div>
                        ))}
                    </div>
                    <div className="flex gap-3 mt-5">
                        <button onClick={onClose}
                                className="flex-1 py-2.5 rounded-xl text-sm font-bold"
                                style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', color:'rgba(255,255,255,0.5)' }}>
                            Hủy
                        </button>
                        <button onClick={()=>{ if(form.username) onAdd({...form,_id:Date.now().toString(),tasks:0,done:0,rating:5}); }}
                                disabled={!form.username}
                                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50"
                                style={{ background:'linear-gradient(135deg,#6366f1,#818cf8)' }}>
                            Thêm nhân viên
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ════ MAIN ════
export default function StaffManagement() {
    const { user }                      = useAuth();
    const [staff, setStaff]             = useState(DEMO_STAFF);
    const [search, setSearch]           = useState('');
    const [statusFilter, setStatus]     = useState('');
    const [selected, setSelected]       = useState(null);
    const [editMode, setEditMode]       = useState('view');
    const [showAdd, setShowAdd]         = useState(false);

    const filtered = staff.filter(s =>
        (!search || (s.fullName||'').toLowerCase().includes(search.toLowerCase()) || (s.username||'').toLowerCase().includes(search.toLowerCase())) &&
        (!statusFilter || s.status === statusFilter)
    );

    const handleSave = (updated) => {
        setStaff(p => p.map(s => s._id === updated._id ? updated : s));
        setSelected(null);
    };
    const handleDelete = (id) => {
        if (window.confirm('Xóa nhân viên này?')) setStaff(p => p.filter(s => s._id !== id));
    };
    const handleAdd = (newStaff) => {
        setStaff(p => [...p, newStaff]);
        setShowAdd(false);
    };

    const active   = staff.filter(s=>s.status==='active').length;
    const busy     = staff.filter(s=>s.status==='busy').length;
    const inactive = staff.filter(s=>s.status==='inactive').length;
    const avgRating = staff.length ? (staff.reduce((s,p)=>s+(p.rating||0),0)/staff.length).toFixed(1) : '—';

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-white" style={{ fontFamily:'Syne,sans-serif' }}>👥 Nhân viên</h1>
                    <p className="text-sm mt-1" style={{ color:'rgba(255,255,255,0.35)' }}>Quản lý đội ngũ nhân viên nông trại</p>
                </div>
                <button onClick={()=>setShowAdd(true)}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white"
                        style={{ background:'linear-gradient(135deg,#16a34a,#22c55e)', boxShadow:'0 4px 16px rgba(34,197,94,0.35)' }}>
                    <Plus size={15}/> Thêm nhân viên
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                    { label:'Tổng nhân viên', value:staff.length,  color:'#38bdf8', icon:<Users size={18}/> },
                    { label:'Đang hoạt động', value:active,         color:'#22c55e', icon:<CheckCircle size={18}/> },
                    { label:'Đang bận',       value:busy,           color:'#fbbf24', icon:<Clock size={18}/> },
                    { label:'Đánh giá TB',    value:`⭐ ${avgRating}`, color:'#fbbf24', icon:<Star size={18}/> },
                ].map((s,i)=>(
                    <div key={i} className="rounded-2xl p-4 relative overflow-hidden"
                         style={{ background:'rgba(4,5,16,0.7)', border:'1px solid rgba(255,255,255,0.07)' }}>
                        <div className="absolute top-0 left-0 right-0 h-px"
                             style={{ background:`linear-gradient(90deg,transparent,${s.color}50,transparent)` }}/>
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-2"
                             style={{ background:`${s.color}15`, color:s.color }}>{s.icon}</div>
                        <div className="text-2xl font-black text-white" style={{ fontFamily:'Syne,sans-serif' }}>{s.value}</div>
                        <div className="text-xs mt-0.5" style={{ color:'rgba(255,255,255,0.3)' }}>{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Toolbar */}
            <div className="flex flex-wrap gap-3">
                <div className="relative flex-1 min-w-[200px]">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color:'rgba(255,255,255,0.3)' }}/>
                    <input value={search} onChange={e=>setSearch(e.target.value)}
                           placeholder="Tìm tên, username..."
                           className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none"
                           style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)' }}/>
                    {search && <button onClick={()=>setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color:'rgba(255,255,255,0.3)' }}><X size={13}/></button>}
                </div>
                <div className="flex gap-1.5">
                    {[
                        { val:'',         label:'Tất cả'    },
                        { val:'active',   label:'Hoạt động' },
                        { val:'busy',     label:'Bận'       },
                        { val:'inactive', label:'Nghỉ'      },
                    ].map(f=>(
                        <button key={f.val} onClick={()=>setStatus(f.val)}
                                className="px-3 py-2 rounded-xl text-xs font-bold transition-all"
                                style={ statusFilter===f.val
                                    ? { background:'rgba(34,197,94,0.15)', border:'1px solid rgba(34,197,94,0.3)', color:'#4ade80' }
                                    : { background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)', color:'rgba(255,255,255,0.4)' }
                                }>{f.label}</button>
                    ))}
                </div>
            </div>

            {/* Grid */}
            {filtered.length === 0 ? (
                <div className="rounded-2xl py-16 text-center"
                     style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)' }}>
                    <Users size={36} className="mx-auto mb-3 opacity-20 text-white"/>
                    <p className="text-sm font-semibold" style={{ color:'rgba(255,255,255,0.35)' }}>Không tìm thấy nhân viên</p>
                    {search && (
                        <button onClick={()=>setSearch('')} className="text-xs font-bold mt-2" style={{ color:'#4ade80' }}>
                            Xóa tìm kiếm
                        </button>
                    )}
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filtered.map(s => (
                            <StaffCard key={s._id} staff={s}
                                       onEdit={s=>{setSelected(s);setEditMode('edit');}}
                                       onDelete={handleDelete}
                                       onView={s=>{setSelected(s);setEditMode('view');}}/>
                        ))}
                    </div>
                    <p className="text-xs text-center" style={{ color:'rgba(255,255,255,0.25)' }}>
                        Hiển thị <span className="font-bold text-white">{filtered.length}</span> / {staff.length} nhân viên
                    </p>
                </>
            )}

            {/* Modals */}
            {selected && (
                <StaffModal staff={selected} mode={editMode}
                            onClose={()=>setSelected(null)} onSave={handleSave}/>
            )}
            {showAdd && <AddModal onClose={()=>setShowAdd(false)} onAdd={handleAdd}/>}
        </div>
    );
}