import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import "./login.css";

import loginImg from "../assets/login-illustration.png"; 

export default function Login() {
  /* Utilicé el hook personalizado useAuth para acceder a la lógica global de acceso
     y useNavigate para redirigir al usuario una vez se haya autenticado. */
  const { login } = useAuth();
  const nav = useNavigate();
  const [correo, setCorreo] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    await login({ correo });
    
    /* Después de validar el usuario, redirijo automáticamente a la sección de la Librería
       usando 'replace: true' para que el usuario no pueda regresar al Login con el botón de atrás. */
    nav("/library", { replace: true });
  }

  return (
    <div className="login-page">
      <div className="login-card">
        
        {/* SECCIÓN IZQUIERDA: Formulario de acceso */}
        <div className="login-section-text">
          <h1 className="login-title">¡Bienvenido a Nexus!</h1>
          <p className="login-subtitle">
            Tu espacio de trabajo inteligente te espera. 
            Introduce tu correo para acceder.
          </p>
          
          <form onSubmit={onSubmit} className="login-form">
            <div className="input-group">
              <label htmlFor="correo">Correo electrónico</label>
              <input 
                id="correo"
                type="email"
                value={correo} 
                onChange={(e) => setCorreo(e.target.value)} 
                placeholder="ejemplo@nexus.com" 
                required
              />
            </div>
            <button type="submit" className="btn-login-submit">
              Entrar
            </button>
          </form>
        </div>

        {/* SECCIÓN DERECHA: Ilustración visual de la marca */}
        <div className="login-section-image">
          <img 
            src={loginImg} 
            alt="Nexus Illustration" 
            className="login-img-fluid"
          />
        </div>
      </div>
    </div>
  );
}