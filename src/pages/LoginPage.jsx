import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff, LogIn, AlertCircle, Leaf, Shield, Zap } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

const ROLE_REDIRECTS = {
    admin:  "/admin",
    farmer: "/farm",
    farm:   "/farm",
    staff:  "/staff",
};

const TRUST_POINTS = [
    { icon: <Leaf size={16} />,   text: "500+ nông trại đã tin dùng" },
    { icon: <Shield size={16} />, text: "Bảo mật dữ liệu tuyệt đối" },
    { icon: <Zap size={16} />,   text: "Phân tích thời gian thực" },
];

const LoginPage = () => {
    const { login }   = useAuth();
    const navigate    = useNavigate();
    const location    = useLocation();
    const from        = location.state?.from || null;

    const [form,    setForm]    = useState({ username: "", password: "" });
    const [showPw,  setShowPw]  = useState(false);
    const [loading, setLoading] = useState(false);
    const [error,   setError]   = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.username || !form.password) {
            setError("Vui lòng nhập đầy đủ tài khoản và mật khẩu.");
            return;
        }
        setLoading(true);
        setError("");
        const result = await login(form);
        setLoading(false);
        if (result.success) {
            const role = String(result.user?.role || "staff").trim().toLowerCase();
            navigate(from || ROLE_REDIRECTS[role] || "/", { replace: true });
        } else {
            setError(result.error || "Đăng nhập thất bại.");
        }
    };

    return (
        <div className="min-h-screen flex">

            {/* ═══ LEFT — Visual Panel ═══ */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-emerald-500/20 rounded-full blur-3xl"/>
                <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-teal-500/20 rounded-full blur-3xl"/>
                <div className="absolute inset-0 opacity-[0.03]"
                     style={{ backgroundImage: "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)", backgroundSize: "48px 48px" }}/>

                <div className="relative flex flex-col justify-between p-12 text-white w-full">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-3 group w-fit">
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition-transform">
                            <span className="text-xl">🍊</span>
                        </div>
                        <div>
                            <div className="font-black text-lg leading-none">FruitTrace</div>
                            <div className="text-xs text-emerald-400 leading-none mt-0.5">Truy xuất nguồn gốc</div>
                        </div>
                    </Link>

                    {/* Center */}
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs text-emerald-300 font-medium mb-8">
                            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"/>
                            Hệ thống đang hoạt động
                        </div>
                        <h2 className="text-4xl font-black leading-tight mb-4">
                            Quản lý toàn bộ<br/>
                            <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">chuỗi cung ứng</span><br/>
                            trong tầm tay
                        </h2>
                        <p className="text-gray-400 leading-relaxed mb-8 max-w-sm">
                            Nền tảng minh bạch hóa nông sản với Blockchain & AI, giúp xây dựng niềm tin từ nông trại đến người tiêu dùng.
                        </p>
                        <div className="space-y-3">
                            {TRUST_POINTS.map((p, i) => (
                                <div key={i} className="flex items-center gap-3 text-sm text-gray-300">
                                    <div className="w-7 h-7 rounded-lg bg-white/8 border border-white/10 flex items-center justify-center text-emerald-400">
                                        {p.icon}
                                    </div>
                                    {p.text}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Testimonial */}
                    <div className="bg-white/8 backdrop-blur-sm rounded-2xl border border-white/10 p-5">
                        <div className="flex gap-1 mb-3">
                            {[...Array(5)].map((_,i) => (
                                <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                                </svg>
                            ))}
                        </div>
                        <p className="text-sm text-gray-300 italic mb-3">"Doanh số tăng 65% chỉ sau 3 tháng. Khách hàng tin tưởng hơn hẳn!"</p>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-xs font-bold text-white">M</div>
                            <div>
                                <div className="text-xs font-semibold text-white">Nguyễn Văn Minh</div>
                                <div className="text-[11px] text-gray-500">Chủ vườn xoài · Tiền Giang</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ═══ RIGHT — Form Panel ═══ */}
            <div className="flex-1 flex items-center justify-center p-6 bg-gray-50 dark:bg-slate-950">
                <div className="absolute inset-0 overflow-hidden -z-10 lg:hidden">
                    <div className="absolute top-0 left-1/4 w-72 h-72 bg-emerald-300/20 rounded-full blur-3xl"/>
                    <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-teal-300/20 rounded-full blur-3xl"/>
                </div>

                <div className="w-full max-w-md">
                    {/* Mobile logo */}
                    <div className="flex justify-center mb-8 lg:hidden">
                        <Link to="/" className="flex items-center gap-3 group">
                            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30 group-hover:scale-105 transition-transform">
                                <span className="text-2xl">🍊</span>
                            </div>
                            <div className="font-black text-2xl bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">FruitTrace</div>
                        </Link>
                    </div>

                    <div className="mb-8">
                        <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-1">Chào mừng trở lại 👋</h1>
                        <p className="text-sm text-gray-500">Đăng nhập để tiếp tục quản lý hệ thống</p>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl p-4 mb-6 text-sm">
                            <AlertCircle size={18} className="shrink-0"/>{error}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Tài khoản</label>
                            <input type="text" value={form.username} autoComplete="username"
                                   onChange={e => setForm({ ...form, username: e.target.value })}
                                   placeholder="Nhập tên đăng nhập..."
                                   className="w-full px-4 py-3 rounded-xl text-sm border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15 transition-all" />
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Mật khẩu</label>
                                <a href="#" className="text-xs text-emerald-600 hover:text-emerald-500 hover:underline transition">Quên mật khẩu?</a>
                            </div>
                            <div className="relative">
                                <input type={showPw ? "text" : "password"} value={form.password} autoComplete="current-password"
                                       onChange={e => setForm({ ...form, password: e.target.value })}
                                       placeholder="Nhập mật khẩu..."
                                       className="w-full px-4 py-3 pr-12 rounded-xl text-sm border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15 transition-all" />
                                <button type="button" onClick={() => setShowPw(!showPw)}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition p-1">
                                    {showPw ? <EyeOff size={17}/> : <Eye size={17}/>}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <input type="checkbox" id="remember" className="w-4 h-4 rounded border-gray-300 accent-emerald-600"/>
                            <label htmlFor="remember" className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer">Ghi nhớ đăng nhập</label>
                        </div>

                        <button type="submit" disabled={loading}
                                className="w-full py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-600/25 hover:shadow-emerald-600/40 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0 flex items-center justify-center gap-2 transition-all">
                            {loading
                                ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Đang đăng nhập...</>
                                : <><LogIn size={17}/>Đăng nhập</>
                            }
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <span className="text-sm text-gray-500">Chưa có tài khoản? </span>
                        <Link to="/register" className="text-sm font-semibold text-emerald-600 hover:text-emerald-500 transition">Tạo tài khoản mới →</Link>
                    </div>
                    <div className="text-center mt-3">
                        <Link to="/" className="text-sm text-gray-400 hover:text-emerald-600 transition">← Quay về trang chủ</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;