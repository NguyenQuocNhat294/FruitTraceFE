import React, { useState } from "react";

function statusToClass(status) {
    if (status === "Đã bán hết") return "sold";
    if (status === "Đang phân phối") return "active";
    if (status === "Đang kiểm định") return "pending";
    if (status === "Đang thu hoạch") return "harvest";
    return "default";
}

function BatchesPage({
                         batches,
                         form,
                         onChangeForm,
                         onCreateBatch,
                         onDeleteBatch,
                         onUpdateStatus,
                     }) {
    const [search, setSearch] = useState("");

    const filteredBatches = batches.filter((b) =>
        b.code.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="grid grid-2">

            {/* ================= FORM ================= */}
            <div className="card">
                <h2 className="card-title">Tạo lô hàng mới</h2>
                <form className="form" onSubmit={onCreateBatch}>
                    <div className="form-group">
                        <label>Mã lô</label>
                        <input
                            type="text"
                            name="code"
                            value={form.code}
                            onChange={onChangeForm}
                            placeholder="VD: BATCH-003"
                        />
                    </div>

                    <div className="form-group">
                        <label>Loại trái cây</label>
                        <input
                            type="text"
                            name="fruitType"
                            value={form.fruitType}
                            onChange={onChangeForm}
                            placeholder="VD: Sầu riêng Ri6"
                        />
                    </div>

                    <div className="form-group">
                        <label>Nhà vườn</label>
                        <input
                            type="text"
                            name="farm"
                            value={form.farm}
                            onChange={onChangeForm}
                            placeholder="VD: Vườn C - Tiền Giang"
                        />
                    </div>

                    <div className="form-group">
                        <label>Ngày thu hoạch</label>
                        <input
                            type="date"
                            name="harvestDate"
                            value={form.harvestDate}
                            onChange={onChangeForm}
                        />
                    </div>

                    <div className="form-group">
                        <label>Trạng thái</label>
                        <select
                            name="status"
                            value={form.status}
                            onChange={onChangeForm}
                        >
                            <option>Đang phân phối</option>
                            <option>Đã bán hết</option>
                            <option>Đang thu hoạch</option>
                            <option>Đang kiểm định</option>
                        </select>
                    </div>

                    <button type="submit" className="btn btn-primary">
                        Lưu lô hàng
                    </button>
                </form>
            </div>

            {/* ================= TABLE ================= */}
            <div className="card">
                <h2 className="card-title">Danh sách lô hàng</h2>

                {/* Search */}
                <input
                    type="text"
                    placeholder="Tìm theo mã lô..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="input-search"
                />

                <table className="table">
                    <thead>
                    <tr>
                        <th>Mã lô</th>
                        <th>Loại trái cây</th>
                        <th>Nhà vườn</th>
                        <th>Ngày thu hoạch</th>
                        <th>Trạng thái</th>
                        <th>Hành động</th>
                    </tr>
                    </thead>
                    <tbody>
                    {filteredBatches.map((b) => (
                        <tr key={b.id}>
                            <td>{b.code}</td>
                            <td>{b.fruitType}</td>
                            <td>{b.farm}</td>
                            <td>{b.harvestDate}</td>

                            {/* STATUS EDIT */}
                            <td>
                                <select
                                    value={b.status}
                                    onChange={(e) =>
                                        onUpdateStatus(b.id, e.target.value)
                                    }
                                    className={`badge badge-status-${statusToClass(
                                        b.status
                                    )}`}
                                >
                                    <option>Đang phân phối</option>
                                    <option>Đã bán hết</option>
                                    <option>Đang thu hoạch</option>
                                    <option>Đang kiểm định</option>
                                </select>
                            </td>

                            {/* DELETE */}
                            <td>
                                <button
                                    className="btn btn-danger"
                                    onClick={() => {
                                        if (
                                            window.confirm(
                                                "Bạn có chắc muốn xóa lô này?"
                                            )
                                        ) {
                                            onDeleteBatch(b.id);
                                        }
                                    }}
                                >
                                    Xóa
                                </button>
                            </td>
                        </tr>
                    ))}

                    {filteredBatches.length === 0 && (
                        <tr>
                            <td colSpan={6} className="table-empty">
                                Không tìm thấy lô hàng.
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default BatchesPage;