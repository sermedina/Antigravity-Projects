import { z } from 'zod';

export const toggleStatusSchema = z.object({
  body: z.object({
    is_active: z.boolean()
  })
});

export const updateProfileSchema = z.object({
  body: z.object({
    first_name: z.string().max(100).optional(),
    last_name: z.string().max(100).optional(),
    phone: z.string().max(50).optional(),
    country: z.string().max(100).optional(),
    city: z.string().max(100).optional(),
    user_type: z.enum(['NATURAL', 'JURIDICO']).optional()
  })
});

export const changePasswordSchema = z.object({
  body: z.object({
    current_password: z.string().min(1),
    new_password: z.string().min(6)
  })
});

export const createSharedAccessSchema = z.object({
  body: z.object({
    guest_email: z.string().email(),
    access_level: z.enum(['READ_ONLY', 'READ_WRITE']).optional()
  })
});

