import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../api/apiClient";

/**
 * Persistencia simple de sesión:
 * - Se guarda el usuario en localStorage (solo datos básicos, NO contraseña)
 * - Al recargar, se lee y se restaura la sesión
 */

const AuthContext = createContext(null);
const STORAGE_KEY = "nexus_user";

export function AuthProvider({ children }) {
  // ✅ 1) Se carga la sesión guardada al iniciar (esto evita que se pierda con F5)
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  // ✅ 2) Cada vez que cambia el user, se guarda o se borra
  useEffect(() => {
    try {
      if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      else localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Si el navegador bloquea localStorage por alguna razón, no se rompe la app
    }
  }, [user]);

  // ✅ 3) Login
  async function login({ correo, contrasena }) {
    /**
     * IMPORTANTE:
     * - Se guarda SOLO informacion del usuario (correo en este caso)
     * - NO se guarda la contraseña
     */
    try {
      // Mi API en Apidog usa GET /login con query params (mock)
      const res = await api.get("/login", { params: { correo, contrasena } });

      // Se guarda lo que venga del API, pero se garantiza que al menos tenga correo
      const safeUser = {
        ...res.data,
        correo: res.data?.correo || correo,
      };

      setUser(safeUser);
      return true;
    } catch (e) {
      // Fallback demo: si el mock falla, igual deja entrar (para seguir trabajando)
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
