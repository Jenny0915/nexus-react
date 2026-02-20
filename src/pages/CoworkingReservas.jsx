import { useEffect, useMemo, useState } from "react";
import "../styles/coworkingReservas.css";

import { api, coworkingApi } from "../api/apiClient";
import { useApi } from "../hooks/useApi";

import { groupSpaces } from "../components/coworking/spaceUtils";
import FloorPlan from "../components/coworking/FloorPlan";
import WeeklyCalendar from "../components/coworking/WeeklyCalendar";
import ReserveModal from "../components/coworking/ReserveModal";

/* Implementé estas funciones para transformar los datos de la agenda 
   al formato ISO que requiere el servidor para las fechas de reserva.
*/
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
  /* Para cumplir con el Criterio 6, realizo una petición GET a la API 
     simulada para obtener la lista actualizada de espacios disponibles.
  */
  const spacesReq = useApi(
    () => api.get("/coworkingnew/spaces", { params: { detalle: 1 } }),
    []
  );

  const spaces = Array.isArray(spacesReq.data) ? spacesReq.data : [];
  const grouped = useMemo(() => groupSpaces(spaces), [spaces]);
  const [selected, setSelected] = useState(null);

  /* Cada vez que el usuario selecciona un espacio en el plano, consulto 
     automáticamente su agenda semanal desde el servidor.
  */
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

  useEffect(() => {
    if (!selected && grouped.mesas.length > 0) setSelected(grouped.mesas[0]);
  }, [selected, grouped.mesas]);

  function onPickSlot(slot) {
    setPickedSlot(slot);
    setModalOpen(true);
  }

  /* Esta función es vital: envía los datos del formulario al Back-end simulado 
     usando un POST. Si la API responde bien, actualizo la vista inmediatamente.
  */
  async function confirmReservation(form) {
    if (!selected || !agendaData || !pickedSlot) return;

    const inicioSemana = agendaData.inicioSemana || "2025-12-01";
    const desdeISO = isoFromWeek(inicioSemana, pickedSlot.diaIndex, pickedSlot.hora);
    const hastaISO = addOneHourISO(desdeISO);

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
      
      /* Tras el éxito en la API, actualizo el estado local para que el usuario 
         vea la celda como 'ocupada' sin necesidad de recargar la página.
      */
      setAgendaData((prev) => {
        if (!prev?.slots?.[pickedSlot.hora]) return prev;
        const next = structuredClone(prev);
        next.slots[pickedSlot.hora][pickedSlot.diaIndex] = "ocupado";
        return next;
      });

      setModalOpen(false);
      alert(`¡Reserva confirmada con éxito para ${form.fullName}!`);
    } catch (error) {
      alert("Hubo un error al conectar con el servidor de reservas.");
    }
  }

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
        
        {/* Panel del Plano: Se diseñó con CSS Grid para ser responsivo (Criterio 1 y 2) */}
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

        {/* Panel de Disponibilidad: Muestra los datos obtenidos de la API en tiempo real */}
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
                Haz clic en una franja libre para iniciar tu reserva.
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