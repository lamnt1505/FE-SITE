import React, { useEffect, useState } from "react";
import "../styles/myorderpage/MyOrdersPage.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import { Modal } from "bootstrap";
import API_BASE_URL from "../config/config.js";
import Breadcrumb from "./Breadcrumb";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const MyOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState(null);
  const [cancelReason, setCancelReason] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 8;

  useEffect(() => {
    fetchOrders().finally(() => setLoading(false));
    const accountIdStr = localStorage.getItem("accountId");
    if (!accountIdStr || accountIdStr === "undefined") {
      setLoading(false);
      return;
    }

    const accountId = Number(accountIdStr);
    if (isNaN(accountId)) {
      setLoading(false);
      return;
    }

    fetch(`${API_BASE_URL}/orders/account/${accountId}`, {
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Không tìm thấy đơn hàng");
        return res.json();
      })
      .then((data) => setOrders(data))
      .catch((err) => console.error("Lỗi khi lấy đơn hàng:", err))
      .finally(() => setLoading(false));
  }, []);

  const fetchOrders = async () => {
    try {
      const accountIdStr = localStorage.getItem("accountId");
      if (!accountIdStr || accountIdStr === "undefined") return;

      const accountId = Number(accountIdStr);
      if (isNaN(accountId)) return;

      const res = await fetch(`${API_BASE_URL}/orders/account/${accountId}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Không tìm thấy đơn hàng");
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.error("Lỗi khi lấy đơn hàng:", err);
    }
  };

  const fetchOrderDetails = async (orderId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Không tìm thấy chi tiết đơn hàng");
      const data = await res.json();

      setSelectedOrder({ orderId, products: data.oldOrders });
    } catch (err) {
      console.error("Lỗi khi lấy chi tiết đơn hàng:", err);
    }
  };

  const handleShowConfirm = (orderId) => {
    setOrderToCancel(orderId);
    const modal = new Modal(document.getElementById("cancelOrderModal"));
    modal.show();
  };

  const cancelOrder = async () => {
    if (!orderToCancel) return;

    if (!cancelReason.trim()) {
      toast.error("Vui lòng nhập lý do hủy đơn hàng");
      return;
    }

    try {
      const res = await fetch(
        `${API_BASE_URL}/dossier-statistic/cancel-order?orderID=${orderToCancel}&reason=${encodeURIComponent(
          cancelReason
        )}`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      const resultText = await res.text();
      let result;
      try {
        result = JSON.parse(resultText);
      } catch {
        result = { message: resultText };
      }

      if (res.ok) {
        toast.success(result?.message || "Đơn hàng đã được hủy thành công!");
        toast.info("Email xác nhận hủy đã được gửi", { autoClose: 2000 });
        setOrders((prev) =>
          prev.map((order) =>
            order.orderId === orderToCancel
              ? { ...order, status: "ĐÃ HỦY", note: cancelReason }
              : order
          )
        );
      } else {
        toast.error(result?.message || "Không thể hủy đơn hàng");
      }
    } catch (err) {
      console.error("Lỗi khi hủy đơn hàng:", err);
      toast.error("Không thể kết nối đến server!");
    } finally {
      const modalElement = document.getElementById("cancelOrderModal");
      const modalInstance = Modal.getInstance(modalElement);
      if (modalInstance) modalInstance.hide();
      setOrderToCancel(null);
      setCancelReason("");
    }
  };

  if (loading) return <p className="text-center mt-4">⏳ ĐANG TẢI...</p>;

  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);

  const totalPages = Math.ceil(orders.length / ordersPerPage);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  return (
    <div className="row g-3">
      <Breadcrumb />
      <div className="text-center mb-4">
        <h2
          style={{
            fontFamily: "Poppins, sans-serif",
            fontWeight: "500",
            fontSize: "2rem",
            letterSpacing: "0.5px",
            color: "#0f12daff",
            marginBottom: "0",
            display: "inline-block",
            borderBottom: "2px solid #1976d2",
            paddingBottom: "8px",
          }}
        >
          ĐƠN HÀNG CỦA TÔI
        </h2>
      </div>
      {currentOrders.map((order) => (
        <div key={order.orderId} className="col-md-4 col-lg-3">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h6 className="card-title">ĐƠN #{ order.orderNumber} (ID: {order.orderId})</h6>
              {order.txnRef && (
                <p className="mb-1 text-muted" style={{ fontSize: "0.85rem" }}>
                  <strong>MÃ GIAO DỊCH:</strong> {order.txnRef}
                </p>
              )}
              <p className="mb-1">
                <strong>NGÀY:</strong> {order.orderDate}
              </p>
              <p className="mb-1">
                <strong>TRẠNG THÁI:</strong>{" "}
                <span
                  className={`badge ${
                    order.status === "ĐÃ HOÀN THÀNH"
                      ? "bg-success"
                      : order.status === "ĐÃ HỦY"
                      ? "bg-danger"
                      : order.status === "THANH TOÁN THẤT BẠI"
                      ? "bg-danger"
                      : order.status === "CHỜ THANH TOÁN"
                      ? "bg-warning text-dark"
                      : "bg-info text-dark"
                  }`}
                >
                  {order.status}
                </span>
              </p>
              <p className="fw-bold text-danger">
                {order.orderTotal.toLocaleString()} đ
              </p>

              <button
                className="btn btn-sm btn-outline-primary me-2"
                onClick={() => {
                  setSelectedOrder(order);
                  fetchOrderDetails(order.orderId);
                }}
                data-bs-toggle="modal"
                data-bs-target="#orderDetailModal"
              >
                XEM CHI TIẾT
              </button>

              {order.status === "Chờ duyệt" && (
                <button
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => handleShowConfirm(order.orderId)}
                >
                  HỦY ĐƠN
                </button>
              )}
              {order.status === "ĐÃ THANH TOÁN" && (
                <span className="px-3 py-1 text-sm font-semibold text-green-700 bg-green-100 rounded-lg shadow-sm">
                  ĐÃ THANH TOÁN
                </span>
              )}
              {order.status === "THANH TOÁN THẤT BẠI" && (
                <div>
                  <span className="px-3 py-1 text-sm font-semibold text-red-700 bg-red-100 rounded-lg shadow-sm">
                    THANH TOÁN THẤT BẠI
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
      <div
        className="modal fade"
        id="orderDetailModal"
        tabIndex="-1"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content" style={{ borderRadius: "12px" }}>
            <div
              className="modal-header"
              style={{
                background: "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)",
                color: "white",
                borderRadius: "12px 12px 0 0",
              }}
            >
              <h5 className="modal-title" style={{ fontWeight: "bold" }}>
                CHI TIẾT ĐƠN HÀNG #{selectedOrder?.orderId}
              </h5>
              <button
                type="button"
                className="btn-close btn-close-white"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body" style={{ padding: "24px" }}>
              {selectedOrder?.products ? (
                <>
                  <div style={{ overflowX: "auto" }}>
                    <table
                      style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        margin: 0,
                      }}
                    >
                      <thead>
                        <tr
                          style={{
                            backgroundColor: "#f5f5f5",
                            borderBottom: "2px solid #1976d2",
                          }}
                        >
                          <th
                            style={{
                              padding: "14px",
                              textAlign: "left",
                              fontWeight: "600",
                              color: "#1976d2",
                              fontSize: "13px",
                            }}
                          >
                            SẢN PHẨM
                          </th>
                          <th
                            style={{
                              padding: "14px",
                              textAlign: "right",
                              fontWeight: "600",
                              color: "#1976d2",
                              fontSize: "13px",
                            }}
                          >
                            ĐƠN GIÁ
                          </th>
                          <th
                            style={{
                              padding: "14px",
                              textAlign: "center",
                              fontWeight: "600",
                              color: "#1976d2",
                              fontSize: "13px",
                            }}
                          >
                            SỐ LƯỢNG
                          </th>
                          <th
                            style={{
                              padding: "14px",
                              textAlign: "right",
                              fontWeight: "600",
                              color: "#1976d2",
                              fontSize: "13px",
                            }}
                          >
                            THÀNH TIỀN
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedOrder.products.map((p, index) => (
                          <tr
                            key={p.productId}
                            style={{
                              borderBottom: "1px solid #e0e0e0",
                              backgroundColor:
                                index % 2 === 0 ? "#fafafa" : "white",
                              transition: "background-color 0.3s ease",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = "#f0f7ff";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor =
                                index % 2 === 0 ? "#fafafa" : "white";
                            }}
                          >
                            <td
                              style={{
                                padding: "14px",
                                fontWeight: "500",
                                color: "#333",
                              }}
                            >
                              {p.productName}
                            </td>
                            <td
                              style={{
                                padding: "14px",
                                textAlign: "right",
                                color: "#666",
                              }}
                            >
                              {p.price.toLocaleString("vi-VN")} đ
                            </td>
                            <td
                              style={{
                                padding: "14px",
                                textAlign: "center",
                                backgroundColor: "#e3f2fd",
                                fontWeight: "600",
                                color: "#1976d2",
                                borderRadius: "6px",
                                margin: "8px",
                              }}
                            >
                              <span
                                style={{
                                  backgroundColor: "#1976d2",
                                  color: "white",
                                  padding: "4px 10px",
                                  borderRadius: "4px",
                                  display: "inline-block",
                                  minWidth: "30px",
                                }}
                              >
                                {p.amount}
                              </span>
                            </td>
                            <td
                              style={{
                                padding: "14px",
                                textAlign: "right",
                                fontWeight: "700",
                                color: "#1976d2",
                                fontSize: "14px",
                              }}
                            >
                              {p.total.toLocaleString("vi-VN")} đ
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div
                    style={{
                      marginTop: "20px",
                      paddingTop: "16px",
                      borderTop: "2px solid #e0e0e0",
                      display: "flex",
                      justifyContent: "flex-end",
                    }}
                  >
                    <div
                      style={{
                        backgroundColor: "#f0f7ff",
                        padding: "16px 20px",
                        borderRadius: "8px",
                        minWidth: "300px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: "8px",
                          color: "#666",
                        }}
                      >
                        <span>Số sản phẩm:</span>
                        <span style={{ fontWeight: "600" }}>
                          {selectedOrder.products.length}
                        </span>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: "8px",
                          color: "#666",
                        }}
                      >
                        <span>Tổng số lượng:</span>
                        <span style={{ fontWeight: "600" }}>
                          {selectedOrder.products.reduce(
                            (sum, p) => sum + p.amount,
                            0
                          )}{" "}
                          cái
                        </span>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontSize: "16px",
                          fontWeight: "700",
                          color: "#1976d2",
                          paddingTop: "8px",
                          borderTop: "1px solid #e0e0e0",
                        }}
                      >
                        <span>Tổng cộng:</span>
                        <span>
                          {selectedOrder.products
                            .reduce((sum, p) => sum + p.total, 0)
                            .toLocaleString("vi-VN")}{" "}
                          đ
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div
                  style={{
                    textAlign: "center",
                    padding: "40px 20px",
                    color: "#999",
                  }}
                >
                  <div style={{ fontSize: "24px", marginBottom: "8px" }}>
                    ⏳
                  </div>
                  <p>Đang tải chi tiết đơn hàng...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <div
        className="modal fade"
        id="cancelOrderModal"
        tabIndex="-1"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div
              className="modal-header"
              style={{ borderBottom: "2px solid #f10509ff" }}
            >
              <h5
                className="modal-title"
                style={{ fontWeight: "bold", color: "#f10509ff" }}
              >
                XÁC NHẬN HỦY ĐƠN HÀNG
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>

            <div className="modal-body" style={{ padding: "24px" }}>
              <p
                style={{
                  color: "#f10509ff",
                  fontWeight: "600",
                  marginBottom: "20px",
                }}
              >
                BẠN CÓ CHẮC MUỐN HỦY ĐƠN HÀNG #{orderToCancel}
              </p>

              {/* Lựa chọn lý do */}
              <label
                style={{
                  fontWeight: "600",
                  marginBottom: "12px",
                  display: "block",
                }}
              >
                CHỌN LÝ DO HỦY:
              </label>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "8px",
                  marginBottom: "16px",
                }}
              >
                {[
                  "Chọn món khác",
                  "Tìm thấy giá rẻ hơn",
                  "Sản phẩm không còn",
                  "Địa chỉ giao hàng sai",
                  "Thay đổi ý định",
                  "Không cần đến nữa",
                  "Sản phẩm bị lỗi/hỏng",
                ].map((reason) => (
                  <button
                    key={reason}
                    onClick={() => setCancelReason(reason)}
                    style={{
                      padding: "10px 14px",
                      border:
                        cancelReason === reason
                          ? "2px solid #f10509ff"
                          : "1px solid #ddd",
                      backgroundColor:
                        cancelReason === reason ? "#fff5f5" : "white",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontSize: "13px",
                      fontWeight: cancelReason === reason ? "600" : "500",
                      color: cancelReason === reason ? "#f10509ff" : "#333",
                      transition: "all 0.2s ease",
                      textAlign: "left",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = "#fff5f5";
                      e.target.style.borderColor = "#f10509ff";
                    }}
                    onMouseLeave={(e) => {
                      if (cancelReason !== reason) {
                        e.target.style.backgroundColor = "white";
                        e.target.style.borderColor = "#ddd";
                      }
                    }}
                  >
                    {reason}
                  </button>
                ))}
              </div>
              <label
                style={{
                  fontWeight: "600",
                  marginBottom: "8px",
                  display: "block",
                  marginTop: "16px",
                }}
              >
                LÝ DO KHÁC (TÙY CHỌN):
              </label>
              <textarea
                className="form-control"
                rows="3"
                placeholder="Nhập lý do chi tiết của bạn..."
                value={
                  cancelReason.includes(" - ")
                    ? cancelReason.split(" - ")[1]
                    : ""
                }
                onChange={(e) => {
                  if (e.target.value.trim()) {
                    setCancelReason(`Khác - ${e.target.value}`);
                  } else {
                    setCancelReason("");
                  }
                }}
                style={{ borderColor: "#ddd" }}
              ></textarea>
            </div>

            <div
              className="modal-footer"
              style={{ borderTop: "1px solid #e0e0e0" }}
            >
              <button
                className="btn btn-secondary"
                data-bs-dismiss="modal"
                onClick={() => setCancelReason("")}
              >
                ĐÓNG
              </button>
              <button
                className="btn btn-danger"
                onClick={cancelOrder}
                disabled={!cancelReason.trim()}
                style={{
                  opacity: !cancelReason.trim() ? "0.6" : "1",
                  cursor: !cancelReason.trim() ? "not-allowed" : "pointer",
                }}
              >
                XÁC NHẬN HỦY
              </button>
            </div>
          </div>
        </div>
      </div>
      {orders.length > ordersPerPage && (
        <div className="d-flex justify-content-center align-items-center mt-4 gap-3">
          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
          >
            ⏮ VỀ TRANG ĐẦU
          </button>
          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={handlePrevPage}
            disabled={currentPage === 1}
          >
            ← TRANG TRƯỚC
          </button>
          <span>
            TRANG {currentPage} / {totalPages}
          </span>
          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
          >
            TRANG SAU →
          </button>
          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
          >
            ĐẾN TRANG CUỐI ⏭
          </button>
        </div>
      )}
    </div>
  );
};

export default MyOrdersPage;
