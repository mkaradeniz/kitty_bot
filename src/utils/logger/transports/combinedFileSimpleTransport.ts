import winston, { format as winstonFormat } from 'winston';

import envConfig from '../../../config/env';

const { combine, printf, timestamp } = winstonFormat;

const customFormatter = printf(formatters => {
  const formattedDate = formatters.timestamp;

  return `${formattedDate} |${formatters.level}| ${formatters.message}`;
});

const format = combine(timestamp(), customFormatter);

const combinedFileSimpleTransport = new winston.transports.File({
  format,
  filename: `${envConfig.settingLogFilePath}/combined.simple.log`,
  level: 'silly',
});

export default combinedFileSimpleTransport;
