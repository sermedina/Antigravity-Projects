import { AppDataSource } from '../config/data-source';

async function main() {
  await AppDataSource.initialize();
  console.log('Database initialized');
  await AppDataSource.query(`
    ALTER TABLE debts ADD COLUMN IF NOT EXISTS urgency integer DEFAULT 5;
  `);
  console.log('Column urgency added successfully');
  await AppDataSource.destroy();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
