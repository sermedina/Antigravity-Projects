-- =============================================================
-- BOLSI - Script de Seed para Testing
-- =============================================================
-- INSTRUCCIONES:
-- 1. Arranca el servidor (npm run dev) para que TypeORM cree las tablas.
-- 2. Ejecuta este script completo en tu base de datos 'bolsi'.
-- 3. El usuario de prueba ya viene con email verificado y listo para login.
-- =============================================================

--
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
-- NOTA: El ID ahora es un entero secuencial. Como es el primer usuario, su ID será 1
INSERT INTO users (
  id, email, is_email_verified, password_hash,
  first_name, last_name, phone,
  is_phone_verified, country, city, user_type, created_at
) VALUES (
  1, 
  'test@bolsi.com',
  TRUE,
  '$2b$10$ozkrjFHmgMD8tFE28QtuQuODZM1cBE1IQQpmw2ujqArWqycCALxZy',
  'Juan', 'Pérez',
  '+58-412-1234567',
  TRUE, 'Venezuela', 'Caracas', 'NATURAL',
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Asignar rol APP_USER al usuario de prueba
INSERT INTO user_roles (user_id, role_id)
SELECT 1, id 
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
    1,
    1,
    'Banco Principal', 'BANK', 5000.00, 'USD'
  ),
  (
    2,
    1,
    'Efectivo', 'CASH', 200.00, 'USD'
  )
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------
-- 5. TRANSACCIONES DE EJEMPLO
-- ---------------------------------------------------------------
INSERT INTO transactions (id, user_id, account_id, category_id, amount, type, description, transaction_date, created_at)
SELECT
  1,
  1,
  1,
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
  2,
  1,
  1, 
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
    1, 
    1,
    'TITHE',
    300.00
  ),
  (
    2,
    1,
    'SAVINGS',
    150.00
  )
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------
-- 7. DEUDAS
-- ---------------------------------------------------------------
INSERT INTO debts (id, user_id, counterparty_name, total_amount, remaining_amount, debt_type, due_date, interest_rate) VALUES
  (
    1,
    1,
    'Carlos Rodríguez',
    500.00, 500.00,
    'I_OWE',
    '2026-12-31',
    0.00
  ),
  (
    2,
    1,
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
    1,
    1,
    'Bitcoin', 'CRYPTO', 'Binance', 1000.00
  ),
  (
    2,
    1,
    'Acciones Apple (AAPL)', 'STOCK', 'Interactive Brokers', 2500.00
  )
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------
-- 9. METAS
-- ---------------------------------------------------------------
INSERT INTO goals (id, user_id, name, description, target_amount, current_amount, deadline, status) VALUES
  (
    1,
    1,
    'Fondo de Emergencia',
    'Acumular 3 meses de gastos',
    5000.00, 500.00,
    '2026-12-31',
    'IN_PROGRESS'
  ),
  (
    2,
    1,
    'Vacaciones 2027',
    'Viaje a Europa',
    3000.00, 0.00,
    '2027-06-01',
    'IN_PROGRESS'
  )
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------
-- 10. BANCOS
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS banks (
  code VARCHAR(4) PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  logo_url VARCHAR(255)
);

ALTER TABLE accounts ADD COLUMN IF NOT EXISTS bank_code VARCHAR(4) REFERENCES banks(code) ON DELETE SET NULL;

INSERT INTO banks (code, name, logo_url) VALUES
  ('0102', 'Banco de Venezuela, S.A. Banco Universal', '/uploads/banks/generic.png'),
  ('0104', 'Venezolano de Crédito, S.A. Banco Universal', '/uploads/banks/generic.png'),
  ('0105', 'Mercantil Banco, C.A. Banco Universal', '/uploads/banks/generic.png'),
  ('0108', 'BBVA Provincial, S.A. Banco Universal', '/uploads/banks/generic.png'),
  ('0114', 'Bancaribe C.A. Banco Universal', '/uploads/banks/generic.png'),
  ('0115', 'Banco Exterior C.A. Banco Universal', '/uploads/banks/generic.png'),
  ('0128', 'Banco Caroní C.A. Banco Universal', '/uploads/banks/generic.png'),
  ('0134', 'Banesco, Banco Universal S.A.C.A.', '/uploads/banks/generic.png'),
  ('0137', 'Banco Sofitasa, Banco Universal', '/uploads/banks/generic.png'),
  ('0138', 'Banco Plaza, Banco Universal', '/uploads/banks/generic.png'),
  ('0146', 'Banco de la Gente Emprendedora C.A.', '/uploads/banks/generic.png'),
  ('0151', 'BFC Banco Fondo Común C.A. Banco Universal', '/uploads/banks/generic.png'),
  ('0156', '100% Banco, Banco Universal C.A.', '/uploads/banks/generic.png'),
  ('0157', 'DelSur Banco Universal C.A.', '/uploads/banks/generic.png'),
  ('0163', 'Banco del Tesoro, C.A. Banco Universal', '/uploads/banks/generic.png'),
  ('0166', 'Banco Agrícola de Venezuela, C.A. Banco Universal', '/uploads/banks/generic.png'),
  ('0168', 'Bancrecer, S.A. Banco Microfinanciero', '/uploads/banks/generic.png'),
  ('0169', 'R4, Banco Microfinanciero, C.A.', '/uploads/banks/generic.png'),
  ('0171', 'Banco Activo, Banco Universal', '/uploads/banks/generic.png'),
  ('0172', 'Bancamiga, Banco Universal C.A.', '/uploads/banks/generic.png'),
  ('0173', 'Banco Internacional de Desarrollo, C.A. Banco Universal', '/uploads/banks/generic.png'),
  ('0174', 'Banplus Banco Universal, C.A.', '/uploads/banks/generic.png'),
  ('0175', 'Banco Digital de Los Trabajadores, Banco Universal C.A.', '/uploads/banks/generic.png'),
  ('0177', 'Banco de la Fuerza Armada Nacional Bolivariana, B.U.', '/uploads/banks/generic.png'),
  ('0178', 'N58 Banco Digital, S.A.', '/uploads/banks/generic.png'),
  ('0191', 'Banco Nacional de Crédito, C.A. Banco Universal', '/uploads/banks/generic.png')
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, logo_url = EXCLUDED.logo_url;

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
SELECT 'goals',                        COUNT(*) FROM goals
UNION ALL
SELECT 'banks',                        COUNT(*) FROM banks;