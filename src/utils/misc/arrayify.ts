export const arrayify = <T>(input: T | T[]): T[] => {
  if (Array.isArray(input)) {
    return input;
  }

  return [input];
};
