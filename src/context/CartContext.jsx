import React, { createContext, useState, useContext, useEffect } from 'react';
import { productosIniciales } from '../data/productos';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

const STOCK_POR_DEFECTO = 10;

const CUPONES_VALIDOS = {
  FELICES50: 0.10,
  MILSABORES10: 0.10,
  PROFE100: 0.20,
  DUOC2026: 0.15
};

export const CartProvider = ({ children }) => {
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

  const [cart, setCart] = useState(() => {
    try {
      const guardado = localStorage.getItem('carrito_milsabores');
      return guardado ? JSON.parse(guardado) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('carrito_milsabores', JSON.stringify(cart));
  }, [cart]);

  const [mensajeStock, setMensajeStock] = useState('');
  const [notificacionCarrito, setNotificacionCarrito] = useState(null);

  const [cupon, setCupon] = useState('');
  const [descuento, setDescuento] = useState(0);
  const [mensajeCupon, setMensajeCupon] = useState('');

  const mostrarAvisoStock = (texto) => {
    setMensajeStock(texto);
    setTimeout(() => {
      setMensajeStock('');
    }, 3500);
  };

  const mostrarNotificacion = (texto) => {
    setNotificacionCarrito(texto);
    setTimeout(() => {
      setNotificacionCarrito(null);
    }, 3000);
  };

  const agregarAlCarrito = (producto) => {
    const productoActual = productos.find((p) => p.id === producto.id) || producto;
    const limiteMaximo =
      productoActual.stock !== undefined ? Number(productoActual.stock) : STOCK_POR_DEFECTO;

    if (limiteMaximo <= 0) {
      mostrarAvisoStock(`El producto "${productoActual.nombre}" se encuentra sin stock disponible.`);
      return;
    }

    setCart((prevCart) => {
      const existe = prevCart.find((item) => item.id === productoActual.id && !item.esRegalo);
      if (existe) {
        if (existe.cantidad >= limiteMaximo) {
          mostrarAvisoStock(
            `Has alcanzado el límite máximo de ${limiteMaximo} unidades para "${productoActual.nombre}".`
          );
          return prevCart;
        }
        return prevCart.map((item) =>
          item.id === productoActual.id && !item.esRegalo
            ? { ...item, cantidad: item.cantidad + 1, stock: limiteMaximo }
            : item
        );
      }
      return [...prevCart, { ...productoActual, stock: limiteMaximo, cantidad: 1 }];
    });

    mostrarNotificacion(`"${productoActual.nombre}" se agregó correctamente al carrito.`);
  };

  const agregarRegalo = (nombrePremio, etiqueta = 'Premio Cake Tower') => {
    const regaloObj = {
      id: `regalo-${Date.now()}`,
      nombre: `🎁 ${etiqueta}: ${nombrePremio}`,
      precio: 0,
      stock: 1,
      cantidad: 1,
      esRegalo: true,
      etiquetaRegalo: etiqueta
    };

    setCart((prevCart) => [...prevCart, regaloObj]);
    mostrarNotificacion(`"${nombrePremio}" añadido gratis ($0) a tu carrito.`);
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
            if (item.esRegalo) {
              const nuevaCantidad = item.cantidad + delta;
              return nuevaCantidad > 0 ? { ...item, cantidad: nuevaCantidad } : item;
            }

            const limiteMaximo =
              productoActual?.stock !== undefined
                ? Number(productoActual.stock)
                : item.stock !== undefined
                ? Number(item.stock)
                : STOCK_POR_DEFECTO;

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
    localStorage.removeItem('carrito_milsabores');
  };

  const aplicarCupon = (codigo) => {
    const codigoUpper = codigo.trim().toUpperCase();
    if (CUPONES_VALIDOS[codigoUpper]) {
      setDescuento(CUPONES_VALIDOS[codigoUpper]);
      setCupon(codigoUpper);
      setMensajeCupon(
        `Cupón ${codigoUpper} aplicado con éxito (${Math.round(CUPONES_VALIDOS[codigoUpper] * 100)}% desc.)`
      );
    } else {
      setMensajeCupon('Código de cupón inválido. Prueba con FELICES50 o MILSABORES10.');
    }
  };

  // Funciones CRUD de productos para Administración
  const agregarProductoAdmin = (nuevoProducto) => {
    const nuevo = {
      ...nuevoProducto,
      id: Date.now(),
      codigo: nuevoProducto.codigo?.trim() || `MS-${Math.floor(100 + Math.random() * 900)}`,
      imagen: nuevoProducto.imagen?.trim() || '/img/product_1.jpg',
      tamano: nuevoProducto.tamano || 'mediano',
      precio: Number(nuevoProducto.precio) || 0,
      stock: nuevoProducto.stock !== undefined ? Number(nuevoProducto.stock) : STOCK_POR_DEFECTO
    };
    setProductos((prev) => [nuevo, ...prev]);
  };

  const editarProductoAdmin = (id, datosActualizados) => {
    setProductos((prev) =>
      prev.map((prod) =>
        prod.id === id
          ? {
              ...prod,
              ...datosActualizados,
              precio: Number(datosActualizados.precio),
              stock:
                datosActualizados.stock !== undefined
                  ? Number(datosActualizados.stock)
                  : prod.stock ?? STOCK_POR_DEFECTO
            }
          : prod
      )
    );
  };

  const eliminarProductoAdmin = (id) => {
    setProductos((prev) => prev.filter((prod) => prod.id !== id));
  };

  const restaurarProductosIniciales = () => {
    const listaBase = (productosIniciales || []).map((p) => ({
      ...p,
      stock: p.stock !== undefined ? Number(p.stock) : STOCK_POR_DEFECTO
    }));
    setProductos(listaBase);
    localStorage.setItem('productos_milsabores', JSON.stringify(listaBase));
  };

  const subtotal = cart.reduce(
    (acc, item) => acc + (Number(item.precio) || 0) * (Number(item.cantidad) || 1),
    0
  );
  const totalDescuento = subtotal * (descuento || 0);
  const total = Math.max(0, subtotal - totalDescuento);

  return (
    <CartContext.Provider
      value={{
        productos,
        cart,
        subtotal,
        descuento,
        cupon,
        totalDescuento,
        total,
        mensajeCupon,
        mensajeStock,
        notificacionCarrito,
        agregarAlCarrito,
        agregarRegalo,
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