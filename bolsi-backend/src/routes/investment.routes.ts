import { Router } from 'express';
import { InvestmentController } from '../controllers/investment.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { createInvestmentSchema, addInvestmentTransactionSchema } from '../validators/investment.validator';

const router = Router();
const investmentController = new InvestmentController();

router.use(authenticateJWT);

router.post('/', validate(createInvestmentSchema), investmentController.create);
router.post('/:invId/transactions', validate(addInvestmentTransactionSchema), investmentController.addTransaction);
router.get('/', investmentController.getAll);

export default router;
