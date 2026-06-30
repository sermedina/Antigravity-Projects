import { Router } from 'express';
import { CategoryController } from '../controllers/category.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/role.middleware';
import { validate } from '../middlewares/validate.middleware';
import { createCategorySchema, updateCategorySchema } from '../validators/category.validator';

const router = Router();
const categoryController = new CategoryController();

router.use(authenticateJWT);

// Publicly read categories (for all authenticated users)
router.get('/', categoryController.getCategories);
router.get('/:id', categoryController.getCategoryById);

// Admin-only mutations
router.post('/', authorizeRoles('SYSTEM_ADMIN'), validate(createCategorySchema), categoryController.createCategory);
router.put('/:id', authorizeRoles('SYSTEM_ADMIN'), validate(updateCategorySchema), categoryController.updateCategory);
router.delete('/:id', authorizeRoles('SYSTEM_ADMIN'), categoryController.deleteCategory);

export default router;
