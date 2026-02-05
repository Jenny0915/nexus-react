import { Link } from "react-router-dom";
import { api } from "../api/apiClient";
import { useApi } from "../hooks/useApi";

export default function Coworking() {
  const { data, loading, error } = useApi(
    () => api.get("/coworkingnew/spaces?detalle=1"),
    []
  );

  return (
    <div>
      <h1>Coworking</h1>
      <p>Listado de espacios (API Apidog)</p>

      {loading && <p>Cargando espacios…</p>}
      {error && <p style={{ color: "crimson" }}>Error cargando espacios.</p>}

      <ul style={{ display: "grid", gap: 12, paddingLeft: 0 }}>
        {Array.isArray(data) &&
          data.map((s) => (
            <li
              key={s.id}
              style={{
                border: "1px solid #e8edf5",
                borderRadius: 12,
                padding: 14,
                listStyle: "none",
              }}
            >
              <strong>{s.nombre}</strong>

              <div style={{ opacity: 0.85, marginTop: 4 }}>
                Capacidad: {s.capacidad} · Estado:{" "}
                <strong>{s.ocupado ? "Ocupado" : "Libre"}</strong>
              </div>

              {/* ===== INFO DE OCUPACIÓN ===== */}
              <div style={{ marginTop: 6, fontSize: 14 }}>
                {!s.ocupado && (
                  <span style={{ color: "green" }}>
                    Disponible ahora ✅
                  </span>
                )}

                {s.ocupado && (
                  <>
                    <div>
                      <strong>Ocupado por:</strong> {s.ocupadoPor}
                    </div>

                    <div>
                      <strong>Desde:</strong> {s.ocupadoDesde}
                    </div>

                    <div>
                      <strong>Se libera:</strong> {s.libreA}
                    </div>
                  </>
                )}
              </div>

              <div style={{ marginTop: 10 }}>
                <Link to={`/coworking/${s.id}`}>Ver detalle</Link>
              </div>
            </li>
          ))}
      </ul>
    </div>
  );
}
