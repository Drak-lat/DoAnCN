import React from "react";
import { Outlet } from "react-router-dom";
import "./Admin.css";
import AdminSidebar from "../../components/AdminSidebar/AdminSidebar";

export default function AdminLayout() {
  return (
    <div className="admin-container">
      <AdminSidebar />
      
      {/* Main content */}
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
