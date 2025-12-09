import { useEffect, useState } from "react";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import SearchIcon from "@mui/icons-material/Search";
import ProductSearch from "./ProductSearch";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Select,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import Rating from "@mui/material/Rating";
import { Toast } from "bootstrap";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/product/Productgirl.css";
import "../styles/product/PaginationStyles.css";
import API_BASE_URL from "../config/config.js";

const ProductGrid = ({ searchKey }) => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [openSearchDialog, setOpenSearchDialog] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [detailProduct, setProductDetail] = useState(null);

  const [branchID, setBranchID] = useState(1);
  const [stockByBranch, setStockByBranch] = useState(null);

  const [filteredStocks, setFilteredStocks] = useState([]);
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [cities, setCities] = useState([]);
  const [districts, setDistricts] = useState([]);

  const [openVote, setOpenVote] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const [openDetail, setOpenDetail] = useState(false);

  const [stockList, setStockList] = useState([]);

  const [openCategoryDialog, setOpenCategoryDialog] = useState(false);
  const [categories, setCategories] = useState([]);

  const accountID = localStorage.getItem("accountId") || null;

  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const pageSize = 4;

  const [comparedProducts, setComparedProducts] = useState([]);
  const [showCompareModal, setShowCompareModal] = useState(false);

  const [openImageDialog, setOpenImageDialog] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    if (selectedCity) {
      const cityDistricts = [
        ...new Set(
          stockList
            .filter((s) => s.city === selectedCity)
            .map((s) => s.district)
        ),
      ];
      setDistricts(cityDistricts);
      setSelectedDistrict("");
    } else {
      setDistricts([]);
    }
  }, [selectedCity, stockList]);

  useEffect(() => {
    let filtered = stockList;
    if (selectedCity)
      filtered = filtered.filter((s) => s.city === selectedCity);
    if (selectedDistrict)
      filtered = filtered.filter((s) => s.district === selectedDistrict);
    setFilteredStocks(filtered);
  }, [selectedCity, selectedDistrict, stockList]);

  const mapProduct = (p) => ({
    id: p.id,
    title: p.name,
    description: p.description,
    category: p.categoryname,
    tradeName: p.tradeName,
    price: p.price,
    imageUrl: p.image,
  });

  const fetchProductsDefault = async (pageNum = 0) => {
    const productGrid = document.querySelector(".product-grid");
    if (productGrid) {
      productGrid.classList.add("is-loading");
    }
    setLoading(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/dossier-statistic/products?page=${pageNum}&size=${pageSize}&sort=productID,asc`
      );
      if (!res.ok) throw new Error("Lỗi khi gọi API phân trang!");
      const data = await res.json();

      setProducts(data.content.map(mapProduct));
      setCurrentPage(data.number);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error("Lỗi khi fetch sản phẩm:", error);
      setProducts([]);
    } finally {
      setLoading(false);
      if (productGrid) {
        productGrid.classList.remove("is-loading");
      }
    }
  };

  useEffect(() => {
    fetchProductsDefault(0);
  }, [toast]);

  useEffect(() => {
    if (!searchKey.trim()) return;
    const delayDebounce = setTimeout(async () => {
      setLoading(true);
      setMessage("");
      try {
        const response = await fetch(`${API_BASE_URL}/api/v1/product/search`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: searchKey }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          setMessage(errorData.message || "Không tìm thấy sản phẩm nào.");
          setProducts([]);
          return;
        }

        const data = await response.json();
        setProducts(data.map(mapProduct));
      } catch (error) {
        setMessage("Đã xảy ra lỗi khi tìm kiếm sản phẩm.");
      } finally {
        setLoading(false);
      }
    }, 1000);

    return () => clearTimeout(delayDebounce);
  }, [searchKey]);

  const fetchPriceDesc = async () => {
    const res = await fetch(
      `${API_BASE_URL}/dossier-statistic/list--Product--PriceDesc`
    );
    const data = await res.json();
    setProducts(data.slice(0, 4).map(mapProduct));
  };

  const fetchPriceAsc = async () => {
    const res = await fetch(
      `${API_BASE_URL}/dossier-statistic/list--Product--PriceAsc`
    );
    const data = await res.json();
    setProducts(data.slice(0, 4).map(mapProduct));
  };

  const fetchNewBest = async () => {
    const res = await fetch(
      `${API_BASE_URL}/dossier-statistic/list--Product--NewBest`
    );
    const data = await res.json();
    setProducts(data.slice(0, 4).map(mapProduct));
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/category/Listgetall`);
      if (!res.ok) throw new Error("Không thể tải danh mục");
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      console.error("Lỗi khi tải danh mục:", err);
    }
  };

  const handleOpenCategoryDialog = () => {
    fetchCategories();
    setOpenCategoryDialog(true);
  };

  const handleSelectCategory = async (categoryID) => {
    setLoading(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/dossier-statistic/list--ProductById--Category--Filter/${categoryID}`,
        { method: "POST" }
      );
      const data = await res.json();
      setProducts(data.map(mapProduct));
    } catch (err) {
      console.error("Lỗi khi lọc theo danh mục:", err);
    } finally {
      setOpenCategoryDialog(false);
      setLoading(false);
    }
  };

  const toggleFavorite = async (productId) => {
    if (!accountID) {
      toast.info("Vui lòng đăng nhập để thêm sản phẩm yêu thích!");
      setTimeout(() => navigate("/login"), 1200);
      return;
    }
    try {
      const res = await fetch(
        `${API_BASE_URL}/dossier-statistic/add--favorite?accountID=${accountID}&productID=${productId}`,
        { method: "POST" }
      );

      const result = await res.text();

      if (res.ok) {
        toast.success("Đã thêm vào danh mục yêu thích!");
        setFavorites((prev) => [...prev, productId]);
      } else {
        toast.error(result || "Thêm yêu thích thất bại!");
      }
    } catch (err) {
      console.error("Lỗi khi thêm yêu thích:", err);
      toast.error("Không thể kết nối server!");
    }
  };

  const handleSubmitVote = async () => {
    const voteDTO = {
      accountID,
      productID: selectedProduct,
      rating: rating,
      comment: comment,
    };

    try {
      const res = await fetch(`${API_BASE_URL}/dossier-statistic/add--vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(voteDTO),
      });

      const result = await res.json();
      if (res.ok) {
        toast.success("Cảm ơn bạn đã đánh giá!");
        setOpenVote(false);
        setRating(0);
        setComment("");
      } else {
        toast.error(result || "Đánh giá thất bại!");
      }
    } catch (err) {
      console.error("Lỗi khi gửi đánh giá:", err);
      toast.error("Không thể kết nối server!");
    }
  };

  const handleAddToCart = async (productId) => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/dossier-statistic/insert-product?productID=${productId}&amount=1`,
        { method: "POST", credentials: "include" }
      );

      if (res.ok) {
        toast.success("Sản phẩm đã được thêm vào giỏ hàng!");
        if (window.updateCartQuantity) {
          window.updateCartQuantity();
        }
      } else {
        const result = await res.text();
        toast.error(result || "Thêm vào giỏ thất bại!");
      }
    } catch (err) {
      console.error("Lỗi khi thêm vào giỏ hàng:", err);
      toast.error("Không thể kết nối server!");
    }
  };

  const fetchStockByBranch = async (branchID, productId) => {
    try {
      const stockRes = await fetch(
        `${API_BASE_URL}/api/v1/inventory/check/${branchID}/${productId}`
      );

      if (stockRes.ok) {
        const stockData = await stockRes.json();
        setStockByBranch(stockData);
      } else {
        setStockByBranch({ message: "Không lấy được tồn kho", status: "out" });
      }
    } catch (err) {
      console.error("Lỗi khi lấy tồn kho:", err);
      setStockByBranch({ message: "Không lấy được tồn kho", status: "out" });
    }
  };

  const handleOpenDetailInventory = async (productId) => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/v1/product/${productId}/get`
      );
      if (!res.ok) throw new Error("Không tìm thấy sản phẩm");
      const data = await res.json();
      setProductDetail(data);

      const stockRes = await fetch(
        `${API_BASE_URL}/api/v1/inventory/by-product/${productId}`
      );
      if (!stockRes.ok) throw new Error("Không lấy được danh sách tồn kho");
      const stockData = await stockRes.json();
      setStockList(stockData);
      setFilteredStocks(stockData);

      const uniqueCities = [...new Set(stockData.map((s) => s.city))];
      setCities(uniqueCities);
      setSelectedCity("");
      setSelectedDistrict("");

      if (stockData.length > 0 && data?.id) {
        const defaultBranch = stockData[0].branchID;
        setBranchID(defaultBranch);
        await fetchStockByBranch(defaultBranch, data.id);
      }

      setOpenDetail(true);
    } catch (err) {
      console.error("Lỗi khi lấy chi tiết:", err);
      Toast.error("Không tìm thấy sản phẩm!");
    }
  };

  const getProductDetail = async (id) => {
    try {
      const res = await fetch(`http://localhost:8080/api/v1/product/${id}/get`);
      if (!res.ok) throw new Error("Lỗi API!");
      return await res.json();
    } catch (err) {
      console.error("Lỗi khi gọi API lấy sản phẩm:", err);
      return null;
    }
  };

  const handleCompare = async (product) => {
    if (comparedProducts.some((p) => p.id === product.id)) {
      toast.info("Sản phẩm này đã được thêm để so sánh!");
      return;
    }
    if (comparedProducts.length === 2) {
      toast.show("Chỉ so sánh tối đa 2 sản phẩm mỗi lần!");
      return;
    }

    const fullProduct = await getProductDetail(product.id);
    if (!fullProduct) {
      toast.error("Không lấy được thông tin sản phẩm!");
      return;
    }

    const updatedList = [...comparedProducts, fullProduct];
    setComparedProducts(updatedList);

    if (updatedList.length === 2) {
      setShowCompareModal(true);
    }
  };

  const handleCloseCompare = () => {
    setShowCompareModal(false);
    setComparedProducts([]);
  };

  return (
    <div>
      <div className="filter-bar">
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 1,
            mb: 2,
            justifyContent: "center",
          }}
        >
          {[
            { label: "LỌC THEO DANH MỤC:", disabled: true },
            { label: "GIÁ THẤP ĐẾN CAO", onClick: fetchPriceAsc },
            { label: "GIÁ CAO ĐẾN THẤP", onClick: fetchPriceDesc },
            { label: "SẢN PHẨM MỚI / TỐT NHẤT", onClick: fetchNewBest },
          ].map((btn, index) => (
            <Button
              key={index}
              variant={btn.disabled ? "text" : "contained"}
              size="small"
              sx={{
                textTransform: "none",
                fontSize: "0.8rem",
                padding: "4px 10px",
                minWidth: "unset",
              }}
              onClick={btn.onClick}
            >
              {btn.label}
            </Button>
          ))}
          <Button
            variant="outlined"
            size="small"
            sx={{
              textTransform: "none",
              fontSize: "0.8rem",
              padding: "4px 10px",
              minWidth: "unset",
            }}
            onClick={() => setOpenSearchDialog(true)}
          >
            TÌM KIẾM NÂNG CAO
          </Button>
          <Button
            variant="outlined"
            size="small"
            sx={{
              textTransform: "none",
              fontSize: "0.8rem",
              padding: "4px 10px",
              minWidth: "unset",
            }}
            onClick={handleOpenCategoryDialog}
          >
            LỌC THEO DANH MỤC
          </Button>
        </Box>
      </div>

      <div className="product-grid">
        {loading ? (
          <p>ĐANG TẢI DỮ LIỆU...</p>
        ) : message ? (
          <p style={{ textAlign: "center", color: "red" }}>{message}</p>
        ) : (
          products.map((product) => (
            <div
              key={product.id}
              className="product-card"
              style={{ position: "relative" }}
            >
              {/* Favorite icon */}
              <div
                style={{
                  position: "absolute",
                  top: "8px",
                  left: "8px",
                  cursor: "pointer",
                  zIndex: 10,
                  color: favorites.includes(product.id) ? "red" : "gray",
                }}
                onClick={() => toggleFavorite(product.id)}
              >
                {favorites.includes(product.id) ? (
                  <FavoriteIcon />
                ) : (
                  <FavoriteBorderIcon />
                )}
              </div>

              {/* Search icon */}
              <div
                style={{
                  position: "absolute",
                  top: "8px",
                  right: "8px",
                  cursor: "pointer",
                  zIndex: 10,
                }}
                onClick={() => handleOpenDetailInventory(product.id)}
              >
                <SearchIcon />
              </div>

              {/* Product image */}
              <div className="product-image-container">
                <img
                  src={
                    product.imageUrl
                      ? product.imageUrl
                      : product.imageBase64
                      ? `data:image/jpeg;base64,${product.imageBase64}`
                      : "https://via.placeholder.com/150"
                  }
                  alt={product.title}
                  className="product-image"
                  style={{ cursor: "zoom-in" }}
                  onClick={() => {
                    setSelectedImage(product.imageUrl);
                    setOpenImageDialog(true);
                  }}
                />
              </div>

              {/* Product info */}
              <div className="product-info">
                <h3>{product.title}</h3>
                <p>
                  <strong>Loại sản Phẩm: </strong> {product.category} -{" "}
                  <strong>Loại Thương Hiệu: </strong> {product.tradeName}
                </p>
                <div>
                  <span>{product.price.toLocaleString("vi-VN")} ₫</span>
                </div>
                <div className="product-actions" style={{ marginTop: "8px" }}>
                  <button
                    className="btn-add-to-cart"
                    onClick={() => handleAddToCart(product.id)}
                    style={{ marginRight: "6px" }}
                  >
                    THÊM VÀO GIỎ HÀNG
                  </button>
                  <button
                    className="btn-compare"
                    onClick={() => handleCompare(product)}
                    style={{
                      marginTop: "6px",
                      width: "100%",
                      backgroundColor: "#1976d2",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      padding: "4px",
                      marginRight: "6px",
                      cursor: "pointer",
                    }}
                  >
                    SO SÁNH SẢN PHẨM
                  </button>
                  <button
                    className="btn-detail"
                    style={{
                      marginTop: "6px",
                      width: "100%",
                      backgroundColor: "#19d2c3ff",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      padding: "4px",
                      cursor: "pointer",
                      marginRight: "6px",
                    }}
                    onClick={() => navigate(`/product/${product.id}`)}
                  >
                    XEM CHI TIẾT
                  </button>
                  <button
                    className="btn-vote"
                    style={{
                      marginTop: "6px",
                      width: "100%",
                      backgroundColor: "#364252ff",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      padding: "4px",
                      cursor: "pointer",
                      marginRight: "6px",
                    }}
                    onClick={() => {
                      setSelectedProduct(product.id);
                      setOpenVote(true);
                    }}
                  >
                    ĐÁNH GIÁ
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
        <ProductSearch
          open={openSearchDialog}
          onClose={() => setOpenSearchDialog(false)}
        />
        <Dialog open={openVote} onClose={() => setOpenVote(false)}>
          <DialogTitle>Đánh Giá Sản Phẩm</DialogTitle>
          <DialogContent>
            <Rating
              name="product-rating"
              value={rating}
              onChange={(e, newValue) => setRating(newValue)}
            />
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Nhập nhận xét (tối đa 200 ký tự)"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              inputProps={{ maxLength: 200 }}
              margin="normal"
            />
            <div style={{ textAlign: "right", fontSize: "12px" }}>
              {comment.length}/200
            </div>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenVote(false)}>Hủy</Button>
            <Button
              onClick={handleSubmitVote}
              variant="contained"
              color="primary"
            >
              GỬI ĐÁNH GIÁ
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={openDetail}
          onClose={() => setOpenDetail(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>CHI TIẾT SẢN PHẨM</DialogTitle>
          <DialogContent>
            {detailProduct ? (
              <>
                <img
                  src={
                    detailProduct.image
                      ? detailProduct.image
                      : detailProduct.imageBase64
                      ? `data:image/jpeg;base64,${detailProduct.imageBase64}`
                      : "https://via.placeholder.com/400"
                  }
                  alt={detailProduct.name}
                  style={{ width: "100%", marginBottom: "16px" }}
                />
                <Typography variant="h6">
                  <b>TÊN SẢN PHẨM:</b> {detailProduct.name}
                </Typography>
                <Typography fontWeight="body">
                  <b color="green">GIÁ TIỀN:</b>{" "}
                  {detailProduct.price?.toLocaleString("vi-VN")} ₫
                </Typography>
                <Typography variant="h6">
                  <b>DANH MỤC:</b> {detailProduct.categoryname}
                </Typography>
                <Typography variant="h6">
                  <b>THƯƠNG HIỆU:</b> {detailProduct.tradeName}
                </Typography>
                <Typography sx={{ mb: 2 }} variant="h6">
                  <b>Mô tả:</b> {detailProduct.description}
                </Typography>
                <Box
                  sx={{
                    backgroundColor: "#f9f9f9",
                    borderRadius: "12px",
                    padding: "16px",
                    marginBottom: "16px",
                  }}
                >
                  <Typography fontWeight="bold">CHI NHÁNH CỬA HÀNG</Typography>
                  <Typography sx={{ fontSize: 14, color: "gray", mb: 1 }}>
                    CÓ{" "}
                    <span style={{ color: "blue", fontWeight: "bold" }}>
                      {filteredStocks.filter((s) => s.quantity > 0).length}
                    </span>{" "}
                    CỬA HÀNG SẢN PHẨM
                  </Typography>

                  <Box sx={{ display: "flex", gap: 2 }}>
                    <Select
                      value={selectedCity}
                      onChange={(e) => setSelectedCity(e.target.value)}
                      displayEmpty
                      sx={{ flex: 1 }}
                    >
                      <MenuItem value="">-- Chọn Tỉnh/Thành phố --</MenuItem>
                      {cities.map((city) => (
                        <MenuItem key={city} value={city}>
                          {city}
                        </MenuItem>
                      ))}
                    </Select>

                    <Select
                      value={selectedDistrict}
                      onChange={(e) => setSelectedDistrict(e.target.value)}
                      displayEmpty
                      sx={{ flex: 1 }}
                      disabled={!selectedCity}
                    >
                      <MenuItem value="">-- Chọn Quận/Huyện --</MenuItem>
                      {districts.map((d) => (
                        <MenuItem key={d} value={d}>
                          {d}
                        </MenuItem>
                      ))}
                    </Select>
                  </Box>
                </Box>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Chi nhánh</TableCell>
                      <TableCell align="center">Tỉnh/TP</TableCell>
                      <TableCell align="center">Quận/Huyện</TableCell>
                      <TableCell align="center">Số lượng</TableCell>
                      <TableCell align="center">Trạng thái</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredStocks.map((s) => (
                      <TableRow key={s.branchID}>
                        <TableCell>{s.branchName}</TableCell>
                        <TableCell align="center">{s.city}</TableCell>
                        <TableCell align="center">{s.district}</TableCell>
                        <TableCell align="center">{s.quantity}</TableCell>
                        <TableCell
                          align="center"
                          style={{
                            color: s.quantity > 0 ? "green" : "red",
                            fontWeight: "bold",
                          }}
                        >
                          {s.quantity > 0 ? "Còn hàng" : "Hết hàng"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </>
            ) : (
              <Typography align="center">Đang tải chi tiết...</Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDetail(false)}>ĐÓNG</Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={openCategoryDialog}
          onClose={() => setOpenCategoryDialog(false)}
          maxWidth="xs"
          fullWidth
        >
          <DialogTitle>CHỌN DANH MỤC SẢN PHẨM</DialogTitle>
          <DialogContent dividers>
            {categories.length === 0 ? (
              <p>Đang tải danh mục...</p>
            ) : (
              categories.map((cat) => (
                <Button
                  key={cat.id}
                  fullWidth
                  variant="outlined"
                  sx={{
                    mb: 1,
                    justifyContent: "flex-start",
                    textTransform: "none",
                  }}
                  onClick={() => handleSelectCategory(cat.id)}
                >
                  {cat.name}
                </Button>
              ))
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenCategoryDialog(false)}>Đóng</Button>
          </DialogActions>
        </Dialog>
      </div>

      <div className="pagination-container">
        {totalPages > 1 && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "8px",
              flexWrap: "wrap",
            }}
          >
            <Button
              variant="outlined"
              size="small"
              disabled={currentPage === 0}
              onClick={() => {
                fetchProductsDefault(currentPage - 1);
              }}
              className="pagination-btn"
              sx={{
                textTransform: "none",
                borderRadius: "20px",
                px: 2,
                fontWeight: "600",
                fontSize: "0.9rem",
                "&:hover": {
                  backgroundColor: "rgba(25, 118, 210, 0.08)",
                },
              }}
            >
              ◀ Trang trước
            </Button>
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              {Array.from({ length: totalPages }, (_, i) => (
                <Button
                  key={i}
                  variant={i === currentPage ? "contained" : "outlined"}
                  color={i === currentPage ? "primary" : "inherit"}
                  size="small"
                  className={`pagination-page-btn ${
                    i === currentPage ? "active" : ""
                  }`}
                  sx={{
                    minWidth: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    fontWeight: i === currentPage ? "bold" : "normal",
                    fontSize: "0.95rem",
                    padding: 0,
                    transition: "all 0.2s ease",
                    ...(i === currentPage && {
                      background:
                        "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
                      boxShadow: "0 4px 12px rgba(25, 118, 210, 0.4)",
                    }),
                  }}
                  onClick={() => {
                    fetchProductsDefault(i);
                  }}
                >
                  {i + 1}
                </Button>
              ))}
            </div>

            <Button
              variant="outlined"
              size="small"
              disabled={currentPage === totalPages - 1}
              onClick={() => {
                fetchProductsDefault(currentPage + 1);
              }}
              className="pagination-btn"
              sx={{
                textTransform: "none",
                borderRadius: "20px",
                px: 2,
                fontWeight: "600",
                fontSize: "0.9rem",
                "&:hover": {
                  backgroundColor: "rgba(25, 118, 210, 0.08)",
                },
              }}
            >
              Trang sau ▶
            </Button>
          </div>
        )}
      </div>

      {showCompareModal && comparedProducts.length === 2 && (
        <div
          style={{
            position: "fixed",
            inset: 0,
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
              background: "#fff",
              borderRadius: "12px",
              padding: "20px",
              width: "90%",
              maxWidth: "800px", 
              boxShadow: "0 6px 16px rgba(0,0,0,0.25)",
              position: "relative",
            }}
          >
            {/* Close Button */}
            <button
              onClick={handleCloseCompare}
              style={{
                position: "absolute",
                top: "10px",
                right: "15px",
                fontSize: "26px",
                border: "none",
                background: "transparent",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              &times;
            </button>

            <h2
              style={{
                textAlign: "center",
                marginBottom: "18px",
                fontWeight: "700",
                fontSize: "20px",
              }}
            >
              SO SÁNH SẢN PHẨM
            </h2>

            <div
              style={{
                display: "flex",
                gap: "15px",
              }}
            >
              {comparedProducts.map((p) => (
                <div
                  key={p.id}
                  style={{
                    flex: 1,
                    border: "1px solid #ddd",
                    borderRadius: "10px",
                    padding: "14px",
                    textAlign: "center",
                    background: "#fafafa",
                  }}
                >
                  <img
                    src={p.image || p.imageBase64}
                    alt={p.name}
                    style={{
                      width: "100%",
                      maxWidth: "180px", 
                      height: "150px",
                      objectFit: "cover",
                      marginBottom: "10px",
                      borderRadius: "8px",
                    }}
                  />

                  <h4 style={{ fontWeight: "600", marginBottom: "5px" }}>
                    {p.name}
                  </h4>

                  <p
                    style={{
                      color: "#1976d2",
                      fontWeight: "700",
                      fontSize: "16px",
                      marginBottom: "8px",
                    }}
                  >
                    {p.price?.toLocaleString("vi-VN")} ₫
                  </p>

                  <p>
                    <b>Danh mục:</b> {p.categoryname}
                  </p>
                  <p>
                    <b>Thương hiệu:</b> {p.tradeName}
                  </p>

                  <p style={{ marginTop: "8px", fontSize: "14px" }}>
                    {p.description || "Không có mô tả"}
                  </p>

                  {p.productDetails && p.productDetails.length > 0 && (
                    <div
                      style={{
                        marginTop: "12px",
                        background: "#fff",
                        border: "1px solid #ddd",
                        padding: "10px",
                        borderRadius: "8px",
                        textAlign: "left",
                      }}
                    >
                      <h5 style={{ marginBottom: "6px", fontSize: "14px" }}>
                        Thông số kỹ thuật:
                      </h5>

                      <p>
                        <b>Camera:</b>{" "}
                        {p.productDetails[0].productCamera || "N/A"}
                      </p>
                      <p>
                        <b>Wifi:</b> {p.productDetails[0].productWifi || "N/A"}
                      </p>
                      <p>
                        <b>Màn hình:</b>{" "}
                        {p.productDetails[0].productScreen || "N/A"}
                      </p>
                      <p>
                        <b>Bluetooth:</b>{" "}
                        {p.productDetails[0].productBluetooth || "N/A"}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <Dialog
        open={openImageDialog}
        onClose={() => setOpenImageDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>ẢNH SẢN PHẨM</DialogTitle>
        <DialogContent sx={{ textAlign: "center" }}>
          {selectedImage && (
            <img
              src={selectedImage}
              alt="Phóng to"
              style={{
                maxWidth: "100%",
                maxHeight: "80vh",
                borderRadius: "8px",
                objectFit: "contain",
              }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenImageDialog(false)}>ĐÓNG</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ProductGrid;
