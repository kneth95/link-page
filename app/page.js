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
  const buttonRef = useRef(null);
  const inputRef = useRef(null);

  // popup style for the floating search input (position: fixed so it doesn't affect layout)
  const [popupStyle, setPopupStyle] = useState({ display: "none" });

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      const { data, error } = await supabase.from("products").select("*");
      if (!error) setProducts(data || []);
      setLoading(false);
    }
    fetchProducts();
  }, []);

  // recompute popup position based on sticky-filter position (full-width row under sticky-filter)
  const computePopupPosition = () => {
    const sticky = document.querySelector(".sticky-filter");
    let top = 64; // fallback
    if (sticky) {
      const rect = sticky.getBoundingClientRect();
      top = Math.max(0, Math.round(rect.bottom));
    }
    setPopupStyle({
      position: "fixed",
      top: `${top}px`,
      left: 0,
      right: 0,
      zIndex: 1200,
      display: "flex",
      justifyContent: "center",
      padding: "0",            // no extra padding so inner bar can be full width
      boxSizing: "border-box",
      pointerEvents: "auto",   // allow clicks so overlay can catch outside clicks
    });
  };

  // show / hide handling: compute popup position and focus input when opened
  useEffect(() => {
    if (showSearch) {
      computePopupPosition();
      // small timeout to ensure style applied before focusing
      setTimeout(() => {
        inputRef.current?.focus();
      }, 40);
    } else {
      setPopupStyle({ display: "none" });
    }
  }, [showSearch]);

  // recompute position on resize/scroll while visible
  useEffect(() => {
    if (!showSearch) return;
    const onResize = () => computePopupPosition();
    const onScroll = () => computePopupPosition();
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onScroll, true);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [showSearch]);

  // click outside to close popup
  useEffect(() => {
    if (!showSearch) return;
    const handler = (e) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(e.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target)
      ) {
        setShowSearch(false);
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

          {/* search icon (fixed-size rectangle) */}
          <div style={{ position: "relative", display: "inline-block" }}>
              <button
                ref={buttonRef}
                className={`icon-button ${showSearch ? "open" : ""}`}
                aria-pressed={showSearch}
                onClick={() => {
                  setShowSearch(prev => {
                    const next = !prev;
                    if (!next) {
                      // toggling off => clear the query
                      setSearch("");
                    } else {
                      // toggling on => open and focus, do NOT clear
                      computePopupPosition();
                      setTimeout(() => inputRef.current?.focus(), 40);
                    }
                    return next;
                  });
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

              {/* floating search input: full-width row under sticky-filter (fixed, non-disruptive) */}
              {showSearch && (
                <div
                  style={popupStyle}
                  // clicking the overlay (outside the inner bar) closes the search
                  onMouseDown={() => setShowSearch(false)} // do NOT clear search here per request
                >
                  {/* inner container stops propagation so clicks inside don't close */}
                  <div
                    onMouseDown={(e) => e.stopPropagation()}
                    style={{
                      /* make the search bar span the entire viewport width and use flex so input expands */
                      width: "80vw",
                      maxWidth: "600px",
                      marginLeft: "calc(50% - 50vw)", // full-bleed
                      pointerEvents: "auto",
                      borderRadius: 0,
                      padding: "12px 16px",
                      boxShadow: "0 6px 18px rgba(215,38,96,0)",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
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
                          setShowSearch(false);
                          // don't clear search
                        } else if (e.key === "Enter") {
                          e.preventDefault();
                          setShowSearch(false); // close on Enter, keep query
                        }
                      }}
                      style={{
                        flex: 1,                 // take all available width of the popup row
                        padding: "0.6rem 0.75rem",
                        borderRadius: 20,
                        border: "1px solid rgba(219,124,173,0.8)",
                        fontSize: "1rem",
                        outline: "none",
                        boxSizing: "border-box",
                        background: "linear-gradient(rgba(255,255,255,0.25), rgba(255,255,255,0.05))",
                        backdropFilter: "blur(30px) saturate(180%)",
                        WebkitBackdropFilter: "blur(30px) saturate(180%)",
                        minWidth: 0,             // allow flex to shrink correctly
                      }}
                    />

                    {/* Clear button inside the input area (does not close the popup) */}
          
                  </div>
                </div>
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