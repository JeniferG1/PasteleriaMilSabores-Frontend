import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Registro from '../views/Registro';
import { AuthProvider } from '../context/AuthContext';

const renderRegistro = () => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <Registro />
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('Registro Component Unit Tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('debe cargar dinámicamente las comunas al seleccionar una región', () => {
    const { container } = renderRegistro();

    const selectRegion = container.querySelector('select[name="region"]');
    const selectComuna = container.querySelector('select[name="comuna"]');

    expect(selectComuna).toBeDisabled();

    fireEvent.change(selectRegion, { target: { value: 'araucania' } });

    expect(selectComuna).not.toBeDisabled();
    expect(screen.getByRole('option', { name: 'Temuco' })).toBeInTheDocument();
  });

  it('debe asignar 50% de descuento permanente a usuarios mayores de 50 años', () => {
    const { container } = renderRegistro();

    fireEvent.change(container.querySelector('input[name="nombre"]'), {
      target: { value: 'María Pérez' }
    });
    fireEvent.change(container.querySelector('input[name="email"]'), {
      target: { value: 'maria@cliente.cl' }
    });
    fireEvent.change(container.querySelector('input[name="fechaNacimiento"]'), {
      target: { value: '1965-04-10' }
    });
    fireEvent.change(container.querySelector('select[name="region"]'), {
      target: { value: 'metropolitana' }
    });
    fireEvent.change(container.querySelector('select[name="comuna"]'), {
      target: { value: 'Santiago' }
    });
    fireEvent.change(container.querySelector('input[name="password"]'), {
      target: { value: 'clave123' }
    });
    fireEvent.change(container.querySelector('input[name="confirmarPassword"]'), {
      target: { value: 'clave123' }
    });

    fireEvent.click(screen.getByRole('button', { name: /Registrarse/i }));

    const sesion = JSON.parse(localStorage.getItem('sesion_milsabores'));
    expect(sesion).not.toBeNull();
    expect(sesion.esSenior).toBe(true);
    expect(sesion.descuento).toBe(0.5);
  });
});