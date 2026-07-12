import { AppDataSource } from '../config/data-source';

async function main() {
  await AppDataSource.initialize();
  console.log('Database initialized');
  await AppDataSource.query(`
    ALTER TABLE debts ADD COLUMN IF NOT EXISTS urgency integer DEFAULT 5;
    ALTER TABLE debts ADD COLUMN IF NOT EXISTS start_date date;
    ALTER TABLE debts ADD COLUMN IF NOT EXISTS interest_period varchar(20) DEFAULT 'monthly';
  `);
  console.log('Columns urgency, start_date and interest_period added successfully');
  await AppDataSource.destroy();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
