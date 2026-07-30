import { AppDataSource } from '../config/data-source';

async function main() {
  await AppDataSource.initialize();
  console.log('Database initialized');
  await AppDataSource.query(`
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
      ('0191', 'Banco Nacional de Crédito, C.A. Banco Universal', '/uploads/banks/generic.png'),
      ('BINA', 'Binance', '/uploads/banks/binance.png')
    ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, logo_url = EXCLUDED.logo_url;

    ALTER TABLE accounts ALTER COLUMN currency TYPE VARCHAR(10);

    ALTER TABLE debts ADD COLUMN IF NOT EXISTS urgency integer DEFAULT 5;
    ALTER TABLE debts ADD COLUMN IF NOT EXISTS start_date date;
    ALTER TABLE debts ADD COLUMN IF NOT EXISTS interest_period varchar(20) DEFAULT 'monthly';

    ALTER TABLE investments ADD COLUMN IF NOT EXISTS custom_asset_type VARCHAR(100);

    CREATE OR REPLACE FUNCTION update_investment_current_value()
    RETURNS TRIGGER AS $$
    BEGIN
        IF NEW.type = 'WITHDRAWAL' THEN
            UPDATE investments
            SET current_value = current_value - NEW.amount,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = NEW.investment_id;
        ELSE
            UPDATE investments
            SET current_value = current_value + NEW.amount,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = NEW.investment_id;
        END IF;
        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    UPDATE goals SET status = 'IN_PROGRESS' WHERE status IS NULL;
    UPDATE goals SET status = 'COMPLETED' WHERE status = 'IN_PROGRESS' AND current_amount >= target_amount;
  `);
  console.log('Database updates and trigger function replacement executed successfully');
  await AppDataSource.destroy();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
