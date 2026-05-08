import React, { useEffect, useMemo, useState } from "react";
import { batchService } from "../../services/batchService";
import { traceService } from "../../services/traceService";

function TraceLogsPage() {
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const batchesRes = await batchService.getAll();
        const batches = batchesRes.data || [];

        const logsByBatch = await Promise.all(
          batches.slice(0, 20).map(async (b) => {
            try {
              const res = await traceService.getByBatch(b._id);
              return (res.data || []).map((log) => ({
                ...log,
                batchcode: b.batchcode,
                farmid: b.farmid,
              }));
            } catch {
              return [];
            }
          })
        );

        const flattened = logsByBatch.flat().sort((a, b) => {
          const aTime = new Date(a.timestamp || a.createdAt || 0).getTime();
          const bTime = new Date(b.timestamp || b.createdAt || 0).getTime();
          return bTime - aTime;
        });

        setRows(flattened);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) =>
      [r.batchcode, r.farmid, r.action, r.note, r.description]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [rows, search]);

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Nhật ký truy xuất</h1>
        <p className="text-gray-500 mt-1">
          Theo dõi các bước xử lý đã ghi nhận của từng lô hàng.
        </p>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl p-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm theo mã lô, nông trại, hành động..."
          className="w-full md:w-96 bg-gray-50 border border-gray-200 rounded-lg py-2.5 px-3 text-sm focus:outline-none focus:border-purple-500"
        />
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="p-4 font-semibold text-gray-600">Thời gian</th>
                <th className="p-4 font-semibold text-gray-600">Mã lô</th>
                <th className="p-4 font-semibold text-gray-600">Nông trại</th>
                <th className="p-4 font-semibold text-gray-600">Bước</th>
                <th className="p-4 font-semibold text-gray-600">Mô tả</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-400">
                    Đang tải nhật ký...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-400">
                    Không có nhật ký phù hợp.
                  </td>
                </tr>
              ) : (
                filtered.map((row, idx) => (
                  <tr key={row._id || idx} className="hover:bg-gray-50">
                    <td className="p-4 text-gray-600">
                      {formatDateTime(row.timestamp || row.createdAt)}
                    </td>
                    <td className="p-4 font-mono font-semibold text-gray-800">
                      {row.batchcode || "N/A"}
                    </td>
                    <td className="p-4 text-gray-600">{row.farmid || "N/A"}</td>
                    <td className="p-4 text-gray-700">
                      {row.action || row.title || `Bước ${row.step || "-"}`}
                    </td>
                    <td className="p-4 text-gray-600">
                      {row.note || row.description || "Không có mô tả"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function formatDateTime(dateStr) {
  if (!dateStr) return "N/A";
  return new Date(dateStr).toLocaleString("vi-VN");
}

export default TraceLogsPage;

