import { render, screen, fireEvent } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import ReserveModal from '../components/coworking/ReserveModal';
import WeeklyCalendar from '../components/coworking/WeeklyCalendar';
import FloorPlan from '../components/coworking/FloorPlan';

/* Decidí agrupar estas pruebas para verificar que los componentes críticos 
  del área de Coworking funcionen correctamente tras los cambios de la Actividad 3.*/
describe('Pruebas funcionales de Coworking - Nexus', () => {

  /* Verifico que el modal de reserva sea accesible y cargue su contenido básico */
  test('1. Debe mostrar el encabezado "Reservar" al abrir el modal', () => {
    render(<ReserveModal open={true} summary="Mesa 01" onClose={() => {}} />);
    expect(screen.getByText(/Reservar/i)).toBeInTheDocument();
  });

  /* Compruebo que la interacción para cerrar el modal funcione, algo vital para la usabilidad */
  test('2. Debe ejecutar la función onClose al hacer clic en Cancelar', () => {
    const mockClose = vi.fn();
    render(<ReserveModal open={true} onClose={mockClose} />);
    fireEvent.click(screen.getByText(/Cancelar/i));
    expect(mockClose).toHaveBeenCalled();
  });

  /* Como parte de la lógica de agenda solicitada, testeo que el calendario 
    se renderice con los días configurados. */
  test('3. Debe renderizar las columnas de los días de la semana', () => {
    const mockAgenda = { franjas: [], dias: ["LUN", "MAR", "MIE"] };
    render(<WeeklyCalendar agenda={mockAgenda} />);
    expect(screen.getByText('LUN')).toBeInTheDocument();
    expect(screen.getByText('MIE')).toBeInTheDocument();
  });

  /* Esta prueba es clave para el Criterio de reserva: verifico que al hacer clic 
    en un espacio del plano (como la Sala VIP), la aplicación reaccione correctamente. */
  test('4. Debe llamar a la función de selección al tocar un espacio del plano', () => {
    const mockSelect = vi.fn();
    const mockGrouped = { salas: [{ id: 1, nombre: 'Sala VIP' }], mesas: [], cabinas: [] };
    render(<FloorPlan grouped={mockGrouped} onSelect={mockSelect} />);
    fireEvent.click(screen.getByText('Sala VIP'));
    expect(mockSelect).toHaveBeenCalled();
  });

  /* Verifico la leyenda de disponibilidad para asegurar que el usuario 
    entienda visualmente qué espacios están libres u ocupados. */
  test('5. Debe mostrar los indicadores de disponibilidad (Libre/Ocupado)', () => {
    const mockAgenda = { franjas: [], dias: [] };
    render(<WeeklyCalendar agenda={mockAgenda} />);
    expect(screen.getByText(/Libre/i)).toBeInTheDocument();
    expect(screen.getByText(/Ocupado/i)).toBeInTheDocument();
  });
});