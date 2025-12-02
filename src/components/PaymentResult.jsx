import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../config/config.js";

export default function PaymentResult() {
  const [result, setResult] = useState(null);
  const [countdown, setCountdown] = useState(60);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchResult = async () => {
      const res = await fetch(
        `${API_BASE_URL}/vnpay-return${window.location.search}`
      );
      const data = await res.json();
      setResult(data);
    };
    fetchResult();
  }, []);

  useEffect(() => {
    if (result?.status === "success" || result?.status === "failed") {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            window.close();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [result]);

  if (!result) return <p>Đang kiểm tra giao dịch...</p>;

  return (
    <div style={{ padding: 20 }}>
      {result.status === "success" ? (
        <>
          <h2 style={{ color: "green" }}>{result.message}</h2>
          <div
            style={{
              backgroundColor: "#e8f5e9",
              border: "1px solid #4caf50",
              borderRadius: 8,
              padding: 12,
              marginTop: 10,
              marginBottom: 15,
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <span style={{ fontSize: 18 }}>✉️</span>
            <p style={{ margin: 0, color: "#2e7d32 " }}>
              Email xác nhận đã được gửi đến hộp thư của bạn
            </p>
          </div>
          <p style={{ color: "#999", fontSize: 14 }}>
            Tab này sẽ tự đóng sau <strong>{countdown}</strong> giây...
          </p>
          {result.products && result.products.length > 0 && (
            <div
              style={{
                backgroundColor: "#f9f9f9",
                padding: 15,
                borderRadius: 8,
                marginTop: 15,
                marginBottom: 15,
                border: "1px solid #e0e0e0",
              }}
            >
              <h3 style={{ marginTop: 0, marginBottom: 10 }}>
                Chi tiết đơn hàng:
              </h3>
              {result.products.map((product, index) => (
                <div
                  key={index}
                  style={{
                    padding: 10,
                    borderBottom:
                      index < result.products.length - 1
                        ? "1px solid #e0e0e0"
                        : "none",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: "5px 0", fontWeight: "bold" }}>
                      {product.productName}
                    </p>
                    <p style={{ margin: "5px 0", fontSize: 12, color: "#666" }}>
                      Số lượng: {product.amount} x{" "}
                      {parseInt(product.price).toLocaleString("vi-VN")} VND
                    </p>
                  </div>
                  <p
                    style={{ margin: 0, fontWeight: "bold", color: "#4facfe" }}
                  >
                    {parseInt(product.total).toLocaleString("vi-VN")} VND
                  </p>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          <h2 style={{ color: "red" }}>❌ {result.message}</h2>
          <div
            style={{
              backgroundColor: "#ffebee",
              border: "1px solid #f44336",
              borderRadius: 8,
              padding: 12,
              marginTop: 10,
              marginBottom: 15,
              color: "#c62828",
            }}
          >
            <p style={{ margin: 0 }}>
              ⚠️ Giao dịch không thành công. Vui lòng thử lại hoặc liên hệ hỗ
              trợ.
            </p>
          </div>
          <p style={{ color: "#999", fontSize: 14 }}>
            Tab này sẽ tự đóng sau <strong>{countdown}</strong> giây...
          </p>
        </>
      )}

      {result.amount && (
        <p>
          <strong>SỐ TIỀN:</strong>{" "}
          {(parseInt(result.amount) / 100).toLocaleString("vi-VN")} VND
        </p>
      )}
      {result.orderId && (
        <p>
          <strong>MÃ ĐƠN HÀNG:</strong> {result.orderId}
        </p>
      )}

      <button
        onClick={() => navigate("/myorder")}
        className="btn"
        style={{
          background: "linear-gradient(45deg, #4facfe, #00f2fe)",
          color: "white",
          fontWeight: "bold",
          border: "none",
          borderRadius: "30px",
          padding: "8px 20px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          cursor: "pointer",
        }}
      >
        QUAY VỀ ĐƠN HÀNG CỦA TÔI
      </button>
    </div>
  );
}
