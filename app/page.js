"use client";
import Product from "../components/Product";
import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

export default function Page() {
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      const { data, error } = await supabase
        .from("products")
        .select("*");
      if (!error) setProducts(data || []);
      setLoading(false);
    }
    fetchProducts();
  }, []);

  // Get unique categories
  const categories = Array.from(new Set(products.map(p => p.category)));

  // Count items per category
  const categoryCounts = categories.reduce((acc, cat) => {
    acc[cat] = products.filter(p => p.category === cat).length;
    return acc;
  }, {});

  // Count for "All"
  const allCount = products.length;

  const filteredProducts =
    selectedCategory === "All"
      ? products
      : products.filter(product => product.category === selectedCategory);

  return (
    <div>
      <div className="sticky-filter" style={{ textAlign: "center" }}>
        <label htmlFor="category-select">Category: </label>
        <select
          id="category-select"
          value={selectedCategory}
          onChange={e => setSelectedCategory(e.target.value)}
        >
          <option value="All">All ({allCount})</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>
              {cat} ({categoryCounts[cat]})
            </option>
          ))}
        </select>
      </div>
      <div className="product-list">
        {loading ? (
          <div>Loading...</div>
        ) : (
          [...filteredProducts]
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((product) => (
              <div key={product.id} style={{ marginBottom: "1rem" }}>
                <Product {...product} />
              </div>
            ))
        )}
      </div>
    </div>
  );
}