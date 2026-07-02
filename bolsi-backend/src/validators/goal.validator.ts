import { z } from 'zod';

export const createGoalSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    target_amount: z.number().positive(),
    deadline: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()
  })
});

export const contributeGoalSchema = z.object({
  body: z.object({
    amount: z.number().positive(),
    transaction_id: z.number().optional()
  })
});

export const updateGoalSchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    description: z.string().optional(),
    target_amount: z.number().positive().optional(),
    deadline: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    status: z.enum(['IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional()
  })
});

