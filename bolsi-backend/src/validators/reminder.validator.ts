import { z } from 'zod';

export const createReminderSchema = z.object({
  body: z.object({
    title: z.string().min(2).max(150),
    description: z.string().optional().nullable(),
    reminder_date: z.string().datetime(),
    is_recurring: z.boolean().optional(),
    recurrence_rule: z.string().optional().nullable(),
    is_active: z.boolean().optional()
  })
});

export const updateReminderSchema = z.object({
  body: z.object({
    title: z.string().min(2).max(150).optional(),
    description: z.string().optional().nullable(),
    reminder_date: z.string().datetime().optional(),
    is_recurring: z.boolean().optional(),
    recurrence_rule: z.string().optional().nullable(),
    is_active: z.boolean().optional()
  })
});
