import { z } from 'zod';

export const createAccountSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(100),
    type: z.enum(['BANK', 'CASH', 'CREDIT_CARD']),
    balance: z.number().optional(),
    currency: z.string().min(3).max(10).optional(),
    bankCode: z.string().length(4).optional().nullable()
  })
});

export const updateAccountSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(100).optional(),
    type: z.enum(['BANK', 'CASH', 'CREDIT_CARD']).optional(),
    balance: z.number().optional(),
    currency: z.string().min(3).max(10).optional(),
    bankCode: z.string().length(4).optional().nullable()
  })
});
