"use client";
import Product from "../components/Product";
import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabaseClient";
import Banner from "../components/Banner";

export default function Page() {
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      const { data, error } = await supabase.from("products").select("*");
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

  // Filter by category + search (name or brand)
  const filteredProducts = (selectedCategory === "All" ? products : products.filter(product => product.category === selectedCategory))
    .filter(product => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        (product.name || "").toLowerCase().includes(q) ||
        (product.brand || "").toLowerCase().includes(q)
      );
    });

  // icon click: focus input when empty, clear when there is text
  const onIconClick = () => {
    if (search) {
      setSearch("");
      searchRef.current?.focus();
    } else {
      searchRef.current?.focus();
    }
  };

  return (
    <div>
      <Banner />
      <div className="sticky-filter" style={{ textAlign: "center", padding: "0.75rem 1rem", zIndex: 130 }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 12 }}>
          <label htmlFor="category-select" style={{ marginRight: 6 }}>Category:</label>

          <select
            id="category-select"
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            style={{ padding: "0.45rem 0.6rem", borderRadius: 8, border: "1px solid #ffd6e6", background: "#fff" }}
          >
            <option value="All">All ({allCount})</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat} ({categoryCounts[cat]})
              </option>
            ))}
          </select>

          {/* search icon / popup */}
          <div style={{ position: "relative", display: "inline-block" }}>
            <button
              className={`icon-button ${showSearch ? "open" : ""}`}
  aria-pressed={showSearch}
              onClick={() => {
                if (!showSearch) {
                  setShowSearch(true);
                  setTimeout(() => searchRef.current?.focus(), 0);
                } else {
                  if (search) {
                    setSearch("");
                    setTimeout(() => searchRef.current?.focus(), 0);
                  } else {
                    setShowSearch(false);
                  }
                }
              }}
              aria-label={showSearch ? (search ? "Clear search" : "Close search") : "Open search"}
            >
              {showSearch && search ? (
                <svg width="14" height="14" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                  <path d="M18 6L6 18" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M6 6L18 18" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                  <circle cx="11" cy="11" r="6" stroke="currentColor" />
                  <path d="M21 21L15 15" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </button>

            {showSearch && (
              <input
                ref={searchRef}
                type="text"
                placeholder="Search name or brand..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Escape") {
                    setShowSearch(false);
                    setSearch("");
                  }
                }}
                style={{
                  position: "absolute",
                  right: 40,
                  top: "50%",
                  transform: "translateY(-50%)",
                  padding: "0.45rem 0.6rem",
                  borderRadius: 8,
                  border: "1px solid #ffd6e6",
                  width: 220,
                  background: "#fff",
                  zIndex: 200
                }}
              />
            )}
          </div>
        </div>
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