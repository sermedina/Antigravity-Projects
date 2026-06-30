import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/role.middleware';
import { validate } from '../middlewares/validate.middleware';
import { toggleStatusSchema } from '../validators/user.validator';

const router = Router();
const userController = new UserController();

router.use(authenticateJWT);
router.use(authorizeRoles('SYSTEM_ADMIN'));

router.get('/', userController.getUsers);
router.get('/:id', userController.getUserById);
router.patch('/:id/status', validate(toggleStatusSchema), userController.toggleStatus);

export default router;
