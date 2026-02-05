import { Link } from "react-router-dom";
import { api } from "../api/apiClient";
import { useApi } from "../hooks/useApi";

export default function Landing() {
  const { data, loading, error } = useApi(
    () => api.get("/itemslib/top10", { params: { masVendido: true } }),
    []
  );

  return (
    <div>
      <h1>Inicio Nexus</h1>
      <p>Top 10 más vendidos (desde Apidog)</p>

      {loading && <p>Cargando top 10...</p>}
      {error && (
        <p style={{ color: "crimson" }}>
          Error cargando top 10. Revisa la consola (F12) y tu .env.
        </p>
      )}

      <ul>
        {Array.isArray(data) && data.map((b) => (
          <li key={b.id}>
            <Link to={`/library/${b.id}`}>{b.titulo}</Link> — {b.autor}
          </li>
        ))}
      </ul>
    </div>
  );
}
