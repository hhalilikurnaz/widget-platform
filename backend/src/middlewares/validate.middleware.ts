import type { NextFunction, Request, Response } from 'express';
import type { ZodTypeAny } from 'zod';

interface ValidationSchemas {
  body?: ZodTypeAny;
  params?: ZodTypeAny;
  query?: ZodTypeAny;
}

export function validateRequest(schemas: ValidationSchemas) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      if (schemas.body) {
        req.body = schemas.body.parse(req.body) as Record<string, unknown>;
      }

      if (schemas.params) {
        req.params = schemas.params.parse(req.params) as Request['params'];
      }

      if (schemas.query) {
        req.validatedQuery = schemas.query.parse(req.query) as Record<string, unknown>;
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}
