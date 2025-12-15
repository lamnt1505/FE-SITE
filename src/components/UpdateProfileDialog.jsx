import React, { useEffect, useState } from "react";
import { useParams, useNavigate  } from "react-router-dom";
import "../styles/UpdateProfilePage/UpdateProfilePage.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import API_BASE_URL from "../config/config.js";

const UpdateProfilePage = () => {
  const { accountID } = useParams();
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  
  const [formData, setFormData] = useState({
    accountName: "",
    username: "",
    phoneNumber: "",
    email: "",
    local: "",
    dateOfBirth: "",
    image: "",
  });

  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/v1/account/${accountID}/get`)
      .then((res) => res.json())
      .then((data) => {
        setFormData({
          accountName: data.accountName || "",
          username: data.username || "",
          phoneNumber: data.phoneNumber || "",
          email: data.email || "",
          local: data.local || "",
          dateOfBirth: data.dateOfBirth || "",
          image: data.image || "",
        });
      })
      .catch((err) => toast.error("Không thể tải thông tin tài khoản!"));
  }, [accountID]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Ảnh không được vượt quá 5MB!");
        return;
      }

      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!formData.username || !formData.email || !formData.phoneNumber) {
      toast.error("Vui lòng điền đầy đủ thông tin!");
      setLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Email không hợp lệ!");
      setLoading(false);
      return;
    }

    const phoneRegex = /^[0-9]{9,11}$/;
    if (!phoneRegex.test(formData.phoneNumber)) {
      toast.error("Số điện thoại không hợp lệ!");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/v1/account/update/${accountID}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const result = await res.json();
      if (!res.ok) {
        const errorMessage = result.message || "Cập nhật thất bại";

        if (errorMessage.includes("Email")) {
          setErrors((prev) => ({ ...prev, email: errorMessage }));
          toast.error("❌ " + errorMessage);
        }
        else if (errorMessage.includes("Số điện thoại") || errorMessage.includes("phone")) {
          setErrors((prev) => ({ ...prev, phoneNumber: errorMessage }));
          toast.error("❌ " + errorMessage);
        }
        else {
          toast.error("❌ " + errorMessage);
        }
        throw new Error(errorMessage);
      }

      toast.success("✅ " + result.message);
      setTimeout(() => {
        navigate(-1);
      }, 1500);
    } catch (err) {
      console.error("Error updating profile:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "40px 20px",
      }}
    >
      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          background: "white",
          borderRadius: "12px",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            background: "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)",
            color: "white",
            padding: "30px 20px",
            textAlign: "center",
          }}
        >
          <h2 style={{ margin: 0, fontSize: "28px", fontWeight: "bold" }}>
            CẬP NHẬT HỒ SƠ
          </h2>
          <p style={{ margin: "8px 0 0 0", opacity: 0.9 }}>
            Cập nhật thông tin cá nhân của bạn
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: "40px" }}>
          {/* Row 1: Tên đăng nhập + Họ và tên */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "20px",
              marginBottom: "20px",
            }}
          >
            <div>
              <label
                style={{
                  display: "block",
                  fontWeight: "600",
                  marginBottom: "8px",
                  color: "#333",
                }}
              >
                TÊN ĐĂNG NHẬP
              </label>
              <input
                type="text"
                value={formData.accountName}
                disabled
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "1px solid #ddd",
                  borderRadius: "6px",
                  backgroundColor: "#f5f5f5",
                  cursor: "not-allowed",
                  fontFamily: "inherit",
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontWeight: "600",
                  marginBottom: "8px",
                  color: "#333",
                }}
              >
                HỌ VÀ TÊN *
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "1px solid #ddd",
                  borderRadius: "6px",
                  fontSize: "14px",
                  fontFamily: "inherit",
                  transition: "border-color 0.3s",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#1976d2")}
                onBlur={(e) => (e.target.style.borderColor = "#ddd")}
              />
            </div>
          </div>

          {/* Row 2: Số điện thoại + Email */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "20px",
              marginBottom: "20px",
            }}
          >
            <div>
              <label
                style={{
                  display: "block",
                  fontWeight: "600",
                  marginBottom: "8px",
                  color: "#333",
                }}
              >
                SỐ ĐIỆN THOẠI *
              </label>
              <input
                type="text"
                value={formData.phoneNumber}
                onChange={(e) =>
                  setFormData({ ...formData, phoneNumber: e.target.value })
                }
                placeholder="09xxxxxxxxx"
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "1px solid #ddd",
                  borderRadius: "6px",
                  fontSize: "14px",
                  fontFamily: "inherit",
                  transition: "border-color 0.3s",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#1976d2")}
                onBlur={(e) => (e.target.style.borderColor = "#ddd")}
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontWeight: "600",
                  marginBottom: "8px",
                  color: "#333",
                }}
              >
                EMAIL *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="your@email.com"
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "1px solid #ddd",
                  borderRadius: "6px",
                  fontSize: "14px",
                  fontFamily: "inherit",
                  transition: "border-color 0.3s",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#1976d2")}
                onBlur={(e) => (e.target.style.borderColor = "#ddd")}
              />
            </div>
          </div>

          {/* Row 3: Địa chỉ + Ngày sinh */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "20px",
              marginBottom: "20px",
            }}
          >
            <div>
              <label
                style={{
                  display: "block",
                  fontWeight: "600",
                  marginBottom: "8px",
                  color: "#333",
                }}
              >
                ĐỊA CHỈ
              </label>
              <input
                type="text"
                value={formData.local}
                onChange={(e) =>
                  setFormData({ ...formData, local: e.target.value })
                }
                placeholder="Số nhà, đường, phường/xã..."
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "1px solid #ddd",
                  borderRadius: "6px",
                  fontSize: "14px",
                  fontFamily: "inherit",
                  transition: "border-color 0.3s",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#1976d2")}
                onBlur={(e) => (e.target.style.borderColor = "#ddd")}
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontWeight: "600",
                  marginBottom: "8px",
                  color: "#333",
                }}
              >
                NGÀY SINH
              </label>
              <input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) =>
                  setFormData({ ...formData, dateOfBirth: e.target.value })
                }
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "1px solid #ddd",
                  borderRadius: "6px",
                  fontSize: "14px",
                  fontFamily: "inherit",
                  transition: "border-color 0.3s",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#1976d2")}
                onBlur={(e) => (e.target.style.borderColor = "#ddd")}
              />
            </div>
          </div>

          {/* Row 4: Ảnh đại diện (Full width) */}
          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                fontWeight: "600",
                marginBottom: "8px",
                color: "#333",
              }}
            >
              ẢNH ĐẠI DIỆN
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{
                width: "100%",
                padding: "12px",
                border: "2px dashed #1976d2",
                borderRadius: "6px",
                cursor: "pointer",
                backgroundColor: "#f9f9f9",
              }}
            />

            {/* Preview ảnh */}
            {formData.image && (
              <div style={{ marginTop: "15px", textAlign: "center" }}>
                <img
                  src={formData.image}
                  alt="preview"
                  style={{
                    width: "150px",
                    height: "150px",
                    borderRadius: "10px",
                    objectFit: "cover",
                    border: "3px solid #1976d2",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  }}
                />
              </div>
            )}
          </div>
<div style={{ display: "flex", gap: "12px" }}>
  {/* Button Quay về */}
  <button
    type="button"
    onClick={() => window.history.back()}
    style={{
      flex: 1,
      padding: "14px",
      background: "#6c757d",
      color: "white",
      border: "none",
      borderRadius: "6px",
      fontSize: "16px",
      fontWeight: "600",
      cursor: "pointer",
      transition: "all 0.3s",
      boxShadow: "0 4px 12px rgba(108, 117, 125, 0.3)",
    }}
    onMouseEnter={(e) => {
      e.target.style.transform = "translateY(-2px)";
      e.target.style.boxShadow = "0 6px 16px rgba(108, 117, 125, 0.4)";
    }}
    onMouseLeave={(e) => {
      e.target.style.transform = "translateY(0)";
      e.target.style.boxShadow = "0 4px 12px rgba(108, 117, 125, 0.3)";
    }}
  >
    QUAY VỀ
  </button>

  {/* Button Lưu thay đổi */}
  <button
    type="submit"
    disabled={loading}
    style={{
      flex: 1,
      padding: "14px",
      background: loading
        ? "#ccc"
        : "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)",
      color: "white",
      border: "none",
      borderRadius: "6px",
      fontSize: "16px",
      fontWeight: "600",
      cursor: loading ? "not-allowed" : "pointer",
      transition: "all 0.3s",
      boxShadow: loading
        ? "none"
        : "0 4px 12px rgba(25, 118, 210, 0.3)",
    }}
    onMouseEnter={(e) => {
      if (!loading) {
        e.target.style.transform = "translateY(-2px)";
        e.target.style.boxShadow = "0 6px 16px rgba(25, 118, 210, 0.4)";
      }
    }}
    onMouseLeave={(e) => {
      if (!loading) {
        e.target.style.transform = "translateY(0)";
        e.target.style.boxShadow = "0 4px 12px rgba(25, 118, 210, 0.3)";
      }
    }}
  >
    {loading ? "ĐANG LƯU..." : "LƯU THAY ĐỔI"}
  </button>
</div>
        </form>
      </div>
    </div>
  );
};

export default UpdateProfilePage;