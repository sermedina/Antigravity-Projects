-- =============================================================
-- BOLSI - Script de Seed para Testing
-- =============================================================
-- INSTRUCCIONES:
-- 1. Arranca el servidor (npm run dev) para que TypeORM cree las tablas.
-- 2. Ejecuta este script completo en tu base de datos 'bolsi'.
-- 3. El usuario de prueba ya viene con email verificado y listo para login.
-- =============================================================

-- ---------------------------------------------------------------
-- 1. ROLES
-- ---------------------------------------------------------------
INSERT INTO roles (name) VALUES
  ('APP_USER'),
  ('PREMIUM_USER'),
  ('CONTENT_MANAGER'),
  ('SYSTEM_ADMIN')
ON CONFLICT (name) DO NOTHING;

-- ---------------------------------------------------------------
-- 2. USUARIO DE PRUEBA
-- Correo:   test@bolsi.com
-- Password: Password123
-- Hash generado con bcrypt (10 salt rounds)
-- ---------------------------------------------------------------
INSERT INTO users (
  id, email, is_email_verified, password_hash,
  first_name, last_name, phone,
  is_phone_verified, country, city, user_type, created_at
) VALUES (
  'a1b2c3d4-0000-0000-0000-000000000001',
  'test@bolsi.com',
  TRUE,
  '$2b$10$rIC/jkC.B9YxSKuLiENNze.q07OOJt8B2kKOsP2tDCsJh5VW3biou',
  'Juan', 'Pérez',
  '+58-412-1234567',
  TRUE, 'Venezuela', 'Caracas', 'NATURAL',
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Asignar rol APP_USER al usuario de prueba
INSERT INTO user_roles (user_id, role_id)
SELECT 'a1b2c3d4-0000-0000-0000-000000000001', id
FROM roles WHERE name = 'APP_USER'
ON CONFLICT DO NOTHING;

-- ---------------------------------------------------------------
-- 3. CATEGORÍAS
-- ---------------------------------------------------------------
INSERT INTO categories (name, type, icon_url) VALUES
  ('Salario',          'INCOME',  NULL),
  ('Freelance',        'INCOME',  NULL),
  ('Dividendos',       'INCOME',  NULL),
  ('Alimentación',     'EXPENSE', NULL),
  ('Transporte',       'EXPENSE', NULL),
  ('Servicios',        'EXPENSE', NULL),
  ('Salud',            'EXPENSE', NULL),
  ('Entretenimiento',  'EXPENSE', NULL),
  ('Educación',        'EXPENSE', NULL),
  ('Diezmo',           'DOA',     NULL),
  ('Ofrenda',          'DOA',     NULL),
  ('Ahorro DOA',       'DOA',     NULL)
ON CONFLICT DO NOTHING;

-- ---------------------------------------------------------------
-- 4. CUENTAS BANCARIAS DEL USUARIO DE PRUEBA
-- ---------------------------------------------------------------
INSERT INTO accounts (id, user_id, name, type, balance, currency) VALUES
  (
    'acc00001-0000-0000-0000-000000000001',
    'a1b2c3d4-0000-0000-0000-000000000001',
    'Banco Principal', 'BANK', 5000.00, 'USD'
  ),
  (
    'acc00001-0000-0000-0000-000000000002',
    'a1b2c3d4-0000-0000-0000-000000000001',
    'Efectivo', 'CASH', 200.00, 'USD'
  )
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------
-- 5. TRANSACCIONES DE EJEMPLO
-- ---------------------------------------------------------------
INSERT INTO transactions (id, user_id, account_id, category_id, amount, type, description, transaction_date, created_at)
SELECT
  'txn00001-0000-0000-0000-000000000001',
  'a1b2c3d4-0000-0000-0000-000000000001',
  'acc00001-0000-0000-0000-000000000001',
  c.id,
  3000.00,
  'INCOME',
  'Salario del mes de junio',
  '2026-06-01',
  NOW()
FROM categories c WHERE c.name = 'Salario'
ON CONFLICT (id) DO NOTHING;

INSERT INTO transactions (id, user_id, account_id, category_id, amount, type, description, transaction_date, created_at)
SELECT
  'txn00001-0000-0000-0000-000000000002',
  'a1b2c3d4-0000-0000-0000-000000000001',
  'acc00001-0000-0000-0000-000000000001',
  c.id,
  150.00,
  'EXPENSE',
  'Supermercado semanal',
  '2026-06-05',
  NOW()
FROM categories c WHERE c.name = 'Alimentación'
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------
-- 6. ASIGNACION DOA (sobre la transacción de salario)
-- ---------------------------------------------------------------
INSERT INTO doa_allocations (id, transaction_id, doa_type, amount) VALUES
  (
    'doa00001-0000-0000-0000-000000000001',
    'txn00001-0000-0000-0000-000000000001',
    'TITHE',
    300.00
  ),
  (
    'doa00001-0000-0000-0000-000000000002',
    'txn00001-0000-0000-0000-000000000001',
    'SAVINGS',
    150.00
  )
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------
-- 7. DEUDAS
-- ---------------------------------------------------------------
INSERT INTO debts (id, user_id, counterparty_name, total_amount, remaining_amount, debt_type, due_date, interest_rate) VALUES
  (
    'dbt00001-0000-0000-0000-000000000001',
    'a1b2c3d4-0000-0000-0000-000000000001',
    'Carlos Rodríguez',
    500.00, 500.00,
    'I_OWE',
    '2026-12-31',
    0.00
  ),
  (
    'dbt00001-0000-0000-0000-000000000002',
    'a1b2c3d4-0000-0000-0000-000000000001',
    'María López',
    200.00, 200.00,
    'THEY_OWE_ME',
    '2026-09-30',
    0.00
  )
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------
-- 8. INVERSIONES
-- ---------------------------------------------------------------
INSERT INTO investments (id, user_id, name, asset_type, platform, current_value) VALUES
  (
    'inv00001-0000-0000-0000-000000000001',
    'a1b2c3d4-0000-0000-0000-000000000001',
    'Bitcoin', 'CRYPTO', 'Binance', 1000.00
  ),
  (
    'inv00001-0000-0000-0000-000000000002',
    'a1b2c3d4-0000-0000-0000-000000000001',
    'Acciones Apple (AAPL)', 'STOCK', 'Interactive Brokers', 2500.00
  )
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------
-- 9. METAS
-- ---------------------------------------------------------------
INSERT INTO goals (id, user_id, name, description, target_amount, current_amount, deadline, status) VALUES
  (
    'gol00001-0000-0000-0000-000000000001',
    'a1b2c3d4-0000-0000-0000-000000000001',
    'Fondo de Emergencia',
    'Acumular 3 meses de gastos',
    5000.00, 500.00,
    '2026-12-31',
    'IN_PROGRESS'
  ),
  (
    'gol00001-0000-0000-0000-000000000002',
    'a1b2c3d4-0000-0000-0000-000000000001',
    'Vacaciones 2027',
    'Viaje a Europa',
    3000.00, 0.00,
    '2027-06-01',
    'IN_PROGRESS'
  )
ON CONFLICT (id) DO NOTHING;

-- =============================================================
-- Verificación final
-- =============================================================
SELECT 'roles'               AS tabla, COUNT(*) AS registros FROM roles
UNION ALL
SELECT 'users',                        COUNT(*) FROM users
UNION ALL
SELECT 'categories',                   COUNT(*) FROM categories
UNION ALL
SELECT 'accounts',                     COUNT(*) FROM accounts
UNION ALL
SELECT 'transactions',                 COUNT(*) FROM transactions
UNION ALL
SELECT 'doa_allocations',              COUNT(*) FROM doa_allocations
UNION ALL
SELECT 'debts',                        COUNT(*) FROM debts
UNION ALL
SELECT 'investments',                  COUNT(*) FROM investments
UNION ALL
SELECT 'goals',                        COUNT(*) FROM goals;
