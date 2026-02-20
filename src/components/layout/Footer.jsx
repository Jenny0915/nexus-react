import "./footer.css";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="footer-col">
          <div className="footer-title">NEXUS</div>
          <p className="footer-text">
            Librería universitaria + Coworking. Proyecto SPA en React consumiendo API simulada (Apidog).
          </p>
        </div>

        <div className="footer-col">
          <div className="footer-title">Secciones</div>
          <ul className="footer-list">
            <li>Librería</li>
            <li>Compras</li>
            <li>Coworking</li>
            <li>Reservas</li>
          </ul>
        </div>

        <div className="footer-col">
          <div className="footer-title">Contacto</div>
          <ul className="footer-list">
            <li>Bogotá, Colombia</li>
            <li>soporte@nexus.edu</li>
            <li>+57 300 000 0000</li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        © {new Date().getFullYear()} Nexus — Actividad 3
      </div>
    </footer>
  );
}