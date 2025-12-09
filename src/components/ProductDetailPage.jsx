import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Divider,
} from "@mui/material";
import Breadcrumb from "./Breadcrumb";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import API_BASE_URL from "../config/config.js";

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [votes, setVotes] = useState([]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(
          `${API_BASE_URL}/api/v1/product/${id}/detail-full`
        );
        if (!res.ok) throw new Error("Không lấy được dữ liệu");
        const data = await res.json();
        setProduct(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const fetchRelated = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/product/${id}/related`);
        if (res.ok) {
          const data = await res.json();
          setRelatedProducts(data);
        }
      } catch (err) {
        console.error("Lỗi khi tải sản phẩm liên quan:", err);
      }
    };

    fetchProduct();
    fetchRelated();
    fetchVotes();
  }, [id]);

  const handleCartClick = () => {
    navigate("/cart");
  };

  const fetchVotes = async () => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/v1/votes/product/${id}`
      );
      if (res.ok) {
        const data = await res.json();
        setVotes(data);
      }
    } catch (err) {
      console.error("Lỗi khi tải đánh giá:", err);
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

  if (loading) return <Typography>Đang tải...</Typography>;
  if (!product) return <Typography>Không tìm thấy sản phẩm</Typography>;

  return (
    <Box sx={{ maxWidth: 1200, margin: "0 auto", p: 3 }}>
      <Breadcrumb />
      <Button
        onClick={() => navigate(-1)}
        sx={{
          mb: 3,
          textTransform: "none",
          backgroundColor: "#f0f0f0",
          "&:hover": { backgroundColor: "#e0e0e0" },
        }}
      >
        ← QUAY LẠI TRANG TRƯỚC
      </Button>

      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              width: "100%",
              maxWidth: 600,
              mx: "auto",
              borderRadius: 4,
              overflow: "hidden",
              boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
            }}
          >
            <Box
              sx={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                padding: 4,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: 500,
              }}
            >
              <CardMedia
                component="img"
                image={product.image}
                alt={product.name}
                title={product.description}
                sx={{
                  maxWidth: "100%",
                  maxHeight: "100%",
                  width: "auto",
                  height: "auto",
                  objectFit: "contain",
                  filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.2))",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "scale(1.08) translateY(-8px)",
                    filter: "drop-shadow(0 12px 24px rgba(0,0,0,0.3))",
                  },
                }}
              />
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Box
            sx={{
              pl: { md: 2 },
              display: "flex",
              flexDirection: "column",
              height: "100%",
              maxHeight: 500,
            }}
          >
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              {product.name}
            </Typography>
            <Typography
              variant="h5"
              color="green"
              fontWeight={600}
              gutterBottom
            >
              {product.price?.toLocaleString("vi-VN")} ₫
            </Typography>

            <Typography variant="body1" gutterBottom>
              <b>Danh mục:</b> {product.category}
            </Typography>
            <Typography variant="body1" gutterBottom>
              <b>Thương hiệu:</b> {product.trademark}
            </Typography>

            <Divider sx={{ my: 2 }} />

            <Typography
              variant="body1"
              sx={{
                lineHeight: 1.7,
                color: "#444",
                flex: 1,
                overflow: "auto",
                mb: 2,
              }}
            >
              {product.description || "Chưa có mô tả cho sản phẩm này."}
            </Typography>
            <Box
              sx={{
                mt: 1,
                p: 3,
                bgcolor: "#f9f9f9",
                borderRadius: 3,
                maxHeight: 300,
                overflow: "auto",
              }}
            >
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                  ĐÁNH GIÁ SẢN PHẨM
              </Typography>

              {votes.length === 0 ? (
                <Typography color="text.secondary">
                  Chưa có đánh giá nào cho sản phẩm này.
                </Typography>
              ) : (
                votes.map((vote) => (
                  <Box
                    key={vote.productVoteID}
                    sx={{
                      mt: 2,
                      p: 2,
                      borderRadius: 2,
                      bgcolor: "#fff",
                      boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      {Array.from({ length: vote.rating }).map((_, i) => (
                        <span
                          key={i}
                          style={{ color: "#f4b400", fontSize: 18 }}
                        >
                          ★
                        </span>
                      ))}
                      {Array.from({ length: 5 - vote.rating }).map((_, i) => (
                        <span key={i} style={{ color: "#ccc", fontSize: 18 }}>
                          ★
                        </span>
                      ))}
                    </Box>

                    <Typography sx={{ mb: 1 }}>{vote.comment}</Typography>

                    <Typography fontSize={13} color="gray">
                      Người dùng: {vote.accountID || "Ẩn danh"}
                      <br />
                      Ngày:{" "}
                      {new Date(vote.createdAt).toLocaleDateString("vi-VN")}
                    </Typography>
                  </Box>
                ))
              )}
            </Box>
            <Box sx={{ display: "flex", gap: 2, mt: "auto", mb: 3}}>
              <Button
                variant="contained"
                color="primary"
                sx={{
                  flex: 1,
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: 600,
                  textTransform: "none",
                }}
                onClick={() => handleAddToCart(product.id)}
              >
                THÊM VÀO GIỎ
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                onClick={handleCartClick}
                sx={{
                  flex: 1,
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: 600,
                  textTransform: "none",
                }}
              >
                MUA NGAY
              </Button>
            </Box>
          </Box>
        </Grid>
      </Grid>

      <Box sx={{ mt: 5 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            {product.detail && (
              <Box
                sx={{
                  p: 3,
                  bgcolor: "#f9f9f9",
                  borderRadius: 3,
                  height: "100%",
                }}
              >
                <Typography
                  variant="h6"
                  fontWeight="bold"
                  gutterBottom
                  textAlign="center"
                >
                  THÔNG SỐ KỸ THUẬT
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography>
                      <b>Camera:</b> {product.detail.productCamera}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography>
                      <b>Màn hình:</b> {product.detail.productScreen}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography>
                      <b>Wifi:</b> {product.detail.productWifi}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography>
                      <b>Bluetooth:</b> {product.detail.productBluetooth}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            )}
          </Grid>
          <Grid item xs={12} md={6}>
            {product.versions && product.versions.length > 0 && (
              <Box
                sx={{
                  p: 3,
                  bgcolor: "#f9f9f9",
                  borderRadius: 3,
                  height: "100%",
                }}
              >
                <Typography
                  variant="h6"
                  fontWeight="bold"
                  gutterBottom
                  textAlign="center"
                >
                  CÁC PHIÊN BẢN
                </Typography>
                <Grid container spacing={2}>
                  {product.versions.map((v) => (
                    <Grid item xs={6} key={v.versionID}>
                      <Card
                        sx={{
                          borderRadius: 2,
                          boxShadow: 1,
                          textAlign: "center",
                          transition: "0.3s",
                          cursor: "pointer",
                          "&:hover": {
                            boxShadow: 3,
                            transform: "translateY(-4px)",
                          },
                        }}
                      >
                        <CardMedia
                          component="img"
                          image={v.image1}
                          alt={v.memory}
                          sx={{
                            height: 80,
                            width: "100%",
                            objectFit: "contain",
                            backgroundColor: "#fff",
                            borderBottom: "1px solid #eee",
                            p: 1.5,
                          }}
                        />
                        <CardContent sx={{ p: 1.5 }}>
                          <Typography fontWeight="bold" fontSize={14}>
                            {v.memory}
                          </Typography>
                          <Typography color="text.secondary" fontSize={12}>
                            Màu: {v.color}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}
          </Grid>
        </Grid>
      </Box>

      {relatedProducts.length > 0 && (
        <Box sx={{ mt: 6 }}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            SẢN PHẨM LIÊN QUAN
          </Typography>
          <Grid container spacing={2}>
            {relatedProducts.map((item) => (
              <Grid item xs={6} sm={4} md={3} key={item.id}>
                <Card
                  sx={{
                    borderRadius: 2,
                    boxShadow: 2,
                    textAlign: "center",
                    cursor: "pointer",
                    transition: "0.3s",
                    "&:hover": { boxShadow: 5, transform: "scale(1.02)" },
                  }}
                  onClick={() => navigate(`/product/${item.id}`)}
                >
                  <CardMedia
                    component="img"
                    image={item.image}
                    alt={item.name}
                    sx={{
                      height: 150,
                      objectFit: "contain",
                      backgroundColor: "#fff",
                      borderBottom: "1px solid #eee",
                      p: 1,
                    }}
                  />
                  <CardContent sx={{ p: 1 }}>
                    <Typography fontWeight="bold" fontSize={15}>
                      {item.name}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Box>
  );
};

export default ProductDetailPage;
