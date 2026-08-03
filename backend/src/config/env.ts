import dotenv from 'dotenv';

import { validateEnv, type Env } from '../schemas/env.schema.js';

dotenv.config();

export const env: Env = validateEnv();
