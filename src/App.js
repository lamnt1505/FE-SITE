import React, { useState } from "react";
import "./App.css"; 
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Header from "./components/Header";
import SocialSidebar from "./components/SocialSidebar";
import MainContent from "./components/MainContent";
import ProductGrid from "./components/ProductGrid";
import Footer from "./components/Footer";
import CartPage from "./components/CartPage"; 
import CatalogPage from "./components/CatalogPage"; 
import "bootstrap/dist/css/bootstrap.min.css";
import LoginPage from "./components/LoginPage";
import RegisterPage from "./components/RegisterPage";
import MyOrdersPage from "./components/MyOrdersPage";
import PaymentResult from "./components/PaymentResult";
import VnpayRedirect from "./components/VnpayRedirect";
import DiscountTicker from "./components/DiscountTicker";
import SearchPage from "./components/SearchPage";
import FavoriteList from "./components/FavoriteList"; 
import ProductDetailPage from "./components/ProductDetailPage";
import { ToastContainer } from "react-toastify";
import UpdateProfileDialogPage from "./components/UpdateProfileDialog";

const options = {
  position: "top-right",
  timeout: 3000,
  offset: "10px",
  transition: "scale",
};

function App() {
  const [searchKey, setSearchKey] = useState("");

  const handleSearch = (key) => {
    console.log("🔍 App nhận searchKey:", key);
    setSearchKey(key);
  };
  return (
    <>     
    <Router>
      <div className="app">
        <Header onSearch={handleSearch}/>
        <DiscountTicker />
        <div className="container">
          <SocialSidebar />
          <main>
            <Routes>
              <Route path="/" element={<Navigate to="/index" replace />} />
              <Route path="/index" element={
                  <>
                    <MainContent />
                    <ProductGrid searchKey={searchKey}/>
                  </>
                }
              />
              <Route path="/favorites/:accountID" element={<FavoriteList />} />
              <Route path="/product/:id" element={<ProductDetailPage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/vnpay-redirect" element={<VnpayRedirect />} />
              <Route path="/payment-result" element={<PaymentResult />} />
              <Route path="/updateProfile/:accountID" element={<UpdateProfileDialogPage />} />
              <Route path="/catalog/:categoryID" element={<CatalogPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/login" element={<LoginPage />} /> 
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/myorder" element={<MyOrdersPage />} />
            </Routes>
          </main>
        </div>
        <Footer />
      </div>
    </Router>
    <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}

export default App;