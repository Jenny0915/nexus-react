import { useEffect, useMemo, useState } from "react";
import "../styles/coworkingReservas.css";

import { api, coworkingApi } from "../api/apiClient";
import { useApi } from "../hooks/useApi";

import { groupSpaces } from "../components/coworking/spaceUtils";
import FloorPlan from "../components/coworking/FloorPlan";
import WeeklyCalendar from "../components/coworking/WeeklyCalendar";
import ReserveModal from "../components/coworking/ReserveModal";

// Funciones auxiliares para fechas
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
  // Criterio 6: Petición GET a la API simulada para obtener espacios
  const spacesReq = useApi(
    () => api.get("/coworkingnew/spaces", { params: { detalle: 1 } }),
    []
  );

  const spaces = Array.isArray(spacesReq.data) ? spacesReq.data : [];
  const grouped = useMemo(() => groupSpaces(spaces), [spaces]);
  const [selected, setSelected] = useState(null);

  // Petición a la API simulada para obtener la agenda del espacio seleccionado
  const agendaReq = useApi(
    () => selected
      ? coworkingApi.get(`/coworkingnew/spaces/${selected.id}/agenda-semanal`, {
          params: { inicioSemana: "2025-12-01" },
        })
      : Promise.resolve({ data: null }),
    [selected?.id]
  );

  const [agendaData, setAgendaData] = useState(null);
  useEffect(() => {
    setAgendaData(agendaReq.data || null);
  }, [agendaReq.data]);

  const [modalOpen, setModalOpen] = useState(false);
  const [pickedSlot, setPickedSlot] = useState(null);

  // Selección inicial por defecto (Mesas)
  useEffect(() => {
    if (!selected && grouped.mesas.length > 0) setSelected(grouped.mesas[0]);
  }, [selected, grouped.mesas]);

  function onPickSlot(slot) {
    setPickedSlot(slot);
    setModalOpen(true);
  }

  // Criterio 6: Petición POST a la API simulada para CREAR la reserva
  async function confirmReservation(form) {
    if (!selected || !agendaData || !pickedSlot) return;

    const inicioSemana = agendaData.inicioSemana || "2025-12-01";
    const desdeISO = isoFromWeek(inicioSemana, pickedSlot.diaIndex, pickedSlot.hora);
    const hastaISO = addOneHourISO(desdeISO);

    // Estructura de datos que se envía al servidor (Back-end simulado)
    const body = {
      idUsuario: 1,
      idEspacio: selected.id,
      desde: desdeISO,
      hasta: hastaISO,
      nombreCompleto: form.fullName, // Viene del input del modal
      correo: form.email,          // Viene del input del modal
      telefono: form.phone,        // Viene del input del modal
    };

    try {
      // LLAMADA A LA API
      await api.post("/coworkingnew/reservations", body);
      
      // Si el servidor responde OK, actualizamos la vista localmente (Optimistic UI)
      setAgendaData((prev) => {
        if (!prev?.slots?.[pickedSlot.hora]) return prev;
        const next = structuredClone(prev);
        next.slots[pickedSlot.hora][pickedSlot.diaIndex] = "ocupado";
        return next;
      });

      setModalOpen(false);
      alert(`¡Reserva confirmada con éxito para ${form.fullName}!`);
    } catch (error) {
      console.error("Error al guardar en la API:", error);
      alert("No se pudo conectar con el servidor para crear la reserva.");
    }
  }

  // Cálculo del rango horario para mostrar en la info
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
        
        {/* PANEL IZQUIERDO: PLANO (Criterio 1 y 2: Responsivo) */}
        <aside className="panel">
          <h2 className="panel-title">Plano del Espacio</h2>
          {spacesReq.loading && <p>Cargando espacios...</p>}
          <div className="floor-plan-container">
            {!spacesReq.loading && (
              <FloorPlan
                grouped={grouped}
                selectedId={selected?.id}
                onSelect={(s) => setSelected(s)}
              />
            )}
          </div>
        </aside>

        {/* PANEL DERECHO: CALENDARIO (Operatividad) */}
        <section className="panel">
          <h2 className="panel-title">
            Disponibilidad — <span style={{ color: 'var(--personal)' }}>{selected ? selected.nombre : "—"}</span>
          </h2>

          {selected && (
            <div className="space-info">
              <div className="space-info-row">
                <p><strong>Capacidad:</strong> {selected.capacidad} personas</p>
                <p><strong>Horario:</strong> {horario}</p>
              </div>
              <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.8 }}>
                Selecciona una franja verde para realizar tu reserva.
              </p>
            </div>
          )}

          {selected && agendaReq.loading && <p>Actualizando disponibilidad...</p>}
          
          <div className="calendar-board">
            {agendaData && (
              <WeeklyCalendar agenda={agendaData} onPickSlot={onPickSlot} />
            )}
          </div>
        </section>
      </div>

      {/* MODAL DE RESERVA (Conectado a confirmReservation) */}
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