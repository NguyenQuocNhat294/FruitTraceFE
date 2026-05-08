    // src/components/layout/DashboardLayout.jsx
    import React, { useState } from "react";
    import { useAuth } from "../../hooks/useAuth";
    import Navbar from "./Navbar";
    import Sidebar from "./Sidebar";
    import Footer from "./Footer";

    const DashboardLayout = ({ children }) => {
        const { user } = useAuth();
        const [sidebarOpen, setSidebarOpen] = useState(false);

        return (
            <div className="relative min-h-screen bg-[#020617] text-slate-200 flex overflow-hidden" style={{ fontFamily: "'DM Sans', 'Syne', system-ui, sans-serif" }}>

                {/* ═══ BACKGROUND SYSTEM ═══ */}
                <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
                    <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 80% 60% at 50% -20%, rgba(56,189,248,0.08) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 80% 80%, rgba(16,185,129,0.06) 0%, transparent 50%), #020617' }} />

                    {/* Animated orbs */}
                    <div className="absolute top-[-15%] right-[5%] w-[700px] h-[700px] rounded-full opacity-[0.07]"
                         style={{ background: 'radial-gradient(circle, #38bdf8, transparent 70%)', animation: 'orb1 12s ease-in-out infinite alternate' }} />
                    <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] rounded-full opacity-[0.05]"
                         style={{ background: 'radial-gradient(circle, #10b981, transparent 70%)', animation: 'orb2 15s ease-in-out infinite alternate' }} />
                    <div className="absolute top-[40%] left-[30%] w-[400px] h-[400px] rounded-full opacity-[0.04]"
                         style={{ background: 'radial-gradient(circle, #818cf8, transparent 70%)', animation: 'orb3 18s ease-in-out infinite alternate' }} />

                    {/* Grid */}
                    <div className="absolute inset-0 opacity-[0.06]"
                         style={{
                             backgroundImage: 'linear-gradient(rgba(148,163,184,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.3) 1px, transparent 1px)',
                             backgroundSize: '60px 60px',
                             maskImage: 'radial-gradient(ellipse at center, black 20%, transparent 80%)'
                         }} />

                    {/* Scanline */}
                    <div className="absolute inset-0 opacity-[0.02]"
                         style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.05) 2px, rgba(255,255,255,0.05) 4px)' }} />
                </div>

                {/* ═══ SIDEBAR DESKTOP ═══ */}
                <div className="hidden lg:block shrink-0 relative z-30"
                     style={{ borderRight: '1px solid rgba(148,163,184,0.06)', background: 'rgba(2,6,23,0.6)', backdropFilter: 'blur(20px)' }}>
                    <Sidebar role={user?.role} />
                </div>

                {/* ═══ MOBILE SIDEBAR ═══ */}
                <div className={`fixed inset-0 z-50 lg:hidden transition-all duration-500 ${sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={() => setSidebarOpen(false)} />
                    <div className={`relative h-full w-[280px] transition-transform duration-500 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
                         style={{ background: 'rgba(2,6,23,0.95)', borderRight: '1px solid rgba(148,163,184,0.1)', backdropFilter: 'blur(20px)' }}>
                        <Sidebar role={user?.role} />
                        <button onClick={() => setSidebarOpen(false)}
                                className="absolute top-4 -right-12 p-2 rounded-xl text-white shadow-lg transition-all hover:scale-110"
                                style={{ background: 'linear-gradient(135deg, #38bdf8, #10b981)' }}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* ═══ MAIN ═══ */}
                <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
                    <Navbar onMenuClick={() => setSidebarOpen(true)} />
                    <main className="flex-1 overflow-y-auto overflow-x-hidden"
                          style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(148,163,184,0.15) transparent' }}>
                        <div className="max-w-[1600px] mx-auto p-4 md:p-6 lg:p-8 animate-page-in">
                            {children}
                        </div>
                        <div className="h-16" />
                    </main>
                    <Footer />
                </div>

                <style dangerouslySetInnerHTML={{ __html: `
                    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800;900&family=Syne:wght@700;800&display=swap');
                    @keyframes orb1 { from { transform: translate(0,0) scale(1); } to { transform: translate(-50px,30px) scale(1.2); } }
                    @keyframes orb2 { from { transform: translate(0,0) scale(1); } to { transform: translate(40px,-20px) scale(0.9); } }
                    @keyframes orb3 { from { transform: translate(0,0) scale(1); } to { transform: translate(-30px,40px) scale(1.1); } }
                    @keyframes pageIn { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
                    @keyframes shimmer { from { background-position: -200% 0; } to { background-position: 200% 0; } }
                    @keyframes glow { 0%,100% { box-shadow: 0 0 20px rgba(56,189,248,0.3); } 50% { box-shadow: 0 0 40px rgba(56,189,248,0.6); } }
                    @keyframes countUp { from { opacity:0; transform:scale(0.8); } to { opacity:1; transform:scale(1); } }
                    .animate-page-in { animation: pageIn 0.5s cubic-bezier(0.22,1,0.36,1) forwards; }
                    .glass-card { background: rgba(15,23,42,0.6); border: 1px solid rgba(148,163,184,0.08); backdrop-filter: blur(16px); }
                    .glass-card-bright { background: rgba(30,41,59,0.5); border: 1px solid rgba(148,163,184,0.12); backdrop-filter: blur(16px); }
                    .neon-text-blue { background: linear-gradient(135deg, #38bdf8, #818cf8); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
                    .neon-text-green { background: linear-gradient(135deg, #10b981, #34d399); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
                    .neon-text-purple { background: linear-gradient(135deg, #818cf8, #c084fc); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
                    .stat-card { transition: all 0.3s cubic-bezier(0.34,1.56,0.64,1); }
                    .stat-card:hover { transform: translateY(-4px) scale(1.02); }
                    .shimmer-line { background: linear-gradient(90deg, transparent, rgba(148,163,184,0.1), transparent); background-size: 200% 100%; animation: shimmer 2s infinite; }
                `}} />
            </div>
        );
    };

    export default DashboardLayout;