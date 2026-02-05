export function normalizeSpace(space) {
  const nombre = (space.nombre || "").trim();
  const prefix = (nombre.split(" ")[0] || "").toLowerCase();

  const match = nombre.match(/(\d+)/);
  const order = match ? Number(match[1]) : 999;

  let kind = "otro";
  if (prefix === "mesa") kind = "mesa";
  else if (prefix === "sala") kind = "sala";
  else if (prefix === "cabina") kind = "cabina";

  return { ...space, kind, order };
}

export function groupSpaces(spaces = []) {
  const grouped = { mesas: [], salas: [], cabinas: [], otros: [] };

  spaces.map(normalizeSpace).forEach((s) => {
    if (s.kind === "mesa") grouped.mesas.push(s);
    else if (s.kind === "sala") grouped.salas.push(s);
    else if (s.kind === "cabina") grouped.cabinas.push(s);
    else grouped.otros.push(s);
  });

  grouped.mesas.sort((a, b) => a.order - b.order);
  grouped.salas.sort((a, b) => a.order - b.order);
  grouped.cabinas.sort((a, b) => a.order - b.order);

  return grouped;
}

export function shortMesaLabel(nombre) {
  // "Mesa 01 - Ventana" -> "M01"
  const match = nombre.match(/Mesa\s+(\d+)/i);
  return match ? `M${match[1].padStart(2, "0")}` : "M";
}
