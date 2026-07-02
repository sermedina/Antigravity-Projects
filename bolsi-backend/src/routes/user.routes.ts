import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/role.middleware';
import { validate } from '../middlewares/validate.middleware';
import { toggleStatusSchema, updateProfileSchema, changePasswordSchema, createSharedAccessSchema } from '../validators/user.validator';

const router = Router();
const userController = new UserController();

router.use(authenticateJWT);

// Rutas de autogestión de perfil
router.get('/profile', userController.getProfile);
router.put('/profile', validate(updateProfileSchema), userController.updateProfile);
router.put('/change-password', validate(changePasswordSchema), userController.changePassword);
router.get('/shared-access', userController.getSharedAccess);
router.post('/shared-access', validate(createSharedAccessSchema), userController.createSharedAccess);
router.delete('/shared-access/:id', userController.deleteSharedAccess);

// Rutas de administración
router.get('/', authorizeRoles('SYSTEM_ADMIN'), userController.getUsers);
router.get('/:id', authorizeRoles('SYSTEM_ADMIN'), userController.getUserById);
router.patch('/:id/status', authorizeRoles('SYSTEM_ADMIN'), validate(toggleStatusSchema), userController.toggleStatus);

export default router;
