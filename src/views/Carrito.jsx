import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth, esCorreoDuoc } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import CakeTower from '../components/CakeTower';

const esCumpleanosHoy = (fechaNacimiento) => {
  if (!fechaNacimiento) return false;
  const hoy = new Date();
  const partes = fechaNacimiento.split('-');
  if (partes.length < 3) return false;
  const mesNac = Number(partes[1]);
  const diaNac = Number(partes[2]);
  return hoy.getMonth() + 1 === mesNac && hoy.getDate() === diaNac;
};

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
    mensajeStock,
    agregarRegalo
  } = useCart();

  const { usuarioLogueado } = useAuth();
  const navigate = useNavigate();
  const [inputCupon, setInputCupon] = useState('');

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
    dedicatoria: '',
    numeroTarjeta: '',
    vencimientoTarjeta: '',
    cvvTarjeta: ''
  });

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

  // Reglas de negocio: Descuento Senior 50% y Beneficio Cumpleaños Duoc UC
  const tieneDescuentoSenior = Boolean(
    usuarioLogueado?.esSenior || usuarioLogueado?.descuento === 0.5
  );
  const descuentoSeniorMonto = tieneDescuentoSenior ? subtotal * 0.5 : 0;
  const totalDescuentosAcumulados = (totalDescuento || 0) + descuentoSeniorMonto;
  const totalPagar = Math.max(0, subtotal - totalDescuentosAcumulados);

  const esUsuarioDuoc = Boolean(
    usuarioLogueado?.esDuoc || esCorreoDuoc(usuarioLogueado?.email || '')
  );
  const estaDeCumpleanosDuoc =
    esUsuarioDuoc && esCumpleanosHoy(usuarioLogueado?.fechaNacimiento);
  const yaReclamoTortaCumpleanos = cart.some(
    (item) => item.etiquetaRegalo === 'Cumpleaños Duoc UC'
  );

  const handleReclamarTortaCumpleanos = () => {
    if (!estaDeCumpleanosDuoc || yaReclamoTortaCumpleanos) return;
    agregarRegalo('Torta Especial de Cumpleaños', 'Cumpleaños Duoc UC');
  };

  const handleCheckoutChange = (e) => {
    const { name, value } = e.target;
    let valorFormateado = value;

    if (name === 'numeroTarjeta') {
      const soloNumeros = value.replace(/\D/g, '').slice(0, 16);
      valorFormateado = soloNumeros.replace(/(\d{4})(?=\d)/g, '$1 ');
    }

    if (name === 'vencimientoTarjeta') {
      const soloNumeros = value.replace(/\D/g, '').slice(0, 4);
      if (soloNumeros.length >= 3) {
        valorFormateado = `${soloNumeros.slice(0, 2)}/${soloNumeros.slice(2)}`;
      } else {
        valorFormateado = soloNumeros;
      }
    }

    if (name === 'cvvTarjeta') {
      valorFormateado = value.replace(/\D/g, '').slice(0, 4);
    }

    setDatosEnvio({ ...datosEnvio, [name]: valorFormateado });
    if (erroresCheckout[name]) {
      setErroresCheckout({ ...erroresCheckout, [name]: '' });
    }
  };

  const validarCheckout = () => {
    const errores = {};
    if (!datosEnvio.nombre.trim()) errores.nombre = 'El nombre de quien recibe es obligatorio.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datosEnvio.email)) {
      errores.email = 'Correo inválido.';
    }
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

    const tarjetaLimpia = datosEnvio.numeroTarjeta.replace(/\s/g, '');
    if (tarjetaLimpia.length < 16) {
      errores.numeroTarjeta = 'Ingresa los 16 dígitos de tu tarjeta.';
    }
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(datosEnvio.vencimientoTarjeta)) {
      errores.vencimientoTarjeta = 'Formato inválido (MM/AA).';
    }
    if (datosEnvio.cvvTarjeta.length < 3) {
      errores.cvvTarjeta = 'Ingresa un CVV válido (3 o 4 dígitos).';
    }

    setErroresCheckout(errores);
    return Object.keys(errores).length === 0;
  };

  const handleConfirmarCompra = (e) => {
    e.preventDefault();
    if (!validarCheckout()) return;

    const tarjetaLimpia = datosEnvio.numeroTarjeta.replace(/\s/g, '');
    const ultimosCuatro = tarjetaLimpia.slice(-4);

    const resumenOrden = {
      numeroOrden: `MS-${Math.floor(100000 + Math.random() * 900000)}`,
      cliente: datosEnvio.nombre,
      direccion: `${datosEnvio.direccion}, ${datosEnvio.comuna}`,
      fechaEntrega: datosEnvio.fechaEntrega,
      dedicatoria: datosEnvio.dedicatoria,
      tarjetaTerminadaEn: ultimosCuatro,
      totalPagado: totalPagar,
      items: [...cart]
    };

    const historialPrevio = JSON.parse(localStorage.getItem('boletas_milsabores') || '[]');
    localStorage.setItem(
      'boletas_milsabores',
      JSON.stringify([resumenOrden, ...historialPrevio])
    );

    setCompraExitosa(resumenOrden);
    vaciarCarrito();
  };

  const handleProcederPagoClick = () => {
    if (!usuarioLogueado) {
      alert('Debes iniciar sesión o registrarte para realizar una compra.');
      navigate('/login');
      return;
    }
    setMostrarCheckout(true);
  };

  const yaTieneRegaloJuego = cart.some(
    (item) => item.esRegalo && item.etiquetaRegalo !== 'Cumpleaños Duoc UC'
  );

  if (compraExitosa) {
    return (
      <div className="container py-5">
        <div className="card border-0 shadow-sm p-5 mx-auto text-center" style={{ maxWidth: '650px' }}>
          <h2 className="fw-bold text-success mb-2">¡Pedido Confirmado con Éxito!</h2>
          <p className="text-muted mb-4">
            Boleta / Orden N° <strong>{compraExitosa.numeroOrden}</strong>
          </p>

          <div className="bg-light p-4 rounded-3 text-start mb-4">
            <p className="mb-1"><strong>Cliente:</strong> {compraExitosa.cliente}</p>
            <p className="mb-1"><strong>Dirección de envío:</strong> {compraExitosa.direccion}</p>
            <p className="mb-1"><strong>Fecha programada:</strong> {compraExitosa.fechaEntrega}</p>
            <p className="mb-1">
              <strong>Método de pago:</strong> Tarjeta terminada en **** {compraExitosa.tarjetaTerminadaEn}
            </p>
            {compraExitosa.dedicatoria && (
              <p className="mb-1"><strong>Mensaje en torta:</strong> "{compraExitosa.dedicatoria}"</p>
            )}
            <hr />
            <h6 className="fw-bold mb-2">Detalle de productos:</h6>
            <ul className="list-unstyled small mb-3">
              {compraExitosa.items.map((prod) => (
                <li key={prod.id} className="d-flex justify-content-between">
                  <span>{prod.cantidad}x {prod.nombre}</span>
                  <span>
                    {prod.precio === 0
                      ? 'GRATIS ($0)'
                      : `$${(prod.precio * prod.cantidad).toLocaleString('es-CL')}`}
                  </span>
                </li>
              ))}
            </ul>
            <hr />
            <h5 className="fw-bold text-end mb-0">
              Total Pagado: ${compraExitosa.totalPagado.toLocaleString('es-CL')}
            </h5>
          </div>

          <Link to="/" className="btn btn-primary rounded-pill px-5 py-2 fw-bold">
            Volver al Inicio
          </Link>
        </div>
      </div>
    );
  }

  if (!cart || cart.length === 0) {
    return (
      <div className="container-xxl py-5">
        <div className="container text-center py-5">
          <div className="p-5 bg-light rounded-3 shadow-sm mx-auto" style={{ maxWidth: '600px' }}>
            <h2 className="mb-3 fw-bold">Tu Carrito está Vacío</h2>
            <p className="text-muted mb-4">
              Añade algunos productos de nuestra pastelería para comenzar.
            </p>
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
          <p className="text-muted">
            Revisa tus productos seleccionados, juega por un postre gratis y completa tu entrega
          </p>
          <hr className="w-25 mx-auto bg-primary" />
        </div>

        {esUsuarioDuoc && (
          <div className="alert alert-info d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
            <div>
              <strong>🎓 Beneficio Estudiante/Comunidad Duoc UC:</strong>{' '}
              {estaDeCumpleanosDuoc
                ? '¡Hoy es tu cumpleaños! Tienes disponible una Torta Especial de Cumpleaños gratis ($0).'
                : 'Al registrarte con correo institucional Duoc UC tienes torta gratis en el día de tu cumpleaños.'}
            </div>
            {estaDeCumpleanosDuoc && !yaReclamoTortaCumpleanos && (
              <button
                type="button"
                className="btn btn-sm btn-primary fw-bold rounded-pill px-3"
                onClick={handleReclamarTortaCumpleanos}
              >
                Reclamar Torta Gratis ($0)
              </button>
            )}
          </div>
        )}

        {mensajeStock && (
          <div className="alert alert-warning fw-semibold text-center" role="alert">
            {mensajeStock}
          </div>
        )}

        <div className="row g-4">
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
                        <tr key={item.id} className={item.esRegalo ? 'table-success' : ''}>
                          <td>
                            <div className="fw-bold">{item.nombre}</div>
                            {item.esRegalo ? (
                              <span className="badge bg-success">
                                {item.etiquetaRegalo || 'Premio Cake Tower'}
                              </span>
                            ) : (
                              <small className="text-muted">Máx. {limiteMaximo} unid. por pedido</small>
                            )}
                          </td>
                          <td>
                            {item.esRegalo ? (
                              <span className="fw-bold text-success">$0</span>
                            ) : (
                              `$${item.precio?.toLocaleString('es-CL')}`
                            )}
                          </td>
                          <td>
                            {item.esRegalo ? (
                              <div className="text-center fw-bold">1</div>
                            ) : (
                              <div className="d-flex align-items-center justify-content-center">
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-secondary px-2"
                                  onClick={() => cambiarCantidad(item.id, -1)}
                                >
                                  -
                                </button>
                                <span className="mx-3 fw-bold">{item.cantidad}</span>
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-secondary px-2"
                                  onClick={() => cambiarCantidad(item.id, 1)}
                                  disabled={alcanzoLimite}
                                  title={
                                    alcanzoLimite
                                      ? `Límite máximo de ${limiteMaximo} unidades alcanzado`
                                      : 'Aumentar cantidad'
                                  }
                                >
                                  +
                                </button>
                              </div>
                            )}
                          </td>
                          <td className="fw-bold">
                            {item.esRegalo ? (
                              <span className="text-success">GRATIS</span>
                            ) : (
                              `$${(item.precio * item.cantidad).toLocaleString('es-CL')}`
                            )}
                          </td>
                          <td className="text-center">
                            <button
                              type="button"
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
                <button
                  type="button"
                  className="btn btn-outline-danger rounded-pill px-4"
                  onClick={vaciarCarrito}
                >
                  Vaciar Carrito
                </button>
              </div>
            </div>

            {!mostrarCheckout && (
              <div className="card shadow-sm border border-warning p-4 mb-4 bg-white">
                {usuarioLogueado ? (
                  yaTieneRegaloJuego ? (
                    <div className="text-center py-3">
                      <h5 className="fw-bold text-success mb-1">
                        ¡Ya añadiste tu premio gratis a esta compra!
                      </h5>
                      <p className="text-muted small mb-0">
                        Tu postre de regalo aparece listado arriba con valor $0. Procede al pago cuando estés listo.
                      </p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <span className="badge bg-warning text-dark mb-2 px-3 py-1 rounded-pill fw-bold">
                        Beneficio Exclusivo Clientes
                      </span>
                      <h4 className="fw-bold mb-2">¡Gana un Postre Gratis para esta Compra!</h4>
                      <p className="text-muted small mb-3">
                        Supera el reto de <strong>20 pisos</strong> en <em>Cake Tower</em> antes de pagar y añade al instante uno de nuestros tres postres estrella con costo <strong>$0</strong>.
                      </p>
                      <CakeTower onSelectReward={(premio) => agregarRegalo(premio)} />
                    </div>
                  )
                ) : (
                  <div className="text-center py-3">
                    <h5 className="fw-bold mb-2">¿Quieres llevarte un postre gratis en tu pedido?</h5>
                    <p className="text-muted small mb-3">
                      Inicia sesión como cliente para desbloquear el minijuego <strong>Cake Tower</strong> antes de pagar.
                    </p>
                    <Link to="/login" className="btn btn-outline-primary rounded-pill px-4 fw-bold">
                      Iniciar Sesión para Jugar
                    </Link>
                  </div>
                )}
              </div>
            )}

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
                      {erroresCheckout.nombre && (
                        <div className="invalid-feedback">{erroresCheckout.nombre}</div>
                      )}
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
                      {erroresCheckout.email && (
                        <div className="invalid-feedback">{erroresCheckout.email}</div>
                      )}
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
                      {erroresCheckout.telefono && (
                        <div className="invalid-feedback">{erroresCheckout.telefono}</div>
                      )}
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
                      {erroresCheckout.comuna && (
                        <div className="invalid-feedback">{erroresCheckout.comuna}</div>
                      )}
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
                      {erroresCheckout.direccion && (
                        <div className="invalid-feedback">{erroresCheckout.direccion}</div>
                      )}
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
                      <label className="form-label fw-semibold">
                        Mensaje / Dedicatoria en la torta (Opcional, máx. 100 caracteres)
                      </label>
                      <input
                        type="text"
                        name="dedicatoria"
                        maxLength={100}
                        placeholder="Ej: Feliz Cumpleaños Mamá"
                        className="form-control"
                        value={datosEnvio.dedicatoria}
                        onChange={handleCheckoutChange}
                      />
                    </div>
                  </div>

                  <hr className="my-4" />
                  <h4 className="fw-bold mb-3">Método de Pago</h4>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Número de Tarjeta *</label>
                      <input
                        type="text"
                        name="numeroTarjeta"
                        placeholder="4532 1234 5678 9012"
                        maxLength={19}
                        className={`form-control ${erroresCheckout.numeroTarjeta ? 'is-invalid' : ''}`}
                        value={datosEnvio.numeroTarjeta}
                        onChange={handleCheckoutChange}
                      />
                      {erroresCheckout.numeroTarjeta && (
                        <div className="invalid-feedback">{erroresCheckout.numeroTarjeta}</div>
                      )}
                    </div>

                    <div className="col-md-3">
                      <label className="form-label fw-semibold">Vencimiento *</label>
                      <input
                        type="text"
                        name="vencimientoTarjeta"
                        placeholder="MM/AA"
                        maxLength={5}
                        className={`form-control ${erroresCheckout.vencimientoTarjeta ? 'is-invalid' : ''}`}
                        value={datosEnvio.vencimientoTarjeta}
                        onChange={handleCheckoutChange}
                      />
                      {erroresCheckout.vencimientoTarjeta && (
                        <div className="invalid-feedback">{erroresCheckout.vencimientoTarjeta}</div>
                      )}
                    </div>

                    <div className="col-md-3">
                      <label className="form-label fw-semibold">CVV *</label>
                      <input
                        type="password"
                        name="cvvTarjeta"
                        placeholder="123"
                        maxLength={4}
                        className={`form-control ${erroresCheckout.cvvTarjeta ? 'is-invalid' : ''}`}
                        value={datosEnvio.cvvTarjeta}
                        onChange={handleCheckoutChange}
                      />
                      {erroresCheckout.cvvTarjeta && (
                        <div className="invalid-feedback">{erroresCheckout.cvvTarjeta}</div>
                      )}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-success w-100 py-3 rounded-pill fw-bold mt-4 shadow-sm"
                  >
                    Confirmar y Pagar ${totalPagar.toLocaleString('es-CL')}
                  </button>
                </form>
              </div>
            )}
          </div>

          <div className="col-lg-4">
            <div className="card border-0 shadow-sm p-4 mb-4">
              <h5 className="fw-bold mb-3">Cupón de Descuento</h5>
              <form onSubmit={handleCuponSubmit} className="d-flex">
                <input
                  type="text"
                  className="form-control me-2"
                  placeholder="Ej: FELICES50"
                  value={inputCupon}
                  onChange={(e) => setInputCupon(e.target.value)}
                />
                <button type="submit" className="btn btn-secondary px-4">
                  Aplicar
                </button>
              </form>
              {mensajeCupon && (
                <small
                  className={`mt-2 d-block fw-bold ${
                    mensajeCupon.includes('éxito') || mensajeCupon.includes('aplicado')
                      ? 'text-success'
                      : 'text-danger'
                  }`}
                >
                  {mensajeCupon}
                </small>
              )}
              <small className="text-muted mt-2 d-block">
                Prueba cupones: <b>FELICES50</b>, <b>MILSABORES10</b>, <b>DUOC2026</b>
              </small>
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
                  type="button"
                  className="btn btn-success w-100 py-3 rounded-pill fw-bold shadow-sm"
                  onClick={handleProcederPagoClick}
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