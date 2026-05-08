// src/pages/DashboardPage.jsx
import React from "react";
import { Package, Truck, CheckCircle, TrendingUp } from "lucide-react";

function statusToStyle(status) {
    switch (status) {
        case "Đã bán hết":      return "bg-gray-100 text-gray-600";
        case "Đang phân phối":  return "bg-blue-100 text-blue-700";
        case "Đang kiểm định":  return "bg-indigo-100 text-indigo-700";
        case "Đang thu hoạch":  return "bg-sky-100 text-sky-700";
        default:                return "bg-gray-100 text-gray-500";
    }
}

function statusToIcon(status) {
    switch (status) {
        case "Đang phân phối":  return <Truck size={12} className="inline mr-1" />;
        case "Đã bán hết":      return <CheckCircle size={12} className="inline mr-1" />;
        default:                return <Package size={12} className="inline mr-1" />;
    }
}

function DashboardPage({ batches = [] }) {
    const total       = batches.length;
    const distributing = batches.filter(b => b.status === "Đang phân phối").length;
    const soldOut     = batches.filter(b => b.status === "Đã bán hết").length;

    const statCards = [
        { icon: <Package size={22} />, label: "Tổng số lô hàng", value: total, desc: "Lô đang được quản lý", color: "from-blue-500 to-blue-600" },
        { icon: <Truck size={22} />, label: "Đang phân phối", value: distributing, desc: "Lô đang trên thị trường", color: "from-indigo-500 to-indigo-600" },
        { icon: <CheckCircle size={22} />, label: "Đã bán hết", value: soldOut, desc: "Lô đã hoàn thành", color: "from-sky-500 to-sky-600" },
        { icon: <TrendingUp size={22} />, label: "Tỉ lệ hoàn thành", value: total > 0 ? `${Math.round((soldOut/total)*100)}%` : "0%", desc: "Tổng lô đã bán", color: "from-cyan-500 to-cyan-600" },
    ];

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    📊 Tổng quan
                </h1>
                <p className="text-gray-500 mt-1">Theo dõi và quản lý các lô hàng của bạn</p>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((card, i) => (
                    <div key={i} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition group">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}>
                                {card.icon}
                            </div>
                        </div>
                        <div className="text-4xl font-black text-gray-900 mb-1">{card.value}</div>
                        <div className="text-sm font-semibold text-gray-700 mb-0.5">{card.label}</div>
                        <div className="text-xs text-gray-400">{card.desc}</div>
                    </div>
                ))}
            </div>

            {/* Recent Batches Table */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800">Lô hàng gần đây</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                        <tr>
                            {["Mã lô", "Loại trái cây", "Nhà vườn", "Ngày thu hoạch", "Trạng thái"].map((th, i) => (
                                <th key={i} className="p-4 text-left font-semibold text-gray-600">{th}</th>
                            ))}
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                        {batches.slice(0, 5).map(b => (
                            <tr key={b.id} className="hover:bg-blue-50/30 transition">
                                <td className="p-4 font-mono font-semibold text-gray-800">{b.code}</td>
                                <td className="p-4 font-medium text-gray-800">{b.fruitType}</td>
                                <td className="p-4 text-gray-600">{b.farm}</td>
                                <td className="p-4 text-gray-600">{b.harvestDate}</td>
                                <td className="p-4">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${statusToStyle(b.status)}`}>
                                            {statusToIcon(b.status)}{b.status}
                                        </span>
                                </td>
                            </tr>
                        ))}
                        {batches.length === 0 && (
                            <tr>
                                <td colSpan={5} className="p-12 text-center text-gray-400">
                                    <Package size={40} className="mx-auto mb-3 opacity-30" />
                                    Chưa có lô hàng nào. Hãy tạo lô mới.
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default DashboardPage;