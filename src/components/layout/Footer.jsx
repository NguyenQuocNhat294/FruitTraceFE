// src/components/layout/Footer.jsx
import React from "react";

const footerLinks = [
    {
        title: "Sản Phẩm",
        links: [
            { label: "Tính năng", href: "#features" },
            { label: "Giá cả", href: "#pricing" },
            { label: "API", href: "#api" },
            { label: "Tài liệu", href: "#docs" },
        ],
    },
    {
        title: "Công Ty",
        links: [
            { label: "Giới thiệu", href: "#about" },
            { label: "Tin tức", href: "#news" },
            { label: "Tuyển dụng", href: "#careers" },
            { label: "Liên hệ", href: "#contact" },
        ],
    },
    {
        title: "Hỗ Trợ",
        links: [
            { label: "FAQs", href: "#faq" },
            { label: "Hướng dẫn", href: "#guide" },
            { label: "Hỗ trợ", href: "#support" },
            { label: "Cộng đồng", href: "#community" },
        ],
    },
    {
        title: "Pháp Lý",
        links: [
            { label: "Điều khoản", href: "#terms" },
            { label: "Bảo mật", href: "#privacy" },
            { label: "GDPR", href: "#gdpr" },
            { label: "Cookies", href: "#cookies" },
        ],
    },
];

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="relative bg-slate-950/50 border-t border-white/5 overflow-hidden">
            {/* Background glow */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-emerald-500/[0.02] rounded-full blur-[80px] pointer-events-none" />

            <div className="relative max-w-7xl mx-auto px-5 pt-8 pb-6">

                {/* Grid */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-8">

                    {/* Brand */}
                    <div className="col-span-2 md:col-span-1">
                        <div className="flex items-center gap-1.5 mb-3">
                            <span className="text-lg">🍊</span>
                            <span className="text-sm font-bold text-white tracking-wide">FruitTrace</span>
                        </div>
                        <p className="text-[11px] text-gray-500 leading-relaxed max-w-[200px]">
                            Hệ thống truy xuất nguồn gốc trái cây hàng đầu Việt Nam.
                        </p>
                    </div>

                    {/* Link columns */}
                    {footerLinks.map((col) => (
                        <div key={col.title}>
                            <h4 className="text-[11px] font-semibold text-gray-300 mb-2.5 uppercase tracking-wider">
                                {col.title}
                            </h4>
                            <ul className="space-y-1.5">
                                {col.links.map((link) => (
                                    <li key={link.label}>
                                        <a href={link.href} className="text-[11px] text-gray-500 hover:text-emerald-400 transition-colors">
                                            {link.label}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Bottom */}
                <div className="border-t border-white/5 pt-4 flex flex-col sm:flex-row justify-between items-center gap-3">
                    <p className="text-[11px] text-gray-600">
                        © {currentYear} FruitTrace. Made with 💚 in Vietnam
                    </p>
                    <div className="flex items-center gap-3 text-[11px] text-gray-600">
                        <a href="#terms" className="hover:text-gray-400 transition-colors">Điều khoản</a>
                        <span className="text-gray-800">•</span>
                        <a href="#privacy" className="hover:text-gray-400 transition-colors">Bảo mật</a>
                        <span className="text-gray-800">•</span>
                        <a href="#sitemap" className="hover:text-gray-400 transition-colors">Sitemap</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;