import React from "react";

export default function Banner() {
  const wrapper = {
    top: 0,
    zIndex: 120,
    color: "#4a2c3a",
    backgroundImage: `url("https://unsplash.com/photos/pink-petaled-flowers-INvLInqJ-Ms")`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    padding: "1rem 0.75rem",
    boxShadow: "0 2px 12px rgba(215,38,96,0.06)",
  };

  const overlay = {
    background: "linear-gradient(0deg, rgba(255,244,249,0.9), rgba(255,244,249,0.6))",
    borderBottom: "1px solid #ffd6e6",
    padding: "1rem 0.75rem",
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    maxWidth: 1200,
    margin: "0 auto",
    borderRadius: 8,
  };

  const logo = {
    width: 64,
    height: 64,
    borderRadius: "50%",
    background: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    color: "#d72660",
    boxShadow: "0 2px 8px rgba(215,38,96,0.08)",
    flex: "0 0 64px",
  };

  const title = { margin: 0, fontSize: 20, color: "#d72660", fontWeight: 800 };
  const desc = { margin: 0, fontSize: 13, color: "#5a3944", opacity: 0.95 };

  return (
    <div style={wrapper} aria-hidden={false}>
      <div style={overlay}>
        <div style={logo} aria-hidden>
          <img
          src="/favicon.ico"
          alt="Seen on Pink logo"
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            background: "#fff",
            boxShadow: "0 2px 8px rgba(215,38,96,0.08)",
            objectFit: "cover",
            flex: "0 0 64px",
          }}
        />
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <h1 style={title}>Seen on Pink</h1>
          <p style={desc}>spill spall spill currated pink items</p>
        </div>
      </div>
    </div>
  );
}