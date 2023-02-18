import { PrismaClient } from '@prisma/client';

import envConfig from '../src/config/env';

const prisma: PrismaClient = (global as any).prisma ?? new PrismaClient();

if (envConfig.isDev) {
  (global as any).prisma = prisma;
}

export default prisma;
