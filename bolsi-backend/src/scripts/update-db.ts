import { AppDataSource } from '../config/data-source';

async function main() {
  await AppDataSource.initialize();
  console.log('Database initialized');
  await AppDataSource.query(`
    ALTER TABLE debts ADD COLUMN IF NOT EXISTS urgency integer DEFAULT 5;
    ALTER TABLE debts ADD COLUMN IF NOT EXISTS start_date date;
    ALTER TABLE debts ADD COLUMN IF NOT EXISTS interest_period varchar(20) DEFAULT 'monthly';

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
  `);
  console.log('Database updates and trigger function replacement executed successfully');
  await AppDataSource.destroy();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
