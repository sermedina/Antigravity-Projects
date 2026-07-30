import { z } from 'zod';

export const createInvestmentSchema = z.object({
  body: z.object({
    name: z.string(),
    asset_type: z.enum(['STOCK', 'CRYPTO', 'REAL_ESTATE', 'OTHER']),
    custom_asset_type: z.string().nullable().optional(),
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

export const updateInvestmentSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    asset_type: z.enum(['STOCK', 'CRYPTO', 'REAL_ESTATE', 'OTHER']).optional(),
    custom_asset_type: z.string().nullable().optional(),
    platform: z.string().optional(),
    current_value: z.number().min(0).optional()
  })
});

