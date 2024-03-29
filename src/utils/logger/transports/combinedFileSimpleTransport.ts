import winston, { format as winstonFormat } from 'winston';

import { envConfig } from '@config/env';

import { isNotNullOrUndefined } from '@utils/misc/isNotNullOrUndefined';
import { stringify } from '@utils/misc/stringify';

const { combine, printf, timestamp } = winstonFormat;

const customFormatter = printf(info => {
  const formattedDate = info.timestamp;

  if (typeof info.message === 'object') {
    info.message = stringify(info.message, null, 2);
  }

  const label = isNotNullOrUndefined(info.label) ? `[${info.label}]` : undefined;

  return [`${formattedDate}`, `|${info.level}|`, label, `${info.message}`].filter(isNotNullOrUndefined).join(' ');
});

const format = combine(timestamp(), customFormatter);

export const combinedFileSimpleTransport = new winston.transports.File({
  format,
  filename: `${envConfig.settingLogFilePath}/combined.simple.log`,
  level: 'silly',
});
