Diseño Funcional Completo: Panel Administrativo Web (Bolsi Admin)
Este documento define la arquitectura funcional y la estructura de la interfaz de usuario en React para el panel administrativo de la aplicación de gestión financiera. El diseño está alineado con la base de datos PostgreSQL y los roles establecidos en

diseño_arquitectura_financiera.md
: SYSTEM_ADMIN y CONTENT_MANAGER.

Módulos del Panel Administrativo
El panel se organiza en 6 módulos funcionales que encapsulan el ciclo de vida de los datos, la seguridad y la gestión operativa:
mermaid


±------------------------------------------------------------------+
| [Logo: Bolsi Admin] v1.0 |
±------------------------------------------------------------------+
| SECCIÓN: PANEL PRINCIPAL |
| [icon] Dashboard Global (SYSTEM_ADMIN) |
| [icon] Dashboard de Contenidos (SYSTEM_ADMIN, CM) |
±------------------------------------------------------------------+
| SECCIÓN: CONTROL DE USUARIOS (SYSTEM_ADMIN) |
| [icon] Directorio de Usuarios |
| [icon] Auditoría de Accesos Compartidos |
| [icon] Roles y Permisos (RBAC) |
±------------------------------------------------------------------+
| SECCIÓN: CONFIGURACIÓN FINANCIERA (SYSTEM_ADMIN) |
| [icon] Categorías Globales |
| [icon] Auditoría Transaccional (Anónima) |
| [icon] Métricas de Deudas e Inversiones |
±------------------------------------------------------------------+
| SECCIÓN: SISTEMA DE APRENDIZAJE (SYSTEM_ADMIN, CONTENT_MANAGER) |
| [icon] Gestor de Artículos y Cursos (CMS) |
| [icon] Monitoreo de Progreso de Usuarios |
±------------------------------------------------------------------+
| SECCIÓN: OPERACIONES Y ALERTAS (SYSTEM_ADMIN) |
| [icon] Motor de Recordatorios |
| [icon] Logs e Historial de Verificaciones |
±------------------------------------------------------------------+
| SECCIÓN: SISTEMA |
| [icon] Configuración Global (SYSTEM_ADMIN) |
| [icon] Mi Perfil (Todos los roles) |
| [icon] Cerrar Sesión (Todos los roles) |
±------------------------------------------------------------------+
3. Páginas Necesarias
Ruta URL Nombre de la Vista Rol Autorizado Propósito Funcional
/login Inicio de Sesión Público / Todos Autenticación y obtención de JWT.
/dashboard Dashboard Operativo SYSTEM_ADMIN KPIs globales del negocio, comportamiento financiero total de la app.
/content-dashboard Dashboard de Contenidos SYSTEM_ADMIN, CONTENT_MANAGER KPIs de alcance educativo, lecturas completadas, contenidos populares.
/users Directorio de Usuarios SYSTEM_ADMIN CRUD e inhabilitación de usuarios. Filtro por tipo (Natural/Jurídico).
/users/:id Detalle del Usuario SYSTEM_ADMIN Vista detallada de verificación, historial de tokens y estado de sus cuentas (balances generales).
/shared-access Auditoría de Accesos SYSTEM_ADMIN Historial de delegaciones de cuentas financieras entre usuarios.
/categories Categorías Globales SYSTEM_ADMIN CRUD de las categorías (Ingreso, Egreso, DOA) con carga de íconos.
/transactions Historial de Transacciones SYSTEM_ADMIN Monitoreo y auditoría de transacciones registradas (anonimizadas).
/debts-investments Panel de Pasivos/Activos SYSTEM_ADMIN Estadísticas acumuladas de deudas y portafolios de inversión en la app.
/content Biblioteca CMS SYSTEM_ADMIN, CONTENT_MANAGER Lista de contenidos educativos. Acciones de publicar/despublicar.
/content/new Creador de Contenido SYSTEM_ADMIN, CONTENT_MANAGER Editor de texto enriquecido (Rich Text) para nuevos artículos y cursos.
/content/edit/:id Editor de Contenido SYSTEM_ADMIN, CONTENT_MANAGER Modificación de contenido existente.
/user-progress Control de Aprendizaje SYSTEM_ADMIN, CONTENT_MANAGER Ver métricas de finalización y progreso de usuarios por curso/artículo.
/reminders Configuración de Alertas SYSTEM_ADMIN Administración de plantillas de recordatorio y logs de envío.
/settings Configuración Global SYSTEM_ADMIN Ajustes de mantenimiento, seguridad de tokens y variables de negocio.
4. Permisos por Rol (Matriz RBAC)
Entidad / Recurso SYSTEM_ADMIN CONTENT_MANAGER
Users (CRUD y Bloqueo) 🟢 Completo 🔴 Sin Acceso
Verification_Token (Lectura) 🟢 Leer Historial 🔴 Sin Acceso
Shared_Access (Lectura) 🟢 Auditoría de Vínculos 🔴 Sin Acceso
Accounts & Transactions (Auditoría Anónima) 🟢 Lectura (Sin campos identificadores directos) 🔴 Sin Acceso
Categories (CRUD) 🟢 Completo 🔴 Sin Acceso
DOA_Allocation (Análisis) 🟢 Lectura Gráfica 🔴 Sin Acceso
Debts, Investments, Goals (Estadísticas) 🟢 Lectura Consolidada 🔴 Sin Acceso
Educational Content (CMS CRUD) 🟢 Completo 🟢 Completo
User Content Progress (Visualización) 🟢 Completo 🟢 Completo
Reminders (Plantillas y Monitoreo) 🟢 Completo 🔴 Sin Acceso
Global Settings (Edición) 🟢 Completo 🔴 Sin Acceso
5. Navegación entre Pantallas (Flujos de Usuario)
5.1 Flujo de Autenticación y Redirección Inteligente
mermaid
sequenceDiagram
participant User as Usuario Admin
participant Route as React Router (Guard)
participant API as Backend Service

User->>Route: Accede a /dashboard
Route->>Route: ¿Tiene Token JWT activo?
alt No tiene token
    Route->>User: Redirige a /login
else Tiene token
    Route->>API: Valida Rol (SYSTEM_ADMIN o CONTENT_MANAGER)
    alt Rol: SYSTEM_ADMIN
        Route->>User: Permite acceso a /dashboard
    alt Rol: CONTENT_MANAGER
        Route->>User: Redirige a /content-dashboard (Acceso denegado a /dashboard)
    end
end
Copy
5.2 Flujo de Modificación de Contenido Educativo (CONTENT_MANAGER / SYSTEM_ADMIN)
El usuario navega a la sección Biblioteca CMS (/content).
Hace clic en “Nuevo Contenido” -> Es redirigido a /content/new (el menú lateral se contrae automáticamente para maximizar el área de redacción).
Escribe el contenido y carga recursos visuales.
Presiona “Guardar como Borrador” o “Publicar”:
Si guarda como borrador, permanece en /content/edit/:id con un aviso de confirmación.
Si publica, se ejecuta la mutación y se le redirige a /content con un mensaje emergente de éxito.
5.3 Flujo de Atención de Soporte y Auditoría (SYSTEM_ADMIN)
El Administrador recibe un ticket de soporte de un usuario y navega a /users.
Utiliza la barra de búsqueda para localizar al usuario por su username o email.
Selecciona al usuario y entra al detalle /users/:id:
Puede ver si el correo o teléfono están verificados (is_email_verified, is_phone_verified).
Visualiza el historial de verification_tokens (para auditar si falló el envío de algún OTP).
Inspecciona las cuentas del usuario (Accounts) para verificar si el balance reportado coincide con sus reportes visuales en soporte (sin poder ver contraseñas ni editar flujos directos).
6. Componentes Reutilizables (UI System)
Para asegurar la coherencia estética y facilitar el mantenimiento, se definen los siguientes componentes fundamentales:

6.1 Layouts (Estructuras de Página)
<AdminLayout />: Incorpora el menú lateral dinámico, la barra de navegación superior (con notificaciones en tiempo real del sistema y perfil del administrador logueado) y el contenedor responsivo principal.
<AuthLayout />: Plantilla limpia y centrada, con fondos degradados y glassmorphism, utilizada para pantallas de login y recuperación de contraseña.
6.2 Data Display (Visualización y Datos)
<DataTable />:
Funcionalidades: Paginación en servidor, ordenamiento por columnas, buscador global y filtros por columnas específicos.
Propiedades: columns, data, loading, totalRows, onPageChange, onSort.
<CardMetric />:
Diseño: Tarjeta de impacto visual con micro-animación en hover, indicador de tendencia alcista/bajista (porcentaje de cambio con colores curados HSL) e ícono descriptivo.
<StatusBadge />:
Colores HSL:
Verified / Active / Completed: Verde esmeralda suave (#d1fae5, texto #065f46).
Pending / In Progress / Natural: Amarillo ocre suave (#fef3c7, texto #92400e).
Cancelled / Locked / Juridico: Violeta elegante o rojo coral dependiendo de la gravedad.
6.3 Inputs & Forms (Formularios)
<FormInput /> y <FormSelect />: Inputs con soporte integrado para mensajes de error y estados deshabilitados basados en validación local.
<RichTextEditor />: Editor WYSIWYG configurado para sanitizar HTML, permitiendo incrustación directa de videos (para cursos) y estructuración de artículos financieros.
<MediaUploader />: Zona de arrastre (drag-and-drop) para subir imágenes de recibos de transacciones (auditoría), íconos de categorías y portadas de cursos.
6.4 Feedback
<ToastNotification />: Alertas flotantes no bloqueantes con barra de progreso de auto-cierre.
<ConfirmModal />: Modal de seguridad de doble confirmación para acciones destructivas (ej. eliminar una categoría o inhabilitar un usuario).
7. Dashboard Principal (Estructuras y KPIs)
7.1 Dashboard Global (Vista del SYSTEM_ADMIN)
Fila de KPIs Principales (Cards)
Usuarios Registrados: Total acumulado con desglose dinámico: Naturales vs Jurídicos.
Volumen Transaccionado (Mes Actual): Suma total de transacciones registradas de tipo INCOME y EXPENSE (convertido a USD).
Tasa de Verificación: Porcentaje de usuarios que han completado la verificación de correo y teléfono.
Eficiencia de Metas: Promedio del porcentaje completado de las metas activas del sistema (current_amount / target_amount).
Panel de Gráficos
Gráfico de Líneas (Evolución de Registro): Crecimiento mensual de nuevos usuarios y retención de sesiones activas.
Gráfico de Torta (Categorización del Gasto): Distribución de egresos globales agrupados por las categorías del sistema (Alimentación, Vivienda, Transporte, etc.).
Gráfico de Barras Agrupadas (Activos vs Pasivos): Comparación global del volumen total en Inversiones (Investment) contra el volumen total de Deudas registradas (Debt).
Centro de Acciones Rápidas
Botón para crear una categoría global.
Acceso directo al envío de notificaciones del sistema.
Acceso directo a la revisión de alertas críticas del servidor.
7.2 Dashboard de Contenido (Vista compartida: CONTENT_MANAGER / SYSTEM_ADMIN)
Fila de KPIs Educativos
Lecturas Totales: Cantidad de registros en User_Content_Progress con estado “Leído/Completado”.
Tiempo Promedio de Consumo: Tiempo estimado invertido por los usuarios finales en los cursos y artículos.
Contenido Estrella: Título del artículo o curso con mayor tasa de finalización.
Panel de Gráficos
Gráfico de Barras Horizontales: Top 5 de contenidos con mayor progreso o interacción en las últimas semanas.
Gráfico de Embudo (Conversión de Aprendizaje): Porcentaje de usuarios que inician un curso frente a los que completan todas las secciones del contenido educativo.
8. Tablas Administrativas
Las tablas contarán con controles avanzados de filtrado para gestionar de forma eficiente miles de registros.

8.1 Tabla de Usuarios (SYSTEM_ADMIN)
Columnas:
ID (Numérico)
Username (Texto)
Email (Texto + Badge de verificación is_email_verified)
Phone (Texto + Badge de verificación is_phone_verified)
Tipo (Natural / Jurídico)
País / Ciudad (Texto concatenado)
Fecha Registro (Fecha formateada)
Filtros: Búsqueda por coincidencia parcial de email/username, filtro por tipo de usuario, filtro por estado de verificación.
Acciones: Editar datos básicos, Historial de accesos compartidos, Inhabilitar cuenta (Soft Delete).
8.2 Tabla de Transacciones Anónimas (SYSTEM_ADMIN)
Columnas:
ID Transacción (Hash/ID corto)
Usuario (Código Enmascarado) (ej. USR-10827 para mantener Row-Level Security mental en la auditoría)
Cuenta Origen (Tipo: Banco, Tarjeta, Efectivo)
Categoría (Nombre de la categoría)
Monto (Con formato de moneda e indicador de color verde para INCOME y rojo para EXPENSE)
Tipo (Ingreso, Egreso, Transferencia)
Fecha de Transacción (Fecha)
Filtros: Rango de fechas, Selector de tipo de transacción, Selector de Categoría, Rango de montos (Mayor a / Menor a).
Acciones: Ver imagen de soporte del recibo (Modal), Inspeccionar asignaciones DOA (DOA_Allocation) asociadas a la transacción.
8.3 Tabla de Contenido Educativo (CONTENT_MANAGER, SYSTEM_ADMIN)
Columnas:
Título (Texto largo)
Tipo (Artículo / Video / Curso)
Estado (Borrador / Publicado)
Fecha Creación (Fecha)
Vistas / Lectores (Métrica calculada de progreso de usuarios)
Filtros: Búsqueda por título, Selector de tipo de contenido, Selector de estado.
Acciones: Editar contenido, Eliminar de la base de datos (con confirmación de dependencias en progreso de usuario), Cambiar estado de publicación en un clic (Toggle Publish).
8.4 Tabla de Categorías (SYSTEM_ADMIN)
Columnas:
ID (Numérico)
Icono (Render de la imagen de icon_url)
Nombre (Texto)
Tipo (INCOME / EXPENSE / DOA)
Filtros: Selector por tipo de categoría.
Acciones: Editar nombre/ícono, Eliminar (validando si hay transacciones activas usándola).
9. Formularios Administrativos
Todos los formularios se implementarán con validaciones estrictas en el cliente utilizando Zod Schemas antes de enviar las peticiones HTTP al backend.

9.1 Formulario de Contenido Educativo
Estructura Visual: Formulario en dos columnas (Izquierda: Editor de texto y título; Derecha: Parámetros de publicación e imágenes).
Campos y Reglas de Validación:
title (Input de texto): Requerido, mínimo 10 caracteres, máximo 150.
type (Select): Valores permitidos: ARTICLE, VIDEO, COURSE.
body (Rich Text Editor): Requerido para artículos, mínimo 50 caracteres HTML.
media_url (Input de texto): URL válida (YouTube, Vimeo, S3) si el tipo es VIDEO o COURSE.
status (Select): Valores permitidos: DRAFT, PUBLISHED.
estimated_read_time (Input numérico): Opcional, entero positivo en minutos.
9.2 Formulario de Categorías
Estructura Visual: Cuadro de diálogo modal enfocado.
Campos y Reglas de Validación:
name (Input de texto): Requerido, único, mínimo 3 caracteres, máximo 100.
type (Select): Valores permitidos: INCOME, EXPENSE, DOA.
icon_url / icon_file (Carga de archivos): Requerido, formato PNG/SVG, tamaño máximo 500kb.
9.3 Formulario de Edición de Usuario (Soporte Admin)
Estructura Visual: Panel con pestañas (Datos de Perfil, Seguridad y Bloqueos, Auditoría Financiera).
Campos y Reglas de Validación:
first_name & last_name (Input de texto): Opcionales, máximo 100 caracteres.
phone (Input de teléfono): Formato internacional válido.
user_type (Select): NATURAL o JURIDICO.
is_active (Switch): Para banear/desbanear de la plataforma.
10. Configuraciones Globales
Este panel centralizado permite al SYSTEM_ADMIN ajustar el comportamiento del motor de la aplicación sin alterar el código fuente.

10.1 Parámetros de Seguridad y Sesiones
Vencimiento de Tokens de Verificación: Tiempo límite en minutos antes de que expiren los tokens OTP enviados a los usuarios (verification_tokens.expires_at).
Intentos de OTP Permitidos: Límite de fallos de ingreso de token antes de bloquear la solicitud de verificación.
Doble Factor de Autenticación (MFA) para Administradores: Interruptor global para forzar MFA a usuarios con rol SYSTEM_ADMIN y CONTENT_MANAGER.
10.2 Parámetros del Motor de Recordatorios (Reminder Engine)
Cron Rule de Despacho: Regla de ejecución cron global (ej. cada hora) para evaluar deudas (debts) próximas a vencer y despachar alertas de cobro.
Canales Habilitados: Interruptores de envío para: Email, SMS, Push Notification.
Variables de Plantillas: Mapeo y edición del cuerpo de mensajes estándar que el sistema inyecta en los recordatorios automáticos.
10.3 Configuración Operativa de Negocio
Porcentaje DOA por Defecto: Valores de distribución inicial recomendados para el módulo de asignación DOA (ej. 10% Diezmos, 5% Ofrendas, 20% Ahorros).
Moneda de Referencia Base: Moneda por defecto del sistema (USD, EUR, etc.) para consolidación de métricas analíticas.
Modo de Mantenimiento: Interruptor general para redirigir a los usuarios de la app móvil a una pantalla de “Servidor en Mantenimiento” y rechazar temporalmente transacciones no administrativas.
Próximos Pasos (Validación y Aprobación)
Revisión de Estructura: El diseño funcional cubre la totalidad de las 12 entidades especificadas, asegurando que el contenido educativo tenga su CMS completo, las transacciones mantengan su auditoría anonimizada bajo principios de privacidad de datos, y las relaciones de accesos compartidos y recordatorios queden expuestas operativamente.
Aprobación: Quedo a la espera de tu retroalimentación sobre esta propuesta funcional de UI antes de proceder a la creación del código fuente y los componentes en React correspondientes.
11:18 PM