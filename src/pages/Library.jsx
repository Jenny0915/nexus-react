// src/pages/Library.jsx
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "../styles/library.css";
import { api } from "../api/apiClient";
import { useApi } from "../hooks/useApi";

export default function Library() {
  const itemsReq = useApi(() => api.get("/itemslib"), []);
  const items = Array.isArray(itemsReq.data) ? itemsReq.data : [];

  const [categoria, setCategoria] = useState("Todas");
  const [anio, setAnio] = useState("Todos");
  const [tipo, setTipo] = useState("Todos");
  const [q, setQ] = useState("");
  const [onlyMasVendido, setOnlyMasVendido] = useState(false);

  const categorias = useMemo(() => {
    const set = new Set(items.map((i) => i.categoria).filter(Boolean));
    return ["Todas", ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [items]);

  const anios = useMemo(() => {
    const set = new Set(items.map((i) => i["año"]).filter(Boolean));
    const arr = Array.from(set).sort((a, b) => b - a);
    return ["Todos", ...arr];
  }, [items]);

  const tipos = ["Todos", "libro", "revista"];

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return items.filter((i) => {
      if (categoria !== "Todas" && i.categoria !== categoria) return false;
      if (anio !== "Todos" && String(i["año"]) !== String(anio)) return false;
      if (tipo !== "Todos" && i.tipo !== tipo) return false;
      if (onlyMasVendido && !i.masVendido) return false;
      if (qq) {
        const t = (i.titulo || "").toLowerCase();
        const a = (i.autor || "").toLowerCase();
        if (!t.includes(qq) && !a.includes(qq)) return false;
      }
      return true;
    });
  }, [items, categoria, anio, tipo, q, onlyMasVendido]);

  return (
    <div className="library-page">
      <aside className="library-sidebar">
        <h2>Filtros</h2>

        <div className="lib-search">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar título o autor..."
          />
        </div>

        <div className="lib-section">
          <label>Publicación (Año)</label>
          <select value={anio} onChange={(e) => setAnio(e.target.value)}>
            {anios.map((y) => (
              <option key={String(y)} value={y}>{y}</option>
            ))}
          </select>
        </div>

        <div className="lib-section">
          <label>Tipo de Recurso</label>
          <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
            {tipos.map((t) => (
              <option key={t} value={t}>{t === "libro" ? "Libro" : t === "revista" ? "Revista" : "Todos"}</option>
            ))}
          </select>
        </div>

        <div className="lib-section">
          <label className="lib-check">
            <input
              type="checkbox"
              checked={onlyMasVendido}
              onChange={(e) => setOnlyMasVendido(e.target.checked)}
            />
            Solo Destacados
          </label>
        </div>

        <div className="lib-section">
          <button
            className="lib-clear"
            onClick={() => {
              setCategoria("Todas");
              setAnio("Todos");
              setTipo("Todos");
              setQ("");
              setOnlyMasVendido(false);
            }}
          >
            Limpiar filtros
          </button>
        </div>

        <hr style={{ margin: '20px 0', opacity: 0.1 }} />
        
        <label style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--nexus-muted)', textTransform: 'uppercase' }}>
          Categorías
        </label>
        <ul className="lib-cats">
          {categorias.map((c) => (
            <li key={c}>
              <button
                type="button"
                className={c === categoria ? "active" : ""}
                onClick={() => setCategoria(c)}
              >
                {c}
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <section className="library-content">
        <h1>Explorar Catálogo</h1>

        {itemsReq.loading && <div className="loading-state">Cargando catálogo de Nexus...</div>}
        
        {itemsReq.error && (
          <div className="error-state">No pudimos cargar los libros. Revisa tu conexión.</div>
        )}

        {!itemsReq.loading && (
          <p className="results-count">
            Resultados: <strong>{filtered.length}</strong> recursos encontrados
          </p>
        )}

        <ul className="lib-grid">
          {filtered.map((item) => (
            <li key={item.id} className="lib-card">
              <div>
                <div className="lib-card-title">
                  <Link to={`/library/${item.id}`}>{item.titulo}</Link>
                </div>

                <div className="lib-meta">
                  <strong>{item.autor}</strong><br />
                  {item.categoria} • {item["año"]}
                </div>
              </div>

              <div>
                <div className="lib-price">
                  ${Number(item.precio || 0).toLocaleString("es-CO")}
                </div>
                {/* Botón añadido para mejor UX */}
                <Link to={`/library/${item.id}`} className="lib-clear" style={{ display: 'block', textAlign: 'center', textDecoration: 'none', marginTop: '10px', background: 'var(--nexus-blue)', color: 'white' }}>
                  Ver Detalle
                </Link>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}