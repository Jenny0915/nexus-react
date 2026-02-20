import Navbar from "./Navbar.jsx";
import "./header.css";

export default function Header() {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <div className="brand">
          {}
          <div className="brand__icon">N</div>
          <div className="brand__name">NEXUS</div>
        </div>

        <Navbar />
      </div>
    </header>
  );
}