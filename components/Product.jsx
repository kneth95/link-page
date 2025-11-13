import React from "react";
import "./Product.css";

export default function Product({ picture, name, brand, category, shopeeUrl, tiktokUrl }) {
  return (
    <div className="product-card">
      <img src={picture} alt={name} />
      <h2>{name}</h2>
      <span className="product-brand">{brand}</span>
      <span className="product-category">{category}</span>
      <div className="product-links">
        <a href={shopeeUrl} target="_blank" rel="noopener noreferrer">
          <button style={{ background: "#ff5722", color: "#fff" }}>Shopee</button>
        </a>
        <a href={tiktokUrl} target="_blank" rel="noopener noreferrer">
          <button style={{ background: "#000", color: "#fff" }}>TikTok</button>
        </a>
      </div>
    </div>
  );
}