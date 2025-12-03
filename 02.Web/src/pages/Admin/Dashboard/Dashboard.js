import React, { useState, useEffect } from 'react';
import AdminLayout from '../../../components/Admin/AdminLayout/AdminLayout';
import { getDashboard, getTopProducts } from '../../../services/adminService';
import { getImageUrl } from '../../../services/homeService';
import './Dashboard.css';

function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [topProducts, setTopProducts] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    
    // Cập nhật thời gian mỗi giây
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const fetchData = async () => {
    try {
      const [dashResponse, productsResponse] = await Promise.all([
        getDashboard(),
        getTopProducts()
      ]);

      if (dashResponse.data.success) {
        setDashboardData(dashResponse.data.data);
      }

      if (productsResponse.data.success) {
        setTopProducts(productsResponse.data.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
    setLoading(false);
  };

  const formatDateTime = (date) => {
    return date.toLocaleString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="loading">Đang tải...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="dashboard">
        <h1>Dashboard</h1>
        
        {/* Thời gian thực */}
        <div className="current-time">
          <h3>{formatDateTime(currentTime)}</h3>
        </div>

        {/* Thống kê */}
        <div className="stats-row">
          <div className="stat-card">
            <h4>Tổng đơn hàng</h4>
            <p className="stat-number">{dashboardData?.totalOrders || 0}</p>
          </div>
          <div className="stat-card">
            <h4>Tổng sản phẩm</h4>
            <p className="stat-number">{dashboardData?.totalProducts || 0}</p>
          </div>
        </div>

        {/* Top 10 sản phẩm bán chạy */}
        <div className="top-products">
          <h2>Top 10 sản phẩm bán chạy nhất</h2>
          {topProducts.length > 0 ? (
            <div className="products-table">
              <table>
                <thead>
                  <tr>
                    <th>STT</th>
                    <th>Hình ảnh</th>
                    <th>Tên sản phẩm</th>
                    <th>Giá</th>
                    <th>Số lượng đã bán</th>
                  </tr>
                </thead>
                <tbody>
                  {topProducts.map((item, index) => (
                    <tr key={item.id_product}>
                      <td>{index + 1}</td>
                      <td>
                        <img 
                          src={getImageUrl(item.Product?.image_product)} 
                          alt={item.Product?.name_product}
                          className="product-image"
                          onError={(e) => e.target.src = '/placeholder.jpg'}
                        />
                      </td>
                      <td>{item.Product?.name_product}</td>
                      <td>{item.Product?.price?.toLocaleString('vi-VN')}đ</td>
                      <td>{item.total_sold}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="no-data">
              <p>Không có sản phẩm nào được bán</p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

export default Dashboard;