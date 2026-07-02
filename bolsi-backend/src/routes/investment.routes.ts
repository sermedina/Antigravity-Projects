import { Router } from 'express';
import { InvestmentController } from '../controllers/investment.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { createInvestmentSchema, addInvestmentTransactionSchema, updateInvestmentSchema } from '../validators/investment.validator';

const router = Router();
const investmentController = new InvestmentController();

router.use(authenticateJWT);

router.post('/', validate(createInvestmentSchema), investmentController.create);
router.post('/:invId/transactions', validate(addInvestmentTransactionSchema), investmentController.addTransaction);
router.get('/', investmentController.getAll);
router.get('/:id', investmentController.getById);
router.put('/:id', validate(updateInvestmentSchema), investmentController.update);
router.delete('/:id', investmentController.delete);

export default router;
