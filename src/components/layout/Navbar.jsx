import { NavLink } from "react-router-dom";

const linkClass = ({ isActive }) =>
  "nav__link" + (isActive ? " nav__link--active" : "");

export default function Navbar() {
  return (
    <nav className="nav">
      <NavLink to="/" className={linkClass}>Inicio</NavLink>
      <NavLink to="/library" className={linkClass}>Librería</NavLink>
      <NavLink to="/coworking" className={linkClass}>Coworking</NavLink>
      <NavLink to="/coworking/reservas" className={linkClass}>Reservas</NavLink>
      <NavLink to="/purchases" className={linkClass}>Compras</NavLink>

      <NavLink to="/login" className="nav__btn">
        Login
      </NavLink>
    </nav>
  );
}