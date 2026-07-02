import { z } from 'zod';

export const createTransactionSchema = z.object({
  body: z.object({
    account_id: z.number(),
    category_id: z.number().optional(),
    amount: z.number().positive(),
    type: z.enum(['INCOME', 'EXPENSE', 'TRANSFER']),
    description: z.string().optional(),
    payment_receipt_image: z.string().optional(),
    transaction_date: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
    doa_allocations: z.array(z.object({
      doa_type: z.enum(['TITHE', 'OFFERING', 'SAVINGS']),
      amount: z.number().positive()
    })).optional()
  })
});

export const updateTransactionSchema = z.object({
  body: z.object({
    account_id: z.number().optional(),
    category_id: z.number().nullable().optional(),
    amount: z.number().positive().optional(),
    type: z.enum(['INCOME', 'EXPENSE', 'TRANSFER']).optional(),
    description: z.string().optional(),
    payment_receipt_image: z.string().optional(),
    transaction_date: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional(),
    doa_allocations: z.array(z.object({
      doa_type: z.enum(['TITHE', 'OFFERING', 'SAVINGS']),
      amount: z.number().positive()
    })).optional()
  })
});

