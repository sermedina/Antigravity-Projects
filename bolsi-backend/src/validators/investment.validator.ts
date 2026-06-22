import { z } from 'zod';

export const createInvestmentSchema = z.object({
  body: z.object({
    name: z.string(),
    asset_type: z.enum(['STOCK', 'CRYPTO', 'REAL_ESTATE', 'OTHER']),
    platform: z.string().optional(),
    current_value: z.number().min(0).optional()
  })
});

export const addInvestmentTransactionSchema = z.object({
  body: z.object({
    type: z.enum(['CONTRIBUTION', 'WITHDRAWAL', 'RETURN']),
    amount: z.number().positive(),
    transaction_id: z.number().optional()
  })
});
