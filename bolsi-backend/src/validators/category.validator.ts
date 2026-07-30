import { z } from 'zod';

export const createCategorySchema = z.object({
  body: z.object({
    name: z.string().min(2).max(100),
    type: z.enum(['INCOME', 'EXPENSE', 'DOA', 'SAVING']),
    icon_url: z.string().url().optional().nullable()
  })
});

export const updateCategorySchema = z.object({
  body: z.object({
    name: z.string().min(2).max(100).optional(),
    type: z.enum(['INCOME', 'EXPENSE', 'DOA', 'SAVING']).optional(),
    icon_url: z.string().url().optional().nullable()
  })
});
