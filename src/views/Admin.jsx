import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import RichTextEditor from '../components/RichTextEditor';
import DOMPurify from 'dompurify';

const CATEGORIAS_DISPONIBLES = [
  { value: 'tortas-cuadradas', label: 'Tortas Cuadradas' },
  { value: 'tortas-circulares', label: 'Tortas Circulares' },
  { value: 'postres-individuales', label: 'Postres Individuales' },
  { value: 'sin-azucar', label: 'Sin Azúcar' },
  { value: 'tradicional', label: 'Pastelería Tradicional' },
  { value: 'sin-gluten', label: 'Sin Gluten' },
  { value: 'vegana', label: 'Vegana' },
  { value: 'especiales', label: 'Tortas Especiales' }
];

const FORM_INICIAL = {
  codigo: '',
  nombre: '',
  precio: '',
  stock: 10,
  categoria: 'tortas-cuadradas',
  tamano: 'mediano',
  imagen: '/img/product_1.jpg',
  descripcion: ''
};

export default function Admin({ soloLecturaVendedor = false }) {
  const {
    productos,
    agregarProductoAdmin,
    editarProductoAdmin,
    eliminarProductoAdmin,
    restaurarProductosIniciales
  } = useCart();

  const [form, setForm] = useState(FORM_INICIAL);
  const [editandoId, setEditandoId] = useState(null);
  const [errores, setErrores] = useState({});
  const [mensaje, setMensaje] = useState('');

  // Estados para Moderación de Comentarios / Comunidad desde el Admin
  const [comentarios, setComentarios] = useState(() => {
    const guardados = localStorage.getItem('comunidad_milsabores');
    if (guardados) return JSON.parse(guardados);
    return [];
  });
  const [formComentario, setFormComentario] = useState({ titulo: '', tipo: 'Receta & Tip', contenido: '' });
  const [errorComentario, setErrorComentario] = useState('');

  useEffect(() => {
    localStorage.setItem('comunidad_milsabores', JSON.stringify(comentarios));
  }, [comentarios]);

  // Estados para Bandeja de Mensajes y Solicitudes de Contacto
  const [consultasContacto, setConsultasContacto] = useState(() => {
    try {
      const guardadas = localStorage.getItem('consultas_milsabores');
      return guardadas ? JSON.parse(guardadas) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('consultas_milsabores', JSON.stringify(consultasContacto));
  }, [consultasContacto]);

  const handleToggleLeidoConsulta = (id) => {
    setConsultasContacto((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, leido: !item.leido } : item
      )
    );
    setMensaje('Estado de la solicitud actualizado.');
    setTimeout(() => setMensaje(''), 3000);
  };

  const handleEliminarConsulta = (id) => {
    if (window.confirm('¿Deseas eliminar esta solicitud de contacto?')) {
      setConsultasContacto((prev) => prev.filter((item) => item.id !== id));
      setMensaje('Solicitud de contacto eliminada.');
      setTimeout(() => setMensaje(''), 3000);
    }
  };

  // Validación y envío de productos
  const validarFormulario = () => {
    const nuevosErrores = {};
    if (!form.nombre.trim() || form.nombre.trim().length < 3) {
      nuevosErrores.nombre = 'El nombre debe tener al menos 3 caracteres.';
    }
    if (!form.precio || Number(form.precio) <= 0) {
      nuevosErrores.precio = 'Ingresa un precio válido mayor a 0.';
    }
    if (form.stock === '' || Number(form.stock) < 0 || Number(form.stock) > 100) {
      nuevosErrores.stock = 'El límite debe estar entre 0 y 100 unidades.';
    }
    if (!form.descripcion.trim()) {
      nuevosErrores.descripcion = 'Agrega una breve descripción del producto.';
    }
    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validarFormulario()) return;

    if (editandoId) {
      editarProductoAdmin(editandoId, form);
      setMensaje(`Producto "${form.nombre}" actualizado correctamente.`);
      setEditandoId(null);
    } else {
      agregarProductoAdmin(form);
      setMensaje(`Producto "${form.nombre}" agregado al catálogo.`);
    }

    setForm(FORM_INICIAL);
    setErrores({});
    setTimeout(() => setMensaje(''), 3000);
  };

  const iniciarEdicion = (producto) => {
    setEditandoId(producto.id);
    setForm({
      codigo: producto.codigo || '',
      nombre: producto.nombre || '',
      precio: producto.precio || '',
      stock: producto.stock !== undefined ? producto.stock : 10,
      categoria: producto.categoria || 'tortas-cuadradas',
      tamano: producto.tamano || 'mediano',
      imagen: producto.imagen || `/img/product_${producto.id}.jpg`,
      descripcion: producto.descripcion || ''
    });
    setErrores({});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelarEdicion = () => {
    setEditandoId(null);
    setForm(FORM_INICIAL);
    setErrores({});
  };

  const handleEliminar = (prod) => {
    if (window.confirm(`¿Estás seguro de eliminar "${prod.nombre}"?`)) {
      eliminarProductoAdmin(prod.id);
      if (editandoId === prod.id) cancelarEdicion();
      setMensaje(`Producto "${prod.nombre}" eliminado.`);
      setTimeout(() => setMensaje(''), 3000);
    }
  };

  // Funciones de Moderación de Comentarios
  const handleAdminPublicarComentario = (e) => {
    e.preventDefault();
    const textoPlano = formComentario.contenido.replace(/<[^>]*>?/gm, '').trim();
    if (!formComentario.titulo.trim() || !textoPlano) {
      setErrorComentario('Completa el título y el contenido del comentario o tip.');
      return;
    }

    const nuevo = {
      id: Date.now(),
      autor: 'Maestro Pastelero Mil Sabores',
      rol: 'admin',
      tipo: formComentario.tipo,
      titulo: formComentario.titulo.trim(),
      contenido: formComentario.contenido,
      fecha: new Date().toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })
    };

    setComentarios([nuevo, ...comentarios]);
    setFormComentario({ titulo: '', tipo: 'Receta & Tip', contenido: '' });
    setErrorComentario('');
    setMensaje('Publicación oficial agregada a la comunidad.');
    setTimeout(() => setMensaje(''), 3000);
  };

  const handleEliminarComentarioAdmin = (id) => {
    if (window.confirm('¿Deseas eliminar este comentario o reseña de la comunidad?')) {
      setComentarios(comentarios.filter((c) => c.id !== id));
      setMensaje('Comentario eliminado de la comunidad.');
      setTimeout(() => setMensaje(''), 3000);
    }
  };

  const obtenerNombreCategoria = (valor) => {
    const catValor = typeof valor === 'object' ? valor?.nombre : valor;
    const encontrada = CATEGORIAS_DISPONIBLES.find((c) => c.value === catValor);
    return encontrada ? encontrada.label : catValor;
  };

  const consultasPendientes = consultasContacto.filter((c) => !c.leido).length;

  return (
    <div className="container my-5">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <h2 className="mb-0 fw-bold">Panel de Administración - Mil Sabores</h2>
        <button
          type="button"
          className="btn btn-outline-secondary btn-sm"
          onClick={() => {
            if (window.confirm('¿Restaurar los 16 productos originales de la pastelería?')) {
              restaurarProductosIniciales();
              cancelarEdicion();
              setMensaje('Catálogo original restaurado.');
              setTimeout(() => setMensaje(''), 3000);
            }
          }}
        >
          Restaurar Catálogo Original
        </button>
      </div>

      {mensaje && (
        <div className="alert alert-success fw-semibold shadow-sm" role="alert">
          {mensaje}
        </div>
      )}

      {/* SECCIÓN 1: GESTIÓN DE PRODUCTOS (CRUD) */}
      <div className="row mb-5">
        <div className="col-lg-5 mb-4">
          <div className={`card p-4 shadow-sm border-0 ${editandoId ? 'border-warning border-2' : ''}`}>
            <h4 className="fw-bold">
              {editandoId ? 'Editar Producto' : 'Agregar Nuevo Producto'}
            </h4>

            <form onSubmit={handleSubmit} className="mt-3" noValidate>
              <div className="row g-2 mb-3">
                <div className="col-4">
                  <label className="form-label fw-semibold">Código</label>
                  <input
                    type="text"
                    className="form-control"
                    value={form.codigo}
                    onChange={(e) => setForm({ ...form, codigo: e.target.value })}
                    placeholder="Ej: TC003"
                  />
                </div>
                <div className="col-8">
                  <label className="form-label fw-semibold">Nombre del Producto</label>
                  <input
                    type="text"
                    className={`form-control ${errores.nombre ? 'is-invalid' : ''}`}
                    value={form.nombre}
                    onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                    placeholder="Ej: Torta Amor"
                  />
                  {errores.nombre && <div className="invalid-feedback">{errores.nombre}</div>}
                </div>
              </div>

              <div className="row g-2 mb-3">
                <div className="col-4">
                  <label className="form-label fw-semibold">Precio ($)</label>
                  <input
                    type="number"
                    className={`form-control ${errores.precio ? 'is-invalid' : ''}`}
                    value={form.precio}
                    onChange={(e) => setForm({ ...form, precio: e.target.value })}
                    placeholder="45000"
                  />
                  {errores.precio && <div className="invalid-feedback">{errores.precio}</div>}
                </div>

                <div className="col-4">
                  <label className="form-label fw-semibold">Stock Máx.</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    className={`form-control ${errores.stock ? 'is-invalid' : ''}`}
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
                    placeholder="10"
                  />
                  {errores.stock && <div className="invalid-feedback">{errores.stock}</div>}
                </div>

                <div className="col-4">
                  <label className="form-label fw-semibold">Tamaño</label>
                  <select
                    className="form-select"
                    value={form.tamano}
                    onChange={(e) => setForm({ ...form, tamano: e.target.value })}
                  >
                    <option value="individual">Individual</option>
                    <option value="chico">Chico</option>
                    <option value="mediano">Mediano</option>
                    <option value="grande">Grande</option>
                  </select>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">Categoría</label>
                <select
                  className="form-select"
                  value={form.categoria}
                  onChange={(e) => setForm({ ...form, categoria: e.target.value })}
                >
                  {CATEGORIAS_DISPONIBLES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">Ruta de Imagen</label>
                <input
                  type="text"
                  className="form-control"
                  value={form.imagen}
                  onChange={(e) => setForm({ ...form, imagen: e.target.value })}
                  placeholder="/img/product_1.jpg"
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">
                  Descripción Enriquecida (Usa negrita para alérgenos) *
                </label>
                <RichTextEditor
                  value={form.descripcion}
                  onChange={(htmlContent) => setForm({ ...form, descripcion: htmlContent })}
                  placeholder="Ej: Contiene <b>nueces</b> y leche..."
                />
                {errores.descripcion && (
                  <div className="text-danger small mt-1">{errores.descripcion}</div>
                )}
              </div>

              <div className="d-grid gap-2">
                <button
                  type="submit"
                  className={`btn fw-bold ${editandoId ? 'btn-warning' : 'btn-primary'}`}
                >
                  {editandoId ? 'Actualizar Producto' : 'Guardar Producto'}
                </button>

                {editandoId && (
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={cancelarEdicion}
                  >
                    Cancelar Edición
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        <div className="col-lg-7">
          <div className="card p-4 shadow-sm border-0">
            <h4 className="fw-bold">Inventario Actual ({productos.length} productos)</h4>
            <div className="table-responsive mt-3" style={{ maxHeight: '550px', overflowY: 'auto' }}>
              <table className="table table-hover align-middle">
                <thead className="table-light sticky-top">
                  <tr>
                    <th>Cód.</th>
                    <th>Producto</th>
                    <th>Categoría</th>
                    <th>Stock</th>
                    <th>Precio</th>
                    <th className="text-end">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {productos.map((prod) => (
                    <tr key={prod.id} className={editandoId === prod.id ? 'table-warning' : ''}>
                      <td>
                        <small className="text-muted fw-semibold">{prod.codigo || '-'}</small>
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-3">
                          <img
                            src={prod.imagen || `/img/product_${prod.id}.jpg`}
                            alt={prod.nombre}
                            className="rounded-3 border flex-shrink-0"
                            style={{
                              width: '52px',
                              height: '52px',
                              objectFit: 'cover'
                            }}
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = `/img/product_${prod.id}.jpg`;
                            }}
                          />
                          <div>
                            <div className="fw-semibold">{prod.nombre}</div>
                            <small className="text-muted text-capitalize">{prod.tamano}</small>
                            {prod.descripcion && (
                              <div
                                className="text-muted small mt-1"
                                dangerouslySetInnerHTML={{
                                  __html: DOMPurify.sanitize(prod.descripcion)
                                }}
                              />
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="badge bg-secondary">
                          {obtenerNombreCategoria(prod.categoria)}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${prod.stock > 0 ? 'bg-info text-dark' : 'bg-danger'}`}>
                          {prod.stock ?? 10} unid.
                        </span>
                      </td>
                      <td className="fw-semibold">
                        ${Number(prod.precio).toLocaleString('es-CL')}
                      </td>
                      <td className="text-end text-nowrap">
                        <button
                          className="btn btn-sm btn-outline-primary me-1"
                          onClick={() => iniciarEdicion(prod)}
                        >
                          Editar
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleEliminar(prod)}
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* SECCIÓN 2: MODERACIÓN Y CREACIÓN DE COMENTARIOS / RESEÑAS */}
      <hr className="my-5" />
      <div className="row">
        <div className="col-12 mb-3">
          <h3 className="fw-bold">💬 Moderación de la Comunidad (Reseñas y Tips)</h3>
          <p className="text-muted">
            Como administrador puedes publicar avisos oficiales o recetas, y eliminar cualquier comentario inapropiado o reseña de los usuarios.
          </p>
        </div>

        {/* Formulario de publicación admin */}
        <div className="col-lg-5 mb-4">
          <div className="card p-4 shadow-sm border-0">
            <h5 className="fw-bold mb-3">Publicar Anuncio u Oficial</h5>
            {errorComentario && <div className="alert alert-danger py-2 small">{errorComentario}</div>}
            
            <form onSubmit={handleAdminPublicarComentario}>
              <div className="mb-3">
                <label className="form-label fw-semibold">Tipo</label>
                <select
                  className="form-select"
                  value={formComentario.tipo}
                  onChange={(e) => setFormComentario({ ...formComentario, tipo: e.target.value })}
                >
                  <option value="Receta & Tip">Receta & Tip</option>
                  <option value="Anuncio">Anuncio Oficial</option>
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">Título *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ej: Nuevo horario de atención Fiestas Patrias"
                  value={formComentario.titulo}
                  onChange={(e) => setFormComentario({ ...formComentario, titulo: e.target.value })}
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">Contenido Enriquecido *</label>
                <RichTextEditor
                  value={formComentario.contenido}
                  onChange={(html) => setFormComentario({ ...formComentario, contenido: html })}
                  placeholder="Escribe el anuncio oficial o tip..."
                />
              </div>

              <button type="submit" className="btn btn-dark w-100 rounded-pill fw-bold">
                Publicar en Comunidad 📢
              </button>
            </form>
          </div>
        </div>

        {/* Tabla de Moderación de Comentarios Existentes */}
        <div className="col-lg-7">
          <div className="card p-4 shadow-sm border-0">
            <h5 className="fw-bold mb-3">Comentarios y Reseñas Registrados ({comentarios.length})</h5>
            
            {comentarios.length === 0 ? (
              <p className="text-muted text-center py-4">No hay publicaciones en la comunidad actualmente.</p>
            ) : (
              <div className="table-responsive" style={{ maxHeight: '450px', overflowY: 'auto' }}>
                <table className="table table-hover align-middle">
                  <thead className="table-light sticky-top">
                    <tr>
                      <th>Autor / Rol</th>
                      <th>Título / Tipo</th>
                      <th className="text-end">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comentarios.map((c) => (
                      <tr key={c.id}>
                        <td>
                          <div className="fw-semibold">{c.autor}</div>
                          <span className={`badge ${c.rol === 'admin' ? 'bg-dark text-warning' : 'bg-warning text-dark'}`}>
                            {c.rol}
                          </span>
                        </td>
                        <td>
                          <div className="fw-bold">{c.titulo}</div>
                          <small className="text-muted">{c.tipo} - {c.fecha}</small>
                        </td>
                        <td className="text-end">
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleEliminarComentarioAdmin(c.id)}
                            title="Eliminar publicación"
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SECCIÓN 3: BANDEJA DE MENSAJES Y SOLICITUDES DE CONTACTO */}
      <hr className="my-5" />
      <div className="row">
        <div className="col-12">
          <div className="card p-4 shadow-sm border-0">
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
              <div>
                <h3 className="fw-bold mb-1">📩 Mensajes y Solicitudes de Contacto</h3>
                <p className="text-muted mb-0">
                  Revisa las consultas enviadas por los clientes desde el formulario de Contacto de la pastelería.
                </p>
              </div>
              <div className="d-flex gap-2">
                <span className="badge bg-warning text-dark px-3 py-2 rounded-pill">
                  Pendientes: {consultasPendientes}
                </span>
                <span className="badge bg-dark text-warning px-3 py-2 rounded-pill">
                  Total: {consultasContacto.length}
                </span>
              </div>
            </div>

            {consultasContacto.length === 0 ? (
              <p className="text-muted text-center py-4 mb-0">
                No hay mensajes o solicitudes de contacto registradas todavía.
              </p>
            ) : (
              <div className="table-responsive" style={{ maxHeight: '450px', overflowY: 'auto' }}>
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light sticky-top">
                    <tr>
                      <th>Estado</th>
                      <th>Cliente</th>
                      <th>Correo</th>
                      <th>Mensaje / Solicitud</th>
                      <th>Fecha</th>
                      <th className="text-end">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {consultasContacto.map((consulta) => (
                      <tr key={consulta.id}>
                        <td>
                          <span
                            className={`badge rounded-pill ${
                              consulta.leido
                                ? 'bg-success-subtle text-success'
                                : 'bg-warning text-dark'
                            }`}
                          >
                            {consulta.leido ? 'Respondido' : 'Pendiente'}
                          </span>
                        </td>
                        <td className="fw-semibold">{consulta.nombre}</td>
                        <td>
                          <a href={`mailto:${consulta.correo}`} className="text-decoration-none">
                            {consulta.correo}
                          </a>
                        </td>
                        <td style={{ maxWidth: '360px' }}>
                          <div className="small text-secondary">{consulta.mensaje}</div>
                        </td>
                        <td>
                          <small className="text-muted">{consulta.fecha}</small>
                        </td>
                        <td className="text-end text-nowrap">
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-success me-1"
                            onClick={() => handleToggleLeidoConsulta(consulta.id)}
                          >
                            {consulta.leido ? 'Marcar pendiente' : 'Marcar respondido'}
                          </button>
                          {!soloLecturaVendedor && (
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleEliminarConsulta(consulta.id)}
                            >
                              Eliminar
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
