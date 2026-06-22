import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(6),
    first_name: z.string().optional(),
    last_name: z.string().optional(),
    phone: z.string().optional(),
    country: z.string().optional(),
    city: z.string().optional(),
    user_type: z.enum(['NATURAL', 'JURIDICO']).optional()
  })
});

export const loginSchema = z.object({
  body: z.object({
    username: z.string(),
    password: z.string()
  })
});

export const verifyEmailSchema = z.object({
  body: z.object({
    email: z.string().email(),
    token: z.string()
  })
});

export const requestPasswordRecoverySchema = z.object({
  body: z.object({
    email: z.string().email().optional(),
    phone: z.string().optional()
  }).refine(data => data.email || data.phone, {
    message: "Email or phone must be provided"
  })
});

export const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string(),
    new_password: z.string().min(6)
  })
});
