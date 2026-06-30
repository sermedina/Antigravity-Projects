import { z } from 'zod';

export const createContentSchema = z.object({
  body: z.object({
    title: z.string().min(10).max(150),
    type: z.enum(['ARTICLE', 'VIDEO', 'COURSE']),
    body: z.string().optional().nullable(),
    media_url: z.string().url().optional().nullable(),
    status: z.enum(['DRAFT', 'PUBLISHED']).optional(),
    estimated_read_time: z.number().int().positive().optional().nullable()
  })
});

export const updateContentSchema = z.object({
  body: z.object({
    title: z.string().min(10).max(150).optional(),
    type: z.enum(['ARTICLE', 'VIDEO', 'COURSE']).optional(),
    body: z.string().optional().nullable(),
    media_url: z.string().url().optional().nullable(),
    status: z.enum(['DRAFT', 'PUBLISHED']).optional(),
    estimated_read_time: z.number().int().positive().optional().nullable()
  })
});

export const updateProgressSchema = z.object({
  body: z.object({
    progress_percentage: z.number().int().min(0).max(100)
  })
});
