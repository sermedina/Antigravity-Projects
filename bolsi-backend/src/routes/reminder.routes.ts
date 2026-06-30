import { Router } from 'express';
import { ReminderController } from '../controllers/reminder.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/role.middleware';
import { validate } from '../middlewares/validate.middleware';
import { createReminderSchema, updateReminderSchema } from '../validators/reminder.validator';

const router = Router();
const reminderController = new ReminderController();

router.use(authenticateJWT);

// Admin-only global route (Note: register it BEFORE /:id)
router.get('/global', authorizeRoles('SYSTEM_ADMIN'), reminderController.getAllReminders);

// Standard user routes
router.get('/', reminderController.getMyReminders);
router.post('/', validate(createReminderSchema), reminderController.createReminder);
router.put('/:id', validate(updateReminderSchema), reminderController.updateReminder);
router.delete('/:id', reminderController.deleteReminder);

export default router;
