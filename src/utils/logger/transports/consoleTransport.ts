import formatDate from 'date-fns/format';
import winston, { format as winstonFormat } from 'winston';

import envConfig from '../../../config/env';

const { colorize, combine, printf, timestamp } = winstonFormat;

const customFormatter = printf(formatters => {
  const formattedDate = formatDate(new Date(formatters.timestamp as string), 'yyyy-MM-dd HH:mm:ss:SSS');

  return `${formattedDate} ${formatters.level}: ${formatters.message}`;
});

const format = combine(colorize(), timestamp(), customFormatter);
const level = envConfig.isDev ? envConfig.settingLogLevelDev : envConfig.settingLogLevel;

const consoleTransport = new winston.transports.Console({ format, level });

export default consoleTransport;
