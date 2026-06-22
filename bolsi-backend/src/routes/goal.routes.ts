import { Router } from 'express';
import { GoalController } from '../controllers/goal.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { createGoalSchema, contributeGoalSchema } from '../validators/goal.validator';

const router = Router();
const goalController = new GoalController();

router.use(authenticateJWT);

router.post('/', validate(createGoalSchema), goalController.create);
router.post('/:goalId/contribute', validate(contributeGoalSchema), goalController.contribute);
router.get('/', goalController.getAll);
router.delete('/:goalId', goalController.remove);

export default router;
