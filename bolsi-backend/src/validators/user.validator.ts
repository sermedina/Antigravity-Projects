import { z } from 'zod';

export const toggleStatusSchema = z.object({
  body: z.object({
    is_active: z.boolean()
  })
});
