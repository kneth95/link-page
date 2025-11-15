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

  const buttonRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      const { data, error } = await supabase.from("products").select("*");
      if (!error) setProducts(data || []);
      setLoading(false);
    }
    fetchProducts();
  }, []);

  // close search when clicking outside the sticky-filter (but do NOT clear the query)
  useEffect(() => {
    if (!showSearch) return;
    const handler = (e) => {
      const sticky = document.querySelector(".sticky-filter");
      if (!sticky) return;
      if (!sticky.contains(e.target)) {
        setShowSearch(false); // do NOT clear search here per request
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showSearch]);

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

  return (
    <div>
      <Banner />
      <div className="sticky-filter" style={{ textAlign: "center", padding: "0.5rem 0", zIndex: 130 }}>
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

          {/* search icon (toggles the search row inside sticky-filter) */}
          <div style={{ position: "relative", display: "inline-block" }}>
            <button
              ref={buttonRef}
              className={`icon-button ${showSearch ? "open" : ""}`}
              aria-pressed={showSearch}
              onClick={() => {
                setShowSearch(prev => {
                  const next = !prev;
                  if (!next) {
                    // toggling off via icon => clear the query
                    setSearch("");
                  } else {
                    // toggling on => focus input (no clear)
                    setTimeout(() => inputRef.current?.focus(), 40);
                  }
                  return next;
                });
              }}
              aria-label={showSearch ? "Close search" : "Open search"}
            >
              {showSearch ? (
                /* X / close icon when search row is active */
                <svg width="14" height="14" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                  <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : (
                /* magnifier when search is closed */
                <svg width="16" height="16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                  <circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth="2" />
                  <path d="M21 21L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* new row: inline search bar inside sticky-filter under the controls */}
        {showSearch && (
          <div className="search-row" style={{ marginTop: 8 }}>
            <div className="search-inner" style={{ width: "min(980px, 96%)", margin: "0 auto", display: "flex", gap: 8, alignItems: "center" }}>
              <input
                ref={inputRef}
                autoFocus
                type="text"
                className="search-popup-input"
                placeholder="Search name or brand..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Escape") {
                    setShowSearch(false); // close on Escape, keep query
                  } else if (e.key === "Enter") {
                    e.preventDefault();
                  }
                }}
                style={{
                  flex: 1,
                  padding: "0.6rem 0.75rem",
                  border: "1px solid rgba(219,124,173,0.8)",
                  fontSize: "1rem",
                  outline: "none",
                  boxSizing: "border-box",
                  minWidth: 0,
                  background: "#fff",
                  backdropFilter: "blur(30px) saturate(180%)",
                  WebkitBackdropFilter: "blur(30px) saturate(180%)",
                  borderRadius: "10px",
                  border: "1px solid rgba(255,255,255,0.4)",
                  
                }}
              />
              {/* clear button inside the search row (clears query but doesn't close) */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSearch("");
                  inputRef.current?.focus();
                }}
                aria-label="Clear search query"
                className="icon-button"
                style={{ height: 36, padding: "0 12px", minWidth: 36, fontSize: "0.85rem", fontWeight: 600 }}
              >
                Clear
              </button>
            </div>
          </div>
        )}
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