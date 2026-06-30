import { Router } from 'express';
import { SharedAccessAuditController } from '../controllers/shared-access-audit.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/role.middleware';

const router = Router();
const auditController = new SharedAccessAuditController();

router.use(authenticateJWT);
router.use(authorizeRoles('SYSTEM_ADMIN'));

router.get('/', auditController.getAllSharedAccesses);

export default router;
