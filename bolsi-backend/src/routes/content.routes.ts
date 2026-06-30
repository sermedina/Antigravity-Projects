import { Router } from 'express';
import { ContentController } from '../controllers/content.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/role.middleware';
import { validate } from '../middlewares/validate.middleware';
import { createContentSchema, updateContentSchema, updateProgressSchema } from '../validators/content.validator';

const router = Router();
const contentController = new ContentController();

router.use(authenticateJWT);

// Progress routes (Note: /progress/global must be registered BEFORE /:id to avoid matching it as a parameter)
router.get('/progress/global', authorizeRoles('SYSTEM_ADMIN', 'CONTENT_MANAGER'), contentController.getGlobalProgress);
router.get('/progress', contentController.getProgressByUser);
router.post('/:id/progress', validate(updateProgressSchema), contentController.updateProgress);

// Educational Content CRUD routes
router.get('/', contentController.getContents);
router.get('/:id', contentController.getContentById);

// Admin / Content Manager only
router.post('/', authorizeRoles('SYSTEM_ADMIN', 'CONTENT_MANAGER'), validate(createContentSchema), contentController.createContent);
router.put('/:id', authorizeRoles('SYSTEM_ADMIN', 'CONTENT_MANAGER'), validate(updateContentSchema), contentController.updateContent);
router.delete('/:id', authorizeRoles('SYSTEM_ADMIN', 'CONTENT_MANAGER'), contentController.deleteContent);

export default router;
