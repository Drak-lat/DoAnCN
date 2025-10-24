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
        await fetch(`${apiUrl.replace(/\/$/, "")}/api/auth/logout`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } catch (e) {
      console.warn("Logout request failed:", e);
    } finally {
      localStorage.removeItem("token");
      navigate("/login", { replace: true });
    }
  };

  const menu = [
    { key: "info", label: "Hồ sơ cá nhân" },
    { key: "password", label: "Đổi mật khẩu" },
    { key: "orders", label: "Đơn hàng" },
    { key: "reviews", label: "Nhận xét của tôi" },
  ];

  return (
    <div className="personal-page">
      <aside className="sidebar">
        <div className="sidebar-top">
          <div className="avatar-wrap">
            <div className="avatar-icon"> {/* placeholder avatar */}
              <svg width="60" height="60" viewBox="0 0 24 24" fill="none">
                <path d="M12 12c2.761 0 5-2.239 5-5s-2.239-5-5-5-5 2.239-5 5 2.239 5 5 5z" fill="#111"/>
                <path d="M2 20c0-3.866 4.03-7 10-7s10 3.134 10 7v1H2v-1z" fill="#111" opacity="0.08"/>
              </svg>
            </div>
            <h3 className="sidebar-title">Thông Tin Cá Nhân</h3>
          </div>
        </div>

        <nav className="sidebar-menu" aria-label="Main">
          {menu.map((m) => (
            <button
              key={m.key}
              className={`menu-item ${activeTab === m.key ? "active" : ""}`}
              onClick={() => setActiveTab(m.key)}
            >
              {m.label}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <button className="logout-btn" onClick={handleLogout}>
            Đăng xuất
          </button>
        </div>
      </aside>

      <main className="content">
        <div className="content-card">
          {activeTab === "info" && <PersonalInfo />}
          {activeTab === "password" && <ChangePassword />}
          {activeTab === "orders" && <Orders />}
          {activeTab === "reviews" && <Reviews />}
        </div>
      </main>
    </div>
  );
};

export default PersonalPage;