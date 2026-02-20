import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../api/apiClient";
import { useApi } from "../hooks/useApi";

export default function SpaceDetail() {
  const { id } = useParams();

     
  const { data, loading, error } = useApi(
    () => api.get(`/coworkingnew/spaces/${id}`),
    [id]
  );

  const [desde, setDesde] = useState("2025-12-01T09:00:00Z");
  const [hasta, setHasta] = useState("2025-12-01T10:00:00Z");
  const [sending, setSending] = useState(false);

  async function reservar() {
    try {
      setSending(true);

      const body = {
        idUsuario: 1,
        idEspacio: Number(id),
        desde,
        hasta,
      };

      await api.post("/coworkingnew/reservations", body);
      alert("Reserva enviada (demo).");
    } catch {
      alert("No se pudo crear la reserva (mock).");
    } finally {
      setSending(false);
    }
  }

  if (loading) return <p>Cargando espacio…</p>;
  if (error) return <p style={{ color: "crimson" }}>Error cargando espacio.</p>;

  return (
    <div>
      <h1>{data?.nombre}</h1>

      <p><strong>Tipo:</strong> {data?.tipo}</p>
      <p><strong>Capacidad:</strong> {data?.capacidad}</p>
      <p><strong>Ubicación:</strong> {data?.ubicacion}</p>
      <p><strong>Estado:</strong> {data?.ocupado ? "Ocupado" : "Libre"}</p>

      <div style={{ margin: "14px 0" }}>
        {/* Atajo para ir a la vista bonita de reservas */}
        <Link to="/coworking/reservas">Ir a Reservas (plano + calendario)</Link>
      </div>

      <hr />

      <h2>Crear reserva (demo)</h2>
      <p style={{ opacity: 0.8 }}>
        Esta parte es solo para probar el POST. La reserva completa está en “Reservas”.
      </p>

      <div style={{ display: "grid", gap: 10, maxWidth: 520 }}>
        <label>
          Desde (ISO)
          <input value={desde} onChange={(e) => setDesde(e.target.value)} />
        </label>

        <label>
          Hasta (ISO)
          <input value={hasta} onChange={(e) => setHasta(e.target.value)} />
        </label>

        <button onClick={reservar} disabled={sending}>
          {sending ? "Enviando…" : "Reservar"}
        </button>
      </div>
    </div>
  );
}

