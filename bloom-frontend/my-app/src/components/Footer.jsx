import React from "react";
import "../css/Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Branding Section */}
        <div className="footer-branding">
          <div className="footer-logo">🌸 BloomWatch</div>
          <p className="footer-description">
            Tracking global flowering phenology with NASA Earth observations.
          </p>
          <div className="challenge-badge">
            <span role="img" aria-label="badge">🏅</span> NASA Space Apps Challenge 2025
          </div>
        </div>

        {/* Quick Links */}
        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul>
            <li><a href="/map">Map</a></li>
            <li><a href="/bloom">Bloom Prediction</a></li>
            <li><a href="/timeline">Timeline</a></li>
            <li><a href="/about">About</a></li>
          </ul>
        </div>

        {/* Resources */}
        <div className="footer-section">
          <h4>Resources</h4>
          <ul>
            <li><a href="https://earthdata.nasa.gov/" target="_blank" rel="noopener noreferrer">NASA Earth Data ↗</a></li>
            <li><a href="https://www.spaceappschallenge.org/" target="_blank" rel="noopener noreferrer">Space Apps Challenge ↗</a></li>
            <li><a href="https://usanpn.org/" target="_blank" rel="noopener noreferrer">USA Phenology Network ↗</a></li>
            <li><a href="#" target="_blank" rel="noopener noreferrer">Project Repository ↗</a></li>
          </ul>
        </div>

        {/* Legal */}
        <div className="footer-section">
          <h4>Legal</h4>
          <ul>
            <li><a href="/privacy-policy">Privacy Policy</a></li>
            <li><a href="/terms">Terms of Service</a></li>
            <li><a href="/contact">Contact</a></li>
            <li><a href="/data-attribution">Data Attribution</a></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2025 BloomWatch. Built for NASA Space Apps Challenge.</p>
        <div className="footer-links">
          <a href="https://www.nasa.gov" target="_blank" rel="noopener noreferrer">NASA</a>
          <a href="https://www.spaceappschallenge.org" target="_blank" rel="noopener noreferrer">Space Apps</a>
          <a href="#">Team NovaMinds</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;