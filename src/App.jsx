import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Home from './views/Home';
import Categorias from './views/Categorias';
import Comunidad from './views/Comunidad'; // <-- Nueva importación
import Carrito from './views/Carrito';
import Admin from './views/Admin';
import Login from './views/Login';
import Registro from './views/Registro';
import Navbar from './components/Navbar';

function RutaAdmin({ children }) {
  const { usuarioLogueado } = useAuth();

  if (!usuarioLogueado || usuarioLogueado.rol !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/categorias" element={<Categorias />} />
        <Route path="/comunidad" element={<Comunidad />} /> {/* <-- Nueva ruta */}
        <Route path="/carrito" element={<Carrito />} />
        <Route
          path="/admin"
          element={
            <RutaAdmin>
              <Admin />
            </RutaAdmin>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />

        {/* Ruta para cualquier URL desconocida */}
        <Route path="*" element={<Home />} />
      </Routes>
    </>
  );
}

export default App;