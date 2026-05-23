import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Nav from "./components/layout/navbar";
import Footer from "./components/layout/footer";

import ProductCards from "./components/product/productcards";
import ProductDetails from "./components/product/product";

import RegisterForm from "./components/credentials/register";
import VerifyOTP from "./components/credentials/verifyemail";
import Login from "./components/credentials/login";
import OfferProducts from './components/banners/offerpr'

export default function App() {
  return (
    <BrowserRouter>

      <Nav />
      <OfferProducts/>
      <Routes>

        <Route path="/" element={<ProductCards />} />

        <Route path="/product" element={<ProductDetails />} />

        <Route path="/register" element={<RegisterForm />} />
        <Route path="/login" element={<Login />} />
        <Route path="/OfferProducts" element={<OfferProducts />} />

        <Route path="/verify-otp" element={<VerifyOTP />} />

      </Routes>

      <Footer />

    </BrowserRouter>
  );
}