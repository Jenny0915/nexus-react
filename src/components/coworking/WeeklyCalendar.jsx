import React from 'react';

/* Como parte de la Actividad 3, desarrollé este calendario semanal para gestionar 
   visualmente las reservas del espacio de co-working de Nexus. */
export default function WeeklyCalendar({ agenda, onPickSlot }) {
  
  /* Implementé esta validación para asegurar que la aplicación no falle mientras 
     se obtienen los datos de disponibilidad desde la API simulada. */
  if (!agenda || !agenda.franjas) return <p>Cargando disponibilidad...</p>;

  const dias = agenda.dias || ["LUN", "MAR", "MIE", "JUE", "VIE", "SAB", "DOM"];
  const franjas = agenda.franjas;
  const slots = agenda.slots || {};

  return (
    <div className="calendar-container-main">
      <div className="days-row" aria-label="Días de la semana">
        {dias.map((d) => (
          <span key={d} className="day-pill">{d}</span>
        ))}
      </div>

      <div className="calendar-board" aria-label="Calendario">
        <div className="calendar-grid">
          {franjas.map((fr) => (
            <PeriodBlock
              key={fr.nombre}
              franja={fr}
              dias={dias}
              slots={slots}
              onPickSlot={onPickSlot}
            />
          ))}
        </div>
      </div>

      {/* Agregué esta leyenda para cumplir con el requisito de indicar qué espacios 
          están ocupados y cuáles están libres según la información del servidor.*/}
      <div className="legend" aria-label="Leyenda calendario">
        <span className="legend-pill"><span className="dot dot-libre" />Libre</span>
        <span className="legend-pill"><span className="dot dot-ocupado" />Ocupado</span>
      </div>
    </div>
  );
}

function PeriodBlock({ franja, dias, slots, onPickSlot }) {
  return (
    <React.Fragment>
      <div className="period-bar">{franja.nombre}</div>
      {franja.horas.map((hora) => (
        <Row
          key={`${franja.nombre}-${hora}`}
          hora={hora}
          dias={dias}
          slots={slots}
          onPickSlot={onPickSlot}
        />
      ))}
    </React.Fragment>
  );
}

function Row({ hora, dias, slots, onPickSlot }) {
  /* La lógica de disponibilidad se basa en los datos recibidos de nuestra API propia, 
     rellenando con 'no_disponible' si el servidor no devuelve datos para esa hora. */
  const estados = Array.isArray(slots[hora]) ? slots[hora] : Array(7).fill("no_disponible");

  return (
    <React.Fragment>
      <div className="time-cell">{hora}</div>
      {dias.map((dia, idx) => {
        const estado = estados[idx] || "no_disponible";
        const className =
          estado === "libre" ? "slot free" :
          estado === "ocupado" ? "slot busy" : "slot na";

        return (
          <button
            key={`${hora}-${dia}`}
            type="button"
            className={className}
            /* Me aseguré de deshabilitar los botones que no estén 'libres' 
               para evitar reservas duplicadas o erróneas en el sistema. */
            disabled={estado !== "libre"}
            onClick={() => onPickSlot?.({ diaIndex: idx, dia, hora, estado })}
          />
        );
      })}
    </React.Fragment>
  );
}