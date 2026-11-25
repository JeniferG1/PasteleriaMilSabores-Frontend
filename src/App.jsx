import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { useCart } from './context/CartContext';
import Home from './views/Home';
import Categorias from './views/Categorias';
import Comunidad from './views/Comunidad';
import Premios from './views/Premios';
import Carrito from './views/Carrito';
import Admin from './views/Admin';
import Login from './views/Login';
import Registro from './views/Registro';
import Navbar from './components/Navbar';
import Contacto from './components/Contacto';

function RutaGestion({ children }) {
  const { usuarioLogueado } = useAuth();
  const rol = usuarioLogueado?.rol;

  if (!usuarioLogueado || (rol !== 'admin' && rol !== 'vendedor')) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function App() {
  const { usuarioLogueado } = useAuth();
  const { notificacionCarrito } = useCart();
  const esVendedor = usuarioLogueado?.rol === 'vendedor';

  return (
    <>
      <Navbar />

      {notificacionCarrito && (
        <div
          className="alert alert-success shadow fw-semibold position-fixed bottom-0 end-0 m-3"
          style={{ zIndex: 1080, maxWidth: '360px' }}
          role="alert"
        >
          {notificacionCarrito}
        </div>
      )}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/categorias" element={<Categorias />} />
        <Route path="/comunidad" element={<Comunidad />} />
        <Route path="/contacto" element={<Contacto />} />
        <Route path="/premios" element={<Premios />} />
        <Route path="/carrito" element={<Carrito />} />
        <Route
          path="/admin"
          element={
            <RutaGestion>
              <Admin soloLecturaVendedor={esVendedor} />
            </RutaGestion>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </>
  );
}

export default App;
