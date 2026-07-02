# Walkthrough de Bolsi Mobile e Integración del Backend

Este documento detalla todas las extensiones agregadas al backend de Bolsi y la implementación completa de la aplicación móvil nativa multi-plataforma (`bolsi-mobile`).

---

## 🚀 Cambios Realizados

### 1. Extensiones del Backend (`bolsi-backend`)
*   **Ruta Estática de Comprobantes:** Se expuso `/uploads` vinculada a la ruta de almacenamiento de imágenes.
*   **Servicio de Autenticación:** Se implementó verificación de correo OTP, solicitud de recuperación y restablecimiento de contraseña.
*   **Servicio y CRUD de Cuentas:** Se creó la lógica CRUD para cuentas (`Account`) asegurando el recálculo y almacenamiento de balances.
*   **Servicio y CRUD de Transacciones:** Se implementó la lógica para obtener detalles, editar y eliminar transacciones. Al actualizar o eliminar, el backend realiza de manera transaccional la reversión de los balances en las cuentas afectadas y limpia las asignaciones DOA.
*   **Deudas, Inversiones, Metas y Perfil:** Se crearon endpoints específicos para el detalle, edición y eliminación de deudas, inversiones y metas, así como la actualización del perfil del usuario, cambio de contraseña segura con bcrypt y delegación de accesos compartidos (READ_ONLY / READ_WRITE).

### 2. Proyecto Móvil (`bolsi-mobile`)
*   **Configuración Inicial:** Proyecto Expo SDK 57 con soporte completo para TypeScript y sistema de enrutamiento basado en archivos (Expo Router).
*   **Capa de Servicios y Red:**
    *   Cliente Axios centralizado (`services/api.ts`) que resuelve la dirección IP del host de desarrollo local de manera dinámica (funcionando transparentemente en emuladores y dispositivos reales bajo la misma red).
    *   Soporte para persistir el token JWT de sesión de manera segura utilizando `expo-secure-store`.
*   **Persistencia y Cache Offline:**
    *   Configuración de TanStack Query con un persistidor local (`@tanstack/query-async-storage-persister`) en `AsyncStorage` para almacenar en caché las consultas.
    *   Monitor de conectividad a internet integrado (`context/OfflineContext.tsx`) que alerta al usuario mediante un banner global si pierde conexión y conmuta la app a modo lectura offline.
*   **Pantallas y Experiencia de Usuario (Material Design 3):**
    *   **(auth)/login.tsx:** Inicio de sesión que adapta el correo al campo username del backend, con control de carga.
    *   **(auth)/register.tsx:** Registro de cuentas recopilando campos opcionales del perfil (teléfono, país, ciudad, tipo de persona).
    *   **(auth)/recover.tsx:** Recuperación de contraseña y cambio de clave con interfaz guiada.
    *   **(auth)/verify.tsx:** Activación de cuentas a través de códigos OTP.
    *   **(tabs)/home.tsx (Resumen):** Dashboard con métricas clave y visualización de gráficos mensuales (LineChart de flujo de fondos y PieChart de egresos por categoría).
    *   **(tabs)/finances.tsx (Finanzas):** Interfaz para manejar cuentas y movimientos, registrar ingresos y egresos vinculados a categorías, tomar fotos o cargar imágenes de comprobantes y visualizar DOA.
    *   **(tabs)/planning.tsx (Planificación):** Control de deudas con barras de progreso de pagos, inversiones con registro de rendimientos y metas de ahorro con control de aportaciones.
    *   **(tabs)/education.tsx (Biblioteca):** Lista de artículos/cursos con barra de seguimiento de progreso.
    *   **(tabs)/profile.tsx (Ajustes):** Edición de perfil, cambio de clave, delegación de accesos compartidos a invitados por email y creación de recordatorios con notificaciones push locales programadas.

---

## 🧪 Verificación y Compilación

*   **Backend:** Ejecución exitosa de `npm run build`. Compilación de TypeScript limpia y sin advertencias.
*   **Aplicación Móvil:** Ejecución exitosa de `npx tsc --noEmit`. Compilación de TypeScript 100% limpia sin errores.
