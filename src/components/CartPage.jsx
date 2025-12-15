import React, { useEffect, useState } from "react";
import "../styles/CartPage/CartPage.css";
import { useNavigate } from "react-router-dom";
import { updateQuantity } from "../redux/reducers/cartSlice";
import { useDispatch, useSelector } from "react-redux";
import API_BASE_URL from "../config/config.js";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Breadcrumb from "./Breadcrumb";

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [discountCode, setDiscountCode] = useState("");
  const { loading } = useSelector((state) => state.cart);
  const [discountedTotal, setDiscountedTotal] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showVnpayModal, setShowVnpayModal] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const getValueOrFallback = (primary, fallback) => {
    if (primary && primary.trim() !== "") {
      return primary;
    }
    return fallback || "";
  };

  const handleGetFromAccount = async () => {
    try {
      const accountID = localStorage.getItem("accountId");

      const res = await fetch(`${API_BASE_URL}/address/account/${accountID}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Lỗi lấy thông tin tài khoản");

      const data = await res.json();

      setFormData((prev) => ({
        ...prev,
        receiverName: getValueOrFallback(data.receiverName, data.username),
        receiverPhone: getValueOrFallback(data.receiverPhone, data.phoneNumber),
        shippingAddress: getValueOrFallback(data.shippingAddress, data.local),
        note: data.note || prev.note,
        email: getValueOrFallback(data.email, ""),
      }));
      toast.success("Đã lấy thông tin từ tài khoản!");
    } catch (error) {
      toast.error("Không thể lấy thông tin tài khoản");
    }
  };

  const [formData, setFormData] = useState({
    receiverName: "",
    receiverPhone: "",
    shippingAddress: "",
    note: "",
  });

  //lấy giỏ hàng từ server
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/product-cart`, {
          credentials: "include",//gửi thêm cookie
        });
        const data = await res.json();

        // Map dữ liệu từ API sang format local
        const mappedCart = (data.cart || []).map((item) => ({
          id: item.productID,
          name: item.name,
          price: item.price,
          amount: item.amount,
          imageUrl: item.image,
        }));
        setCartItems(mappedCart);
      } catch (err) {
        console.error("Lỗi lấy giỏ hàng:", err);
      }
    };
    fetchCart();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  //gọi từ cartSlice => update số lượng sản phẩm trong giỏ hàng
  const handleUpdateCart = () => {
    cartItems.forEach((item) => {
      // gọi redux action updateQuantity
      dispatch(updateQuantity({ productID: item.id, amount: item.amount }))
        .unwrap()// lấy kết quả từ async thunk
        .then((res) => {
          if (res.result === 1) {
            toast.success(`Đã cập nhật ${item.name}`);
          } else if (res.result === 2) {
            toast.info(`${item.name} đã bị xoá khỏi giỏ`);
          } else if (res.result === 0) {
            toast.warning(
              `Không tìm thấy ${item.name}, vui lòng tải lại giỏ`
            );
          } else {
            toast.error("Cập nhật thất bại!");
          }
        })
        .catch(() => toast.error("Lỗi server khi cập nhật"));
    });
  };
  
  // xóa sản phẩm khỏi giỏ hàng
  const removeItem = async (id) => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/dossier-statistic/update--quantities`,
        {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          credentials: "include",
          body: new URLSearchParams({ productID: id, amount: 0 }),
        }
      );

      const result = await res.text();
      if (result === "2") {
        setCartItems((prev) => prev.filter((item) => item.id !== id));
        toast.success("Xóa sản phẩm thành công!");
        if (window.updateCartQuantity) {
          window.updateCartQuantity();
        }
      } else {
        toast.error("Xóa sản phẩm thất bại!");
      }
    } catch (err) {
      toast.error("Lỗi hệ thống!");
    }
  };

  // hàm xử lý số lượng
  const changeQuantity = (id, newAmount) => {
    // Nếu số lượng < 1 → không cập nhật
    if (newAmount < 1) return;
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, amount: newAmount } : item
      )
    );
  };

  const getTotal = () => cartItems.reduce((sum, item) => sum + item.price * item.amount, 0);

  //hàm xử lý áp dụng mã giảm giá
  const applyDiscount = async () => {
    // Kiểm tra mã có trống không
    if (!discountCode.trim()) {
      toast.error("Vui lòng nhập mã giảm giá!");
      return;
    }
    try {
      //gọi api sản phẩm
      const res = await fetch(`${API_BASE_URL}/dossier-statistic/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          discountCode,
          products: cartItems.map((item) => ({
            productID: item.id,
            price: item.price,
            quantity: item.amount,
          })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Mã giảm giá không hợp lệ!");
        return;
      }
      if (data.success) {
        // áp dụng thành công
        setDiscountedTotal(data.discountedTotal);
        toast.success(
          `${
            data.message
          }\nTổng sau giảm: ${data.discountedTotal.toLocaleString()}₫`
        );
      } else {
        toast.warning(data.message || "Mã giảm giá không hợp lệ!");
      }
    } catch (err) {
      toast.error("Đã xảy ra lỗi hệ thống, vui lòng thử lại!");
    }
  };
  
  //hàm xử lý ĐẶT HÀNG (COD)
  const placeOrder = async () => {
    //các validate
    const { receiverName, receiverPhone, email, shippingAddress } = formData;

    if (!receiverName || !receiverPhone || !email || !shippingAddress) {
      toast.error("Vui lòng nhập đầy đủ thông tin giao hàng!");
      return;
    }

    const phoneRegex = /^[0-9]{9,11}$/;
    if (!phoneRegex.test(receiverPhone)) {
      toast.error("Số điện thoại không hợp lệ!");
      return;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]{2,}\.[a-zA-Z]{2,}$/;

    if (!emailRegex.test(email)) {
      toast.error("Email không hợp lệ!");
      return;
    }

    try {
      //request đặt hàng
      const accountId = localStorage.getItem("accountId");
      const res = await fetch(`${API_BASE_URL}/dossier-statistic/orders`, {
        method: "POST",
        credentials: "include",//gửi kèm cookie
        headers: {
          "Content-Type": "application/json",
          "X-Account-ID": accountId,
        },
        body: JSON.stringify(formData),
      });
      const result = await res.text();

      if (result === "1") {
        // Thành công
        toast.success("Đặt hàng thành công! Đang chuyển hướng...", {
          autoClose: 1000,
        });
        toast.info("Email xác nhận đã được gửi tới " + email, {
          autoClose: 2000,
        });
        setCartItems([]);//clean giỏ hàng
        setTimeout(() => navigate("/myorder"), 1200);
        if (window.updateCartQuantity) {
          window.updateCartQuantity();
        }
      } else if (result === "0") {//chưa đăng nhập
        localStorage.setItem("redirectAfterLogin", "/cart");// lưu trang hiện tại để redirect sau khi đăng nhập
        toast.error("Bạn cần đăng nhập để đặt hàng.");
        setTimeout(() => navigate("/login"), 1500);
      } else if (result === "-1") {
        toast.error("Giỏ hàng trống, không thể đặt hàng.");
      } else {
        toast.error("Đặt hàng thất bại!");
      }
    } catch (err) {
      toast.error("Lỗi hệ thống khi đặt hàng.");
    }
  };

  //hàm xử lý THANH TOÁN VNPAY
  const handleVnpayPaymentEdit = async () => {
    const { receiverName, receiverPhone, email, shippingAddress } = formData;

    if (!receiverName || !receiverPhone || !email || !shippingAddress) {
      toast.error("Vui lòng nhập đầy đủ thông tin giao hàng!");
      return;
    }

    const phoneRegex = /^[0-9]{9,11}$/;
    if (!phoneRegex.test(receiverPhone)) {
      toast.error("Số điện thoại không hợp lệ!");
      return;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]{2,}\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      toast.error("Email không hợp lệ!");
      return;
    }

    try {
      const accountId = localStorage.getItem("accountId");
      if (!accountId) {
        localStorage.setItem("redirectAfterLogin", "/cart");// lưu trang hiện tại để redirect sau khi đăng nhập
        toast.error("Bạn cần đăng nhập để thanh toán!");
        setTimeout(() => navigate("/login"), 1500);
        return;
      }

      // Tạo đơn hàng status = "CHỜ THANH TOÁN"
      const orderRes = await fetch(`${API_BASE_URL}/orders/vnpay`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-Account-ID": accountId,
        },
        body: JSON.stringify(formData),
      });
      const orderData = await orderRes.json();

      if (orderData.status !== "success") {
        toast.error("Lỗi" + orderData.message);
        return;
      }

      const txnRef = orderData.txnRef;// mã giao dịch từ server

      localStorage.setItem("currentTxnRef", txnRef);
      localStorage.setItem("paymentStartTime", new Date().getTime());

      // lấy link thanh toán từ VNPay
      const payRes = await fetch(
        `${API_BASE_URL}/create-payment?txnRef=${txnRef}`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      const payData = await payRes.json();

      if (payData.status === "success") {
        toast.success("Chuyển hướng tới vnPay...");
        const paymentUrl = payData.paymentUrl;

        //mở popup thanh toán
        setTimeout(() => {
          const vnpayWindow = window.open(
            paymentUrl,
            "vnpay_payment",
            "width=800,height=600"
          );

          if (!vnpayWindow || vnpayWindow.closed) {
            toast.error("Vui lòng cho phép popup để thanh toán");
            localStorage.removeItem("currentTxnRef");
            localStorage.removeItem("paymentStartTime");
            return;
          }

          // theo dõi popup
          const startTime = new Date().getTime();
          const TIMEOUT = 10 * 30 * 1000; // 10 phút = 600.000ms

          const checkWindowInterval = setInterval(async () => {
            const elapsed = new Date().getTime() - startTime;

            // quá 10 phút => timeout => tắt popup => trả về THANH TOÁN THẤT BẠI
            if (elapsed > TIMEOUT) {
              clearInterval(checkWindowInterval);
              if (vnpayWindow && !vnpayWindow.closed) {
                vnpayWindow.close();
              }
              try {
                await fetch(`${API_BASE_URL}/vnpay-cancel/${txnRef}`, {
                  method: "POST",
                  credentials: "include",
                });
                toast.error("Phiên thanh toán đã hết hạn");
              } catch (err) {
                console.error("Lỗi khi hủy timeout:", err);
              }

              localStorage.removeItem("currentTxnRef");
              localStorage.removeItem("paymentStartTime");

              setTimeout(() => {
                window.location.href = "/myorder";
              }, 1500);
              return;
            }

            //Nếu popup đã đóng => kiểm tra kết quả
            if (vnpayWindow && vnpayWindow.closed) {
              clearInterval(checkWindowInterval);
              
              try {
                //Kiểm tra trạng thái đơn hàng
                const statusRes = await fetch(
                  `${API_BASE_URL}/check-payment-status/${txnRef}`,
                  { credentials: "include" }
                );
                const statusData = await statusRes.json();
                //Trạng thái "CHỜ THANH TOÁN" => Khách hủy

                if (statusData.orderStatus === "CHỜ THANH TOÁN") {
                  const cancelRes = await fetch(
                    `${API_BASE_URL}/vnpay-cancel/${txnRef}`,
                    {
                      method: "POST",
                      credentials: "include",
                      headers: { "Content-Type": "application/json" },
                    }
                  );

                  const cancelData = await cancelRes.json();
                  if (cancelData.status === "ok") {
                    toast.error("Bạn đã hủy thanh toán");
                  }
                } else if (statusData.orderStatus === "Chờ duyệt") {
                  //Trạng thái "Chờ duyệt" => Khách thanh toán thành công
                  toast.success("Thanh toán thành công!");
                } else if (statusData.orderStatus === "THANH TOÁN THẤT BẠI") {
                  // Trạng thái "THANH TOÁN THẤT BẠI" => Thất bại
                  toast.error("Thanh toán thất bại");
                }
              } catch (error) {
                console.error("Lỗi khi kiểm tra trạng thái:", error);
                toast.error("Không thể xác định trạng thái thanh toán");
              }

              localStorage.removeItem("currentTxnRef");
              localStorage.removeItem("paymentStartTime");

              //navigate myorder kiểm tra trạng thái đơn hàng
              setTimeout(() => {
                window.location.href = "/myorder";
              }, 1500);
            }
          }, 1000);

          // Cleanup khi user F5 hoặc close tab
          const cleanupHandler = () => {
            clearInterval(checkWindowInterval);
            if (vnpayWindow && !vnpayWindow.closed) {
              vnpayWindow.close();
            }
          };

          window.addEventListener("beforeunload", cleanupHandler);// Khi F5, reload, close tab

          window._vnpayCheckInterval = checkWindowInterval;// Lưu interval để có thể clear khi cần
          window._vnpayCleanup = cleanupHandler;// Lưu cleanup để có thể gọi khi cần

          if (window.updateCartQuantity) {
            window.updateCartQuantity();// Cập nhật số lượng giỏ hàng
          }
        }, 1500);
      } else {
        toast.error("Lỗi " + payData.message);
        localStorage.removeItem("currentTxnRef");
        localStorage.removeItem("paymentStartTime");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Lỗi kết nối server!");

      localStorage.removeItem("currentTxnRef");
      localStorage.removeItem("paymentStartTime");
    }
  };

  return (
    <div className="cart-page d-flex flex-column min-vh-100">
      <Breadcrumb />
      <div className="cart-table card shadow-sm border-0 mb-4">
        <div className="card-body p-0">
          <table className="table table-hover align-middle mb-0 text-center">
            <thead className="table-dark">
              <tr>
                <th></th>
                <th className="text-start">SẢN PHẨM</th>
                <th>GIÁ TIỀN</th>
                <th>SỐ LƯỢNG</th>
                <th>TỔNG</th>
              </tr>
            </thead>
            <tbody>
              {cartItems.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-4 text-muted">
                    GIỎ HÀNG TRỐNG
                  </td>
                </tr>
              ) : (
                cartItems.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <button
                        className="btn btn-sm btn-outline-danger rounded-circle"
                        onClick={() => removeItem(item.id)}
                      >
                        🗑
                      </button>
                    </td>
                    <td className="text-start d-flex align-items-center gap-3">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        width={70}
                        className="rounded border"
                      />
                      <span className="fw-semibold">{item.name}</span>
                    </td>
                    <td className="fw-semibold text-primary">
                      {item.price.toLocaleString()} đ
                    </td>
                    <td>
                      <div className="d-flex justify-content-center align-items-center gap-2">
                        <button
                          className="btn btn-outline-secondary btn-sm rounded-circle"
                          onClick={() =>
                            changeQuantity(item.id, item.amount - 1)
                          }
                          disabled={item.amount <= 1}
                        >
                          -
                        </button>
                        <input
                          type="text"
                          value={item.amount}
                          onChange={(e) =>
                            changeQuantity(item.id, Number(e.target.value))
                          }
                          className="form-control text-center"
                          style={{ width: "60px" }}
                        />
                        <button
                          className="btn btn-outline-secondary btn-sm rounded-circle"
                          onClick={() =>
                            changeQuantity(item.id, item.amount + 1)
                          }
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td className="fw-bold text-success">
                      {(item.price * item.amount).toLocaleString()} đ
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <div className="text-end p-3 d-flex justify-content-end gap-2">
            <button
              className="btn btn-secondary"
              onClick={() => navigate("/index")}
            >
              TIẾP TỤC MUA HÀNG
            </button>
            <button
              className="btn btn-primary"
              onClick={handleUpdateCart}
              disabled={loading}
            >
              {loading ? "ĐANG CẬP NHẬT..." : "CẬP NHẬT GIỎ HÀNG"}
            </button>
          </div>
        </div>
      </div>
      <div className="cart-footer card shadow-sm border-0 p-4 mt-4">
        <div className="row align-items-center">
          <div className="col-md-6 mb-3 mb-md-0">
            <div className="d-flex align-items-center gap-2">
              <label className="fw-semibold">🎟 MÃ GIẢM GIÁ:</label>
              <input
                type="text"
                placeholder="Nhập mã..."
                className="form-control"
                style={{ maxWidth: "200px" }}
                value={discountCode}
                onChange={(e) => setDiscountCode(e.target.value)}
              />
              <button className="btn btn-outline-dark" onClick={applyDiscount}>
                ÁP DỤNG
              </button>
            </div>
          </div>
          <div className="col-md-6 text-md-end text-center">
            <h4 className="fw-bold mb-3">
              {discountedTotal ? (
                <>
                  <span
                    style={{
                      textDecoration: "line-through",
                      color: "gray",
                      marginRight: "8px",
                      fontSize: "1rem",
                    }}
                  >
                    {getTotal().toLocaleString()} đ
                  </span>
                  <span
                    style={{
                      color: "red",
                      fontWeight: "bold",
                      fontSize: "1.5rem",
                    }}
                  >
                    {discountedTotal.toLocaleString()} đ
                  </span>
                  <br />
                  <small style={{ color: "green" }}>
                    Tiết kiệm: {(getTotal() - discountedTotal).toLocaleString()}{" "}
                    đ
                  </small>
                </>
              ) : (
                <span className="text-danger" style={{ fontSize: "1.5rem" }}>
                  {getTotal().toLocaleString()} đ
                </span>
              )}
            </h4>
            <div className="d-flex gap-3 justify-content-md-end justify-content-center">
              <button
                onClick={() => {
                  const accountId = localStorage.getItem("accountId");
                  if (!accountId) {
                    localStorage.setItem("redirectAfterLogin", "/cart");
                    toast.error("Bạn cần đăng nhập để đặt hàng!");
                    setTimeout(() => navigate("/login"), 1500);
                  } else {
                    setShowModal(true);
                  }
                }}
                className="btn btn-primary px-4"
                disabled={cartItems.length === 0}
              >
                ĐẶT HÀNG
              </button>
              <button
                className="btn btn-danger px-4"
                style={{
                  background: "linear-gradient(45deg, #dc3545, #ff6b6b)",
                  border: "none",
                  fontWeight: "600",
                  fontSize: "1rem",
                  boxShadow: "0 4px 8px rgba(220, 53, 69, 0.3)",
                  transition: "all 0.3s ease",
                  opacity: cartItems.length === 0 ? 0.5 : 1, 
                  cursor: cartItems.length === 0 ? "not-allowed" : "pointer",
                }}
                onMouseEnter={(e) => {
                  e.target.style.boxShadow = "0 6px 12px rgba(220, 53, 69, 0.5)";
                  e.target.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.boxShadow = "0 4px 8px rgba(220, 53, 69, 0.3)";
                  e.target.style.transform = "translateY(0)";
                }}
                onClick={() => {
                  const accountId = localStorage.getItem("accountId");
                  if (!accountId) {
                    localStorage.setItem("redirectAfterLogin", "/cart");
                    toast.error("Bạn cần đăng nhập để thanh toán!");
                    setTimeout(() => navigate("/login"), 1500);
                  } else {
                    setShowVnpayModal(true);
                  }
                }}
                disabled={cartItems.length === 0}
              >
                THANH TOÁN VNPAY
              </button>
            </div>
          </div>
        </div>
      </div>
      {showModal && (
        <div className="modal fade show d-block" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">THÔNG TIN GIAO HÀNG</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <input
                  type="text"
                  name="receiverName"
                  placeholder="HỌ VÀ TÊN"
                  value={formData.receiverName}
                  onChange={handleChange}
                  className="form-control mb-2"
                />
                <input
                  type="text"
                  name="receiverPhone"
                  placeholder="SỐ ĐIỆN THOẠI"
                  value={formData.receiverPhone}
                  onChange={handleChange}
                  className="form-control mb-2"
                />
                <input
                  type="email"
                  name="email"
                  placeholder="EMAIL"
                  value={formData.email}
                  onChange={handleChange}
                  className="form-control mb-2"
                />
                <input
                  type="text"
                  name="shippingAddress"
                  placeholder="ĐỊA CHỈ GIAO HÀNG"
                  value={formData.shippingAddress}
                  onChange={handleChange}
                  className="form-control mb-2"
                />
                <textarea
                  name="note"
                  placeholder="Ghi chú (không bắt buộc)"
                  value={formData.note}
                  onChange={handleChange}
                  className="form-control"
                ></textarea>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-outline-primary mb-3 w-100"
                  onClick={handleGetFromAccount}
                >
                  LẤY THÔNG TIN TỪ TÀI KHOẢN
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  HỦY
                </button>
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={placeOrder}
                >
                  XÁC NHẬN ĐẶT HÀNG
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showVnpayModal && (
        <div className="modal fade show d-block" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">THÔNG TIN THANH TOÁN VNPAY</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowVnpayModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <input
                  type="text"
                  name="receiverName"
                  placeholder="HỌ VÀ TÊN"
                  value={formData.receiverName}
                  onChange={handleChange}
                  className="form-control mb-2"
                />
                <input
                  type="text"
                  name="receiverPhone"
                  placeholder="SỐ ĐIỆN THOẠI"
                  value={formData.receiverPhone}
                  onChange={handleChange}
                  className="form-control mb-2"
                />
                <input
                  type="email"
                  name="email"
                  placeholder="EMAIL"
                  value={formData.email}
                  onChange={handleChange}
                  className="form-control mb-2"
                />
                <input
                  type="text"
                  name="shippingAddress"
                  placeholder="ĐỊA CHỈ GIAO HÀNG"
                  value={formData.shippingAddress}
                  onChange={handleChange}
                  className="form-control mb-2"
                />
                <textarea
                  name="note"
                  placeholder="Ghi chú (không bắt buộc)"
                  value={formData.note}
                  onChange={handleChange}
                  className="form-control"
                ></textarea>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-outline-primary mb-3 w-100"
                  onClick={handleGetFromAccount}
                >
                  LẤY THÔNG TIN TỪ TÀI KHOẢN
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowVnpayModal(false)}
                >
                  HỦY
                </button>
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={handleVnpayPaymentEdit}
                >
                  XÁC NHẬN THANH TOÁN
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
