import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { SellosNutricionales } from '../components/SellosNutricionales';
import axiosClient from '../Services/axiosClient';
import DOMPurify from 'dompurify';

export default function Home() {
  const { productos: productosContext, agregarAlCarrito } = useCart();
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  
  // Estado para el producto seleccionado en el Modal de Detalle
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);

  useEffect(() => {
    // Si hay productos modificados en el contexto local (Admin), los priorizamos o combinamos
    if (productosContext && productosContext.length > 0) {
      setProductos(productosContext);
      setCargando(false);
    }

    axiosClient.get('/api/productos')
      .then((response) => {
        if (response.data && response.data.length > 0) {
          // Sincroniza descripciones editadas localmente en Admin si existen en productosContext
          const sincronizados = response.data.map((prodApi) => {
            const localMatch = productosContext?.find((p) => p.id === prodApi.id);
            return localMatch ? { ...prodApi, ...localMatch } : prodApi;
          });
          setProductos(sincronizados);
        }
        setCargando(false);
      })
      .catch((error) => {
        console.error('Usando catálogo local:', error);
        setProductos(productosContext || []);
        setCargando(false);
      });
  }, [productosContext]);

  return (
    <div className="container-fluid px-0">
      {/* Banner Principal */}
      <div 
        className="position-relative overflow-hidden text-white d-flex align-items-center"
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(17, 17, 17, 0.65) 0%, rgba(17, 17, 17, 0.75) 100%), url('/img/portada4.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          minHeight: '80vh',
          width: '100%'
        }}
      >
        <div className="container py-5 text-center position-relative" style={{ zIndex: 2 }}>
          <span className="text-uppercase tracking-widest fw-semibold text-warning mb-2 d-block" style={{ letterSpacing: '3px', fontSize: '0.9rem' }}>
            Tradición & Pasión Artesanal
          </span>
          <h1 className="display-2 fw-bold text-white mb-3">
            Pastelería Mil Sabores
          </h1>
          <p className="lead text-light mb-4 mx-auto" style={{ maxWidth: '650px', fontSize: '1.25rem', opacity: 0.9 }}>
            50 años creando experiencias dulces e inolvidables con los más finos ingredientes para la familia chilena.
          </p>
          <div className="d-flex justify-content-center gap-3 flex-wrap">
            <a href="#destacados" className="btn btn-warning btn-lg rounded-pill py-3 px-5 fw-bold shadow-sm">
              Ver Destacados 🎂
            </a>
            <Link to="/categorias" className="btn btn-outline-light btn-lg rounded-pill py-3 px-5 fw-bold">
              Explorar Categorías
            </Link>
          </div>
        </div>
      </div>

      {/* Tarjetas de Beneficios */}
      <div className="container py-5 my-4">
        <div className="row g-4">
          <div className="col-lg-4 col-md-6">
            <div className="d-flex align-items-center p-4 bg-white border-0 shadow-sm feature-card h-100 rounded-3">
              <div className="fs-1 me-3 p-3 rounded-circle" style={{ backgroundColor: '#fff8f0' }}>🌾</div>
              <div>
                <h5 className="mb-1 fw-bold">Ingredientes Frescos</h5>
                <p className="mb-0 text-muted small">Materia prima seleccionada diariamente para asegurar frescura pura.</p>
              </div>
            </div>
          </div>
          <div className="col-lg-4 col-md-6">
            <div className="d-flex align-items-center p-4 bg-white border-0 shadow-sm feature-card h-100 rounded-3">
              <div className="fs-1 me-3 p-3 rounded-circle" style={{ backgroundColor: '#fff8f0' }}>👨‍🍳</div>
              <div>
                <h5 className="mb-1 fw-bold">Receta Tradicional</h5>
                <p className="mb-0 text-muted small">Perfección artesanal transmitida de generación en generación.</p>
              </div>
            </div>
          </div>
          <div className="col-lg-4 col-md-6">
            <div className="d-flex align-items-center p-4 bg-white border-0 shadow-sm feature-card h-100 rounded-3">
              <div className="fs-1 me-3 p-3 rounded-circle" style={{ backgroundColor: '#fff8f0' }}>🚚</div>
              <div>
                <h5 className="mb-1 fw-bold">Despacho Especializado</h5>
                <p className="mb-0 text-muted small">Transporte refrigerado que mantiene la textura e integridad impecables.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Vitrina: Selección Destacada (Top 6 productos) */}
      <div className="container py-5" id="destacados">
        <div className="text-center mx-auto mb-5" style={{ maxWidth: '600px' }}>
          <span className="text-warning text-uppercase fw-bold tracking-wider" style={{ letterSpacing: '2px', fontSize: '0.85rem' }}>
            Los Favoritos de Nuestros Clientes
          </span>
          <h2 className="display-5 fw-bold mt-1 mb-3">Selección Destacada</h2>
          <div className="mx-auto" style={{ width: '60px', height: '3px', backgroundColor: '#e6a15c' }}></div>
          <p className="text-muted small mt-3">Haz clic en cualquier producto para ver su foto completa y detalles</p>
        </div>

        {cargando ? (
          <div className="text-center py-5">
            <div className="spinner-border text-warning" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
            <p className="mt-2 text-muted">Cargando productos...</p>
          </div>
        ) : (
          <>
            <div className="row g-4">
              {productos.slice(0, 6).map((prod) => (
                <div className="col-lg-4 col-md-6" key={prod.id}>
                  <div className="card product-item bg-white border-0 shadow-sm h-100 overflow-hidden rounded-3">
                    {/* Contenedor de imagen clickeable */}
                    <div 
                      className="position-relative overflow-hidden" 
                      style={{ height: '260px', cursor: 'pointer' }}
                      onClick={() => setProductoSeleccionado(prod)}
                      title="Clic para ver imagen completa y detalles"
                    >
                      <img 
                        className="w-100 h-100" 
                        style={{ objectFit: 'cover', transition: 'transform 0.3s ease' }} 
                        src={prod.imagen || `/img/product_${prod.id}.jpg`} 
                        alt={prod.nombre} 
                        onError={(e) => {
                          e.target.src = `https://via.placeholder.com/400?text=${encodeURIComponent(prod.nombre)}`;
                        }}
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
                      {/* Título clickeable */}
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
                      
                      {/* Descripción enriquecida con Tiptap + DOMPurify */}
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
                          className="btn btn-warning rounded-pill py-2.5 px-4 w-100 fw-bold shadow-sm"
                          onClick={() => agregarAlCarrito(prod)}
                        >
                          Añadir al Carrito 🛒
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Botón para ver el catálogo completo en Categorías */}
            <div className="text-center mt-5">
              <Link 
                to="/categorias" 
                className="btn btn-outline-dark btn-lg rounded-pill px-5 py-3 fw-bold shadow-sm"
              >
                Ver Catálogo Completo ({productos.length} productos) →
              </Link>
            </div>
          </>
        )}
      </div>

      {/* Banner Promocional de Cupones y Descuento Senior */}
      <div className="container py-5 mb-4">
        <div 
          className="p-5 rounded-4 shadow-sm text-center text-white"
          style={{
            background: 'linear-gradient(135deg, #2c1e16 0%, #5c3a21 100%)'
          }}
        >
          <span className="badge bg-warning text-dark px-3 py-2 rounded-pill fw-bold mb-3">
            Beneficios Exclusivos
          </span>
          <h3 className="display-6 fw-bold mb-3">¡Endulza tus celebraciones con descuentos especiales!</h3>
          <p className="lead mb-4 mx-auto" style={{ maxWidth: '700px', opacity: 0.9 }}>
            Usa los códigos <strong>MILSABORES10</strong> o <strong>DUOC2026</strong> en tu carrito de compras. 
            Además, si tienes más de 50 años, obtienes un <strong>50% de descuento automático</strong> en toda la tienda.
          </p>
          <Link to="/categorias" className="btn btn-warning btn-lg rounded-pill px-5 fw-bold shadow">
            Ir a Comprar Ahora 🍰
          </Link>
        </div>
      </div>

      {/* MODAL DE DETALLE DEL PRODUCTO (FOTO COMPLETA + DESCRIPCIÓN) */}
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
                  {/* Imagen completa sin recortar */}
                  <div className="col-md-6 text-center bg-light rounded-3 p-3">
                    <img
                      src={productoSeleccionado.imagen || `/img/product_${productoSeleccionado.id}.jpg`}
                      alt={productoSeleccionado.nombre}
                      className="img-fluid rounded-3"
                      style={{ maxHeight: '420px', width: '100%', objectFit: 'contain' }}
                      onError={(e) => {
                        e.target.src = `https://via.placeholder.com/400?text=${encodeURIComponent(productoSeleccionado.nombre)}`;
                      }}
                    />
                  </div>

                  {/* Información detallada */}
                  <div className="col-md-6 d-flex flex-column">
                    <h3 className="fw-bold mb-2">{productoSeleccionado.nombre}</h3>
                    <h4 className="fw-bold mb-3" style={{ color: '#d48b44' }}>
                      ${Number(productoSeleccionado.precio).toLocaleString('es-CL')}
                    </h4>

                    {/* Descripción enriquecida sanitizada en el Modal */}
                    <div 
                      className="text-muted mb-3" 
                      style={{ lineHeight: '1.6' }}
                      dangerouslySetInnerHTML={{ 
                        __html: DOMPurify.sanitize(productoSeleccionado.descripcion || '') 
                      }} 
                    />

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