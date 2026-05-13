import React, { useEffect } from "react";
import Nav from "./components/layout/navbar";
import ProductCards from "./components/product/productcards";

export default function App() {
  return (
    <div>
      <Nav />
      <ProductCards />
    </div>
  )
}