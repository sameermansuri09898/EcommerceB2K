import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Nav from "./components/layout/navbar";
import Footer from "./components/layout/footer";

import ProductCards from "./components/product/productcards";
import ProductDetails from "./components/product/product";

import RegisterForm from "./components/credentials/register";
import VerifyOTP from "./components/credentials/verifyemail";
import Login from "./components/credentials/login";

// import OfferProducts from './components/banners/offerpr'
import Cart from './components/odders/cart'
import Categories from './components/categories/swipercat'
import AddProduct from './components/sellercredentials/addproduct'
import ProductPage from  './components/product/itemView'

export default function App() {
  return (
    <BrowserRouter>

      <Nav />
      <Categories/>
      <Routes>

        <Route path="/" element={<ProductCards />} />

        <Route path="/product" element={<ProductDetails />} />

        <Route path="/register" element={<RegisterForm />} />

        <Route path="/login" element={<Login />} />

{/* 
        <Route path="/OfferProducts" element={<OfferProducts />} /> */}
        <Route path="/ProductPage/:id" element={<ProductPage />} />

        <Route path="/verify-otp" element={<VerifyOTP />} />

        <Route path="/Cart" element={<Cart />} />
        <Route path="/seller/add-product" element={<AddProduct />} />

      </Routes>
<Footer/>
    </BrowserRouter>
  );
}