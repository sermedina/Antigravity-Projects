// ─── Account ─────────────────────────────────────────────────────────────────
export interface Account {
  id: number;
  name: string;
  type: string; // 'BANK' | 'CASH' | 'CREDIT_CARD'
  balance: number;
  currency: string;
}

// ─── DOA Allocation ──────────────────────────────────────────────────────────
export interface DoaAllocation {
  id: number;
  doa_type: string; // 'TITHE' | 'OFFERING' | 'SAVINGS'
  amount: number;
}

// ─── Auth ────────────────────────────────────────────────────────────────────
export interface AuthUser {
  id: number;
  username: string;
  email: string;
  first_name: string;
  roles: string[];
}

export interface LoginPayload {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

// ─── Users ───────────────────────────────────────────────────────────────────
export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  country: string;
  city: string;
  user_type: 'NATURAL' | 'JURIDICO';
  is_active: boolean;
  is_email_verified: boolean;
  is_phone_verified: boolean;
  created_at: string;
  roles: Role[];
  verification_tokens?: VerificationToken[];
}

export interface UserFilters {
  username?: string;
  email?: string;
  user_type?: string;
  is_active?: boolean;
  is_email_verified?: boolean;
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ─── Roles ───────────────────────────────────────────────────────────────────
export interface Role {
  id: number;
  name: string;
}

// ─── Verification Token ──────────────────────────────────────────────────────
export interface VerificationToken {
  id: number;
  token: string;
  type: string;
  medium: string;
  expires_at: string;
  is_used: boolean;
  created_at: string;
}

// ─── Categories ──────────────────────────────────────────────────────────────
export interface Category {
  id: number;
  name: string;
  type: 'INCOME' | 'EXPENSE' | 'DOA';
  icon_url: string | null;
}

export interface CategoryPayload {
  name: string;
  type: 'INCOME' | 'EXPENSE' | 'DOA';
  icon_url?: string;
}

// ─── Transactions ─────────────────────────────────────────────────────────────
export interface Transaction {
  id: number;
  user?: Partial<User>;
  account?: Partial<Account>;
  category?: Partial<Category>;
  amount: number;
  type: 'INCOME' | 'EXPENSE' | 'TRANSFER';
  description?: string;
  payment_receipt_image?: string | null;
  transaction_date: string;
  doa_allocations?: DoaAllocation[];
}


// ─── Educational Content ─────────────────────────────────────────────────────
export interface EducationalContent {
  id: number;
  title: string;
  type: 'ARTICLE' | 'VIDEO' | 'COURSE';
  body: string | null;
  media_url: string | null;
  status: 'DRAFT' | 'PUBLISHED';
  estimated_read_time: number | null;
  created_at: string;
}

export interface ContentPayload {
  title: string;
  type: 'ARTICLE' | 'VIDEO' | 'COURSE';
  body?: string;
  media_url?: string;
  status?: 'DRAFT' | 'PUBLISHED';
  estimated_read_time?: number;
}

// ─── User Content Progress ───────────────────────────────────────────────────
export interface UserContentProgress {
  id: number;
  user: Partial<User>;
  content: Partial<EducationalContent>;
  progress_percentage: number;
  completed_at: string | null;
}

// ─── Shared Access ───────────────────────────────────────────────────────────
export interface SharedAccess {
  id: string;
  owner: Partial<User>;
  guest: Partial<User>;
  access_level: string;
  created_at: string;
}

// ─── Reminders ───────────────────────────────────────────────────────────────
export interface Reminder {
  id: number;
  user: Partial<User>;
  title: string;
  description: string | null;
  reminder_date: string;
  is_recurring: boolean;
  recurrence_rule: string | null;
  is_active: boolean;
}
