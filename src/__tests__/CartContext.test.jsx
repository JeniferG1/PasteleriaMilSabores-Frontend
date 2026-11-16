import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { CartProvider, useCart } from '../context/CartContext';

describe('CartContext Unit Tests', () => {
  const wrapper = ({ children }) => <CartProvider>{children}</CartProvider>;

  beforeEach(() => {
    localStorage.clear();
  });

  it('debe iniciar con el carrito vacío', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    expect(result.current.cart).toEqual([]);
    expect(result.current.subtotal).toBe(0);
  });

  it('debe agregar un producto al carrito y calcular el subtotal', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    const productoPrueba = { id: 99, nombre: 'Torta Amor', precio: 15000, stock: 5 };

    act(() => {
      result.current.agregarAlCarrito(productoPrueba);
    });

    expect(result.current.cart.length).toBe(1);
    expect(result.current.cart[0].nombre).toBe('Torta Amor');
    expect(result.current.cart[0].cantidad).toBe(1);
    expect(result.current.subtotal).toBe(15000);
  });

  it('debe respetar el límite máximo de stock por producto', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    const productoLimitado = { id: 50, nombre: 'Torta Limitada', precio: 20000, stock: 2 };

    act(() => {
      result.current.agregarAlCarrito(productoLimitado);
      result.current.agregarAlCarrito(productoLimitado);
      result.current.agregarAlCarrito(productoLimitado);
    });

    expect(result.current.cart[0].cantidad).toBe(2);
    expect(result.current.mensajeStock).toContain('límite máximo de 2 unidades');
  });

  it('debe aplicar correctamente un cupón de descuento válido', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    const productoPrueba = { id: 1, nombre: 'Torta Chocolate', precio: 45000, stock: 10 };

    act(() => {
      result.current.agregarAlCarrito(productoPrueba);
      result.current.aplicarCupon('MILSABORES10');
    });

    expect(result.current.descuento).toBe(0.10);
    expect(result.current.totalDescuento).toBe(4500);
    expect(result.current.total).toBe(40500);
  });

  it('debe permitir crear, editar y eliminar productos desde las funciones de administrador', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    const cantidadInicial = result.current.productos.length;

    act(() => {
      result.current.agregarProductoAdmin({
        codigo: 'TEST01',
        nombre: 'Torta Prueba Admin',
        precio: 25000,
        stock: 8,
        categoria: 'tortas-cuadradas',
        tamano: 'mediano',
        descripcion: 'Descripción de prueba'
      });
    });

    expect(result.current.productos.length).toBe(cantidadInicial + 1);
    const creado = result.current.productos.find((p) => p.codigo === 'TEST01');
    expect(creado).toBeDefined();

    act(() => {
      result.current.editarProductoAdmin(creado.id, {
        ...creado,
        nombre: 'Torta Editada Admin',
        precio: 30000
      });
    });

    const editado = result.current.productos.find((p) => p.id === creado.id);
    expect(editado.nombre).toBe('Torta Editada Admin');
    expect(editado.precio).toBe(30000);

    act(() => {
      result.current.eliminarProductoAdmin(creado.id);
    });

    expect(result.current.productos.length).toBe(cantidadInicial);
  });
});