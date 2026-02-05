import { useEffect, useMemo, useState } from "react";
import "../styles/coworkingReservas.css";

import { api, coworkingApi } from "../api/apiClient";
import { useApi } from "../hooks/useApi";

import { groupSpaces } from "../components/coworking/spaceUtils";
import FloorPlan from "../components/coworking/FloorPlan";
import WeeklyCalendar from "../components/coworking/WeeklyCalendar";
import ReserveModal from "../components/coworking/ReserveModal";

/* Helpers para construir ISO (demo) */
function isoFromWeek(inicioSemana, dayIndex, hhmm) {
  const [y, m, d] = inicioSemana.split("-").map(Number);
  const [hh, mm] = hhmm.split(":").map(Number);
  const base = new Date(Date.UTC(y, m - 1, d, hh, mm, 0));
  base.setUTCDate(base.getUTCDate() + dayIndex);
  return base.toISOString();
}

function addOneHourISO(iso) {
  const dt = new Date(iso);
  dt.setUTCHours(dt.getUTCHours() + 1);
  return dt.toISOString();
}

export default function CoworkingReservas() {
  // 1) Traemos los espacios reales del API
  const spacesReq = useApi(
  () => api.get("/coworkingnew/spaces", { params: { detalle: 1 } }),
  []
);

  const spaces = Array.isArray(spacesReq.data) ? spacesReq.data : [];

  const grouped = useMemo(() => groupSpaces(spaces), [spaces]);

  // 2) Espacio seleccionado
  const [selected, setSelected] = useState(null);

  // 3) Agenda del espacio seleccionado (se pide al endpoint agenda-semanal)
  const agendaReq = useApi(
    () =>
      selected
        ? coworkingApi.get(`/coworkingnew/spaces/${selected.id}/agenda-semanal`, {
            params: { inicioSemana: "2025-12-01" },
          })
        : Promise.resolve({ data: null }),
    [selected?.id]
  );

  // 4) Copia editable de agenda (para marcar ocupado en el front tras reservar)
  const [agendaData, setAgendaData] = useState(null);
  useEffect(() => {
    setAgendaData(agendaReq.data || null);
  }, [agendaReq.data]);

  // 5) Modal + slot seleccionado
  const [modalOpen, setModalOpen] = useState(false);
  const [pickedSlot, setPickedSlot] = useState(null); // {diaIndex, dia, hora}

  // Selección inicial: primera mesa si existe
  useEffect(() => {
    if (!selected && grouped.mesas.length > 0) setSelected(grouped.mesas[0]);
  }, [selected, grouped.mesas]);

  function onPickSlot(slot) {
    setPickedSlot(slot);
    setModalOpen(true);
  }

  async function confirmReservation(form) {
    if (!selected || !agendaData || !pickedSlot) return;

    const inicioSemana = agendaData.inicioSemana || "2025-12-01";
    const desdeISO = isoFromWeek(inicioSemana, pickedSlot.diaIndex, pickedSlot.hora);
    const hastaISO = addOneHourISO(desdeISO);

    // POST real (demo)
    const body = {
      idUsuario: 1,
      idEspacio: selected.id,
      desde: desdeISO,
      hasta: hastaISO,
      nombreCompleto: form.fullName,
      correo: form.email,
      telefono: form.phone,
    };

    try {
      await api.post("/coworkingnew/reservations", body);

      // Marcamos el slot como ocupado en UI
      setAgendaData((prev) => {
        if (!prev?.slots?.[pickedSlot.hora]) return prev;
        const next = structuredClone(prev);
        next.slots[pickedSlot.hora][pickedSlot.diaIndex] = "ocupado";
        return next;
      });

      setModalOpen(false);
      alert("Reserva creada (demo).");
    } catch {
      alert("No se pudo crear la reserva (mock).");
    }
  }

  // Horario “bonito”: lo sacamos del JSON (primera hora - última hora)
  const horario = useMemo(() => {
    if (!agendaData?.franjas?.length) return "—";
    const first = agendaData.franjas[0]?.horas?.[0] || "—";
    const lastFr = agendaData.franjas[agendaData.franjas.length - 1];
    const lastHour = lastFr?.horas?.[lastFr.horas.length - 1] || "—";
    return `${first}–${lastHour}`;
  }, [agendaData]);

  return (
    <div className="nexus-page reservas-page">
      <div className="reservas-wrap">
        {/* Panel izquierdo */}
        <aside className="panel">
          <h2 className="panel-title">Plano del Espacio (API)</h2>

          {spacesReq.loading && <p>Cargando espacios…</p>}
          {spacesReq.error && <p style={{ color: "crimson" }}>Error cargando espacios.</p>}

          {!spacesReq.loading && (
            <FloorPlan
              grouped={grouped}
              selectedId={selected?.id}
              onSelect={(s) => setSelected(s)}
            />
          )}
        </aside>

        {/* Panel derecho */}
        <section className="panel">
          <h2 className="panel-title">
            Calendario Semanal — <span style={{ opacity: 0.75 }}>{selected ? selected.nombre : "—"}</span>
          </h2>

          {/* Ficha flotante */}
          {selected && (
            <section className="space-info">
              <div className="space-info-row">
                <p><strong>Capacidad:</strong> {selected.capacidad}</p>
                <p><strong>Horario:</strong> {horario}</p>
                <p><strong>Estado:</strong> {selected.ocupado ? "Ocupado" : "Libre"}</p>
              </div>

              <div className="space-info-actions">
                <span style={{ opacity: 0.8 }}>Elige una hora libre en el calendario.</span>
              </div>
            </section>
          )}

          {selected && agendaReq.loading && <p>Cargando agenda…</p>}
          {selected && agendaReq.error && <p style={{ color: "crimson" }}>Error cargando agenda.</p>}

          {agendaData && (
            <WeeklyCalendar agenda={agendaData} onPickSlot={onPickSlot} />
          )}
        </section>
      </div>

      {/* Modal */}
      <ReserveModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={confirmReservation}
        summary={
          selected && pickedSlot
            ? `${selected.nombre} · ${pickedSlot.dia} · ${pickedSlot.hora}`
            : "—"
        }
      />
    </div>
  );
}
