import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Slider, Box } from "@mui/material";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Checkbox,
  FormControlLabel,
  Typography,
  Grid,
  Paper,
  Divider,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
} from "@mui/material";
import API_BASE_URL from "../config/config.js";

const cardStyle = {
  p: 2,
  borderRadius: 2,
  boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
  border: "1px solid #eee",
};

const labelTitle = {
  fontWeight: "bold",
  mb: 1,
  color: "#333",
};

const ProductSearch = ({ open, onClose }) => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [trademarks, setTrademarks] = useState([]);
  const [versions, setVersions] = useState([]);
  const [details, setDetails] = useState([]);
  const [products, setProducts] = useState([]);

  const [priceRange, setPriceRange] = useState([0, 50000000]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedTrademarks, setSelectedTrademarks] = useState([]);
  const [selectedVersions, setSelectedVersions] = useState([]);
  const [selectedDetails, setSelectedDetails] = useState([]);
  const [productNames, setProductNames] = useState([]);
  const [selectedProductID, setSelectedProductID] = useState(null);

  useEffect(() => {
    if (open) {
      fetch(`${API_BASE_URL}/api/v1/category/Listgetall`)
        .then((res) => res.json())
        .then(setCategories);

      fetch(`${API_BASE_URL}/api/trademark/gettrademark`)
        .then((res) => res.json())
        .then(setTrademarks);

      fetch(`${API_BASE_URL}/api/v1/product/version/Listgetall`)
        .then((res) => res.json())
        .then(setVersions);

      fetch(`${API_BASE_URL}/api/v1/productdetail/Listgetall`)
        .then((res) => res.json())
        .then(setDetails);

      fetch(`${API_BASE_URL}/api/v1/product/getall`)
        .then((res) => res.json())
        .then((data) => {
          console.log("Product data:", data);
          setProductNames(data);
        });
    }
  }, [open]);

  useEffect(() => {
    console.log("selectedProductID changed:", selectedProductID);
  }, [selectedProductID]);

  const toggleSelection = (value, selected, setSelected) => {
    if (selected.includes(value)) {
      setSelected(selected.filter((v) => v !== value));
    } else {
      setSelected([...selected, value]);
    }
  };

  const handleSearch = async () => {
    const criteria = {
      categoryID: selectedCategories,
      tradeID: selectedTrademarks,
      versionID: selectedVersions,
      productDetailID: selectedDetails,
      price: `${priceRange[0]}-${priceRange[1]}`,
      productID: selectedProductID,
    };

    try {
      const res = await fetch(`${API_BASE_URL}/dossier-statistic/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(criteria),
      });
      const data = await res.json();
      setProducts(data.content || []);
    } catch (err) {
      console.error("Lỗi khi tìm kiếm:", err);
    }
  };

  const handleReset = () => {
    setSelectedCategories([]);
    setSelectedTrademarks([]);
    setSelectedVersions([]);
    setSelectedDetails([]);
    setProducts([]);
    setPriceRange([0, 50000000]);
    setSelectedProductID(null);
  };

  const handleProductClick = (productId) => {
    onClose();
    navigate(`/product/${productId}`);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle
        sx={{
          fontWeight: "bold",
          fontSize: "1.4rem",
          borderBottom: "1px solid #eee",
          pb: 2,
        }}
      >
        🔍 Bộ Lọc Sản Phẩm
      </DialogTitle>
      <DialogContent sx={{ mt: 2 }}>
        <Grid container spacing={3}>
          {/* PRODUCT NAME */}
          <Grid item xs={3}>
            <Paper sx={cardStyle}>
              <Typography sx={labelTitle}>Tên sản phẩm</Typography>
              <Divider sx={{ mb: 1 }} />

              {productNames.map((p) => (
                <FormControlLabel
                  key={p.id}
                  control={
                    <Checkbox
                      checked={selectedProductID === p.id}
                      onChange={(e) => {
                        setSelectedProductID(e.target.checked ? p.id : null);
                      }}
                    />
                  }
                  label={p.name}
                />
              ))}
            </Paper>
          </Grid>

          {/* CATEGORY */}
          <Grid item xs={3}>
            <Paper sx={cardStyle}>
              <Typography sx={labelTitle}>Danh mục</Typography>
              <Divider sx={{ mb: 1 }} />
              {categories.map((cat) => (
                <FormControlLabel
                  key={cat.id}
                  control={
                    <Checkbox
                      checked={selectedCategories.includes(cat.id.toString())}
                      onChange={() =>
                        toggleSelection(
                          cat.id.toString(),
                          selectedCategories,
                          setSelectedCategories
                        )
                      }
                    />
                  }
                  label={cat.name}
                />
              ))}
            </Paper>
          </Grid>

          {/* TRADEMARK */}
          <Grid item xs={3}>
            <Paper sx={cardStyle}>
              <Typography sx={labelTitle}>Thương hiệu</Typography>
              <Divider sx={{ mb: 1 }} />
              {trademarks.map((t) => (
                <FormControlLabel
                  key={t.tradeID}
                  control={
                    <Checkbox
                      checked={selectedTrademarks.includes(
                        t.tradeID.toString()
                      )}
                      onChange={() =>
                        toggleSelection(
                          t.tradeID.toString(),
                          selectedTrademarks,
                          setSelectedTrademarks
                        )
                      }
                    />
                  }
                  label={t.tradeName}
                />
              ))}
            </Paper>
          </Grid>

          {/* PRICE */}
          <Grid item xs={6}>
            <Paper sx={cardStyle}>
              <Typography sx={labelTitle}>Giá (VNĐ)</Typography>
              <Divider sx={{ mb: 2 }} />

              <Box sx={{ px: 2 }}>
                <Slider
                  value={priceRange}
                  onChange={(e, newValue) => setPriceRange(newValue)}
                  valueLabelDisplay="auto"
                  min={0}
                  max={50000000}
                  step={500000}
                  valueLabelFormat={(value) =>
                    new Intl.NumberFormat("vi-VN").format(value) + "đ"
                  }
                />
              </Box>

              <Typography align="center" sx={{ mt: 1, fontWeight: 500 }}>
                {new Intl.NumberFormat("vi-VN").format(priceRange[0])} đ →{" "}
                {new Intl.NumberFormat("vi-VN").format(priceRange[1])} đ
              </Typography>
            </Paper>
          </Grid>

          {/* VERSION */}
          <Grid item xs={3}>
            <Paper sx={cardStyle}>
              <Typography sx={labelTitle}>Phiên bản</Typography>
              <Divider sx={{ mb: 1 }} />
              {versions.map((v) => (
                <FormControlLabel
                  key={v.versionID}
                  control={
                    <Checkbox
                      checked={selectedVersions.includes(
                        v.versionID.toString()
                      )}
                      onChange={() =>
                        toggleSelection(
                          v.versionID.toString(),
                          selectedVersions,
                          setSelectedVersions
                        )
                      }
                    />
                  }
                  label={`${v.memory} - ${v.color}`}
                />
              ))}
            </Paper>
          </Grid>

          {/* DETAILS */}
          <Grid item xs={3}>
            <Paper sx={cardStyle}>
              <Typography sx={labelTitle}>Chi tiết</Typography>
              <Divider sx={{ mb: 1 }} />
              {details.map((d) => (
                <FormControlLabel
                  key={d.productDetailID}
                  control={
                    <Checkbox
                      checked={selectedDetails.includes(
                        d.productDetailID.toString()
                      )}
                      onChange={() =>
                        toggleSelection(
                          d.productDetailID.toString(),
                          selectedDetails,
                          setSelectedDetails
                        )
                      }
                    />
                  }
                  label={`Camera: ${d.productCamera}, Wifi: ${d.productWifi}`}
                />
              ))}
            </Paper>
          </Grid>
        </Grid>

        {/* RESULTS */}
        <Typography variant="h6" sx={{ mt: 4, mb: 1 }}>
          Kết quả tìm kiếm
        </Typography>

        {products.length === 0 ? (
          <Typography sx={{ color: "gray" }}>Chưa có sản phẩm</Typography>
        ) : (
          <>
            {/* ← Thêm dòng đếm sản phẩm */}
            <Typography sx={{ color: "gray", fontSize: "0.9rem", mb: 2 }}>
              📊 Tìm thấy{" "}
              <strong style={{ color: "#1976d2" }}>{products.length}</strong>{" "}
              sản phẩm
            </Typography>

            <TableContainer
              component={Paper}
              sx={{ mt: 1, borderRadius: 2, boxShadow: "0 3px 12px #eaeaea" }}
            >
              <Table>
                <TableHead sx={{ bgcolor: "#f5f5f5" }}>
                  <TableRow>
                    <TableCell>
                      <b>Tên</b>
                    </TableCell>
                    <TableCell>
                      <b>Ảnh</b>
                    </TableCell>
                    <TableCell>
                      <b>Thương hiệu</b>
                    </TableCell>
                    <TableCell>
                      <b>Danh mục</b>
                    </TableCell>
                    <TableCell>
                      <b>Giá</b>
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {products.map((p) => (
                    <TableRow
                      hover
                      key={p.id}
                      onClick={() => handleProductClick(p.id)}
                      sx={{
                        cursor: "pointer",
                        transition: "0.2s",
                        "&:hover": { backgroundColor: "#f8f9fa" },
                      }}
                    >
                      <TableCell>{p.name}</TableCell>
                      <TableCell>
                        <img
                          src={p.image}
                          alt="Product"
                          style={{
                            width: 60,
                            height: 60,
                            borderRadius: 6,
                            objectFit: "cover",
                          }}
                        />
                      </TableCell>
                      <TableCell>{p.tradeName}</TableCell>
                      <TableCell>{p.categoryname}</TableCell>
                      <TableCell>
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                          minimumFractionDigits: 0,
                        }).format(p.price)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button variant="contained" color="primary" onClick={handleSearch}>
          Tìm kiếm
        </Button>
        <Button variant="outlined" color="secondary" onClick={handleReset}>
          Làm mới
        </Button>
        <Button variant="outlined" color="error" onClick={onClose}>
          Đóng
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProductSearch;
