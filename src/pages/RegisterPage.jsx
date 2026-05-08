// src/pages/RegisterPage.jsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, UserPlus, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { authService } from "../services/authService";

// ── helpers ──────────────────────────────────────────────────────────────────
const EMAIL_RE    = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_RE = /^[a-zA-Z0-9_]+$/;          // chỉ chữ, số, gạch dưới
const HAS_LETTER  = /[a-zA-Z]/;
const HAS_DIGIT   = /[0-9]/;

function passwordStrength(pw) {
    if (!pw) return { score: 0, label: '', color: '' };
    let score = 0;
    if (pw.length >= 8)  score++;
    if (pw.length >= 12) score++;
    if (HAS_LETTER.test(pw) && HAS_DIGIT.test(pw)) score++;
    if (/[^a-zA-Z0-9]/.test(pw)) score++;          // ký tự đặc biệt = bonus
    if (score <= 1) return { score: 1, label: 'Yếu',      color: 'bg-red-400' };
    if (score === 2) return { score: 2, label: 'Trung bình', color: 'bg-amber-400' };
    if (score === 3) return { score: 3, label: 'Mạnh',     color: 'bg-blue-500' };
    return              { score: 4, label: 'Rất mạnh',  color: 'bg-emerald-500' };
}

function useDebounce(value, delay = 600) {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const t = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(t);
    }, [value, delay]);
    return debounced;
}

// ── Field wrapper ─────────────────────────────────────────────────────────────
function Field({ label, error, checking, valid, children }) {
    return (
        <div>
            <label className="text-xs font-semibold text-gray-700 mb-1.5 block">{label}</label>
            <div className="relative">
                {children}
                {/* status icon inside input */}
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    {checking && <Loader2 size={15} className="text-gray-400 animate-spin" />}
                    {!checking && valid === true  && <CheckCircle size={15} className="text-emerald-500" />}
                    {!checking && valid === false && <AlertCircle size={15} className="text-red-400" />}
                </div>
            </div>
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>
    );
}

const inputCls = (err, ok, extra = '') =>
    `w-full px-4 py-3 pr-10 rounded-xl border text-sm bg-gray-50 focus:outline-none focus:bg-white transition ${extra} ${
        err ? 'border-red-300 focus:border-red-400' :
        ok  ? 'border-emerald-300 focus:border-emerald-400' :
              'border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10'
    }`;

// ── Main component ────────────────────────────────────────────────────────────
const RegisterPage = () => {
    const navigate = useNavigate();

    const [step, setStep] = useState(1);
    const [form, setForm] = useState({
        username: "", email: "", password: "", confirmPassword: "",
        role: "farm", phone: "", fullName: "",
    });
    const [showPw, setShowPw]   = useState(false);
    const [showCPw, setShowCPw] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError]     = useState("");
    const [success, setSuccess] = useState(false);

    // ── async field states ────────────────────────────────────────────────────
    const [usernameState, setUsernameState] = useState({ checking: false, error: '', valid: null });
    const [emailState,    setEmailState]    = useState({ checking: false, error: '', valid: null });

    // ── inline validation errors (step 1 static) ─────────────────────────────
    const [fieldErr, setFieldErr] = useState({});

    // ── debounced values for API checks ──────────────────────────────────────
    const dUsername = useDebounce(form.username.trim());
    const dEmail    = useDebounce(form.email.trim());

    // ── check username availability ───────────────────────────────────────────
    useEffect(() => {
        if (!dUsername) { setUsernameState({ checking: false, error: '', valid: null }); return; }
        if (dUsername.length < 4) {
            setUsernameState({ checking: false, error: 'Ít nhất 4 ký tự.', valid: false });
            return;
        }
        if (!USERNAME_RE.test(dUsername)) {
            setUsernameState({ checking: false, error: 'Chỉ dùng chữ, số và dấu _', valid: false });
            return;
        }
        setUsernameState({ checking: true, error: '', valid: null });
        authService.checkUsername?.(dUsername)
            .then(res => {
                const taken = res?.data?.exists ?? res?.data?.taken ?? false;
                setUsernameState({
                    checking: false,
                    error:    taken ? 'Tên đăng nhập đã được sử dụng.' : '',
                    valid:    !taken,
                });
            })
            .catch(() => setUsernameState({ checking: false, error: '', valid: null }));
    }, [dUsername]);

    // ── check email availability ──────────────────────────────────────────────
    useEffect(() => {
        if (!dEmail) { setEmailState({ checking: false, error: '', valid: null }); return; }
        if (!EMAIL_RE.test(dEmail)) {
            setEmailState({ checking: false, error: 'Email không đúng định dạng.', valid: false });
            return;
        }
        setEmailState({ checking: true, error: '', valid: null });
        authService.checkEmail?.(dEmail)
            .then(res => {
                const taken = res?.data?.exists ?? res?.data?.taken ?? false;
                setEmailState({
                    checking: false,
                    error:    taken ? 'Email đã được đăng ký.' : '',
                    valid:    !taken,
                });
            })
            .catch(() => setEmailState({ checking: false, error: '', valid: null }));
    }, [dEmail]);

    const update = (e) => {
        const { name, value } = e.target;
        setForm(f => ({ ...f, [name]: value }));
        // xóa lỗi static khi user gõ lại
        setFieldErr(f => ({ ...f, [name]: '' }));
    };

    // ── validation step 1 ────────────────────────────────────────────────────
    const validateStep1 = () => {
        const errs = {};
        if (!form.fullName.trim())        errs.fullName = 'Vui lòng nhập họ tên.';
        if (!form.username.trim())        errs.username = 'Vui lòng nhập tên đăng nhập.';
        if (!form.email.trim())           errs.email    = 'Vui lòng nhập email.';
        if (usernameState.error)          errs.username = usernameState.error;
        if (emailState.error)             errs.email    = emailState.error;
        if (usernameState.valid === false && !errs.username) errs.username = 'Tên đăng nhập không hợp lệ.';
        if (emailState.valid === false    && !errs.email)    errs.email    = 'Email không hợp lệ.';
        return errs;
    };

    // ── validation step 2 ────────────────────────────────────────────────────
    const pw = form.password;
    const pwStrength = passwordStrength(pw);

    const pwErrors = {
        length:  pw.length >= 8,
        combo:   HAS_LETTER.test(pw) && HAS_DIGIT.test(pw),
        match:   !!form.confirmPassword && pw === form.confirmPassword,
    };

    const validateStep2 = () => {
        if (pw.length < 8)                    return 'Mật khẩu phải ít nhất 8 ký tự.';
        if (!pwErrors.combo)                  return 'Mật khẩu phải có cả chữ và số.';
        if (pw !== form.confirmPassword)      return 'Mật khẩu xác nhận không khớp.';
        return '';
    };

    const handleNext = () => {
        const errs = validateStep1();
        if (Object.keys(errs).length) { setFieldErr(errs); return; }
        if (usernameState.checking || emailState.checking) { setError('Đang kiểm tra thông tin, vui lòng đợi...'); return; }
        setError(''); setFieldErr({});
        setStep(2);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const err = validateStep2();
        if (err) { setError(err); return; }

        setLoading(true); setError('');
        try {
            await authService.register({
                username: form.username.trim(),
                fullName: form.fullName.trim(),
                email:    form.email.trim(),
                password: form.password,
                role:     form.role,
                phone:    form.phone.trim(),
            });
            setSuccess(true);
            setTimeout(() => navigate('/login'), 2500);
        } catch (err) {
            setError(err?.response?.data?.message || 'Đăng ký thất bại, thử lại.');
        } finally {
            setLoading(false);
        }
    };

    // ── success screen ────────────────────────────────────────────────────────
    if (success) return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-sky-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl p-10 text-center max-w-sm w-full">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-600/30">
                    <CheckCircle size={40} className="text-white" />
                </div>
                <h2 className="text-2xl font-black text-gray-800 mb-2">Đăng ký thành công!</h2>
                <p className="text-gray-500 mb-4">Tài khoản <span className="font-bold text-blue-600">@{form.username}</span> đã được tạo.</p>
                <p className="text-sm text-gray-400">Đang chuyển về trang đăng nhập...</p>
                <div className="w-full bg-gray-100 rounded-full h-1.5 mt-4 overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-1.5 rounded-full"
                         style={{ width: '100%', transition: 'width 2.5s linear', animation: 'none' }} />
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-sky-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 overflow-hidden -z-10">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-300/20 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-300/20 rounded-full blur-3xl" />
            </div>

            <div className="w-full max-w-md">
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-blue-900/10 border border-white/50 p-8">

                    {/* Logo */}
                    <div className="text-center mb-6">
                        <Link to="/" className="inline-flex flex-col items-center gap-2 group">
                            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/30 group-hover:scale-105 transition-transform">
                                <span className="text-2xl">🍊</span>
                            </div>
                            <div className="text-xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">FruitTrace</div>
                        </Link>
                        <p className="text-gray-500 text-sm mt-1">Tạo tài khoản mới</p>
                    </div>

                    {/* Step indicator */}
                    <div className="flex items-center gap-3 mb-6">
                        {[1, 2].map(s => (
                            <React.Fragment key={s}>
                                <div className={`flex items-center gap-2 flex-1 transition-opacity ${s === step ? '' : 'opacity-40'}`}>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 transition-all ${
                                        s < step   ? 'bg-blue-600 text-white' :
                                        s === step ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md' :
                                                     'bg-gray-100 text-gray-400'
                                    }`}>
                                        {s < step ? <CheckCircle size={16} /> : s}
                                    </div>
                                    <span className="text-xs font-semibold text-gray-600">
                                        {s === 1 ? 'Thông tin' : 'Mật khẩu'}
                                    </span>
                                </div>
                                {s < 2 && <div className={`h-0.5 flex-1 rounded transition-colors ${step > s ? 'bg-blue-600' : 'bg-gray-200'}`} />}
                            </React.Fragment>
                        ))}
                    </div>

                    {/* Global error */}
                    {error && (
                        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 mb-4 text-sm">
                            <AlertCircle size={16} className="flex-shrink-0" />{error}
                        </div>
                    )}

                    <form onSubmit={step === 1 ? (e) => { e.preventDefault(); handleNext(); } : handleSubmit}
                          className="space-y-4">

                        {/* ── STEP 1 ── */}
                        {step === 1 && <>
                            {/* Họ tên */}
                            <Field label="Họ và tên *" error={fieldErr.fullName}>
                                <input name="fullName" value={form.fullName}
                                       onChange={update}
                                       onBlur={e => setForm(f => ({ ...f, fullName: e.target.value.trim() }))}
                                       placeholder="Nguyễn Văn A"
                                       className={inputCls(fieldErr.fullName, form.fullName.trim().length > 1)} />
                            </Field>

                            {/* Username */}
                            <Field label="Tên đăng nhập *"
                                   error={fieldErr.username || usernameState.error}
                                   checking={usernameState.checking}
                                   valid={usernameState.valid}>
                                <input name="username" value={form.username}
                                       onChange={update}
                                       onBlur={e => setForm(f => ({ ...f, username: e.target.value.trim() }))}
                                       placeholder="Chỉ chữ, số và _ (ít nhất 4 ký tự)"
                                       className={inputCls(fieldErr.username || usernameState.error, usernameState.valid === true)} />
                            </Field>

                            {/* Email */}
                            <Field label="Email *"
                                   error={fieldErr.email || emailState.error}
                                   checking={emailState.checking}
                                   valid={emailState.valid}>
                                <input name="email" type="text" value={form.email}
                                       onChange={update}
                                       onBlur={e => setForm(f => ({ ...f, email: e.target.value.trim() }))}
                                       placeholder="email@example.com"
                                       className={inputCls(fieldErr.email || emailState.error, emailState.valid === true)} />
                            </Field>

                            {/* Phone */}
                            <Field label="Số điện thoại">
                                <input name="phone" value={form.phone}
                                       onChange={update}
                                       onBlur={e => setForm(f => ({ ...f, phone: e.target.value.trim() }))}
                                       placeholder="0901234567"
                                       className={inputCls('', false)} />
                            </Field>

                            {/* Role */}
                            <div>
                                <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Vai trò</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {[
                                        { value: 'farm',  label: '🌾 Chủ nông trại' },
                                        { value: 'staff', label: '👷 Nhân viên'      },
                                    ].map(r => (
                                        <button key={r.value} type="button"
                                                onClick={() => setForm(f => ({ ...f, role: r.value }))}
                                                className={`py-2.5 px-4 rounded-xl text-sm font-semibold border-2 transition ${
                                                    form.role === r.value
                                                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                                                        : 'border-gray-200 text-gray-600 hover:border-blue-300'
                                                }`}>
                                            {r.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button type="submit"
                                    className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl hover:shadow-xl hover:shadow-blue-600/30 transition-all hover:-translate-y-0.5">
                                Tiếp theo →
                            </button>
                        </>}

                        {/* ── STEP 2 ── */}
                        {step === 2 && <>
                            {/* Password */}
                            <div>
                                <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Mật khẩu *</label>
                                <div className="relative">
                                    <input name="password" type={showPw ? "text" : "password"}
                                           value={form.password} onChange={update}
                                           placeholder="Ít nhất 8 ký tự, có chữ và số"
                                           className={inputCls(
                                               pw && (!pwErrors.length || !pwErrors.combo),
                                               pw && pwErrors.length && pwErrors.combo,
                                               'pr-20'
                                           )} />
                                    <button type="button" onClick={() => setShowPw(v => !v)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                        {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>

                                {/* Strength meter */}
                                {pw && (
                                    <div className="mt-2">
                                        <div className="flex gap-1 mb-1">
                                            {[1,2,3,4].map(i => (
                                                <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                                                    i <= pwStrength.score ? pwStrength.color : 'bg-gray-200'
                                                }`} />
                                            ))}
                                        </div>
                                        <p className={`text-xs font-medium ${
                                            pwStrength.score <= 1 ? 'text-red-500' :
                                            pwStrength.score === 2 ? 'text-amber-500' :
                                            pwStrength.score === 3 ? 'text-blue-500' : 'text-emerald-500'
                                        }`}>{pwStrength.label}</p>
                                    </div>
                                )}

                                {/* Requirements checklist */}
                                <div className="mt-2 space-y-1">
                                    {[
                                        { ok: pwErrors.length, text: 'Ít nhất 8 ký tự' },
                                        { ok: pwErrors.combo,  text: 'Có cả chữ và số'  },
                                    ].map(r => (
                                        <p key={r.text} className={`text-xs flex items-center gap-1.5 transition-colors ${
                                            !pw ? 'text-gray-400' : r.ok ? 'text-emerald-600' : 'text-red-400'
                                        }`}>
                                            {r.ok ? '✓' : '✗'} {r.text}
                                        </p>
                                    ))}
                                </div>
                            </div>

                            {/* Confirm password */}
                            <div>
                                <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Xác nhận mật khẩu *</label>
                                <div className="relative">
                                    <input name="confirmPassword" type={showCPw ? "text" : "password"}
                                           value={form.confirmPassword} onChange={update}
                                           placeholder="Nhập lại mật khẩu"
                                           className={inputCls(
                                               form.confirmPassword && !pwErrors.match,
                                               form.confirmPassword &&  pwErrors.match
                                           )} />
                                    <button type="button" onClick={() => setShowCPw(v => !v)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                        {showCPw ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                {form.confirmPassword && !pwErrors.match && (
                                    <p className="text-xs text-red-500 mt-1">Mật khẩu không khớp.</p>
                                )}
                                {form.confirmPassword && pwErrors.match && (
                                    <p className="text-xs text-emerald-600 mt-1">✓ Mật khẩu khớp.</p>
                                )}
                            </div>

                            {/* Summary */}
                            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100 text-sm space-y-1 text-gray-600">
                                <p className="font-semibold text-blue-700 mb-2">Thông tin tài khoản</p>
                                <p>👤 {form.fullName}</p>
                                <p>🔑 @{form.username}</p>
                                <p>📧 {form.email}</p>
                                <p>{form.role === 'farm' ? '🌾 Chủ nông trại' : '👷 Nhân viên'}</p>
                            </div>

                            <div className="flex gap-3">
                                <button type="button" onClick={() => { setStep(1); setError(''); }}
                                        className="flex-1 py-3 border-2 border-gray-200 rounded-xl text-sm font-semibold hover:bg-gray-50 transition">
                                    ← Quay lại
                                </button>
                                <button type="submit" disabled={loading}
                                        className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl hover:shadow-xl hover:shadow-blue-600/30 transition disabled:opacity-60 flex items-center justify-center gap-2">
                                    {loading
                                        ? <><Loader2 size={16} className="animate-spin" />Đang tạo...</>
                                        : <><UserPlus size={16} />Tạo tài khoản</>
                                    }
                                </button>
                            </div>
                        </>}
                    </form>

                    <div className="text-center mt-5 text-sm text-gray-500">
                        Đã có tài khoản?{" "}
                        <Link to="/login" className="text-blue-600 font-semibold hover:underline">Đăng nhập</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;