import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../api/apiClient";

/**
 * Persistencia simple de sesión:
 * - Guardamos el usuario en localStorage (solo datos básicos, NO contraseña)
 * - Al recargar, lo leemos y restauramos la sesión
 */

const AuthContext = createContext(null);
const STORAGE_KEY = "nexus_user";

export function AuthProvider({ children }) {
  // ✅ 1) Cargar sesión guardada al iniciar (esto evita que se pierda con F5)
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  // ✅ 2) Cada vez que cambia el user, lo guardamos o lo borramos
  useEffect(() => {
    try {
      if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      else localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Si el navegador bloquea localStorage por alguna razón, no rompemos la app
    }
  }, [user]);

  // ✅ 3) Login
  async function login({ correo, contrasena }) {
    /**
     * IMPORTANTE:
     * - Guardamos SOLO info del usuario (correo, etc.)
     * - NO guardamos la contraseña
     */
    try {
      // Tu API en Apidog usa GET /login con query params (mock)
      const res = await api.get("/login", { params: { correo, contrasena } });

      // Guardamos lo que venga del API, pero garantizamos que al menos tenga correo
      const safeUser = {
        ...res.data,
        correo: res.data?.correo || correo,
      };

      setUser(safeUser);
      return true;
    } catch (e) {
      // Fallback demo: si el mock falla, igual te deja entrar (para seguir trabajando)
      setUser({ correo, demo: true });
      return false;
    }
  }

  // ✅ 4) Logout
  function logout() {
    setUser(null); // esto también borra localStorage por el useEffect
  }

  const value = useMemo(() => ({ user, login, logout }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
}
