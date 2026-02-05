import { shortMesaLabel } from "./spaceUtils";

export default function FloorPlan({ grouped, selectedId, onSelect }) {
  const sala1 = grouped.salas[0];
  const sala2 = grouped.salas[1];
  const cabina1 = grouped.cabinas[0];
  const cabina2 = grouped.cabinas[1];

  return (
    <>
      <div className="plan-grid" aria-label="Plano interactivo (API)">

        {/* Zona común (no reservable, solo decorativa) */}
        <div className="space-card no-book area-zona" style={{ cursor: "default", opacity: 0.75 }}>
          Zona común (no reservable)
        </div>

        {/* Sala 1 */}
        <button
          className={`space-card grupos area-sala1 ${selectedId === sala1?.id ? "is-selected" : ""}`}
          type="button"
          disabled={!sala1}
          onClick={() => sala1 && onSelect(sala1)}
        >
          {sala1 ? sala1.nombre : "Sala 1 (no disponible)"}
        </button>

        {/* Mesas */}
        <section className="space-card personal area-mesas mesas" aria-label="Mesas">
          <div className="mesas-title">Mesas</div>

          <div className="mesas-grid" aria-label="Listado de mesas">
            {grouped.mesas.map((m) => (
              <button
                key={m.id}
                type="button"
                className={`mesa-btn ${selectedId === m.id ? "is-selected" : ""}`}
                onClick={() => onSelect(m)}
                title={m.nombre}
              >
                {shortMesaLabel(m.nombre)}
              </button>
            ))}
          </div>
        </section>

        {/* Cabina 1 */}
        <button
          className={`space-card personal area-cabina1 ${selectedId === cabina1?.id ? "is-selected" : ""}`}
          type="button"
          disabled={!cabina1}
          onClick={() => cabina1 && onSelect(cabina1)}
        >
          {cabina1 ? cabina1.nombre : "Cabina 1 (no disponible)"}
        </button>

        {/* Cabina 2 */}
        <button
          className={`space-card personal area-cabina2 ${selectedId === cabina2?.id ? "is-selected" : ""}`}
          type="button"
          disabled={!cabina2}
          onClick={() => cabina2 && onSelect(cabina2)}
        >
          {cabina2 ? cabina2.nombre : "Cabina 2 (no disponible)"}
        </button>

        {/* Sala 2 */}
        <button
          className={`space-card grupos area-sala2 ${selectedId === sala2?.id ? "is-selected" : ""}`}
          type="button"
          disabled={!sala2}
          onClick={() => sala2 && onSelect(sala2)}
        >
          {sala2 ? sala2.nombre : "Sala 2 (no disponible)"}
        </button>
      </div>

      <div className="legend" aria-label="Leyenda">
        <span className="legend-pill"><span className="dot dot-personal" />Personal</span>
        <span className="legend-pill"><span className="dot dot-grupos" />Grupos</span>
      </div>
    </>
  );
}
