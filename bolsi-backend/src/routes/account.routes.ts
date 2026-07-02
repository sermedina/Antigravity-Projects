import { Router } from 'express';
import { AccountController } from '../controllers/account.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { createAccountSchema, updateAccountSchema } from '../validators/account.validator';

const router = Router();
const accountController = new AccountController();

router.use(authenticateJWT);

router.get('/', accountController.getAll);
router.get('/:id', accountController.getById);
router.post('/', validate(createAccountSchema), accountController.create);
router.put('/:id', validate(updateAccountSchema), accountController.update);
router.delete('/:id', accountController.delete);

export default router;
