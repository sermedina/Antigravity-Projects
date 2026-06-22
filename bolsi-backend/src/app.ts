import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import authRoutes from './routes/auth.routes';
import transactionRoutes from './routes/transaction.routes';
import debtRoutes from './routes/debt.routes';
import investmentRoutes from './routes/investment.routes';
import goalRoutes from './routes/goal.routes';

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/debts', debtRoutes);
app.use('/api/investments', investmentRoutes);
app.use('/api/goals', goalRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

export default app;
