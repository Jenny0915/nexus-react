import Navbar from "./Navbar.jsx";
import "./header.css";

export default function Header() {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <div className="brand">
          {/* Si luego metes el logo real: reemplaza por <img src={logo} .../> */}
          <div className="brand__icon">N</div>
          <div className="brand__name">NEXUS</div>
        </div>

        <Navbar />
      </div>
    </header>
  );
}