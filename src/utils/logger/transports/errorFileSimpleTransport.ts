import formatDate from 'date-fns/format';
import winston, { format as winstonFormat } from 'winston';

import envConfig from '../../../config/env';

const { combine, printf, timestamp } = winstonFormat;

const customFormatter = printf(formatters => {
  const formattedDate = formatDate(new Date(formatters.timestamp as string), 'yyyy-MM-dd|HH:mm:ss:SSS');

  return `${formattedDate} ${formatters.level}: ${formatters.message}`;
});

const format = combine(timestamp(), customFormatter);

const errorFileSimpleTransport = new winston.transports.File({
  format,
  filename: `${envConfig.settingLogFilePath}/error.simple.log`,
  level: 'error',
});

export default errorFileSimpleTransport;
