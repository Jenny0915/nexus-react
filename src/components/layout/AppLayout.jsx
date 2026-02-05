import { Link, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

export default function AppLayout() {
  const { user, logout } = useAuth();

  return (
    <div>
      <header style={{ padding: 16, borderBottom: "1px solid #e8edf5" }}>
        <strong style={{ letterSpacing: 3, marginRight: 16 }}>NEXUS</strong>

        <nav style={{ display: "inline-flex", gap: 14 }}>
          <Link to="/">Inicio</Link>

          {/* ✅ Estas opciones solo aparecen cuando hay usuario logueado */}
          {user && (
            <>
              <Link to="/library">Librería</Link>
              <Link to="/coworking">Coworking</Link>
              <Link to="/coworking/reservas">Reservas</Link>
              <Link to="/purchases">Compras</Link>
            </>
          )}
        </nav>

        <span style={{ float: "right" }}>
          {user ? (
            <>
              <span style={{ marginRight: 10 }}>{user.correo || "Usuario"}</span>
              <button onClick={logout}>Salir</button>
            </>
          ) : (
            <Link to="/login">Login</Link>
          )}
        </span>
      </header>

      <main style={{ padding: 16 }}>
        <Outlet />
      </main>
    </div>
  );
}
