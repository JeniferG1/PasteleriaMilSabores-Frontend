import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { cantidadTotalCarrito, cart } = useCart();
  const { usuarioLogueado, logoutUsuario } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const totalItems =
    typeof cantidadTotalCarrito === 'number'
      ? cantidadTotalCarrito
      : Array.isArray(cart)
        ? cart.reduce((acc, item) => acc + (Number(item.cantidad) || 1), 0)
        : 0;

  const esGestion =
    usuarioLogueado?.rol === 'admin' || usuarioLogueado?.rol === 'vendedor';

  const handleCerrarSesion = () => {
    logoutUsuario();
    navigate('/login');
  };

  const handleIrAPanel = () => {
    if (location.pathname === '/admin') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark w-100 shadow-sm">
      <div className="container-fluid px-4">
        <Link className="navbar-brand fw-bold" to="/">
          Mil Sabores
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-lg-center gap-lg-1">
            <li className="nav-item">
              <Link className="nav-link" to="/">
                Inicio
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/categorias">
                Categorías
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/comunidad">
                Comunidad
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/contacto">
                Contacto
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link text-warning fw-semibold" to="/premios">
                🎮 Gana un Premio
              </Link>
            </li>

            {usuarioLogueado ? (
              <>
                <li className="nav-item mx-lg-2 my-1 my-lg-0 small">
                  {esGestion ? (
                    <Link
                      to="/admin"
                      onClick={handleIrAPanel}
                      className="nav-link text-light d-inline-block p-0"
                      title="Ir al Panel de Administración"
                      style={{ cursor: 'pointer' }}
                    >
                      Hola, <b className="text-warning text-decoration-underline">{usuarioLogueado.nombre}</b>
                    </Link>
                  ) : (
                    <span className="text-light">
                      Hola, <b>{usuarioLogueado.nombre}</b>
                    </span>
                  )}
                </li>
                <li className="nav-item">
                  <button
                    className="btn btn-outline-light btn-sm rounded-pill px-3 ms-lg-1"
                    onClick={handleCerrarSesion}
                  >
                    Cerrar Sesión
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/login">
                    Ingresar
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/registro">
                    Registrarse
                  </Link>
                </li>
              </>
            )}

            <li className="nav-item ms-lg-2 mt-2 mt-lg-0">
              <Link
                className="btn btn-warning rounded-pill text-dark fw-bold d-inline-flex align-items-center gap-2 px-3 py-1.5 shadow-sm"
                to="/carrito"
              >
                <span>🛒</span>
                <span>Carrito</span>
                <span className="badge rounded-pill bg-dark text-warning">
                  {totalItems}
                </span>
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
