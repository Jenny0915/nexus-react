import { render, screen, fireEvent } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import ReserveModal from '../components/coworking/ReserveModal';
import WeeklyCalendar from '../components/coworking/WeeklyCalendar';
import FloorPlan from '../components/coworking/FloorPlan';

describe('Pruebas funcionales de Coworking - Nexus', () => {

  // Test 1: Renderizado del Modal
  test('1. Debe mostrar el encabezado "Reservar" al abrir el modal', () => {
    render(<ReserveModal open={true} summary="Mesa 01" onClose={() => {}} />);
    expect(screen.getByText(/Reservar/i)).toBeInTheDocument();
  });

  // Test 2: Cierre del Modal
  test('2. Debe ejecutar la función onClose al hacer clic en Cancelar', () => {
    const mockClose = vi.fn();
    render(<ReserveModal open={true} onClose={mockClose} />);
    fireEvent.click(screen.getByText(/Cancelar/i));
    expect(mockClose).toHaveBeenCalled();
  });

  // Test 3: Visualización del Calendario
  test('3. Debe renderizar las columnas de los días de la semana', () => {
    const mockAgenda = { franjas: [], dias: ["LUN", "MAR", "MIE"] };
    render(<WeeklyCalendar agenda={mockAgenda} />);
    expect(screen.getByText('LUN')).toBeInTheDocument();
    expect(screen.getByText('MIE')).toBeInTheDocument();
  });

  // Test 4: Selección de espacio en el Plano
  test('4. Debe llamar a la función de selección al tocar un espacio del plano', () => {
    const mockSelect = vi.fn();
    const mockGrouped = { salas: [{ id: 1, nombre: 'Sala VIP' }], mesas: [], cabinas: [] };
    render(<FloorPlan grouped={mockGrouped} onSelect={mockSelect} />);
    fireEvent.click(screen.getByText('Sala VIP'));
    expect(mockSelect).toHaveBeenCalled();
  });

  // Test 5: Leyenda de colores
  test('5. Debe mostrar los indicadores de disponibilidad (Libre/Ocupado)', () => {
    const mockAgenda = { franjas: [], dias: [] };
    render(<WeeklyCalendar agenda={mockAgenda} />);
    expect(screen.getByText(/Libre/i)).toBeInTheDocument();
    expect(screen.getByText(/Ocupado/i)).toBeInTheDocument();
  });
});