import { Request, Response, NextFunction } from 'express';
import { ZodObject } from 'zod';

const cleanMultipartBody = (obj: any): any => {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'string') {
    if (obj === 'null') return null;
    if (obj === 'undefined') return undefined;
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(cleanMultipartBody);
  }
  if (typeof obj === 'object') {
    const cleaned: any = {};
    for (const key of Object.keys(obj)) {
      const val = cleanMultipartBody(obj[key]);
      if (val !== undefined) {
        cleaned[key] = val;
      }
    }
    return cleaned;
  }
  return obj;
};

export const validate = (schema: ZodObject) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Si es una petición multipart/form-data, doa_allocations vendrá como string
      if (req.body && typeof req.body.doa_allocations === 'string') {
        try {
          req.body.doa_allocations = JSON.parse(req.body.doa_allocations);
        } catch (e) {
          // Ignorar error y dejar que Zod valide el valor no válido
        }
      }

      if (req.body) {
        req.body = cleanMultipartBody(req.body);
      }

      const parsed: any = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      // Escribir los valores saneados y convertidos (coerced) de vuelta en el request
      if (parsed.body !== undefined) req.body = parsed.body;
      if (parsed.query !== undefined) req.query = parsed.query;
      if (parsed.params !== undefined) req.params = parsed.params;

      return next();
    } catch (error: any) {
      if (error.issues) {
        const messages = error.issues.map((issue: any) => `${issue.path.join('.')}: ${issue.message}`).join(', ');
        return res.status(400).json({ error: `Validación falló: ${messages}` });
      }
      return res.status(400).json(error);
    }
  };
