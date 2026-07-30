import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import authRoutes from './routes/auth.routes';
import transactionRoutes from './routes/transaction.routes';
import debtRoutes from './routes/debt.routes';
import investmentRoutes from './routes/investment.routes';
import goalRoutes from './routes/goal.routes';
import userRoutes from './routes/user.routes';
import categoryRoutes from './routes/category.routes';
import contentRoutes from './routes/content.routes';
import reminderRoutes from './routes/reminder.routes';
import sharedAccessAuditRoutes from './routes/shared-access-audit.routes';
import accountRoutes from './routes/account.routes';
import bankRoutes from './routes/bank.routes';

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());
app.use('/uploads', express.static(process.env.IMAGES_UPLOAD_PATH || '/data/images'));

app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/debts', debtRoutes);
app.use('/api/investments', investmentRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/educational-contents', contentRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/shared-access-audits', sharedAccessAuditRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/banks', bankRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

export default app;
