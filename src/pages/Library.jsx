import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "../styles/library.css";
import { api } from "../api/apiClient";
import { useApi } from "../hooks/useApi";

export default function Library() {
  // 1) Traemos TODO una vez
  const itemsReq = useApi(() => api.get("/itemslib"), []);
  const items = Array.isArray(itemsReq.data) ? itemsReq.data : [];

  // 2) Estados UI (sidebar/filtros)
  const [categoria, setCategoria] = useState("Todas");
  const [anio, setAnio] = useState("Todos");
  const [tipo, setTipo] = useState("Todos"); // libro | revista
  const [q, setQ] = useState("");
  const [onlyMasVendido, setOnlyMasVendido] = useState(false);

  // 3) Opciones del sidebar (salen del API)
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

  // 4) Filtrado en front (cumple sidebar + filtros)
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
        <h2>Categorías</h2>

        <div className="lib-search">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por título o autor…"
          />
        </div>

        <div className="lib-section">
          <label>Año</label>
          <select value={anio} onChange={(e) => setAnio(e.target.value)}>
            {anios.map((y) => (
              <option key={String(y)} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        <div className="lib-section">
          <label>Tipo</label>
          <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
            {tipos.map((t) => (
              <option key={t} value={t}>
                {t === "Todos" ? "Todos" : t}
              </option>
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
            Solo “más vendidos”
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

        <hr />

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
        <h1>Librería</h1>

        {itemsReq.loading && <p>Cargando items…</p>}
        {itemsReq.error && (
          <p style={{ color: "crimson" }}>Error cargando items.</p>
        )}

        {!itemsReq.loading && (
          <p style={{ opacity: 0.75, marginTop: 6 }}>
            Mostrando {filtered.length} de {items.length}
          </p>
        )}

        <ul className="lib-grid">
          {filtered.map((item) => (
            <li key={item.id} className="lib-card">
              <div className="lib-card-title">
                <Link to={`/library/${item.id}`}>{item.titulo}</Link>
              </div>

              <div className="lib-meta">
                {item.autor} · {item.categoria} · {item["año"]} · {item.tipo}
              </div>

              <div className="lib-price">
                ${Number(item.precio || 0).toLocaleString("es-CO")}
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
