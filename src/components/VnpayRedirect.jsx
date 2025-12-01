import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function VnpayRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    const query = window.location.search;

    navigate(`/payment-result${query}`, { replace: true });
  }, [navigate]);

  return (
    <div style={{ padding: 30, textAlign: "center" }}>
      <h3>🔄 Đang chuyển hướng đến trang kết quả thanh toán...</h3>
    </div>
  );
}