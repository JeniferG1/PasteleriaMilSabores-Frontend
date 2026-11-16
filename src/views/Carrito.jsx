import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function Carrito() {
  const {
    cart,
    subtotal,
    totalDescuento,
    eliminarDelCarrito,
    cambiarCantidad,
    vaciarCarrito,
    aplicarCupon,
    mensajeCupon,
    mensajeStock
  } = useCart();

  const { usuarioLogueado } = useAuth();
  const [inputCupon, setInputCupon] = useState('');

  // Estados para Checkout
  const [mostrarCheckout, setMostrarCheckout] = useState(false);
  const [compraExitosa, setCompraExitosa] = useState(null);
  const [erroresCheckout, setErroresCheckout] = useState({});
  const [datosEnvio, setDatosEnvio] = useState({
    nombre: '',
    email: '',
    telefono: '',
    direccion: '',
    comuna: '',
    fechaEntrega: '',
    dedicatoria: ''
  });

  // Autocompletado si el usuario inició sesión
  useEffect(() => {
    if (usuarioLogueado) {
      setDatosEnvio((prev) => ({
        ...prev,
        nombre: usuarioLogueado.nombre || '',
        email: usuarioLogueado.email || '',
        comuna: usuarioLogueado.comuna || prev.comuna
      }));
    }
  }, [usuarioLogueado]);

  const handleCuponSubmit = (e) => {
    e.preventDefault();
    aplicarCupon(inputCupon);
  };

  // Cálculo del Descuento Senior (50%)
  const tieneDescuentoSenior = Boolean(usuarioLogueado?.esSenior || usuarioLogueado?.descuento === 0.5);
  const descuentoSeniorMonto = tieneDescuentoSenior ? subtotal * 0.5 : 0;
  const totalDescuentosAcumulados = (totalDescuento || 0) + descuentoSeniorMonto;
  const totalPagar = Math.max(0, subtotal - totalDescuentosAcumulados);

  const handleCheckoutChange = (e) => {
    const { name, value } = e.target;
    setDatosEnvio({ ...datosEnvio, [name]: value });
    if (erroresCheckout[name]) {
      setErroresCheckout({ ...erroresCheckout, [name]: '' });
    }
  };

  const validarCheckout = () => {
    const errores = {};
    if (!datosEnvio.nombre.trim()) errores.nombre = 'El nombre de quien recibe es obligatorio.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datosEnvio.email)) errores.email = 'Correo inválido.';
    if (!/^\+?56?\s?9\d{8}$/.test(datosEnvio.telefono.replace(/\s/g, ''))) {
      errores.telefono = 'Ingresa un celular chileno válido (Ej: 912345678).';
    }
    if (!datosEnvio.direccion.trim() || datosEnvio.direccion.length < 5) {
      errores.direccion = 'Ingresa calle y numeración válida.';
    }
    if (!datosEnvio.comuna) errores.comuna = 'Selecciona una comuna de reparto.';
    if (!datosEnvio.fechaEntrega) {
      errores.fechaEntrega = 'Selecciona una fecha de entrega.';
    } else {
      const hoy = new Date().toISOString().split('T')[0];
      if (datosEnvio.fechaEntrega < hoy) {
        errores.fechaEntrega = 'La fecha de entrega no puede ser en el pasado.';
      }
    }

    setErroresCheckout(errores);
    return Object.keys(errores).length === 0;
  };

  const handleConfirmarCompra = (e) => {
    e.preventDefault();
    if (!validarCheckout()) return;

    const resumenOrden = {
      numeroOrden: `MS-${Math.floor(100000 + Math.random() * 900000)}`,
      cliente: datosEnvio.nombre,
      direccion: `${datosEnvio.direccion}, ${datosEnvio.comuna}`,
      fechaEntrega: datosEnvio.fechaEntrega,
      dedicatoria: datosEnvio.dedicatoria,
      totalPagado: totalPagar,
      items: [...cart]
    };

    setCompraExitosa(resumenOrden);
    vaciarCarrito();
  };

  // Vista de Comprobante / Boleta tras pagar
  if (compraExitosa) {
    return (
      <div className="container py-5">
        <div className="card border-0 shadow-sm p-5 mx-auto text-center" style={{ maxWidth: '650px' }}>
          <h2 className="fw-bold text-success mb-2">Pedido Confirmado</h2>
          <p className="text-muted mb-4">
            Orden N° <strong>{compraExitosa.numeroOrden}</strong>
          </p>

          <div className="bg-light p-4 rounded-3 text-start mb-4">
            <p className="mb-1"><strong>Cliente:</strong> {compraExitosa.cliente}</p>
            <p className="mb-1"><strong>Dirección de envío:</strong> {compraExitosa.direccion}</p>
            <p className="mb-1"><strong>Fecha programada:</strong> {compraExitosa.fechaEntrega}</p>
            {compraExitosa.dedicatoria && (
              <p className="mb-1"><strong>Mensaje en torta:</strong> "{compraExitosa.dedicatoria}"</p>
            )}
            <hr />
            <h5 className="fw-bold text-end mb-0">
              Total Pagado: ${compraExitosa.totalPagado.toLocaleString('es-CL')}
            </h5>
          </div>

          <Link to="/" className="btn btn-primary rounded-pill px-5 py-2 fw-bold">
            Volver a la Pastelería
          </Link>
        </div>
      </div>
    );
  }

  // Vista Carrito Vacío
  if (!cart || cart.length === 0) {
    return (
      <div className="container-xxl py-5">
        <div className="container text-center py-5">
          <div className="p-5 bg-light rounded-3 shadow-sm mx-auto" style={{ maxWidth: '600px' }}>
            <h2 className="mb-3 fw-bold">Tu Carrito está Vacío</h2>
            <p className="text-muted mb-4">Añade algunos productos de nuestra pastelería para comenzar.</p>
            <Link to="/" className="btn btn-primary rounded-pill py-3 px-5 fw-bold">
              Ver Productos
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-xxl py-5">
      <div className="container">
        <div className="text-center mx-auto mb-5" style={{ maxWidth: '600px' }}>
          <h1 className="display-6 mb-3 fw-bold">Carrito de Compras</h1>
          <p className="text-muted">Revisa tus productos seleccionados y completa los datos de entrega</p>
          <hr className="w-25 mx-auto bg-primary" />
        </div>

        {mensajeStock && (
          <div className="alert alert-warning fw-semibold text-center" role="alert">
            {mensajeStock}
          </div>
        )}

        <div className="row g-4">
          {/* Columna Izquierda: Tabla de Productos + Formulario de Checkout */}
          <div className="col-lg-8">
            <div className="card shadow-sm border-0 p-4 mb-4">
              <div className="table-responsive">
                <table className="table align-middle">
                  <thead>
                    <tr>
                      <th className="py-3">Producto</th>
                      <th className="py-3">Precio</th>
                      <th className="py-3 text-center">Cantidad</th>
                      <th className="py-3">Subtotal</th>
                      <th className="py-3 text-center">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cart.map((item) => {
                      const limiteMaximo = item.stock ?? 10;
                      const alcanzoLimite = item.cantidad >= limiteMaximo;

                      return (
                        <tr key={item.id}>
                          <td>
                            <div className="fw-bold">{item.nombre}</div>
                            <small className="text-muted">Máx. {limiteMaximo} unid. por pedido</small>
                          </td>
                          <td>${item.precio?.toLocaleString('es-CL')}</td>
                          <td>
                            <div className="d-flex align-items-center justify-content-center">
                              <button
                                className="btn btn-sm btn-outline-secondary px-2"
                                onClick={() => cambiarCantidad(item.id, -1)}
                              >
                                -
                              </button>
                              <span className="mx-3 fw-bold">{item.cantidad}</span>
                              <button
                                className="btn btn-sm btn-outline-secondary px-2"
                                onClick={() => cambiarCantidad(item.id, 1)}
                                disabled={alcanzoLimite}
                                title={alcanzoLimite ? `Límite máximo de ${limiteMaximo} unidades alcanzado` : 'Aumentar cantidad'}
                              >
                                +
                              </button>
                            </div>
                          </td>
                          <td className="fw-bold">${(item.precio * item.cantidad).toLocaleString('es-CL')}</td>
                          <td className="text-center">
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => eliminarDelCarrito(item.id)}
                              title="Eliminar producto"
                            >
                              Quitar
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="d-flex justify-content-end mt-3">
                <button className="btn btn-outline-danger rounded-pill px-4" onClick={vaciarCarrito}>
                  Vaciar Carrito
                </button>
              </div>
            </div>

            {/* Formulario de Checkout Desplegable */}
            {mostrarCheckout && (
              <div className="card shadow-sm border-0 p-4 mb-4 bg-white">
                <h4 className="fw-bold mb-3">Datos de Despacho y Entrega</h4>
                <form onSubmit={handleConfirmarCompra} noValidate>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Nombre quien recibe *</label>
                      <input
                        type="text"
                        name="nombre"
                        className={`form-control ${erroresCheckout.nombre ? 'is-invalid' : ''}`}
                        value={datosEnvio.nombre}
                        onChange={handleCheckoutChange}
                      />
                      {erroresCheckout.nombre && <div className="invalid-feedback">{erroresCheckout.nombre}</div>}
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Correo de confirmación *</label>
                      <input
                        type="email"
                        name="email"
                        className={`form-control ${erroresCheckout.email ? 'is-invalid' : ''}`}
                        value={datosEnvio.email}
                        onChange={handleCheckoutChange}
                      />
                      {erroresCheckout.email && <div className="invalid-feedback">{erroresCheckout.email}</div>}
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Teléfono de contacto *</label>
                      <input
                        type="tel"
                        name="telefono"
                        placeholder="912345678"
                        className={`form-control ${erroresCheckout.telefono ? 'is-invalid' : ''}`}
                        value={datosEnvio.telefono}
                        onChange={handleCheckoutChange}
                      />
                      {erroresCheckout.telefono && <div className="invalid-feedback">{erroresCheckout.telefono}</div>}
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Comuna *</label>
                      <select
                        name="comuna"
                        className={`form-select ${erroresCheckout.comuna ? 'is-invalid' : ''}`}
                        value={datosEnvio.comuna}
                        onChange={handleCheckoutChange}
                      >
                        <option value="">Selecciona tu comuna...</option>
                        <option value="Santiago">Santiago</option>
                        <option value="Estación Central">Estación Central</option>
                        <option value="Providencia">Providencia</option>
                        <option value="Ñuñoa">Ñuñoa</option>
                        <option value="Maipú">Maipú</option>
                        <option value="La Florida">La Florida</option>
                        <option value="Puente Alto">Puente Alto</option>
                        <option value="Temuco">Temuco</option>
                        <option value="Chillán">Chillán</option>
                      </select>
                      {erroresCheckout.comuna && <div className="invalid-feedback">{erroresCheckout.comuna}</div>}
                    </div>

                    <div className="col-md-8">
                      <label className="form-label fw-semibold">Dirección (Calle, Número, Depto) *</label>
                      <input
                        type="text"
                        name="direccion"
                        placeholder="Ej: Av. Libertador Bernardo O'Higgins 1234"
                        className={`form-control ${erroresCheckout.direccion ? 'is-invalid' : ''}`}
                        value={datosEnvio.direccion}
                        onChange={handleCheckoutChange}
                      />
                      {erroresCheckout.direccion && <div className="invalid-feedback">{erroresCheckout.direccion}</div>}
                    </div>

                    <div className="col-md-4">
                      <label className="form-label fw-semibold">Fecha de Entrega *</label>
                      <input
                        type="date"
                        name="fechaEntrega"
                        className={`form-control ${erroresCheckout.fechaEntrega ? 'is-invalid' : ''}`}
                        value={datosEnvio.fechaEntrega}
                        onChange={handleCheckoutChange}
                      />
                      {erroresCheckout.fechaEntrega && (
                        <div className="invalid-feedback">{erroresCheckout.fechaEntrega}</div>
                      )}
                    </div>

                    <div className="col-12">
                      <label className="form-label fw-semibold">Mensaje / Dedicatoria en la torta (Opcional)</label>
                      <input
                        type="text"
                        name="dedicatoria"
                        maxLength={50}
                        placeholder="Ej: Feliz Cumpleaños Mamá"
                        className="form-control"
                        value={datosEnvio.dedicatoria}
                        onChange={handleCheckoutChange}
                      />
                    </div>
                  </div>

                  <button type="submit" className="btn btn-success w-100 py-3 rounded-pill fw-bold mt-4 shadow-sm">
                    Confirmar y Pagar ${totalPagar.toLocaleString('es-CL')}
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Columna Derecha: Resumen y Cupones */}
          <div className="col-lg-4">
            <div className="card border-0 shadow-sm p-4 mb-4">
              <h5 className="fw-bold mb-3">Cupón de Descuento</h5>
              <form onSubmit={handleCuponSubmit} className="d-flex">
                <input
                  type="text"
                  className="form-control me-2"
                  placeholder="Ej: MILSABORES10"
                  value={inputCupon}
                  onChange={(e) => setInputCupon(e.target.value)}
                />
                <button type="submit" className="btn btn-secondary px-4">
                  Aplicar
                </button>
              </form>
              {mensajeCupon && (
                <small
                  className={`mt-2 fw-bold ${
                    mensajeCupon.includes('éxito') || mensajeCupon.includes('aplicado')
                      ? 'text-success'
                      : 'text-danger'
                  }`}
                >
                  {mensajeCupon}
                </small>
              )}
              <small className="text-muted mt-2">Prueba cupones: <b>MILSABORES10</b>, <b>DUOC2026</b></small>
            </div>

            <div className="card border-0 shadow-sm p-4">
              <h4 className="fw-bold mb-3">Resumen de Compra</h4>
              <hr />
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Subtotal:</span>
                <span className="fw-bold">${subtotal.toLocaleString('es-CL')}</span>
              </div>

              {totalDescuento > 0 && (
                <div className="d-flex justify-content-between text-success mb-2">
                  <span>Descuento Cupón:</span>
                  <span className="fw-bold">-${totalDescuento.toLocaleString('es-CL')}</span>
                </div>
              )}

              {tieneDescuentoSenior && (
                <div className="d-flex justify-content-between text-success mb-2">
                  <span>Descuento Senior (50%):</span>
                  <span className="fw-bold">-${descuentoSeniorMonto.toLocaleString('es-CL')}</span>
                </div>
              )}

              <hr />
              <div className="d-flex justify-content-between h5 fw-bold mb-4">
                <span>Total:</span>
                <span className="text-primary">${totalPagar.toLocaleString('es-CL')}</span>
              </div>

              {tieneDescuentoSenior && (
                <div className="badge bg-success text-wrap p-2 mb-3">
                  50% de Descuento Senior aplicado por ser mayor de 50 años
                </div>
              )}

              {!mostrarCheckout && (
                <button
                  className="btn btn-success w-100 py-3 rounded-pill fw-bold shadow-sm"
                  onClick={() => setMostrarCheckout(true)}
                >
                  Proceder al Pago
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}