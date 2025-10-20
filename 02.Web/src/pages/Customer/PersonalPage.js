import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./PersonalPage.css";
import PersonalInfo from "./PersonalInfo";
import ChangePassword from "./ChangePassword";
import Orders from "./Orders";
import Reviews from "./Reviews";

const PersonalPage = () => {
  const [activeTab, setActiveTab] = useState("info");
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const apiUrl = process.env.REACT_APP_API_URL;
      const token = localStorage.getItem("token");
      if (apiUrl && token) {
        // best-effort notify backend (ignore errors)
        await fetch(`${apiUrl.replace(/\/$/, "")}/api/auth/logout`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } catch (e) {
      console.warn("Logout request failed:", e);
    } finally {
      localStorage.removeItem("token");
      // redirect to login page and replace history entry
      navigate("/login", { replace: true });
    }
  };

  return (
    <div className="personal-page">
      <aside className="sidebar">
        <div className="profile-icon">
          <i className="fa fa-user-circle" aria-hidden="true"></i>
        </div>
        <h3>Thông Tin Cá Nhân</h3>
        <ul>
          <li className={activeTab === "info" ? "active" : ""} onClick={() => setActiveTab("info")}>
            Hồ sơ cá nhân
          </li>
          <li className={activeTab === "password" ? "active" : ""} onClick={() => setActiveTab("password")}>
            Đổi mật khẩu
          </li>
          <li className={activeTab === "orders" ? "active" : ""} onClick={() => setActiveTab("orders")}>
            Đơn hàng
          </li>
          <li className={activeTab === "reviews" ? "active" : ""} onClick={() => setActiveTab("reviews")}>
            Nhận xét của tôi
          </li>
          <li
            onClick={handleLogout}
            style={{ color: "#d9534f", cursor: "pointer", marginTop: 12 }}
          >
            Đăng xuất
          </li>
        </ul>
      </aside>

      <main className="content">
        {activeTab === "info" && <PersonalInfo />}
        {activeTab === "password" && <ChangePassword />}
        {activeTab === "orders" && <Orders />}
        {activeTab === "reviews" && <Reviews />}
      </main>
    </div>
  );
};

export default PersonalPage;