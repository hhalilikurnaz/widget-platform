import type { NextFunction, Request, Response } from 'express';

import { NotFoundError } from '../errors/index.js';

export function notFoundHandler(_req: Request, _res: Response, next: NextFunction): void {
  next(new NotFoundError('Resource not found'));
}
