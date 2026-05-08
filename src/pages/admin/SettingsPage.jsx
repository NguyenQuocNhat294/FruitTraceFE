// src/pages/admin/SettingsPage.jsx
import React, { useState } from 'react';
import {
    Settings, User, Bell, Shield, Database, Globe,
    Save, RefreshCw, Eye, EyeOff, CheckCircle, X,
    Moon, Sun, Monitor, Smartphone, Lock, Key,
    AlertTriangle, Trash2, Download
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const TABS = [
    { val:'general',  label:'Chung',        icon:<Settings size={15}/> },
    { val:'account',  label:'Tài khoản',    icon:<User size={15}/> },
    { val:'security', label:'Bảo mật',      icon:<Shield size={15}/> },
    { val:'notify',   label:'Thông báo',    icon:<Bell size={15}/> },
    { val:'system',   label:'Hệ thống',     icon:<Database size={15}/> },
];

const Toggle = ({ checked, onChange, color='#22c55e' }) => (
    <button onClick={()=>onChange(!checked)}
            className="relative w-11 h-6 rounded-full transition-all duration-300 flex-shrink-0"
            style={{ background: checked ? color : 'rgba(255,255,255,0.1)' }}>
        <div className="absolute top-1 transition-all duration-300 w-4 h-4 rounded-full bg-white shadow"
             style={{ left: checked ? '24px' : '4px' }}/>
    </button>
);

const SettingRow = ({ icon, label, desc, children, danger }) => (
    <div className="flex items-center justify-between gap-4 py-4"
         style={{ borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
        <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                 style={{ background: danger ? 'rgba(239,68,68,0.12)' : 'rgba(255,255,255,0.06)',
                     color: danger ? '#f87171' : 'rgba(255,255,255,0.5)' }}>
                {icon}
            </div>
            <div>
                <p className="text-sm font-semibold" style={{ color: danger ? '#fca5a5' : 'rgba(255,255,255,0.85)' }}>{label}</p>
                {desc && <p className="text-xs mt-0.5" style={{ color:'rgba(255,255,255,0.3)' }}>{desc}</p>}
            </div>
        </div>
        <div className="flex-shrink-0">{children}</div>
    </div>
);

const Section = ({ title, children }) => (
    <div className="rounded-2xl overflow-hidden mb-4"
         style={{ background:'rgba(4,5,16,0.7)', border:'1px solid rgba(255,255,255,0.07)' }}>
        <div className="px-5 py-3.5" style={{ borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
            <h3 className="font-black text-white text-sm" style={{ fontFamily:'Syne,sans-serif' }}>{title}</h3>
        </div>
        <div className="px-5">{children}</div>
    </div>
);

export default function SettingsPage() {
    const { user } = useAuth();
    const [tab, setTab]               = useState('general');
    const [saved, setSaved]           = useState(false);
    const [showPw, setShowPw]         = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    // General settings
    const [lang, setLang]             = useState('vi');
    const [theme, setTheme]           = useState('dark');
    const [density, setDensity]       = useState('comfortable');

    // Account
    const [name, setName]             = useState(user?.username || '');
    const [email, setEmail]           = useState(user?.email || '');
    const [phone, setPhone]           = useState(user?.phone || '');

    // Security
    const [oldPw, setOldPw]           = useState('');
    const [newPw, setNewPw]           = useState('');
    const [confirmPw, setConfirmPw]   = useState('');
    const [twoFactor, setTwoFactor]   = useState(false);
    const [sessionTimeout, setSession]= useState(true);

    // Notifications
    const [notif, setNotif]           = useState({
        email: true, push: true, batch: true, expiry: true,
        report: false, system: true, marketing: false,
    });

    // System
    const [autoBackup, setAutoBackup] = useState(true);
    const [debugMode, setDebugMode]   = useState(false);
    const [apiAccess, setApiAccess]   = useState(true);
    const [maintenanceMode, setMaintenance] = useState(false);

    const handleSave = async () => {
        setSaved(false);
        await new Promise(r => setTimeout(r, 800));
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    const inputStyle = {
        background:'rgba(255,255,255,0.04)',
        border:'1px solid rgba(255,255,255,0.08)',
    };

    const renderGeneral = () => (
        <>
            <Section title="🌐 Ngôn ngữ & Khu vực">
                <SettingRow icon={<Globe size={15}/>} label="Ngôn ngữ" desc="Ngôn ngữ hiển thị trong hệ thống">
                    <select value={lang} onChange={e=>setLang(e.target.value)}
                            className="px-3 py-2 rounded-xl text-sm text-white focus:outline-none"
                            style={inputStyle}>
                        <option value="vi">🇻🇳 Tiếng Việt</option>
                        <option value="en">🇺🇸 English</option>
                    </select>
                </SettingRow>
                <SettingRow icon={<Globe size={15}/>} label="Múi giờ" desc="Múi giờ hiển thị thời gian">
                    <select className="px-3 py-2 rounded-xl text-sm text-white focus:outline-none" style={inputStyle}>
                        <option>UTC+7 (Hà Nội)</option>
                        <option>UTC+0 (London)</option>
                    </select>
                </SettingRow>
            </Section>

            <Section title="🎨 Giao diện">
                <SettingRow icon={<Monitor size={15}/>} label="Chủ đề" desc="Màu sắc giao diện hệ thống">
                    <div className="flex gap-1.5">
                        {[
                            { val:'dark',   icon:<Moon size={13}/>,    label:'Tối'  },
                            { val:'light',  icon:<Sun size={13}/>,     label:'Sáng' },
                            { val:'system', icon:<Monitor size={13}/>, label:'Hệ thống' },
                        ].map(t=>(
                            <button key={t.val} onClick={()=>setTheme(t.val)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
                                    style={ theme===t.val
                                        ? { background:'rgba(56,189,248,0.15)', border:'1px solid rgba(56,189,248,0.3)', color:'#38bdf8' }
                                        : { background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)', color:'rgba(255,255,255,0.4)' }
                                    }>
                                {t.icon} {t.label}
                            </button>
                        ))}
                    </div>
                </SettingRow>
                <SettingRow icon={<Smartphone size={15}/>} label="Mật độ hiển thị" desc="Khoảng cách giữa các phần tử">
                    <div className="flex gap-1.5">
                        {['compact','comfortable','spacious'].map(d=>(
                            <button key={d} onClick={()=>setDensity(d)}
                                    className="px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all"
                                    style={ density===d
                                        ? { background:'rgba(56,189,248,0.15)', border:'1px solid rgba(56,189,248,0.3)', color:'#38bdf8' }
                                        : { background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)', color:'rgba(255,255,255,0.4)' }
                                    }>{d}</button>
                        ))}
                    </div>
                </SettingRow>
            </Section>
        </>
    );

    const renderAccount = () => (
        <>
            <Section title="👤 Thông tin cá nhân">
                {[
                    { label:'Tên đăng nhập', value:name,  set:setName,  placeholder:'Nhập tên...' },
                    { label:'Email',         value:email, set:setEmail, placeholder:'admin@fruittrace.vn' },
                    { label:'Số điện thoại', value:phone, set:setPhone, placeholder:'0901234567' },
                ].map((f,i)=>(
                    <div key={i} className="py-4" style={{ borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
                        <label className="text-[10px] font-black uppercase tracking-wider block mb-1.5"
                               style={{ color:'rgba(255,255,255,0.35)' }}>{f.label}</label>
                        <input value={f.value} onChange={e=>f.set(e.target.value)}
                               placeholder={f.placeholder}
                               className="w-full px-4 py-2.5 rounded-xl text-sm text-white placeholder-slate-700 focus:outline-none transition-all"
                               style={inputStyle}
                               onFocus={e=>e.target.style.borderColor='rgba(56,189,248,0.35)'}
                               onBlur={e=>e.target.style.borderColor='rgba(255,255,255,0.08)'}/>
                    </div>
                ))}
                <div className="py-4">
                    <label className="text-[10px] font-black uppercase tracking-wider block mb-1.5"
                           style={{ color:'rgba(255,255,255,0.35)' }}>Vai trò</label>
                    <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl"
                         style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)' }}>
                        <span className="text-sm font-bold" style={{ color:'#38bdf8' }}>👑 Quản trị viên</span>
                        <span className="text-xs ml-auto" style={{ color:'rgba(255,255,255,0.3)' }}>Không thể thay đổi</span>
                    </div>
                </div>
            </Section>

            <Section title="🖼️ Ảnh đại diện">
                <div className="py-4 flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
                         style={{ background:'linear-gradient(135deg,#0369a1,#38bdf8)' }}>
                        {user?.username?.charAt(0)?.toUpperCase() || 'A'}
                    </div>
                    <div>
                        <p className="text-sm font-bold text-white mb-1">{user?.username}</p>
                        <div className="flex gap-2">
                            <button className="text-xs font-bold px-3 py-1.5 rounded-lg transition-all"
                                    style={{ background:'rgba(56,189,248,0.12)', color:'#38bdf8', border:'1px solid rgba(56,189,248,0.2)' }}>
                                Đổi ảnh
                            </button>
                            <button className="text-xs font-bold px-3 py-1.5 rounded-lg transition-all"
                                    style={{ background:'rgba(239,68,68,0.08)', color:'#f87171', border:'1px solid rgba(239,68,68,0.15)' }}>
                                Xóa
                            </button>
                        </div>
                    </div>
                </div>
            </Section>
        </>
    );

    const renderSecurity = () => (
        <>
            <Section title="🔑 Đổi mật khẩu">
                <div className="space-y-3 py-4">
                    {[
                        { label:'Mật khẩu hiện tại', val:oldPw, set:setOldPw },
                        { label:'Mật khẩu mới',      val:newPw, set:setNewPw },
                        { label:'Xác nhận mật khẩu', val:confirmPw, set:setConfirmPw },
                    ].map((f,i)=>(
                        <div key={i}>
                            <label className="text-[10px] font-black uppercase tracking-wider block mb-1.5"
                                   style={{ color:'rgba(255,255,255,0.35)' }}>{f.label}</label>
                            <div className="relative">
                                <input type={showPw?'text':'password'} value={f.val}
                                       onChange={e=>f.set(e.target.value)}
                                       placeholder="••••••••"
                                       className="w-full px-4 py-2.5 pr-10 rounded-xl text-sm text-white placeholder-slate-700 focus:outline-none"
                                       style={inputStyle}/>
                                <button onClick={()=>setShowPw(!showPw)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2"
                                        style={{ color:'rgba(255,255,255,0.3)' }}>
                                    {showPw ? <EyeOff size={15}/> : <Eye size={15}/>}
                                </button>
                            </div>
                        </div>
                    ))}
                    {newPw && confirmPw && newPw !== confirmPw && (
                        <p className="text-xs" style={{ color:'#f87171' }}>⚠ Mật khẩu không khớp</p>
                    )}
                    {newPw.length > 0 && (
                        <div>
                            <div className="flex gap-1 mt-2">
                                {[1,2,3,4].map(i=>(
                                    <div key={i} className="flex-1 h-1 rounded-full"
                                         style={{ background: newPw.length >= i*3
                                                 ? i<=1?'#f87171':i<=2?'#fbbf24':i<=3?'#38bdf8':'#22c55e'
                                                 : 'rgba(255,255,255,0.08)' }}/>
                                ))}
                            </div>
                            <p className="text-[10px] mt-1" style={{ color:'rgba(255,255,255,0.3)' }}>
                                {newPw.length<4?'Quá yếu':newPw.length<7?'Yếu':newPw.length<10?'Trung bình':'Mạnh'}
                            </p>
                        </div>
                    )}
                </div>
            </Section>

            <Section title="🛡️ Bảo mật nâng cao">
                <SettingRow icon={<Shield size={15}/>} label="Xác thực 2 bước (2FA)"
                            desc="Thêm lớp bảo mật với mã OTP">
                    <Toggle checked={twoFactor} onChange={setTwoFactor} color="#22c55e"/>
                </SettingRow>
                <SettingRow icon={<Lock size={15}/>} label="Tự động đăng xuất"
                            desc="Đăng xuất sau 30 phút không hoạt động">
                    <Toggle checked={sessionTimeout} onChange={setSession} color="#38bdf8"/>
                </SettingRow>
                <SettingRow icon={<Key size={15}/>} label="API Key" desc="api_key_admin_****2026">
                    <button className="text-xs font-bold px-3 py-1.5 rounded-lg"
                            style={{ background:'rgba(56,189,248,0.1)', color:'#38bdf8', border:'1px solid rgba(56,189,248,0.2)' }}>
                        Tạo mới
                    </button>
                </SettingRow>
            </Section>

            <Section title="📋 Phiên đăng nhập">
                <div className="py-3 space-y-2">
                    {[
                        { device:'Chrome · Windows', location:'Hồ Chí Minh, VN', time:'Hiện tại', current:true },
                        { device:'Safari · iPhone',  location:'Hồ Chí Minh, VN', time:'2 giờ trước', current:false },
                    ].map((s,i)=>(
                        <div key={i} className="flex items-center justify-between p-3 rounded-xl"
                             style={{ background:'rgba(255,255,255,0.03)', border:`1px solid ${s.current?'rgba(34,197,94,0.2)':'rgba(255,255,255,0.06)'}` }}>
                            <div>
                                <p className="text-xs font-bold" style={{ color:s.current?'#4ade80':'rgba(255,255,255,0.7)' }}>
                                    {s.current && '● '}{s.device}
                                </p>
                                <p className="text-[10px] mt-0.5" style={{ color:'rgba(255,255,255,0.35)' }}>
                                    {s.location} · {s.time}
                                </p>
                            </div>
                            {!s.current && (
                                <button className="text-[10px] font-bold px-2.5 py-1 rounded-lg"
                                        style={{ background:'rgba(239,68,68,0.1)', color:'#f87171', border:'1px solid rgba(239,68,68,0.2)' }}>
                                    Đăng xuất
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </Section>
        </>
    );

    const renderNotify = () => (
        <Section title="🔔 Cài đặt thông báo">
            {[
                { key:'email',   icon:<Globe size={14}/>,    label:'Thông báo email',      desc:'Nhận email khi có cập nhật quan trọng' },
                { key:'push',    icon:<Bell size={14}/>,     label:'Thông báo đẩy',        desc:'Thông báo trên trình duyệt' },
                { key:'batch',   icon:<Settings size={14}/>, label:'Lô hàng mới',          desc:'Khi có lô hàng được tạo hoặc cập nhật' },
                { key:'expiry',  icon:<AlertTriangle size={14}/>, label:'Sắp hết hạn',    desc:'Cảnh báo lô hàng hết hạn trong 7 ngày' },
                { key:'report',  icon:<Download size={14}/>, label:'Báo cáo định kỳ',     desc:'Nhận báo cáo tổng hợp hàng tuần' },
                { key:'system',  icon:<Database size={14}/>, label:'Hệ thống',             desc:'Thông báo bảo trì và cập nhật hệ thống' },
                { key:'marketing',icon:<Globe size={14}/>,   label:'Marketing',            desc:'Tin tức và ưu đãi từ FruitTrace', danger:false },
            ].map(n=>(
                <SettingRow key={n.key} icon={n.icon} label={n.label} desc={n.desc}>
                    <Toggle checked={notif[n.key]} onChange={v=>setNotif({...notif,[n.key]:v})}
                            color={n.key==='expiry'?'#fbbf24':'#22c55e'}/>
                </SettingRow>
            ))}
        </Section>
    );

    const renderSystem = () => (
        <>
            <Section title="⚙️ Cài đặt hệ thống">
                <SettingRow icon={<Database size={15}/>} label="Tự động sao lưu"
                            desc="Sao lưu dữ liệu mỗi 24 giờ">
                    <Toggle checked={autoBackup} onChange={setAutoBackup} color="#22c55e"/>
                </SettingRow>
                <SettingRow icon={<Shield size={15}/>} label="Chế độ bảo trì"
                            desc="Tạm thời ngắt truy cập người dùng">
                    <Toggle checked={maintenanceMode} onChange={setMaintenance} color="#fbbf24"/>
                </SettingRow>
                <SettingRow icon={<Monitor size={15}/>} label="API Public Access"
                            desc="Cho phép truy cập API không cần auth">
                    <Toggle checked={apiAccess} onChange={setApiAccess} color="#38bdf8"/>
                </SettingRow>
                <SettingRow icon={<Settings size={15}/>} label="Debug mode"
                            desc="Hiển thị log chi tiết trong console">
                    <Toggle checked={debugMode} onChange={setDebugMode} color="#a78bfa"/>
                </SettingRow>
            </Section>

            <Section title="💾 Dữ liệu">
                <SettingRow icon={<Download size={15}/>} label="Xuất dữ liệu"
                            desc="Tải xuống toàn bộ dữ liệu hệ thống (JSON/CSV)">
                    <button className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl"
                            style={{ background:'rgba(56,189,248,0.1)', color:'#38bdf8', border:'1px solid rgba(56,189,248,0.2)' }}>
                        <Download size={12}/> Xuất
                    </button>
                </SettingRow>
                <SettingRow icon={<RefreshCw size={15}/>} label="Xóa cache"
                            desc="Xóa dữ liệu tạm thời của hệ thống">
                    <button className="text-xs font-bold px-3 py-1.5 rounded-xl"
                            style={{ background:'rgba(251,191,36,0.1)', color:'#fbbf24', border:'1px solid rgba(251,191,36,0.2)' }}>
                        Xóa cache
                    </button>
                </SettingRow>
                <SettingRow icon={<Trash2 size={15}/>} label="Xóa toàn bộ dữ liệu"
                            desc="Hành động không thể hoàn tác!" danger>
                    <button onClick={()=>setShowConfirm(true)}
                            className="text-xs font-bold px-3 py-1.5 rounded-xl"
                            style={{ background:'rgba(239,68,68,0.1)', color:'#f87171', border:'1px solid rgba(239,68,68,0.2)' }}>
                        Xóa tất cả
                    </button>
                </SettingRow>
            </Section>
        </>
    );

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-white" style={{ fontFamily:'Syne,sans-serif' }}>⚙️ Cài đặt</h1>
                    <p className="text-sm mt-1" style={{ color:'rgba(255,255,255,0.35)' }}>Quản lý cài đặt hệ thống FruitTrace</p>
                </div>
                <button onClick={handleSave}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all"
                        style={ saved
                            ? { background:'linear-gradient(135deg,#16a34a,#22c55e)', boxShadow:'0 4px 16px rgba(34,197,94,0.35)' }
                            : { background:'linear-gradient(135deg,#0369a1,#38bdf8)', boxShadow:'0 4px 16px rgba(56,189,248,0.35)' }
                        }>
                    {saved ? <><CheckCircle size={15}/> Đã lưu!</> : <><Save size={15}/> Lưu thay đổi</>}
                </button>
            </div>

            <div className="flex flex-col lg:flex-row gap-5">
                {/* Tabs */}
                <div className="lg:w-48 flex-shrink-0">
                    <div className="rounded-2xl overflow-hidden"
                         style={{ background:'rgba(4,5,16,0.7)', border:'1px solid rgba(255,255,255,0.07)' }}>
                        {TABS.map(t=>(
                            <button key={t.val} onClick={()=>setTab(t.val)}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold transition-all text-left"
                                    style={ tab===t.val
                                        ? { background:'rgba(56,189,248,0.1)', color:'#38bdf8', borderLeft:'2px solid #38bdf8' }
                                        : { color:'rgba(255,255,255,0.4)', borderLeft:'2px solid transparent' }
                                    }>
                                {t.icon} {t.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    {tab === 'general'  && renderGeneral()}
                    {tab === 'account'  && renderAccount()}
                    {tab === 'security' && renderSecurity()}
                    {tab === 'notify'   && renderNotify()}
                    {tab === 'system'   && renderSystem()}
                </div>
            </div>

            {/* Confirm delete modal */}
            {showConfirm && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl"
                         style={{ background:'rgba(4,5,16,0.98)', border:'1px solid rgba(239,68,68,0.3)' }}>
                        <div className="h-1" style={{ background:'linear-gradient(90deg,#dc2626,#ef4444)' }}/>
                        <div className="p-6 text-center">
                            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                                 style={{ background:'rgba(239,68,68,0.12)' }}>
                                <Trash2 size={24} style={{ color:'#f87171' }}/>
                            </div>
                            <h3 className="font-black text-white text-lg mb-2" style={{ fontFamily:'Syne,sans-serif' }}>
                                Xác nhận xóa?
                            </h3>
                            <p className="text-sm mb-5" style={{ color:'rgba(255,255,255,0.5)' }}>
                                Hành động này sẽ xóa toàn bộ dữ liệu và không thể hoàn tác!
                            </p>
                            <div className="flex gap-3">
                                <button onClick={()=>setShowConfirm(false)}
                                        className="flex-1 py-2.5 rounded-xl text-sm font-bold"
                                        style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.6)' }}>
                                    Hủy
                                </button>
                                <button onClick={()=>setShowConfirm(false)}
                                        className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white"
                                        style={{ background:'linear-gradient(135deg,#dc2626,#ef4444)' }}>
                                    Xác nhận xóa
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}