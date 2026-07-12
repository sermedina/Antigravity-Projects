import { Response, NextFunction } from 'express';
import { AppDataSource } from '../config/data-source';
import { SharedAccess } from '../entities/SharedAccess';
import { AuthRequest } from './auth.middleware';

export const resolveActiveUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const loggedInUserId = req.user?.id;
  const targetUserIdStr = req.headers['x-shared-owner-id'];

  if (!loggedInUserId) {
    return res.status(401).json({ error: 'No autenticado' });
  }

  if (!targetUserIdStr) {
    req.user.activeUserId = loggedInUserId;
    return next();
  }

  const targetUserId = parseInt(targetUserIdStr as string, 10);
  if (isNaN(targetUserId)) {
    return res.status(400).json({ error: 'ID de usuario compartido inválido' });
  }

  if (targetUserId === loggedInUserId) {
    req.user.activeUserId = loggedInUserId;
    return next();
  }

  // Verificar si existe una delegación activa
  const sharedRepo = AppDataSource.getRepository(SharedAccess);
  const delegation = await sharedRepo.findOne({
    where: { 
      owner: { id: targetUserId }, 
      guest: { id: loggedInUserId } 
    }
  });

  if (!delegation) {
    return res.status(403).json({ error: 'No tienes acceso a los datos de este usuario.' });
  }

  // Si intenta escribir (POST, PUT, DELETE) pero su rol es READ_ONLY, denegar
  if (['POST', 'PUT', 'DELETE'].includes(req.method) && delegation.access_level === 'READ_ONLY') {
    return res.status(403).json({ error: 'Solo tienes acceso de lectura a los datos de este usuario.' });
  }

  req.user.activeUserId = targetUserId;
  req.user.activeAccessLevel = delegation.access_level;
  next();
};
