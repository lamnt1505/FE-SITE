import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../config/config.js";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const LoginPage = () => {
  const [accountName, setAccountName] = useState("");
  const [accountPass, setAccountPass] = useState("");
  const [captcha, setCaptcha] = useState("");
  const [captchaUrl, setCaptchaUrl] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const refreshCaptcha = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/account/captcha`, {
        method: "GET",
        credentials: "include",
      });

      if (!res.ok) throw new Error("Không thể tải captcha");

      const blob = await res.blob();
      const imgUrl = URL.createObjectURL(blob);
      setCaptchaUrl(imgUrl);
    } catch (err) {
      toast.error("Không tải được captcha");
    }
  };

  useEffect(() => {
    refreshCaptcha();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/account/login`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          accountName,
          accountPass,
          captcha,
        }),
      });

      const data = await res.json();
      console.log("🔍 Server response:", data);

      if (data.captchaValid === false) {
        setError("Captcha không hợp lệ. Vui lòng thử lại.");
        refreshCaptcha();
        setCaptcha("");
        return;
      }

      if (!data.success) {
        setError(data.message || "Đăng nhập thất bại!");
        refreshCaptcha();
        setCaptcha("");
        return;
      }
      if (data.success) {
        localStorage.setItem("accountName", accountName);
        localStorage.setItem("accountId", data.accountID);

        toast.success("Đăng nhập thành công!");

        const redirect = localStorage.getItem("redirectAfterLogin");

        if (redirect) {
          localStorage.removeItem("redirectAfterLogin");
          navigate(redirect);
          setTimeout(() => {
            window.location.reload(); // ✅ Reload sau 1.5 giây
          }, 1500);
          return;
          // console.log("✅ Navigate tới:", redirect);
          // localStorage.removeItem("redirectAfterLogin");
          // setTimeout(() => navigate(redirect), 1000);
          // return;
        }

        if (data.isAdmin || data.isEmployee) {
          setTimeout(() => {
            navigate("/admin");
            window.location.reload();
          }, 1000);
        } else if (data.isUser) {
          setTimeout(() => {
            navigate("/index");
            window.location.reload();
          }, 1000);
        } else {
          setTimeout(() => {
            navigate("/index");
            window.location.reload();
          }, 1000);
        }
      }
      // if (data.success) {
      //   localStorage.setItem("accountName", accountName);
      //   localStorage.setItem("accountId", data.accountID);

      //   toast.success("Đăng nhập thành công!");

      //   setTimeout(() => {
      //     if (data.admin || data.employee) {
      //       navigate("/admin");
      //       window.location.reload();
      //     } else if (data.user) {
      //       navigate("/index");
      //       window.location.reload();
      //     } else {
      //       navigate("/index");
      //       window.location.reload();
      //     }
      //   }, 50000009);
      // }
    } catch (err) {
      setError("Không thể kết nối server!");
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <div className="card p-4 shadow-lg" style={{ width: "400px" }}>
        <h3 className="text-center mb-3">ĐĂNG NHẬP</h3>
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">TÀI KHOẢN</label>
            <input
              type="text"
              className="form-control"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              required
              placeholder="NHẬP TÀI KHOẢN"
            />
          </div>

          <div className="mb-3" style={{ position: "relative" }}>
            <label className="form-label">MẬT KHẨU</label>
            <input
              type={showPassword ? "text" : "password"}
              className="form-control"
              value={accountPass}
              onChange={(e) => setAccountPass(e.target.value)}
              required
              placeholder="NHẬP MẬT KHẨU"
            />
            <i
              className={`fa ${showPassword ? "fa-eye-slash" : "fa-eye"}`}
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute",
                right: "10px",
                top: "38px",
                cursor: "pointer",
                color: "#555",
              }}
              title={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
            ></i>
          </div>

          <div className="mb-3 d-flex align-items-center justify-content-between">
            <input
              type="text"
              className="form-control me-2"
              placeholder="NHẬP CAPTCHA"
              value={captcha}
              onChange={(e) => setCaptcha(e.target.value)}
              required
            />
            <img
              src={captchaUrl}
              alt="captcha"
              style={{ cursor: "pointer", height: "50px" }}
              onClick={refreshCaptcha}
              title="CLICK ĐỂ LÀM MỚI CAPTCHA"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100 mb-2"
            style={{ background: "linear-gradient(45deg, #1976d2, #00f2fe)" }}
          >
            ĐĂNG NHẬP
          </button>

          <button
            type="button"
            className="btn btn-outline-secondary w-100"
            onClick={() => navigate("/register")}
          >
            ĐĂNG KÝ
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
