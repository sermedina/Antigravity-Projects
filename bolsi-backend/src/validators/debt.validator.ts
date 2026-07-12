import { z } from 'zod';

export const createDebtSchema = z.object({
  body: z.object({
    counterparty_name: z.string(),
    total_amount: z.number().positive(),
    debt_type: z.enum(['I_OWE', 'THEY_OWE_ME']),
    due_date: z.string().optional(),
    start_date: z.string().optional(),
    interest_rate: z.number().min(0).optional(),
    interest_period: z.enum(['daily', 'weekly', 'monthly', 'yearly']).optional(),
    urgency: z.number().int().min(1).max(10).optional()
  })
});

export const payDebtSchema = z.object({
  body: z.object({
    amount: z.number().positive(),
    transaction_id: z.number().optional()
  })
});

export const updateDebtSchema = z.object({
  body: z.object({
    counterparty_name: z.string().optional(),
    total_amount: z.number().positive().optional(),
    debt_type: z.enum(['I_OWE', 'THEY_OWE_ME']).optional(),
    due_date: z.string().optional(),
    start_date: z.string().optional(),
    interest_rate: z.number().min(0).optional(),
    interest_period: z.enum(['daily', 'weekly', 'monthly', 'yearly']).optional(),
    urgency: z.number().int().min(1).max(10).optional()
  })
});

