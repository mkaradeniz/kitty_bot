import formatDate from 'date-fns/format';
import winston, { format as winstonFormat } from 'winston';

import envConfig from '../../../config/env';
import isNotNullOrUndefined from '../../misc/isNotNullOrUndefined';
import stringify from '../../misc/stringify';

const { colorize, combine, printf, timestamp } = winstonFormat;

const customFormatter = printf(info => {
  const formattedDate = formatDate(new Date(info.timestamp as string), 'yyyy-MM-dd HH:mm:ss:SSS');

  if (typeof info.message === 'object') {
    info.message = stringify(info.message, null, 2);
  }

  const label = isNotNullOrUndefined(info.label) ? `[\x1b[2m${info.label}\x1b[0m]` : undefined;

  return [`${formattedDate}`, `${info.level}`, label, `${info.message}`].filter(isNotNullOrUndefined).join(' ');
});

const format = combine(colorize(), timestamp(), customFormatter);
const level = envConfig.isDev ? envConfig.settingLogLevelDev : envConfig.settingLogLevel;

const consoleTransport = new winston.transports.Console({ format, level });

export default consoleTransport;
