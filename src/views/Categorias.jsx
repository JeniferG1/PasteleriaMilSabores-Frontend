import React, { useState, useRef } from 'react';
import { useCart } from '../context/CartContext';
import { SellosNutricionales } from '../components/SellosNutricionales';
import DOMPurify from 'dompurify';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP, ScrollTrigger);

export default function Categorias() {
  const { productos, agregarAlCarrito } = useCart();
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('todas');

  const [productoSeleccionado, setProductoSeleccionado] = useState(null);

  const container = useRef(null);
  const { contextSafe } = useGSAP({ scope: container });

  const productosFiltrados = productos.filter((prod) => {
    if (categoriaSeleccionada === 'todas') return true;
    const cat = typeof prod.categoria === 'object' ? prod.categoria?.nombre : prod.categoria;
    return cat === categoriaSeleccionada;
  });

  useGSAP(() => {
    gsap.from('.cat-header', {
      y: -25,
      opacity: 0,
      duration: 0.7,
      ease: 'power2.out',
      clearProps: 'transform,opacity'
    });

    gsap.from('.cat-filter', {
      y: 25,
      opacity: 0,
      duration: 0.65,
      delay: 0.15,
      ease: 'power2.out',
      clearProps: 'transform,opacity'
    });
  }, { scope: container });

  useGSAP(() => {
    if (productosFiltrados.length > 0) {
      gsap.from('.product-item', {
        y: 45,
        opacity: 0,
        duration: 0.65,
        stagger: { amount: 0.45, from: 'start' },
        ease: 'power2.out',
        clearProps: 'transform,opacity',
        scrollTrigger: {
          trigger: '.catalogo-grid',
          start: 'top 85%'
        }
      });
    }
  }, { scope: container, dependencies: [categoriaSeleccionada, productosFiltrados.length] });

  const handleCardEnter = contextSafe((e) => {
    gsap.to(e.currentTarget, {
      y: -6,
      scale: 1.02,
      duration: 0.25,
      ease: 'power2.out'
    });
  });

  const handleCardLeave = contextSafe((e) => {
    gsap.to(e.currentTarget, {
      y: 0,
      scale: 1,
      duration: 0.25,
      ease: 'power2.out'
    });
  });

  const handleBtnPulse = contextSafe((e) => {
    gsap.fromTo(
      e.currentTarget,
      { scale: 0.94 },
      { scale: 1, duration: 0.3, ease: 'back.out(2)' }
    );
  });

  const handleImageError = (e, producto) => {
    e.currentTarget.onerror = null;
    e.currentTarget.src = `/img/product_${producto.id}.jpg`;
  };

  return (
    <div ref={container} className="container py-5">
      <div className="text-center mb-5 cat-header">
        <h1 className="display-5 fw-bold mb-3">Catálogo de Productos 🎂</h1>
        <p className="text-muted fs-5">
          Encuentra la torta o el postre perfecto para tu celebración.
        </p>
        <p className="text-muted small">
          Haz clic en cualquier producto para ver su foto completa y detalles
        </p>
      </div>

      <div className="row justify-content-center mb-5 cat-filter">
        <div className="col-md-5 col-lg-4">
          <div className="card shadow-sm border-0 p-3 bg-white rounded-3">
            <label htmlFor="filtroCategoria" className="form-label fw-bold text-dark mb-2">
              Seleccionar Categoría:
            </label>
            <select
              id="filtroCategoria"
              className="form-select border-warning shadow-sm"
              value={categoriaSeleccionada}
              onChange={(e) => setCategoriaSeleccionada(e.target.value)}
              style={{ borderRadius: '10px' }}
            >
              <option value="todas">Todas las categorías</option>
              <option value="tortas-cuadradas">Tortas Cuadradas</option>
              <option value="tortas-circulares">Tortas Circulares</option>
              <option value="postres-individuales">Postres Individuales</option>
              <option value="sin-azucar">Sin Azúcar</option>
              <option value="tradicional">Pastelería Tradicional</option>
              <option value="sin-gluten">Sin Gluten</option>
              <option value="vegana">Opciones Veganas</option>
              <option value="especiales">Especiales & Celebraciones</option>
            </select>
          </div>
        </div>
      </div>

      <div className="row g-4 catalogo-grid">
        {productosFiltrados.length > 0 ? (
          productosFiltrados.map((prod) => (
            <div className="col-lg-4 col-md-6" key={prod.id}>
              <div
                className="card product-item bg-white rounded-3 shadow-sm h-100 overflow-hidden border-0"
                onMouseEnter={handleCardEnter}
                onMouseLeave={handleCardLeave}
              >
                <div
                  className="position-relative overflow-hidden"
                  style={{ height: '250px', cursor: 'pointer' }}
                  onClick={() => setProductoSeleccionado(prod)}
                  title="Clic para ver imagen completa y detalles"
                >
                  <img
                    className="w-100 h-100"
                    style={{ objectFit: 'cover', transition: 'transform 0.3s ease' }}
                    src={prod.imagen || `/img/product_${prod.id}.jpg`}
                    alt={prod.nombre}
                    onError={(e) => handleImageError(e, prod)}
                  />
                  {prod.tamano && (
                    <span className="badge bg-dark position-absolute top-0 end-0 m-3 text-capitalize px-3 py-2">
                      {prod.tamano}
                    </span>
                  )}
                  <span
                    className="position-absolute bottom-0 end-0 m-2 badge bg-dark bg-opacity-75 px-3 py-2 rounded-pill"
                    style={{ fontSize: '0.75rem' }}
                  >
                    🔍 Ver detalle
                  </span>
                </div>

                <div className="text-center p-4 d-flex flex-column flex-grow-1">
                  <h5
                    className="mb-2 fw-bold text-dark"
                    style={{ cursor: 'pointer' }}
                    onClick={() => setProductoSeleccionado(prod)}
                  >
                    {prod.nombre}
                  </h5>
                  <span className="fw-bold fs-4 mb-3" style={{ color: '#d48b44' }}>
                    ${Number(prod.precio).toLocaleString('es-CL')}
                  </span>

                  <div
                    className="text-muted small mb-3 flex-grow-1"
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(prod.descripcion || '')
                    }}
                  />

                  <div className="d-flex justify-content-center mb-3">
                    <SellosNutricionales nombreProducto={prod.nombre} />
                  </div>

                  <div className="mt-auto">
                    <button
                      className="btn btn-warning rounded-pill py-2 px-4 w-100 fw-bold shadow-sm"
                      onClick={(e) => {
                        handleBtnPulse(e);
                        agregarAlCarrito(prod);
                      }}
                    >
                      Añadir al Carrito 🛒
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-5">
            <h5 className="text-muted">No se encontraron productos en esta categoría.</h5>
          </div>
        )}
      </div>

      {productoSeleccionado && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.65)', zIndex: 1050 }}
          onClick={() => setProductoSeleccionado(null)}
        >
          <div
            className="modal-dialog modal-dialog-centered modal-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
              <div className="modal-header border-0 pb-0">
                <span className="badge bg-warning text-dark px-3 py-2 rounded-pill fw-semibold text-capitalize">
                  {typeof productoSeleccionado.categoria === 'object'
                    ? productoSeleccionado.categoria?.nombre
                    : productoSeleccionado.categoria || 'Especialidad Artesanal'}
                </span>
                <button
                  type="button"
                  className="btn-close"
                  aria-label="Cerrar"
                  onClick={() => setProductoSeleccionado(null)}
                ></button>
              </div>

              <div className="modal-body p-4">
                <div className="row g-4 align-items-center">
                  <div className="col-md-6 text-center bg-light rounded-3 p-3">
                    <img
                      src={productoSeleccionado.imagen || `/img/product_${productoSeleccionado.id}.jpg`}
                      alt={productoSeleccionado.nombre}
                      className="img-fluid rounded-3"
                      style={{ maxHeight: '420px', width: '100%', objectFit: 'contain' }}
                      onError={(e) => handleImageError(e, productoSeleccionado)}
                    />
                  </div>

                  <div className="col-md-6 d-flex flex-column">
                    <h3 className="fw-bold mb-2">{productoSeleccionado.nombre}</h3>
                    <h4 className="fw-bold mb-3" style={{ color: '#d48b44' }}>
                      ${Number(productoSeleccionado.precio).toLocaleString('es-CL')}
                    </h4>

                    <div
                      className="text-muted mb-3"
                      style={{ lineHeight: '1.6' }}
                      dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(productoSeleccionado.descripcion || '')
                      }}
                    />

                    {productoSeleccionado.tamano && (
                      <p className="small text-secondary mb-2 text-capitalize">
                        <strong>Tamaño / Formato:</strong> {productoSeleccionado.tamano}
                      </p>
                    )}

                    {productoSeleccionado.stock !== undefined && (
                      <p className="small text-secondary mb-3">
                        <strong>Stock disponible:</strong> {productoSeleccionado.stock} unidades
                      </p>
                    )}

                    <div className="mb-4">
                      <SellosNutricionales nombreProducto={productoSeleccionado.nombre} />
                    </div>

                    <div className="d-grid gap-2 mt-auto">
                      <button
                        className="btn btn-warning btn-lg rounded-pill fw-bold shadow-sm"
                        onClick={() => {
                          agregarAlCarrito(productoSeleccionado);
                          setProductoSeleccionado(null);
                        }}
                      >
                        Añadir al Carrito 🛒
                      </button>
                      <button
                        className="btn btn-outline-secondary rounded-pill"
                        onClick={() => setProductoSeleccionado(null)}
                      >
                        Seguir mirando
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}