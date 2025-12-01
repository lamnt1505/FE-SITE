import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { BsCart3 } from "react-icons/bs";
import API_BASE_URL from "../config/config.js";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Header = ({ onSearch = () => {} }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [cartQuantity, setCartQuantity] = useState(0);
  const [username, setUsername] = useState(null);
  const [accountID, setAccountID] = useState(null);
  const [userDropdown, setUserDropdown] = useState(false);
  const [showChangePass, setShowChangePass] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [key, setKey] = useState("");

  const menuRef = useRef(null);
  const navigate = useNavigate();

  // ✅ Khởi tạo state 1 lần duy nhất
  useEffect(() => {
    const accName = localStorage.getItem("accountName");
    const accId = localStorage.getItem("accountId");

    if (accName) setUsername(accName);
    if (accId) setAccountID(accId);

    fetchCartQuantity();
  }, []);

  // ✅ Fetch categories
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/v1/category/Listgetall`)
      .then((res) => res.json())
      .then(setCategories)
      .catch((err) => console.error("Lỗi khi lấy danh mục:", err));
  }, []);

  // ✅ Close menu khi click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isMenuOpen]);

  // ✅ Global function để update cart
  useEffect(() => {
    window.updateCartQuantity = fetchCartQuantity;
    return () => delete window.updateCartQuantity;
  }, []);

  const fetchCartQuantity = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/dossier-statistic/cart/quantity`, {
        credentials: "include",
      });
      const qty = await res.json();
      setCartQuantity(qty);
    } catch (error) {
      console.error("Lỗi khi lấy số lượng giỏ hàng:", error);
    }
  };

  const handleSearch = () => {
    if (key.trim() === "") {
      toast.info("🔎 Vui lòng nhập nội dung để tìm kiếm!");
      return;
    }
    onSearch(key);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/v1/account/logout`, {
        method: "POST",
        credentials: "include",
      });

      localStorage.clear();
      sessionStorage.clear();

      setUsername(null);
      setAccountID(null);
      setCartQuantity(0);
      setUserDropdown(false);

      toast.success("✅ Đăng xuất thành công");
      navigate("/index");
    } catch (err) {
      console.error("Lỗi đăng xuất:", err);
      toast.error("❌ Có lỗi khi đăng xuất");
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.error("❌ Vui lòng điền đầy đủ thông tin!");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("❌ Mật khẩu mới không khớp!");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("❌ Mật khẩu mới phải ít nhất 6 ký tự!");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("oldPassword", oldPassword);
      formData.append("newPassword", newPassword);
      formData.append("confirmPassword", confirmPassword);

      const res = await fetch(
        `${API_BASE_URL}/api/v1/account/changer-password/${accountID}`,
        {
          method: "PUT",
          body: formData,
        }
      );

      if (res.ok) {
        toast.success("✅ Đổi mật khẩu thành công!");
        setShowChangePass(false);
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        const msg = await res.text();
        toast.error(`❌ ${msg || "Đổi mật khẩu thất bại"}`);
      }
    } catch (err) {
      console.error("Lỗi:", err);
      toast.error("❌ Có lỗi khi gọi API");
    }
  };

  const handleCategorySelect = (catId) => {
    setIsMenuOpen(false);
    navigate(`/catalog/${catId}`);
  };

  const handleCartClick = () => {
    navigate("/cart");
  };

  const handleLoginClick = () => {
    navigate("/login");
  };

  return (
    <>
      <header className="app-header d-flex justify-content-between align-items-center p-3 bg-light border-bottom">
        <div className="d-flex align-items-center gap-3">
          {/* Nút Trang Chủ */}
          <button
            className="btn"
            style={{
              background: "linear-gradient(45deg, #1976d2, #00f2fe)",
              color: "white",
              fontWeight: "bold",
              border: "none",
              borderRadius: "30px",
              padding: "8px 20px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            }}
            onClick={() => navigate("/index")}
          >
            TRANG CHỦ
          </button>

          {/* Menu Loại Sản Phẩm */}
          <div className="menu-container" ref={menuRef} style={{ position: "relative" }}>
            <div
              className="btn"
              style={{
                background: "linear-gradient(45deg, #1976d2, #00f2fe)",
                color: "white",
                fontWeight: "bold",
                border: "none",
                borderRadius: "30px",
                padding: "10px 20px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                cursor: "pointer",
              }}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              DANH MỤC
            </div>

            {isMenuOpen && (
              <div
                className="custom-dropdown-menu"
                style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  background: "#fff",
                  border: "1px solid #ddd",
                  padding: "10px",
                  zIndex: 1000,
                  minWidth: "200px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                  borderRadius: "6px",
                  marginTop: "5px",
                }}
              >
                {categories.length > 0 ? (
                  categories.map((cat) => (
                    <a
                      key={cat.id}
                      href="#"
                      className="menu-item"
                      onClick={(e) => {
                        e.preventDefault();
                        handleCategorySelect(cat.id);
                      }}
                      style={{
                        display: "block",
                        padding: "10px 15px",
                        textDecoration: "none",
                        color: "#333",
                        borderRadius: "4px",
                        transition: "background-color 0.2s",
                      }}
                      onMouseEnter={(e) =>
                        (e.target.style.backgroundColor = "#f0f0f0")
                      }
                      onMouseLeave={(e) =>
                        (e.target.style.backgroundColor = "transparent")
                      }
                    >
                      {cat.name}
                    </a>
                  ))
                ) : (
                  <p style={{ padding: "10px", color: "#999" }}>
                    Đang tải danh mục...
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Thanh Tìm Kiếm */}
        <div className="search-bar" style={{ flex: 1, margin: "0 20px" }}>
          <input
            type="text"
            placeholder="TÌM SẢN PHẨM..."
            value={key}
            onChange={(e) => setKey(e.target.value)}
            onKeyDown={handleKeyPress}
            className="form-control"
          />
          <button
            onClick={handleSearch}
            style={{
              background: "#1976d2",
              color: "white",
              border: "none",
              borderRadius: "4px",
              padding: "8px 12px",
              cursor: "pointer",
              marginLeft: "5px",
            }}
          >
            🔍
          </button>
        </div>

        {/* Header Icons */}
        <div className="header-icons d-flex align-items-center gap-3">
          {/* Giỏ Hàng */}
          <div
            onClick={handleCartClick}
            style={{
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "5px",
              fontSize: "20px",
            }}
          >
            <BsCart3 />
            <span
              style={{
                backgroundColor: "#ff6b6b",
                color: "white",
                borderRadius: "50%",
                width: "24px",
                height: "24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "12px",
                fontWeight: "bold",
              }}
            >
              {cartQuantity}
            </span>
          </div>

          {/* Nút khi đã đăng nhập */}
          {username && (
            <>
              <button
                className="btn btn-sm btn-outline-danger"
                onClick={() => navigate(`/favorites/${accountID}`)}
              >
                YÊU THÍCH
              </button>
              <button
                className="btn btn-sm btn-outline-primary"
                onClick={() => navigate("/myorder")}
              >
                ĐƠN HÀNG
              </button>
            </>
          )}

          {/* User Menu */}
          {username ? (
            <div className="user-info position-relative">
              <span
                style={{
                  cursor: "pointer",
                  textDecoration: "underline",
                  fontWeight: "500",
                }}
                onClick={() => setUserDropdown(!userDropdown)}
              >
                {username}
              </span>

              {userDropdown && (
                <div
                  className="position-absolute bg-white border rounded shadow"
                  style={{
                    right: 0,
                    top: "120%",
                    zIndex: 2000,
                    minWidth: "200px",
                  }}
                >
                  <div
                    className="px-3 py-2"
                    style={{
                      cursor: "pointer",
                      borderBottom: "1px solid #eee",
                      transition: "background-color 0.2s",
                    }}
                    onClick={() => {
                      navigate(`/updateProfile/${accountID}`);
                      setUserDropdown(false);
                    }}
                    onMouseEnter={(e) =>
                      (e.target.style.backgroundColor = "#f5f5f5")
                    }
                    onMouseLeave={(e) =>
                      (e.target.style.backgroundColor = "transparent")
                    }
                  >
                    CHỈNH SỬA HỒ SƠ
                  </div>
                  <div
                    className="px-3 py-2"
                    style={{
                      cursor: "pointer",
                      borderBottom: "1px solid #eee",
                      transition: "background-color 0.2s",
                    }}
                    onClick={() => setShowChangePass(true)}
                    onMouseEnter={(e) =>
                      (e.target.style.backgroundColor = "#f5f5f5")
                    }
                    onMouseLeave={(e) =>
                      (e.target.style.backgroundColor = "transparent")
                    }
                  >
                    ĐỔI MẬT KHẨU
                  </div>
                  <div
                    className="px-3 py-2 text-danger"
                    style={{
                      cursor: "pointer",
                      transition: "background-color 0.2s",
                    }}
                    onClick={handleLogout}
                    onMouseEnter={(e) =>
                      (e.target.style.backgroundColor = "#ffe6e6")
                    }
                    onMouseLeave={(e) =>
                      (e.target.style.backgroundColor = "transparent")
                    }
                  >
                    ĐĂNG XUẤT
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              className="btn btn-sm btn-primary"
              onClick={handleLoginClick}
              style={{
                background: "linear-gradient(45deg, #1976d2, #00f2fe)",
                border: "none",
              }}
            >
              ĐĂNG NHẬP
            </button>
          )}
        </div>
      </header>

      {/* Modal Đổi Mật Khẩu */}
      {showChangePass && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-dark bg-opacity-50"
          style={{ zIndex: 1050 }}
        >
          <div
            className="bg-white p-4 rounded shadow w-100"
            style={{ maxWidth: "400px" }}
          >
            <h5 className="mb-3 text-center">ĐỔI MẬT KHẨU</h5>
            <form onSubmit={handleChangePassword}>
              <input
                type="password"
                className="form-control mb-2"
                placeholder="MẬT KHẨU CŨ"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                required
              />
              <input
                type="password"
                className="form-control mb-2"
                placeholder="MẬT KHẨU MỚI"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <input
                type="password"
                className="form-control mb-3"
                placeholder="XÁC NHẬN MẬT KHẨU"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />

              <div className="d-flex justify-content-end gap-2">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowChangePass(false);
                    setOldPassword("");
                    setNewPassword("");
                    setConfirmPassword("");
                  }}
                >
                  HỦY
                </button>
                <button type="submit" className="btn btn-primary">
                  LƯU
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;