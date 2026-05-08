// src/components/common/Loading.jsx
import React from "react";

const Loading = ({ text = "Đang tải...", fullScreen = false }) => {
    const content = (
        <div className="flex flex-col items-center justify-center gap-4">
            <div className="relative">
                <div className="w-12 h-12 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 animate-spin" />
                <span className="absolute inset-0 flex items-center justify-center text-lg">🍊</span>
            </div>
            <p className="text-sm text-gray-400 animate-pulse">{text}</p>
        </div>
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-sm">
                {content}
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center py-20">
            {content}
        </div>
    );
};

export default Loading;