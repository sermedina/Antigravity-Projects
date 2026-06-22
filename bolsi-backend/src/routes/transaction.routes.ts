import { Router } from 'express';
import { TransactionController } from '../controllers/transaction.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { createTransactionSchema } from '../validators/transaction.validator';

const router = Router();
const transactionController = new TransactionController();

router.use(authenticateJWT); // Protect all transaction routes

router.post('/', validate(createTransactionSchema), transactionController.create);
router.get('/', transactionController.getAll);

export default router;
