import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminSidebar from '../../../components/Admin/AdminSidebar/AdminSidebar';
import AdminHeader from '../../../components/Admin/AdminHeader/AdminHeader';
import { getProductFeedbacksAdmin, replyFeedback, deleteFeedback } from '../../../services/feedbackService';
import './FeedbackDetail.css';

function FeedbackDetail() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadFeedbacks = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getProductFeedbacksAdmin(productId);
      if (response.success) {
        setFeedbacks(response.data.feedbacks || []);
      }
    } catch (error) {
      console.error('Load feedbacks error:', error);
      setMessage({ type: 'error', text: 'Không thể tải danh sách đánh giá' });
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    loadFeedbacks();
  }, [loadFeedbacks]);

  const handleOpenReply = (feedback) => {
    setSelectedFeedback(feedback);
    setReplyText(feedback.admin_reply || '');
    setShowReplyModal(true);
  };

  const handleSubmitReply = async () => {
    if (!replyText.trim()) {
      setMessage({ type: 'error', text: 'Vui lòng nhập nội dung phản hồi' });
      return;
    }

    try {
      setSubmitting(true);
      const response = await replyFeedback(selectedFeedback.id_feedback, {
        admin_reply: replyText
      });

      if (response.success) {
        setMessage({ type: 'success', text: 'Phản hồi thành công' });
        setShowReplyModal(false);
        loadFeedbacks();
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Không thể gửi phản hồi' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteFeedback = async (feedbackId) => {
    if (!window.confirm('Bạn có chắc muốn xóa đánh giá này?')) {
      return;
    }

    try {
      const response = await deleteFeedback(feedbackId);
      if (response.success) {
        setMessage({ type: 'success', text: 'Đã xóa đánh giá' });
        loadFeedbacks();
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Không thể xóa đánh giá' });
    }
  };

  const renderStars = (rating) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      return () => clearTimeout(timer);
    }
  }, [message.text]);

  if (loading) {
    return (
      <div className="admin-layout">
        <AdminSidebar />
        <div className="admin-main">
          <AdminHeader title="Chi tiết đánh giá" />
          <div className="admin-content">
            <div className="loading">Đang tải...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-main">
        <AdminHeader title="Chi tiết đánh giá" />
        <div className="admin-content">
          <div className="content-header">
            <button onClick={() => navigate('/admin/feedback')} className="btn-back">
              ← Quay lại
            </button>
          </div>

          {message.text && (
            <div className={`alert alert-${message.type}`}>
              {message.text}
            </div>
          )}

          {feedbacks.length === 0 ? (
            <div className="no-data">Chưa có đánh giá nào</div>
          ) : (
            <div className="feedbacks-list">
              {feedbacks.map(feedback => (
                <div key={feedback.id_feedback} className="feedback-item">
                  <div className="feedback-header">
                    <div className="feedback-user">
                      <strong>{feedback.Login?.username || feedback.Login?.Information?.name_information || 'Khách hàng'}</strong>
                      <span className="feedback-rating">{renderStars(feedback.rating)}</span>
                    </div>
                    <span className="feedback-date">
                      {new Date(feedback.created_at).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                  <div className="feedback-comment">
                    {feedback.comment}
                  </div>
                  {feedback.admin_reply && (
                    <div className="admin-reply-box">
                      <strong>Phản hồi của Admin:</strong>
                      <p>{feedback.admin_reply}</p>
                      <span className="reply-date">
                        {new Date(feedback.reply_at).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                  )}
                  <div className="feedback-actions">
                    <button
                      onClick={() => handleOpenReply(feedback)}
                      className="btn-reply"
                    >
                      {feedback.admin_reply ? 'Sửa phản hồi' : 'Phản hồi'}
                    </button>
                    <button
                      onClick={() => handleDeleteFeedback(feedback.id_feedback)}
                      className="btn-delete"
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Reply Modal */}
      {showReplyModal && (
        <div className="modal-overlay" onClick={() => setShowReplyModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Phản hồi đánh giá</h3>
              <button onClick={() => setShowReplyModal(false)} className="btn-close">×</button>
            </div>
            <div className="modal-body">
              <div className="original-feedback">
                <strong>Tên tài khoản: {selectedFeedback?.Login?.username || 'Khách hàng'}:</strong>
                <p>{selectedFeedback?.comment}</p>
              </div>
              <div className="reply-input">
                <label>Phản hồi của bạn:</label>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Nhập nội dung phản hồi..."
                  rows="5"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowReplyModal(false)} className="btn-cancel">
                Hủy
              </button>
              <button
                onClick={handleSubmitReply}
                className="btn-submit"
                disabled={submitting}
              >
                {submitting ? 'Đang gửi...' : 'Gửi phản hồi'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FeedbackDetail;