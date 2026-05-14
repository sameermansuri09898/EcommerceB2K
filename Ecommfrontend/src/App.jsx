import React, { useEffect } from "react";
import Nav from "./components/layout/navbar";
import ProductCards from "./components/product/productcards";
import ProductDetails from "./components/product/product";

export default function App() {
  return (
    <div>
      <Nav />
      {/* <ProductCards /> */}
      <ProductDetails />

    </div>
  )
}