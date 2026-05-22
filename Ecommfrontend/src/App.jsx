import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Nav from "./components/layout/navbar";
import Footer from "./components/layout/footer";

import ProductCards from "./components/product/productcards";
import ProductDetails from "./components/product/product";

import RegisterForm from "./components/credentials/register";
import VerifyOTP from "./components/credentials/verifyemail";

export default function App() {
  return (
    <BrowserRouter>

      <Nav />

      <Routes>

        <Route path="/" element={<ProductCards />} />

        <Route path="/product" element={<ProductDetails />} />

        <Route path="/register" element={<RegisterForm />} />

        <Route path="/verify-otp" element={<VerifyOTP />} />

      </Routes>

      <Footer />

    </BrowserRouter>
  );
}