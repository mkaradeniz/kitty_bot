import winston from 'winston';

import { envConfig } from '@config/env';

import { formatErrors } from './formatErrors';
import { combinedFileSimpleTransport } from './transports/combinedFileSimpleTransport';
import { combinedFileTransport } from './transports/combinedFileTransport';
import { consoleTransport } from './transports/consoleTransport';
import { errorFileSimpleTransport } from './transports/errorFileSimpleTransport';
import { errorFileTransport } from './transports/errorFileTransport';

export const logger = winston.createLogger({
  format: formatErrors(),
  level: envConfig.settingLogLevel,
  transports: [combinedFileSimpleTransport, combinedFileTransport, consoleTransport, errorFileSimpleTransport, errorFileTransport],
});
