import React, { useState, useEffect } from 'react';
import { getOrderById, updateOrderStatus } from '../../../services/orderService';
import './OrderModal.css';

function OrderViewModal({ order, onClose, onStatusUpdate }) {
  const [orderDetail, setOrderDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [orderStatus, setOrderStatus] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (order) {
      fetchOrderDetail();
    }
  }, [order]);

  const fetchOrderDetail = async () => {
    try {
      setLoading(true);
      const response = await getOrderById(order.id_order);
      if (response.data.success) {
        const data = response.data.data;
        setOrderDetail(data);
        setOrderStatus(data.order_status || '');
        setPaymentStatus(data.payment_status || '');
      }
    } catch (error) {
      console.error('Fetch order detail error:', error);
      setMessage({ type: 'error', text: 'Không thể tải chi tiết đơn hàng' });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    try {
      setUpdating(true);
      const response = await updateOrderStatus(order.id_order, {
        order_status: orderStatus,
        payment_status: paymentStatus
      });

      if (response.data.success) {
        setMessage({ type: 'success', text: 'Cập nhật trạng thái thành công!' });
        onStatusUpdate && onStatusUpdate();
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setMessage({ type: 'error', text: response.data.message || 'Cập nhật thất bại' });
      }
    } catch (error) {
      console.error('Update status error:', error);
      setMessage({ type: 'error', text: 'Lỗi khi cập nhật trạng thái' });
    } finally {
      setUpdating(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Chưa cập nhật';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!order) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content large-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Chi tiết đơn hàng #{order.id_order}</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>

        <div className="modal-body">
          {loading ? (
            <div className="loading">Đang tải...</div>
          ) : orderDetail ? (
            <div className="order-detail-content">
              {message.text && (
                <div className={`message ${message.type}`}>
                  {message.text}
                </div>
              )}

              {/* Thông tin đơn hàng */}
              <div className="order-section">
                <h3>Thông tin đơn hàng</h3>
                <div className="order-info-grid">
                  <div className="info-item">
                    <label>Mã đơn hàng:</label>
                    <span>#{orderDetail.id_order}</span>
                  </div>
                  <div className="info-item">
                    <label>Ngày đặt:</label>
                    <span>{formatDate(orderDetail.date_order)}</span>
                  </div>
                  <div className="info-item">
                    <label>Tổng tiền:</label>
                    <span className="total-price">{formatPrice(orderDetail.total)}</span>
                  </div>
                  <div className="info-item">
                    <label>Phương thức thanh toán:</label>
                    <span>{orderDetail.payment_method || 'Chưa xác định'}</span>
                  </div>
                </div>
              </div>

              {/* Thông tin khách hàng */}
              <div className="order-section">
                <h3>Thông tin khách hàng</h3>
                <div className="order-info-grid">
                  <div className="info-item">
                    <label>Tài khoản:</label>
                    <span>{orderDetail.Login?.username || 'N/A'}</span>
                  </div>
                  <div className="info-item">
                    <label>Tên người nhận:</label>
                    <span>{orderDetail.receiver_name || 'N/A'}</span>
                  </div>
                  <div className="info-item">
                    <label>Số điện thoại:</label>
                    <span>{orderDetail.receiver_phone || 'N/A'}</span>
                  </div>
                  <div className="info-item full-width">
                    <label>Địa chỉ nhận hàng:</label>
                    <span>{orderDetail.receiver_address || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Sản phẩm trong đơn hàng */}
              <div className="order-section">
                <h3>Sản phẩm đã đặt</h3>
                <table className="order-products-table">
                  <thead>
                    <tr>
                      <th>STT</th>
                      <th>Tên sản phẩm</th>
                      <th>Số lượng</th>
                      <th>Đơn giá</th>
                      <th>Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderDetail.OrderDetails && orderDetail.OrderDetails.length > 0 ? (
                      orderDetail.OrderDetails.map((detail, index) => (
                        <tr key={detail.id_detail}>
                          <td>{index + 1}</td>
                          <td>{detail.Product?.name_product || 'N/A'}</td>
                          <td>{detail.quantity_detail}</td>
                          <td>{formatPrice(detail.price_detail)}</td>
                          <td>{formatPrice(detail.quantity_detail * detail.price_detail)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="no-data">Không có sản phẩm nào</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Cập nhật trạng thái */}
              <div className="order-section">
                <h3>Cập nhật trạng thái</h3>
                <div className="status-update-grid">
                  <div className="form-group">
                    <label>Trạng thái đơn hàng:</label>
                    <select 
                      value={orderStatus} 
                      onChange={(e) => setOrderStatus(e.target.value)}
                      disabled={updating}
                    >
                      <option value="Chờ xác nhận">Chờ xác nhận</option>
                      <option value="Đã xác nhận">Đã xác nhận</option>
                      <option value="Đang giao">Đang giao</option>
                      <option value="Đã giao">Đã giao</option>
                      <option value="Đã hủy">Đã hủy</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Trạng thái thanh toán:</label>
                    <select 
                      value={paymentStatus} 
                      onChange={(e) => setPaymentStatus(e.target.value)}
                      disabled={updating}
                    >
                      <option value="Chưa thanh toán">Chưa thanh toán</option>
                      <option value="Đã thanh toán">Đã thanh toán</option>
                      <option value="Đã hoàn tiền">Đã hoàn tiền</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="error">Không thể tải thông tin đơn hàng</div>
          )}
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={updating}>
            Đóng
          </button>
          {orderDetail && (
            <button 
              type="button" 
              className="btn btn-primary" 
              onClick={handleUpdateStatus}
              disabled={updating || loading}
            >
              {updating ? 'Đang cập nhật...' : 'Cập nhật trạng thái'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default OrderViewModal;