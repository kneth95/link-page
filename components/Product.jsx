import React from "react";
import "./Product.css";

export default function Product({ picture, name, brand, category, shopeeUrl, tiktokUrl }) {
  return (
    <div className="product-card">
      <img className="product-image" src={picture} alt={name} />
      <h2 className="product-name">{name}</h2>

      {/* moved brand/category and links into a bottom container so they stick together */}
      <div className="product-bottom">
        <div className="product-meta">
          <span className="product-brand">{brand}</span>
          <span className="product-category">{category}</span>
        </div>

        <div className="product-links">
          <a href={shopeeUrl} target="_blank" rel="noopener noreferrer">
            <button className="product-btn shopee">Shopee</button>
          </a>
          <a href={tiktokUrl} target="_blank" rel="noopener noreferrer">
            <button className="product-btn tiktok">Tiktok</button>
          </a>
        </div>
      </div>
    </div>
  );
}