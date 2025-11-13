"use client";
import Product from "../../components/Product";
import { supabase } from "../../lib/supabaseClient";
import React, { useState, useEffect } from "react";


function AutocompleteInput({ label, name, value, onChange, options }) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const filtered = value
    ? options.filter(opt => opt.toLowerCase().includes(value.toLowerCase()))
    : options;

  return (
    <div style={{ position: "relative", marginBottom: "1rem" }}>
      <label>{label}: </label>
      <input
        name={name}
        value={value}
        onChange={e => {
          onChange(e);
          setShowSuggestions(true);
        }}
        autoComplete="off"
        onBlur={() => setTimeout(() => setShowSuggestions(false), 100)}
        onFocus={() => setShowSuggestions(true)}
        placeholder={`Type or select ${label.toLowerCase()}`}
        style={{ width: "100%" }}
      />
      {showSuggestions && filtered.length > 0 && (
        <ul style={{
          position: "absolute",
          left: 0,
          right: 0,
          background: "#fff",
          border: "1px solid #ccc",
          borderRadius: "4px",
          zIndex: 10,
          listStyle: "none",
          margin: 0,
          padding: "0.5rem 0",
          maxHeight: "120px",
          overflowY: "auto"
        }}>
          {filtered.map(opt => (
            <li
              key={opt}
              style={{ padding: "0.3rem 1rem", cursor: "pointer" }}
              onMouseDown={() => {
                onChange({ target: { name, value: opt } });
                setShowSuggestions(false);
              }}
            >
              {opt}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function ManageProducts() {
  
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [loginError, setLoginError] = useState("");
  const [tab, setTab] = useState("add");
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    name: "",
    brand: "",
    category: "",
    picture: "",
    shopeeUrl: "",
    tiktokUrl: "",
  });
  const [editIdx, setEditIdx] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("*");
    if (!error) setProducts(data || []);
    setLoading(false);
  };
  
  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data?.user || null);
      setAuthChecked(true);
    };
    checkUser();
  }, []);

  // Fetch products from Supabase
  useEffect(() => {
    fetchProducts();
  }, []);
  
  // Replace with your admin email
  const isAdmin = !!user;
  
  // Login handler
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    const { error } = await supabase.auth.signInWithPassword({
      email: loginForm.email,
      password: loginForm.password,
    });
    if (error) {
      setLoginError(error.message);
      return;
    }
    // Refresh user state
    const { data } = await supabase.auth.getUser();
    setUser(data?.user || null);
  };

  // Show login page until admin is logged in
  if (!authChecked) {
    return <div>Checking authentication...</div>;
  }

  if (!user || !isAdmin) {
    return (
      <div style={{ maxWidth: 400, margin: "4rem auto", padding: "2rem", background: "#fff6fa", borderRadius: 12, boxShadow: "0 2px 12px rgba(215,38,96,0.07)" }}>
        <h2 style={{ color: "#d72660", marginBottom: "1rem" }}>Admin Login</h2>
        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <input
            type="email"
            placeholder="Admin Email"
            value={loginForm.email}
            onChange={e => setLoginForm({ ...loginForm, email: e.target.value })}
            required
            style={{ padding: "0.7rem", borderRadius: 6, border: "1px solid #ffd6e6" }}
          />
          <input
            type="password"
            placeholder="Password"
            value={loginForm.password}
            onChange={e => setLoginForm({ ...loginForm, password: e.target.value })}
            required
            style={{ padding: "0.7rem", borderRadius: 6, border: "1px solid #ffd6e6" }}
          />
          <button type="submit" style={{ background: "#d72660", color: "#fff", border: "none", borderRadius: 6, padding: "0.7rem", fontWeight: "bold" }}>
            Login
          </button>
          {loginError && <div style={{ color: "#d72660", marginTop: "0.5rem" }}>{loginError}</div>}
        </form>
      </div>
    );
  }


  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fileName = `${Date.now()}_${file.name}`;
    const { data, error } = await supabase.storage
      .from("product-images")
      .upload(fileName, file);

    if (error) {
      alert("Image upload failed: " + error.message);
      console.error(error);
      return;
    }
    const { publicUrl } = supabase
      .storage
      .from("product-images")
      .getPublicUrl(fileName)
      .data;
    setForm({ ...form, picture: publicUrl });
  };
  

  // Unique brands and categories for suggestions
  const brands = Array.from(new Set(products.map(p => p.brand)));
  const categories = Array.from(new Set(products.map(p => p.category)));

  // Handle input change
  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Add or update product in Supabase
  const handleSubmit = async e => {
  e.preventDefault();
  if (editIdx !== null) {
    // Edit mode
    const productId = products[editIdx].id;
    const { error } = await supabase.from("products").update(form).eq("id", productId);
    if (error) {
      alert("Failed to update product: " + error.message);
      return;
    }
    setEditIdx(null);
    alert("Product updated successfully!");
  } else {
    // Add mode
    const { error } = await supabase.from("products").insert([form]);
    if (error) {
      alert("Failed to add product: " + error.message);
      return;
    }
    alert("Product added successfully!");
  }
  setForm({
    name: "",
    brand: "",
    category: "",
    picture: "",
    shopeeUrl: "",
    tiktokUrl: "",
  });
  await fetchProducts();
};

  // Edit product
  const handleEdit = idx => {
    setForm(products[idx]);
    setEditIdx(idx);
    setTab("view");
  };

  // Delete product from Supabase
  const handleDelete = async id => {
  const confirmDelete = window.confirm("Are you sure you want to delete this product?");
  if (confirmDelete) {
    await supabase.from("products").delete().eq("id", id);
    // Always fetch latest products after delete
    await fetchProducts();
    if (editIdx !== null && products[editIdx].id === id) {
      setEditIdx(null);
      setForm({
        name: "",
        brand: "",
        category: "",
        picture: "",
        shopeeUrl: "",
        tiktokUrl: "",
      });
    }
  }
};

  // Filter and sort products for display
  const filteredProducts = products
    .filter(product =>
      product.name.toLowerCase().includes(search.toLowerCase()) ||
      product.brand.toLowerCase().includes(search.toLowerCase()) ||
      product.category.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div style={{ maxWidth: 600, margin: "2rem auto" }}>
      <h1>Manage Products</h1>
      <div style={{ display: "flex", marginBottom: "1rem" }}>
        <button
          onClick={() => {
            setTab("add");
            setEditIdx(null);
            setForm({
              name: "",
              brand: "",
              category: "",
              picture: "",
              shopeeUrl: "",
              tiktokUrl: "",
            });
          }}
          style={{
            flex: 1,
            padding: "0.75rem",
            background: tab === "add" ? "#d72660" : "#eee",
            color: tab === "add" ? "#fff" : "#333",
            border: "none",
            borderRadius: "8px 0 0 8px",
            cursor: "pointer",
            fontWeight: "bold"
          }}
        >
          Add Product
        </button>
        <button
          onClick={() => setTab("view")}
          style={{
            flex: 1,
            padding: "0.75rem",
            background: tab === "view" ? "#d72660" : "#eee",
            color: tab === "view" ? "#fff" : "#333",
            border: "none",
            borderRadius: "0 8px 8px 0",
            cursor: "pointer",
            fontWeight: "bold"
          }}
        >
          View/Edit/Delete
        </button>
      </div>
      {tab === "add" && (
        <form onSubmit={handleSubmit} style={{ marginBottom: "2rem", background: "#f9f9f9", padding: "1rem", borderRadius: "8px", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <input name="name" value={form.name} onChange={handleChange} placeholder="Name" required />
          <AutocompleteInput
            label="Brand"
            name="brand"
            value={form.brand}
            onChange={handleChange}
            options={brands}
          />
          <AutocompleteInput
            label="Category"
            name="category"
            value={form.category}
            onChange={handleChange}
            options={categories}
          />
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
          />
          {form.picture && (
            <img src={form.picture} alt="Preview" style={{ width: 120, margin: "1rem 0" }} />
          )}

          <input name="shopeeUrl" value={form.shopeeUrl} onChange={handleChange} placeholder="Shopee URL" required />
          <input name="tiktokUrl" value={form.tiktokUrl} onChange={handleChange} placeholder="TikTok URL" required />
          <button type="submit" style={{ marginTop: "0.5rem" }}>
            Add Product
          </button>
        </form>
      )}
      {tab === "view" && (
        <>
          <input
            type="text"
            placeholder="Search product, brand, or category..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ marginBottom: "1rem", padding: "0.5rem", width: "100%" }}
          />
          {editIdx !== null && (
            <form onSubmit={handleSubmit} style={{ marginBottom: "2rem", background: "#f9f9f9", padding: "1rem", borderRadius: "8px", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <input name="name" value={form.name} onChange={handleChange} placeholder="Name" required />
              <AutocompleteInput
                label="Brand"
                name="brand"
                value={form.brand}
                onChange={handleChange}
                options={brands}
              />
              <AutocompleteInput
                label="Category"
                name="category"
                value={form.category}
                onChange={handleChange}
                options={categories}
              />
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
              />
              {form.picture && (
                <img src={form.picture} alt="Preview" style={{ width: 120, margin: "1rem 0" }} />
              )}
              <input name="shopeeUrl" value={form.shopeeUrl} onChange={handleChange} placeholder="Shopee URL" required />
              <input name="tiktokUrl" value={form.tiktokUrl} onChange={handleChange} placeholder="TikTok URL" required />
              <div>
                <button type="submit" style={{ marginRight: "0.5rem" }}>
                  Update
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditIdx(null);
                    setForm({
                      name: "",
                      brand: "",
                      category: "",
                      picture: "",
                      shopeeUrl: "",
                      tiktokUrl: "",
                    });
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
          <div>
            {loading ? (
              <div>Loading...</div>
            ) : (
              filteredProducts.map((product, idx) => (
                <div key={product.id} style={{ position: "relative", marginBottom: "1rem" }}>
                  <Product {...product} />
                  <div style={{ position: "absolute", top: 10, right: 10 }}>
                    <button onClick={() => handleEdit(idx)} style={{ marginRight: "0.5rem" }}>Edit</button>
                    <button onClick={() => handleDelete(product.id)}>Delete</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}