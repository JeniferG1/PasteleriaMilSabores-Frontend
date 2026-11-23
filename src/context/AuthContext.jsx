import React, { createContext, useState, useContext, useEffect } from 'react';
import axiosClient from '../Services/axiosClient';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

const USUARIOS_BASE = [
  {
    id: 1,
    nombre: 'Administrador Mil Sabores',
    email: 'admin@milsabores.cl',
    password: 'admin123',
    fechaNacimiento: '1985-05-15',
    region: 'metropolitana',
    comuna: 'Santiago',
    edad: 41,
    esSenior: false,
    esDuoc: false,
    descuento: 0,
    rol: 'admin'
  },
  {
    id: 2,
    nombre: 'Vendedor Mil Sabores',
    email: 'vendedor@milsabores.cl',
    password: 'vend123',
    fechaNacimiento: '1992-08-20',
    region: 'metropolitana',
    comuna: 'Providencia',
    edad: 34,
    esSenior: false,
    esDuoc: false,
    descuento: 0,
    rol: 'vendedor'
  }
];

export const esCorreoDuoc = (email = '') => {
  const correo = email.trim().toLowerCase();
  return (
    correo.endsWith('@duoc.cl') ||
    correo.endsWith('@profesor.duoc.cl') ||
    correo.endsWith('@alumnos.duoc.cl') ||
    correo.endsWith('@duocuc.cl')
  );
};

export const AuthProvider = ({ children }) => {
  const [usuarios, setUsuarios] = useState(() => {
    const guardados = localStorage.getItem('usuarios_milsabores');
    if (guardados) {
      const lista = JSON.parse(guardados);
      const faltantes = USUARIOS_BASE.filter(
        (base) => !lista.some((u) => u.email.toLowerCase() === base.email)
      );
      return [...faltantes, ...lista];
    }
    return USUARIOS_BASE;
  });

  const [usuarioLogueado, setUsuarioLogueado] = useState(() => {
    const sesionActiva = localStorage.getItem('sesion_milsabores');
    return sesionActiva ? JSON.parse(sesionActiva) : null;
  });

  const [token, setToken] = useState(() => localStorage.getItem('token_milsabores') || null);

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

  useEffect(() => {
    if (token) {
      localStorage.setItem('token_milsabores', token);
      axiosClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      localStorage.removeItem('token_milsabores');
      delete axiosClient.defaults.headers.common['Authorization'];
    }
  }, [token]);

  const registrarUsuario = async (nuevoUsuario) => {
    const existe = usuarios.some(
      (u) => u.email.toLowerCase() === nuevoUsuario.email.toLowerCase()
    );

    if (existe) {
      return {
        success: false,
        message: 'Este correo ya está registrado. Intenta iniciar sesión.'
      };
    }

    const usuarioEnriquecido = {
      ...nuevoUsuario,
      id: Date.now(),
      esDuoc: esCorreoDuoc(nuevoUsuario.email),
      rol: nuevoUsuario.rol || 'cliente'
    };

    try {
      // Sincroniza con Backend Spring Boot si el endpoint /api/auth/registro está activo
      const resp = await axiosClient.post('/api/auth/registro', usuarioEnriquecido);
      if (resp.data?.token) setToken(resp.data.token);
      if (resp.data?.usuario) {
        Object.assign(usuarioEnriquecido, resp.data.usuario);
      }
    } catch {
      // Respaldo local si el backend aún no expone /api/auth/registro
      setToken(`jwt-local-${btoa(usuarioEnriquecido.email)}-${Date.now()}`);
    }

    const listaActualizada = [...usuarios, usuarioEnriquecido];
    setUsuarios(listaActualizada);
    setUsuarioLogueado(usuarioEnriquecido);

    return {
      success: true,
      usuario: usuarioEnriquecido,
      message: 'Cuenta creada con éxito.'
    };
  };

  const loginUsuario = async (email, password) => {
    try {
      // Intenta autenticación JWT contra Spring Boot
      const resp = await axiosClient.post('/api/auth/login', {
        email: email.trim().toLowerCase(),
        password
      });
      if (resp.data?.usuario) {
        if (resp.data.token) setToken(resp.data.token);
        setUsuarioLogueado(resp.data.usuario);
        return {
          success: true,
          usuario: resp.data.usuario,
          message: `Bienvenido de vuelta, ${resp.data.usuario.nombre}`
        };
      }
    } catch {
      // Fallback a usuarios locales si el endpoint aún no responde
    }

    const usuarioEncontrado = usuarios.find(
      (u) =>
        u.email.toLowerCase() === email.trim().toLowerCase() &&
        u.password === password
    );

    if (usuarioEncontrado) {
      const usuarioActualizado = {
        ...usuarioEncontrado,
        esDuoc: usuarioEncontrado.esDuoc ?? esCorreoDuoc(usuarioEncontrado.email)
      };
      setToken(`jwt-local-${btoa(usuarioActualizado.email)}-${Date.now()}`);
      setUsuarioLogueado(usuarioActualizado);
      return {
        success: true,
        usuario: usuarioActualizado,
        message: `Bienvenido de vuelta, ${usuarioActualizado.nombre}`
      };
    }

    return {
      success: false,
      message: 'Correo o contraseña incorrectos. Verifica tus datos o regístrate.'
    };
  };

  const cerrarSesion = () => {
    setUsuarioLogueado(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        usuarios,
        usuarioLogueado,
        token,
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