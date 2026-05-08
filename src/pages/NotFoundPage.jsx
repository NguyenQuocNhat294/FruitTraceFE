// src/pages/NotFoundPage.jsx
import { Link } from 'react-router-dom';

const NotFoundPage = () => (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-4">
        <div className="text-8xl">🔍</div>
        <h1 className="text-3xl font-black text-gray-800">Trang chưa có</h1>
        <p className="text-gray-500">Tính năng này đang được phát triển.</p>
        <div className="flex gap-3">
            <button onClick={() => window.history.back()}
                    className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold hover:bg-gray-100 transition">
                ← Quay lại
            </button>
            <Link to="/" className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition">
                Trang chủ
            </Link>
        </div>
    </div>
);

export default NotFoundPage;