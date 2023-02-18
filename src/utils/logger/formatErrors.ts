import winston from 'winston';

const formatErrors = winston.format(info => {
  if ((info.message as any) instanceof Error) {
    return Object.assign(
      {
        message: (info.message as any).message,
        stack: (info.message as any).stack,
      },
      info.message,
    );
  }

  if (info instanceof Error) {
    return Object.assign({ message: info.message, stack: info.stack }, info);
  }

  return info;
});

export default formatErrors;
