import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import Admin from '../views/Admin';
import { CartProvider } from '../context/CartContext';

vi.mock('../components/RichTextEditor', () => ({
  default: ({ value, onChange, placeholder }) => (
    <textarea
      data-testid="rich-text-editor"
      value={value || ''}
      placeholder={placeholder || 'Descripción'}
      onChange={(e) => onChange(e.target.value)}
    />
  )
}));

const renderAdmin = () => {
  return render(
    <CartProvider>
      <Admin />
    </CartProvider>
  );
};

describe('Admin Component Unit Tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('debe renderizar el panel y listar el inventario inicial', () => {
    renderAdmin();
    expect(screen.getByRole('heading', { name: /Panel de Administración - Mil Sabores/i })).toBeInTheDocument();
    expect(screen.getByText(/Torta Cuadrada de Chocolate/i)).toBeInTheDocument();
  });

  it('debe permitir agregar un nuevo producto al inventario', () => {
    renderAdmin();

    fireEvent.change(screen.getByPlaceholderText(/Ej: TC003/i), {
      target: { value: 'TC099' }
    });
    fireEvent.change(screen.getByPlaceholderText(/Ej: Torta Amor/i), {
      target: { value: 'Torta Selva Negra' }
    });
    fireEvent.change(screen.getByPlaceholderText('45000'), {
      target: { value: '38000' }
    });

    const editores = screen.getAllByTestId('rich-text-editor');
    fireEvent.change(editores[0], {
      target: { value: 'Bizcocho de chocolate con crema y guindas.' }
    });

    fireEvent.click(screen.getByRole('button', { name: /Guardar Producto/i }));

    const coincidencias = screen.getAllByText(/Torta Selva Negra/i);
    expect(coincidencias.length).toBeGreaterThanOrEqual(1);
  });
});