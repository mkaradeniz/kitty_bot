import winston, { format as winstonFormat } from 'winston';

import envConfig from '../../../config/env';

const { metadata, combine, json, printf, timestamp } = winstonFormat;

const customFormatter = printf(formatters => {
  return JSON.stringify({ ...formatters }, null, 2);
});

const format = combine(json(), metadata(), timestamp(), customFormatter);

const combinedFileTransport = new winston.transports.File({
  format,
  filename: `${envConfig.settingLogFilePath}/combined.log`,
  level: 'silly',
});

export default combinedFileTransport;
