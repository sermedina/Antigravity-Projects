import { Router } from 'express';
import { BankController } from '../controllers/bank.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';

const router = Router();
const bankController = new BankController();

router.use(authenticateJWT);

router.get('/', bankController.getAll);

export default router;
