import { Router } from 'express';

import { runtimeController } from '../controllers/runtime.controller.js';
import { submissionController } from '../controllers/submission.controller.js';
import { validateRequest } from '../middlewares/validate.middleware.js';
import { publicRateLimiter, submissionRateLimiter } from '../middlewares/rate-limit.middleware.js';
import { embedTokenParamsSchema } from '../schemas/runtime.schema.js';
import {
  submitSubmissionBodySchema,
  submitSubmissionParamsSchema,
} from '../schemas/submission.schema.js';

const router = Router();

router.use(publicRateLimiter);

router.get(
  '/widgets/:embedToken/config',
  validateRequest({ params: embedTokenParamsSchema }),
  runtimeController.getConfig,
);

router.get(
  '/widgets/:embedToken/runtime',
  validateRequest({ params: embedTokenParamsSchema }),
  runtimeController.getRuntime,
);

router.get(
  '/widgets/:embedToken/health',
  validateRequest({ params: embedTokenParamsSchema }),
  runtimeController.getHealth,
);

router.post(
  '/widgets/:embedToken/submit',
  submissionRateLimiter,
  validateRequest({ params: submitSubmissionParamsSchema, body: submitSubmissionBodySchema }),
  submissionController.submitPublic,
);

export { router as publicRouter };
