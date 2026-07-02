import { Router } from 'express';
import { DebtController } from '../controllers/debt.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { createDebtSchema, payDebtSchema, updateDebtSchema } from '../validators/debt.validator';

const router = Router();
const debtController = new DebtController();

router.use(authenticateJWT);

router.post('/', validate(createDebtSchema), debtController.create);
router.post('/:debtId/pay', validate(payDebtSchema), debtController.pay);
router.get('/', debtController.getAll);
router.get('/:id', debtController.getById);
router.put('/:id', validate(updateDebtSchema), debtController.update);
router.delete('/:id', debtController.delete);

export default router;
