// src/components/layout/AppLayout.jsx
import { useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import nexusLogo from "../../assets/nexus-logo.png"; // Importación de tu logo
import "./AppLayout.css";

export default function AppLayout() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate("/login");
  };

  // Función para cerrar el menú al hacer clic en un link (importante para móvil)
  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="app-container">
      <header className="main-header">
        <div className="header-content">
          {/* Logo Principal */}
          <Link to="/" className="logo-area" onClick={closeMenu}>
            <img src={nexusLogo} alt="Nexus Logo" className="header-logo" />
          </Link>

          {/* Botón Hamburguesa (Criterio 1: Adaptación móvil) */}
          <button 
            className={`menu-toggle ${menuOpen ? 'active' : ''}`} 
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            {menuOpen ? "✕" : "☰"}
          </button>

          {/* Navegación Principal */}
          <nav className={`main-nav ${menuOpen ? "is-open" : ""}`}>
            <Link to="/" onClick={closeMenu}>Inicio</Link>
            
            {user && (
              <>
                <Link to="/library" onClick={closeMenu}>Librería</Link>
                <Link to="/coworking" onClick={closeMenu}>Coworking</Link>
                <Link to="/coworking/reservas" onClick={closeMenu}>Reservas</Link>
                <Link to="/purchases" onClick={closeMenu}>Mis Compras</Link>
              </>
            )}

            {/* Info de usuario visible solo en menú móvil */}
            {user && (
              <div className="mobile-user-info">
                <span className="user-email">{user.correo}</span>
                <button onClick={handleLogout} className="btn-logout-mob">
                  Cerrar Sesión
                </button>
              </div>
            )}
          </nav>

          {/* Área de Auth visible solo en Escritorio */}
          <div className="auth-area hide-mobile">
            {user ? (
              <div className="user-info">
                <span className="user-email">{user.correo}</span>
                <button onClick={handleLogout} className="btn-logout">Salir</button>
              </div>
            ) : (
              <Link to="/login" className="btn-login">Entrar</Link>
            )}
          </div>
        </div>
      </header>

      {/* Aquí se renderizan las páginas (Landing, Library, etc.) */}
      <main className="main-content">
        <Outlet />
      </main>

      {/* Footer estilo Corporativo */}
      <footer className="main-footer">
        <div className="footer-grid">
          <div className="footer-col branding">
            <div className="footer-logo-container">
                <img src={nexusLogo} alt="Nexus Logo" className="footer-logo" />
            </div>
            <p>Tu espacio de conocimiento y trabajo colaborativo en el corazón de la ciudad.</p>
          </div>

          <div className="footer-col">
            <h4>Navegación</h4>
            <Link to="/">Inicio</Link>
            <Link to="/library">Librería</Link>
            <Link to="/coworking">Coworking</Link>
          </div>

          <div className="footer-col">
            <h4>Sedes</h4>
            <p>Sede Norte - Bogotá</p>
            <p>Campus Medellín</p>
          </div>

          <div className="footer-col">
            <h4>Soporte</h4>
            <p>📞 +57 300 123 4567</p>
            <p>✉️ ayuda@nexus.com</p>
          </div>
        </div>

        <div className="footer-bottom">
          &copy; {new Date().getFullYear()} Nexus - Proyecto Académico UNIR
        </div>
      </footer>
    </div>
  );
}