import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { User } from '../entities/User';
import { Role } from '../entities/Role';
import { SharedAccess } from '../entities/SharedAccess';
import { VerificationToken } from '../entities/VerificationToken';
import { PushToken } from '../entities/PushToken';
import { Account } from '../entities/Account';
import { Category } from '../entities/Category';
import { Transaction } from '../entities/Transaction';
import { DoaAllocation } from '../entities/DoaAllocation';
import { Debt } from '../entities/Debt';
import { DebtPayment } from '../entities/DebtPayment';
import { Investment } from '../entities/Investment';
import { InvestmentTransaction } from '../entities/InvestmentTransaction';
import { Goal } from '../entities/Goal';
import { GoalContribution } from '../entities/GoalContribution';
import { Reminder } from '../entities/Reminder';
import { EducationalContent } from '../entities/EducationalContent';
import { UserContentProgress } from '../entities/UserContentProgress';
import { Bank } from '../entities/Bank';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '12345',
  database: process.env.DB_NAME || 'bolsi',
  synchronize: false, // Auto-create tables (Dev only)
  logging: false,
  entities: [
    User, Role, SharedAccess, VerificationToken, PushToken,
    Account, Category, Transaction, DoaAllocation,
    Debt, DebtPayment, Investment, InvestmentTransaction,
    Goal, GoalContribution, Reminder, EducationalContent,
    UserContentProgress, Bank
  ],
  migrations: [],
  subscribers: [],
});
