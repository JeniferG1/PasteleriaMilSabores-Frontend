import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

const ADMIN_POR_DEFECTO = {
  nombre: 'Administrador Mil Sabores',
  email: 'admin@milsabores.cl',
  password: 'admin123',
  fechaNacimiento: '1985-05-15',
  region: 'metropolitana',
  comuna: 'Santiago',
  edad: 41,
  esSenior: false,
  descuento: 0,
  rol: 'admin'
};

export const AuthProvider = ({ children }) => {
  const [usuarios, setUsuarios] = useState(() => {
    const guardados = localStorage.getItem('usuarios_milsabores');
    if (guardados) {
      const lista = JSON.parse(guardados);
      const existeAdmin = lista.some(
        (u) => u.email.toLowerCase() === ADMIN_POR_DEFECTO.email
      );
      return existeAdmin ? lista : [ADMIN_POR_DEFECTO, ...lista];
    }
    return [ADMIN_POR_DEFECTO];
  });

  const [usuarioLogueado, setUsuarioLogueado] = useState(() => {
    const sesionActiva = localStorage.getItem('sesion_milsabores');
    return sesionActiva ? JSON.parse(sesionActiva) : null;
  });

  useEffect(() => {
    localStorage.setItem('usuarios_milsabores', JSON.stringify(usuarios));
  }, [usuarios]);

  useEffect(() => {
    if (usuarioLogueado) {
      localStorage.setItem('sesion_milsabores', JSON.stringify(usuarioLogueado));
    } else {
      localStorage.removeItem('sesion_milsabores');
    }
  }, [usuarioLogueado]);

  const registrarUsuario = (nuevoUsuario) => {
    const existe = usuarios.some(
      (u) => u.email.toLowerCase() === nuevoUsuario.email.toLowerCase()
    );

    if (existe) {
      return {
        success: false,
        message: 'Este correo ya está registrado. Intenta iniciar sesión.'
      };
    }

    const listaActualizada = [...usuarios, nuevoUsuario];
    setUsuarios(listaActualizada);
    setUsuarioLogueado(nuevoUsuario);
    return {
      success: true,
      usuario: nuevoUsuario,
      message: 'Cuenta creada con éxito.'
    };
  };

  const loginUsuario = (email, password) => {
    const usuarioEncontrado = usuarios.find(
      (u) =>
        u.email.toLowerCase() === email.trim().toLowerCase() &&
        u.password === password
    );

    if (usuarioEncontrado) {
      setUsuarioLogueado(usuarioEncontrado);
      return {
        success: true,
        usuario: usuarioEncontrado,
        message: `Bienvenido de vuelta, ${usuarioEncontrado.nombre}`
      };
    }

    return {
      success: false,
      message: 'Correo o contraseña incorrectos. Verifica tus datos o regístrate.'
    };
  };

  const cerrarSesion = () => {
    setUsuarioLogueado(null);
  };

  return (
    <AuthContext.Provider
      value={{
        usuarios,
        usuarioLogueado,
        registrarUsuario,
        loginUsuario,
        cerrarSesion,
        logout: cerrarSesion,
        logoutUsuario: cerrarSesion
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};