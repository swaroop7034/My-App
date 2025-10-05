import React, { useState, useEffect } from "react";
import Navbar from "../components/navbar.jsx";
import "../css/homepage.css";

function Home() {
  const [darkMode, setDarkMode] = useState(false);
  const toggleDarkMode = () => setDarkMode(!darkMode);

  // optional: fake loading if you want a loader
  const [loading, setLoading] = useState(false);
  // you can optionally use loading, but for now I'll skip loader

  return (
    <div className={darkMode ? "home-container dark" : "home-container"}>
      <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />

      {/* Hero / Intro section */}
      <section className="hero-section">
        <h1 className="hero-title">BloomWatch- Tracking <br />Global Flowering Phenology</h1>
        <p className="hero-subtitle">
          Harnessing NASA Earth observations to monitor <br />seasonal vegetation changes and understand <br />the intricate patterns of nature's blooming cycles.
        </p>
        <div className="hero-buttons">
          <a href="/dashboard" className="btn btn-primary">Enter Dashboard</a>
          <a href="/about" className="btn btn-secondary">Learn More</a>
        </div>
      </section>

      {/* Features / Highlights section below hero */}
      <section className="features-section">
        <h2 className="features-heading">Explore Nature's Patterns</h2>
        <p>Discover the fascinating world of global flowering patterns through interactive<br /> visualizations and real-time data analysis.</p>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🌍</div>
            <h3>Global Dashboard</h3>
            <p>Interactive world map with real-time bloom hotspots and regional insights.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🗺</div>
            <h3>Data Analytics</h3>
            <p>Advanced charts showing seasonal trends and climate correlations.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📈</div>
            <h3>Phenology Timeline</h3>
            <p>Analyze blooming trends over time and climates</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🌱</div>
            <h3>Species Explorer</h3>
            <p>Detailed information about different flowering species worldwide.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
export default Home;