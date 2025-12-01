import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "../styles/CatalogPage/CatalogPage.css";
import { insertCart } from "../redux/reducers/cartReducer";
import { useDispatch, useSelector } from "react-redux";
import API_BASE_URL from "../config/config.js";
import { toast } from "react-toastify";
import Breadcrumb from "./Breadcrumb";
import "react-toastify/dist/ReactToastify.css";

const CatalogPage = () => {
  const { categoryID } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  const cartState = useSelector((state) => state.cartData);
  const [comparedProducts, setComparedProducts] = useState([]);
  const [showCompareModal, setShowCompareModal] = useState(false);

  const handleBuy = (productID) => {
    dispatch(insertCart({ productID, amount: 1 }));
  };

  useEffect(() => {
    if (cartState.status === "succeeded") {
        if (window.updateCartQuantity) {
          window.updateCartQuantity();
        }
      toast.success(
        <div className="flex items-center space-x-2">
          <span>SẢN PHẨM ĐÃ ĐƯỢC THÊM VÀO GIỎ HÀNG!</span>
        </div>
        ,
        {
          style: {
            background: "#111",
            color: "#fff",
            fontWeight: "bold",
          },
        }
      );
    } else if (cartState.status === "failed") {
      toast.error("❌ Có lỗi khi thêm sản phẩm vào giỏ hàng!", {
        style: {
          background: "#111",
          color: "#fff",
          fontWeight: "bold",
        },
      });
    }
  }, [cartState.status]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/v1/category/catalog/${categoryID}`)
      .then((res) => {
        if (!res.ok) throw new Error("Không tìm thấy sản phẩm");
        return res.json();
      })
      .then((data) => setProducts(data))
      .catch((err) => console.error("Lỗi:", err))
      .finally(() => setLoading(false));
  }, [categoryID]);

  const handleCompare = (product) => {
    if (comparedProducts.some((p) => p.productID === product.productID)) {
      toast.info("🔍 Sản phẩm này đã được thêm để so sánh!");
      return;
    }

    if (comparedProducts.length === 2) {
      toast.show("⚠️ Chỉ so sánh tối đa 2 sản phẩm mỗi lần!");
      return;
    }

    const newList = [...comparedProducts, product];
    setComparedProducts(newList);

    if (newList.length === 2) {
      setShowCompareModal(true);
    }
  };

  const handleCloseCompare = () => {
    setShowCompareModal(false);
    setComparedProducts([]);
  };

  if (loading) return <p className="text-center mt-4">ĐANG TẢI...</p>;

  return (
    <div
      className="container mt-4"
      style={{
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Breadcrumb />
      <div
        className="product-category-title text-center mb-4"
        style={{
          width: "100%",
        }}
      >
        <h2
          style={{
            fontFamily: "Poppins, sans-serif",
            fontWeight: "400",
            fontSize: "2.2rem",
            letterSpacing: "0.5px",
            color: "#222",
            marginBottom: "0",
            display: "inline-block",
            borderBottom: "2px solid #1976d2",
            paddingBottom: "8px",
          }}
        >
          SẢN PHẨM THEO DANH MỤC #{categoryID}
        </h2>
      </div>
      <div style={{ width: "100%", clear: "both" }}>
        {products.length === 0 ? (
          <div className="toast toast-info text-center">
            Không có sản phẩm nào trong danh mục này.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-bordered align-middle text-center shadow-sm">
              <thead className="table-light">
                <tr>
                  <th style={{ width: "120px" }}>Hình ảnh</th>
                  <th>Tên sản phẩm</th>
                  <th style={{ width: "150px" }}>Giá</th>
                  <th style={{ width: "180px" }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {products.map((item) => (
                  <tr key={item.productID}>
                    <td>
                      <img
                        src={item.imageBase64}
                        alt={item.productName}
                        style={{
                          width: "80px",
                          height: "80px",
                          objectFit: "cover",
                          borderRadius: "8px",
                        }}
                      />
                    </td>
                    <td
                      style={{
                        fontWeight: "500",
                        fontSize: "1rem",
                        color: "#333",
                        textAlign: "left",
                      }}
                    >
                      {item.productName}
                    </td>
                    <td
                      style={{
                        fontWeight: "600",
                        color: "#1976d2",
                      }}
                    >
                      {item.price
                        ? `${item.price.toLocaleString("vi-VN")} VND`
                        : "—"}
                    </td>
                    <td>
                      <button
                        className="btn btn-primary btn-sm me-2"
                        onClick={() => handleBuy(item.productID)}
                        disabled={cartState.status === "loading"}
                      >
                        {cartState.status === "loading"
                          ? "Đang thêm..."
                          : "Mua ngay"}
                      </button>
                      <button className="btn btn-outline-secondary btn-sm"
                      onClick={() => handleCompare(item)}
                      >
                        So sánh
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        </div>
      {showCompareModal && comparedProducts.length === 2 && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
          onClick={handleCloseCompare}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff",
              borderRadius: "10px",
              padding: "24px",
              width: "90%",
              maxWidth: "900px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
            }}
          >
            <button
              onClick={handleCloseCompare}
              style={{
                position: "absolute",
                top: "20px",
                right: "30px",
                fontSize: "28px",
                border: "none",
                background: "transparent",
                cursor: "pointer",
              }}
            >
              &times;
            </button>

            <h3 className="text-center mb-4">SO SÁNH SẢN PHẨM</h3>

            <div
              style={{
                display: "flex",
                justifyContent: "space-around",
                gap: "20px",
              }}
            >
              {comparedProducts.map((p) => (
                <div
                  key={p.productID}
                  style={{
                    flex: 1,
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    padding: "16px",
                    textAlign: "center",
                  }}
                >
                  <img
                    src={p.imageBase64}
                    alt={p.productName}
                    style={{
                      width: "100%",
                      maxWidth: "180px",
                      height: "180px",
                      objectFit: "cover",
                      marginBottom: "10px",
                      borderRadius: "8px",
                    }}
                  />
                  <h5>{p.productName}</h5>
                  <p style={{ color: "#1976d2", fontWeight: "600" }}>
                    {p.price?.toLocaleString("vi-VN")} VND
                  </p>
                  <p>{p.description || "Không có mô tả"}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CatalogPage;
