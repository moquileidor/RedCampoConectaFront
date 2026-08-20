# Informe de Mejoras — Campo Conecta Frontend

> Análisis realizado sobre el código fuente real del repositorio `RedCampoConectaFront`.  
> Cada problema incluye: descripción, código problemático y corrección propuesta.

---

## Estado (actualizado 2026-08-20)

La mayoría de los hallazgos de este informe **ya están corregidos** en `main`
(commits `413a581`..`ee9406c`). El detalle por ítem está en la tabla de la
[sección 6](#6-resumen-de-prioridades) — el texto de cada hallazgo se conserva tal
cual porque documenta el problema original, no el estado actual del código.

Probando la app en el navegador (no solo con Postman) apareció además un bug que
no estaba en este informe: ver [sección 7](#7-bugs-encontrados-en-pruebas-manuales-navegador).

---

## Tabla de contenidos

1. [Arquitectura y organización](#1-arquitectura-y-organización)
2. [Gestión de estado](#2-gestión-de-estado)
3. [Rendimiento](#3-rendimiento)
4. [Manejo de errores y UX](#4-manejo-de-errores-y-ux)
5. [Buenas prácticas generales](#5-buenas-prácticas-generales)
6. [Resumen de prioridades](#6-resumen-de-prioridades)
7. [Bugs encontrados en pruebas manuales (navegador)](#7-bugs-encontrados-en-pruebas-manuales-navegador)

---

## 1. Arquitectura y organización

### 🔴 [ALTO] `AuthProvider` duplicado — doble árbol de contexto

**Archivo:** `src/index.js:69` y `src/App.js:209`

**Problema:**  
`AuthProvider` se monta dos veces: una en `index.js` y otra dentro de `App.js`. El `ProtectedRoute` y las rutas viven en el `AuthProvider` interno, pero el árbol ya tiene uno externo. Resultado: dos instancias de Context con estados independientes que causan bugs de sincronización imposibles de depurar.

```jsx
// index.js — AuthProvider externo (línea 69)
<AuthProvider>
  <BrowserRouter>
    <App />   // ← App.js monta otro AuthProvider adentro
  </BrowserRouter>
</AuthProvider>

// App.js — AuthProvider interno (línea 209)
<AuthProvider>          // ← DUPLICADO
  <ModalBackdropCleaner />
  <Routes>...</Routes>
</AuthProvider>
```

**Corrección:**

```jsx
// index.js — fuente única de verdad
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);

// App.js — sin AuthProvider
function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ScrollToTop />
      <Routes>...</Routes>
    </ThemeProvider>
  );
}
```

---

### 🔴 [ALTO] `ProtectedRoute` ignora el Context — lee directamente de `authService`

**Archivo:** `src/App.js:27`

**Problema:**  
`ProtectedRoute` llama a `authService.getCurrentUser()` (lectura directa de localStorage) en lugar de `useAuth()`. Si el Context actualiza su estado por login o logout, `ProtectedRoute` **no se re-renderiza** porque no está suscrito al Context.

```jsx
const ProtectedRoute = ({ children, requiredRole = null }) => {
  const currentUser = authService.getCurrentUser(); // ← sin reactividad
  const isAuthenticated = !!currentUser;
  ...
};
```

**Corrección:**

```jsx
const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { currentUser, loading } = useAuth(); // ← suscrito al Context

  if (loading) return <CircularProgress />;
  if (!currentUser) return <Navigate to="/" replace />;
  if (requiredRole && currentUser.rol !== requiredRole)
    return <Navigate to="/usuario" replace />;

  return children;
};
```

---

### 🔴 [ALTO] Función `cleanupModals` duplicada en 6 lugares

**Archivos:** `index.js:44`, `App.js:49`, `App.js:86`, `NavBarUsuario.jsx:53`, `PerfilUsuarioPage.jsx:63`, `ScrollToTop`

**Problema:**  
El mismo bloque de 6 líneas para limpiar backdrops de Bootstrap se repite en seis lugares distintos. Ocurre porque los modales de Bootstrap JS entran en conflicto con el router de React al cambiar de ruta.

**Corrección a corto plazo** — extraer a una utilidad compartida:

```js
// src/utils/modalCleanup.js
export const cleanupBootstrapModals = () => {
  document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
  document.body.classList.remove('modal-open');
  document.body.removeAttribute('style');
  document.documentElement.style.overflow = '';
};
```

**Corrección definitiva** — reemplazar los modales que usan `data-bs-toggle` por componentes `<Dialog>` de MUI o `<Modal>` de React-Bootstrap, que React gestiona directamente. Esto elimina el conflicto de raíz.

---

### 🟡 [MEDIO] Dos archivos `App.js` y `App.jsx` en la misma carpeta

**Archivo:** `src/App.js` y `src/App.jsx`

**Problema:**  
Los dos archivos conviven en el mismo directorio. CRA importa `App.js` preferentemente; `App.jsx` queda como archivo muerto que genera confusión sobre cuál es el activo.

**Corrección:** borrar el archivo que no se usa y conservar uno solo con extensión `.jsx`.

---

### 🟡 [MEDIO] Ruta `/Marketplace` con mayúscula vs. link `/marketplace` minúscula

**Archivos:** `App.js:215` y `NavBarUsuario.jsx:135`

**Problema:**  
`App.js` define `path="/Marketplace"` (M mayúscula), pero el navbar navega a `/marketplace` (minúscula). En producción con un servidor sensible a mayúsculas esto rompe la navegación.

**Corrección:** adoptar kebab-case minúscula para todas las rutas y aplicarlo de forma consistente en todos los `<Route path=...>` y todos los links de navegación.

---

## 2. Gestión de estado

### 🔴 [ALTO] `localStorage.getItem("token")` busca una clave que no existe

**Archivo:** `src/pages/MarketplacePage.jsx:72`

**Problema:**  
El token nunca se guarda bajo la clave `"token"` — se guarda como campo dentro del objeto `"user"`. Esta línea siempre retorna `null`, por lo que las peticiones de productos nunca envían la cabecera de autenticación.

```js
// Siempre null — la clave "token" no existe en localStorage
const token = isLoggedIn ? localStorage.getItem("token") : null;
const headers = token ? { Authorization: `Bearer ${token}` } : {};
```

**Corrección:**

```js
const token = authService.getToken(); // lee user.token correctamente
const headers = token ? { Authorization: `Bearer ${token}` } : {};
```

---

### 🔴 [ALTO] `isLoggedIn` gestionado localmente en 3 componentes distintos

**Archivos:** `App.js:173`, `MarketplacePage.jsx:35`, `NavBarUsuario.jsx`

**Problema:**  
Cada componente mantiene su propia verificación de autenticación vía `authService` o `localStorage`, ignorando que `AuthContext` ya provee `isAuthenticated` y `currentUser` de forma reactiva.

```jsx
// MarketplacePage.jsx — estado local redundante
const [isLoggedIn, setIsLoggedIn] = useState(false);
useEffect(() => {
  const checkAuth = () => setIsLoggedIn(authService.isAuthenticated());
  window.addEventListener('storage', checkAuth);
  checkAuth();
  ...
}, []);
```

**Corrección:**

```jsx
const { isAuthenticated, currentUser } = useAuth();
// isAuthenticated ya es reactivo; currentUser tiene el idUsuario
```

---

### 🔴 [ALTO] `value` del Context recrea objeto en cada render

**Archivo:** `src/contexts/AuthContext.js:71`

**Problema:**  
El objeto `value` se crea directamente en el cuerpo del componente. Cada render de `AuthProvider` produce una referencia nueva y fuerza el re-render de todos los componentes consumidores, incluso cuando los datos no cambiaron.

```js
// Nuevo objeto en cada render → re-renders en cascada
const value = {
  currentUser, loading, login, register, logout,
  isAuthenticated: !!currentUser,
};
```

**Corrección:**

```js
const login = useCallback(async (username, password) => { ... }, []);
const register = useCallback(async (username, password) => { ... }, []);
const logout = useCallback(() => { ... }, []);

const value = useMemo(() => ({
  currentUser,
  loading,
  login,
  register,
  logout,
  isAuthenticated: !!currentUser,
}), [currentUser, loading, login, register, logout]);
```

---

### 🟡 [MEDIO] Token JWT en `localStorage` — riesgo XSS

**Archivo:** `src/services/authService.js:21`

**Problema:**  
`localStorage` es accesible a cualquier script de la página. Un ataque XSS puede leer el token y suplantarse al usuario.

**Alternativa recomendada para producción:** cookies `HttpOnly; Secure; SameSite=Strict` emitidas por el servidor. El navegador las envía automáticamente y JavaScript no puede leerlas. Requiere cambio en el backend.

**Alternativa sin cambio de backend:** usar `sessionStorage` en lugar de `localStorage` para que el token no persista entre pestañas ni reinicios del navegador.

---

### 🟡 [MEDIO] `PerfilUsuarioPage` lee `localStorage` directamente ignorando el Context

**Archivo:** `src/pages/PerfilUsuarioPage.jsx:26`

```js
// Lectura directa y manual de localStorage
const userStr = localStorage.getItem('user');
const user = JSON.parse(userStr);
setUserData(user);
```

**Corrección:**

```js
const { currentUser } = useAuth(); // reactivo, ya parseado y normalizado
```

---

## 3. Rendimiento

### 🔴 [ALTO] Sin lazy loading — todas las páginas cargan en el bundle inicial

**Archivo:** `src/App.js:3-13`

**Problema:**  
Las 10 páginas se importan síncronamente. El usuario descarga el JS de la página de admin, el dashboard de energía y el registro de emprendimientos aunque nunca las visite.

```js
import MarketplacePage from "./pages/MarketplacePage";
import Admin from "./pages/VistaAdminPage";
import GraficasDatosEnergia from './pages/GraficasDatosEnergia';
// ... 7 imports más
```

**Corrección:**

```jsx
import { lazy, Suspense } from 'react';

const MarketplacePage = lazy(() => import('./pages/MarketplacePage'));
const Admin = lazy(() => import('./pages/VistaAdminPage'));
const GraficasDatosEnergia = lazy(() => import('./pages/GraficasDatosEnergia'));

// Envolver Routes con Suspense
<Suspense fallback={<CircularProgress sx={{ m: 'auto', mt: 8 }} />}>
  <Routes>...</Routes>
</Suspense>
```

---

### 🔴 [ALTO] `MarketplacePage` re-fetcha productos cuando cambia `isLoggedIn`

**Archivo:** `src/pages/MarketplacePage.jsx:96`

**Problema:**  
`useEffect(..., [isLoggedIn])` recarga los emprendimientos cada vez que el usuario inicia o cierra sesión. Los productos son públicos y no deberían recargarse por cambios en la autenticación.

```js
useEffect(() => {
  fetch("http://localhost:8080/emprendimientos", { headers })
    .then(...)
}, [isLoggedIn]); // ← re-fetch innecesario al cambiar auth
```

**Corrección:**

```js
useEffect(() => {
  fetchProducts();
}, []); // ← solo al montar el componente
```

---

### 🔴 [ALTO] `calculateStats()` recalcula en cada render sin memoización

**Archivo:** `src/pages/GraficasDatosEnergia.jsx:325`

```js
const stats = calculateStats(); // ← se ejecuta en cada render
```

**Corrección:**

```js
const stats = useMemo(() => {
  if (!filteredData.length) {
    return { avgProduction: 0, avgConsumption: 0,
             totalProduction: 0, totalConsumption: 0, balance: 0 };
  }
  const totalProduction = filteredData.reduce((s, i) => s + (i.produccion || 0), 0);
  const totalConsumption = filteredData.reduce((s, i) => s + (i.consumo || 0), 0);
  return {
    totalProduction: totalProduction.toFixed(2),
    totalConsumption: totalConsumption.toFixed(2),
    avgProduction: (totalProduction / filteredData.length).toFixed(2),
    avgConsumption: (totalConsumption / filteredData.length).toFixed(2),
    balance: (totalProduction - totalConsumption).toFixed(2),
  };
}, [filteredData]);
```

---

### 🟡 [MEDIO] Objetos de estilo definidos dentro del componente en cada render

**Archivo:** `src/pages/PerfilUsuarioPage.jsx:214-244`

**Problema:**  
`cardStyle`, `containerStyle`, `profileImageStyle` y `headerStyle` son objetos literales redefinidos en cada render. React los trata como referencias nuevas y puede causar reconciliación extra.

**Corrección:** moverlos fuera del componente ya que son constantes:

```js
// Fuera del componente
const CARD_STYLE = {
  boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
  borderRadius: '12px',
  marginBottom: '20px',
  border: 'none',
};
```

---

### 🟡 [MEDIO] `initBootstrapComponents` puede ejecutarse infinitamente

**Archivo:** `src/components/navBarUsuario/NavBarUsuario.jsx:42`

**Problema:**  
Si Bootstrap no carga, la función se llama a sí misma con `setTimeout` sin límite de intentos ni limpieza del timer en el cleanup del `useEffect`.

```js
const initBootstrapComponents = () => {
  if (window.bootstrap?.Dropdown) {
    // inicializar...
  } else {
    setTimeout(initBootstrapComponents, 100); // ← sin límite ni cleanup
  }
};
```

**Corrección:**

```js
useEffect(() => {
  let attempts = 0;
  let timer;
  const init = () => {
    if (window.bootstrap?.Dropdown) {
      document.querySelectorAll('.dropdown-toggle')
        .forEach(el => new window.bootstrap.Dropdown(el));
    } else if (attempts++ < 10) {
      timer = setTimeout(init, 200);
    }
  };
  init();
  return () => clearTimeout(timer); // limpieza garantizada
}, []);
```

---

### 🟢 [BAJO] `ScrollToTop` dispara 3 `setTimeout` no limpiados al cambiar de ruta

**Archivo:** `src/App.js:103-105`

**Problema:**  
Si el usuario navega rápido, los `setTimeout` de la ruta anterior siguen ejecutándose sobre el DOM de la nueva ruta. Solo el primero tiene cleanup.

**Corrección:**

```js
useEffect(() => {
  window.scrollTo(0, 0);
  cleanupBootstrapModals(); // llamada única a la utilidad compartida
}, [pathname]);
```

---

## 4. Manejo de errores y UX

### 🔴 [ALTO] `alert()` nativo para feedback al usuario

**Archivo:** `src/pages/MarketplacePage.jsx:102` y `168`

**Problema:**  
`alert()` es bloqueante, no se puede estilizar y es inconsistente con el sistema de diseño MUI ya presente en el proyecto.

```js
alert("Debes iniciar sesión para comentar.");
alert("¡Comentario enviado con éxito!");
```

**Corrección:** usar el componente `<Alert>` de MUI que ya está importado en el mismo archivo:

```jsx
// Estado para mensajes de feedback
const [successMessage, setSuccessMessage] = useState("");

// En lugar de alert(...)
setError("Debes iniciar sesión para comentar.");
setSuccessMessage("¡Comentario enviado con éxito!");

// En el JSX
{successMessage && (
  <Alert severity="success" onClose={() => setSuccessMessage("")}>
    {successMessage}
  </Alert>
)}
```

---

### 🔴 [ALTO] El interceptor de Axios hace `window.location.href = '/'` — rompe el router

**Archivo:** `src/services/authService.js:271`

**Problema:**  
Al recibir un 401, redirige con `window.location.href` causando una recarga completa de la página, perdiendo el estado de React y sin transición de ruta.

```js
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      authService.logout();
      window.location.href = '/'; // ← recarga completa, fuera de React
    }
    return Promise.reject(error);
  }
);
```

**Corrección:** el interceptor no puede usar `useNavigate`, pero sí puede disparar un evento que el Context escucha:

```js
// authService.js
if (error.response?.status === 401) {
  authService.logout();
  window.dispatchEvent(new Event('auth:expired'));
}

// AuthContext.js — dentro de AuthProvider
useEffect(() => {
  const handler = () => setCurrentUser(null);
  window.addEventListener('auth:expired', handler);
  return () => window.removeEventListener('auth:expired', handler);
}, []);
// Con currentUser=null, ProtectedRoute redirige vía <Navigate> sin recargar
```

---

### 🔴 [ALTO] `validateToken` es un método vacío que siempre retorna `true`

**Archivo:** `src/services/authService.js:163`

**Problema:**  
El método existe y su nombre sugiere validación real, pero su implementación está comentada y siempre retorna `true`. Da falsa sensación de seguridad.

```js
validateToken: async () => {
  const user = authService.getCurrentUser();
  if (!user || !user.token) return false;

  try {
    // "necesitaríamos un endpoint específico para esto"
    return true; // ← siempre true, sin validación real
  } catch (error) { ... }
},
```

**Corrección a corto plazo:** eliminar el método o reemplazarlo por la verificación de expiración por timestamp que ya existe en `index.js`:

```js
isTokenExpired: () => {
  const user = authService.getCurrentUser();
  if (!user?.loginTime) return true;
  const MAX_SESSION = 24 * 60 * 60 * 1000;
  return Date.now() - user.loginTime > MAX_SESSION;
},
```

---

### 🔴 [ALTO] `fetch` y `axios` mezclados en `MarketplacePage`

**Archivo:** `src/pages/MarketplacePage.jsx:75` y `150`

**Problema:**  
`fetch` se usa para los dos llamados principales, mientras que `axios` está importado pero sin uso. Las peticiones con `fetch` no pasan por el interceptor global de Axios (que maneja los 401), creando un punto ciego en el manejo de sesión expirada.

**Corrección:** usar `axios` exclusivamente y URLs relativas para aprovechar el proxy de CRA:

```js
// Antes
fetch("http://localhost:8080/emprendimientos", { headers })
  .then(r => { if (!r.ok) throw new Error(...); return r.json(); })
  .then(data => setProducts(data))

// Después — URL relativa, interceptor activo
axios.get('/emprendimientos')
  .then(({ data }) => setProducts(data))
  .catch(() => setError("No se pudieron cargar los emprendimientos."));
```

---

### 🟡 [MEDIO] "Fecha de registro" muestra el timestamp de login

**Archivo:** `src/pages/PerfilUsuarioPage.jsx:391`

**Problema:**  
El campo etiquetado "Fecha de registro" muestra `userData.loginTime`, que es el timestamp del último inicio de sesión, no la fecha de creación de la cuenta. Bug de UX silencioso.

**Corrección:** mostrar el valor correcto (fecha de creación del usuario proveniente del backend) o cambiar la etiqueta a "Último inicio de sesión".

---

## 5. Buenas prácticas generales

### 🔴 [ALTO] URL del backend hardcodeada en 6+ archivos

**Archivos:** `authService.js:3,33,45,65` · `MarketplacePage.jsx:75,150` · `GraficasDatosEnergia.jsx:54,73,123` · `PerfilUsuarioPage.jsx:121`

**Problema:**  
`http://localhost:8080` aparece literalmente en más de 10 lugares. El `package.json` ya tiene `"proxy": "http://localhost:8080"` configurado, lo que significa que Axios con URLs relativas funcionaría en desarrollo sin hardcodear nada.

**Corrección en dos pasos:**

1. Crear `.env` en la raíz del proyecto:

```bash
# .env
REACT_APP_API_URL=http://localhost:8080
```

```bash
# .env.production
REACT_APP_API_URL=https://api.campoconecta.com
```

2. Centralizar la URL base en un solo lugar:

```js
// src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '',
});

export default api;

// Todos los servicios importan `api` en lugar de `axios` directamente
```

---

### 🔴 [ALTO] `console.log` con datos sensibles en producción

**Archivo:** `src/services/authService.js:32,36,44,46,147`

**Problema:**  
El token JWT se imprime en consola explícitamente "para verificar su formato" (línea 147). En producción, cualquier persona con DevTools puede copiar el token.

```js
console.log("Token usado:", token); // ← token JWT visible en producción
```

**Corrección:** eliminar todos los `console.log` de producción o envolverlos en un guard:

```js
if (process.env.NODE_ENV === 'development') {
  console.log("Token usado:", token);
}
```

---

### 🟡 [MEDIO] Sin PropTypes ni TypeScript — props sin contrato

**Problema:**  
Ningún componente valida sus props. Errores como pasar un rol incorrecto a `ProtectedRoute` fallan silenciosamente en runtime.

**Corrección mínima con PropTypes:**

```js
import PropTypes from 'prop-types';

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  requiredRole: PropTypes.oneOf(['ROLE_ADMIN', 'ROLE_USER']),
};
```

**Corrección ideal:** migrar progresivamente a TypeScript renombrando archivos de `.jsx` a `.tsx` e instalando `typescript` y `@types/react`.

---

### 🟡 [MEDIO] ID de usuario con 3 nombres distintos en la misma base de código

**Archivos:** `authService.js:199` · `PerfilUsuarioPage.jsx:36` · múltiples componentes

**Problema:**  
El mismo campo aparece como `idUsuario`, `idusuarios` e `id`. `normalizeUserData` intenta unificarlos pero la función no se llama de forma consistente antes de acceder al campo.

```js
// Tres nombres, mismo dato
const userId = user.idUsuario || user.idusuarios || user.id;
```

**Corrección:** garantizar en `normalizeUserData` que el objeto resultante siempre expone un único nombre canónico `id`:

```js
const normalizeUserData = (raw) => {
  if (!raw) return null;
  const id = parseInt(raw.idUsuario ?? raw.idusuarios ?? raw.id, 10);
  return { ...raw, id: isNaN(id) ? null : id };
};

// En todos los componentes: siempre user.id, nunca user.idUsuario ni user.idusuarios
```

---

### 🟢 [BAJO] CSS variables mezcladas con valores hardcodeados en el mismo componente

**Archivo:** `src/pages/GraficasDatosEnergia.jsx:461,515`

**Problema:**  
El mismo archivo usa `var(--color-gray-100)` y `var(--shadow-sm)` en unas líneas y `'#6BB190'` literal en otras. El color `#6BB190` ya está definido en el MUI theme como `primary.main`.

**Corrección:** usar el sistema de tokens de MUI de forma consistente:

```jsx
// En lugar de bgcolor: '#6BB190'
bgcolor: 'primary.main'

// En lugar de var(--shadow-sm)
boxShadow: 1  // token de elevation de MUI
```

---

## 6. Resumen de prioridades

| # | Problema | Impacto | Esfuerzo estimado | Estado |
|---|----------|:-------:|:-----------------:|:------:|
| 1 | `AuthProvider` duplicado | 🔴 Alto | Bajo | ✅ Resuelto (`9a7b3ae`) |
| 2 | `ProtectedRoute` sin Context | 🔴 Alto | Bajo | ✅ Resuelto (`9a7b3ae`) |
| 3 | `localStorage.getItem("token")` siempre null | 🔴 Alto | Bajo | ✅ Resuelto (`9e23135`) |
| 4 | URLs hardcodeadas — falta `.env` y `api.js` | 🔴 Alto | Bajo | ✅ Resuelto (`c014d8d`) |
| 5 | `console.log` con token JWT en producción | 🔴 Alto | Bajo | ✅ Resuelto (`bd43183`) |
| 6 | `alert()` en lugar de componentes UI | 🔴 Alto | Bajo | ✅ Resuelto (`9e23135`) |
| 7 | `fetch` mezclado con `axios` | 🔴 Alto | Medio | ✅ Resuelto (`9e23135`) |
| 8 | Interceptor Axios con `window.location.href` | 🔴 Alto | Medio | ✅ Resuelto (`c014d8d`, `bd43183`) |
| 9 | Sin lazy loading de rutas | 🔴 Alto | Medio | ✅ Resuelto (`9a7b3ae`) |
| 10 | `cleanupModals` duplicada × 6 | 🟡 Medio | Bajo | ✅ Resuelto (`bd43183`) |
| 11 | `value` del Context sin `useMemo` | 🟡 Medio | Bajo | ✅ Resuelto (`bd43183`) |
| 12 | `calculateStats` sin `useMemo` | 🟡 Medio | Bajo | ✅ Resuelto (`9e23135`) |
| 13 | `isLoggedIn` local vs Context | 🟡 Medio | Medio | ✅ Resuelto (`3dab79c`, `9e23135`) |
| 14 | ID de usuario con 3 nombres distintos | 🟡 Medio | Medio | ⏳ Pendiente |
| 15 | Sin PropTypes ni TypeScript | 🟡 Medio | Alto | ⏳ Pendiente |
| 16 | Token JWT en `localStorage` (XSS) | 🔴 Alto | Alto *(requiere backend)* | ⏳ Pendiente |

Pendientes reales: **14** (normalizar el id de usuario a un solo nombre en todo el
código — `normalizeUserData` existe pero no se usa consistentemente), **15**
(PropTypes/TypeScript) y **16** (mover el JWT a cookie `HttpOnly`, requiere cambio
de backend). También se eliminó el archivo `App.jsx` duplicado (`413a581`), aparte
de esta tabla.

---

## 7. Bugs encontrados en pruebas manuales (navegador)

### 🟠 `/perfil` se queda cargando para siempre si el usuario no tiene `datosPersonales`

**Archivo:** `pages/PerfilUsuarioPage.jsx` · **Corregido en:** `ee9406c`

`fetchUserData` ponía `loading=true` al empezar la petición pero nunca lo volvía a
`false`: el camino de éxito hacía `return` antes de llegar a esa línea, y el
camino de "sin datos personales todavía" (por ejemplo un usuario recién creado,
como el `admin` que genera `InitialDataLoader`, que no tiene fila en
`datospersonales`) tampoco la tocaba. El spinner "Cargando información del
perfil..." quedaba ahí indefinidamente. Se envolvió en `try/catch/finally` para
que `setLoading(false)` corra siempre, sin importar el resultado.

---

*Informe generado el 25 de abril de 2026 sobre el repositorio `RedCampoConectaFront` (React 19, CRA, MUI 6, Bootstrap 5). Actualizado 2026-08-20 tras pruebas manuales en navegador.*
