import React, { useEffect, useState } from "react";
import axios from "axios";
import { Box, Typography } from "@mui/material";
import API_BASE_URL from "../config/config.js";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const DiscountTicker = () => {
  const [discount, setDiscount] = useState(null);
  const [isExpired, setIsExpired] = useState(false);

  // ✅ Helper function để parse date
  const parseDate = (dateStr) => {
    if (!dateStr) return new Date();

    if (dateStr.includes("-")) {
      return new Date(dateStr);
    } else if (dateStr.length === 8) {
      const year = dateStr.substring(0, 4);
      const month = dateStr.substring(4, 6);
      const day = dateStr.substring(6, 8);
      return new Date(`${year}-${month}-${day}`);
    }

    return new Date();
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";

    const date = parseDate(dateStr);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  useEffect(() => {
    const fetchLatestDiscount = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/v1/discounts/latest`);
        if (res.data.success) {
        const discountData = res.data;
        
        if (discountData.active === false) {
          setDiscount(null);
          setIsExpired(false);
          return;
        }

          const endDate = parseDate(res.data.dateFinish);
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          if (endDate < today) {
            setIsExpired(true);
            setDiscount(null);
            return;
          }

          setDiscount(res.data);
          setIsExpired(false);
        }
      } catch (err) {
        console.error("Lỗi khi lấy mã giảm giá:", err);
      }
    };

  fetchLatestDiscount();

  const handleDiscountUpdate = () => {
    fetchLatestDiscount();
  };

  window.addEventListener("discountUpdated", handleDiscountUpdate);
  
  const interval = setInterval(fetchLatestDiscount, 5000);

  return () => {
    clearInterval(interval);
    window.removeEventListener("discountUpdated", handleDiscountUpdate);
  };
  }, []);

  if (!discount || isExpired) return null;

  return (
    <Box
      sx={{
        width: "100%",
        overflow: "hidden",
        backgroundColor: "#1976d2",
        color: "white",
        py: 1,
        mb: 2,
        whiteSpace: "nowrap",
        position: "relative",
      }}
    >
      <Typography
        component="div"
        sx={{
          display: "inline-block",
          fontWeight: "bold",
          fontSize: "1rem",
          px: 2,
          animation: "scrollText 15s linear infinite",
          "&:hover": {
            animationPlayState: "paused",
          },
          "@keyframes scrollText": {
            "0%": { transform: "translateX(100%)" },
            "100%": { transform: "translateX(-100%)" },
          },
        }}
      >
        🎉 MÃ GIẢM GIÁ MỚI NHẤT:{" "}
        <span style={{ color: "#ffeb3b" }}>{discount.discountCode}</span> —{" "}
        {discount.discountName} 🔥 Giảm{" "}
        <span style={{ color: "#ffeb3b" }}>{discount.discountPercent}%</span> TỪ{" "}
        {formatDate(discount.dateStart)} ĐẾN {formatDate(discount.dateFinish)}!
        💥
      </Typography>
    </Box>
  );
};

export default DiscountTicker;
