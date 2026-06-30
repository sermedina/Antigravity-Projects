# Plan de Implementación del Backend (Node.js + Express)

Este plan detalla la construcción desde cero del backend para la aplicación de gestión financiera personal, siguiendo los lineamientos de arquitectura en capas (Controllers, Services, Repositories), principios SOLID y utilizando PostgreSQL puro (mediante `pg`).

Dado el tamaño del requerimiento, propongo construir el sistema de forma iterativa y estructurada.

## 1. Estructura del Proyecto

El proyecto se inicializará en la carpeta actual y tendrá la siguiente estructura base:

```text
/src
  /config         # Configuración de base de datos y variables de entorno
  /controllers    # Manejo de peticiones HTTP y respuestas
  /middlewares    # Autenticación JWT, manejo de errores
  /repositories   # Consultas a la base de datos (PostgreSQL crudo / pg)
  /routes         # Definición de rutas y mapeo a controladores
  /services       # Lógica de negocio (Principios SOLID)
  /validators     # Validación de esquemas (ej. con Zod o Joi)
  /utils          # Utilidades (hash de passwords, generación de OTPs)
  app.js          # Configuración de Express
  server.js       # Punto de entrada
```

## 2. Dependencias Principales a Instalar

- `express`: Framework web.
- `pg`: Cliente de PostgreSQL para interactuar con la BD mediante el patrón Repository.
- `bcrypt`: Hasheo de contraseñas.
- `jsonwebtoken`: Autenticación y autorización (JWT).
- `zod`: (Sugerido) Para la validación de los *payloads* en la capa `/validators`.
- `dotenv`: Manejo de variables de entorno.
- `cors` y `helmet`: Seguridad.

## 3. Fases de Desarrollo Propuestas

Debido a la magnitud del backend, ejecutaré la creación del código en **4 Fases**:

### Fase 1: Infraestructura Base y Seguridad (Módulos: Autenticación y Usuarios)
- **Base de Datos:** Script de inicialización de tablas (DDL para usuarios, tokens de verificación, roles).
- **Configuración:** Setup de Express, conexión a PostgreSQL (`src/config/db.js`).
- **Middlewares:** `auth.middleware.js` (verifica JWT) y `error.middleware.js`.
- **Módulo Users/Auth:** 
  - `auth.routes.js`, `auth.controller.js`, `auth.service.js`.
  - Registro de usuarios, login, generación de OTPs para verificación y recuperación de contraseña.
  - CRUD básico de usuarios (`user.repository.js`).

### Fase 2: Finanzas Básicas (Módulos: Ingresos, Egresos y DOA)
- **Base de Datos:** Tablas `accounts`, `categories`, `transactions`, `doa_allocations`.
- **Módulo Transactions:**
  - `transaction.repository.js` (separando tipos: Ingreso, Egreso, Transferencia).
  - Lógica para actualizar saldos de `accounts`.
  - Integración de la lógica del módulo DOA (separar porcentajes al guardar ingresos).

### Fase 3: Deudas e Inversiones
- **Base de Datos:** Tablas `debts`, `debt_payments`, `investments`, `investment_txs`.
- **Módulos:**
  - `debt.service.js` y `investment.service.js`.
  - Lógica para realizar pagos vinculados a transacciones bancarias.

### Fase 4: Metas (Goals)
- **Base de Datos:** Tablas `goals`, `goal_contributions`.
- **Módulos:**
  - Lógica para apartar fondos para metas financieras.

---

> [!IMPORTANT]
> **Revisión del Usuario Requerida**
> Por favor revisa las preguntas a continuación antes de proceder. Una vez que apruebes este plan, comenzaré a ejecutar los comandos de terminal para crear la estructura, instalar dependencias y escribir el código de la **Fase 1**.

## Preguntas Abiertas

1. **Validadores:** Propongo usar `Zod` (muy popular y tipado) o `Joi` para la capa de validadores. ¿Tienes alguna preferencia?
2. **Consultas a BD:** Como pediste PostgreSQL directo en lugar de un ORM (como Prisma/TypeORM), usaré el paquete `pg` para escribir las consultas en SQL crudo dentro de los `repositories` (previniendo inyecciones SQL mediante queries parametrizadas). ¿Estás de acuerdo?
3. **Ejecución de la BD:** ¿Tienes ya una base de datos PostgreSQL local corriendo donde pueda ejecutar las migraciones, o por ahora solo quieres que genere todo el código fuente y los scripts `.sql` para que tú los corras luego?
