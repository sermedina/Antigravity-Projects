import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validate } from '../middlewares/validate.middleware';
import { registerSchema, loginSchema, verifyEmailSchema, requestPasswordRecoverySchema, resetPasswordSchema } from '../validators/auth.validator';

const router = Router();
const authController = new AuthController();

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.post('/verify-email', validate(verifyEmailSchema), authController.verifyEmail);
router.post('/request-password-recovery', validate(requestPasswordRecoverySchema), authController.requestPasswordRecovery);
router.post('/reset-password', validate(resetPasswordSchema), authController.resetPassword);

export default router;
