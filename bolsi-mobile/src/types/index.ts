export interface User {
  id: number;
  username: string;
  email: string;
  is_email_verified: boolean;
  first_name?: string;
  last_name?: string;
  phone?: string;
  is_phone_verified: boolean;
  country?: string;
  city?: string;
  user_type: 'NATURAL' | 'JURIDICO';
  is_active: boolean;
  created_at: string;
}

export interface VerificationToken {
  id: number;
  token: string;
  type: 'EMAIL_VERIFICATION' | 'PHONE_VERIFICATION' | 'PASSWORD_RECOVERY';
  medium: 'EMAIL' | 'SMS';
  expires_at: string;
  is_used: boolean;
  created_at: string;
}

export interface Role {
  id: number;
  name: 'APP_USER' | 'PREMIUM_USER' | 'CONTENT_MANAGER' | 'SYSTEM_ADMIN';
}

export interface SharedAccess {
  id: string;
  owner: Partial<User>;
  guest: Partial<User>;
  access_level: 'READ_ONLY' | 'READ_WRITE';
  created_at: string;
}

export interface Bank {
  code: string;
  name: string;
  logo_url?: string;
}

export interface Account {
  id: number;
  name: string;
  type: 'BANK' | 'CASH' | 'CREDIT_CARD';
  balance: number;
  currency: string;
  bank?: Bank;
}

export interface Category {
  id: number;
  name: string;
  type: 'INCOME' | 'EXPENSE' | 'DOA' | 'SAVING';
  icon_url?: string;
}

export interface DoaAllocation {
  id: number;
  doa_type: 'TITHE' | 'OFFERING' | 'SAVINGS';
  amount: number;
}

export interface Transaction {
  id: number;
  account: Account;
  category?: Category;
  amount: number;
  type: 'INCOME' | 'EXPENSE' | 'TRANSFER' | 'DOA' | 'SAVING';
  description?: string;
  payment_receipt_image?: string;
  transaction_date: string;
  created_at: string;
  doa_allocations?: DoaAllocation[];
}

export interface DebtPayment {
  id: number;
  amount: number;
  payment_date: string;
  transaction_id?: number;
}

export interface Debt {
  id: number;
  counterparty_name: string;
  total_amount: number;
  remaining_amount: number;
  debt_type: 'I_OWE' | 'THEY_OWE_ME';
  due_date?: string;
  start_date?: string;
  interest_rate: number;
  interest_period?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  urgency: number;
  payments?: DebtPayment[];
}

export interface InvestmentTransaction {
  id: number;
  type: 'CONTRIBUTION' | 'WITHDRAWAL' | 'RETURN';
  amount: number;
  created_at: string;
}

export interface Investment {
  id: number;
  name: string;
  asset_type: 'STOCK' | 'CRYPTO' | 'REAL_ESTATE' | 'OTHER';
  custom_asset_type?: string;
  platform?: string;
  current_value: number;
  transactions?: InvestmentTransaction[];
}

export interface GoalContribution {
  id: number;
  amount: number;
  contribution_date: string;
}

export interface Goal {
  id: number;
  name: string;
  description?: string;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  target_amount: number;
  current_amount: number;
  deadline?: string;
  contributions?: GoalContribution[];
}

export interface Reminder {
  id: number;
  title: string;
  description?: string;
  reminder_date: string;
  is_recurring: boolean;
  recurrence_rule?: string;
  is_active: boolean;
}

export interface EducationalContent {
  id: number;
  title: string;
  type: 'ARTICLE' | 'VIDEO' | 'COURSE';
  body?: string;
  media_url?: string;
  status: 'DRAFT' | 'PUBLISHED';
  estimated_read_time?: number;
  created_at: string;
}

export interface UserContentProgress {
  id: number;
  content_id: number;
  progress_percentage: number;
  completed_at?: string;
}
