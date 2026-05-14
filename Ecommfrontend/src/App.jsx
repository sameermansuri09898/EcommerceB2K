import React, { useEffect } from "react";
import Nav from "./components/layout/navbar";
import Footer from "./components/layout/footer";
import ProductCards from "./components/product/productcards";
import ProductDetails from "./components/product/product";

export default function App() {
  return (
    <div>
      <Nav />
      {/* <ProductCards /> */}
      <ProductDetails />
      <Footer />

    </div>
  )
}