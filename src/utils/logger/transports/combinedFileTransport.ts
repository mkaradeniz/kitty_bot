import winston, { format as winstonFormat } from 'winston';

import envConfig from '../../../config/env';
import stringify from '../../misc/stringify';

const { metadata, combine, json, printf, timestamp } = winstonFormat;

const customFormatter = printf(info => {
  return stringify({ ...info }, null, 2);
});

const format = combine(json(), metadata(), timestamp(), winstonFormat.splat(), customFormatter);

const combinedFileTransport = new winston.transports.File({
  format,
  filename: `${envConfig.settingLogFilePath}/combined.log`,
  level: 'silly',
});

export default combinedFileTransport;
