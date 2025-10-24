import React, { useEffect, useState } from "react";
import "./AdminInfo.css";

export default function AdminInfo() {
  const [form, setForm] = useState({
    fullName: "",
    username: "",
    dob: "",
    address: "",
    phone: "",
    email: "",
    avatar: ""
  });
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const todayStr = new Date().toISOString().split("T")[0];

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("user") || "{}");
      setForm(prev => ({
        ...prev,
        fullName: stored.fullName ?? stored.name ?? "",
        username: stored.username ?? "",
        dob: stored.dob ?? stored.date_of_birth ?? "",
        address: stored.address ?? "",
        phone: stored.phone ?? "",
        email: stored.email ?? "",
        avatar: stored.avatar ?? ""
      }));
    } catch (e) {
      console.warn("AdminInfo: read user failed", e);
    }
  }, []);

  const handleChange = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const validatePhone = p => /^\d{10}$/.test(String(p || "").trim());

  const handleSave = async e => {
    e.preventDefault();
    if (!editing) return;

    // client validation
    if (form.dob) {
      const d = new Date(form.dob);
      const today = new Date();
      d.setHours(0,0,0,0); today.setHours(0,0,0,0);
      if (isNaN(d.getTime()) || d > today) {
        alert("Ngày sinh không hợp lệ hoặc lớn hơn ngày hiện tại.");
        return;
      }
    }
    if (form.phone && !validatePhone(form.phone)) {
      alert("Số điện thoại phải là 10 chữ số.");
      return;
    }

    setSaving(true);
    try {
      const apiBase = (process.env.REACT_APP_API_URL || "http://localhost:3000").replace(/\/$/, "");
      const token = localStorage.getItem("token");
      if (!token) { alert("Bạn chưa đăng nhập"); setSaving(false); return; }

      const payload = {
        fullName: form.fullName,
        username: form.username,
        dob: form.dob, // format YYYY-MM-DD
        address: form.address,
        phone: form.phone,
        email: form.email
      };

      const res = await fetch(`${apiBase}/api/admin/info`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        alert("Cập nhật thất bại: " + (data?.msg || res.status));
      } else {
        // cập nhật localStorage user với info trả về (chuẩn hóa)
        const current = JSON.parse(localStorage.getItem("user") || "{}");
        const updatedUser = {
          ...current,
          username: data.user?.username ?? current.username,
          id_login: data.user?.id_login ?? current.id_login,
          fullName: data.info?.fullName ?? payload.fullName,
          dob: data.info?.dob ?? payload.dob,
          address: data.info?.address ?? payload.address,
          phone: data.info?.phone ?? payload.phone,
          email: data.info?.email ?? payload.email
        };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setForm(prev => ({ ...prev, ...updatedUser }));
        setEditing(false);
        alert("Lưu thông tin thành công.");
      }
    } catch (err) {
      console.error("AdminInfo save error:", err);
      alert("Lỗi kết nối, thử lại.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-info-root">
      <div className="admin-header">
        <button type="button" className="back-btn" onClick={() => window.history.back()}>←</button>
        <div className="admin-title">Quản lý thông tin cá nhân</div>
        <div className="spacer" />
      </div>

      <form className="admin-info-form" onSubmit={handleSave}>
        <div className="left-col">
          <div className="field"><input name="fullName" value={form.fullName} onChange={handleChange} disabled={!editing} placeholder="Họ tên" /></div>
          <div className="field"><input name="username" value={form.username} onChange={handleChange} disabled={!editing} placeholder="Username" /></div>
          <div className="field"><input name="dob" value={form.dob || ""} onChange={handleChange} disabled={!editing} type="date" max={todayStr} /></div>
          <div className="field"><input name="address" value={form.address} onChange={handleChange} disabled={!editing} placeholder="Địa chỉ" /></div>
        </div>

        <div className="right-col">
          <div className="field"><input name="phone" value={form.phone} onChange={handleChange} disabled={!editing} placeholder="Số điện thoại" /></div>
          <div className="field"><input name="email" value={form.email} onChange={handleChange} disabled={!editing} placeholder="Email" /></div>
          <div className="avatar-wrap">
            {form.avatar ? <img src={form.avatar} alt="avatar" /> : <div className="avatar-placeholder">No avatar</div>}
          </div>
        </div>

        <div className="form-actions">
          {editing ? (
          <>
            <button type="submit" className="btn-save" disabled={saving}>
              {saving ? "Đang lưu..." : "Lưu"}
            </button>
            <button
              type="button"
              className="btn-edit"
              onClick={(e) => {
                e.preventDefault();
                setEditing(false);
              }}
              disabled={saving}
            >
              Huỷ
            </button>
          </>
        ) : (
          <button
            type="button"
            className="btn-edit"
            onClick={(e) => {
              e.preventDefault();
              setEditing(true);
            }}
          >
            Chỉnh sửa trang cá nhân
          </button>
        )}
        </div>
      </form>
    </div>
  );
}