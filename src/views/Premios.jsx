import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import CakeTower from '../components/CakeTower';

const PREMIOS_INFO = [
  {
    nombre: 'Mousse de Chocolate',
    descripcion: 'Suave crema de chocolate bitter 70% cacao con base de bizcocho húmedo y virutas de chocolate.',
    imagen: '/img/product_5.jpg', 
    etiqueta: 'Favorito'
  },
  {
    nombre: 'Tiramisú Clásico',
    descripcion: 'Auténtica receta italiana con bizcochos bañados en café espresso, crema mascarpone y cacao amargo.',
    imagen: '/img/product_6.jpg',
    etiqueta: 'Clásico'
  },
  {
    nombre: 'Tarta de Santiago',
    descripcion: 'Tradicional tarta artesanal de almendras molidas con un toque cítrico y cubierta de azúcar flor.',
    imagen: '/img/product_10.jpg',
    etiqueta: 'Artesanal'
  }
  
];

export default function Premios() {
  const { usuarioLogueado } = useAuth();

  return (
    <div className="container-xxl py-5">
      <div className="container">
        {/* Encabezado */}
        <div className="text-center mx-auto mb-5" style={{ maxWidth: '700px' }}>
          <span className="badge bg-warning text-dark px-3 py-2 rounded-pill fw-bold mb-2">
            🎮 Zona de Fidelización
          </span>
          <h1 className="display-6 fw-bold mb-3">Cake Tower Challenge</h1>
          <p className="text-muted">
            Pon a prueba tu precisión apilando <strong>20 pisos de torta</strong> en modo desafío. 
            Si logras completar la torre, podrás elegir gratis uno de nuestros tres postres estrella.
          </p>
          <hr className="w-25 mx-auto bg-primary" />
        </div>

        {/* Vitrina de los 3 Premios */}
        <h4 className="fw-bold text-center mb-4">🎁 Premios Disponibles al Completar el Reto</h4>
        <div className="row g-4 mb-5">
          {PREMIOS_INFO.map((premio) => (
            <div className="col-md-4" key={premio.nombre}>
              <div className="card h-100 border-0 shadow-sm overflow-hidden">
                <div className="bg-light d-flex align-items-center justify-content-center" style={{ height: '200px' }}>
                  <img
                    src={premio.imagen}
                    alt={premio.nombre}
                    className="w-100 h-100"
                    style={{ objectFit: 'contain', padding: '12px' }}
                    onError={(e) => {
                      e.target.src = 'https://placehold.co/400x300/FFF1E6/8D5B4C?text=' + encodeURIComponent(premio.nombre);
                    }}
                  />
                </div>
                <div className="card-body text-center">
                  <span className="badge bg-secondary mb-2">{premio.etiqueta}</span>
                  <h5 className="card-title fw-bold">{premio.nombre}</h5>
                  <p className="card-text text-muted small">{premio.descripcion}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Área del Juego con Restricción de Autenticación */}
        <div className="card border-0 shadow-sm p-4 p-md-5 mx-auto bg-white" style={{ maxWidth: '650px' }}>
          {usuarioLogueado ? (
            <div className="text-center">
              <h4 className="fw-bold mb-1">¡Bienvenido al reto, {usuarioLogueado.nombre}!</h4>
              <p className="text-muted small mb-4">
                Haz clic sobre el tablero o presiona la <b>barra espaciadora</b> para soltar cada piso.
              </p>
              <CakeTower />
            </div>
          ) : (
            <div className="text-center py-4">
              <div className="display-4 mb-3">🔒</div>
              <h3 className="fw-bold mb-2">Acceso Exclusivo para Clientes Registrados</h3>
              <p className="text-muted mb-4">
                Para participar en el <strong>Cake Tower Challenge</strong> y canjear premios gratis, 
                necesitas iniciar sesión o crear una cuenta en Pastelería Mil Sabores.
              </p>
              <div className="d-flex justify-content-center gap-3">
                <Link to="/login" className="btn btn-primary rounded-pill px-4 py-2 fw-bold">
                  Iniciar Sesión
                </Link>
                <Link to="/registro" className="btn btn-outline-dark rounded-pill px-4 py-2 fw-bold">
                  Crear Cuenta
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}