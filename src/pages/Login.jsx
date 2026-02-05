import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [correo, setCorreo] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    await login({ correo });
    nav("/library", { replace: true });
  }

  return (
    <div style={{ maxWidth: 420 }}>
      <h1>Login</h1>
      <form onSubmit={onSubmit}>
        <input value={correo} onChange={(e) => setCorreo(e.target.value)} placeholder="correo" />
        <button type="submit">Entrar</button>
      </form>
    </div>
  );
}
