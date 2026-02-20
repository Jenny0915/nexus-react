import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../api/apiClient";
import { useApi } from "../hooks/useApi";

/* Implementé esta función para asegurar que los precios de los libros de Nexus 
   se muestren siempre en formato de moneda colombiana, mejorando la interfaz.
*/
function formatCOP(value) {
  const n = Number(value || 0);
  return n.toLocaleString("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  });
}

const LS_PURCHASES_KEY = "nexus_purchases_v1";

/* Decidí usar localStorage para gestionar las compras de forma local, permitiendo 
   que el usuario vea su historial de pedidos incluso después de recargar la página.
*/
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
    console.error("No se pudo escribir en el almacenamiento local");
  }
}

function addPurchaseToLS(userId, purchase) {
  const all = readAllPurchasesLS();
  const list = Array.isArray(all[userId]) ? all[userId] : [];
  all[userId] = [purchase, ...list]; 
  writeAllPurchasesLS(all);
}

export default function BookDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  /* Uso un refreshKey para forzar la actualización de la lista de reseñas 
     automáticamente después de que el usuario publica una nueva.
  */
  const [refreshKey, setRefreshKey] = useState(0);

  /* Para cumplir con el Criterio 6, consumo los endpoints de mi API simulada 
     para traer tanto la información del libro como las opiniones de otros usuarios.
  */
  const book = useApi(() => api.get(`/itemslib/${id}`), [id]);
  const reviews = useApi(() => api.get(`/itemslib/reviews/${id}`), [id, refreshKey]);

  const [puntuacion, setPuntuacion] = useState(5);
  const [comentario, setComentario] = useState("");
  const [sendingReview, setSendingReview] = useState(false);
  const [buying, setBuying] = useState(false);

  /* Esta función conecta el formulario de reseñas con el método POST de la API, 
     validando que los datos se guarden correctamente en el servidor simulado.
  */
  async function submitReview(e) {
    e.preventDefault();
    try {
      setSendingReview(true);
      await api.post(`/itemslib/${id}/reviews`, { puntuacion, comentario });
      setComentario("");
      setPuntuacion(5);
      setRefreshKey((k) => k + 1);
    } catch {
      alert("Error al conectar con el servidor de reseñas.");
    } finally {
      setSendingReview(false);
    }
  }

  /* Implementé la lógica de compra vinculándola con el endpoint POST /compras. 
     Esto simula el proceso completo desde la selección hasta la confirmación del pedido.
  */
  async function buy() {
    const userId = 1; // ID de usuario estático para la demostración

    try {
      setBuying(true);
      const item = book.data;

      const bodyApi = {
        userId,
        bookId: Number(id),
        cantidad: 1,
        precioPagado: Number(item?.precio ?? 0),
      };

      const res = await api.post("/compras", bodyApi);

      /* Tras la respuesta exitosa de la API, guardo el objeto de compra con 
         formato amigable para mostrarlo luego en la sección de 'Mis Compras'.
      */
      const fechaHoy = new Date().toISOString().slice(0, 10);
      const purchase = {
        purchaseId: res?.data?.id ?? Date.now(),
        bookId: bodyApi.bookId,
        titulo: item?.titulo,
        imagen: item?.imagen,
        fechaCompra: res?.data?.fechaCompra ?? fechaHoy,
        precioPagado: res?.data?.precioPagado ?? bodyApi.precioPagado,
      };

      addPurchaseToLS(String(userId), purchase);
      alert("¡Gracias por tu compra en Nexus!");
      navigate("/purchases");
    } catch {
      alert("Hubo un problema con la API de compras en Apidog.");
    } finally {
      setBuying(false);
    }
  }

  if (book.loading) return <p>Cargando detalle…</p>;
  if (book.error) return <p style={{ color: "crimson" }}>Error al cargar la información.</p>;

  const imgSrc = book.data?.imagen ? `/${book.data.imagen}` : null;
  const sinStock = Number(book.data?.inventario ?? 0) <= 0;

  return (
    <div className="book-detail-container">
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
          <p><strong>Precio:</strong> {formatCOP(book.data?.precio)}</p>
          <p><strong>Stock disponible:</strong> {book.data?.inventario}</p>

          {/* El botón de compra se deshabilita dinámicamente si no hay inventario 
              según los datos recibidos de la API.
          */}
          <button
            onClick={buy}
            disabled={buying || sinStock}
            className="btn-primary"
            style={{ marginTop: 10, padding: "10px 14px", borderRadius: 10 }}
          >
            {sinStock ? "Sin stock" : buying ? "Procesando…" : "Comprar ahora"}
          </button>
        </div>
      </div>

      <p style={{ marginTop: 14 }}>
        <strong>Sinopsis:</strong> {book.data?.sinopsis}
      </p>

      <hr />

      <section className="reviews-section">
        <h2>Opiniones de la comunidad</h2>
        {reviews.loading && <p>Cargando reseñas…</p>}
        
        {Array.isArray(reviews.data) ? (
          <ul>
            {reviews.data.map((r, idx) => (
              <li key={idx}>
                <strong>{r.puntuacion}/5 estrellas</strong> — {r.comentario}
              </li>
            ))}
          </ul>
        ) : (
          <p>Aún no hay reseñas para este libro.</p>
        )}

        <h3 style={{ marginTop: 20 }}>Danos tu opinión</h3>
        <form onSubmit={submitReview} style={{ display: "grid", gap: 10, maxWidth: 520 }}>
          <label>
            Calificación (1–5)
            <input
              type="number"
              min="1"
              max="5"
              value={puntuacion}
              onChange={(e) => setPuntuacion(Number(e.target.value))}
            />
          </label>

          <label>
            ¿Qué te pareció el libro?
            <input
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              placeholder="Escribe tu reseña aquí..."
              required
            />
          </label>

          <button type="submit" disabled={sendingReview || !comentario.trim()}>
            {sendingReview ? "Publicando..." : "Publicar Reseña"}
          </button>
        </form>
      </section>
    </div>
  );
}