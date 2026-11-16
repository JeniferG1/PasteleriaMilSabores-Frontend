import React, { useState } from 'react';
import { useCart } from '../context/CartContext';

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
  imagen: '/img/product_1.avif',
  descripcion: ''
};

export default function Admin() {
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
      imagen: producto.imagen || '/img/product_1.avif',
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

  const obtenerNombreCategoria = (valor) => {
    const encontrada = CATEGORIAS_DISPONIBLES.find((c) => c.value === valor);
    return encontrada ? encontrada.label : valor;
  };

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
        <div className="alert alert-success fw-semibold" role="alert">
          {mensaje}
        </div>
      )}

      <div className="row">
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
                  placeholder="/img/product_1.avif"
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">Descripción</label>
                <textarea
                  className={`form-control ${errores.descripcion ? 'is-invalid' : ''}`}
                  rows="2"
                  value={form.descripcion}
                  onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                  placeholder="Describe ingredientes y características..."
                ></textarea>
                {errores.descripcion && (
                  <div className="invalid-feedback">{errores.descripcion}</div>
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
            <div className="table-responsive mt-3">
              <table className="table table-hover align-middle">
                <thead className="table-light">
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
                    <tr
                      key={prod.id}
                      className={editandoId === prod.id ? 'table-warning' : ''}
                    >
                      <td>
                        <small className="text-muted fw-semibold">{prod.codigo || '-'}</small>
                      </td>
                      <td>
                        <div className="fw-semibold">{prod.nombre}</div>
                        <small className="text-muted text-capitalize">{prod.tamano}</small>
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
    </div>
  );
}