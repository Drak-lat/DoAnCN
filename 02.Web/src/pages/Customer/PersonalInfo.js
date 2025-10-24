import React, { useEffect, useState } from "react";

export default function PersonalInfo() {
  const [form, setForm] = useState({
    fullName: "",
    username: "",
    dob: "",
    address: "",
    phone: "",
    email: ""
  });
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const todayStr = new Date().toISOString().split("T")[0];

  // ✅ Load user từ localStorage và gọi API lấy thông tin mới nhất
  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const stored = localStorage.getItem("user");
        const token = localStorage.getItem("token");
        let baseUser = stored ? JSON.parse(stored) : {};

        // Nếu có token → gọi API để lấy info mới nhất
        if (token) {
          const apiBase = (process.env.REACT_APP_API_URL || "http://localhost:3000").replace(/\/$/, "");
          const res = await fetch(`${apiBase}/api/customer/info`, {
            method: "GET",
            headers: { "Authorization": `Bearer ${token}` }
          });

          if (res.ok) {
            const data = await res.json();
            if (data.success && data.user) {
              baseUser = {
                ...baseUser,
                fullName: data.user.fullName || baseUser.fullName,
                username: data.user.username || baseUser.username,
                dob: data.user.dob || baseUser.dob,
                address: data.user.address || baseUser.address,
                phone: data.user.phone || baseUser.phone,
                email: data.user.email || baseUser.email
              };
              localStorage.setItem("user", JSON.stringify(baseUser));
            }
          }
        }

        setForm({
          fullName: baseUser.fullName ?? "",
          username: baseUser.username ?? "",
          dob: baseUser.dob ?? "",
          address: baseUser.address ?? "",
          phone: baseUser.phone ?? "",
          email: baseUser.email ?? ""
        });
      } catch (e) {
        console.warn("PersonalInfo: load user failed", e);
      }
    };

    fetchInfo();
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validatePhone = (p) => {
    if (!p) return true;
    return /^\d{10}$/.test(String(p).trim());
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!editing) return;

    if (form.dob) {
      const d = new Date(form.dob);
      const today = new Date();
      d.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);
      if (isNaN(d.getTime()) || d > today) {
        alert("Ngày sinh không hợp lệ hoặc lớn hơn ngày hiện tại.");
        return;
      }
    }

    if (!validatePhone(form.phone)) {
      alert("Số điện thoại phải là 10 chữ số.");
      return;
    }

    setSaving(true);
    try {
      const apiBase = (process.env.REACT_APP_API_URL || "http://localhost:3000").replace(/\/$/, "");
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Bạn chưa đăng nhập.");
        setSaving(false);
        return;
      }

      const res = await fetch(`${apiBase}/api/customer/info`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          fullName: form.fullName,
          username: form.username,
          dob: form.dob,
          address: form.address,
          phone: form.phone,
          email: form.email
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        alert("Cập nhật thất bại: " + (data?.msg || `Lỗi (${res.status})`));
        setSaving(false);
        return;
      }

      const newUser = {
        ...(JSON.parse(localStorage.getItem("user") || "{}")),
        ...form
      };
      localStorage.setItem("user", JSON.stringify(newUser));
      setEditing(false);
      alert("Lưu thông tin thành công.");
    } catch (err) {
      console.error("PersonalInfo save error:", err);
      alert("Lỗi kết nối. Vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  };

  const handleKeyDown = (e) => {
    if (!editing && e.key === "Enter") e.preventDefault();
  };

  return (
    <form className="personal-info-form" onSubmit={handleSave} onKeyDown={handleKeyDown}>
      <div className="form-row">
        <label>Họ tên</label>
        <input name="fullName" value={form.fullName} onChange={handleChange} disabled={!editing} type="text" />
      </div>

      <div className="form-row">
        <label>Username</label>
        <input name="username" value={form.username} onChange={handleChange} disabled type="text" />
      </div>

      <div className="form-row">
        <label>Ngày sinh</label>
        <input name="dob" value={form.dob || ""} onChange={handleChange} disabled={!editing} type="date" max={todayStr} />
      </div>

      <div className="form-row">
        <label>Địa chỉ</label>
        <input name="address" value={form.address} onChange={handleChange} disabled={!editing} type="text" />
      </div>

      <div className="form-row">
        <label>Liên lạc</label>
        <input name="phone" value={form.phone} onChange={handleChange} disabled={!editing} type="tel" pattern="\d{10}" />
      </div>

      <div className="form-row">
        <label>Email</label>
        <input name="email" value={form.email} onChange={handleChange} disabled={!editing} type="email" />
      </div>

      <div className="action-row">
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
  );
}
