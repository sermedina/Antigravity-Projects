import { z } from 'zod';

export const createDebtSchema = z.object({
  body: z.object({
    counterparty_name: z.string(),
    total_amount: z.number().positive(),
    debt_type: z.enum(['I_OWE', 'THEY_OWE_ME']),
    due_date: z.string().optional(),
    interest_rate: z.number().min(0).optional()
  })
});

export const payDebtSchema = z.object({
  body: z.object({
    amount: z.number().positive(),
    transaction_id: z.number().optional()
  })
});
