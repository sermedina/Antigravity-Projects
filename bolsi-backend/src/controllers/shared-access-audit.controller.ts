import { Request, Response } from 'express';
import { SharedAccessAuditService } from '../services/shared-access-audit.service';

const auditService = new SharedAccessAuditService();

export class SharedAccessAuditController {
  async getAllSharedAccesses(req: Request, res: Response) {
    try {
      const result = await auditService.getAllSharedAccesses();
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}
