import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../api/apiClient";
import { useApi } from "../hooks/useApi";

function formatCOP(value) {
  const n = Number(value || 0);
  return n.toLocaleString("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  });
}

const LS_PURCHASES_KEY = "nexus_purchases_v1";

function readAllPurchasesLS() {
  try {
    const raw = localStorage.getItem(LS_PURCHASES_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeAllPurchasesLS(obj) {
  try {
    localStorage.setItem(LS_PURCHASES_KEY, JSON.stringify(obj));
  } catch {
    // ignore
  }
}

function addPurchaseToLS(userId, purchase) {
  const all = readAllPurchasesLS();
  const list = Array.isArray(all[userId]) ? all[userId] : [];
  all[userId] = [purchase, ...list]; // lo más nuevo arriba
  writeAllPurchasesLS(all);
}

export default function BookDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  // refrescar reseñas
  const [refreshKey, setRefreshKey] = useState(0);

  const book = useApi(() => api.get(`/itemslib/${id}`), [id]);
  const reviews = useApi(() => api.get(`/itemslib/reviews/${id}`), [id, refreshKey]);

  // publicar reseña
  const [puntuacion, setPuntuacion] = useState(5);
  const [comentario, setComentario] = useState("");
  const [sendingReview, setSendingReview] = useState(false);

  // comprar
  const [buying, setBuying] = useState(false);

  async function submitReview(e) {
    e.preventDefault();
    try {
      setSendingReview(true);
      await api.post(`/itemslib/${id}/reviews`, { puntuacion, comentario });
      setComentario("");
      setPuntuacion(5);
      setRefreshKey((k) => k + 1);
    } catch {
      alert("No se pudo enviar la reseña (mock).");
    } finally {
      setSendingReview(false);
    }
  }

  async function buy() {
    const userId = 1;

    try {
      setBuying(true);

      const item = book.data;

      // ✅ 1) Body del contrato del POST /compras (Apidog)
      const bodyApi = {
        userId,
        bookId: Number(id),
        cantidad: 1,
        precioPagado: Number(item?.precio ?? 0),
      };

      // POST al mock
      const res = await api.post("/compras", bodyApi);

      // ✅ 2) Para el FRONT (localStorage) se guarda lo "bonito"
      const fechaHoy = new Date().toISOString().slice(0, 10);

      const purchase = {
        purchaseId:
          res?.data?.purchaseId ??
          res?.data?.purchaseID ??
          res?.data?.id ??
          Date.now(),
        bookId: bodyApi.bookId,
        titulo: item?.titulo,
        imagen: item?.imagen,
        fechaCompra: res?.data?.fechaCompra ?? fechaHoy,
        precioPagado: res?.data?.precioPagado ?? bodyApi.precioPagado,
      };

      // Persistencia local (para que aparezca en /purchases)
      addPurchaseToLS(String(userId), purchase);

      alert("Compra realizada (demo).");
      navigate("/purchases");
    } catch {
      alert("No se pudo comprar (mock). Revisa tu endpoint POST /compras en Apidog.");
    } finally {
      setBuying(false);
    }
  }

  if (book.loading) return <p>Cargando detalle…</p>;
  if (book.error) return <p style={{ color: "crimson" }}>Error cargando detalle.</p>;

  const imgSrc = book.data?.imagen ? `/${book.data.imagen}` : null;
  const sinStock = Number(book.data?.inventario ?? 0) <= 0;

  return (
    <div>
      <h1>{book.data?.titulo}</h1>

      <div style={{ display: "flex", gap: 18, alignItems: "flex-start", flexWrap: "wrap" }}>
        {imgSrc && (
          <img
            src={imgSrc}
            alt={book.data?.titulo}
            style={{
              width: 160,
              height: 220,
              objectFit: "cover",
              borderRadius: 12,
              border: "1px solid #e8edf5",
            }}
          />
        )}

        <div style={{ minWidth: 280 }}>
          <p><strong>Autor:</strong> {book.data?.autor}</p>
          <p><strong>Categoría:</strong> {book.data?.categoria}</p>
          <p><strong>Editorial:</strong> {book.data?.editorial}</p>
          <p><strong>Año:</strong> {book.data?.año}</p>
          <p><strong>Tipo:</strong> {book.data?.tipo}</p>
          <p><strong>Precio:</strong> {formatCOP(book.data?.precio)}</p>
          <p><strong>Inventario:</strong> {book.data?.inventario}</p>

          <button
            onClick={buy}
            disabled={buying || sinStock}
            style={{ marginTop: 10, padding: "10px 14px", borderRadius: 10 }}
          >
            {sinStock ? "Sin stock" : buying ? "Comprando…" : "Comprar"}
          </button>
        </div>
      </div>

      <p style={{ marginTop: 14 }}>
        <strong>Sinopsis:</strong> {book.data?.sinopsis}
      </p>

      <hr />

      <h2>Reseñas</h2>
      {reviews.loading && <p>Cargando reseñas…</p>}
      {reviews.error && <p style={{ color: "crimson" }}>Error cargando reseñas.</p>}

      {Array.isArray(reviews.data) ? (
        <ul>
          {reviews.data.map((r, idx) => (
            <li key={idx}>
              <strong>{r.puntuacion}/5</strong> — {r.comentario}
            </li>
          ))}
        </ul>
      ) : (
        <pre style={{ background: "#f6f7fb", padding: 10, borderRadius: 8 }}>
          {JSON.stringify(reviews.data, null, 2)}
        </pre>
      )}

      <h3>Publicar reseña</h3>
      <form onSubmit={submitReview} style={{ display: "grid", gap: 10, maxWidth: 520 }}>
        <label>
          Puntuación (1–5)
          <input
            type="number"
            min="1"
            max="5"
            value={puntuacion}
            onChange={(e) => setPuntuacion(Number(e.target.value))}
          />
        </label>

        <label>
          Comentario
          <input
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            placeholder="Escribe tu reseña..."
          />
        </label>

        <button type="submit" disabled={sendingReview || !comentario.trim()}>
          {sendingReview ? "Enviando..." : "Enviar reseña"}
        </button>
      </form>
    </div>
  );
}
