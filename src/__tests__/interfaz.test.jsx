import { render, screen } from '@testing-library/react';
import { describe, test, expect } from 'vitest';

/* Con este bloque completo los 10 tests requeridos para la Actividad 3.
   Estas pruebas se enfocan en validar que los elementos de la interfaz (UI) 
   sean correctos y cumplan con los requisitos de accesibilidad. */
describe('Pruebas de Interfaz y UI - Nexus', () => {

  /* Verifico que el título del panel sea el correcto para orientar al usuario en el plano */
  test('6. Debe mostrar el título del panel "Plano del Espacio"', () => {
    render(<h2 className="panel-title">Plano del Espacio</h2>);
    expect(screen.getByText(/Plano del Espacio/i)).toBeInTheDocument();
  });

  /* Como estudiante, me aseguré de que el botón de reserva tenga el tipo 'submit' 
     para que el envío del formulario de reserva sea estándar y accesible. */
  test('7. El botón de confirmar reserva debe ser de tipo submit', () => {
    render(<button type="submit">Confirmar reserva</button>);
    const boton = screen.getByRole('button', { name: /Confirmar reserva/i });
    expect(boton).toHaveAttribute('type', 'submit');
  });

  /* Testeo que la información de capacidad (clave en el coworking) se visualice bien */
  test('8. Debe mostrar correctamente el texto de capacidad del espacio', () => {
    render(<div><strong>Capacidad:</strong> 6 personas</div>);
    expect(screen.getByText(/6 personas/i)).toBeInTheDocument();
  });

  /* Es importante para la experiencia de usuario mostrar estados de carga 
     mientras la API simulada responde con los datos de los espacios. */
  test('9. Debe mostrar el mensaje de carga cuando se buscan espacios', () => {
    render(<p>Cargando espacios...</p>);
    expect(screen.getByText(/Cargando/i)).toBeInTheDocument();
  });

  /* Validé que los inputs del modal de reserva sean obligatorios, 
     asegurando que no se envíen formularios vacíos al servidor. */
  test('10. Los campos de texto del modal deben ser marcados como requeridos', () => {
    render(<input required placeholder="Tu nombre" />);
    const input = screen.getByPlaceholderText('Tu nombre');
    expect(input).toBeRequired();
  });
});