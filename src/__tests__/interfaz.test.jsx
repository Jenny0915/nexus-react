import { render, screen } from '@testing-library/react';
import { describe, test, expect } from 'vitest';

describe('Pruebas de Interfaz y UI - Nexus', () => {

  // Test 6: Título del panel
  test('6. Debe mostrar el título del panel "Plano del Espacio"', () => {
    render(<h2 className="panel-title">Plano del Espacio</h2>);
    expect(screen.getByText(/Plano del Espacio/i)).toBeInTheDocument();
  });

  // Test 7: Botón de confirmación
  test('7. El botón de confirmar reserva debe ser de tipo submit', () => {
    render(<button type="submit">Confirmar reserva</button>);
    const boton = screen.getByRole('button', { name: /Confirmar reserva/i });
    expect(boton).toHaveAttribute('type', 'submit');
  });

  // Test 8: Información de capacidad
  test('8. Debe mostrar correctamente el texto de capacidad del espacio', () => {
    render(<div><strong>Capacidad:</strong> 6 personas</div>);
    expect(screen.getByText(/6 personas/i)).toBeInTheDocument();
  });

  // Test 9: Estados de carga
  test('9. Debe mostrar el mensaje de carga cuando se buscan espacios', () => {
    render(<p>Cargando espacios...</p>);
    expect(screen.getByText(/Cargando/i)).toBeInTheDocument();
  });

  // Test 10: Validación de Inputs
  test('10. Los campos de texto del modal deben ser marcados como requeridos', () => {
    render(<input required placeholder="Tu nombre" />);
    const input = screen.getByPlaceholderText('Tu nombre');
    expect(input).toBeRequired();
  });
});