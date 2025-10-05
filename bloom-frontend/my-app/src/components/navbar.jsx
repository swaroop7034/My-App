import { Link } from "react-router-dom";
import "../css/navbar.css";

function Navbar() {
  return (
    <nav className="navbar">
      <h2 className="logo">BloomWatch 🌻</h2>
      <ul className="nav-links">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/maps">Map</Link></li>
         <li><Link to="/bloom">Bloom Prediction</Link></li>
        <li><Link to="/timeline">Timeline</Link></li>
        <li><Link to="/about">About</Link></li>
      </ul>
    </nav>
  );
}

export default Navbar;