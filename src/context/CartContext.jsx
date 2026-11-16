import React, { createContext, useState, useContext, useEffect } from 'react';
import { productosIniciales } from '../data/productos';

const CartContext = createContext();

const STOCK_POR_DEFECTO = 10;

export const CartProvider = ({ children }) => {
  // Estado de productos persistente en localStorage (garantiza que cada uno tenga stock)
  const [productos, setProductos] = useState(() => {
    const guardados = localStorage.getItem('productos_milsabores');
    const listaBase = guardados ? JSON.parse(guardados) : (productosIniciales || []);
    return listaBase.map((p) => ({
      ...p,
      stock: p.stock !== undefined ? Number(p.stock) : STOCK_POR_DEFECTO
    }));
  });

  useEffect(() => {
    localStorage.setItem('productos_milsabores', JSON.stringify(productos));
  }, [productos]);

  // Estado del Carrito y mensajes de límite
  const [cart, setCart] = useState([]);
  const [mensajeStock, setMensajeStock] = useState('');

  // Estado de Cupones / Descuentos
  const [cupon, setCupon] = useState('');
  const [descuento, setDescuento] = useState(0);
  const [mensajeCupon, setMensajeCupon] = useState('');

  const cuponesValidos = {
    'MILSABORES10': 0.10,
    'PROFE100': 0.20,
    'DUOC2026': 0.15
  };

  const mostrarAvisoStock = (texto) => {
    setMensajeStock(texto);
    setTimeout(() => {
      setMensajeStock('');
    }, 3500);
  };

  // Funciones del Carrito con validación de límite máximo
  const agregarAlCarrito = (producto) => {
    const productoActual = productos.find((p) => p.id === producto.id) || producto;
    const limiteMaximo = productoActual.stock !== undefined ? Number(productoActual.stock) : STOCK_POR_DEFECTO;

    if (limiteMaximo <= 0) {
      mostrarAvisoStock(`El producto "${productoActual.nombre}" se encuentra sin stock disponible.`);
      return;
    }

    setCart((prevCart) => {
      const existe = prevCart.find((item) => item.id === productoActual.id);
      if (existe) {
        if (existe.cantidad >= limiteMaximo) {
          mostrarAvisoStock(`Has alcanzado el límite máximo de ${limiteMaximo} unidades para "${productoActual.nombre}".`);
          return prevCart;
        }
        return prevCart.map((item) =>
          item.id === productoActual.id ? { ...item, cantidad: item.cantidad + 1, stock: limiteMaximo } : item
        );
      }
      return [...prevCart, { ...productoActual, stock: limiteMaximo, cantidad: 1 }];
    });
  };

  const eliminarDelCarrito = (id) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  const cambiarCantidad = (id, delta) => {
    const productoActual = productos.find((p) => p.id === id);

    setCart((prevCart) =>
      prevCart
        .map((item) => {
          if (item.id === id) {
            const limiteMaximo =
              productoActual?.stock !== undefined
                ? Number(productoActual.stock)
                : (item.stock !== undefined ? Number(item.stock) : STOCK_POR_DEFECTO);

            const nuevaCantidad = item.cantidad + delta;

            if (nuevaCantidad > limiteMaximo) {
              mostrarAvisoStock(`El máximo permitido para "${item.nombre}" es de ${limiteMaximo} unidades.`);
              return item;
            }

            return nuevaCantidad > 0 ? { ...item, cantidad: nuevaCantidad } : item;
          }
          return item;
        })
        .filter((item) => item.cantidad > 0)
    );
  };

  const vaciarCarrito = () => {
    setCart([]);
    setDescuento(0);
    setCupon('');
    setMensajeCupon('');
    setMensajeStock('');
  };

  // Función para Aplicar Cupón
  const aplicarCupon = (codigo) => {
    const codigoUpper = codigo.trim().toUpperCase();
    if (cuponesValidos[codigoUpper]) {
      setDescuento(cuponesValidos[codigoUpper]);
      setCupon(codigoUpper);
      setMensajeCupon(`Cupón ${codigoUpper} aplicado con éxito (${cuponesValidos[codigoUpper] * 100}% desc)`);
    } else {
      setMensajeCupon('Código de cupón inválido');
    }
  };

  // Funciones del Panel de Administración (CRUD Completo con Stock)
  const agregarProductoAdmin = (nuevoProducto) => {
    const nuevo = {
      ...nuevoProducto,
      id: Date.now(),
      codigo: nuevoProducto.codigo?.trim() || `MS-${Math.floor(100 + Math.random() * 900)}`,
      imagen: nuevoProducto.imagen?.trim() || '/img/product_1.avif',
      tamano: nuevoProducto.tamano || 'mediano',
      precio: Number(nuevoProducto.precio),
      stock: nuevoProducto.stock !== undefined && nuevoProducto.stock !== '' ? Number(nuevoProducto.stock) : STOCK_POR_DEFECTO
    };
    setProductos((prev) => [...prev, nuevo]);
  };

  const editarProductoAdmin = (id, datosActualizados) => {
    const stockNuevo =
      datosActualizados.stock !== undefined && datosActualizados.stock !== ''
        ? Number(datosActualizados.stock)
        : STOCK_POR_DEFECTO;

    setProductos((prev) =>
      prev.map((prod) =>
        prod.id === id
          ? {
              ...prod,
              ...datosActualizados,
              precio: Number(datosActualizados.precio),
              stock: stockNuevo
            }
          : prod
      )
    );

    // Ajustar cantidad en el carrito si el nuevo stock es menor a lo que el cliente ya tenía
    setCart((prevCart) =>
      prevCart
        .map((item) => {
          if (item.id === id) {
            if (stockNuevo <= 0) return null;
            return {
              ...item,
              ...datosActualizados,
              precio: Number(datosActualizados.precio),
              stock: stockNuevo,
              cantidad: Math.min(item.cantidad, stockNuevo)
            };
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const eliminarProductoAdmin = (id) => {
    setProductos((prev) => prev.filter((prod) => prod.id !== id));
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  const restaurarProductosIniciales = () => {
    const restaurados = (productosIniciales || []).map((p) => ({
      ...p,
      stock: p.stock !== undefined ? Number(p.stock) : STOCK_POR_DEFECTO
    }));
    setProductos(restaurados);
    localStorage.setItem('productos_milsabores', JSON.stringify(restaurados));
  };

  // Totales
  const subtotal = cart.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
  const totalDescuento = subtotal * descuento;
  const total = subtotal - totalDescuento;
  const cantidadTotalCarrito = cart.reduce((acc, item) => acc + item.cantidad, 0);

  return (
    <CartContext.Provider
      value={{
        productos,
        cart,
        cupon,
        descuento,
        mensajeCupon,
        mensajeStock,
        subtotal,
        total,
        totalDescuento,
        cantidadTotalCarrito,
        agregarAlCarrito,
        eliminarDelCarrito,
        cambiarCantidad,
        vaciarCarrito,
        aplicarCupon,
        agregarProductoAdmin,
        editarProductoAdmin,
        eliminarProductoAdmin,
        restaurarProductosIniciales
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);