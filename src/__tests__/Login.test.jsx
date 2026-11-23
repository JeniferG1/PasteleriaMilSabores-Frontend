import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Login from '../views/Login';
import { AuthProvider } from '../context/AuthContext';

vi.mock('../Services/axiosClient', () => ({
  default: {
    post: vi.fn(() => Promise.reject(new Error('Backend no disponible en test'))),
    defaults: { headers: { common: {} } }
  }
}));

const renderLogin = () => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <Login />
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('Login Component Unit Tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('debe renderizar el título y los campos del formulario', () => {
    renderLogin();
    expect(screen.getByRole('heading', { name: /Iniciar Sesión/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Correo Electrónico/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Contraseña/i)).toBeInTheDocument();
  });

  it('debe mostrar mensaje de error si se envía el formulario vacío', () => {
    renderLogin();
    const botonSubmit = screen.getByRole('button', { name: /Ingresar/i });

    fireEvent.click(botonSubmit);

    expect(screen.getByText(/Por favor ingresa tu correo y contraseña/i)).toBeInTheDocument();
  });

  it('debe mostrar error con credenciales incorrectas', async () => {
    renderLogin();

    fireEvent.change(screen.getByLabelText(/Correo Electrónico/i), {
      target: { value: 'noexiste@correo.cl' }
    });
    fireEvent.change(screen.getByLabelText(/Contraseña/i), {
      target: { value: 'clave123' }
    });
    fireEvent.click(screen.getByRole('button', { name: /Ingresar/i }));

    expect(await screen.findByText(/Correo o contraseña incorrectos/i)).toBeInTheDocument();
  });

  it('debe iniciar sesión correctamente con las credenciales de administrador', async () => {
    renderLogin();

    fireEvent.change(screen.getByLabelText(/Correo Electrónico/i), {
      target: { value: 'admin@milsabores.cl' }
    });
    fireEvent.change(screen.getByLabelText(/Contraseña/i), {
      target: { value: 'admin123' }
    });
    fireEvent.click(screen.getByRole('button', { name: /Ingresar/i }));

    await waitFor(() => {
      const sesion = JSON.parse(localStorage.getItem('sesion_milsabores'));
      expect(sesion).not.toBeNull();
      expect(sesion.rol).toBe('admin');
    });
  });
});