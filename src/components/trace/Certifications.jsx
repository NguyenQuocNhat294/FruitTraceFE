import React from "react";

function Certifications({ items = [] }) {
  if (!items.length) return null;

  return (
    <div className="card" style={{ marginTop: 12 }}>
      <h2 className="card-title">Chứng nhận & kiểm định</h2>
      <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13 }}>
        {items.map((cert) => (
          <li key={cert.code || cert}>
            <strong>{cert.name || cert}</strong>
            {cert.code && ` – Mã: ${cert.code}`}
            {cert.issuedBy && ` – Cấp bởi: ${cert.issuedBy}`}
            {cert.validUntil && ` – Hạn đến: ${cert.validUntil}`}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Certifications;

