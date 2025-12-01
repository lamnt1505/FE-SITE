import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../config/config.js";

const RegisterPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    accountName: "",
    accountPass: "",
    username: "",
    email: "",
    phoneNumber: "",
    dateOfBirth: "",
    local: "",
  });

  const [image, setImage] = useState(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // "success" hoặc "error"

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const validatePassword = (password) => {
    const hasUppercase = /[A-Z]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    return hasUppercase || hasSpecialChar;
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhoneNumber = (phone) => {
    const phoneRegex = /^[0-9]{10,11}$/;
    return phoneRegex.test(phone);
  };

  const showMessage = (msg, type) => {
    setMessage(msg);
    setMessageType(type);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    // Validate tên đăng nhập
    if (!formData.accountName || formData.accountName.trim().length < 3) {
      showMessage("❌ Tên đăng nhập phải có ít nhất 3 ký tự!", "error");
      return;
    }

    // Validate mật khẩu
    if (!formData.accountPass || formData.accountPass.length < 6) {
      showMessage("❌ Mật khẩu phải có ít nhất 6 ký tự!", "error");
      return;
    }

    if (!validatePassword(formData.accountPass)) {
      showMessage("❌ Mật khẩu phải có ít nhất 1 chữ hoa hoặc 1 ký tự đặc biệt!", "error");
      return;
    }

    // Validate họ tên
    if (!formData.username || formData.username.trim().length < 2) {
      showMessage("❌ Họ tên phải có ít nhất 2 ký tự!", "error");
      return;
    }

    // Validate email - BẮT BUỘC
    if (!formData.email || formData.email.trim() === "") {
      showMessage("❌ Vui lòng nhập email!", "error");
      return;
    }

    if (!validateEmail(formData.email)) {
      showMessage("❌ Email không hợp lệ! Vui lòng nhập đúng định dạng (vd: example@gmail.com)", "error");
      return;
    }

    // Validate số điện thoại - BẮT BUỘC
    if (!formData.phoneNumber || formData.phoneNumber.trim() === "") {
      showMessage("❌ Vui lòng nhập số điện thoại!", "error");
      return;
    }

    if (!validatePhoneNumber(formData.phoneNumber)) {
      showMessage("❌ Số điện thoại phải có 10-11 chữ số!", "error");
      return;
    }

    // Validate ngày sinh
    if (!formData.dateOfBirth) {
      showMessage("❌ Vui lòng chọn ngày sinh!", "error");
      return;
    }

    // Kiểm tra tuổi (phải >= 13 tuổi)
    const birthDate = new Date(formData.dateOfBirth);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    if (age < 13) {
      showMessage("❌ Bạn phải ít nhất 13 tuổi để đăng ký!", "error");
      return;
    }

    // Validate địa chỉ
    if (!formData.local || formData.local.trim() === "") {
      showMessage("❌ Vui lòng nhập địa chỉ!", "error");
      return;
    }

    // Validate ảnh
    if (!image) {
      showMessage("❌ Vui lòng chọn ảnh đại diện!", "error");
      return;
    }

    // Kiểm tra kích thước file (tối đa 5MB)
    if (image.size > 5 * 1024 * 1024) {
      showMessage("❌ Kích thước ảnh không được vượt quá 5MB!", "error");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Image = reader.result;

      const data = {
        ...formData,
        image: base64Image,
      };

      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/account/add`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        const result = await res.json();

        if (!res.ok) {
          showMessage(`❌ ${result.message || "Đăng ký thất bại!"}`, "error");
          return;
        }

        showMessage(`✅ ${result.message || "Đăng ký thành công!"}`, "success");
        setTimeout(() => navigate("/login"), 2000);
      } catch (err) {
        console.error("Lỗi đăng ký:", err);
        showMessage("❌ Có lỗi kết nối server, vui lòng thử lại!", "error");
      }
    };

    reader.readAsDataURL(image);
  };

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <div className="card p-4 shadow-lg" style={{ width: "450px" }}>
        <h3 className="text-center mb-3">ĐĂNG KÝ TÀI KHOẢN</h3>

        {message && (
          <div 
            className={`alert ${messageType === "success" ? "alert-success" : "alert-danger"}`}
            role="alert"
          >
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="accountName"
            placeholder="TÊN ĐĂNG NHẬP *"
            className="form-control mb-2"
            value={formData.accountName}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="accountPass"
            placeholder="MẬT KHẨU (tối thiểu 6 ký tự) *"
            className="form-control mb-2"
            value={formData.accountPass}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="username"
            placeholder="HỌ TÊN *"
            className="form-control mb-2"
            value={formData.username}
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="EMAIL *"
            className="form-control mb-2"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="phoneNumber"
            placeholder="SỐ ĐIỆN THOẠI (10-11 số) *"
            className="form-control mb-2"
            value={formData.phoneNumber}
            onChange={handleChange}
            maxLength="11"
            required
          />
          <input
            type="date"
            name="dateOfBirth"
            className="form-control mb-2"
            value={formData.dateOfBirth}
            onChange={handleChange}
            max={new Date().toISOString().split('T')[0]}
            required
          />
          <input
            type="text"
            name="local"
            placeholder="ĐỊA CHỈ *"
            className="form-control mb-2"
            value={formData.local}
            onChange={handleChange}
            required
          />
          <div className="mb-3">
            <label className="form-label text-muted small">Ảnh đại diện *</label>
            <input
              type="file"
              accept="image/*"
              className="form-control"
              onChange={handleImageChange}
              required
            />
            {image && (
              <div className="mt-2 text-success small">
                ✓ Đã chọn: {image.name}
              </div>
            )}
          </div>

          <button type="submit" className="btn btn-success w-100 mb-2">
            ĐĂNG KÝ
          </button>
          <button
            type="button"
            className="btn btn-outline-secondary w-100"
            onClick={() => navigate("/login")}
          >
            ĐÃ CÓ TÀI KHOẢN? ĐĂNG NHẬP
          </button>
        </form>

        <div className="mt-3">
          <small className="text-muted">
            <strong>Lưu ý:</strong> Các trường có dấu (*) là bắt buộc
          </small>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;