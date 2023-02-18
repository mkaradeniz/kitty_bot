import winston from 'winston';

import combinedFileSimpleTransport from './transports/combinedFileSimpleTransport';
import combinedFileTransport from './transports/combinedFileTransport';
import consoleTransport from './transports/consoleTransport';
import envConfig from '../../config/env';
import errorFileSimpleTransport from './transports/errorFileSimpleTransport';
import errorFileTransport from './transports/errorFileTransport';
import formatErrors from './formatErrors';

const logger = winston.createLogger({
  format: formatErrors(),
  level: envConfig.settingLogLevel,
  transports: [combinedFileSimpleTransport, combinedFileTransport, consoleTransport, errorFileSimpleTransport, errorFileTransport],
});

export default logger;
