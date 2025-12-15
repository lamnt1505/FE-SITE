import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import API_BASE_URL from "../../config/config.js";

export const updateQuantity = createAsyncThunk(//Xử lý cập nhật số lượng trong giỏ hàng
  "cart/updateQuantity",
  async ({ productID, amount }, { rejectWithValue }) => {
    try {
      const res = await axios.post(
        `${API_BASE_URL}/dossier-statistic/update--quantities`,
        null,
        {
          params: { productID, amount },
          withCredentials: true,
        }
      );
      return { result: res.data, productID, amount };
    } catch (err) {
      return rejectWithValue(err.response?.data || "Lỗi server");
    }
  }
);

// Tạo cart slice
const cartSlice = createSlice({
  name: "cart",
  initialState: {
    cartItems: [],
    loading: false,
    error: null,
  },
  reducers: {
    setCart: (state, action) => {
      state.cartItems = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(updateQuantity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateQuantity.fulfilled, (state, action) => {
        state.loading = false;
        const {result, productID, amount } = action.payload;

        if (result === "1") {//cập nhật số lượng thành công
          const item = state.cartItems.find((p) => p.id === productID);
          if (item) item.amount = amount;
        } else if (result === "2") {// xóa sản phẩm khỏi giỏ hàng
          state.cartItems = state.cartItems.filter((p) => p.id !== productID);
        }
      })
      .addCase(updateQuantity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setCart } = cartSlice.actions;
export default cartSlice.reducer;
