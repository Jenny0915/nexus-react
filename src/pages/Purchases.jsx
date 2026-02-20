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

function readPurchasesFromLS(userId) {
  try {
    const raw = localStorage.getItem(LS_PURCHASES_KEY);
    const all = raw ? JSON.parse(raw) : {};
    return Array.isArray(all[String(userId)]) ? all[String(userId)] : [];
  } catch {
    return [];
  }
}

function normalizeApiPurchases(data) {
  // soporta: { userId, compras: [...] } o directamente [...]
  const compras = Array.isArray(data)
    ? data
    : Array.isArray(data?.compras)
    ? data.compras
    : [];
  return compras;
}

function mergeUniqueById(apiList, lsList) {
  const seen = new Set();
  const out = [];

  const getId = (x) => x?.purchaseId ?? x?.purchaseID ?? x?.id ?? null;

  // primero LS (lo recién comprado arriba), luego API
  for (const item of [...lsList, ...apiList]) {
    const id = getId(item);
    const key = id != null ? String(id) : JSON.stringify(item);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }

  return out;
}

export default function Purchases() {
  const userId = 1;

  // ✅ aquí uso mi expectativa: /compras?detalle=1 (y se pasa userId también)
  const { data, loading, error } = useApi(
    () => api.get("/compras", { params: { detalle: 1, userId } }),
    [userId]
  );

  if (loading) return <p>Cargando compras…</p>;
  if (error) return <p style={{ color: "crimson" }}>Error cargando compras.</p>;

  const apiCompras = normalizeApiPurchases(data);
  const lsCompras = readPurchasesFromLS(userId);

  const compras = mergeUniqueById(apiCompras, lsCompras);

  return (
    <div>
      <h1>Compras</h1>
      <p>Historial de compras del usuario (mock + localStorage).</p>

      {compras.length === 0 ? (
        <p style={{ opacity: 0.75 }}>Aún no hay compras registradas.</p>
      ) : (
        <div style={{ display: "grid", gap: 12, maxWidth: 760 }}>
          {compras.map((c, idx) => {
            const imgSrc = c?.imagen ? `/${c.imagen}` : null;
            return (
              <div
                key={c.purchaseId ?? c.purchaseID ?? c.id ?? idx}
                style={{
                  border: "1px solid #e8edf5",
                  borderRadius: 14,
                  padding: 12,
                  display: "flex",
                  gap: 14,
                  alignItems: "center",
                }}
              >
                {imgSrc && (
                  <img
                    src={imgSrc}
                    alt={c.titulo}
                    style={{
                      width: 60,
                      height: 80,
                      objectFit: "cover",
                      borderRadius: 10,
                      border: "1px solid #e8edf5",
                    }}
                  />
                )}

                <div style={{ flex: 1 }}>
                  <strong style={{ fontSize: 16 }}>{c.titulo || "Item"}</strong>
                  <div style={{ opacity: 0.8, marginTop: 4 }}>
                    Fecha: {c.fechaCompra || "—"} · Pagado:{" "}
                    {formatCOP(c.precioPagado)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
    