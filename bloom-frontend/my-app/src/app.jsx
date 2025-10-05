import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/navbar.jsx";
import Home from "./pages/homepage.jsx";
import About from "./pages/about.jsx";
import Timeline from "./pages/timeline.jsx";
import Maps from "./pages/map.jsx";
import "./app.css";
import Bloom from "./pages/bloom.jsx";
import Footer from "./components/Footer.jsx";

function App() {
  return (
    <Router>
      <Navbar />
      <div className="content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/timeline" element={<Timeline />} />
          <Route path="/maps" element={<Maps />} />
          <Route path="/bloom" element={<Bloom />} />
        </Routes>
      </div>
      <Footer />

    </Router>
  );
}

export default App;