import React from "react";
import { useNavigate } from "react-router-dom";

function CTASection() {
  const navigate = useNavigate();

  return (
    <section className="card" style={{ marginTop: 16 }}>
      <h2 className="card-title">Bắt đầu với FruitTrace</h2>
      <p className="card-desc">
        Số hóa quy trình quản lý và truy xuất nguồn gốc trái cây của bạn chỉ
        trong vài phút. Tạo lô hàng, in tem QR, theo dõi toàn bộ chuỗi cung
        ứng trên một nền tảng duy nhất.
      </p>

      <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
        <button className="btn btn-primary" onClick={() => navigate("/batches")}>
          Tạo lô hàng đầu tiên
        </button>
        <button
          className="btn"
          style={{
            background: "rgba(15,23,42,0.9)",
            color: "#e5e7eb",
            border: "1px solid rgba(148,163,184,0.4)",
          }}
          onClick={() => navigate("/trace")}
        >
          Thử truy xuất bằng mã demo
        </button>
      </div>
    </section>
  );
}

export default CTASection;

