import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./ChangePassword.css";

const ChangePassword = () => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const oldP = (oldPassword || "").trim();
    const newP = (newPassword || "").trim();
    const confirmP = (confirmPassword || "").trim();

    if (!oldP || !newP || !confirmP) {
      toast.error("Vui lòng nhập đầy đủ thông tin!");
      return;
    }
    if (newP !== confirmP) {
      toast.error("Mật khẩu mới và xác nhận không khớp!");
      return;
    }

    setLoading(true);
    try {
      const apiUrl = process.env.REACT_APP_API_URL;
      if (!apiUrl) {
        toast.success("Đổi mật khẩu thành công (chế độ frontend-only)");
      } else {
        const token = localStorage.getItem("token");
        if (!token) {
          toast.error("Bạn chưa đăng nhập hoặc token không tìm thấy");
          setLoading(false);
          return;
        }
        const url = `${apiUrl.replace(/\/$/, "")}/api/user/change-password`;
        const res = await axios.put(url, { oldPassword: oldP, newPassword: newP }, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success(res.data?.message || "Đổi mật khẩu thành công");
      }
      setOldPassword(""); setNewPassword(""); setConfirmPassword("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Đổi mật khẩu thất bại. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="change-password-container">
      <h2>Đổi Mật Khẩu</h2>
      <form onSubmit={handleSubmit} className="change-password-form">
        <label>Mật khẩu cũ</label>
        <input type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} />
        <label>Mật khẩu mới</label>
        <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
        <label>Xác nhận mật khẩu mới</label>
        <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
        <button type="submit" disabled={loading}>{loading ? "Đang xử lý..." : "Lưu"}</button>
      </form>
    </div>
  );
};

export default ChangePassword;