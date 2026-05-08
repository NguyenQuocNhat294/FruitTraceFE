import React from "react";

function FarmInfo({ farm }) {
  if (!farm) return null;

  const {
    name,
    owner,
    location,
    area,
    crops,
    contact,
    certifications = [],
  } = farm;

  return (
    <div className="card" style={{ marginTop: 12 }}>
      <h2 className="card-title">Thông tin nhà vườn</h2>
      <div className="trace-grid">
        <div>
          <span className="trace-label">Tên vườn:</span>
          <span>{name}</span>
        </div>
        <div>
          <span className="trace-label">Chủ vườn:</span>
          <span>{owner}</span>
        </div>
        <div>
          <span className="trace-label">Địa chỉ:</span>
          <span>{location}</span>
        </div>
        {area && (
          <div>
            <span className="trace-label">Diện tích:</span>
            <span>{area}</span>
          </div>
        )}
        {crops && (
          <div>
            <span className="trace-label">Cây trồng chính:</span>
            <span>{crops}</span>
          </div>
        )}
        {contact && (
          <div>
            <span className="trace-label">Liên hệ:</span>
            <span>{contact}</span>
          </div>
        )}
      </div>

      {certifications.length > 0 && (
        <div style={{ marginTop: 10 }}>
          <span className="trace-label">Chứng nhận:</span>
          {certifications.map((c) => (
            <span
              key={c}
              className="badge badge-status-default"
              style={{ marginLeft: 6 }}
            >
              {c}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default FarmInfo;

