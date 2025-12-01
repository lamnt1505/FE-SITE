// Breadcrumb.jsx
import { useNavigate, useLocation } from "react-router-dom";

const Breadcrumb = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const breadcrumbConfig = {
    "/": "Trang Chủ",
    "/index": "Trang Chủ",
    "/cart": "Giỏ Hàng",
    "/myorder": "Đơn Hàng Của Tôi",
    "/favorites": "Danh Sách Yêu Thích",
    "/login": "Đăng Nhập",
    "/register": "Đăng Ký",
  };

  const getCurrentPage = () => {
    const path = location.pathname;
        if (path === "/cart") return "Giỏ Hàng";
        if (path === "/myorder") return "Đơn Hàng Của Tôi";
        if (path === "/login") return "Đăng Nhập";
        if (path === "/register") return "Đăng Ký";
        
        if (path.includes("/product/")) return "Chi Tiết Sản Phẩm";
        if (path.includes("/favorites/")) return "Danh Sách Yêu Thích";
        if (path.includes("/catalog/")) return "Danh Mục Sản Phẩm";
        if (path.includes("/updateProfile/")) return "Chỉnh Sửa Hồ Sơ";
    return "Trang Chủ";
  };

  return (
    <div
      style={{
        backgroundColor: "#f8f9fa",
        padding: "12px 20px",
        borderBottom: "1px solid #ddd",
        fontSize: "14px",
        color: "#666",
      }}
    >
      <span
        onClick={() => navigate("/index")}
        style={{ cursor: "pointer", color: "#1976d2"}}
      >
        Trang Chủ
      </span>
      <span style={{ margin: "0 10px" }}>/</span>
      <span style={{ color: "#333", fontWeight: "500" }}>
        {getCurrentPage()}
      </span>
    </div>
  );
};

export default Breadcrumb;