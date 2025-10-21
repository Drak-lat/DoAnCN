import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ForgotPassword.ui.css";
import { ForgotPassword as apiForgot } from "../../../services/authService";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [method, setMethod] = useState("email");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [codeSent, setCodeSent] = useState(false); // New state

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!password || !confirm) {
      setError("Vui lòng nhập đầy đủ mật khẩu.");
      return;
    }
    if (password !== confirm) {
      setError("Mật khẩu nhập lại không khớp.");
      return;
    }

    let id = null;
    try {
      const raw = localStorage.getItem('user');
      if (raw) {
        const u = JSON.parse(raw);
        id = u.phone || u.phone_information || u.phoneNumber || u.email || u.username || null;
      }
    } catch (err) {
      id = null;
    }
    // prefer explicit input; otherwise fall back to localStorage id
    const targetIdentifier = (identifier && identifier.trim()) ? identifier.trim() : id;
    if (!targetIdentifier) {
      setError('Vui lòng nhập số điện thoại hoặc email để nhận mã');
      return;
    }

    try {
      const res = await apiForgot({ identifier: targetIdentifier });
      const data = res.data || res;
      // If API returns an OTP (simulated for phone or email), show it to the user
      if (data.otp) {
        const via = data.type === 'phone' ? 'SIM' : 'Email';
        setMessage(`Mã xác thực đã được gửi qua ${via}. Mã (giả lập): ${data.otp}`);
        setIdentifier(targetIdentifier);
      } else {
        setMessage(data.msg || `Mã xác thực đã được gửi.`);
        setIdentifier(targetIdentifier);
      }
      setCodeSent(true); // Set codeSent to true after sending
    } catch (err) {
      setError(err.response?.data?.msg || err.message || 'Lỗi gửi mã');
    }
  };

  return (
    <div className="fp-page">
      <div className="fp-card">
        <h2 className="fp-title">Quên Mật Khẩu</h2>

        <form onSubmit={handleSubmit} className="fp-form">
          <input
            type="text"
            placeholder="Số điện thoại hoặc email "
            className="fp-input"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
          />
          <input
            type="password"
            placeholder="Nhập mật khẩu mới"
            className="fp-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <input
            type="password"
            placeholder="Nhập lại mật khẩu"
            className="fp-input"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />

          <div className="fp-methods">
            <div
              className={`method ${method === "sim" ? "active" : ""}`}
              onClick={() => setMethod("sim")}
            >
              SIM
            </div>
            <div
              className={`method ${method === "email" ? "active" : ""}`}
              onClick={() => setMethod("email")}
            >
              Email
            </div>
            <button type="submit" className="fp-submit">
              Gửi mã
            </button>
          </div>
        </form>

        {codeSent && (
        <div className="fp-verify-row">
            <input
            type="text"
            placeholder="Nhập mã xác thực"
            className="fp-input fp-otp-input"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            />
            <button
            className="fp-submit fp-verify-btn"
            onClick={async (ev) => {
                ev.preventDefault();
                setMessage(''); setError('');
                if (!verificationCode) { setError('Nhập mã OTP'); return; }
                if (!identifier) { setError('Không có thông tin tài khoản để xác thực'); return; }
                if (!password || !confirm) { setError('Nhập mật khẩu mới và xác nhận để đổi mật khẩu'); return; }
                if (password !== confirm) { setError('Mật khẩu không khớp'); return; }
                try {
                const res = await apiForgot({ identifier, otp: verificationCode, newPassword: password });
                const data = res.data || res;
                if (data.success) {
                    setMessage(data.msg || 'Xác thực thành công. Chuyển về đăng nhập...');
                    setTimeout(() => navigate('/login'), 1500);
                } else {
                    setError(data.msg || 'Xác thực thất bại');
                }
                } catch (err) {
                setError(err.response?.data?.msg || err.message || 'Lỗi');
                }
            }}
            >
            Kiểm tra mã
            </button>
        </div>
        )}

        
        {message && <div className="info">{message}</div>}
        {error && <div className="error">{error}</div>}

        <div className="fp-bottom">
          <p>
            Bạn chưa có tài khoản?{" "}
            <a href="/register" className="fp-link">
              Đăng ký.
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
