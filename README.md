# Pastelería Mil Sabores — Aplicación Web React

Aplicación web desarrollada en **React + Vite** para **Pastelería Mil Sabores**, con catálogo de productos, carrito de compras con cupones y descuentos, comunidad y blog, formulario de contacto, panel de administración y animaciones interactivas con **GSAP**.

## Características Principales

* **Inicio (`Home.jsx`):** Portada con secuencia animada, tarjetas de beneficios, vitrina de productos destacados con modal de detalle, sellos nutricionales, descripción enriquecida sanitizada con `DOMPurify` y banner promocional.
* **Catálogo por Categorías (`Categorias.jsx`):** Filtro por categoría (`tortas-cuadradas`, `tortas-circulares`, `postres-individuales`, `sin-azucar`, `tradicional`, `sin-gluten`, `vegana`, `especiales`), vista detallada en modal y animaciones al desplazarse.
* **Comunidad y Blog (`Comunidad.jsx`):** Crónicas históricas de la pastelería (Récord Guinness 1995 y 50 años de trayectoria) y muro interactivo de reseñas, recetas y anuncios persistido en `localStorage`.
* **Contacto (`Contacto.jsx`):** Formulario validado de consultas y comentarios con guardado local de mensajes.
* **Carrito y Checkout (`Carrito.jsx`):** Control de cantidades y límite de stock por pedido, cupones de descuento (`FELICES50`, `MILSABORES10`, `DUOC2026`), beneficio Senior (50% de descuento para mayores de 50 años), beneficio de cumpleaños Duoc UC, minijuego `CakeTower` y emisión de boleta/orden en `localStorage`.
* **Acceso y Panel de Administración:** Autenticación de sesión mediante `AuthContext` y acceso directo al panel `/admin` desde el saludo del administrador en el `Navbar` (`Hola, Administrador Mil Sabores`) sin depender de escribir la ruta manualmente en la URL.

## Animaciones con GSAP

Se integraron `gsap` y `@gsap/react` (`useGSAP`, `useRef`, `gsap.timeline()`, `stagger`, `ScrollTrigger` y `contextSafe`) en las vistas principales (`Home.jsx`, `Categorias.jsx`, `Comunidad.jsx`, `Contacto.jsx` y `Carrito.jsx`) para entradas secuenciales, animaciones escalonadas al hacer *scroll* y respuestas suaves a eventos de usuario.

## Persistencia de Datos

La aplicación sincroniza el catálogo cuando la API está disponible y mantiene respaldo en `localStorage` para:

* Sesión activa del usuario (`AuthContext`)
* Carrito de compras y boletas generadas (`boletas_milsabores`)
* Publicaciones de comunidad (`comunidad_milsabores`)
* Consultas enviadas desde contacto (`consultas_milsabores`)

## Instalación y Ejecución

1. Instala las dependencias dentro de la carpeta del proyecto (`proyectoweb`):

npm install
npm install gsap @gsap/react

2. nicia el servidor de desarrollo:
npm run dev

3. Para generar la versión de producción:
npm run build

## Estructura General del Proyecto

src/
├── components/      # Navbar, RichTextEditor, SellosNutricionales, CakeTower, etc.
├── context/         # AuthContext y CartContext
├── Services/        # Configuración de axiosClient
└── views/           # Home, Categorias, Comunidad, Contacto, Carrito, Login, Registro, Admin



