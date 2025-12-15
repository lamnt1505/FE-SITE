import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/CatalogPage/CatalogPage.css";
import { insertCart } from "../redux/reducers/cartReducer";
import { useDispatch, useSelector } from "react-redux";
import API_BASE_URL from "../config/config.js";
import { toast } from "react-toastify";
import Breadcrumb from "./Breadcrumb";
import "react-toastify/dist/ReactToastify.css";

const CatalogPage = () => {
  const { categoryID } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  const cartState = useSelector((state) => state.cartData);
  const [comparedProducts, setComparedProducts] = useState([]);
  const [showCompareModal, setShowCompareModal] = useState(false);

  const thStyle = {
    background: "#1976d2",
    color: "white",
    padding: "12px",
    width: "200px",
    border: "1px solid #ddd",
  };

  const tdStyle = {
    padding: "12px",
    border: "1px solid #ddd",
    verticalAlign: "top",
  };

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
          <span>Sản phẩm đã được thêm vào giỏ hàng</span>
        </div>
      );
    } else if (cartState.status === "failed") {
      toast.error("Có lỗi khi thêm sản phẩm vào giỏ hàng!", {
        autoClose: 3000,
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

  const handleCompare = async (product) => {
    if (comparedProducts.some((p) => p.productID === product.productID)) {
      toast.info("Sản phẩm này đã có trong danh sách so sánh!");
      return;
    }

    if (comparedProducts.length === 2) {
      toast.info("Chỉ so sánh tối đa 2 sản phẩm!");
      return;
    }

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/v1/product/${product.productID}/get`
      );
      if (!res.ok)
        throw new Error("Không lấy được thông tin chi tiết sản phẩm");

      const fullProduct = await res.json();

      const newList = [...comparedProducts, fullProduct];
      setComparedProducts(newList);

      if (newList.length === 2) {
        setShowCompareModal(true);
      }
    } catch (err) {
      console.error(err);
      toast.error("Lỗi khi tải thông tin sản phẩm!");
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
        className="product-category-title text-center mb-5"
        style={{
          width: "100%",
        }}
      >
        <h2
          style={{
            fontFamily: "Poppins, sans-serif",
            fontWeight: "600",
            fontSize: "2.5rem",
            letterSpacing: "0.5px",
            color: "#1976d2",
            marginBottom: "0",
            display: "inline-block",
            borderBottom: "3px solid #19d2c3",
            paddingBottom: "12px",
          }}
        >
          SẢN PHẨM DANH MỤC #{categoryID}
        </h2>
      </div>

      <div style={{ width: "100%", clear: "both" }}>
        {products.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "60px 20px",
              backgroundColor: "#f5f5f5",
              borderRadius: "12px",
              color: "#999",
            }}
          >
            <p style={{ fontSize: "18px", marginBottom: "10px" }}>🛍️</p>
            <p style={{ fontSize: "16px", margin: 0 }}>
              Không có sản phẩm nào trong danh mục này.
            </p>
          </div>
        ) : (
          <div className="table-responsive">
            <table
              className="table"
              style={{
                borderCollapse: "collapse",
                backgroundColor: "#fff",
                borderRadius: "12px",
                overflow: "hidden",
                boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
              }}
            >
              <thead>
                <tr
                  style={{
                    background: "linear-gradient(90deg, #1976d2, #1565c0)",
                    color: "white",
                    fontWeight: "600",
                    fontSize: "15px",
                  }}
                >
                  <th
                    style={{
                      padding: "16px",
                      textAlign: "center",
                      width: "120px",
                    }}
                  >
                    Hình ảnh
                  </th>
                  <th style={{ padding: "16px", textAlign: "left" }}>
                    Tên sản phẩm
                  </th>
                  <th
                    style={{
                      padding: "16px",
                      textAlign: "center",
                      width: "150px",
                    }}
                  >
                    Giá
                  </th>
                  <th
                    style={{
                      padding: "16px",
                      textAlign: "center",
                      width: "280px",
                    }}
                  >
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody>
                {products.map((item, index) => (
                  <tr
                    key={item.productID}
                    style={{
                      borderBottom: "1px solid #e0e0e0",
                      transition: "all 0.3s ease",
                      backgroundColor: index % 2 === 0 ? "#ffffff" : "#f9f9f9",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#f0f7ff";
                      e.currentTarget.style.boxShadow =
                        "inset 0 0 0 1px #e3f2fd";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor =
                        index % 2 === 0 ? "#ffffff" : "#f9f9f9";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    <td style={{ padding: "12px", textAlign: "center" }}>
                      <img
                        src={item.imageBase64}
                        alt={item.productName}
                        style={{
                          width: "80px",
                          height: "80px",
                          objectFit: "cover",
                          borderRadius: "8px",
                          border: "1px solid #e0e0e0",
                          transition: "transform 0.3s ease",
                          cursor: "pointer",
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.transform = "scale(1.05)";
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.transform = "scale(1)";
                        }}
                      />
                    </td>
                    <td
                      style={{
                        padding: "12px",
                        fontWeight: "600",
                        fontSize: "15px",
                        color: "#222",
                        textAlign: "left",
                      }}
                    >
                      {item.productName}
                    </td>
                    <td
                      style={{
                        padding: "12px",
                        fontWeight: "700",
                        fontSize: "16px",
                        color: "#1976d2",
                        textAlign: "center",
                      }}
                    >
                      {item.price
                        ? `${item.price.toLocaleString("vi-VN")} VND`
                        : "—"}
                    </td>
                    <td style={{ padding: "12px", textAlign: "center" }}>
                      <div
                        style={{
                          display: "flex",
                          gap: "8px",
                          justifyContent: "center",
                        }}
                      >
                        <button
                          onClick={() => handleBuy(item.productID)}
                          disabled={cartState.status === "loading"}
                          style={{
                            flex: 1,
                            backgroundColor: "#ff6b6b",
                            color: "white",
                            border: "none",
                            borderRadius: "6px",
                            padding: "8px 12px",
                            fontWeight: "600",
                            fontSize: "13px",
                            cursor: "pointer",
                            transition: "all 0.3s ease",
                            opacity: cartState.status === "loading" ? 0.6 : 1,
                          }}
                          onMouseEnter={(e) => {
                            if (cartState.status !== "loading") {
                              e.target.style.backgroundColor = "#ff5252";
                              e.target.style.transform = "translateY(-2px)";
                              e.target.style.boxShadow =
                                "0 4px 12px rgba(255, 107, 107, 0.4)";
                            }
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.backgroundColor = "#ff6b6b";
                            e.target.style.transform = "translateY(0)";
                            e.target.style.boxShadow = "none";
                          }}
                        >
                          {cartState.status === "loading" ? "Đang..." : "Mua"}
                        </button>
                        <button
                          onClick={() => handleCompare(item)}
                          style={{
                            flex: 1,
                            backgroundColor: "#f0f0f0",
                            color: "#333",
                            border: "1px solid #ddd",
                            borderRadius: "6px",
                            padding: "8px 12px",
                            fontWeight: "600",
                            fontSize: "13px",
                            cursor: "pointer",
                            transition: "all 0.3s ease",
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.backgroundColor = "#e3f2fd";
                            e.target.style.borderColor = "#1976d2";
                            e.target.style.color = "#1976d2";
                            e.target.style.transform = "translateY(-2px)";
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.backgroundColor = "#f0f0f0";
                            e.target.style.borderColor = "#ddd";
                            e.target.style.color = "#333";
                            e.target.style.transform = "translateY(0)";
                          }}
                        >
                          So sánh
                        </button>
                        <button
                          onClick={() => navigate(`/product/${item.productID}`)}
                          style={{
                            flex: 1,
                            backgroundColor: "#19d2c3",
                            color: "white",
                            border: "none",
                            borderRadius: "6px",
                            padding: "8px 12px",
                            fontWeight: "600",
                            fontSize: "13px",
                            cursor: "pointer",
                            transition: "all 0.3s ease",
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.backgroundColor = "#00bfb3";
                            e.target.style.transform = "translateY(-2px)";
                            e.target.style.boxShadow =
                              "0 4px 12px rgba(25, 210, 195, 0.4)";
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.backgroundColor = "#19d2c3";
                            e.target.style.transform = "translateY(0)";
                            e.target.style.boxShadow = "none";
                          }}
                        >
                          Chi tiết
                        </button>
                      </div>
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
            background: "rgba(0,0,0,0.55)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 2000,
            padding: "10px",
          }}
          onClick={handleCloseCompare}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "relative",
              background: "#fff",
              borderRadius: "10px",
              padding: "20px",
              width: "95%",
              maxWidth: "800px", 
              maxHeight: "85vh",
              overflowY: "auto",
              boxShadow: "0 4px 18px rgba(0,0,0,0.25)",
            }}
          >
            {/* CLOSE BUTTON */}
            <button
              onClick={handleCloseCompare}
              style={{
                position: "absolute",
                top: "10px",
                right: "15px",
                fontSize: "28px",
                border: "none",
                background: "transparent",
                cursor: "pointer",
              }}
            >
              &times;
            </button>

            <h2
              style={{
                textAlign: "center",
                marginBottom: "20px",
                fontSize: "22px",
                fontWeight: "700",
              }}
            >
              SO SÁNH SẢN PHẨM
            </h2>

            {/* ===== BẢNG SO SÁNH ===== */}
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
              }}
            >
              <tbody>
                {/* ẢNH */}
                <tr>
                  <th style={thStyle}>Hình ảnh</th>
                  {comparedProducts.map((p) => (
                    <td key={p.id} style={tdStyle}>
                      <img
                        src={p.image || p.image1 || p.imageBase64}
                        alt={p.name}
                        style={{
                          width: "120px",
                          height: "120px",
                          objectFit: "contain",
                          borderRadius: "8px",
                        }}
                      />
                    </td>
                  ))}
                </tr>

                {/* TÊN */}
                <tr>
                  <th style={thStyle}>Tên sản phẩm</th>
                  {comparedProducts.map((p) => (
                    <td key={p.id} style={tdStyle}>
                      <strong>{p.name}</strong>
                    </td>
                  ))}
                </tr>

                {/* GIÁ */}
                <tr>
                  <th style={thStyle}>Giá</th>
                  {comparedProducts.map((p) => (
                    <td key={p.id} style={tdStyle}>
                      {p.price ? p.price.toLocaleString("vi-VN") + " VND" : "—"}
                    </td>
                  ))}
                </tr>

                {/* THƯƠNG HIỆU */}
                <tr>
                  <th style={thStyle}>Thương hiệu</th>
                  {comparedProducts.map((p) => (
                    <td key={p.id} style={tdStyle}>
                      {p.tradeName}
                    </td>
                  ))}
                </tr>

                {/* DANH MỤC */}
                <tr>
                  <th style={thStyle}>Danh mục</th>
                  {comparedProducts.map((p) => (
                    <td key={p.id} style={tdStyle}>
                      {p.categoryname}
                    </td>
                  ))}
                </tr>

                {/* MÔ TẢ */}
                <tr>
                  <th style={thStyle}>Mô tả</th>
                  {comparedProducts.map((p) => (
                    <td key={p.id} style={tdStyle}>
                      {p.description || "Không có mô tả"}
                    </td>
                  ))}
                </tr>

                {/* PHIÊN BẢN */}
                <tr>
                  <th style={thStyle}>Phiên bản</th>
                  {comparedProducts.map((p) => (
                    <td key={p.id} style={tdStyle}>
                      {p.productVersions?.length > 0 ? (
                        <ul style={{ paddingLeft: "20px", margin: 0 }}>
                          {p.productVersions.map((v) => (
                            <li key={v.versionID}>
                              {v.memory} – {v.color}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        "Không có phiên bản"
                      )}
                    </td>
                  ))}
                </tr>

                {/* CHI TIẾT KỸ THUẬT */}
                <tr>
                  <th style={thStyle}>Chi tiết kỹ thuật</th>
                  {comparedProducts.map((p) => (
                    <td key={p.id} style={tdStyle}>
                      {p.productDetails?.length > 0 ? (
                        <div>
                          {p.productDetails.map((d) => (
                            <div
                              key={d.productDetailID}
                              style={{
                                marginBottom: "8px",
                                padding: "8px",
                                borderRadius: "6px",
                                background: "#f7f7f7",
                                border: "1px solid #ddd",
                                fontSize: "14px",
                              }}
                            >
                              {d.productCamera && (
                                <p>
                                  <b>Camera:</b> {d.productCamera}
                                </p>
                              )}
                              {d.productWifi && (
                                <p>
                                  <b>Wifi:</b> {d.productWifi}
                                </p>
                              )}
                              {d.productScreen && (
                                <p>
                                  <b>Màn hình:</b> {d.productScreen}
                                </p>
                              )}
                              {d.productBluetooth && (
                                <p>
                                  <b>Bluetooth:</b> {d.productBluetooth}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        "Không có thông tin chi tiết"
                      )}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default CatalogPage;
