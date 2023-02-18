import formatDate from 'date-fns/format';
import winston, { format as winstonFormat } from 'winston';

import envConfig from '@config/env';
import isNotNullOrUndefined from '@utils/misc/isNotNullOrUndefined';
import stringify from '@utils/misc/stringify';

const { combine, printf, timestamp } = winstonFormat;

const customFormatter = printf(info => {
  const formattedDate = formatDate(new Date(info.timestamp as string), 'yyyy-MM-dd|HH:mm:ss:SSS');

  if (typeof info.message === 'object') {
    info.message = stringify(info.message, null, 2);
  }

  const label = isNotNullOrUndefined(info.label) ? `[${info.label}]` : undefined;

  return [`${formattedDate}`, `|${info.level}|`, label, `${info.message}`].filter(isNotNullOrUndefined).join(' ');
});

const format = combine(timestamp(), winstonFormat.splat(), customFormatter);

const errorFileSimpleTransport = new winston.transports.File({
  format,
  filename: `${envConfig.settingLogFilePath}/error.simple.log`,
  level: 'error',
});

export default errorFileSimpleTransport;
